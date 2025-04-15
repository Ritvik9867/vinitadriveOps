// Script to initialize Google Sheets structure for VinitalDriveOps

// Configuration
const SPREADSHEET_CONFIG = {
  // The ID of your Google Spreadsheet
  // You can find this in the URL of your spreadsheet:
  // https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
  SPREADSHEET_ID: '1fPQmcZySUeJ3OmyyH6PuZLAeuB6-AblbX_o4ZSaLJbk',

  // The ID of the Google Drive folder where files will be stored
  FOLDER_ID: '1rYz_jCg-OO4p5_aS0w6jL_mL-IVANZjX'
};

const SHEETS = {
  USERS: {
    name: 'Users',
    headers: [
      'ID',
      'Name',
      'Email',
      'Password',
      'Role',
      'Verified',
      'CreatedAt',
      'LastLogin',
      'Status'
    ]
  },
  TRIPS: {
    name: 'Trips',
    headers: [
      'ID',
      'DriverID',
      'Date',
      'StartLocation',
      'EndLocation',
      'Distance',
      'Amount',
      'PaymentMode',
      'CashCollected',
      'Toll',
      'Status',
      'CreatedAt'
    ]
  },
  EXPENSES: {
    name: 'Expenses',
    headers: [
      'ID',
      'DriverID',
      'Date',
      'Type',
      'Amount',
      'Description',
      'ImageURL',
      'Status',
      'ApprovedBy',
      'ApprovedAt',
      'CreatedAt'
    ]
  },
  COMPLAINTS: {
    name: 'Complaints',
    headers: [
      'ID',
      'DriverID',
      'Date',
      'Title',
      'Description',
      'Category',
      'Priority',
      'ImageURL',
      'Status',
      'Resolution',
      'ResolvedBy',
      'ResolvedAt',
      'CreatedAt'
    ]
  },
  REPAYMENTS: {
    name: 'Repayments',
    headers: [
      'ID',
      'DriverID',
      'Date',
      'Amount',
      'Type',
      'Description',
      'ImageURL',
      'Status',
      'ApprovedBy',
      'ApprovedAt',
      'CreatedAt'
    ]
  },
  LOGIN_LOGS: {
    name: 'LoginLogs',
    headers: [
      'ID',
      'UserID',
      'Email',
      'Role',
      'LoginTime',
      'LogoutTime',
      'Status',
      'IPAddress',
      'DeviceInfo'
    ]
  }
};

/**
 * Initialize Google Sheets with all required tabs and headers
 */
function initializeSheets() {
  const spreadsheetId = SPREADSHEET_CONFIG.SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID is not configured. Please set SPREADSHEET_ID at the top of this script.');
  }

  // Get the spreadsheet
  const ss = SpreadsheetApp.openById(spreadsheetId);

  // Create each sheet and set headers
  Object.values(SHEETS).forEach(sheet => {
    let currentSheet = ss.getSheetByName(sheet.name);

    // Create sheet if it doesn't exist
    if (!currentSheet) {
      currentSheet = ss.insertSheet(sheet.name);
    }

    // Set headers
    const headerRange = currentSheet.getRange(1, 1, 1, sheet.headers.length);
    headerRange.setValues([sheet.headers]);

    // Format headers
    headerRange
      .setBackground('#f3f3f3')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    // Freeze header row
    currentSheet.setFrozenRows(1);

    // Auto-resize columns
    currentSheet.autoResizeColumns(1, sheet.headers.length);

    // Add data validation where needed
    addDataValidation(currentSheet, sheet.name);
  });
}

/**
 * Gets the column index for a header name in a sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to search in
 * @param {string} headerName - The name of the header to find
 * @returns {number} The column index (1-based) or -1 if not found
 */
function getHeaderColumn(sheet, headerName) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return headers.indexOf(headerName) + 1;
}

/**
 * Safely gets a range from a sheet, creating it if necessary
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to get range from
 * @param {number} startRow - Starting row (1-based)
 * @param {number} column - Column index (1-based)
 * @param {number} numRows - Number of rows in range
 * @returns {GoogleAppsScript.Spreadsheet.Range} The requested range
 */
function getSafeRange(sheet, startRow, column, numRows) {
  const currentLastRow = sheet.getLastRow();
  const currentLastCol = sheet.getLastColumn();
  
  // Expand sheet if necessary
  if (startRow + numRows - 1 > currentLastRow) {
    sheet.insertRows(currentLastRow + 1, startRow + numRows - currentLastRow - 1);
  }
  if (column > currentLastCol) {
    sheet.insertColumns(currentLastCol + 1, column - currentLastCol);
  }
  
  return sheet.getRange(startRow, column, numRows, 1);
}

/**
 * Add data validation rules to specific columns
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to add validation to
 * @param {string} sheetName - The name of the sheet
 */
function addDataValidation(sheet, sheetName) {
  try {
    const lastRow = Math.max(sheet.getLastRow(), 2); // At least 2 to include header

    try {
      switch (sheetName) {
      case SHEETS.USERS.name:
        // Role validation
        const roleColumn = getHeaderColumn(sheet, 'Role');
        if (roleColumn > 0) {
          const roleRule = SpreadsheetApp.newDataValidation()
            .requireValueInList(['admin', 'driver'], true)
            .build();
          getSafeRange(sheet, 2, roleColumn, lastRow - 1)
            .setDataValidation(roleRule);
        }

        // Status validation
        const userStatusColumn = getHeaderColumn(sheet, 'Status');
        if (userStatusColumn > 0) {
          const statusRule = SpreadsheetApp.newDataValidation()
            .requireValueInList(['active', 'inactive', 'suspended'], true)
            .build();
          getSafeRange(sheet, 2, userStatusColumn, lastRow - 1)
            .setDataValidation(statusRule);
        }
        break;

    case SHEETS.TRIPS.name:
      // Payment mode validation
      const paymentRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['cash', 'online', 'mixed'], true)
        .build();
      sheet.getRange(2, sheet.getRange('PaymentMode').getColumn(), lastRow - 1, 1)
        .setDataValidation(paymentRule);
      break;

    case SHEETS.EXPENSES.name:
      // Type validation
      const expenseTypeRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['fuel', 'maintenance', 'repair', 'other'], true)
        .build();
      sheet.getRange(2, sheet.getRange('Type').getColumn(), lastRow - 1, 1)
        .setDataValidation(expenseTypeRule);
      break;

    case SHEETS.COMPLAINTS.name:
      // Priority validation
      const priorityRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['low', 'medium', 'high', 'urgent'], true)
        .build();
      sheet.getRange(2, sheet.getRange('Priority').getColumn(), lastRow - 1, 1)
        .setDataValidation(priorityRule);
      break;
      default:
        Logger.log(`No specific validation rules for sheet: ${sheetName}`);
        break;
    }

    // Common status validation for multiple sheets
    if ([SHEETS.EXPENSES.name, SHEETS.COMPLAINTS.name, SHEETS.REPAYMENTS.name].includes(sheetName)) {
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['pending', 'approved', 'rejected'], true)
      .build();
    sheet.getRange(2, sheet.getRange('Status').getColumn(), lastRow - 1, 1)
      .setDataValidation(statusRule);
    }
  } catch (error) {
    Logger.log(`Error in switch-case validation: ${error.message}`);
    throw error;
  }
}

// Add a menu item to run initialization
function onOpen() {
  try {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('VinitalDriveOps')
    .addItem('Initialize Sheets', 'initializeSheets')
    .addToUi();
}