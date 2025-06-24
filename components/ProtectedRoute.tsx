"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'customer' | 'tester';
  redirectTo?: string;
}

/**
 * Protected route wrapper component
 */
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
        router.push('/auth/login');
        return;
      }

      if (requiredUserType && user.userType !== requiredUserType) {
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
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || (requiredUserType && user.userType !== requiredUserType)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;