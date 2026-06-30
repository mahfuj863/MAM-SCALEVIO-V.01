// ============================================================
// MAM SCALEVIO — Google Apps Script (Web API for Google Sheets)
// ============================================================
// SETUP INSTRUCTIONS:
// 1. Go to https://sheets.google.com and create a new spreadsheet
// 2. Rename the spreadsheet to "MAM CRM Database"
// 3. Create 3 sheet tabs (at the bottom):
//    Tab 1: "Posts"    — columns: id | title | excerpt | category | image | date | createdAt
//    Tab 2: "Messages" — columns: id | name | email | subject | message | status | read | timestamp
//    Tab 3: "Content"  — columns: key | value
// 4. In the "Content" tab, add these 3 rows:
//    Row 2: heroTitle    | Scaling Amazon Brands Globally.
//    Row 3: heroSubtitle | Hi, I'm Mahfuj Alom Muhit.
//    Row 4: bio          | I am an Amazon FBA Virtual Assistant.
// 5. Go to Extensions > Apps Script
// 6. Delete any existing code and paste THIS ENTIRE FILE
// 7. Click Deploy > New Deployment
//    - Select type: "Web app"
//    - Execute as: "Me"
//    - Who has access: "Anyone"
// 8. Click Deploy, authorize the app, and copy the Web App URL
// 9. Paste that URL into admin.html Settings > Google Sheets URL
// ============================================================

const SHEET_POSTS    = 'Posts';
const SHEET_MESSAGES = 'Messages';
const SHEET_CONTENT  = 'Content';

// Handle GET requests (read data)
function doGet(e) {
  const action = e.parameter.action;
  let result;

  try {
    switch (action) {
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
        result = { error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { error: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle POST requests (write data)
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  let result;

  try {
    switch (action) {
      case 'addPost':
        result = addPost(data.payload);
        break;
      case 'updatePost':
        result = updatePost(data.id, data.payload);
        break;
      case 'deletePost':
        result = deletePost(data.id);
        break;
      case 'addMessage':
        result = addMessage(data.payload);
        break;
      case 'updateMessage':
        result = updateMessage(data.id, data.payload);
        break;
      case 'deleteMessage':
        result = deleteMessage(data.id);
        break;
      case 'saveContent':
        result = saveContent(data.payload);
        break;
      default:
        result = { error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { error: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- POSTS ----
function getPosts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_POSTS);
  const data = sheet.getDataRange().getValues();
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
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_POSTS);
  const id = Date.now().toString();
  const date = payload.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  sheet.appendRow([id, payload.title, payload.excerpt, payload.category, payload.image, date, new Date().toISOString()]);
  return { success: true, id: id };
}

function updatePost(id, payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_POSTS);
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
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: 'Post not found' };
}

// ---- MESSAGES ----
function getMessages() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MESSAGES);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const messages = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((h, j) => { row[h] = data[i][j]; });
    if (row.id) messages.push(row);
  }
  return { messages: messages };
}

function addMessage(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MESSAGES);
  const id = Date.now().toString();
  sheet.appendRow([
    id,
    payload.name || '',
    payload.email || '',
    payload.subject || '',
    payload.message || '',
    payload.status || 'new',
    'false',
    new Date().toISOString()
  ]);
  return { success: true, id: id };
}

function updateMessage(id, payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MESSAGES);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      if (payload.status !== undefined) sheet.getRange(i + 1, 6).setValue(payload.status);
      if (payload.read !== undefined) sheet.getRange(i + 1, 7).setValue(payload.read.toString());
      return { success: true };
    }
  }
  return { error: 'Message not found' };
}

function deleteMessage(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MESSAGES);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: 'Message not found' };
}

// ---- CONTENT ----
function getContent() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONTENT);
  const data = sheet.getDataRange().getValues();
  const content = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) content[data[i][0]] = data[i][1];
  }
  return { content: content };
}

function saveContent(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONTENT);
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
