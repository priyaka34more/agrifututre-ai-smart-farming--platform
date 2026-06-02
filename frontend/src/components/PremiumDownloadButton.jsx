import React, { useState } from 'react';
import { Download, Check, X, Loader2, FileText } from 'lucide-react';
import '../styles/premium-theme.css';

// 🌿 Premium Download Button Component
const PremiumDownloadButton = ({ 
  onDownload, 
  filename = 'report.pdf', 
  disabled = false,
  className = '',
  children = 'Download Report'
}) => {
  const [state, setState] = useState('idle'); // idle, downloading, completed, error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // 🌿 Handle download
  const handleDownload = async () => {
    if (disabled || state === 'downloading') return;

    setState('downloading');
    setProgress(0);
    setError('');

    try {
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Call download function
      await onDownload();
      
      // Complete download
      clearInterval(progressInterval);
      setProgress(100);
      setState('completed');

      // Reset after success animation
      setTimeout(() => {
        setState('idle');
        setProgress(0);
      }, 3000);

    } catch (err) {
      setError(err.message || 'Download failed');
      setState('error');
      
      // Reset after error
      setTimeout(() => {
        setState('idle');
        setProgress(0);
        setError('');
      }, 3000);
    }
  };

  // 🌿 Get button content based on state
  const getButtonContent = () => {
    switch (state) {
      case 'downloading':
        return (
          <div className="flex items-center space-x-3">
            <Loader2 size={20} className="animate-spin" />
            <span>Downloading... {Math.round(progress)}%</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center space-x-3">
            <Check size={20} className="success-animation" />
            <span>Download Complete!</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-3">
            <X size={20} />
            <span>Download Failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-3">
            <Download size={20} />
            <span>{children}</span>
          </div>
        );
    }
  };

  // 🌿 Get button classes based on state
  const getButtonClasses = () => {
    const baseClasses = 'premium-button flex items-center justify-center space-x-2 transition-all duration-300 relative overflow-hidden';
    
    const stateClasses = {
      idle: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
      downloading: 'bg-gradient-to-r from-blue-500 to-indigo-600 cursor-not-allowed',
      completed: 'bg-gradient-to-r from-green-500 to-emerald-600 cursor-default',
      error: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
    };

    return `${baseClasses} ${stateClasses[state]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;
  };

  return (
    <div className="inline-block">
      {/* Main Button */}
      <button
        onClick={handleDownload}
        disabled={disabled || state === 'downloading'}
        className={getButtonClasses()}
      >
        {/* Ripple Effect */}
        <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-300"></div>
        
        {/* Button Content */}
        {getButtonContent()}
        
        {/* Progress Bar (overlay) */}
        {state === 'downloading' && (
          <div className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300" 
               style={{ width: `${progress}%` }}></div>
        )}
      </button>

      {/* Progress Details */}
      {state === 'downloading' && (
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Downloading {filename}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {state === 'completed' && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
            <Check size={16} />
            <span className="text-sm font-medium">
              {filename} downloaded successfully!
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {state === 'error' && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
            <X size={16} />
            <span className="text-sm font-medium">
              {error || 'Download failed. Please try again.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// 🌿 Advanced Download Card Component
export const PremiumDownloadCard = ({ 
  title = 'Download Report',
  description = 'Get your comprehensive farming analysis report',
  filename = 'agrifuture-report.pdf',
  fileSize = '2.4 MB',
  onDownload,
  disabled = false
}) => {
  const [state, setState] = useState('idle');
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    if (disabled || state === 'downloading') return;

    setState('downloading');
    setProgress(0);

    try {
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, 300);

      await onDownload();
      
      clearInterval(progressInterval);
      setProgress(100);
      setState('completed');

      setTimeout(() => {
        setState('idle');
        setProgress(0);
      }, 3000);

    } catch (err) {
      setState('error');
      setTimeout(() => {
        setState('idle');
        setProgress(0);
      }, 3000);
    }
  };

  return (
    <div className="premium-glass-card p-6 max-w-sm">
      {/* Icon */}
      <div className="mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
          <FileText size={32} className="text-white" />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>

      {/* File Info */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500 mb-6">
        <span>{filename}</span>
        <span>{fileSize}</span>
      </div>

      {/* Download Button */}
      <PremiumDownloadButton
        onDownload={handleDownload}
        filename={filename}
        disabled={disabled}
        className="w-full"
      />

      {/* Progress Details */}
      {state === 'downloading' && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Preparing download...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🌿 Batch Download Component
export const PremiumBatchDownload = ({ 
  files = [],
  onDownloadAll,
  disabled = false
}) => {
  const [state, setState] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');

  const handleBatchDownload = async () => {
    if (disabled || state === 'downloading') return;

    setState('downloading');
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFile(file.name);
        
        // Simulate individual file download
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update progress
        const fileProgress = ((i + 1) / files.length) * 100;
        setProgress(fileProgress);
      }

      setState('completed');
      setCurrentFile('');

      setTimeout(() => {
        setState('idle');
        setProgress(0);
      }, 3000);

    } catch (err) {
      setState('error');
      setCurrentFile('');
      setTimeout(() => {
        setState('idle');
        setProgress(0);
      }, 3000);
    }
  };

  return (
    <div className="premium-glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Download All Files ({files.length})
      </h3>

      {/* File List */}
      <div className="space-y-2 mb-6">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <FileText size={16} className="text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
            </div>
            <span className="text-xs text-gray-500">{file.size}</span>
          </div>
        ))}
      </div>

      {/* Batch Download Button */}
      <PremiumDownloadButton
        onDownload={handleBatchDownload}
        filename={`${files.length} files`}
        disabled={disabled}
        className="w-full"
      />

      {/* Progress Details */}
      {state === 'downloading' && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Downloading: {currentFile}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumDownloadButton;
