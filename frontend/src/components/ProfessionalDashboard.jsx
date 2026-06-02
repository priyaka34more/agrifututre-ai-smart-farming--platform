import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  TrendingUp, 
  Users, 
  Activity, 
  AlertTriangle, 
  RefreshCw,
  Droplets,
  Wind,
  Eye,
  BarChart3,
  Calendar,
  MapPin,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import '../styles/theme.css';

const ProfessionalDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [stats, setStats] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch weather data
      const weatherResponse = await fetch('/api/weather/current');
      const weather = await weatherResponse.json();
      setWeatherData(weather);

      // Fetch market data
      const marketResponse = await fetch('/api/market/summary');
      const market = await marketResponse.json();
      setMarketData(market);

      // Fetch stats
      const statsResponse = await fetch('/api/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUp size={16} className="text-green-600" />;
    if (trend === 'down') return <ArrowDown size={16} className="text-red-600" />;
    return <Minus size={16} className="text-gray-500" />;
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  if (loading && !weatherData) {
    return (
      <div className="app-container">
        <div className="container">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="spinner mb-4"></div>
              <p className="text-gray-600">Loading Dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Professional Header */}
      <header className="nav">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🌱</span>
            </div>
            AgriFuture AI
          </div>
          
          <div className="nav-menu">
            <button className="btn btn-ghost" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={14} />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
          <p className="text-gray-600">Monitor your agricultural insights and market trends</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users size={24} className="text-green-600" />
                </div>
                <span className="status-indicator status-success">Active</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats?.totalUsers || '12,458'}
              </div>
              <div className="text-sm text-gray-600">Total Farmers</div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <ArrowUp size={14} />
                <span>+12% this month</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity size={24} className="text-blue-600" />
                </div>
                <span className="status-indicator status-info">Live</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats?.totalScans || '3,847'}
              </div>
              <div className="text-sm text-gray-600">Disease Scans</div>
              <div className="flex items-center gap-1 mt-2 text-sm text-blue-600">
                <ArrowUp size={14} />
                <span>+8% today</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 size={24} className="text-purple-600" />
                </div>
                <span className="status-indicator status-warning">Alert</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {marketData?.avgConfidence || '94.2%'}
              </div>
              <div className="text-sm text-gray-600">AI Accuracy</div>
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                <Minus size={14} />
                <span>Stable</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp size={24} className="text-orange-600" />
                </div>
                <span className="status-indicator status-success">Good</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {marketData?.activeMarkets || '8'}
              </div>
              <div className="text-sm text-gray-600">Active Markets</div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <ArrowUp size={14} />
                <span>+2 new</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weather and Market Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weather Card */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Weather Conditions</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} />
                  {weatherData?.location || 'Your Location'}
                </div>
              </div>
            </div>
            <div className="card-body">
              {weatherData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                        <Cloud size={32} className="text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-900">
                          {weatherData.temperature || '28°C'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {weatherData.condition || 'Partly Cloudy'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Humidity</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {weatherData.humidity || '65%'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2">
                        <Droplets size={16} className="text-blue-600" />
                      </div>
                      <div className="text-xs text-gray-500">Rainfall</div>
                      <div className="text-sm font-semibold">{weatherData.rainfall || '2.1mm'}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2">
                        <Wind size={16} className="text-green-600" />
                      </div>
                      <div className="text-xs text-gray-500">Wind</div>
                      <div className="text-sm font-semibold">{weatherData.windSpeed || '12km/h'}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-2">
                        <Eye size={16} className="text-orange-600" />
                      </div>
                      <div className="text-xs text-gray-500">Visibility</div>
                      <div className="text-sm font-semibold">{weatherData.visibility || '10km'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="skeleton skeleton-avatar mx-auto mb-4"></div>
                  <div className="skeleton skeleton-text mx-auto mb-2"></div>
                  <div className="skeleton skeleton-text-lg mx-auto"></div>
                </div>
              )}
            </div>
          </div>

          {/* Market Trends Card */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Market Trends</h2>
                <button className="btn btn-ghost btn-sm">View All</button>
              </div>
            </div>
            <div className="card-body">
              {marketData ? (
                <div className="space-y-4">
                  {[
                    { crop: 'Wheat', price: '₹2,450', trend: 'up', change: '+5.2%' },
                    { crop: 'Rice', price: '₹3,200', trend: 'up', change: '+3.1%' },
                    { crop: 'Cotton', price: '₹5,800', trend: 'down', change: '-2.3%' },
                    { crop: 'Soybean', price: '₹4,100', trend: 'up', change: '+1.8%' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <BarChart3 size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.crop}</div>
                          <div className="text-sm text-gray-500">per quintal</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{item.price}</div>
                        <div className={`flex items-center gap-1 text-sm ${getTrendColor(item.trend)}`}>
                          {getTrendIcon(item.trend)}
                          <span>{item.change}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="skeleton skeleton-avatar"></div>
                        <div>
                          <div className="skeleton skeleton-text w-20"></div>
                          <div className="skeleton skeleton-text w-16"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="skeleton skeleton-text w-16"></div>
                        <div className="skeleton skeleton-text w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Cloud size={20} />, label: 'Weather Check', color: 'blue' },
                { icon: <Activity size={20} />, label: 'Disease Scan', color: 'green' },
                { icon: <TrendingUp size={20} />, label: 'Market Prices', color: 'purple' },
                { icon: <AlertTriangle size={20} />, label: 'Alerts', color: 'orange' }
              ].map((action, index) => (
                <button key={index} className="btn btn-ghost flex-col h-20">
                  <div className={`w-12 h-12 bg-${action.color}-100 rounded-lg flex items-center justify-center mb-2 text-${action.color}-600`}>
                    {action.icon}
                  </div>
                  <span className="text-xs text-gray-600">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfessionalDashboard;
