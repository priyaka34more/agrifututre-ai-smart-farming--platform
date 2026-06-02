import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to monitoring service
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Safely access componentStack using optional chaining to prevent crashes
      const stack = this.state.errorInfo?.componentStack || "No stack trace available.";
      const errorMessage = this.state.error?.message || this.state.error?.toString() || "Unknown error occurred.";

      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans text-slate-800">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 flex flex-col items-center text-center">
            
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <AlertTriangle size={32} />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-slate-500 text-sm mb-8 font-medium">
              We encountered an unexpected error while loading this page. Don't worry, you can try again or return home.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button 
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold text-sm transition-all"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              
              <button 
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-bold text-sm transition-all"
              >
                <Home size={16} />
                Go Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 w-full text-left">
                <details className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <summary className="text-xs font-bold text-slate-600 cursor-pointer outline-none select-none">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-3 overflow-auto max-h-48 text-[11px] text-red-700 font-mono bg-red-50 p-3 rounded-lg border border-red-100 leading-relaxed">
                    <p className="font-bold mb-2">{errorMessage}</p>
                    <pre className="whitespace-pre-wrap">{stack}</pre>
                  </div>
                </details>
              </div>
            )}
            
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
