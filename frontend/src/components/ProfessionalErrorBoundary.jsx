import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import '../styles/theme.css';

class ProfessionalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
      
      // Check for context-related errors
      if (error.message.includes('Cannot destructure') || 
          error.message.includes('LanguageContext') ||
          error.message.includes('useContext')) {
        console.warn('Context error detected - providing fallback UI');
      }
    }
    
    // In production, you might want to send this to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-container">
          <div className="container">
            <div className="flex items-center justify-center min-h-screen">
              <div className="card max-w-md w-full">
                <div className="card-body text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={32} className="text-red-600" />
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Something went wrong
                  </h1>
                  
                  <p className="text-gray-600 mb-6">
                    We're sorry, but something unexpected happened. 
                    Our team has been notified and is working on a fix.
                  </p>

                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <div className="mb-6">
                      <details className="text-left">
                        <summary className="btn btn-ghost text-sm cursor-pointer">
                          Error Details (Development Only)
                        </summary>
                        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs font-mono">
                          <div className="mb-2">
                            <strong>Error:</strong> {this.state.error.toString()}
                          </div>
                          {this.state.errorInfo && (
                            <div>
                              <strong>Stack:</strong>
                              <pre className="whitespace-pre-wrap mt-1">
                                {this.state.errorInfo.componentStack}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  )}

                  <div className="flex gap-3 justify-center">
                    <button 
                      className="btn btn-primary"
                      onClick={this.handleRetry}
                    >
                      <RefreshCw size={16} />
                      Try Again
                    </button>
                    
                    <button 
                      className="btn btn-secondary"
                      onClick={() => window.location.reload()}
                    >
                      Reload Page
                    </button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      If this problem persists, please contact our support team.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ProfessionalErrorBoundary;
