import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { processSyncQueue } from '../services/syncService';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      processSyncQueue(); // 🔄 Trigger sync
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus && isOnline) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 20px',
      borderRadius: '25px',
      backgroundColor: isOnline ? '#2e7d32' : '#d32f2f',
      color: 'white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    }}>
      {isOnline ? (
        <><Wifi size={18} /> Back Online</>
      ) : (
        <><WifiOff size={18} /> Low network – showing last data</>
      )}
    </div>
  );
};

export default NetworkStatus;
