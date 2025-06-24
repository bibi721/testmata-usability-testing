/**
 * Reusable section container with consistent spacing
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'slate' | 'gradient';
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  className,
  background = 'white'
}) => {
  const backgroundClasses = {
    white: 'bg-white',
    slate: 'bg-slate-50',
    gradient: 'bg-gradient-to-br from-blue-50 via-white to-sky-50'
  };

  return (
    <section className={cn('py-20', backgroundClasses[background], className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
};