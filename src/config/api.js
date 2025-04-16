// API configuration

export const API_URL = 'https://script.google.com/macros/s/AKfycbyVYu9haN5YfceHVhPDsXzPWH8lCyEOsVgOhRitKV1YQvuluzm40qWBbJOK3uAtIWfOkg/exec';

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getAuthHeaders = () => ({
  ...API_CONFIG.headers,
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});