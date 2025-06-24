/**
 * Reusable loading spinner component
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-2 border-slate-300 border-t-blue-600',
        sizeClasses[size],
        className
      )}
      aria-label="Loading"
    />
  );
};