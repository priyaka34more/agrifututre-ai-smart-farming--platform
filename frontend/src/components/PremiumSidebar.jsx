import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Camera, TrendingUp, Cloud, MessageCircle, Settings, 
  Menu, ChevronLeft, ChevronRight, User, LogOut
} from 'lucide-react';
import '../styles/premium-theme.css';

// 🌿 Premium Sidebar Navigation Component
const PremiumSidebar = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('');

  // 🌿 Navigation items
  const navigationItems = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      color: 'green'
    },
    {
      id: 'scan',
      label: 'Scan Crop',
      icon: Camera,
      path: '/disease',
      color: 'blue'
    },
    {
      id: 'market',
      label: 'Market Prices',
      icon: TrendingUp,
      path: '/market',
      color: 'orange'
    },
    {
      id: 'weather',
      label: 'Weather',
      icon: Cloud,
      path: '/weather',
      color: 'blue'
    },
    {
      id: 'chat',
      label: 'AI Assistant',
      icon: MessageCircle,
      path: '/chat',
      color: 'purple'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      color: 'gray'
    }
  ], []);

  // 🌿 Set active item based on current path
  useEffect(() => {
    const currentItem = navigationItems.find(item => 
      location.pathname === item.path
    );
    setActiveItem(currentItem?.id || '');
  }, [location.pathname, navigationItems]);

  // 🌿 Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  // 🌿 Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  
  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200/20">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                  AgriFuture
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Smart Farming
                </p>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            {isCollapsed ? (
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`sidebar-item group ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isActive 
                      ? 'bg-white/20' 
                      : 'group-hover:bg-gray-200/20 dark:group-hover:bg-gray-700/20'
                  } transition-colors duration-200`}>
                    <Icon 
                      size={20} 
                      className={`${
                        isActive 
                          ? 'text-white' 
                          : 'text-gray-600 dark:text-gray-400 group-hover:text-green-500'
                      } transition-colors duration-200`} 
                    />
                  </div>
                  {!isCollapsed && (
                    <span className={`font-medium ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-700 dark:text-gray-300 group-hover:text-green-500'
                    } transition-colors duration-200`}>
                      {item.label}
                    </span>
                  )}
                </div>
                
                {/* Active indicator */}
                {isActive && !isCollapsed && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-tl-lg rounded-tr-lg"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200/20">
        <div className="space-y-3">
          {/* User Profile */}
          <button
            onClick={() => handleNavigation('/profile')}
            className="sidebar-item w-full"
            title={isCollapsed ? 'Profile' : ''}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              {!isCollapsed && (
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Farmer
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    View Profile
                  </div>
                </div>
              )}
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="sidebar-item w-full group"
            title={isCollapsed ? 'Logout' : ''}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg group-hover:bg-red-500/20 transition-colors duration-200">
                <LogOut 
                  size={20} 
                  className="text-gray-600 dark:text-gray-400 group-hover:text-red-500 transition-colors duration-200" 
                />
              </div>
              {!isCollapsed && (
                <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-500 transition-colors duration-200">
                  Logout
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Toggle (for mobile view) */}
      <div className="lg:hidden p-4 border-t border-gray-200/20">
        <button
          onClick={onToggle}
          className="w-full p-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          <Menu size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default PremiumSidebar;
