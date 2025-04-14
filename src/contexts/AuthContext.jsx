import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeDB, getFromDB, setToDB } from '../utils/indexedDB';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeDB().then(() => {
      getFromDB('auth', 'user').then(user => {
        if (user) setCurrentUser(user);
        setLoading(false);
      });
    });
  }, []);

  async function login(email, password) {
    try {
      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: JSON.stringify({
          action: 'login',
          email,
          password
        })
      });
      
      const data = await response.json();
      if (data.success) {
        const user = {
          id: data.userId,
          email: data.email,
          role: data.role,
          name: data.name,
          verified: data.verified
        };
        setCurrentUser(user);
        await setToDB('auth', 'user', user);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async function register(userData) {
    try {
      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: JSON.stringify({
          action: 'register',
          ...userData
        })
      });
      
      const data = await response.json();
      return { success: data.success, error: data.error };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async function logout() {
    setCurrentUser(null);
    await setToDB('auth', 'user', null);
  }

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}