import React, { useState } from "react";
import {
  BarChart3,
  Leaf,
  CloudSun,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Droplets,
  Search
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { useLanguage } from "../contexts/LanguageContext";
import "./MyUsage.css";

const cropTrend = [
  { name: "Jan", value: 58 },
  { name: "Feb", value: 64 },
  { name: "Mar", value: 72 },
  { name: "Apr", value: 78 },
  { name: "May", value: 83 },
  { name: "Jun", value: 87 }
];

const marketTrend = [
  { name: "Jan", value: 4200 },
  { name: "Feb", value: 4300 },
  { name: "Mar", value: 4500 },
  { name: "Apr", value: 4700 },
  { name: "May", value: 4850 },
  { name: "Jun", value: 4980 }
];

const weatherTrend = [
  { name: "Mon", value: 31 },
  { name: "Tue", value: 29 },
  { name: "Wed", value: 30 },
  { name: "Thu", value: 32 },
  { name: "Fri", value: 30 },
  { name: "Sat", value: 28 }
];

const schemeTrend = [
  { name: "Week 1", value: 4 },
  { name: "Week 2", value: 6 },
  { name: "Week 3", value: 8 },
  { name: "Week 4", value: 10 }
];

const cropCards = [
  { label: "Total Activities", value: "1,240", icon: Leaf, color: "#1B7F4A", bg: "#EAF7EF" },
  { label: "Healthy Crops", value: "820", icon: CheckCircle2, color: "#10B981", bg: "#ECFDF5" },
  { label: "Diseased Crops", value: "175", icon: TrendingUp, color: "#F59E0B", bg: "#FEF3C7" },
  { label: "Most Used Crop", value: "Cotton", icon: ShieldCheck, color: "#2563EB", bg: "#EFF6FF" },
  { label: "Crop Health Score %", value: "88%", icon: Leaf, color: "#1B7F4A", bg: "#EAF7EF" }
];

const marketCards = [
  { label: "Market Checks", value: "380", icon: BarChart3, color: "#2563EB", bg: "#EFF6FF" },
  { label: "Most Viewed Crop", value: "Wheat", icon: TrendingUp, color: "#10B981", bg: "#ECFDF5" },
  { label: "Highest Price", value: "₹5,800", icon: ArrowUpRight, color: "#0F766E", bg: "#ECFEF9" },
  { label: "Lowest Price", value: "₹3,200", icon: CloudSun, color: "#F97316", bg: "#FFF7ED" },
  { label: "Market Trend", value: "+12%", icon: TrendingUp, color: "#7C3AED", bg: "#F5F3FF" }
];

const weatherCards = [
  { label: "Weather Checks", value: "214", icon: CloudSun, color: "#0EA5E9", bg: "#EFF6FF" },
  { label: "Most Viewed Location", value: "Jalgaon", icon: Leaf, color: "#2563EB", bg: "#EFF6FF" },
  { label: "Average Temperature", value: "29°C", icon: TrendingUp, color: "#0F766E", bg: "#ECFDF5" },
  { label: "Rain Alerts", value: "32", icon: Droplets, color: "#047857", bg: "#ECFDF5" }
];

const schemeCards = [
  { label: "Schemes Viewed", value: "18", icon: ShieldCheck, color: "#0F766E", bg: "#ECFEF9" },
  { label: "Schemes Applied", value: "6", icon: CheckCircle2, color: "#15803D", bg: "#ECFDF5" },
  { label: "Eligible Schemes", value: "9", icon: Leaf, color: "#065F46", bg: "#D1FAE5" }
];

const aiCards = [
  { label: "Advisories Viewed", value: "42", icon: ShieldCheck, color: "#1B7F4A", bg: "#EAF7EF" },
  { label: "Recommendations Followed", value: "28", icon: Leaf, color: "#10B981", bg: "#ECFDF5" },
  { label: "Crop Insights Generated", value: "16", icon: TrendingUp, color: "#0F766E", bg: "#D1FAE5" }
];

function UsageCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="usage-card" style={{ background: bg }}>
      <div className="usage-card-icon" style={{ background: "rgba(255,255,255,0.8)", color }}>
        <Icon size={18} />
      </div>
      <div>
        <div className="usage-card-value">{value}</div>
        <div className="usage-card-label">{label}</div>
      </div>
    </div>
  );
}

const CATEGORY_OPTIONS = [
  "All Usage",
  "Crop & Disease Usage",
  "Market Usage",
  "Weather Usage",
  "Government Scheme Usage",
  "AI Advisory Usage"
];

const PERIOD_OPTIONS = [
  "This Week",
  "This Month",
  "Last 6 Months",
  "This Year"
];

function MyUsage() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("All Usage");
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [searchTerm, setSearchTerm] = useState("");

  const searchFilter = (cards) => cards.filter((card) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return [card.label, card.value].join(" ").toLowerCase().includes(query);
  });

  const shouldShowSection = (category) => selectedCategory === "All Usage" || selectedCategory === category;

  const filteredCropCards = searchFilter(cropCards);
  const filteredMarketCards = searchFilter(marketCards);
  const filteredWeatherCards = searchFilter(weatherCards);
  const filteredSchemeCards = searchFilter(schemeCards);
  const filteredAiCards = searchFilter(aiCards);

  return (
    <div className="my-usage-page">
      <div className="my-usage-container">
        <section className="usage-hero-card">
          <div className="usage-hero-icon">
            <BarChart3 size={26} color="#1B7F4A" />
          </div>
          <div>
            <h1 className="usage-hero-title">{t("profile.myUsagePageTitle", "My Usage")}</h1>
            <p className="usage-hero-subtitle">{t("profile.myUsagePageSubtitle", "Track your AgriFuture activity and app usage")}</p>
          </div>
        </section>

        <section className="usage-toolbar">
          <div className="usage-filter-row">
            <div className="usage-filter-group">
              <label htmlFor="usageCategory">Usage Category</label>
              <select id="usageCategory" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="usage-filter-group">
              <label htmlFor="usagePeriod">Date Filter</label>
              <select id="usagePeriod" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                {PERIOD_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="usage-search-bar">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search usage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </section>

        {shouldShowSection("Crop & Disease Usage") && (
          <section className="usage-section">
            <div className="usage-section-header">
              <h2>{t("profile.usageCropScan", "Crop & Disease Usage")}</h2>
            </div>
            <div className="usage-card-grid">
              {filteredCropCards.map((card) => (
                <UsageCard key={card.label} {...card} />
              ))}
            </div>
          </section>
        )}

        {shouldShowSection("Market Usage") && (
          <section className="usage-section">
            <div className="usage-section-header">
              <h2>{t("profile.usageMarket", "Market Usage")}</h2>
            </div>
            <div className="usage-card-grid">
              {filteredMarketCards.map((card) => (
                <UsageCard key={card.label} {...card} />
              ))}
            </div>
          </section>
        )}

        {shouldShowSection("Weather Usage") && (
          <section className="usage-section">
            <div className="usage-section-header">
              <h2>{t("profile.usageWeather", "Weather Usage")}</h2>
            </div>
            <div className="usage-card-grid">
              {filteredWeatherCards.map((card) => (
                <UsageCard key={card.label} {...card} />
              ))}
            </div>
          </section>
        )}

        {shouldShowSection("Government Scheme Usage") && (
          <section className="usage-section">
            <div className="usage-section-header">
              <h2>{t("profile.usageSchemes", "Government Scheme Usage")}</h2>
            </div>
            <div className="usage-card-grid">
              {filteredSchemeCards.map((card) => (
                <UsageCard key={card.label} {...card} />
              ))}
            </div>
          </section>
        )}

        {shouldShowSection("AI Advisory Usage") && (
          <section className="usage-section">
            <div className="usage-section-header">
              <h2>{t("profile.usageAiInsights", "AI Advisory Usage")}</h2>
            </div>
            <div className="usage-card-grid">
              {filteredAiCards.map((card) => (
                <UsageCard key={card.label} {...card} />
              ))}
            </div>
          </section>
        )}

        <section className="usage-section usage-chart-section">
          <div className="usage-section-header">
            <h2>{t("profile.usageCharts", "Usage Trends")}</h2>
          </div>
          <div className="usage-chart-grid">
            <div className="chart-card">
              <div className="chart-card-title">{t("profile.cropHealthTrend", "Crop Health Trend")}</div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={cropTrend} margin={{ top: 0, right: 0, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cropGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1B7F4A" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#1B7F4A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#E5E7EB" }} />
                  <Area type="monotone" dataKey="value" stroke="#1B7F4A" fill="url(#cropGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <div className="chart-card-title">{t("profile.marketTrend", "Market Trend")}</div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={marketTrend} margin={{ top: 0, right: 0, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#E5E7EB" }} />
                  <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <div className="chart-card-title">{t("profile.weatherTrend", "Weather Trend")}</div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={weatherTrend} margin={{ top: 0, right: 0, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weatherGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#E5E7EB" }} />
                  <Area type="monotone" dataKey="value" stroke="#0EA5E9" fill="url(#weatherGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <div className="chart-card-title">{t("profile.schemeUsageTrend", "Scheme Usage Trend")}</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={schemeTrend} margin={{ top: 0, right: 0, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#E5E7EB" }} />
                  <Bar dataKey="value" fill="#1B7F4A" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default MyUsage;
