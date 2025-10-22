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
  login: (userData: any, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Giả định: Sử dụng localStorage để kiểm tra trạng thái đăng nhập
const getUserFromLocalStorage = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem('userInfo');
  return userJson ? JSON.parse(userJson) : null;
};

// 1. AuthProvider: Cung cấp trạng thái cho toàn bộ ứng dụng
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = getUserFromLocalStorage();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    localStorage.setItem('userToken', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 2. Hook useAuth: Custom hook để truy cập Context
export const useAuth = () => { // <-- Đảm bảo là export const để tránh lỗi 'not a function'
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Lỗi này xảy ra nếu component gọi useAuth không nằm trong AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};