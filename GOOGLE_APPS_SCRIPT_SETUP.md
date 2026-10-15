# Google Apps Script Contact Form Integration Guide

This guide walks you through connecting your website's contact inquiry form directly to a Google Sheet using Google Apps Script.

---

## 🎯 Architecture & Data Flow

```text
[ Website Contact Form ]
          │
          │  fetch(webAppUrl, { method: 'POST', body: JSON.stringify(data) })
          ▼
[ Google Apps Script Web App (doPost) ]
          │
          │  Appends new row & sanitizes data
          ▼
[ Google Sheet: "Contact Submissions" ]
  Columns: Date & Time | Name | Email | Phone | Company | Subject | Message
```

### ✅ Key Features
- **100% Free**: No Zapier, Make, or third-party paid relays required.
- **Auto-Formatting**: Automatically creates header row with professional dark slate styling and frozen top row.
- **Race Condition Protection**: Uses `LockService` for concurrency safety when multiple visitors submit simultaneously.
- **Formula Injection Defense**: Automatically neutralizes spreadsheet injection attacks (`=`, `+`, `-`, `@`).
- **Offline & Fallback Ready**: Inquiries are saved locally in the MAM SCALEVIO CRM dashboard even if the network is offline or the Apps Script URL hasn't been set yet.

---

## 📋 Required Google Sheet Columns

Every submission is appended automatically into the **"Contact Submissions"** sheet tab with the following 7 columns:

| Column | Header | Description | Example |
| :--- | :--- | :--- | :--- |
| **A** | **Date & Time** | Local or UTC timestamp of submission | `Oct 15, 2026, 05:45 PM UTC` |
| **B** | **Name** | Prospect's full name | `John Smith` |
| **C** | **Email** | Work email address | `john@brand.com` |
| **D** | **Phone** | WhatsApp / Phone number | `+1 (555) 234-5678` |
| **E** | **Company** | Brand / Company name and store URL | `Acme Commerce (amazon.com/shops/acme)` |
| **F** | **Subject** | Inquired service or subject line | `Inquiry: Acme Commerce - PPC Management` |
| **G** | **Message** | Complete inquiry breakdown & challenges | Full summary with revenue, category & goals |

---

## 🚀 5-Minute Deployment Steps

### Step 1: Create or Open a Google Sheet
1. Open [Google Sheets](https://sheets.google.com).
2. Click **Blank spreadsheet**.
3. Name your spreadsheet **"MAM SCALEVIO Inquiries"** (or any name you prefer).

### Step 2: Open Google Apps Script Editor
1. In the top menu bar, click **Extensions** > **Apps Script**.
2. A new tab will open with the code editor.
3. Name your project **"MAM Contact Form Webhook"** at the top left.

### Step 3: Paste the Script Code
1. Select all default code in `Code.gs` and delete it.
2. Open `google-apps-script.js` from this repository (or copy it from the Admin Dashboard **Settings** tab).
3. Paste the entire code into the Apps Script editor.
4. Click the **Save** icon (floppy disk) or press `Ctrl + S` / `Cmd + S`.

### Step 4: Deploy as a Web App (Critical Settings)
1. In the top right corner of the Apps Script editor, click the blue **Deploy** button > **New deployment**.
2. Click the **gear icon** ⚙️ next to *Select type* and select **Web app**.
3. Configure the following fields carefully:
   - **Description**: `MAM Contact Form Production Web App`
   - **Execute as**: `Me (your Google account email)`
   - **Who has access**: **`Anyone`** ⚠️ *(CRITICAL: You must choose "Anyone", NOT "Only myself" or "Anyone with a Google account", so website visitors can submit the form without needing to sign into Google).*
4. Click **Deploy**.

### Step 5: Grant Google Permissions
1. Google will display a popup: *"Authorization required"*. Click **Authorize access**.
2. Select your Google Account.
3. If Google shows *"Google hasn't verified this app"*:
   - Click **Advanced** (small text at the bottom left).
   - Click **Go to MAM Contact Form Webhook (unsafe)**.
   - Click **Allow**.
4. You will see a green checkmark with your **Web app URL** (starts with `https://script.google.com/macros/s/.../exec`).
5. Copy this **Web app URL**.

### Step 6: Connect to your Website
1. Go to your MAM SCALEVIO website or open the **Admin Dashboard** at `/admin`.
2. Navigate to **Platform Settings** > **Database Connection**.
3. Paste your Web App URL into the **Google Sheets Web App URL** input.
4. Click **Save & Test Connection**.
5. Once verified, click **Send Test Submission** to verify an automated test row appears in your Google Sheet!

---

## 🛠️ Testing via cURL or Browser

You can verify your deployed Web App right from your terminal or browser:

### 1. Connectivity Check (GET)
Paste your Web App URL directly into your browser or run:
```bash
curl -L "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=ping"
```
**Expected Response:**
```json
{
  "status": "success",
  "result": "success",
  "message": "MAM SCALEVIO Google Apps Script Web App is online and ready.",
  "sheetName": "Contact Submissions",
  "columns": ["Date & Time", "Name", "Email", "Phone", "Company", "Subject", "Message"]
}
```

### 2. Test Submission (POST)
```bash
curl -L -X POST "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{
    "dateTime": "2026-10-15 12:45:00 UTC",
    "name": "Jane Doe",
    "email": "jane@brand.com",
    "phone": "+1 234 567 8900",
    "company": "Brand Growth Co",
    "subject": "Inquiry: Brand Growth Co - Full Commerce Retainer",
    "message": "We are seeking comprehensive Amazon PPC and listing optimization support."
  }'
```
**Expected Response:**
```json
{
  "status": "success",
  "result": "success",
  "message": "Submission successfully saved to Google Sheet.",
  "row": 2
}
```

---

## 💡 Troubleshooting & FAQs

### Why does the frontend send `Content-Type: text/plain;charset=utf-8`?
Google Apps Script Web Apps do not implement the HTTP `OPTIONS` preflight method. If a browser sends `Content-Type: application/json`, the browser halts with a CORS preflight error before the POST request is ever sent. Sending `text/plain` bypasses CORS preflight while Google Apps Script parses `e.postData.contents` into JSON effortlessly.

### What happens if the Apps Script URL is changed or redeployed?
When you make changes to the Google Apps Script code in the future:
1. Click **Deploy** > **Manage deployments**.
2. Click the **pencil edit icon** ✏️.
3. Select **Version: New version**.
4. Click **Deploy**. This preserves the exact same URL without breaking your live website connection!
