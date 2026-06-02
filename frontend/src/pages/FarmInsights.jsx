import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  Activity,
  Camera,
  CloudSun,
  TrendingUp,
  Building2,
  Sprout,
  User,
  Bot
} from "lucide-react";
import MobileLayout from "../components/MobileLayout";
import "./FarmInsights.css";

// Category Definitions
const CATEGORIES = {
  ALL: "all",
  SCANS: "scans",
  WEATHER: "weather",
  MARKET: "market",
  SCHEMES: "schemes",
  AI: "ai",
  YIELD: "yield",
  ACTIVITY: "activity"
};

const CATEGORY_CONFIG = {
  [CATEGORIES.ALL]: { label: "All Modules", icon: Activity },
  [CATEGORIES.SCANS]: { label: "Crop Scan", icon: Camera },
  [CATEGORIES.WEATHER]: { label: "Weather", icon: CloudSun },
  [CATEGORIES.MARKET]: { label: "Market Prices", icon: TrendingUp },
  [CATEGORIES.SCHEMES]: { label: "Government Schemes", icon: Building2 },
  [CATEGORIES.AI]: { label: "AI Assistant", icon: Bot },
  [CATEGORIES.YIELD]: { label: "Yield Prediction", icon: Sprout },
  [CATEGORIES.ACTIVITY]: { label: "Farming Activity", icon: User }
};

// Mock Data
const INSIGHTS_DATA = {
  all: {
    insights: [
      { label: "Farm Health Score", value: "84/100", color: "green" },
      { label: "Total Crop Scans", value: "156", color: "green" },
      { label: "Weather Checks", value: "42", color: "blue" },
      { label: "Market Price Checks", value: "23", color: "orange" },
      { label: "Schemes Viewed", value: "7", color: "purple" },
      { label: "AI Questions Asked", value: "31", color: "blue" },
      { label: "Yield Predictions Generated", value: "12", color: "green" },
      { label: "Expected Income", value: "1.2 Lakh", color: "gold" },
      { label: "Current Risk Level", value: "Low", color: "yellow" }
    ],
    recommendation: {
      icon: Bot,
      title: "Today's AI Recommendation",
      text: "Cotton crops need more water this week. Check humidity levels daily."
    }
  },
  scans: {
    insights: [
      { label: "Total Scans", value: "156", color: "green" },
      { label: "Healthy Crops", value: "98", color: "green" },
      { label: "Diseased Crops", value: "58", color: "red" },
      { label: "Most Common Disease", value: "Leaf Spot", color: "yellow" },
      { label: "Most Scanned Crop", value: "Cotton", color: "green" }
    ],
    recommendation: {
      icon: Camera,
      title: "Latest Scan Result",
      text: "Cotton crop has mild leaf spot. Use organic neem oil spray."
    }
  },
  weather: {
    insights: [
      { label: "Weather Checks", value: "42", color: "blue" },
      { label: "Rain Alerts", value: "3", color: "blue" },
      { label: "Heat Alerts", value: "1", color: "orange" },
      { label: "Humidity Alerts", value: "2", color: "blue" },
      { label: "Weather Risk Level", value: "Medium", color: "yellow" }
    ],
    recommendation: {
      icon: CloudSun,
      title: "Weather Recommendation",
      text: "Rain expected tomorrow. Delay pesticide spraying today."
    }
  },
  market: {
    insights: [
      { label: "Market Price Checks", value: "23", color: "orange" },
      { label: "Most Viewed Crop", value: "Cotton", color: "green" },
      { label: "Highest Price", value: "6,800", color: "gold" },
      { label: "Lowest Price", value: "5,900", color: "blue" },
      { label: "Market Trend", value: "Rising", color: "green" }
    ],
    recommendation: {
      icon: TrendingUp,
      title: "Recommendation",
      text: "Good time to sell! Cotton prices are at peak."
    }
  },
  schemes: {
    insights: [
      { label: "Schemes Viewed", value: "7", color: "purple" },
      { label: "Most Viewed Scheme", value: "PM-KISAN", color: "gold" },
      { label: "Eligible Schemes", value: "3", color: "green" },
      { label: "Applications Started", value: "1", color: "blue" }
    ],
    recommendation: {
      icon: Building2,
      title: "Recommended Schemes",
      text: "PM-KISAN, Crop Insurance, Kisan Credit Card"
    }
  },
  ai: {
    insights: [
      { label: "Questions Asked", value: "31", color: "blue" },
      { label: "Crop Queries", value: "18", color: "green" },
      { label: "Weather Queries", value: "5", color: "blue" },
      { label: "Market Queries", value: "4", color: "orange" },
      { label: "Scheme Queries", value: "4", color: "purple" },
      { label: "Most Asked Topic", value: "Crop Diseases", color: "yellow" }
    ],
    recommendation: {
      icon: Bot,
      title: "Latest AI Recommendation",
      text: "Check weather before applying fertilizer tomorrow."
    }
  },
  yield: {
    insights: [
      { label: "Predictions Generated", value: "12", color: "green" },
      { label: "Expected Yield", value: "12 q/acre", color: "gold" },
      { label: "Expected Income", value: "1.2 Lakh", color: "gold" },
      { label: "Confidence Level", value: "High", color: "green" },
      { label: "Best Performing Crop", value: "Wheat", color: "green" }
    ],
    recommendation: {
      icon: Sprout,
      title: "Recommendation",
      text: "Continue current irrigation schedule for best yield."
    }
  },
  activity: {
    insights: [
      { label: "Crop Scans", value: "156", color: "green" },
      { label: "Weather Checks", value: "42", color: "blue" },
      { label: "Market Checks", value: "23", color: "orange" },
      { label: "Scheme Searches", value: "7", color: "purple" },
      { label: "AI Questions", value: "31", color: "blue" },
      { label: "Yield Predictions", value: "12", color: "green" }
    ],
    recommendation: {
      icon: User,
      title: "Most Used Feature",
      text: "Crop Scanning is your most used feature. Keep it up!"
    }
  }
};



function FarmInsights() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES.ALL);
  
  const data = useMemo(() => INSIGHTS_DATA[activeCategory], [activeCategory]);

  const getColorClass = (color) => {
    switch(color) {
      case "green": return "text-[#2E7D32] bg-[#E8F5E9]";
      case "blue": return "text-[#1565C0] bg-[#E3F2FD]";
      case "orange": return "text-[#F57C00] bg-[#FFF3E0]";
      case "purple": return "text-[#7B1FA2] bg-[#F3E5F5]";
      case "yellow": return "text-[#F57C00] bg-[#FFF8E1]";
      case "red": return "text-[#D32F2F] bg-[#FFEBEE]";
      case "gold": return "text-[#D4AF37] bg-[#FFF8E1]";
      default: return "text-[#2E7D32] bg-[#E8F5E9]";
    }
  };

  

  return (
    <MobileLayout title="Farm Insights">
      <div className="farm-insights-container">
        {/* Dropdown Selector */}
        <div className="dropdown-wrapper">
          <div className="dropdown-label">Select Category</div>
          <div className="select-container">
            <select
              className="native-select"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            <ChevronDown size={20} className="select-chevron" />
          </div>
        </div>

        {/* Insights Grid */}
        <div className="insights-grid">
          {data.insights.map((insight, index) => (
            <div key={index} className="insight-card">
              <div className="insight-label">{insight.label}</div>
              <div className={`insight-value ${getColorClass(insight.color)}`}>
                {insight.value}
              </div>
            </div>
          ))}
        </div>

        {/* Recommendation Card */}
        <div className="recommendation-card">
          <div className="recommendation-header">
            <div className="recommendation-icon-wrapper" style={{ background: "#E8F5E9" }}>
              <data.recommendation.icon size={24} color="#2E7D32" />
            </div>
            <div className="recommendation-title">{data.recommendation.title}</div>
          </div>
          <div className="recommendation-text">{data.recommendation.text}</div>
        </div>

        {/* Padding for bottom nav */}
        <div style={{ height: "80px" }} />
      </div>
    </MobileLayout>
  );
}

export default FarmInsights;
