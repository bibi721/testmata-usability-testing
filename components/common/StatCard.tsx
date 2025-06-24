/**
 * Reusable statistics card component
 */
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = React.memo(({
  icon: Icon,
  title,
  value,
  description,
  className
}) => {
  return (
    <div className={cn(
      'bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm hover:shadow-md transition-shadow text-center',
      className
    )}>
      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-2">{value}</div>
      <div className="text-slate-600">{description}</div>
    </div>
  );
});

StatCard.displayName = 'StatCard';