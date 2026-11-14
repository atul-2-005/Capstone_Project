import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cc_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('cc_token');
      const storedUser = localStorage.getItem('cc_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend
          const res = await authApi.getCurrentUser();
          setUser(res.data);
          localStorage.setItem('cc_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Auth token verification failed", err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    const authData = response.data;
    
    setToken(authData.token);
    setUser(authData);
    localStorage.setItem('cc_token', authData.token);
    localStorage.setItem('cc_user', JSON.stringify(authData));
    return authData;
  };

  const register = async (data) => {
    const response = await authApi.register(data);
    const authData = response.data;
    
    setToken(authData.token);
    setUser(authData);
    localStorage.setItem('cc_token', authData.token);
    localStorage.setItem('cc_user', JSON.stringify(authData));
    return authData;
  };

  const logout = () => {
    try {
      authApi.logout();
    } catch (e) {
      // ignore
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
  };

  const quickLogin = async (role) => {
    let email = 'student1@campusconnect.edu';
    let pass = 'Student@123';

    if (role === 'ADMIN') {
      email = 'admin@campusconnect.edu';
      pass = 'Admin@123';
    } else if (role === 'STAFF') {
      email = 'staff.it@campusconnect.edu';
      pass = 'Staff@123';
    }

    return login(email, pass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
