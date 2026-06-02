import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import '../styles/premium-theme.css';

// 🌿 Premium Dark Mode Toggle Component
const PremiumDarkModeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // 🌿 Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // 🌿 Toggle theme with animation
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="premium-glass-card p-3 rounded-full group hover:scale-110 transition-all duration-300 relative overflow-hidden"
      aria-label="Toggle dark mode"
    >
      <div className="relative w-6 h-6">
        {/* Sun Icon */}
        <Sun 
          size={24} 
          className={`absolute inset-0 text-yellow-400 transition-all duration-500 ${
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`} 
        />
        
        {/* Moon Icon */}
        <Moon 
          size={24} 
          className={`absolute inset-0 text-blue-300 transition-all duration-500 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`} 
        />
      </div>
      
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-r from-blue-400/20 to-purple-400/20 group-hover:from-blue-400/40 group-hover:to-purple-400/40' 
          : 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 group-hover:from-yellow-400/40 group-hover:to-orange-400/40'
      }`}></div>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-full bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
    </button>
  );
};

export default PremiumDarkModeToggle;
