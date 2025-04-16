import { API_BASE_URL } from '../config/api';

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}?action=register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  });
  return await response.json();
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}?action=login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials)
  });
  return await response.json();
};

export const getDriverData = async () => {
  const response = await fetch(`${API_BASE_URL}?action=getDriverStats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return await response.json();
};

export const getAdminData = async () => {
  const response = await fetch(`${API_BASE_URL}?action=getAdminData`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return await response.json();
};

export const submitOD = async (odData) => {
  const response = await fetch(`${API_BASE_URL}?action=submitOD`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(odData)
  });
  return await response.json();
};

export const submitExpense = async (expenseData) => {
  const response = await fetch(`${API_BASE_URL}?action=submitExpense`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(expenseData)
  });
  return await response.json();
};

export const submitComplaint = async (complaintData) => {
  const response = await fetch(`${API_BASE_URL}?action=submitComplaint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(complaintData)
  });
  return await response.json();
};
