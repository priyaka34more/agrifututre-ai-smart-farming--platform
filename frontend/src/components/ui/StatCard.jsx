import React from 'react';
import { RADIUS } from '../../constants/designSystem';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendUp = true,
  className = '',
  ...props 
}) => {
  return (
    <div
      className={`
        bg-white p-6 rounded-lg shadow-card
        hover:shadow-lg transition-shadow duration-200
        ${className}
      `}
      style={{
        boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
        borderRadius: RADIUS.md
      }}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            trendUp ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className="text-lg">
              {trendUp ? '↑' : '↓'}
            </span>
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
