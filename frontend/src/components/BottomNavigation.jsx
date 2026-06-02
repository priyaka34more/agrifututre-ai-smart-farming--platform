import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Camera, Cloud, MessageCircle, User
} from 'lucide-react';
import './BottomNavigation.css';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/dashboard',
      activePaths: ['/dashboard', '/']
    },
    { 
      icon: Camera, 
      label: 'Scan', 
      path: '/disease',
      activePaths: ['/disease']
    },
    { 
      icon: Cloud, 
      label: 'Weather', 
      path: '/weather',
      activePaths: ['/weather']
    },
    { 
      icon: MessageCircle, 
      label: 'Chat', 
      path: '/chat',
      activePaths: ['/chat', '/ai']
    },
    { 
      icon: User, 
      label: 'Profile', 
      path: '/profile',
      activePaths: ['/profile']
    }
  ];

  const isActive = (item) => {
    return item.activePaths.some(path => location.pathname === path);
  };

  return (
    <div className="bottom-navigation">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const active = isActive(item);
        
        return (
          <button
            key={index}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <Icon size={20} />
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
