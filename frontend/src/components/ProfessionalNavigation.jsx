import React, { useState } from 'react';
import { 
  Home, 
  Cloud, 
  TrendingUp, 
  Camera, 
  MessageCircle, 
  User, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Bell
} from 'lucide-react';
import '../styles/theme.css';

const ProfessionalNavigation = ({ currentUser, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Weather', href: '/weather', icon: Cloud },
    { name: 'Market', href: '/market', icon: TrendingUp },
    { name: 'Disease Scan', href: '/disease', icon: Camera },
    { name: 'AI Chat', href: '/chat', icon: MessageCircle },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    onLogout();
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🌱</span>
            </div>
            AgriFuture AI
          </div>
          
          <div className="nav-menu">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = item.href;
                }}
              >
                <item.icon size={16} />
                {item.name}
              </a>
            ))}
            
            <div className="flex items-center gap-4 ml-6 pl-6 border-l border-gray-200">
              <button className="btn btn-ghost btn-sm relative">
                <Bell size={16} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">
                    {currentUser?.name || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentUser?.role || 'Farmer'}
                  </div>
                </div>
              </div>
              
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="btn btn-ghost md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {currentUser?.name || 'User'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentUser?.role || 'Farmer'}
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost" onClick={() => setMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = item.href;
                      setMobileMenuOpen(false);
                    }}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </a>
                ))}
              </nav>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <button
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfessionalNavigation;
