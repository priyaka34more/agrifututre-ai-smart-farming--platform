import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/agri-system.css';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import { LanguageProvider } from './contexts/LanguageContext';
import reportWebVitals from './reportWebVitals';

// Capacitor SplashScreen plugin - keep native splash until React is ready
try {
  // Use the global Capacitor runtime plugin when available (avoids bundler resolution)
  if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SplashScreen && window.Capacitor.Plugins.SplashScreen.show) {
    try {
      window.Capacitor.Plugins.SplashScreen.show({ autoHide: false }).catch(() => {});
    } catch (e) {}
  }
} catch (e) {
  // not running in Capacitor/native environment
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

reportWebVitals();
