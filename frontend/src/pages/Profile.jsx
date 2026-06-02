import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  MapPin,
  Phone,
  BarChart3,
  ChevronRight,
  Edit,
  Languages,
  BellRing,
  LockKeyhole,
  User,
  BadgeCheck,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import "./Profile.css";
function Profile() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [avatar, setAvatar] = useState(localStorage.getItem("userAvatar") || "");
  const farmer = {
    name: localStorage.getItem("userName") || "chetnya p",
    location: localStorage.getItem("userLocation") || "Jalgaon, Maharashtra",
    phone: localStorage.getItem("userPhone") || "+91 9876543210",
    farmerId: localStorage.getItem("farmerId") || "AF-2026-1024",
  };
  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      localStorage.setItem("userAvatar", reader.result);
    };
    reader.readAsDataURL(file);
  };
  const menuItems = [
    {
      label: "Edit Profile",
      subtitle: "Update personal information",
      icon: Edit,
      iconBg: "#EAF7EF",
      iconColor: "#1B7F4A",
      onClick: () => navigate("/edit-farm"),
    },
    {
      label: t("profile.myUsage", "My Usage"),
      subtitle: t("profile.myUsageSub", "Track app usage and farm insights"),
      icon: BarChart3,
      iconBg: "#EAF7EF",
      iconColor: "#1B7F4A",
      onClick: () => navigate("/usage"),
    },
    {
      label: "Language",
      subtitle: "Change app language",
      icon: Languages,
      iconBg: "#EAF7EF",
      iconColor: "#1B7F4A",
      onClick: () => {},
    },
    {
      label: "Notifications",
      subtitle: "Manage alerts",
      icon: BellRing,
      iconBg: "#EAF0FF",
      iconColor: "#3B82F6",
      onClick: () => {},
    },
    {
      label: "Change Password",
      subtitle: "Update account password",
      icon: LockKeyhole,
      iconBg: "#FFF4E6",
      iconColor: "#F59E0B",
      onClick: () => {},
    },
  ];
  return (
    <div className="profile-page">
      <div className="profile-container">
        <section className="profile-header-card">
          <div className="profile-header-content">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    <User size={36} color="#1B7F4A" />
                  </div>
                )}
              </div>
              <label className="profile-avatar-edit-btn" htmlFor="avatar-upload">
                <Camera size={16} color="#FFFFFF" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>
            <div className="profile-info">
              <div className="profile-name-row">
                <h2 className="profile-name">{farmer.name}</h2>
              </div>
              <div className="verified-badge">
                <BadgeCheck size={14} color="#1B7F4A" />
                <span>Verified Farmer</span>
              </div>
              <div className="profile-detail">
                <MapPin size={14} color="#64748B" />
                <span>{farmer.location}</span>
              </div>
              <div className="profile-detail">
                <Phone size={14} color="#64748B" />
                <span>{farmer.phone}</span>
              </div>
              <div className="profile-detail">
                <span className="farmer-id-label">Farmer ID:</span>
                <span className="farmer-id-value">{farmer.farmerId}</span>
              </div>
            </div>
          </div>
        </section>
        <section className="profile-section">
          <h2 className="section-title">My Account</h2>
          <div className="account-menu-list">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className="account-menu-item"
                  onClick={item.onClick}
                >
                  <div className="menu-icon-wrapper" style={{ backgroundColor: item.iconBg }}>
                    <Icon size={20} color={item.iconColor} />
                  </div>
                  <div className="menu-text">
                    <div className="menu-title">{item.label}</div>
                    <div className="menu-subtitle">{item.subtitle}</div>
                  </div>
                  <ChevronRight size={18} color="#9CA3AF" />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
export default Profile;
