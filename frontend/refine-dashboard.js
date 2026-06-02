const fs = require('fs');
const path = require('path');

// Dashboard.jsx content
const dashboardJsx = `import { useNavigate } from "react-router-dom";
import { MapPin, CheckCircle2, Thermometer, Droplets, TrendingUp, Award, Bot, ChevronRight } from "lucide-react";
import scanIcon from "../icon/scan.png";
import marketpriceIcon from "../icon/marketprice.png";
import weatherIcon from "../icon/weather.png";
import yieldIcon from "../icon/yieldpp.png";
import schemeIcon from "../icon/schem.png";
import profileIcon from "../icon/profile.svg";
import useTranslation from "../hooks/useTranslation";
import { useEffect, useState } from "react";
import "./Dashboard.css";

const quickServices = [
  {
    icon: scanIcon,
    bg: "#E6F4EC",
    name: "Scan Crop",
    sub: "Detect crop diseases",
    path: "/disease"
  },
  {
    icon: marketpriceIcon,
    bg: "#E6F0FF",
    name: "Market Price",
    sub: "View mandi rates",
    path: "/market"
  },
  {
    icon: weatherIcon,
    bg: "#E8F7FF",
    name: "Weather",
    sub: "Weather forecast",
    path: "/weather"
  },
  {
    icon: yieldIcon,
    bg: "#FFF4E6",
    name: "Predict Yield",
    sub: "Harvest estimate",
    path: "/yield"
  },
  {
    icon: schemeIcon,
    bg: "#F0E6FF",
    name: "Govt Schemes",
    sub: "Subsidy help",
    path: "/schemes"
  },
  {
    icon: profileIcon,
    bg: "#F0FFF0",
    name: "My Profile",
    sub: "Farm details",
    path: "/profile"
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  const farmerName = userData?.name || localStorage.getItem("userName") || "Farmer";
  const farmerLocation = userData?.location || localStorage.getItem("userLocation") || "Village, District";
  const farmerCrop = userData?.mainCrop || "Crop";

  const todaySnapshot = [
    {
      icon: Thermometer,
      label: "Temperature",
      value: "31°C",
      bg: "#FFF4E6"
    },
    {
      icon: Droplets,
      label: "Rain Chance",
      value: "40%",
      bg: "#E8F7FF"
    },
    {
      icon: TrendingUp,
      label: "Market Price",
      value: "₹6,200",
      bg: "#E6F4EC"
    },
    {
      icon: Award,
      label: "Eligible Schemes",
      value: "3",
      bg: "#F0E6FF"
    }
  ];

  return (
    <div className="farmer-dashboard">
      {/* Welcome Card */}
      <section className="welcome-card">
        <div className="welcome-header">
          <div className="welcome-text">
            <h1 className="welcome-greeting">
              <span>👋</span> Namaskar, {farmerName}
            </h1>
            <div className="welcome-details">
              <div className="welcome-detail-item">
                <span className="detail-icon">🌾</span>
                <span>{farmerCrop}</span>
              </div>
              <div className="welcome-detail-item">
                <MapPin size={16} color="#64748B" />
                <span>{farmerLocation}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="verified-badge">
          <CheckCircle2 size={16} color="#1B7F4A" />
          <span>Verified Farmer</span>
        </div>
      </section>

      {/* Today's Snapshot */}
      <section className="snapshot-section">
        <h2 className="section-title">Today's Snapshot</h2>
        <div className="snapshot-grid">
          {todaySnapshot.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="snapshot-card">
                <div className="snapshot-icon" style={{ backgroundColor: item.bg }}>
                  <Icon size={20} color="#1B7F4A" />
                </div>
                <span className="snapshot-label">{item.label}</span>
                <span className="snapshot-value">{item.value}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Advisory */}
      <section className="ai-advisory-card">
        <div className="advisory-header">
          <div className="advisory-icon">
            <Bot size={24} color="#FFFFFF" />
          </div>
          <div className="advisory-title-section">
            <span className="advisory-eyebrow">🤖 Today's AI Advisory</span>
          </div>
        </div>
        <div className="advisory-content">
          <ul className="advisory-list">
            <li>Rain expected tomorrow</li>
            <li>Avoid pesticide spraying</li>
            <li>Inspect lower cotton leaves</li>
          </ul>
          <button className="advisory-button" onClick={() => navigate("/weather")}>
            View Details
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickServices.map((service, idx) => (
            <button
              className="quick-action-card"
              key={idx}
              type="button"
              onClick={() => navigate(service.path)}
            >
              <div className="quick-action-icon" style={{ backgroundColor: service.bg }}>
                <img src={service.icon} alt="" />
              </div>
              <div className="quick-action-text">
                <strong className="quick-action-title">{service.name}</strong>
                <span className="quick-action-subtitle">{service.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}`;

// Dashboard.css content
const dashboardCss = `.farmer-dashboard {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 16px;
  background-color: #F6F8F5;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Welcome Card */
.welcome-card {
  background-color: #FFFFFF;
  border: 1px solid #E7EFE8;
  border-radius: 18px;
  padding: 20px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.welcome-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.welcome-greeting {
  font-family: 'Noto Sans', 'Noto Sans Devanagari', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.welcome-greeting span {
  font-size: 20px;
}

.welcome-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.welcome-detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Noto Sans', 'Noto Sans Devanagari', sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #475569;
}

.detail-icon {
  font-size: 16px;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #F0FDF4;
  padding: 6px 12px;
  border-radius: 999px;
  width: fit-content;
}

.verified-badge span {
  font-family: 'Noto Sans', 'Noto Sans Devanagari', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #1B7F4A;
}

/* Section Title */
.section-title {
  font-family: 'Noto Sans', 'Noto Sans Devanagari', sans-serif;
  font-size: 17px;
  font-weight: 600;
  color: #0F172A;
  margin: 0 0 12px 0;
  padding: 0 4px;
}

/* Today's Snapshot */
.snapshot-section {
  display: flex;
  flex-direction: column;
}

.snapshot-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.snapshot-card {
  background-color: #FFFFFF;
  border: 1px solid #E7EFE8;
  border-radius: 18px;
  padding: 16px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.snapshot-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.snapshot-label {
  font-family: 'Noto Sans', 'Noto Sans Devanagari', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #64748B;
}

.snapshot-value {
  font-family: 'Noto Sans', 'Noto Sans Devanagari', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #0F172A;
}

/* AI Advisory */
.ai-advisory-card {
  background-color: #F0FDF4;
  border: 1px solid #D1FADB;
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.advisory-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.advisory-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background-color: #1B7F4A;
  display: flex;
  align-items: center;
  justify-content: center;
}

.advisory-eyebrow {
  font-family: 'Noto Sans', 'Noto Sans Devanagari', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #166534;
}

.advisory-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.advisory-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.advisory-list li {
  font-family: 'Noto Sans', 'Noto Sans Devanagari', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #166534;
  display: flex;
  align-items: center;
  gap: 8px;
}

.advisory-list li::before {
  content: "✓";
  color: #166534;
  font-weight: 700;
}

.advisory-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: #1B7F4A;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  font-family: 'Noto Sans', 'Noto Sans Devanagari', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: fit-content;
}

.advisory-button:hover {
  background-color: #166534;
}

.advisory-button:active {
  transform: scale(0.98);
}

/* Quick Actions */
.quick-actions-section {
  display: flex;
  flex-direction: column;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.quick-action-card {
  background-color: #FFFFFF;
  border: 1px solid #E7EFE8;
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  border: none;
  text-align: left;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.quick-action-card:hover {
  border-color: #1B7F4A;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.quick-action-card:active {
  transform: scale(0.98);
}

.quick-action-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-action-icon img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.quick-action-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quick-action-title {
  font-family: 'Noto Sans', 'Noto Sans Devanagari', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #0F172A;
}

.quick-action-subtitle {
  font-family: 'Noto Sans', 'Noto Sans Devanagari', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: #64748B;
}

/* Responsive */
@media (max-width: 480px) {
  .snapshot-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 360px) {
  .welcome-greeting {
    font-size: 20px;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}`;

// Write files
fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'Dashboard.jsx'), dashboardJsx, 'utf8');
fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'Dashboard.css'), dashboardCss, 'utf8');

console.log('✅ Dashboard refined successfully!');
