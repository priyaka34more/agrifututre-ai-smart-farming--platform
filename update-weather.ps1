
$weatherJsx = @'
import React, { useMemo, useState, useEffect } from "react";
import {
  CheckCircle2,
  CloudRain,
  CloudSun,
  Droplets,
  Leaf,
  MapPin,
  SprayCan,
  Wind,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { weatherApi } from "../services/apiService";
import "./Weather.css";

const defaultWeather = {
  temperature: 31,
  humidity: 64,
  wind_speed: 12,
  condition: "Partly Cloudy",
  city: "Jalgaon, Maharashtra",
  rainChance: 40,
  advice: [
    {
      title: "Irrigate in morning",
      explanation: "Soil moisture is expected to drop after noon.",
    },
    {
      title: "Avoid pesticide spraying",
      explanation: "Wind speed may affect spray efficiency.",
    },
    {
      title: "Inspect lower leaves",
      explanation: "Humidity may increase disease risk.",
    },
  ],
  forecast: [
    { day: "Mon", temp: 31, rain: 20 },
    { day: "Tue", temp: 29, rain: 60 },
    { day: "Wed", temp: 30, rain: 30 },
    { day: "Thu", temp: 32, rain: 10 },
    { day: "Fri", temp: 30, rain: 40 },
    { day: "Sat", temp: 28, rain: 50 },
    { day: "Sun", temp: 31, rain: 25 },
  ],
};

function calculateFarmWeather(data) {
  const temp = Number(data.temperature || 30);
  const humidity = Number(data.humidity || 60);
  const rain = Number(data.rainChance || 40);

  const rainRisk = rain > 50 ? "High" : rain > 30 ? "Moderate" : "Low";
  const irrigation = temp > 33 && humidity < 55 ? "High" : humidity > 78 || rain > 50 ? "Low" : "Moderate";
  const disease = humidity > 76 && temp > 24 ? "Moderate" : humidity > 66 ? "Low" : "Low";

  return { rainRisk, irrigation, disease };
}

const getStatusColor = (status) => {
  if (status === "High") return "#DC2626";
  if (status === "Moderate") return "#F59E0B";
  return "#2E7D32";
};

function Weather() {
  const [userData, setUserData] = useState(null);
  const [weather] = useState(defaultWeather);
  
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);
  
  const city =
    userData?.location ||
    localStorage.getItem("userLocation") ||
    "Jalgaon, Maharashtra";

  const metrics = useMemo(() => calculateFarmWeather(weather), [weather]);

  const chartData = useMemo(() => {
    return weather.forecast.map((item) => ({
      name: item.day,
      temp: item.temp,
    }));
  }, [weather.forecast]);

  const summaryData = useMemo(() => {
    const temps = weather.forecast.map((item) => item.temp);
    const highest = Math.max(...temps);
    const lowest = Math.min(...temps);
    const rainyDays = weather.forecast.filter((item) => item.rain > 30).length;
    return { highest, lowest, rainyDays };
  }, [weather.forecast]);

  return (
    <div className="weather-page">
      <div className="weather-container">
        {/* Current Weather Card */}
        <section className="current-weather-card">
          <div className="current-weather-top">
            <div className="current-weather-icon">
              <CloudSun size={40} color="#1B7F4A" />
            </div>
            <div className="current-weather-main">
              <div className="current-weather-temp">{weather.temperature}°C</div>
              <div className="current-weather-condition">{weather.condition}</div>
            </div>
          </div>
          <div className="current-weather-location">
            <MapPin size={16} color="#64748B" />
            <span>{city}</span>
          </div>
          <div className="current-weather-metrics">
            <div className="current-weather-metric">
              <Droplets size={18} color="#0066CC" />
              <span className="current-weather-metric-value">{weather.humidity}%</span>
              <span className="current-weather-metric-label">Humidity</span>
            </div>
            <div className="current-weather-metric">
              <Wind size={18} color="#D97706" />
              <span className="current-weather-metric-value">{weather.wind_speed} km/h</span>
              <span className="current-weather-metric-label">Wind</span>
            </div>
            <div className="current-weather-metric">
              <CloudRain size={18} color="#7C3AED" />
              <span className="current-weather-metric-value">{weather.rainChance}%</span>
              <span className="current-weather-metric-label">Rain Chance</span>
            </div>
          </div>
        </section>

        {/* Farm Weather Status */}
        <section className="risk-summary-card">
          <h2 className="risk-summary-title">Farm Weather Status</h2>
          <div className="risk-summary-grid">
            <div className="risk-summary-item">
              <div className="risk-summary-icon" style={{ backgroundColor: "#E8F7FF" }}>
                <CloudRain size={24} color="#0066CC" />
              </div>
              <span className="risk-summary-label">Rain Risk</span>
              <span
                className="risk-summary-value"
                style={{ color: getStatusColor(metrics.rainRisk) }}
              >
                {metrics.rainRisk === "Low" && "🟢 Low"}
                {metrics.rainRisk === "Moderate" && "🟡 Moderate"}
                {metrics.rainRisk === "High" && "🔴 High"}
              </span>
            </div>
            <div className="risk-summary-item">
              <div className="risk-summary-icon" style={{ backgroundColor: "#FFF4E6" }}>
                <Droplets size={24} color="#D97706" />
              </div>
              <span className="risk-summary-label">Irrigation</span>
              <span
                className="risk-summary-value"
                style={{ color: getStatusColor(metrics.irrigation) }}
              >
                {metrics.irrigation === "Low" && "🟢 Low"}
                {metrics.irrigation === "Moderate" && "🟡 Moderate"}
                {metrics.irrigation === "High" && "🔴 High"}
              </span>
            </div>
            <div className="risk-summary-item">
              <div className="risk-summary-icon" style={{ backgroundColor: "#EAF7EF" }}>
                <Leaf size={24} color="#1B7F4A" />
              </div>
              <span className="risk-summary-label">Disease Risk</span>
              <span
                className="risk-summary-value"
                style={{ color: getStatusColor(metrics.disease) }}
              >
                {metrics.disease === "Low" && "🟢 Low"}
                {metrics.disease === "Moderate" && "🟡 Moderate"}
                {metrics.disease === "High" && "🔴 High"}
              </span>
            </div>
          </div>
        </section>

        {/* Today's Farm Guidance */}
        <section className="ai-advice-card">
          <div className="ai-advice-header">
            <div className="ai-advice-icon">
              <SprayCan size={26} color="#FFFFFF" />
            </div>
            <div className="ai-advice-title">Today's Farm Guidance</div>
          </div>
          <div className="ai-advice-list">
            {weather.advice.map((item, idx) => (
              <div key={idx} className="ai-advice-item">
                <div className="ai-advice-item-content">
                  <div className="ai-advice-item-title">
                    <CheckCircle2 size={18} color="#1B7F4A" />
                    <span>{item.title}</span>
                  </div>
                  <p className="ai-advice-item-explanation">{item.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7-Day Weather Outlook */}
        <section className="forecast-card">
          <div className="forecast-header">
            <h2 className="forecast-title">7-Day Weather Outlook</h2>
            <p className="forecast-subtitle">Weekly weather outlook</p>
          </div>
          <div className="forecast-chart">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(27,127,74,0.15)" />
                    <stop offset="100%" stopColor="rgba(27,127,74,0)" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#F0F7F4" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748B",
                    fontSize: 13,
                    fontFamily: "Noto Sans, Noto Sans Devanagari, sans-serif",
                  }}
                  dy={10}
                />
                <YAxis
                  domain={["dataMin - 1", "dataMax + 1"]}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748B",
                    fontSize: 12,
                    fontFamily: "Noto Sans, Noto Sans Devanagari, sans-serif",
                  }}
                  tickFormatter={(value) => `${value}°`}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E3ECE6",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    fontFamily: "Noto Sans, Noto Sans Devanagari, sans-serif",
                  }}
                  labelStyle={{ color: "#143D26", fontWeight: "700" }}
                  formatter={(value) => [`${value}°C`, "Temperature"]}
                />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="none"
                  fill="url(#colorTemp)"
                  activeDot={false}
                />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#1B7F4A"
                  strokeWidth={3}
                  dot={{ fill: "#1B7F4A", r: 6, stroke: "#FFFFFF", strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: "#1B7F4A", stroke: "#FFFFFF", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="forecast-summary">
            <div className="forecast-summary-item">
              <span className="forecast-summary-label">Highest</span>
              <span className="forecast-summary-value">{summaryData.highest}°C</span>
            </div>
            <div className="forecast-summary-item">
              <span className="forecast-summary-label">Lowest</span>
              <span className="forecast-summary-value">{summaryData.lowest}°C</span>
            </div>
            <div className="forecast-summary-item">
              <span className="forecast-summary-label">Rain Days</span>
              <span className="forecast-summary-value">{summaryData.rainyDays}</span>
            </div>
          </div>
        </section>

        {/* Farming Recommendations */}
        <section className="recommendations-card">
          <h2 className="recommendations-title">Farming Recommendations</h2>
          <div className="recommendations-grid">
            <div className="recommendation-item">
              <div className="recommendation-icon" style={{ backgroundColor: "#EAF7EF" }}>
                <Droplets size={24} color="#1B7F4A" />
              </div>
              <div className="recommendation-text">
                <div className="recommendation-text-title">💧 Irrigation</div>
                <div className="recommendation-text-action">Water crops early morning.</div>
              </div>
            </div>
            <div className="recommendation-item">
              <div className="recommendation-icon" style={{ backgroundColor: "#FFF4E6" }}>
                <SprayCan size={24} color="#D97706" />
              </div>
              <div className="recommendation-text">
                <div className="recommendation-text-title">🧪 Spraying</div>
                <div className="recommendation-text-action">Avoid spraying during windy hours.</div>
              </div>
            </div>
            <div className="recommendation-item">
              <div className="recommendation-icon" style={{ backgroundColor: "#E8F7FF" }}>
                <Leaf size={24} color="#0066CC" />
              </div>
              <div className="recommendation-text">
                <div className="recommendation-text-title">🦠 Disease Prevention</div>
                <div className="recommendation-text-action">Inspect lower leaves regularly.</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Weather;
'@
Set-Content -Path "d:\agrifutured\frontend\src\pages\Weather.jsx" -Value $weatherJsx -Encoding UTF8
Write-Host "✅ Weather.jsx updated successfully!"

