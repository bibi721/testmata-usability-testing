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
  checkEmailExists: (email: string) => Promise<{ exists: boolean; userType?: 'customer' | 'tester' }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock database to track registered emails
const mockUserDatabase: { [email: string]: { userType: 'customer' | 'tester'; userData: User } } = {};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      // Also add to mock database if not already there
      if (!mockUserDatabase[userData.email]) {
        mockUserDatabase[userData.email] = {
          userType: userData.userType,
          userData: userData
        };
      }
    }
    setIsLoading(false);
  }, []);

  const checkEmailExists = async (email: string): Promise<{ exists: boolean; userType?: 'customer' | 'tester' }> => {
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
  };

  const login = async (email: string, password: string) => {
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
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const register = async (email: string, password: string, name: string, userType: 'customer' | 'tester' = 'customer') => {
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
      
      // Update mock database
      if (mockUserDatabase[user.email]) {
        mockUserDatabase[user.email].userData = updatedUser;
      }
    }
  };

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}