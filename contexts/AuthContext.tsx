"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  userType: 'customer' | 'tester' | 'admin';
  plan?: 'free' | 'starter' | 'professional' | 'enterprise';
  rating?: number;
  completedTests?: number;
  earnings?: number;
  level?: string;
  company?: string;
  testsCreated?: number;
}

interface TesterProfileData {
  phone?: string;
  city?: string;
  region?: string;
  age?: string;
  education?: string;
  occupation?: string;
  experience?: string;
  languages?: string[];
  devices?: string[];
  internetSpeed?: string;
  availability?: string;
  motivation?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    email: string,
    password: string,
    name: string,
    userType?: 'customer' | 'tester',
    profileData?: TesterProfileData
  ) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  checkEmailExists: (email: string) => Promise<{ exists: boolean; userType?: 'customer' | 'tester' | 'admin' }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUserType = (userType?: string): User['userType'] => {
  const normalized = userType?.toLowerCase();
  if (normalized === 'tester' || normalized === 'admin') {
    return normalized;
  }
  return 'customer';
};

const sessionUserToUser = (sessionUser: any): User | null => {
  if (!sessionUser?.id || !sessionUser?.email || !sessionUser?.name) {
    return null;
  }

  return {
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.name,
    avatar: sessionUser.image,
    userType: normalizeUserType(sessionUser.userType),
    plan: sessionUser.plan,
    rating: sessionUser.rating,
    completedTests: sessionUser.completedTests,
    earnings: sessionUser.earnings,
    level: sessionUser.level,
    company: sessionUser.company,
  };
};

function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useMemo(() => sessionUserToUser(session?.user), [session?.user]);
  const isLoading = status === 'loading' || isSubmitting;

  const fetchCurrentUser = useCallback(async (): Promise<User> => {
    const response = await fetch('/api/auth/session', { cache: 'no-store' });
    const nextSession = await response.json();
    const nextUser = sessionUserToUser(nextSession?.user);

    if (!nextUser) {
      throw new Error('Unable to load your account session');
    }

    await update();
    return nextUser;
  }, [update]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Invalid email or password');
      }

      return await fetchCurrentUser();
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchCurrentUser]);

  const register = useCallback(async (
    email: string,
    password: string,
    name: string,
    userType: 'customer' | 'tester' = 'customer',
    profileData: TesterProfileData = {}
  ): Promise<User> => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          userType: userType.toUpperCase(),
          ...profileData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      return await login(email, password);
    } finally {
      setIsSubmitting(false);
    }
  }, [login]);

  const logout = useCallback(async () => {
    setIsSubmitting(true);

    try {
      await signOut({
        redirect: false,
        callbackUrl: '/',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateUser = useCallback((_userData: Partial<User>) => {
    void update();
  }, [update]);

  const checkEmailExists = useCallback(async (email: string) => {
    const response = await fetch(`/api/register?email=${encodeURIComponent(email)}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return { exists: false };
    }

    const data = await response.json();
    return {
      exists: Boolean(data.exists),
      userType: data.userType ? normalizeUserType(data.userType) : undefined,
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
      checkEmailExists,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Authentication provider component backed by NextAuth session state.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthStateProvider>{children}</AuthStateProvider>
    </SessionProvider>
  );
}

/**
 * Hook to use authentication context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
