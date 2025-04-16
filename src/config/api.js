export const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbzjBUXv2ugS2Wln3N-eO94gZoSQJxKaDLqLlfvjDckFbbK1oEkbP0gO4EWUY6olOezH4A/exec';
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getAuthHeaders = () => ({
  ...API_CONFIG.headers,
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});