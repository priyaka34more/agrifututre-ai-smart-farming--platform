import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Bell,
  History,
  Languages,
  LogOut,
  MapPin,
  Menu,
  Sprout,
  User,
  X,
  HelpCircle,
  Mail,
  Star,
  Info,
} from "lucide-react";
import BottomNavbar from "../components/BottomNavbar";
import logo from "../icon/logo.png";
import { useLanguage } from "../contexts/LanguageContext";
import "./FarmerLayout.css";

const SUPPORT_ITEMS = [
  { key: "help", path: "/help-support", labelKey: "profile.helpAndSupport", label: "Help & Support", subtitleKey: "profile.helpAndSupportSub", subtitle: "Get help", icon: HelpCircle },
  { key: "contact", path: "/contact-support", labelKey: "profile.callSupport", label: "Contact Support", subtitleKey: "profile.whatsappSupport", subtitle: "Email Support", icon: Mail },
  { key: "feedback", path: "/feedback", labelKey: "profile.feedback", label: "Feedback", subtitleKey: "profile.shareFeedback", subtitle: "Share feedback", icon: Star },
  { key: "about", path: "/about", labelKey: "profile.about", label: "About AgriFuture", subtitleKey: "profile.appVersion", subtitle: "App info", icon: Info },
];

export default function FarmerLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t, availableLanguages } = useLanguage();

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  const handleSupportClick = (item) => {
    setIsDrawerOpen(false);
    navigate(item.path);
  };

  // pageTitle computation removed — page-specific titles should be rendered inside pages

  const goTo = (path) => {
    setIsDrawerOpen(false);
    navigate(path);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const farmerName = localStorage.getItem("userName") || "Chetnya Patil";
  const farmerLocation = localStorage.getItem("userLocation") || "Jalgaon, Maharashtra";

  return (
    <div className="farmer-app-shell">
      {isDrawerOpen && (
        <button
          className="farmer-overlay"
          aria-label={t("common.closeMenu", "Close menu")}
          onClick={() => setIsDrawerOpen(false)}
          type="button"
        />
      )}
      <aside
        className={`farmer-sidebar ${isDrawerOpen ? "open" : ""}`}
        aria-hidden={!isDrawerOpen}
      >
        <div className="sidebar-header">
          <button
            type="button"
            className="sidebar-close"
            aria-label={t("common.closeMenu", "Close menu")}
            onClick={() => setIsDrawerOpen(false)}
          >
            <X size={18} />
          </button>
          <div className="sidebar-brand">
            <img src={logo} alt="AgriFuture AI" className="drawer-brand-logo" />
          </div>
        </div>

        <div className="farmer-identity-card">
          <div className="farmer-avatar">
            <User size={28} color="#1B7F4A" />
          </div>
          <div className="farmer-info">
            <div className="farmer-name-row">
              <strong>{farmerName}</strong>
              <div className="verified-badge-mini">
                <BadgeCheck size={12} color="#1B7F4A" />
              </div>
            </div>
            <div className="farmer-location-row">
              <MapPin size={14} color="#64748B" />
              <span>{farmerLocation}</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label={t("common.profile", "Farmer navigation")}
        >
          <div className="nav-section">
            <div className="nav-section-title">{t("sidebar.appSettings", "App Settings")}</div>
            <div className="nav-items">
              <button
                type="button"
                className="nav-item"
                onClick={() => goTo("/history")}
              >
                <div className="nav-item-icon history-icon">
                  <History size={20} color="#1B7F4A" />
                </div>
                <div className="nav-item-text">
                  <div className="nav-item-label">{t("profile.scanHistory", "Scan History")}</div>
                  <div className="nav-item-subtitle">{t("profile.scanHistorySub", "View crop scan records")}</div>
                </div>
              </button>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">{t("sidebar.support", "Support")}</div>
            <div className="nav-items">
              {SUPPORT_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button 
                    key={item.key} 
                    type="button" 
                    className="nav-item"
                    onClick={() => handleSupportClick(item)}
                  >
                    <div className={`nav-item-icon ${item.key}-icon`}>
                      <Icon
                        size={20}
                        color={item.key === "help" ? "#2563EB"
                          : item.key === "contact" ? "#16A34A"
                          : item.key === "feedback" ? "#B45309"
                          : item.key === "about" ? "#15803D"
                          : "#475059"}
                      />
                    </div>
                    <div className="nav-item-text">
                      <div className="nav-item-label">{t(item.labelKey, item.label)}</div>
                      <div className="nav-item-subtitle">{t(item.subtitleKey, item.subtitle)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="sidebar-logout">
          <button className="nav-item logout" onClick={() => {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userData");
            goTo("/login");
          }}>
            <div className="nav-item-icon logout-icon">
              <LogOut size={20} color="#DC2626" />
            </div>
            <div className="nav-item-text">
              <div className="nav-item-label">{t("profile.logout", "Logout")}</div>
            </div>
          </button>
        </div>
      </aside>

      <div className="farmer-workspace">
        <header className="farmer-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="ag-icon-btn topbar-menu"
              aria-label={t("common.openMenu", "Open menu")}
              onClick={() => setIsDrawerOpen(true)}
            >
              <Menu size={21} />
            </button>
            <div className="topbar-brand" onClick={() => navigate('/') } role="button" tabIndex={0}>
              <Sprout size={32} color="#FFFFFF" strokeWidth={2.8} />
              <div className="topbar-brand-content">
                <span className="app-brand-name">{process.env.REACT_APP_NAME || 'AgriFuture AI'}</span>
              </div>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="topbar-language">
              <Languages size={18} />
              <select
                value={language}
                onChange={handleLanguageChange}
                aria-label={t("common.language", "Language")}
              >
                {availableLanguages.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="ag-icon-btn" aria-label={t("profile.notifications", "Notifications")} onClick={() => navigate("/notifications")}>
              <Bell size={19} />
            </button>
          </div>
        </header>

        <main className="farmer-page-host">
          <Outlet />
        </main>

        <BottomNavbar />
      </div>
    </div>
  );
}
