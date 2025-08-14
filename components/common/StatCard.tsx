import React from 'react';
import { LucideIcon } from 'lucide-react'; // Import the type

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, description, className }) => {
  return (
    <div className={`stat-card ${className || ''}`}>
      <Icon size={48} className="stat-card__icon" />
      <div className="stat-card__content">
        <h3 className="stat-card__value">{value}</h3>
        <p className="stat-card__title">{title}</p>
        <p className="stat-card__description">{description}</p>
      </div>
    </div>
  );
};

export default StatCard;