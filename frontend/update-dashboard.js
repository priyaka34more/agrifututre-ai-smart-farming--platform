
const fs = require('fs');
const path = require('path');

const newContent = `import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeNav, setActiveNav] = useState("home");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning 🌅";
    if (hour < 18) return "Good Afternoon ☀️";
    return "Good Evening 🌙";
  };

  const translations = {
    en: {
      services: [
        { icon: "🔬", color: "green",  name: "Crop Scan",        sub: "Detect crop diseases", route: "/disease" },
        { icon: "📈", color: "blue",   name: "Market Price",     sub: "Live mandi rates", route: "/market" },
        { icon: "⛅", color: "amber",  name: "Weather",          sub: "7-day forecast", route: "/weather" },
        { icon: "🌾", color: "purple", name: "Yield Prediction", sub: "Crop yield forecast", route: "/yield" },
        { icon: "🛡️", color: "teal",   name: "Govt Schemes",     sub: "Farm subsidies", route: "/schemes" },
        { icon: "💡", color: "rose",   name: "Farming Tips",     sub: "Best practices", route: "/chat" },
      ],
      activities: [
        { icon: "🔬", bg: "#e8f5e9", name: "Crop Scan Completed",    time: "2 hours ago" },
        { icon: "🌤️", bg: "#eff6ff", name: "Weather Updated",        time: "4 hours ago" },
        { icon: "📊", bg: "#fffbeb", name: "Market Prices Checked",  time: "Yesterday" },
      ],
      navItems: [
        { id: "home",    icon: "🏠", label: "Home", route: "/dashboard" },
        { id: "scan",    icon: "🔬", label: "Scan", route: "/disease" },
        { id: "market",  icon: "📈", label: "Market", route: "/market" },
        { id: "weather", icon: "⛅", label: "Weather", route: "/weather" },
        { id: "profile", icon: "👤", label: "Profile", route: "/profile" },
      ],
      sectionTitles: {
        insights: "Today's Farm Insights",
        services: "Quick Services",
        activity: "Recent Farm Activity",
        tip: "Today's Farming Tip",
      },
      weather: {
        temp: "31°C",
        desc: "Partly Cloudy",
        humidity: "64%",
        wind: "12 km/h",
        feelsLike: "35°C",
        advisoryTitle: "Today's Farm Advisory",
        advisoryText: "Check leaves for yellow spots after recent rainfall. Early detection helps!",
      },
      stats: {
        totalScans: "156",
        accuracy: "94.2%",
        lastDetection: "Early Blight",
        irrigation: "Optimal",
      },
      insights: {
        cropHealth: "Crop Health",
        irrigation: "Irrigation",
        cropHealthVal: "84%",
        irrigationVal: "Good",
      },
      tip: "Water your crops early in the morning (6–8 AM) to minimize evaporation and ensure better absorption. This can save up to 30% of water!",
    },
    hi: {
      services: [
        { icon: "🔬", color: "green",  name: "फसल स्कैन",        sub: "फसल रोगों का पता लगाएं", route: "/disease" },
        { icon: "📈", color: "blue",   name: "बाजार भाव",     sub: "लाइव मंडी दरें", route: "/market" },
        { icon: "⛅", color: "amber",  name: "मौसम",          sub: "7 दिन का पूर्वानुमान", route: "/weather" },
        { icon: "🌾", color: "purple", name: "उपज अनुमान", sub: "फसल उपज पूर्वानुमान", route: "/yield" },
        { icon: "🛡️", color: "teal",   name: "सरकारी योजनाएं",     sub: "खेत सब्सिडी", route: "/schemes" },
        { icon: "💡", color: "rose",   name: "खेती के टिप्स",     sub: "सर्वोत्तम प्रथाओं", route: "/chat" },
      ],
      activities: [
        { icon: "🔬", bg: "#e8f5e9", name: "फसल स्कैन पूर्ण",    time: "2 घंटे पहले" },
        { icon: "🌤️", bg: "#eff6ff", name: "मौसम अपडेट",        time: "4 घंटे पहले" },
        { icon: "📊", bg: "#fffbeb", name: "बाजार कीमतें जांची गईं",  time: "कल" },
      ],
      navItems: [
        { id: "home",    icon: "🏠", label: "होम", route: "/dashboard" },
        { id: "scan",    icon: "🔬", label: "स्कैन", route: "/disease" },
        { id: "market",  icon: "📈", label: "बाजार", route: "/market" },
        { id: "weather", icon: "⛅", label: "मौसम", route: "/weather" },
        { id: "profile", icon: "👤", label: "प्रोफाइल", route: "/profile" },
      ],
      sectionTitles: {
        insights: "आज की फसल जानकारी",
        services: "त्वरित सेवाएं",
        activity: "हाल की फार्म गतिविधि",
        tip: "आज का खेती टिप",
      },
      weather: {
        temp: "31°C",
        desc: "आंशिक बादल",
        humidity: "64%",
        wind: "12 km/h",
        feelsLike: "35°C",
        advisoryTitle: "आज का फार्म सलाह",
        advisoryText: "हाल की बारिश के बाद पीले धब्बों के लिए पत्तियों की जांच करें। प्रारंभिक पहचान मदद करती है!",
      },
      stats: {
        totalScans: "156",
        accuracy: "94.2%",
        lastDetection: "अर्ली ब्लाइट",
        irrigation: "अनुकूल",
      },
      insights: {
        cropHealth: "फसल स्वास्थ्य",
        irrigation: "सिंचाई",
        cropHealthVal: "84%",
        irrigationVal: "अच्छा",
      },
      tip: "वाष्पन को कम करने और बेहतर अवशोषण सुनिश्चित करने के लिए अपनी फसलों को सुबह जल्दी (6-8 बजे) पानी दें। इससे 30% तक पानी बचा सकता है!",
    },
    mr: {
      services: [
        { icon: "🔬", color: "green",  name: "पीक स्कॅन",        sub: "पीक रोग शोधा", route: "/disease" },
        { icon: "📈", color: "blue",   name: "बाजार भाव",     sub: "लाइव मंडी दरें", route: "/market" },
        { icon: "⛅", color: "amber",  name: "हवामान",          sub: "7 दिवसांचा अंदाज", route: "/weather" },
        { icon: "🌾", color: "purple", name: "उत्पन्न अंदाज", sub: "पीक उत्पन्न अंदाज", route: "/yield" },
        { icon: "🛡️", color: "teal",   name: "सरकारी योजना",     sub: "शेती सबसिडी", route: "/schemes" },
        { icon: "💡", color: "rose",   name: "शेतीच्या टिपा",     sub: "उत्तम पद्धती", route: "/chat" },
      ],
      activities: [
        { icon: "🔬", bg: "#e8f5e9", name: "पीक स्कॅन पूर्ण",    time: "2 तासांपूर्वी" },
        { icon: "🌤️", bg: "#eff6ff", name: "हवामान अद्यतन",        time: "4 तासांपूर्वी" },
        { icon: "📊", bg: "#fffbeb", name: "बाजार किंमती तपासल्या",  time: "काल" },
      ],
      navItems: [
        { id: "home",    icon: "🏠", label: "होम", route: "/dashboard" },
        { id: "scan",    icon: "🔬", label: "स्कॅन", route: "/disease" },
        { id: "market",  icon: "📈", label: "बाजार", route: "/market" },
        { id: "weather", icon: "⛅", label: "हवामान", route: "/weather" },
        { id: "profile", icon: "👤", label: "प्रोफाइल", route: "/profile" },
      ],
      sectionTitles: {
        insights: "आजची पीक माहिती",
        services: "त्वरित सेवा",
        activity: "अलीकडील शेती क्रियाकलाप",
        tip: "आजचा शेती टिप",
      },
      weather: {
        temp: "31°C",
        desc: "अंशाने ढगाळ",
        humidity: "64%",
        wind: "12 km/h",
        feelsLike: "35°C",
        advisoryTitle: "आजचा शेती सल्ला",
        advisoryText: "अलीकडील पावसानंतर पानांवर पिवळे डागांसाठी तपासणी करा. प्रारंभिक शोध मदत करते!",
      },
      stats: {
        totalScans: "156",
        accuracy: "94.2%",
        lastDetection: "अर्ली ब्लाइट",
        irrigation: "अनुकूल",
      },
      insights: {
        cropHealth: "पीक आरोग्य",
        irrigation: "सिंचन",
        cropHealthVal: "84%",
        irrigationVal: "छान",
      },
      tip: "बाष्पोत्पत्ती कम करण्यासाठी आणि चांगले शोषण सुनिश्चित करण्यासाठी सकाळी लवकर (6-8 वाजता) तुमच्या पिकांना पाणी द्या. यामुळे 30% पर्यंत पाणी वाचवता येते!",
    },
  };

  const tData = translations[language] || translations.en;

  return (
    <div className="app">
      {/* ── TOP NAV ── */}
      <nav className="top-nav">
        <div className="hamburger" aria-label="Menu">
          <span /><span />
        </div>
        <div className="nav-brand">
          <span className="nav-brand-name">AgriFuture</span>
          <span className="nav-brand-sub">Smart Agriculture Platform</span>
        </div>
        <button className="bell-btn" aria-label="Notifications">
          🔔
          <span className="bell-dot" />
        </button>
      </nav>

      {/* ── SCROLL CONTENT ── */}
      <div className="scroll-content">

        {/* HEADER */}
        <div className="header-section">
          <div className="greeting-row">
            <span className="greeting">{getGreeting()}</span>
          </div>
          <div className="username">chetnya</div>
          <div className="meta-row">
            <span className="meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {currentTime.toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Jalgaon, Maharashtra
            </span>
          </div>
        </div>

        {/* WEATHER CARD */}
        <div className="weather-card">
          <div className="weather-main">
            <span className="weather-icon">⛅</span>
            <div>
              <div className="weather-temp">{tData.weather.temp}</div>
              <div className="weather-desc">{tData.weather.desc}</div>
            </div>
          </div>
          <div className="weather-stats">
            <div className="weather-stat">
              <div className="weather-stat-val">{tData.weather.humidity}</div>
              <div className="weather-stat-lbl">Humidity</div>
            </div>
            <div className="weather-stat">
              <div className="weather-stat-val">{tData.weather.wind}</div>
              <div className="weather-stat-lbl">Wind</div>
            </div>
            <div className="weather-stat">
              <div className="weather-stat-val">{tData.weather.feelsLike}</div>
              <div className="weather-stat-lbl">Feels Like</div>
            </div>
          </div>
          <div className="weather-advisory">
            <span className="advisory-icon">⚠️</span>
            <div>
              <div className="advisory-title">{tData.weather.advisoryTitle}</div>
              <div className="advisory-text">{tData.weather.advisoryText}</div>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon green">🔬</div>
            <div>
              <div className="stat-val">{tData.stats.totalScans}</div>
              <div className="stat-lbl">Total Scans</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">🎯</div>
            <div>
              <div className="stat-val">{tData.stats.accuracy}</div>
              <div className="stat-lbl">Accuracy</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber">⚠️</div>
            <div>
              <div className="stat-val stat-val--sm">{tData.stats.lastDetection}</div>
              <div className="stat-lbl">Last Detection</div>
              <span className="stat-badge amber">Alert</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">💧</div>
            <div>
              <div className="stat-val">{tData.stats.irrigation}</div>
              <div className="stat-lbl">Irrigation</div>
              <span className="stat-badge green">Good</span>
            </div>
          </div>
        </div>

        {/* FARM INSIGHTS */}
        <div className="insights-section">
          <div className="section-title">{tData.sectionTitles.insights}</div>
          <div className="insights-row">
            <div className="insight-card">
              <div className="insight-icon">🌱</div>
              <div className="insight-lbl">{tData.insights.cropHealth}</div>
              <div className="insight-val">{tData.insights.cropHealthVal}</div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">💧</div>
              <div className="insight-lbl">{tData.insights.irrigation}</div>
              <div className="insight-val insight-val--md">{tData.insights.irrigationVal}</div>
            </div>
          </div>
        </div>

        {/* QUICK SERVICES */}
        <div className="services-section">
          <div className="section-title">{tData.sectionTitles.services}</div>
          <div className="services-grid">
            {tData.services.map((s) => (
              <div className="service-card" key={s.name} onClick={() => navigate(s.route)}>
                <div className={`service-icon-wrap ${s.color}`}>{s.icon}</div>
                <div className="service-bottom">
                  <div>
                    <div className="service-name">{s.name}</div>
                    <div className="service-sub">{s.sub}</div>
                  </div>
                  <span className="service-arrow">›</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="activity-section">
          <div className="section-title">{tData.sectionTitles.activity}</div>
          <div className="activity-list">
            {tData.activities.map((a) => (
              <div className="activity-item" key={a.name}>
                <div className="activity-icon" style={{ background: a.bg }}>
                  {a.icon}
                </div>
                <div className="activity-info">
                  <div className="activity-name">{a.name}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
                <span className="activity-chevron">›</span>
              </div>
            ))}
          </div>
        </div>

        {/* FARMING TIP */}
        <div className="tip-section">
          <div className="tip-card">
            <div className="tip-header">
              <span>⚡</span> {tData.sectionTitles.tip}
            </div>
            <div className="tip-text">{tData.tip}</div>
          </div>
        </div>

      </div>{/* end scroll-content */}

      {/* ── FAB ── */}
      <button className="fab" aria-label="Voice">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"
                fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="19" x2="12" y2="23"
                stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="8" y1="23" x2="16" y2="23"
                stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* ── BOTTOM NAV ── */}
      <nav className="bottom-nav">
        {tData.navItems.map((n) => (
          <div
            key={n.id}
            className={`nav-item${activeNav === n.id ? " active" : ""}`}
            onClick={() => {
              setActiveNav(n.id);
              navigate(n.route);
            }}
          >
            <div className="nav-item-icon">{n.icon}</div>
            <span className="nav-item-lbl">{n.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}`;

fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'Dashboard.jsx'), newContent, 'utf8');
console.log('✅ Dashboard.jsx updated successfully!');
