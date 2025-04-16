export const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbzrDRhqAtWoedb81L5EoHRbViVs4w_TkG0pqeRtDKAKnentWbqRcVYB9JZnNzNICrZs0A/exec';
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getAuthHeaders = () => ({
  ...API_CONFIG.headers,
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});