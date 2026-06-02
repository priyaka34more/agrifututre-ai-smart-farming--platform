import React from 'react';
import { RADIUS } from '../../constants/designSystem';

const Badge = ({ 
  children, 
  variant = 'primary',
  size = 'sm',
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    accent: 'bg-accent text-white',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    outline: 'border border-primary text-primary'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]} ${sizes[size]}
        ${className}
      `}
      style={{
        borderRadius: RADIUS.lg
      }}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
