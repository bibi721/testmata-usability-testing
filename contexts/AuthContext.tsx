"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

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
  checkEmailExists: (email: string) => Promise<{ exists: boolean; userType?: 'customer' | 'tester' }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock database to track registered emails
const mockUserDatabase: { [email: string]: { userType: 'customer' | 'tester'; userData: User } } = {};

/**
 * Authentication provider component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add existing user to mock database if not already there
    if (user && !mockUserDatabase[user.email]) {
      mockUserDatabase[user.email] = {
        userType: user.userType,
        userData: user
      };
    }
    setIsLoading(false);
  }, [user]);

  const checkEmailExists = useCallback(async (email: string): Promise<{ exists: boolean; userType?: 'customer' | 'tester' }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const existingUser = mockUserDatabase[email.toLowerCase()];
    if (existingUser) {
      return {
        exists: true,
        userType: existingUser.userType
      };
    }
    
    return { exists: false };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const normalizedEmail = email.toLowerCase();
    const existingUser = mockUserDatabase[normalizedEmail];
    
    if (!existingUser) {
      setIsLoading(false);
      throw new Error('User not found');
    }
    
    const mockUser = existingUser.userData;
    setUser(mockUser);
    setIsLoading(false);
  }, [setUser]);

  const register = useCallback(async (email: string, password: string, name: string, userType: 'customer' | 'tester' = 'customer') => {
    setIsLoading(true);
    
    const normalizedEmail = email.toLowerCase();
    
    // Check if email already exists
    const emailCheck = await checkEmailExists(normalizedEmail);
    if (emailCheck.exists) {
      setIsLoading(false);
      throw new Error(`This email is already registered as a ${emailCheck.userType} account. Please use a different email or sign in to your existing account.`);
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: Date.now().toString(),
      email: normalizedEmail,
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
    
    // Add to mock database
    mockUserDatabase[normalizedEmail] = {
      userType,
      userData: mockUser
    };
    
    setUser(mockUser);
    setIsLoading(false);
  }, [checkEmailExists, setUser]);

  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Update mock database
      if (mockUserDatabase[user.email]) {
        mockUserDatabase[user.email].userData = updatedUser;
      }
    }
  }, [user, setUser]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
      checkEmailExists
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}