import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login status on app load
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.success) {
      setUser(res.data.user);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      return res.data;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data && res.data.success) {
      setUser(res.data.user);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      return res.data;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/users/me', profileData);
    if (res.data && res.data.success) {
      setUser(res.data.user);
      return res.data;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
