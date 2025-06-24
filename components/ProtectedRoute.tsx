"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'customer' | 'tester';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredUserType,
  redirectTo 
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // No user logged in, redirect to login
        router.push('/auth/login');
        return;
      }

      if (requiredUserType && user.userType !== requiredUserType) {
        // Wrong user type, redirect to appropriate dashboard
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          const targetRoute = user.userType === 'customer' ? '/dashboard' : '/tester';
          router.push(targetRoute);
        }
        return;
      }
    }
  }, [user, isLoading, requiredUserType, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (requiredUserType && user.userType !== requiredUserType) {
    return null; // Will redirect to appropriate dashboard
  }

  return <>{children}</>;
};

export default ProtectedRoute;