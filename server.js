const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Serve static assets from project root
app.use(express.static(path.join(__dirname), {
  extensions: ['html', 'htm']
}));

app.use(express.json());

// API: Proxy test connection to Google Apps Script
app.all('/api/test-sheet', async (req, res) => {
  const targetUrl = (req.query.url || (req.body && req.body.url) || '').trim();
  if (!targetUrl) {
    return res.status(400).json({ success: false, error: 'No Google Apps Script URL provided.' });
  }

  const startTime = Date.now();
  try {
    // Test POST with a ping action
    const postRes = await fetch(targetUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'ping', test: true, timestamp: new Date().toISOString() })
    });

    const elapsed = Date.now() - startTime;
    const postText = await postRes.text();

    let postJson = null;
    try {
      postJson = JSON.parse(postText);
    } catch (e) {
      // response might be HTML error
    }

    // Check for common Google Apps Script deployment issues
    if (postText.includes('找不到以下指令碼函式') || postText.includes('Script function not found')) {
      const funcName = postText.includes('doPost') ? 'doPost' : (postText.includes('doGet') ? 'doGet' : 'handler');
      return res.json({
        success: false,
        code: 'MISSING_FUNCTION_IN_DEPLOYMENT',
        elapsed,
        error: `Script function not found: ${funcName}`,
        instruction: 'In Google Apps Script, your Code.gs needs to be saved and deployed as a "New version". Please paste the code into Code.gs, click Save, then go to Deploy > Manage deployments > Edit > New version > Deploy.'
      });
    }

    if (postText.includes('Google 帳戶') || postText.includes('accounts.google.com') || postText.includes('Sign in to continue')) {
      return res.json({
        success: false,
        code: 'AUTH_REQUIRED',
        elapsed,
        error: 'Google login required. Deployment access is restricted.',
        instruction: 'In Google Apps Script, go to Deploy > Manage deployments > Edit. Change "Who has access" from "Only myself" to "Anyone", then click Deploy.'
      });
    }

    if (postJson && (postJson.status === 'success' || postJson.result === 'success')) {
      return res.json({
        success: true,
        code: 'SUCCESS',
        elapsed,
        message: 'Google Apps Script responded successfully and returned valid JSON!',
        data: postJson
      });
    }

    // If status 200 and not error page
    if (postRes.ok && !postText.includes('errorMessage') && !postText.includes('錯誤')) {
      return res.json({
        success: true,
        code: 'SUCCESS_GENERIC',
        elapsed,
        message: 'Google Apps Script reached and responded with HTTP 200.',
        preview: postText.substring(0, 200)
      });
    }

    return res.json({
      success: false,
      code: 'UNKNOWN_RESPONSE',
      elapsed,
      error: `Google Apps Script returned status ${postRes.status}`,
      preview: postText.substring(0, 300)
    });
  } catch (fetchErr) {
    return res.status(500).json({
      success: false,
      code: 'NETWORK_ERROR',
      error: fetchErr.message || fetchErr.toString()
    });
  }
});

// API: Proxy lead submission directly to Google Apps Script
app.post('/api/proxy-sheet', async (req, res) => {
  const { url, payload } = req.body || {};
  if (!url || !payload) {
    return res.status(400).json({ success: false, error: 'Both url and payload are required.' });
  }

  const startTime = Date.now();
  try {
    const googleRes = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    const elapsed = Date.now() - startTime;
    const text = await googleRes.text();

    let json = null;
    try {
      json = JSON.parse(text);
    } catch (e) {}

    if (text.includes('找不到以下指令碼函式') || text.includes('Script function not found')) {
      return res.json({
        success: false,
        code: 'MISSING_FUNCTION_IN_DEPLOYMENT',
        elapsed,
        error: 'Script function not found: doPost. The code in Code.gs has not been published as a New Version yet.',
        instruction: 'In Google Apps Script, click Deploy > Manage deployments > Edit > select Version: "New version" > Deploy.'
      });
    }

    if (text.includes('accounts.google.com') || text.includes('Sign in')) {
      return res.json({
        success: false,
        code: 'AUTH_REQUIRED',
        elapsed,
        error: 'Access restricted: Please set "Who has access" to "Anyone" in Google Apps Script deployment settings.'
      });
    }

    if (json && (json.status === 'success' || json.result === 'success')) {
      return res.json({
        success: true,
        elapsed,
        data: json
      });
    }

    if (googleRes.ok) {
      return res.json({
        success: true,
        elapsed,
        data: json || { status: 'success', raw: text.substring(0, 200) }
      });
    }

    return res.status(googleRes.status).json({
      success: false,
      error: `Google Apps Script returned status ${googleRes.status}`,
      raw: text.substring(0, 300)
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || err.toString()
    });
  }
});

// Route for admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Fallback to index.html for any unhandled GET request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`MAM SCALEVIO server running on http://${HOST}:${PORT}`);
});
