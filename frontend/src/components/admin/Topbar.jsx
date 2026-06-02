import React from "react";
import { Bell, Search, User } from "lucide-react";
import "./AdminTopBar.css";

const AdminTopBar = () => {
  const adminEmail = localStorage.getItem("email") || "Admin User";

  return (
    <header className="admin-topbar">
      <div className="topbar-search">
        <Search size={18} color="#9ca3af" />
        <input type="text" placeholder="Search analytics, users..." />
      </div>

      <div className="topbar-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>
        
        <div className="admin-profile-chip">
          <div className="profile-avatar">
            <User size={16} />
          </div>
          <div className="profile-info">
            <span className="profile-name">Developer</span>
            <span className="profile-email">{adminEmail}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;
