'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { setUserId } from '@/lib/gaTracking';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        
        // Set user ID in Google Analytics
        if (response.data.user?.id) {
          setUserId(response.data.user.id);
        }
        
        router.push('/learn');
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    // Track logout before clearing
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'auth_action', {
        event_category: 'Authentication',
        event_label: 'logout',
        auth_action: 'logout',
        auth_success: true
      });
    }
    
    localStorage.removeItem('token');
    setUser(null);
    
    // Clear user ID in GA
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', 'user_properties', { user_id: null });
    }
    
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}



