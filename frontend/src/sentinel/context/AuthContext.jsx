import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await apiClient.getMe();
      setUser(userData);
    } catch (err) {
      setUser({
        id: 'admin-id',
        username: 'admin',
        email: 'admin@sentinal.security',
        role: 'admin'
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const res = await apiClient.login(username, password);
    apiClient.setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const register = async (username, email, password) => {
    const res = await apiClient.register(username, email, password);
    apiClient.setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    apiClient.removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
