
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashScreen.css';

// Use runtime Capacitor global plugin when available; avoid bundler imports
let CapacitorSplash = null;
if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SplashScreen) {
  CapacitorSplash = window.Capacitor.Plugins.SplashScreen;
}

const SplashScreen = ({ onComplete, redirectOnComplete = true }) => {
  const navigate = useNavigate();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Premium animation timeline (5-6 seconds total)
    const timers = [
      setTimeout(() => setStage(1), 800),   // Scene 2: Leaf appears
      setTimeout(() => setStage(2), 1800),  // Scene 3: AI scanning
      setTimeout(() => setStage(3), 2800),  // Scene 4: Icons appear
      setTimeout(() => setStage(4), 3800),  // Scene 5: Logo animation
      setTimeout(() => setStage(5), 4600),  // Scene 6: Text display
      setTimeout(async () => {
        // Hide native splash (if running inside Capacitor) then navigate
        try {
          if (CapacitorSplash && CapacitorSplash.hide) {
            await CapacitorSplash.hide();
          }
        } catch (err) {
          console.warn('Capacitor splash hide failed', err);
        }
        if (onComplete) {
          onComplete();
          return;
        }
        if (redirectOnComplete) {
          const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
          navigate(isLoggedIn ? '/dashboard' : '/login', { replace: true });
        }
      }, 6000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [navigate, onComplete, redirectOnComplete]);

  return (
    <div className="splash-screen">
      {/* Scene 1: Premium sunrise gradient background */}
      <div className={`splash-background ${stage >= 0 ? 'active' : ''}`}></div>

      {/* Scene 2: Healthy green crop leaf */}
      <div className={`splash-leaf-container ${stage >= 1 ? 'visible' : ''}`}>
        <svg className="splash-leaf-svg" viewBox="0 0 100 140" width="120" height="168">
          {/* Leaf shape - premium botanical design */}
          <defs>
            <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#43A047', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#2E7D32', stopOpacity: 1}} />
            </linearGradient>
            <filter id="leafShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.15" />
            </filter>
          </defs>
          
          {/* Main leaf blade */}
          <path
            d="M 50 10 Q 80 30 85 70 Q 80 100 50 130 Q 20 100 15 70 Q 20 30 50 10"
            fill="url(#leafGradient)"
            filter="url(#leafShadow)"
            className="splash-leaf-blade"
          />
          
          {/* Leaf vein - center line */}
          <line x1="50" y1="10" x2="50" y2="130" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          
          {/* Side veins */}
          <path d="M 50 30 Q 65 40 75 50" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
          <path d="M 50 50 Q 70 65 80 85" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
          <path d="M 50 30 Q 35 40 25 50" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
          <path d="M 50 50 Q 30 65 20 85" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* Scene 3: AI scanning animation */}
      <div className={`splash-scan-container ${stage >= 2 ? 'active' : ''}`}>
        <div className="splash-scan-overlay"></div>
        <svg className="splash-scan-line-svg" viewBox="0 0 100 140" width="120" height="168">
          <line
            className="splash-scan-line"
            x1="0"
            y1="70"
            x2="100"
            y2="70"
            stroke="rgba(67, 160, 71, 0.8)"
            strokeWidth="2"
          />
        </svg>
        <div className="splash-scan-glow"></div>
      </div>

      {/* Scene 4: Three feature icons */}
      <div className={`splash-features-container ${stage >= 3 ? 'visible' : ''}`}>
        <div className="splash-feature-icon splash-icon-1">
          <div className="icon-background"></div>
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="#43A047" />
          </svg>
          <div className="icon-label">Crop Health</div>
        </div>
        
        <div className="splash-feature-icon splash-icon-2">
          <div className="icon-background"></div>
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#43A047" />
          </svg>
          <div className="icon-label">Weather</div>
        </div>
        
        <div className="splash-feature-icon splash-icon-3">
          <div className="icon-background"></div>
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" fill="#43A047" />
          </svg>
          <div className="icon-label">Market Prices</div>
        </div>
      </div>

      {/* Scene 5: Leaf transforms to logo (hidden during scan, shown after) */}
      <div className={`splash-logo-container ${stage >= 4 ? 'visible' : ''}`}>
        <svg className="splash-logo-mark" viewBox="0 0 100 140" width="100" height="140">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#FFFFFF', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#E8F5E9', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          <path
            d="M 50 10 Q 80 30 85 70 Q 80 100 50 130 Q 20 100 15 70 Q 20 30 50 10"
            fill="url(#logoGradient)"
          />
          <line x1="50" y1="10" x2="50" y2="130" stroke="#43A047" strokeWidth="2" />
        </svg>
      </div>

      {/* Scene 6: Brand tagline and text */}
      <div className={`splash-text-container ${stage >= 5 ? 'visible' : ''}`}>
        <h1 className="splash-title">AgriFuture AI</h1>
        <div className="splash-divider"></div>
        <p className="splash-tagline-primary">Let's Grow Together</p>
        <p className="splash-tagline-secondary">Our Farm, Our Future.</p>
      </div>
    </div>
  );
}

export default SplashScreen;
