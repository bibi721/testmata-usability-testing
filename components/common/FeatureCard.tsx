/**
 * Reusable feature card component
 */
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: string;
  className?: string;
  animationDelay?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = React.memo(({
  icon: Icon,
  title,
  description,
  highlight,
  className,
  animationDelay = 0
}) => {
  return (
    <div
      className={cn(
        'group p-6 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white cursor-pointer',
        className
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mb-4 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      
      {highlight && (
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            {highlight}
          </span>
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-blue-900 transition-colors">
        {title}
      </h3>
      
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
});

FeatureCard.displayName = 'FeatureCard';