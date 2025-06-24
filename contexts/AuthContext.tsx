"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  userType: 'customer' | 'tester';
  plan?: 'free' | 'starter' | 'professional' | 'enterprise';
  // Tester specific fields
  rating?: number;
  completedTests?: number;
  earnings?: number;
  level?: string;
  // Customer specific fields
  company?: string;
  testsCreated?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, userType?: 'customer' | 'tester') => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Determine user type based on email domain or other logic
    // For demo purposes, we'll use a simple check
    const userType: 'customer' | 'tester' = email.includes('tester') || email.includes('test') ? 'tester' : 'customer';
    
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      userType,
      ...(userType === 'customer' ? {
        plan: 'free' as const,
        company: 'Demo Company',
        testsCreated: 0
      } : {
        rating: 4.8,
        completedTests: 12,
        earnings: 340,
        level: 'Rising Tester'
      })
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const register = async (email: string, password: string, name: string, userType: 'customer' | 'tester' = 'customer') => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser: User = {
      id: '1',
      email,
      name,
      userType,
      ...(userType === 'customer' ? {
        plan: 'free' as const,
        company: name + "'s Company",
        testsCreated: 0
      } : {
        rating: 0,
        completedTests: 0,
        earnings: 0,
        level: 'New Tester'
      })
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      updateUser
    }}>
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