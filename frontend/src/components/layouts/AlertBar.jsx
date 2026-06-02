import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AlertBar = () => {
  const [visible, setVisible] = useState(true);
  const [alert, setAlert] = useState({
    message: "🌡️ Weather alert: High temperature expected today — Stay safe!",
    type: "weather"
  });

  useEffect(() => {
    // Simulate dynamic alerts
    const alerts = [
      "🌡️ Weather alert: High temperature expected today — Stay safe!",
      "🌧️ Rainfall warning: Heavy rains expected in your region — Protect crops!",
      "📢 New government scheme launched for small farmers — Apply now!",
      "🌾 Market update: Wheat prices increased by 5% this week",
      "🚜 Farming tip: Best time for irrigation is early morning"
    ];

    const interval = setInterval(() => {
      const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
      setAlert({ message: randomAlert, type: "info" });
    }, 30000); // Change alert every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="alert-bar">
      <span>{alert.message}</span>
      <button 
        className="alert-bar-close"
        onClick={() => setVisible(false)}
        aria-label="Close alert"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default AlertBar;
