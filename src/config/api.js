export const API_BASE_URL = "https://script.google.com/macros/s/AKfycbwiB9fszN8oK1Xu5BbZOSrT2MvmHPGmlS2WLXtmSw0WD9RfBrFMsdmtYEbFesZsDq-SFQ/exec";
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getAuthHeaders = () => ({
  ...API_CONFIG.headers,
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});