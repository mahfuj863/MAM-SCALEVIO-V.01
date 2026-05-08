import dns from 'dns';
import net from 'net';
import validator from 'validator';

export interface VerificationResult {
  email: string;
  isValid: boolean;
  score: number;
  syntax: boolean;
  mx: boolean;
  smtp: boolean;
  disposable: boolean;
  catchAll: boolean;
  role: boolean;
  risk: 'low' | 'medium' | 'high';
  message: string;
}

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'yopmail.com', 'temp-mail.org', 'guerrillamail.com',
  '10minutemail.com', 'sharklasers.com', 'dispostable.com', 'getnada.com'
]);

const ROLE_PREFIXES = new Set([
  'admin', 'info', 'support', 'sales', 'contact', 'hello', 'webmaster',
  'billing', 'help', 'jobs', 'marketing', 'office'
]);

export async function verifyEmail(email: string): Promise<VerificationResult> {
  const result: VerificationResult = {
    email,
    isValid: false,
    score: 0,
    syntax: false,
    mx: false,
    smtp: false,
    disposable: false,
    catchAll: false,
    role: false,
    risk: 'high',
    message: 'Verification failed'
  };

  // 1. Syntax Check
  if (!validator.isEmail(email)) {
    result.message = 'Invalid email syntax';
    return result;
  }
  result.syntax = true;
  result.score += 20;

  const [local, domain] = email.split('@');

  // 2. Role-based check
  if (ROLE_PREFIXES.has(local.toLowerCase())) {
    result.role = true;
  }

  // 3. Disposable Check
  if (DISPOSABLE_DOMAINS.has(domain.toLowerCase())) {
    result.disposable = true;
    result.message = 'Disposable email detected';
    return result;
  }
  result.score += 20;

  try {
    // 4. MX Record Check
    const mxRecords = await new Promise<dns.MxRecord[]>((resolve, reject) => {
      dns.resolveMx(domain, (err, addresses) => {
        if (err || !addresses || addresses.length === 0) resolve([]);
        else resolve(addresses.sort((a, b) => a.priority - b.priority));
      });
    });

    if (mxRecords.length === 0) {
      result.message = 'No MX records found';
      return result;
    }
    result.mx = true;
    result.score += 20;

    // 5. SMTP Handshake (Best effort, port 25 is often blocked)
    const smtpValid = await checkSMTP(mxRecords[0].exchange, email);
    if (smtpValid) {
      result.smtp = true;
      result.score += 40;
      result.isValid = true;
      result.risk = 'low';
      result.message = 'Email is valid and deliverable';
    } else {
      result.message = 'Mailbox does not exist or is unreachable';
    }

  } catch (error) {
    result.message = 'DNS or SMTP check failed';
  }

  return result;
}

function checkSMTP(mxHost: string, email: string): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection(25, mxHost);
    let step = 0;

    socket.setTimeout(5000);

    socket.on('data', (data) => {
      const response = data.toString();
      
      if (step === 0 && response.startsWith('220')) {
        socket.write(`HELO mam-verified.com\r\n`);
        step++;
      } else if (step === 1 && response.startsWith('250')) {
        socket.write(`MAIL FROM:<verify@mam-verified.com>\r\n`);
        step++;
      } else if (step === 2 && response.startsWith('250')) {
        socket.write(`RCPT TO:<${email}>\r\n`);
        step++;
      } else if (step === 3) {
        if (response.startsWith('250')) {
          resolve(true);
        } else {
          resolve(false);
        }
        socket.write('QUIT\r\n');
        socket.end();
      }
    });

    socket.on('error', () => resolve(false));
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
  });
}
