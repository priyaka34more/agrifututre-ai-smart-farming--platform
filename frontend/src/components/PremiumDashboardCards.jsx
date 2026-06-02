import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, TrendingUp, Droplets, Brain, Activity, 
  Wind, AlertTriangle, CheckCircle
} from 'lucide-react';
import dataReliabilityService from '../services/dataReliabilityService';
import '../styles/premium-theme.css';

// 🌿 Premium Dashboard Cards Component
const PremiumDashboardCards = () => {
  const [data, setData] = useState({
    weather: null,
    market: null,
    ai: null,
    stats: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cardRefs = useRef([]);

  // 🌿 Load dashboard data
  useEffect(() => {
    loadDashboardData();
    
    // Set up intersection observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // 🌿 Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dashboardData = await dataReliabilityService.getAllReliableData();
      setData(dashboardData);
    } catch (err) {
      setError(err.message);
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🌿 Refresh data
  const refreshData = async () => {
    await loadDashboardData();
  };

  // 🌿 Weather Card
  const WeatherCard = ({ weather }) => {
    if (!weather) return null;

    return (
      <div 
        ref={(el) => (cardRefs.current[0] = el)}
        className="weather-gradient-card scroll-glow-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white/90">Weather</h3>
            <p className="text-sm text-white/70">{weather.city}</p>
          </div>
          <Cloud size={32} className="text-white/80" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-white">{weather.temperature}°C</div>
              <div className="text-sm text-white/80 capitalize">{weather.description}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70">Feels like</div>
              <div className="text-lg font-semibold text-white">{weather.feelsLike}°C</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Droplets size={16} className="text-white/70" />
              <span className="text-white/80">Humidity: {weather.humidity}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wind size={16} className="text-white/70" />
              <span className="text-white/80">Wind: {weather.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        {weather.isFallback && (
          <div className="mt-3 p-2 bg-white/10 rounded-lg">
            <p className="text-xs text-white/70">Using offline data</p>
          </div>
        )}
      </div>
    );
  };

  // 🌿 Market Card
  const MarketCard = ({ market }) => {
    if (!market) return null;

    return (
      <div 
        ref={(el) => (cardRefs.current[1] = el)}
        className="market-gradient-card scroll-glow-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white/90">Market Prices</h3>
            <p className="text-sm text-white/70">Average: ₹{market.averagePrice}</p>
          </div>
          <TrendingUp size={32} className="text-white/80" />
        </div>
        
        <div className="space-y-3">
          {market.crops.slice(0, 3).map((crop, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
              <div>
                <div className="text-white font-medium">{crop.name}</div>
                <div className="text-sm text-white/70">₹{crop.currentPrice}/{crop.unit}</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  crop.trend === 'up' ? 'text-green-300' : 
                  crop.trend === 'down' ? 'text-red-300' : 
                  'text-white/80'
                }`}>
                  {crop.trend === 'up' ? '↑' : crop.trend === 'down' ? '↓' : '→'} {Math.abs(crop.change)}%
                </div>
                <div className="text-xs text-white/60">
                  ₹{crop.priceRange.min}-{crop.priceRange.max}
                </div>
              </div>
            </div>
          ))}
        </div>

        {market.isFallback && (
          <div className="mt-3 p-2 bg-white/10 rounded-lg">
            <p className="text-xs text-white/70">Using average price data</p>
          </div>
        )}
      </div>
    );
  };

  // 🌿 AI Card
  const AICard = ({ ai }) => {
    if (!ai) return null;

    return (
      <div 
        ref={(el) => (cardRefs.current[2] = el)}
        className="ai-gradient-card scroll-glow-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white/90">AI Insights</h3>
            <p className="text-sm text-white/70">Smart recommendations</p>
          </div>
          <Brain size={32} className="text-white/80" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              ai.diseaseRisk.level === 'low' ? 'bg-green-300' :
              ai.diseaseRisk.level === 'medium' ? 'bg-yellow-300' :
              'bg-red-300'
            }`}></div>
            <span className="text-white/80 text-sm">
              Disease Risk: {ai.diseaseRisk.level} ({ai.diseaseRisk.risk}%)
            </span>
          </div>
          
          {ai.suggestions.slice(0, 2).map((suggestion, index) => (
            <div key={index} className="p-2 bg-white/10 rounded-lg">
              <div className="text-white text-sm">{suggestion.message}</div>
            </div>
          ))}
        </div>

        {ai.isFallback && (
          <div className="mt-3 p-2 bg-white/10 rounded-lg">
            <p className="text-xs text-white/70">Using general recommendations</p>
          </div>
        )}
      </div>
    );
  };

  // 🌿 Stats Card
  const StatsCard = ({ stats }) => {
    if (!stats) return null;

    return (
      <div 
        ref={(el) => (cardRefs.current[3] = el)}
        className="premium-glass-card scroll-glow-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Statistics</h3>
            <p className="text-sm text-gray-600 dark:text-white/70">Your farm data</p>
          </div>
          <Activity size={32} className="text-green-600 dark:text-green-400" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.totalScans}
            </div>
            <div className="text-sm text-gray-600 dark:text-white/70">Total Scans</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.accuracy}%
            </div>
            <div className="text-sm text-gray-600 dark:text-white/70">Accuracy</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-800 dark:text-green-200">
              Last: {stats.lastDetection.disease}
            </span>
          </div>
        </div>

        {stats.isFallback && (
          <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">Using sample data</p>
          </div>
        )}
      </div>
    );
  };

  // 🌿 Loading State
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="premium-glass-card p-6">
            <div className="skeleton skeleton-card h-32 mb-4"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text small"></div>
          </div>
        ))}
      </div>
    );
  }

  // 🌿 Error State
  if (error) {
    return (
      <div className="premium-glass-card p-8 text-center">
        <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Something went wrong
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={refreshData}
          className="premium-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <WeatherCard weather={data.weather} />
        <MarketCard market={data.market} />
        <AICard ai={data.ai} />
        <StatsCard stats={data.stats} />
      </div>

      {/* Data Status */}
      {data.hasFallbackData && (
        <div className="premium-glass-card p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={16} className="text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Some data is using offline fallback. Check your internet connection.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumDashboardCards;
