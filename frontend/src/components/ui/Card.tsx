import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-navy-800/80 backdrop-blur-sm border border-navy-700/50 rounded-xl shadow-xl p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;