import React from 'react';
import { Loader2 } from 'lucide-react';
import './LoadingStates.css';

// 🔄 Skeleton Loader
export const SkeletonCard = ({ height = 120 }) => (
  <div className="skeleton-card" style={{ height }}>
    <div className="skeleton-shimmer"></div>
  </div>
);

export const SkeletonAvatar = ({ size = 60 }) => (
  <div className="skeleton-avatar" style={{ width: size, height: size }}>
    <div className="skeleton-shimmer"></div>
  </div>
);

export const SkeletonText = ({ width = '100%', height = 16 }) => (
  <div className="skeleton-text" style={{ width, height }}>
    <div className="skeleton-shimmer"></div>
  </div>
);

// 📱 Loading Spinner
export const LoadingSpinner = ({ size = 24, text = "Loading..." }) => (
  <div className="loading-spinner">
    <Loader2 size={size} className="spinner-icon" />
    {text && <span className="loading-text">{text}</span>}
  </div>
);

// 📄 Empty State
export const EmptyState = ({ 
  icon: Icon = Loader2, 
  title = "No Data Available", 
  description = "There's nothing to show here right now.",
  action 
}) => (
  <div className="empty-state">
    <div className="empty-icon">
      <Icon size={48} />
    </div>
    <h3 className="empty-title">{title}</h3>
    <p className="empty-description">{description}</p>
    {action && <div className="empty-action">{action}</div>}
  </div>
);

// ❌ Error State
export const ErrorState = ({ 
  title = "Something went wrong", 
  description = "Please try again later.",
  onRetry 
}) => (
  <div className="error-state">
    <div className="error-icon">⚠️</div>
    <h3 className="error-title">{title}</h3>
    <p className="error-description">{description}</p>
    {onRetry && (
      <button className="retry-btn" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);

// 🔄 Full Page Loader
export const FullPageLoader = ({ text = "Loading..." }) => (
  <div className="full-page-loader">
    <div className="loader-content">
      <div className="loader-spinner">
        <Loader2 size={48} />
      </div>
      <div className="loader-text">{text}</div>
    </div>
  </div>
);

const loadingStates = {
  SkeletonCard,
  SkeletonAvatar,
  SkeletonText,
  LoadingSpinner,
  EmptyState,
  ErrorState,
  FullPageLoader
};

export default loadingStates;
