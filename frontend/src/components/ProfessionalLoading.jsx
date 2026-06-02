import React from 'react';
import '../styles/theme.css';

const ProfessionalLoading = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`spinner ${sizeClasses[size]} mb-4`}></div>
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
};

export const ProfessionalSkeleton = ({ type = 'card' }) => {
  switch (type) {
    case 'card':
      return (
        <div className="card">
          <div className="card-body">
            <div className="skeleton skeleton-text-lg mb-4"></div>
            <div className="skeleton skeleton-text mb-2"></div>
            <div className="skeleton skeleton-text mb-2"></div>
            <div className="skeleton skeleton-text w-3/4"></div>
          </div>
        </div>
      );
    case 'avatar':
      return (
        <div className="flex items-center gap-3">
          <div className="skeleton skeleton-avatar"></div>
          <div>
            <div className="skeleton skeleton-text w-24 mb-2"></div>
            <div className="skeleton skeleton-text w-16"></div>
          </div>
        </div>
      );
    case 'stats':
      return (
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="skeleton skeleton-avatar"></div>
              <div className="skeleton skeleton-text w-16"></div>
            </div>
            <div className="skeleton skeleton-text-lg mb-2"></div>
            <div className="skeleton skeleton-text w-20"></div>
          </div>
        </div>
      );
    default:
      return <div className="skeleton skeleton-card"></div>;
  }
};

export const ProfessionalError = ({ title, message, onRetry, actionText = 'Retry' }) => {
  return (
    <div className="card">
      <div className="card-body text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {onRetry && (
          <button className="btn btn-primary" onClick={onRetry}>
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export const ProfessionalEmpty = ({ title, message, action, actionText }) => {
  return (
    <div className="card">
      <div className="card-body text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {action && (
          <button className="btn btn-primary" onClick={action}>
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfessionalLoading;
