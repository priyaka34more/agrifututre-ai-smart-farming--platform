import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import { 
  ChevronLeft, ChevronRight, Globe, User, LogOut, Settings, History, LayoutDashboard
} from "lucide-react";
import "./Navbar.css";

// 🌐 Language Context
import { useLanguage } from "../contexts/LanguageContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { t, language, setLanguage, availableLanguages } = useLanguage();
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // Collapsible sidebar state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(
    localStorage.getItem("sidebarCollapsed") === "true"
  );

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed);
    if (isCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [isCollapsed]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? "nav-btn active" : "nav-btn";
  };

  const labels = {
    dashboard: t('nav.dashboard', 'Dashboard'),
    disease: t('nav.disease', 'Disease'),
    yield: t('nav.yield', 'Yield'),
    market: t('nav.market', 'Market'),
    weather: t('nav.weather', 'Weather'),
    schemes: t('nav.schemes', 'Schemes'),
    profile: t('nav.profile', 'My Profile'),
    history: t('nav.history', 'Activity Log'),
    settings: t('common.settings', 'Settings'),
    logout: t('common.signOut', 'Logout'),
    langSelect: t('common.language', 'Language')
  };
  const userName = localStorage.getItem("userName") || "Farmer";

  return (
    <>
      {/* 📱 MOBILE TOP HEADER (Shows on Mobile viewport only) */}
      <div className="mobile-top-header">
        <div className="mobile-logo" onClick={() => navigate("/dashboard")}>
          🌾 AgriFuture
        </div>
        <div className="mobile-actions">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mobile-lang-select"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
          </select>
          <div className="mobile-profile-trigger" onClick={() => navigate("/profile")}>
            👤
          </div>
        </div>
      </div>

      {/* 💻 COLLAPSIBLE ASIDE SIDEBAR NAVBAR (Desktop Viewport only) */}
      <aside className={`aside-navbar ${isCollapsed ? "collapsed" : ""}`}>
        
        {/* Sidebar Header: Logo & Toggle Button */}
        <div className="aside-header">
          <div className="aside-logo" onClick={() => navigate("/dashboard")}>
            <span className="logo-icon">🌾</span>
            {!isCollapsed && <span className="logo-text">AgriFuture</span>}
          </div>
          
          <button 
            className="aside-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="aside-menu">
          
          <div 
            className={isActive("/dashboard")} 
            onClick={() => navigate("/dashboard")}
            title={isCollapsed ? labels.dashboard : ""}
          >
            <span className="menu-icon"><LayoutDashboard size={18} /></span>
            {!isCollapsed && <span className="menu-label">{labels.dashboard}</span>}
          </div>

          <div 
            className={isActive("/disease")} 
            onClick={() => navigate("/disease")}
            title={isCollapsed ? labels.disease : ""}
          >
            <span className="menu-icon">🌿</span>
            {!isCollapsed && <span className="menu-label">{labels.disease}</span>}
          </div>

          <div 
            className={isActive("/yield")} 
            onClick={() => navigate("/yield")}
            title={isCollapsed ? labels.yield : ""}
          >
            <span className="menu-icon">📊</span>
            {!isCollapsed && <span className="menu-label">{labels.yield}</span>}
          </div>

          <div 
            className={isActive("/market")} 
            onClick={() => navigate("/market")}
            title={isCollapsed ? labels.market : ""}
          >
            <span className="menu-icon">📈</span>
            {!isCollapsed && <span className="menu-label">{labels.market}</span>}
          </div>

          <div 
            className={isActive("/weather")} 
            onClick={() => navigate("/weather")}
            title={isCollapsed ? labels.weather : ""}
          >
            <span className="menu-icon">🌦️</span>
            {!isCollapsed && <span className="menu-label">{labels.weather}</span>}
          </div>

          <div 
            className={isActive("/schemes")} 
            onClick={() => navigate("/schemes")}
            title={isCollapsed ? labels.schemes : ""}
          >
            <span className="menu-icon">🏛️</span>
            {!isCollapsed && <span className="menu-label">{labels.schemes}</span>}
          </div>

        </div>

        {/* Sidebar Footer: Language & Profile Dropper */}
        <div className="aside-footer">
          
          {/* Language Selector Slot */}
          <div className="aside-footer-item lang-item" onClick={() => setLangOpen(!langOpen)}>
            <span className="footer-icon"><Globe size={18} /></span>
            {!isCollapsed && (
              <span className="footer-label">
                {availableLanguages.find((langOption) => langOption.code === language)?.name || labels.langSelect}
              </span>
            )}
            
            {/* Language Selection overlay popup */}
            {langOpen && (
              <div className="aside-dropdown-box lang-dropdown">
                <div onClick={() => { setLanguage("en"); setLangOpen(false); }}>English</div>
                <div onClick={() => { setLanguage("hi"); setLangOpen(false); }}>हिंदी</div>
                <div onClick={() => { setLanguage("mr"); setLangOpen(false); }}>मराठी</div>
              </div>
            )}
          </div>

          {/* User Profile Slot */}
          <div className="aside-footer-item profile-item" onClick={() => setProfileOpen(!profileOpen)}>
            <div className="avatar-icon">
              {userName.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="user-details">
                <span className="user-name">{userName}</span>
                <span className="user-role">Enterprise Farmer</span>
              </div>
            )}

            {/* Profile actions dropdown */}
            {profileOpen && (
              <div className="aside-dropdown-box profile-dropdown">
                <div className="drop-opt" onClick={() => { setProfileOpen(false); navigate("/profile"); }}>
                  <User size={14} /> <span>{labels.profile}</span>
                </div>
                <div className="drop-opt" onClick={() => { setProfileOpen(false); navigate("/history"); }}>
                  <History size={14} /> <span>{labels.history}</span>
                </div>
                <div className="drop-opt" onClick={() => { setProfileOpen(false); navigate("/settings"); }}>
                  <Settings size={14} /> <span>{labels.settings}</span>
                </div>
                <div className="drop-opt logout-opt" onClick={handleLogout}>
                  <LogOut size={14} /> <span>{labels.logout}</span>
                </div>
              </div>
            )}
          </div>

        </div>

      </aside>

      {/* 📱 MOBILE BOTTOM NAVIGATION TAB BAR (Shows on Mobile Viewports) */}
      <div className="mobile-bottom-nav">
        <div className={isActive("/dashboard")} onClick={() => navigate("/dashboard")}>
          <span className="mobile-nav-icon"><LayoutDashboard size={16} /></span>
          <span className="mobile-nav-label">{labels.dashboard}</span>
        </div>

        <div className={isActive("/disease")} onClick={() => navigate("/disease")}>
          <span className="mobile-nav-icon">🌿</span>
          <span className="mobile-nav-label">{labels.disease}</span>
        </div>

        <div className={isActive("/yield")} onClick={() => navigate("/yield")}>
          <span className="mobile-nav-icon">📊</span>
          <span className="mobile-nav-label">{labels.yield}</span>
        </div>

        <div className={isActive("/market")} onClick={() => navigate("/market")}>
          <span className="mobile-nav-icon">📈</span>
          <span className="mobile-nav-label">{labels.market}</span>
        </div>

        <div className={isActive("/weather")} onClick={() => navigate("/weather")}>
          <span className="mobile-nav-icon">🌦️</span>
          <span className="mobile-nav-label">{labels.weather}</span>
        </div>
      </div>
    </>
  );
}

export default Navbar;
