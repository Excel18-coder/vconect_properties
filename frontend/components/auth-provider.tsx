'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import type { User, ApiResponse } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  profile: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: any }>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response: ApiResponse<User> = await api.get('/auth/me');
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('vconect_token');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response: any = await api.post('/auth/login', { email, password });
      if (response.success && response.token) {
        localStorage.setItem('vconect_token', response.token);
        setUser(response.user);
        return { error: null };
      }
      return { error: { message: response.message || 'Login failed' } };
    } catch (error: any) {
      return { error: { message: error.message || 'Login failed' } };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    try {
      const response: any = await api.post('/auth/register', { email, password, fullName, role });
      if (response.success) {
        return { error: null };
      }
      return { error: { message: response.message || 'Registration failed' } };
    } catch (error: any) {
      return { error: { message: error.message || 'Registration failed' } };
    }
  };

  const signOut = () => {
    localStorage.removeItem('vconect_token');
    setUser(null);
  };

  const refreshProfile = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, profile: user, isLoading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
