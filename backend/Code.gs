// Google Apps Script backend code for VinitalDriveOps

// Spreadsheet IDs
const SPREADSHEET_ID = '1fPQmcZySUeJ3OmyyH6PuZLAeuB6-AblbX_o4ZSaLJbk'; // Spreadsheet ID
const FOLDER_ID = '1rYz_jCg-OO4p5_aS0w6jL_mL-IVANZjX'; // Google Drive folder ID

// Sheet names
const SHEETS = {
  USERS: 'Users',
  TRIPS: 'Trips',
  EXPENSES: 'Expenses',
  COMPLAINTS: 'Complaints',
  REPAYMENTS: 'Repayments',
  LOGIN_LOGS: 'LoginLogs'
};

// Initialize sheets if they don't exist
function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Create sheets if they don't exist
  Object.values(SHEETS).forEach(sheetName => {
    if (!ss.getSheetByName(sheetName)) {
      const sheet = ss.insertSheet(sheetName);
      initializeSheetHeaders(sheetName);
      
      // Set column widths for better readability
      if (sheetName === SHEETS.USERS) {
        sheet.setColumnWidths(1, 10, 150);
      }
    }
  });
}

// Set up headers for each sheet
function initializeSheetHeaders(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  
  const headers = {
    [SHEETS.USERS]: ['ID', 'Name', 'Email', 'Password', 'Role', 'Verified', 'CreatedAt', 'Phone', 'Balance', 'Status'],
    [SHEETS.TRIPS]: ['ID', 'DriverID', 'Date', 'Distance', 'Amount', 'PaymentMode', 'CashCollected', 'Toll'],
    [SHEETS.EXPENSES]: ['ID', 'DriverID', 'Date', 'Type', 'Amount', 'ImageURL', 'Status'],
    [SHEETS.COMPLAINTS]: ['ID', 'DriverID', 'Date', 'Title', 'Description', 'ImageURL', 'Status'],
    [SHEETS.REPAYMENTS]: ['ID', 'DriverID', 'Date', 'Amount', 'Description', 'ImageURL', 'Status'],
    [SHEETS.LOGIN_LOGS]: ['UserID', 'Email', 'Timestamp', 'Status']
  };
  
  sheet.getRange(1, 1, 1, headers[sheetName].length).setValues([headers[sheetName]]);
}

// Handle incoming requests
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  
  switch (data.action) {
    case 'login':
      return handleLogin(data);
    case 'register':
      return handleRegister(data);
    case 'addTrip':
      return handleAddTrip(data);
    case 'addExpense':
      return handleAddExpense(data);
    case 'addComplaint':
      return handleAddComplaint(data);
    case 'addRepayment':
      return handleAddRepayment(data);
    case 'updateStatus':
      return handleUpdateStatus(data);
    default:
      return sendResponse({ success: false, error: 'Invalid action' });
  }
}

// Handle GET requests for reports and dashboards
// Add CORS support
function doGet(e) {
  // Check for preflight request
  if (e.parameter.method === 'OPTIONS') {
    return handlePreflightRequest();
  } else {
      const action = e.parameter.action;
      const driverId = e.parameter.driverId;
      const startDate = e.parameter.startDate;
      const endDate = e.parameter.endDate;
      
      switch (action) {
        case 'getDashboardData':
          return handleGetDashboardData(driverId, startDate, endDate);
        case 'getReports':
          return handleGetReports(driverId, startDate, endDate);
        default:
          return sendResponse({ success: false, error: 'Invalid action' });
      }
    }
}

// Authentication handlers
function handleLogin(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const users = sheet.getDataRange().getValues();
  const headers = users[0];
  
  for (let i = 1; i < users.length; i++) {
    const user = arrayToObject(headers, users[i]);
    if (user.Email === data.email && user.Password === data.password) {
      logLogin(user.ID, user.Email, 'success');
      return sendResponse({
        success: true,
        userId: user.ID,
        email: user.Email,
        role: user.Role,
        name: user.Name,
        verified: user.Verified
      });
    }
  }
  
  logLogin(null, data.email, 'failed');
  return sendResponse({ success: false, error: 'Invalid credentials' });
}

function handleRegister(data) {
  try {
    // Validate required fields
    if (!data.name || !data.email || !data.password || !data.phone) {
      return sendResponse({ 
        success: false, 
        error: 'Missing required fields',
        details: 'Name, email, password, and phone are required'
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return sendResponse({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.USERS);
    
    // Check if email already exists
    const users = sheet.getDataRange().getValues();
    const headers = users[0];
    const emailIndex = headers.indexOf('Email');
    
    if (users.some((user, index) => index > 0 && user[emailIndex] === data.email)) {
      return sendResponse({ 
        success: false, 
        error: 'Account already exists',
        details: 'An account with this email already exists'
      });
    }
    
    const userId = Utilities.getUuid();
    const timestamp = new Date().toISOString();
    
    const newUser = [
      userId,
      data.name.trim(),
      data.email.toLowerCase().trim(),
      data.password,
      data.role || 'driver',
      false, // verified status
      timestamp,
      data.phone.replace(/[^0-9]/g, ''), // Store sanitized phone number
      0, // initial balance
      'active' // account status
    ];
    
    sheet.appendRow(newUser);
    
    // Log the registration
    logLogin(userId, data.email, 'registered');
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Registration successful',
      userId: userId
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .addHeader('Access-Control-Allow-Origin', '*')
    .addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .addHeader('Access-Control-Allow-Headers', 'Content-Type');
  } catch (e) {
    console.error('Registration error:', e);
    return sendResponse({ 
      success: false, 
      error: 'Registration failed',
      details: e.message
    });
  }
}

// Data handlers
function handleAddTrip(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.TRIPS);
  
  const tripId = Utilities.getUuid();
  const newTrip = [
    tripId,
    data.driverId,
    data.date,
    data.distance,
    data.amount,
    data.paymentMode,
    data.cashCollected,
    data.toll || 0
  ];
  
  sheet.appendRow(newTrip);
  return sendResponse({ success: true, tripId });
}

function handleAddExpense(data) {
  const imageUrl = uploadFile(data.image, 'expenses');
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.EXPENSES);
  
  const expenseId = Utilities.getUuid();
  const newExpense = [
    expenseId,
    data.driverId,
    data.date,
    data.type,
    data.amount,
    imageUrl,
    'pending'
  ];
  
  sheet.appendRow(newExpense);
  return sendResponse({ success: true, expenseId });
}

// File upload handler
function uploadFile(base64Data, folder) {
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data.split(',')[1]), data.image.mimeType);
  const file = DriveApp.getFolderById(FOLDER_ID)
    .createFolder(folder)
    .createFile(blob)
    .setName(`${Utilities.getUuid()}.${data.image.extension}`);
  
  return file.getUrl();
}

// CORS preflight handler
function handlePreflightRequest() {
  return ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.TEXT)
    .addHeader('Access-Control-Allow-Origin', '*')
    .addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .addHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Utility functions
function sendResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .addHeader('Access-Control-Allow-Origin', '*')
    .addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .addHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function arrayToObject(headers, values) {
  return headers.reduce((obj, header, index) => {
    obj[header] = values[index];
    return obj;
  }, {});
}

function logLogin(userId, email, status) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.LOGIN_LOGS);
  sheet.appendRow([userId, email, new Date().toISOString(), status]);
}