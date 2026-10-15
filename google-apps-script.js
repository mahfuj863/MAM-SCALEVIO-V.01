/**
 * ==============================================================================
 * MAM SCALEVIO — Production Google Apps Script Web App for Contact Form
 * ==============================================================================
 * 
 * Automatically captures website inquiries and appends them as new rows into 
 * your Google Sheet with the required 7 columns:
 *   Column A: Date & Time
 *   Column B: Name
 *   Column C: Email
 *   Column D: Phone
 *   Column E: Company
 *   Column F: Subject
 *   Column G: Message
 * 
 * Features:
 *  - 100% Free & Serverless (Runs on Google infrastructure)
 *  - Auto-initializes header row with professional styling if sheet is blank
 *  - Concurrency-safe: Uses LockService to prevent race conditions during simultaneous submissions
 *  - Formula Injection Protection: Sanitizes values starting with =, +, -, @
 *  - Supports JSON payloads (Content-Type: text/plain to bypass CORS preflight) and Form Data
 *  - Returns clean JSON response { status: "success", result: "success", row: ... }
 *  - Supports GET requests for instant connection/health testing
 *  - Backwards-compatible with MAM SCALEVIO CMS (Posts, Messages, Content)
 * 
 * ------------------------------------------------------------------------------
 * DEPLOYMENT INSTRUCTIONS (Quick 5-Step Guide):
 * ------------------------------------------------------------------------------
 * 1. Create a Google Sheet at https://sheets.google.com (e.g. named "MAM SCALEVIO Inquiries")
 * 2. In Google Sheets, click "Extensions" > "Apps Script"
 * 3. Delete any default code in Code.gs and PASTE THIS ENTIRE FILE
 * 4. Click "Deploy" > "New deployment"
 *    - Click the gear icon (Select type) > Choose "Web app"
 *    - Description: "MAM SCALEVIO Contact Form API"
 *    - Execute as: "Me (your email)"
 *    - Who has access: "Anyone" (CRITICAL: must be Anyone so your website can submit without login)
 * 5. Click "Deploy", click "Authorize access", sign into your Google account, click "Advanced" > "Go to MAM SCALEVIO (unsafe)", then click "Allow"
 * 6. Copy the "Web app URL" (starts with https://script.google.com/macros/s/...)
 * 7. Paste this URL into your MAM SCALEVIO Admin Dashboard (admin.html) > Settings > "Google Sheets Web App URL", or in script.js!
 * ==============================================================================
 */

// Configuration
const SHEET_CONTACTS = 'Contact Submissions';
const SHEET_POSTS    = 'Posts';
const SHEET_MESSAGES = 'Messages';
const SHEET_CONTENT  = 'Content';

const CONTACT_HEADERS = [
  'Date & Time',
  'Name',
  'Email',
  'Phone',
  'Company',
  'Subject',
  'Message'
];

/**
 * Handles HTTP GET requests — useful for pinging, testing connectivity, and reading CMS data
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'healthCheck';
  let result;

  try {
    switch (action) {
      case 'ping':
      case 'healthCheck':
        result = {
          status: 'success',
          result: 'success',
          message: 'MAM SCALEVIO Google Apps Script Web App is online and ready.',
          sheetName: SHEET_CONTACTS,
          columns: CONTACT_HEADERS,
          timestamp: new Date().toISOString()
        };
        break;
      case 'getPosts':
        result = getPosts();
        break;
      case 'getMessages':
        result = getMessages();
        break;
      case 'getContent':
        result = getContent();
        break;
      default:
        result = {
          status: 'success',
          message: 'Active endpoint. Use POST to submit contact inquiries or ?action=ping to test.',
          columns: CONTACT_HEADERS
        };
    }
  } catch (err) {
    result = { status: 'error', error: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles HTTP POST requests — saves form submissions directly into Google Sheets
 */
function doPost(e) {
  // Lock to handle concurrent submissions safely
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(10000); // Wait up to 10 seconds

  if (!hasLock) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        result: 'error',
        message: 'Server is currently busy processing other requests. Please try again in a few moments.'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  let result;

  try {
    let payload = {};
    let action = 'contact_form';

    // Parse incoming request body
    if (e && e.postData && e.postData.contents) {
      try {
        const parsed = JSON.parse(e.postData.contents);
        if (parsed.action) action = parsed.action;
        payload = parsed.payload ? parsed.payload : parsed;
      } catch (jsonErr) {
        // If not valid JSON, fallback to URL-encoded parameters
        payload = (e && e.parameter) ? e.parameter : {};
        if (payload.action) action = payload.action;
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
      if (payload.action) action = payload.action;
    }

    // Route based on action
    switch (action) {
      case 'addPost':
        result = addPost(payload);
        break;
      case 'updatePost':
        result = updatePost(payload.id, payload);
        break;
      case 'deletePost':
        result = deletePost(payload.id);
        break;
      case 'saveContent':
        result = saveContent(payload);
        break;
      case 'addMessage':
      case 'contact_form':
      case 'addContactSubmission':
      default:
        // Save form submission to Google Sheets
        result = saveContactSubmission(payload);
        break;
    }
  } catch (err) {
    result = {
      status: 'error',
      result: 'error',
      message: err.toString()
    };
  } finally {
    lock.releaseLock();
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Appends a new contact form submission to the Google Sheet.
 * Columns: Date & Time, Name, Email, Phone, Company, Subject, Message
 */
function saveContactSubmission(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_CONTACTS);

  // If the sheet doesn't exist yet, create it
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_CONTACTS);
  }

  // Check if header row exists, otherwise initialize it
  if (sheet.getLastRow() === 0) {
    initContactHeaders(sheet);
  } else {
    // Check if row 1 contains the headers
    const firstRowValues = sheet.getRange(1, 1, 1, Math.min(sheet.getLastColumn() || 1, 7)).getValues()[0];
    if (firstRowValues[0] !== CONTACT_HEADERS[0]) {
      sheet.insertRowsBefore(1, 1);
      initContactHeaders(sheet);
    }
  }

  // Format Date & Time
  let dateTimeStr = data.dateTime || data.datetime || data.timestamp || '';
  if (!dateTimeStr) {
    try {
      dateTimeStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT', 'yyyy-MM-dd HH:mm:ss');
    } catch (dErr) {
      dateTimeStr = new Date().toISOString();
    }
  }

  // Extract fields matching the 7 columns:
  // Date & Time, Name, Email, Phone, Company, Subject, Message
  const name = sanitizeValue(data.name || data.fullName || 'Anonymous');
  const email = sanitizeValue(data.email || data.workEmail || '');
  const phone = sanitizeValue(data.phone || data.tel || data.whatsapp || 'N/A');
  const company = sanitizeValue(data.company || data.brand || 'N/A');
  const subject = sanitizeValue(data.subject || data.service || 'Website Inquiry');
  const message = sanitizeValue(data.message || data.challenge || data.comments || '');

  // Append new row
  sheet.appendRow([
    dateTimeStr,
    name,
    email,
    phone,
    company,
    subject,
    message
  ]);

  const newRowNumber = sheet.getLastRow();

  // Highlight new row with soft padding styling
  const newRowRange = sheet.getRange(newRowNumber, 1, 1, 7);
  newRowRange.setVerticalAlignment('top');

  // Also auto-save to "Messages" tab if it exists for backwards-compatibility with MAM CRM
  try {
    const messagesSheet = ss.getSheetByName(SHEET_MESSAGES);
    if (messagesSheet) {
      messagesSheet.appendRow([
        Date.now().toString(),
        name,
        email,
        subject,
        message,
        'new',
        'false',
        new Date().toISOString()
      ]);
    }
  } catch (mErr) {
    // Non-critical, ignore
  }

  return {
    status: 'success',
    result: 'success',
    message: 'Submission successfully saved to Google Sheet.',
    row: newRowNumber,
    data: {
      dateTime: dateTimeStr,
      name: name,
      email: email,
      phone: phone,
      company: company,
      subject: subject
    }
  };
}

/**
 * Initializes the header row with dark blue/slate branding and bold text
 */
function initContactHeaders(sheet) {
  sheet.getRange(1, 1, 1, CONTACT_HEADERS.length).setValues([CONTACT_HEADERS]);
  const headerRange = sheet.getRange(1, 1, 1, CONTACT_HEADERS.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#0f172a'); // Slate 900
  headerRange.setFontColor('#f8fafc'); // Slate 50
  headerRange.setHorizontalAlignment('left');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 36);
  sheet.setFrozenRows(1);

  // Auto-resize columns for readability
  for (let c = 1; c <= CONTACT_HEADERS.length; c++) {
    try {
      sheet.autoResizeColumn(c);
      // Give minimum width
      if (sheet.getColumnWidth(c) < 140) {
        sheet.setColumnWidth(c, 160);
      }
    } catch (e) {}
  }
}

/**
 * Security: Prevents Formula Injection (CSV / Spreadsheet Formula Injection)
 * Escapes characters =, +, -, @ at the beginning of user input
 */
function sanitizeValue(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

// ==============================================================================
// BACKWARDS-COMPATIBILITY: MAM SCALEVIO CMS (Posts, Messages & Site Content)
// ==============================================================================

function getPosts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_POSTS);
  if (!sheet) return { posts: [] };
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { posts: [] };
  const headers = data[0];
  const posts = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((h, j) => { row[h] = data[i][j]; });
    if (row.id) posts.push(row);
  }
  return { posts: posts };
}

function addPost(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_POSTS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_POSTS);
    sheet.appendRow(['id', 'title', 'excerpt', 'category', 'image', 'date', 'createdAt']);
  }
  const id = Date.now().toString();
  const date = payload.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  sheet.appendRow([id, payload.title, payload.excerpt, payload.category, payload.image, date, new Date().toISOString()]);
  return { success: true, id: id };
}

function updatePost(id, payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_POSTS);
  if (!sheet) return { error: 'Posts sheet not found' };
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      if (payload.title !== undefined) sheet.getRange(i + 1, 2).setValue(payload.title);
      if (payload.excerpt !== undefined) sheet.getRange(i + 1, 3).setValue(payload.excerpt);
      if (payload.category !== undefined) sheet.getRange(i + 1, 4).setValue(payload.category);
      if (payload.image !== undefined) sheet.getRange(i + 1, 5).setValue(payload.image);
      if (payload.date !== undefined) sheet.getRange(i + 1, 6).setValue(payload.date);
      return { success: true };
    }
  }
  return { error: 'Post not found' };
}

function deletePost(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_POSTS);
  if (!sheet) return { error: 'Posts sheet not found' };
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: 'Post not found' };
}

function getMessages() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MESSAGES);
  if (!sheet) return { messages: [] };
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { messages: [] };
  const headers = data[0];
  const messages = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((h, j) => { row[h] = data[i][j]; });
    if (row.id) messages.push(row);
  }
  return { messages: messages };
}

function getContent() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONTENT);
  if (!sheet) return { content: {} };
  const data = sheet.getDataRange().getValues();
  const content = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) content[data[i][0]] = data[i][1];
  }
  return { content: content };
}

function saveContent(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_CONTENT);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_CONTENT);
    sheet.appendRow(['key', 'value']);
  }
  const data = sheet.getDataRange().getValues();
  const keys = Object.keys(payload);

  keys.forEach(key => {
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(payload[key]);
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow([key, payload[key]]);
    }
  });
  return { success: true };
}
