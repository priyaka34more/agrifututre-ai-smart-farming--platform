import React from 'react';
import './MobileLayout.css';

const MobileLayout = ({ children, title }) => {
  return (
    <div className="mobile-layout">
      <div className="mobile-container">
        {title && <div className="mobile-header">{title}</div>}
        <div className="mobile-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;
