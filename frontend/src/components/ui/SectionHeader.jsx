import React from 'react';

const SectionHeader = ({ 
  title, 
  subtitle,
  action,
  className = '',
  ...props 
}) => {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`} {...props}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
