import React from 'react';
import { SHADOW, RADIUS } from '../../constants/designSystem';

const Card = ({ 
  children, 
  className = '', 
  padding = 'lg',
  shadow = 'card',
  hover = false,
  ...props 
}) => {
  const paddingClasses = {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const shadowClasses = {
    card: 'shadow-card',
    hover: 'shadow-hover',
    none: 'shadow-none'
  };

  return (
    <div
      className={`
        bg-white rounded-lg ${paddingClasses[padding]} ${shadowClasses[shadow]}
        ${hover ? 'hover:shadow-lg transition-shadow duration-200' : ''}
        ${className}
      `}
      style={{
        boxShadow: shadow === 'card' ? SHADOW.card : 
                   shadow === 'hover' ? SHADOW.hover : 'none',
        borderRadius: RADIUS.md
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
