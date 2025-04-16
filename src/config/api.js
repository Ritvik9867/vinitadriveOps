export const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbwiZ_h2y9hh3KFLnbDmUAl0Bo501g3hI1VqAMO3jgNv2GKbNMDYqqZUixDB8fNiysccPg/exec';
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getAuthHeaders = () => ({
  ...API_CONFIG.headers,
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});