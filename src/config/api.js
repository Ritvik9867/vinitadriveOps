// API Configuration for VinitalDriveOps

// Replace this with your deployed Google Apps Script Web App URL
export const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbz66ODASq1Ivi2M4bO2qMXEUJi1CMjiRBgtEQ8DobLpvJmm2304Os0Jt8qHD7zWDAF4iw/exec';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}?action=login`,
  REGISTER: `${API_BASE_URL}?action=register`,
  
  // Trip endpoints
  ADD_TRIP: `${API_BASE_URL}?action=addTrip`,
  GET_TRIPS: `${API_BASE_URL}?action=getTrips`,
  
  // Expense endpoints
  ADD_EXPENSE: `${API_BASE_URL}?action=addExpense`,
  GET_EXPENSES: `${API_BASE_URL}?action=getExpenses`,
  
  // Complaint endpoints
  ADD_COMPLAINT: `${API_BASE_URL}?action=addComplaint`,
  GET_COMPLAINTS: `${API_BASE_URL}?action=getComplaints`,
  
  // Repayment endpoints
  ADD_REPAYMENT: `${API_BASE_URL}?action=addRepayment`,
  GET_REPAYMENTS: `${API_BASE_URL}?action=getRepayments`,
  
  // Dashboard endpoints
  GET_DASHBOARD_DATA: `${API_BASE_URL}?action=getDashboardData`,
  GET_REPORTS: `${API_BASE_URL}?action=getReports`,
  
  // Admin endpoints
  UPDATE_STATUS: `${API_BASE_URL}?action=updateStatus`
};

// API Request Headers
export const API_HEADERS = {
  'Content-Type': 'application/json'
};

// API Response Status Codes
export const API_STATUS = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

// Sync Configuration
export const SYNC_CONFIG = {
  INTERVAL: 5 * 60 * 1000, // 5 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};