import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Leaf,
  BarChart3,
  CloudSun,
  Sprout,
  FileText,
  User,
  IndianRupee,
  ChevronDown,
  Activity
} from "lucide-react";
import MobileLayout from "../components/MobileLayout";
import "./Reports.css";
const MODULES = {
  ALL: "all",
  SCANS: "scans",
  MARKET: "market",
  WEATHER: "weather",
  YIELD: "yield",
  SCHEMES: "schemes",
  PROFILE: "profile"
};
const MODULE_CONFIG = {
  [MODULES.ALL]: { label: "All Activity", icon: Activity },
  [MODULES.SCANS]: { label: "Crop Scans", icon: Leaf },
  [MODULES.MARKET]: { label: "Market Prices", icon: BarChart3 },
  [MODULES.WEATHER]: { label: "Weather Checks", icon: CloudSun },
  [MODULES.YIELD]: { label: "Yield Predictions", icon: Sprout },
  [MODULES.SCHEMES]: { label: "Govt Schemes", icon: FileText },
  [MODULES.PROFILE]: { label: "Profile Updates", icon: User }
};
const MOCK_REPORTS_DATA = {
  all: {
    title: "All Activity",
    stats: [
      { value: "156", label: "Total" },
      { value: "98", label: "Healthy" },
      { value: "58", label: "Diseased" },
      { value: "87%", label: "Accuracy" }
    ],
    insights: [
      {
        id: 1,
        type: "warning",
        title: "Humidity Risk",
        subtitle: "Tomato & Potato",
        icon: Leaf
      },
      {
        id: 2,
        type: "success",
        title: "Cotton Healthy",
        subtitle: "15% better",
        icon: Sprout
      },
      {
        id: 3,
        type: "market",
        title: "Soybean Price Good",
        subtitle: "₹4,200/quintal",
        icon: IndianRupee
      }
    ]
  },
  scans: {
    title: "Crop Scan Reports",
    stats: [
      { value: "156", label: "Scans" },
      { value: "98", label: "Healthy" },
      { value: "58", label: "Diseased" },
      { value: "87%", label: "Accuracy" }
    ],
    insights: [
      {
        id: 1,
        type: "success",
        title: "Leaf Spot",
        subtitle: "Cotton • Today",
        icon: Leaf
      },
      {
        id: 2,
        type: "success",
        title: "Healthy Rice",
        subtitle: "Rice • Yesterday",
        icon: Leaf
      }
    ]
  },
  market: {
    title: "Market Reports",
    stats: [
      { value: "23", label: "Checks" },
      { value: "₹4,200", label: "Soybean" },
      { value: "₹6,200", label: "Cotton" },
      { value: "+12%", label: "Trend" }
    ],
    insights: [
      {
        id: 1,
        type: "market",
        title: "Soybean Price Up",
        subtitle: "Sell 30% stock",
        icon: IndianRupee
      }
    ]
  },
  weather: {
    title: "Weather Reports",
    stats: [
      { value: "42", label: "Checks" },
      { value: "Rain", label: "Next Week" },
      { value: "28°C", label: "Temp" },
      { value: "65%", label: "Humidity" }
    ],
    insights: [
      {
        id: 1,
        type: "warning",
        title: "Rain Coming",
        subtitle: "Prepare drainage",
        icon: CloudSun
      }
    ]
  },
  yield: {
    title: "Yield Reports",
    stats: [
      { value: "12", label: "Predictions" },
      { value: "12 q", label: "Expected" },
      { value: "+12%", label: "Better" },
      { value: "Wheat", label: "Best" }
    ],
    insights: [
      {
        id: 1,
        type: "success",
        title: "Yield Improved",
        subtitle: "12% better",
        icon: Sprout
      }
    ]
  },
  schemes: {
    title: "Govt Schemes Reports",
    stats: [
      { value: "5", label: "Schemes" },
      { value: "3", label: "Eligible" },
      { value: "1", label: "Applied" },
      { value: "PM-KISAN", label: "Active" }
    ],
    insights: [
      {
        id: 1,
        type: "success",
        title: "PM-KISAN Eligible",
        subtitle: "Apply now",
        icon: FileText
      }
    ]
  },
  profile: {
    title: "Profile Reports",
    stats: [
      { value: "8", label: "Updates" },
      { value: "Cotton", label: "Crop" },
      { value: "10 acres", label: "Farm" },
      { value: "Done", label: "Profile" }
    ],
    insights: [
      {
        id: 1,
        type: "success",
        title: "Profile Updated",
        subtitle: "Last month",
        icon: User
      }
    ]
  }
};
function Reports() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(MODULES.ALL);
  const moduleData = useMemo(() => MOCK_REPORTS_DATA[activeModule], [activeModule]);
  const getIconBg = (type) => {
    switch(type) {
      case "success": return "#E8F5E9";
      case "warning": return "#FFF3E0";
      case "market": return "#F3E5F5";
      default: return "#E3F2FD";
    }
  };
  const getIconColor = (type) => {
    switch(type) {
      case "success": return "#2e7d32";
      case "warning": return "#f59e0b";
      case "market": return "#7b1fa2";
      default: return "#1565c0";
    }
  };
  return (
    <MobileLayout title="📈 My Farm Usage">
      <div className="reports-page-content">
        {/* Dropdown Selector */}
        <div className="dropdown-container">
          <div className="dropdown-wrapper">
            <select
              className="native-dropdown"
              value={activeModule}
              onChange={(e) => setActiveModule(e.target.value)}
            >
              {Object.entries(MODULE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="chevron" />
          </div>
        </div>
        {/* Stats Grid */}
        <div className="stats-grid">
          {moduleData.stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
        {/* Insights List */}
        <div className="list-container">
          <div className="list-header">
            {moduleData.title}
          </div>
          <div className="insights-list">
            {moduleData.insights.map((insight) => {
              const Icon = insight.icon;
              return (
                <div
                  key={insight.id}
                  className="insight-item"
                  onClick={() => navigate("/dashboard")}
                >
                  <div className="item-icon" style={{ background: getIconBg(insight.type) }}>
                    <Icon size={20} color={getIconColor(insight.type)} />
                  </div>
                  <div className="item-content">
                    <div className="item-title">{insight.title}</div>
                    <div className="item-subtitle">{insight.subtitle}</div>
                  </div>
                  <ChevronRight size={18} color="#c8c8c8" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
export default Reports;
