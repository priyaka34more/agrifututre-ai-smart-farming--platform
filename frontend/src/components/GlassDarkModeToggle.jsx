import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import '../styles/glassmorphism.css';

// 🌿 Glassmorphism Dark Mode Toggle Component
const GlassDarkModeToggle = () => {
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

  // 🌿 Toggle theme
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="glass-card p-3 rounded-full group hover:scale-110 transition-all duration-300"
      aria-label="Toggle dark mode"
    >
      <div className="relative w-6 h-6">
        {/* Sun Icon */}
        <Sun 
          size={24} 
          className={`absolute inset-0 text-yellow-300 transition-all duration-300 ${
            isDark ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
          }`} 
        />
        
        {/* Moon Icon */}
        <Moon 
          size={24} 
          className={`absolute inset-0 text-blue-300 transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
          }`} 
        />
      </div>
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
};

export default GlassDarkModeToggle;
