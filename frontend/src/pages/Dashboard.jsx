import { useNavigate } from "react-router-dom";
import {
  Thermometer,
  Droplets,
  Leaf,
  Bot,
  ChevronRight
} from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import scanIcon from "../icon/scan.png";
import marketpriceIcon from "../icon/marketprice.png";
import weatherIcon from "../icon/weather.png";
import yieldIcon from "../icon/yieldpp.png";
import schemeIcon from "../icon/schem.png";
import { adviceApi } from "../services/adviceService";
import { weatherApi } from "../services/apiService";
import locationService from "../services/locationService";
import { useCallback, useEffect, useState } from "react";
import "./Dashboard.css";
// Android-first: 6 quick actions in a balanced 2-column × 3-row grid
// Row 1: Scan Crop, Market Price
// Row 2: Weather, Yield Prediction
// Row 3: Government Schemes, AI Assistant
const quickServices = [
  {
    icon: scanIcon,
    bg: "#DEF7E0",
    nameKey: "dashboard.scanCrop",
    name: "",
    subKey: "dashboard.scanCropSub",
    sub: "",
    path: "/disease"
  },
  {
    icon: marketpriceIcon,
    bg: "#DBEAFE",
    nameKey: "dashboard.marketPriceQuick",
    name: "",
    subKey: "dashboard.marketPriceQuickSub",
    sub: "",
    path: "/market"
  },
  {
    icon: weatherIcon,
    bg: "#DBF4FF",
    nameKey: "dashboard.weatherQuick",
    name: "",
    subKey: "dashboard.weatherQuickSub",
    sub: "",
    path: "/weather"
  },
  {
    icon: yieldIcon,
    bg: "#FEF9C3",
    nameKey: "dashboard.yieldPredictionQuick",
    name: "",
    subKey: "dashboard.yieldPredictionQuickSub",
    sub: "",
    path: "/yield"
  },
  {
    icon: schemeIcon,
    bg: "#EDE9FE",
    nameKey: "dashboard.govtSchemesQuick",
    name: "",
    subKey: "dashboard.govtSchemesQuickSub",
    sub: "",
    path: "/schemes"
  },
  {
    icon: Bot,
    bg: "#F3E8FF",
    nameKey: "dashboard.aiAssistantQuick",
    name: "",
    subKey: "dashboard.aiAssistantQuickSub",
    sub: "",
    path: "/ai"
  }
];

const getWeatherData = (response) => response?.data || response || null;

const getRainChance = (weatherData) => {
  const forecast = weatherData?.daily_forecast || weatherData?.forecast || [];
  const firstForecast = Array.isArray(forecast) ? forecast[0] : null;
  const value =
    firstForecast?.precip_prob ??
    firstForecast?.precipitation_probability_max ??
    weatherData?.rainChance ??
    weatherData?.rain_chance;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.round(numericValue) : null;
};

const getTemperature = (weatherData) => {
  const numericValue = Number(weatherData?.temperature);
  return Number.isFinite(numericValue) ? Math.round(numericValue) : null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, translate, i18n, availableLanguages } = useTranslation();
  const language = i18n?.language || availableLanguages?.[0]?.code || "en";
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);
  const farmerName = userData?.name || localStorage.getItem("userName") || null;
  const farmerLocation = userData?.location || localStorage.getItem("userLocation") || null;
  const hasGreeting = !!farmerName; // Show greeting if we have a name, even without location

  const advisoryItems = [
    {
      title: t('dashboard.weatherAdvisory'),
      text: t('dashboard.weatherAdvisoryText')
    },
    {
      title: t('dashboard.irrigationAdvisory'),
      text: t('dashboard.irrigationAdvisoryText')
    },
    {
      title: t('dashboard.pestAdvisory'),
      text: t('dashboard.pestAdvisoryText')
    },
    {
      title: t('dashboard.marketAdvisory'),
      text: t('dashboard.marketAdvisoryText')
    }
  ];

  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState(false);
  const [dashboardWeather, setDashboardWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);

  const fetchAdvice = useCallback(async () => {
    setAdviceLoading(true);
    setAdviceError(false);
    try {
      const params = {
        city: farmerLocation || undefined,
        crop: userData?.crop || userData?.favoriteCrop || "wheat",
        language: language || "en"
      };

      const response = await adviceApi.getAdvice(params);
      console.log("AI advice service returned:", response);

      const rawAdvice =
        Array.isArray(response)
          ? response
          : response?.advice || response?.data || [];

      const normalizedAdvice = Array.isArray(rawAdvice)
        ? rawAdvice
        : [String(rawAdvice).trim()];

      const filteredAdvice = normalizedAdvice.filter(
        (item) => typeof item === "string" && item.trim().length > 0
      );

      if (filteredAdvice.length === 0) {
        throw new Error("AI advice payload missing or empty");
      }

      console.log("AI advice rendered:", filteredAdvice);
    } catch (error) {
      console.error("Unable to generate AI advice", error);
      setAdviceError(true);
    } finally {
      setAdviceLoading(false);
    }
  }, [farmerLocation, userData?.crop, userData?.favoriteCrop, language]);

  useEffect(() => {
    fetchAdvice();
  }, [fetchAdvice]);

  const fetchDashboardWeather = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError(false);

    try {
      let coords = null;

      try {
        const location = await locationService.getCurrentPosition();
        coords = {
          lat: location.latitude,
          lon: location.longitude
        };
      } catch {
        coords = null;
      }

      const response = coords
        ? await weatherApi.getWeatherByLocation(coords.lat, coords.lon, language)
        : await weatherApi.getWeather(farmerLocation || "Jalgaon", language);

      const nextWeather = getWeatherData(response);
      if (!nextWeather) {
        throw new Error("Weather payload missing");
      }

      setDashboardWeather(nextWeather);
    } catch (error) {
      console.error("Unable to load dashboard weather", error);
      setWeatherError(true);
    } finally {
      setWeatherLoading(false);
    }
  }, [farmerLocation, language]);

  useEffect(() => {
    fetchDashboardWeather();
  }, [fetchDashboardWeather]);

  const temperature = getTemperature(dashboardWeather);
  const rainChance = getRainChance(dashboardWeather);

  const todaySnapshot = [
    {
      icon: Thermometer,
      labelKey: "dashboard.weatherToday",
      value: temperature !== null ? `${temperature}°C` : weatherLoading ? "..." : "--",
      color: "#0B5ED7",
      cardBg: "#E3F2FD"
    },
    {
      icon: Droplets,
      labelKey: "dashboard.rainChance",
      value: rainChance !== null ? `${rainChance}%` : weatherLoading ? "..." : weatherError ? "--" : "0%",
      color: "#0B5ED7",
      cardBg: "#D8EEFF"
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* One-line Greeting */}
        <h1 className="dashboard-greeting">
          {hasGreeting
            ? translate('dashboard.greeting', 'Welcome {name}', { name: farmerName })
            : t('dashboard.greetingFallback', 'Welcome')
          }
        </h1>
        {/* Farm Status (Snapshot) */}
        <section className="status-section">
          <div className="status-summary-card">
            <div className="status-summary-header">
              <span>{t('dashboard.weatherUpdate', '🌦️ Weather Update')}</span>
            </div>
            <div className="status-summary-row">
              {todaySnapshot.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="status-summary-item"
                    style={{ backgroundColor: item.cardBg || 'rgba(255,255,255,0.16)' }}
                  >
                    <div className="status-summary-icon" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
                      <Icon size={24} color={item.color || '#0B5ED7'} />
                    </div>
                    <div className="status-summary-values">
                      <span className="status-summary-value">{item.value}</span>
                      <span className="status-summary-label">{t(item.labelKey)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        {/* AI Advisory */}
        <section className="ai-advisory-card">
          <div className="advisory-header">
            <div className="advisory-icon">
              <Leaf size={48} color="#FFFFFF" />
            </div>
            <div className="advisory-title-section">
              <span className="advisory-title">{t('dashboard.aiAdviceTitle')}</span>
              <div className="advisory-badges">
                <span className="advisory-badge">{t('dashboard.smartAdvisoryBadge')}</span>
                <span className="advisory-secondary-badge">{t('dashboard.farmerAdvisoryBadge')}</span>
              </div>
            </div>
          </div>
          <div className="advisory-content">
            {adviceLoading ? (
              <p className="advisory-main-text">{t('dashboard.loadingAdvisoryText')}</p>
            ) : adviceError ? (
              <p className="advisory-main-text">{t('dashboard.advisoryErrorText')}</p>
            ) : (
              <ul className="advisory-list">
                {advisoryItems.map((item, idx) => (
                  <li key={idx}>
                    <span className="advisory-list-heading">{item.title}</span> {item.text}
                  </li>
                ))}
              </ul>
            )}
            <div className="advisory-actions">
              <button className="advisory-button" onClick={fetchAdvice}>
                {t('dashboard.refreshAdvice')}
              </button>
              <button className="advisory-button" onClick={() => navigate("/farm-advisory") }>
                {t('dashboard.viewDetails')}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
        {/* Quick Actions */}
        <section className="quick-actions-section">
          <h2 className="section-title">{t('dashboard.quickActions')}</h2>
          <div className="quick-actions-grid">
            {quickServices.map((service, idx) => (
              <button
                className="quick-action-card"
                key={idx}
                type="button"
                onClick={() => navigate(service.path)}
              >
                <div className="quick-action-icon" style={{ backgroundColor: service.bg }}>
                  {typeof service.icon === 'string' ? (
                    <img src={service.icon} alt="" />
                  ) : (
                    <service.icon size={56} color="#1F2937" />
                  )}
                </div>
                <div className="quick-action-text">
                  <strong className="quick-action-title">{t(service.nameKey)}</strong>
                  <span className="quick-action-subtitle">{t(service.subKey)}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
