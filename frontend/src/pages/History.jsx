import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  DollarSign,
  Beaker,
  Leaf,
  Search,
  ShieldCheck,
  TrendingUp,
  Building2
} from "lucide-react";
import MobileLayout from "../components/MobileLayout";
import "./History.css";

const FILTER_OPTIONS = [
  "All Activities",
  "Disease Detection",
  "Crop Recommendation",
  "Fertilizer Recommendation",
  "Yield Prediction",
  "Market Price Searches",
  "Weather Searches",
  "Government Schemes"
];

const HISTORY_ACTIVITIES = [
  {
    id: 1,
    type: "Disease Detection",
    disease: "Leaf Spot (Mild)",
    crop: "Cotton",
    confidence: 0.91,
    date: "Today, 9:30 AM",
    status: "warning"
  },
  {
    id: 2,
    type: "Disease Detection",
    disease: "Healthy",
    crop: "Rice",
    confidence: 0.96,
    date: "Yesterday, 2:15 PM",
    status: "success"
  },
  {
    id: 3,
    type: "Disease Detection",
    disease: "Blight (Moderate)",
    crop: "Wheat",
    confidence: 0.87,
    date: "May 25, 4:45 PM",
    status: "error"
  },
  {
    id: 4,
    type: "Crop Recommendation",
    recommendedCrop: "Soybean",
    soilType: "Loamy Soil",
    date: "May 23, 11:20 AM"
  },
  {
    id: 5,
    type: "Fertilizer Recommendation",
    fertilizer: "NPK 13-13-21",
    npk: "13-13-21",
    date: "May 22, 2:40 PM"
  },
  {
    id: 6,
    type: "Yield Prediction",
    predictedYield: "3.4 tons/acre",
    crop: "Maize",
    date: "May 21, 9:00 AM"
  },
  {
    id: 7,
    type: "Market Price Searches",
    crop: "Tomato",
    market: "Pune Mandi",
    price: "₹1,250/kg",
    date: "May 20, 4:10 PM"
  },
  {
    id: 8,
    type: "Weather Searches",
    location: "Jalgaon, Maharashtra",
    condition: "Sunny, 28°C",
    date: "May 19, 7:45 AM"
  },
  {
    id: 9,
    type: "Government Schemes",
    scheme: "PM-Kisan",
    eligibility: "Eligible",
    date: "May 18, 3:30 PM"
  }
];

const TYPE_META = {
  "Disease Detection": { Icon: Leaf, color: "#1B7F4A", bg: "#dcfce7" },
  "Crop Recommendation": { Icon: Leaf, color: "#1B7F4A", bg: "#E8F5E9" },
  "Fertilizer Recommendation": { Icon: Beaker, color: "#B45309", bg: "#FEF3C7" },
  "Yield Prediction": { Icon: TrendingUp, color: "#0F766E", bg: "#D1FAE5" },
  "Market Price Searches": { Icon: DollarSign, color: "#166534", bg: "#DCFCE7" },
  "Weather Searches": { Icon: CloudSun, color: "#2563EB", bg: "#DBEAFE" },
  "Government Schemes": { Icon: Building2, color: "#166534", bg: "#DCFCE7" }
};

function History() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("All Activities");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredActivities = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return HISTORY_ACTIVITIES.filter((item) => {
      const matchesFilter = selectedFilter === "All Activities" || item.type === selectedFilter;
      if (!matchesFilter) return false;

      if (!query) return true;
      const searchable = [
        item.disease,
        item.crop,
        item.scheme,
        item.fertilizer,
        item.location,
        item.market
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [selectedFilter, searchTerm]);

  const stats = {
    total: HISTORY_ACTIVITIES.length,
    diseaseScans: HISTORY_ACTIVITIES.filter(item => item.type === "Disease Detection").length,
    recommendations: HISTORY_ACTIVITIES.filter(item => ["Crop Recommendation", "Fertilizer Recommendation"].includes(item.type)).length,
    predictions: HISTORY_ACTIVITIES.filter(item => item.type === "Yield Prediction").length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success": return "#16a34a";
      case "warning": return "#f59e0b";
      case "error": return "#dc2626";
      default: return "#64748b";
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "success": return "#dcfce7";
      case "warning": return "#ffedd5";
      case "error": return "#fee2e2";
      default: return "#f1f5f9";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "success": return "Healthy";
      case "warning": return "Mild Risk";
      case "error": return "Severe Risk";
      default: return "Review";
    }
  };

  return (
    <MobileLayout title="Activity History">
      <div className="history-page-content">
        {/* Back Button */}
        <div className="history-header">
          <button 
            className="history-back-btn"
            onClick={() => navigate("/dashboard")}
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        <div className="history-toolbar">
          <div className="history-filter">
            <label htmlFor="historyFilter">Filter Activity</label>
            <select
              id="historyFilter"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              {FILTER_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="history-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon primary">
                <Activity size={18} />
              </div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Activities</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon success">
                <ShieldCheck size={18} />
              </div>
              <div className="stat-value">{stats.diseaseScans}</div>
              <div className="stat-label">Disease Detections</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon info">
                <Leaf size={18} />
              </div>
              <div className="stat-value">{stats.recommendations}</div>
              <div className="stat-label">Recommendations</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon warning">
                <TrendingUp size={18} />
              </div>
              <div className="stat-value">{stats.predictions}</div>
              <div className="stat-label">Predictions</div>
            </div>
          </div>
        </div>

        <div className="section-wrapper">
          <h2 className="section-title">Activity History</h2>
          {filteredActivities.length === 0 ? (
            <div className="history-empty-state">
              <div className="empty-icon">📋</div>
              <h3>No History Found</h3>
              <p>No activities available for this category.</p>
            </div>
          ) : (
            <div className="history-list">
              {filteredActivities.map((item) => {
                const meta = TYPE_META[item.type] || { Icon: Leaf, color: "#64748b", bg: "#f1f5f9" };
                return (
                  <div key={item.id} className="history-card">
                    <div className="history-avatar">
                      <div className="avatar-container" style={{ background: meta.bg }}>
                        <meta.Icon size={22} color={meta.color} />
                      </div>
                    </div>
                    <div className="history-content">
                      <div className="history-type">{item.type}</div>
                      <div className="history-title">
                        {item.type === "Disease Detection" && item.disease}
                        {item.type === "Crop Recommendation" && item.recommendedCrop}
                        {item.type === "Fertilizer Recommendation" && item.fertilizer}
                        {item.type === "Yield Prediction" && `${item.predictedYield} • ${item.crop}`}
                        {item.type === "Market Price Searches" && `${item.crop} • ${item.market}`}
                        {item.type === "Weather Searches" && item.location}
                        {item.type === "Government Schemes" && item.scheme}
                      </div>
                      <div className="history-details">
                        {item.type === "Disease Detection" && (
                          <>
                            <div className="history-detail-row">
                              <span className="history-detail-label">Crop</span>
                              <span className="history-detail-value">{item.crop}</span>
                            </div>
                            <div className="history-detail-row">
                              <span className="history-detail-label">Confidence</span>
                              <span className="history-detail-value">{(item.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <span className="status-badge" style={{ background: getStatusBg(item.status), color: getStatusColor(item.status) }}>
                              {getStatusLabel(item.status)}
                            </span>
                          </>
                        )}
                        {item.type === "Crop Recommendation" && (
                          <>
                            <div className="history-detail-row">
                              <span className="history-detail-label">Soil Type</span>
                              <span className="history-detail-value">{item.soilType}</span>
                            </div>
                          </>
                        )}
                        {item.type === "Fertilizer Recommendation" && (
                          <>
                            <div className="history-detail-row">
                              <span className="history-detail-label">NPK</span>
                              <span className="history-detail-value">{item.npk}</span>
                            </div>
                          </>
                        )}
                        {item.type === "Yield Prediction" && (
                          <>
                            <div className="history-detail-row">
                              <span className="history-detail-label">Crop</span>
                              <span className="history-detail-value">{item.crop}</span>
                            </div>
                          </>
                        )}
                        {item.type === "Market Price Searches" && (
                          <>
                            <div className="history-detail-row">
                              <span className="history-detail-label">Price</span>
                              <span className="history-detail-value">{item.price}</span>
                            </div>
                          </>
                        )}
                        {item.type === "Weather Searches" && (
                          <>
                            <div className="history-detail-row">
                              <span className="history-detail-label">Condition</span>
                              <span className="history-detail-value">{item.condition}</span>
                            </div>
                          </>
                        )}
                        {item.type === "Government Schemes" && (
                          <>
                            <div className="history-detail-row">
                              <span className="history-detail-label">Eligibility</span>
                              <span className="history-detail-value">{item.eligibility}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="history-meta">
                      <span className="history-date">
                        <Calendar size={12} />
                        {item.date}
                      </span>
                      <ChevronRight size={18} color="#94a3b8" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
export default History;
