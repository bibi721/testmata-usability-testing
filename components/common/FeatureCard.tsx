import React from 'react';

interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  highlight?: string; // Add the highlight property
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, highlight }) => {
  return (
    <div className="feature-card">
      {icon && <div className="feature-card__icon">{icon}</div>}
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__description">{description}</p>
      {highlight && <p className="feature-card__highlight">{highlight}</p>}
    </div>
  );
};