'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;              
  login: (userData: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const userJson = localStorage.getItem('userInfo');
      const tokenStr = localStorage.getItem('token');
      if (userJson) setUser(JSON.parse(userJson));
      if (tokenStr) setToken(tokenStr);
    } catch (e) {
      console.error('Auth restore failed:', e);
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
