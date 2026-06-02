import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ProfessionalNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage, availableLanguages } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: '🏠' },
    { path: '/disease', label: t('nav.disease', 'Disease'), icon: '🔬' },
    { path: '/yield', label: t('nav.yield', 'Yield'), icon: '🌾' },
    { path: '/market', label: t('nav.market', 'Market'), icon: '💰' },
    { path: '/weather', label: t('nav.weather', 'Weather'), icon: '🌤️' },
    { path: '/schemes', label: t('nav.schemes', 'Schemes'), icon: '📋' },
    { path: '/chat', label: t('nav.chat', 'Chat'), icon: '💬' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const isActive = (path) => {
    return location.pathname === path || 
           (path === '/dashboard' && location.pathname === '/');
  };

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate('/dashboard')}>
          <span className="navbar-logo-icon">🌾</span>
          <span>AgriFuture</span>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={isActive(item.path) ? 'active' : ''}
              onClick={() => handleNavigation(item.path)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Right Side */}
        <div className="nav-right">
          {/* Language Selector */}
          <select 
            className="nav-language-select"
            value={language}
            onChange={handleLanguageChange}
          >
            {availableLanguages.map((langOption) => (
              <option key={langOption.code} value={langOption.code}>
                {langOption.code === 'en' ? 'EN' : langOption.name}
              </option>
            ))}
          </select>

          {/* Profile */}
          <div className="nav-profile" onClick={handleProfileClick}>
            <User size={18} />
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="nav-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="bg-white w-64 h-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🌾</span>
                  <span className="font-bold text-gray-900">AgriFuture</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">{t('common.language', 'Language')}</span>
                  <select 
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                    value={language}
                    onChange={handleLanguageChange}
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                    <option value="mr">मराठी</option>
                  </select>
                </div>
                
                <button
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={handleProfileClick}
                >
                  <User size={18} />
                  <span>{t('nav.profile', 'Profile')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfessionalNavbar;
