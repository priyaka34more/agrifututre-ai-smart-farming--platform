import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import './FloatingActionButton.css';

const FloatingActionButton = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleChat = () => {
    navigate('/chat');
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fab-container">
      {/* Menu Items */}
      <div className={`fab-menu ${isOpen ? 'open' : ''}`}>
        <button className="fab-menu-item" onClick={handleChat}>
          <MessageCircle size={20} />
          <span>AI Chat</span>
        </button>
      </div>

      {/* Main FAB Button */}
      <button 
        className={`fab-main ${isOpen ? 'open' : ''}`}
        onClick={toggleMenu}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

export default FloatingActionButton;
