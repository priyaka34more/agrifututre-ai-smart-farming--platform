import React, { useState } from 'react';
import { Camera, Sparkles, ArrowRight, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/premium-theme.css';

// 🌿 Premium Main Action Card Component
const PremiumMainActionCard = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  // 🌿 Handle scan action
  const handleScanNow = async () => {
    setIsScanning(true);
    setScanComplete(false);
    
    // Simulate scanning process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsScanning(false);
    setScanComplete(true);
    
    // Navigate to scan page after success animation
    setTimeout(() => {
      navigate('/disease');
    }, 1500);
  };

  // 🌿 Reset scan state
  const resetScanState = () => {
    setScanComplete(false);
  };

  return (
    <div className="premium-glass-card p-8 relative overflow-hidden group">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 opacity-90"></div>
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-lg animate-pulse delay-75"></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse delay-150"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className={`inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full backdrop-blur-sm ${
            isScanning ? 'animate-spin' : ''
          } ${scanComplete ? 'success-animation' : ''}`}>
            {isScanning ? (
              <Loader2 size={40} className="text-white animate-spin" />
            ) : scanComplete ? (
              <Check size={40} className="text-white" />
            ) : (
              <Camera size={40} className="text-white" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-4">
          {isScanning ? 'Scanning...' : scanComplete ? 'Ready to Scan!' : 'Scan Crop Now'}
        </h2>

        {/* Description */}
        <p className="text-white/90 text-lg mb-8 max-w-md mx-auto">
          {isScanning 
            ? 'Analyzing your crop for diseases and health conditions...' 
            : scanComplete 
            ? 'Your camera is ready! Let\'s detect crop diseases with AI.' 
            : 'Take a photo of your crop and get instant AI-powered disease detection'
          }
        </p>

        {/* Action Button */}
        <button
          onClick={scanComplete ? resetScanState : handleScanNow}
          disabled={isScanning}
          className={`premium-button px-8 py-4 text-lg font-semibold bg-white text-green-600 hover:bg-gray-100 ${
            isScanning ? 'opacity-50 cursor-not-allowed' : ''
          } ${scanComplete ? 'bg-green-100' : ''} group`}
        >
          <div className="flex items-center space-x-3">
            {isScanning ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : scanComplete ? (
              <>
                <Sparkles size={20} />
                <span>Scan Another Crop</span>
              </>
            ) : (
              <>
                <Camera size={20} />
                <span>Start Scanning</span>
                <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </div>
        </button>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-2xl font-bold text-white">95%</div>
            <div className="text-xs text-white/80">Accuracy</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-2xl font-bold text-white">2s</div>
            <div className="text-xs text-white/80">Scan Time</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="text-xs text-white/80">Diseases</div>
          </div>
        </div>

        {/* Success Message */}
        {scanComplete && (
          <div className="mt-6 p-4 bg-white/20 backdrop-blur-sm rounded-lg">
            <p className="text-white font-medium">
              🎉 Great! Your camera is ready for scanning.
            </p>
          </div>
        )}

        {/* Loading Progress */}
        {isScanning && (
          <div className="mt-6">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-white h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
            <p className="text-white/80 text-sm mt-2">Initializing AI detection...</p>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4">
        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
      </div>
      <div className="absolute bottom-4 left-4">
        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-75"></div>
      </div>
      <div className="absolute top-1/2 right-4">
        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-150"></div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

export default PremiumMainActionCard;
