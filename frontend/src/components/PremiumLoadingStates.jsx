import React from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import '../styles/premium-theme.css';

// 🌿 Premium Loading States Component
export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = (index) => {
    switch (type) {
      case 'card':
        return (
          <div key={index} className="premium-glass-card p-6">
            <div className="skeleton skeleton-card h-32 mb-4"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text small"></div>
          </div>
        );
      case 'text':
        return (
          <div key={index} className="space-y-2">
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text small"></div>
          </div>
        );
      case 'avatar':
        return (
          <div key={index} className="flex items-center space-x-3">
            <div className="skeleton skeleton-avatar"></div>
            <div className="space-y-2">
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text small"></div>
            </div>
          </div>
        );
      case 'list':
        return (
          <div key={index} className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="skeleton skeleton-avatar"></div>
                <div className="flex-1">
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text small"></div>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div key={index} className="skeleton skeleton-card h-32"></div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
    </div>
  );
};

// 🌿 Shimmer Loading Component
export const ShimmerLoader = ({ height = 'h-20', width = 'w-full' }) => {
  return (
    <div className={`skeleton ${height} ${width}`}></div>
  );
};

// 🌿 Pulse Loading Component
export const PulseLoader = ({ size = 'md', color = 'green' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    white: 'bg-white'
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}></div>
  );
};

// 🌿 Spinner Loading Component
export const SpinnerLoader = ({ size = 'md', color = 'green', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 
        size={sizeClasses[size]} 
        className={`animate-spin ${
          color === 'green' ? 'text-green-500' :
          color === 'blue' ? 'text-blue-500' :
          color === 'orange' ? 'text-orange-500' :
          color === 'purple' ? 'text-purple-500' :
          'text-gray-500'
        }`} 
      />
      {text && (
        <span className="text-gray-600 dark:text-gray-400 text-sm">{text}</span>
      )}
    </div>
  );
};

// 🌿 Full Page Loading Component
export const FullPageLoader = ({ message = 'Loading amazing features...' }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="premium-glass-card p-8 text-center">
        <div className="mb-4">
          <Loader2 size={48} className="animate-spin text-green-500 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          {message}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Please wait a moment...
        </p>
      </div>
    </div>
  );
};

// 🌿 Card Loading Component
export const CardLoader = ({ title = 'Loading...', height = 'h-48' }) => {
  return (
    <div className="premium-glass-card p-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className={`${height} bg-gray-200 rounded mb-4`}></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

// 🌿 Error State Component
export const ErrorState = ({ 
  error = 'Something went wrong', 
  onRetry = null, 
  message = 'Please try again or contact support if the problem persists.' 
}) => {
  return (
    <div className="premium-glass-card p-8 text-center">
      <div className="mb-4">
        <AlertTriangle size={48} className="text-red-500 mx-auto" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {error}
      </p>
      <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="premium-button flex items-center space-x-2 mx-auto"
        >
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

// 🌿 Empty State Component
export const EmptyState = ({ 
  icon = AlertTriangle, 
  title = 'No data found', 
  message = 'There\'s nothing to show here yet.',
  action = null 
}) => {
  const Icon = icon;
  
  return (
    <div className="premium-glass-card p-8 text-center">
      <div className="mb-4">
        <Icon size={48} className="text-gray-400 mx-auto" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {message}
      </p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

// 🌿 Progress Bar Component
export const ProgressBar = ({ progress = 0, color = 'green', showPercentage = true }) => {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
        {showPercentage && (
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

// 🌿 Loading Button Component
export const LoadingButton = ({ 
  loading = false, 
  children, 
  disabled = false, 
  className = '',
  ...props 
}) => {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`premium-button relative overflow-hidden ${className} ${
        loading || disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className="flex items-center justify-center space-x-2">
        {loading && (
          <Loader2 size={16} className="animate-spin" />
        )}
        <span>{children}</span>
      </div>
    </button>
  );
};

// 🌿 Data Loading Wrapper Component
export const DataLoadingWrapper = ({ 
  loading = false, 
  error = null, 
  empty = false, 
  children, 
  onRetry = null,
  loadingComponent = null,
  errorComponent = null,
  emptyComponent = null 
}) => {
  if (loading) {
    return loadingComponent || <FullPageLoader />;
  }

  if (error) {
    return errorComponent || <ErrorState error={error} onRetry={onRetry} />;
  }

  if (empty) {
    return emptyComponent || <EmptyState />;
  }

  return children;
};

// 🌿 Lazy Loading Component
export const LazyLoader = ({ children, fallback = null }) => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return fallback || <FullPageLoader />;
  }

  return children;
};

const PremiumLoadingStates = {
  SkeletonLoader,
  ShimmerLoader,
  PulseLoader,
  SpinnerLoader,
  FullPageLoader,
  CardLoader,
  ErrorState,
  EmptyState,
  ProgressBar,
  LoadingButton,
  DataLoadingWrapper,
  LazyLoader
};

export default PremiumLoadingStates;
