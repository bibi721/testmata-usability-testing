import React from 'react';
import { cn } from '@/lib/utils';

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'slate' | 'gradient';
  id?: string;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  className,
  background = 'white',
  id
}) => {
  const bgClasses = {
    white: 'bg-white',
    slate: 'bg-slate-50',
    gradient: 'bg-gradient-to-br from-blue-50 via-white to-sky-50'
  };

  return (
    <section
      id={id}
      className={cn(
        'relative py-16 md:py-24',
        bgClasses[background],
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {children}
      </div>
    </section>
  );
};