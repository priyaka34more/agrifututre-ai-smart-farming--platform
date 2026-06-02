import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  CloudRain,
  CloudSun,
  Droplets,
  Leaf,
  MapPin,
  SprayCan,
  Wind,
  Sun,
  Cloud,
  Zap,
  CloudDrizzle,
  Eye
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip
} from "recharts";
import { useLanguage } from "../contexts/LanguageContext";
import "./Weather.css";
import { weatherApi } from "../services/apiService";
import locationService from "../services/locationService";

function calculateFarmWeather(data) {
  const temp = Number(data.temperature || 30);
  const humidity = Number(data.humidity || 60);
  const rain = Number(data.rainChance || 0);

  const rainRisk = rain > 50 ? "High" : rain > 30 ? "Moderate" : "Low";
  const irrigation = temp > 33 && humidity < 55 ? "High" : humidity > 78 || rain > 50 ? "Low" : "Moderate";
  const disease = humidity > 76 && temp > 24 ? "Moderate" : humidity > 66 ? "Low" : "Low";

  return { rainRisk, irrigation, disease };
}

export default function Weather() {
  const { language, t: tWeather } = useLanguage();

  const storedCity = localStorage.getItem("userLocation") || "Jalgaon, Maharashtra";
  const [city] = useState(storedCity);

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refreshRef = useRef(null);

  const REFRESH_MS = 5 * 60 * 1000; // 5 minutes

  const fetchWeather = async () => {
    setLoading(true);
    setError("");
    try {
      let coords = null;
      try {
        const loc = await locationService.getCurrentPosition();
        coords = { lat: loc.latitude, lon: loc.longitude };
      } catch (e) {
        coords = null;
      }

      let res;
      if (coords) {
        res = await weatherApi.getWeatherByLocation(coords.lat, coords.lon, language);
      } else {
        res = await weatherApi.getWeather(city, language);
      }

      if (res && (res.status === "success" || res.status === true) && res.data) {
        setWeather(res.data);
      } else if (res && res.data) {
        setWeather(res.data);
      } else {
        throw new Error(res.message || "Unable to fetch weather");
      }
    } catch (err) {
      console.error("Weather fetch error", err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    refreshRef.current = setInterval(fetchWeather, REFRESH_MS);
    return () => clearInterval(refreshRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const metrics = useMemo(() => {
    if (!weather) return { rainRisk: "Low", irrigation: "Low", disease: "Low" };
    const rc = (weather.daily_forecast && weather.daily_forecast[0] && weather.daily_forecast[0].precip_prob) || 0;
    return calculateFarmWeather({ temperature: weather.temperature, humidity: weather.humidity, rainChance: rc });
  }, [weather]);

  const weatherAdvice = weather && Array.isArray(weather.advice) ? weather.advice : [];

  const weatherConditionLabel = weather && weather.condition ? (weather.condition === "Partly Cloudy" || weather.condition === "Partly cloudy" ? tWeather("weather.partlyCloudy", weather.condition) : weather.condition) : "";

  // Dynamic icon state for smooth transitions
  const [iconVisible, setIconVisible] = useState(true);
  const [iconKey, setIconKey] = useState("");

  // Parse sunrise/sunset time safely
  const parseWeatherTime = (timeStr) => {
    if (!timeStr) return null;
    try {
      // Handle ISO format like "2026-06-02T05:44"
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return null;
    }
  };

  const getWeatherIcon = (cond, size = 32) => {
    const c = (cond || "").toLowerCase();

    // Storm / Lightning
    if (c.includes("thunderstorm") || c.includes("thunder") || c.includes("storm")) {
      return <Zap size={size} color="#1B7F4A" />;
    }

    // Rain variants
    if (c.includes("rain") || c.includes("shower")) {
      return <CloudRain size={size} color="#1B7F4A" />;
    }
    
    if (c.includes("drizzle")) {
      return <CloudDrizzle size={size} color="#1B7F4A" />;
    }

    // Fog / Mist
    if (c.includes("fog") || c.includes("mist")) {
      return <Eye size={size} color="#94A3B8" />;
    }

    // Clear sky
    if (c.includes("clear sky")) {
      return <Sun size={size} color="#F59E0B" />;
    }

    // Partly cloudy
    if (c.includes("partly cloudy")) {
      return <CloudSun size={size} color="#F59E0B" />;
    }

    // Overcast / Cloudy
    if (c.includes("overcast") || c.includes("cloudy") || c.includes("cloud")) {
      return <Cloud size={size} color="#94A3B8" />;
    }

    // Fallback
    return <CloudSun size={size} color="#F59E0B" />;
  };

  // Trigger smooth icon transition when weather changes
  useEffect(() => {
    const key = `${weather?.condition || ""}_${new Date().getHours()}`;
    if (key === iconKey) return;
    setIconVisible(false);
    const t1 = setTimeout(() => {
      setIconKey(key);
      setIconVisible(true);
    }, 220);
    return () => clearTimeout(t1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weather?.condition]);

  // Format forecast for chart display
  const formattedForecast = useMemo(() => {
    if (!weather || !weather.daily_forecast) return [];
    return weather.daily_forecast.slice(0, 7).map((f) => ({
      date: new Date(f.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      temp: f.temp_max || f.temp || null,
      precip_prob: f.precip_prob
    }));
  }, [weather]);

  // Get day of week from date string
  const getDayOfWeek = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { weekday: "short" });
    } catch (e) {
      return "?";
    }
  };

  return (
    <div className="weather-page">
      <div className="weather-container">
        <section className="weather-page-header">
          <div>
            <h1>{tWeather("weather.currentWeather", "Current Weather")}</h1>
            <p>{tWeather("weather.subtitle", "Real-time weather outlook and farm guidance")}</p>
          </div>
        </section>

        <section className="current-weather-card">
          {loading ? (
            <div className="current-weather-loading">{tWeather("common.loading", "Loading...")}</div>
          ) : error ? (
            <div className="current-weather-error">{error}</div>
          ) : (
            <>
              <div className="current-weather-top">
                <div className="current-weather-icon">
                  <div className={`weather-icon ${iconVisible ? 'visible' : 'hidden'}`} key={iconKey}>
                    {getWeatherIcon(weather?.condition)}
                  </div>
                </div>
                <div className="current-weather-main">
                  <div className="current-weather-temp">{weather.temperature}°C</div>
                  <div className="current-weather-condition">{weatherConditionLabel}</div>
                </div>
              </div>

              <div className="current-weather-location">
                <MapPin size={16} color="#64748B" />
                <span>
                  {tWeather("weather.currentLocation", "Current Location")}: {weather.city || city}
                </span>
              </div>

              <div className="current-weather-metrics">
                <div className="current-weather-metric">
                  <Droplets size={18} color="#0066CC" />
                  <span className="current-weather-metric-value">{weather.humidity}%</span>
                  <span className="current-weather-metric-label">{tWeather("weather.humidity", "Humidity")}</span>
                </div>
                <div className="current-weather-metric">
                  <Wind size={18} color="#D97706" />
                  <span className="current-weather-metric-value">{weather.wind_speed} km/h</span>
                  <span className="current-weather-metric-label">{tWeather("weather.windSpeed", "Wind")}</span>
                </div>
                <div className="current-weather-metric">
                  <CloudRain size={18} color="#7C3AED" />
                  <span className="current-weather-metric-value">{(weather.daily_forecast && weather.daily_forecast[0] && weather.daily_forecast[0].precip_prob) || 0}%</span>
                  <span className="current-weather-metric-label">{tWeather("weather.rainChance", "Rain Chance")}</span>
                </div>
              </div>

              <div className="sunrise-sunset-row">
                <div>{tWeather("weather.weatherConditions", "Weather Conditions")} : {weather.condition || tWeather("weather.dataUnavailable", "Data unavailable")}</div>
                <div>{tWeather("weather.sunrise", "Sunrise")} : {parseWeatherTime(weather.sunrise) || tWeather("weather.dataUnavailable", "Data unavailable")}</div>
                <div>{tWeather("weather.sunset", "Sunset")} : {parseWeatherTime(weather.sunset) || tWeather("weather.dataUnavailable", "Data unavailable")}</div>
              </div>
            </>
          )}
        </section>

        <section className="weather-detail-card">
          <div className="weather-detail-row">
            <section className="risk-summary-card">
              <h2 className="risk-summary-title">{tWeather("weather.weatherRiskSummary", "Weather Risk Summary")}</h2>
              <div className="risk-summary-grid">
                <div className="risk-summary-item">
                  <div className="risk-summary-icon" style={{ backgroundColor: "#E8F7FF" }}>
                    <CloudRain size={24} color="#0066CC" />
                  </div>
                  <span className="risk-summary-label">{tWeather("weather.rainRisk", "Rain Risk")}</span>
                  <span className="risk-summary-value">{tWeather(`weather.${metrics.rainRisk.toLowerCase() === 'moderate' ? 'medium' : metrics.rainRisk.toLowerCase()}`, metrics.rainRisk)}</span>
                </div>
                <div className="risk-summary-item">
                  <div className="risk-summary-icon" style={{ backgroundColor: "#FFF4E6" }}>
                    <Droplets size={24} color="#D97706" />
                  </div>
                  <span className="risk-summary-label">{tWeather("weather.irrigationNeed", "Irrigation")}</span>
                  <span className="risk-summary-value">{tWeather(`weather.${metrics.irrigation.toLowerCase() === 'moderate' ? 'medium' : metrics.irrigation.toLowerCase()}`, metrics.irrigation)}</span>
                </div>
                <div className="risk-summary-item">
                  <div className="risk-summary-icon" style={{ backgroundColor: "#EAF7EF" }}>
                    <Leaf size={24} color="#1B7F4A" />
                  </div>
                  <span className="risk-summary-label">{tWeather("weather.diseaseRisk", "Disease Risk")}</span>
                  <span className="risk-summary-value">{tWeather(`weather.${metrics.disease.toLowerCase() === 'moderate' ? 'medium' : metrics.disease.toLowerCase()}`, metrics.disease)}</span>
                </div>
              </div>
            </section>
            <section className="forecast-card">
              <h2 className="forecast-title">{tWeather("weather.forecastTitle", "7-Day Forecast")}</h2>
              {weather && weather.daily_forecast && weather.daily_forecast.length > 0 ? (
                <>
                  {/* 7-Day Forecast Day Cards */}
                  <div className="forecast-days-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                    {weather.daily_forecast.slice(0, 7).map((day, idx) => (
                      <div key={idx} className="forecast-day-card" style={{ 
                        padding: '12px', 
                        border: '1px solid #E3ECE6', 
                        borderRadius: '8px', 
                        textAlign: 'center',
                        backgroundColor: '#F8FAFC'
                      }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                          {getDayOfWeek(day.date)}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                          {getWeatherIcon(weather.condition, 28)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>
                          <div style={{ fontWeight: '600', color: '#1B7F4A' }}>{day.temp_max}°</div>
                          <div>{day.temp_min}°</div>
                        </div>
                        <div style={{ fontSize: '10px', color: '#7C3AED' }}>
                          {day.precip_prob}% 💧
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Temperature Chart - Only show if data exists */}
                  {formattedForecast.length > 0 && (
                    <div className="forecast-chart">
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={formattedForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid stroke="#E3ECE6" strokeDasharray="4 4" vertical={false} />
                          <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 12 }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 12 }}
                            width={24}
                          />
                          <RechartsTooltip
                            contentStyle={{ borderRadius: 14, borderColor: '#E3ECE6' }}
                            labelFormatter={(label) => `Date: ${label}`}
                            formatter={(value) => [`${value}°`, 'Temp']}
                          />
                          <Line
                            type="monotone"
                            dataKey="temp"
                            stroke="#1B7F4A"
                            strokeWidth={3}
                            dot={{ r: 4, stroke: '#1B7F4A', strokeWidth: 2, fill: '#FFFFFF' }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
                  {tWeather("weather.forecastUnavailable", "Forecast unavailable")}
                </div>
              )}
            </section>
          </div>

          <section className="ai-advice-card">
            <div className="ai-advice-header">
              <div className="ai-advice-icon">
                <SprayCan size={26} color="#FFFFFF" />
              </div>
              <div className="ai-advice-title">{tWeather("weather.aiFarmingAdvice", "Today's Farm Guidance")}</div>
            </div>
            <div className="ai-advice-list">
              {Array.isArray(weatherAdvice) && weatherAdvice.length > 0 ? (
                weatherAdvice.map((item, idx) => (
                  <div key={idx} className="ai-advice-item">
                    <div className="ai-advice-item-icon">
                      <CheckCircle2 size={16} color="#1B7F4A" />
                    </div>
                    <div>
                      <div className="ai-advice-item-title">
                        {typeof item === 'string' ? item : (item.title || JSON.stringify(item))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
                  {tWeather("weather.adviceUnavailable", "Farm guidance unavailable")}
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
