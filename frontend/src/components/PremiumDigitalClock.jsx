import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import '../styles/premium-theme.css';

// 🌿 Premium Digital Clock Component
const PremiumDigitalClock = () => {
  const [time, setTime] = useState(new Date());
  const [date, setDate] = useState(new Date());

  // 🌿 Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      setDate(now);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 🌿 Format time with leading zeros
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return { hours, minutes, seconds };
  };

  // 🌿 Format date
  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // 🌿 Get greeting based on time
  const getGreeting = () => {
    const hour = date.getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 18) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };

  const { hours, minutes, seconds } = formatTime(time);

  return (
    <div className="premium-glass-card p-6 text-center">
      {/* Greeting */}
      <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
        {getGreeting()}
      </div>

      {/* Digital Clock */}
      <div className="digital-clock mb-4">
        {hours}:{minutes}:{seconds}
      </div>

      {/* Date */}
      <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
        <Calendar size={16} className="mr-2" />
        <span>{formatDate(date)}</span>
      </div>

      {/* Decorative Elements */}
      <div className="mt-4 flex justify-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-150"></div>
      </div>
    </div>
  );
};

export default PremiumDigitalClock;
