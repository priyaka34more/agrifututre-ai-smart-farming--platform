// 🌿 AgriFuture AI Data Reliability Service
// Ensures no blank UI with comprehensive fallback data

class DataReliabilityService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // 🌿 Get cached data or fetch new data with fallback
  async getReliableData(apiCall, fallbackData, cacheKey) {
    try {
      // Check cache first
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      // Try API call
      const data = await apiCall();
      
      // Validate data
      if (this.isValidData(data)) {
        this.setCachedData(cacheKey, data);
        return data;
      } else {
        console.warn('Invalid API data, using fallback');
        return fallbackData;
      }
    } catch (error) {
      console.error('API call failed, using fallback:', error);
      return fallbackData;
    }
  }

  // 🌿 Weather Fallback Data
  getWeatherFallback(city = 'Jalgaon') {
    return {
      city: city,
      temperature: 30,
      feelsLike: 32,
      humidity: 60,
      pressure: 1013,
      windSpeed: 12,
      windDirection: 180,
      visibility: 10,
      uvIndex: 6,
      condition: 'Partly Cloudy',
      description: 'partly cloudy',
      icon: '02d',
      rainfall: {
        current: 0,
        last24h: 2.5
      },
      sunrise: '06:30:00',
      sunset: '18:45:00',
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  }

  // 🌿 Market Fallback Data
  getMarketFallback() {
    return {
      crops: [
        {
          name: 'Wheat',
          currentPrice: 2200,
          priceRange: { min: 2000, max: 2400 },
          unit: 'quintal',
          trend: 'stable',
          change: 0,
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'Rice',
          currentPrice: 3500,
          priceRange: { min: 3200, max: 3800 },
          unit: 'quintal',
          trend: 'up',
          change: 2.5,
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'Cotton',
          currentPrice: 6500,
          priceRange: { min: 6000, max: 7000 },
          unit: 'quintal',
          trend: 'down',
          change: -1.8,
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'Soybean',
          currentPrice: 4200,
          priceRange: { min: 3800, max: 4600 },
          unit: 'quintal',
          trend: 'up',
          change: 3.2,
          lastUpdated: new Date().toISOString()
        }
      ],
      averagePrice: 4100,
      marketStatus: 'active',
      lastUpdated: new Date().toISOString(),
      isFallback: true
    };
  }

  // 🌿 AI Fallback Data
  getAIFallback() {
    return {
      suggestions: [
        {
          type: 'irrigation',
          message: 'Current weather conditions are optimal for irrigation. Water your crops early morning for best results.',
          priority: 'medium',
          action: 'irrigate_early_morning'
        },
        {
          type: 'fertilizer',
          message: 'Consider applying nitrogen-rich fertilizer this week for better crop growth.',
          priority: 'low',
          action: 'apply_fertilizer'
        },
        {
          type: 'pesticide',
          message: 'Monitor for common pests in this weather. Use organic pesticides if needed.',
          priority: 'low',
          action: 'monitor_pests'
        }
      ],
      diseaseRisk: {
        level: 'low',
        risk: 15,
        recommendation: 'Current conditions are favorable. Continue regular monitoring.',
        diseases: []
      },
      yieldPrediction: {
        expected: 'good',
        confidence: 75,
        factors: ['favorable weather', 'soil conditions', 'seasonal patterns']
      },
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  }

  // 🌿 Stats Fallback Data
  getStatsFallback() {
    return {
      totalScans: 156,
      accuracy: 94.2,
      lastDetection: {
        disease: 'Early Blight',
        confidence: 87,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      weeklyScans: [12, 15, 18, 14, 20, 16, 22],
      diseaseBreakdown: {
        'Early Blight': 45,
        'Late Blight': 23,
        'Powdery Mildew': 18,
        'Leaf Spot': 14
      },
      isFallback: true
    };
  }

  // 🌿 User Fallback Data
  getUserFallback() {
    return {
      name: 'Farmer',
      email: 'farmer@agrifuture.ai',
      role: 'user',
      farm: {
        name: 'Demo Farm',
        location: 'Jalgaon',
        size: '5 acres',
        crops: ['Wheat', 'Cotton', 'Vegetables']
      },
      preferences: {
        language: 'en',
        notifications: true,
        theme: 'light'
      },
      isFallback: true
    };
  }

  // 🌿 Validate data structure
  isValidData(data) {
    if (!data || typeof data !== 'object') return false;
    if (data.error) return false;
    if (data.message && data.message.includes('error')) return false;
    return true;
  }

  // 🌿 Cache management
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 🌿 Get reliable weather data
  async getReliableWeather(city = 'Jalgaon') {
    const cacheKey = `weather_${city}`;
    const fallback = this.getWeatherFallback(city);
    
    return this.getReliableData(
      () => this.fetchWeatherFromAPI(city),
      fallback,
      cacheKey
    );
  }

  // 🌿 Get reliable market data
  async getReliableMarket() {
    const cacheKey = 'market_data';
    const fallback = this.getMarketFallback();
    
    return this.getReliableData(
      () => this.fetchMarketFromAPI(),
      fallback,
      cacheKey
    );
  }

  // 🌿 Get reliable AI data
  async getReliableAI(cropType = 'general') {
    const cacheKey = `ai_data_${cropType}`;
    const fallback = this.getAIFallback();
    
    return this.getReliableData(
      () => this.fetchAIFromAPI(cropType),
      fallback,
      cacheKey
    );
  }

  // 🌿 Get reliable stats data
  async getReliableStats(userId = 'default') {
    const cacheKey = `stats_${userId}`;
    const fallback = this.getStatsFallback();
    
    return this.getReliableData(
      () => this.fetchStatsFromAPI(userId),
      fallback,
      cacheKey
    );
  }

  // 🌿 Get reliable user data
  async getReliableUser(userId = 'default') {
    const cacheKey = `user_${userId}`;
    const fallback = this.getUserFallback();
    
    return this.getReliableData(
      () => this.fetchUserFromAPI(userId),
      fallback,
      cacheKey
    );
  }

  // 🌿 Mock API calls (replace with actual API calls)
  async fetchWeatherFromAPI(city) {
    // This would be replaced with actual weather API call
    throw new Error('Weather API not implemented');
  }

  async fetchMarketFromAPI() {
    // This would be replaced with actual market API call
    throw new Error('Market API not implemented');
  }

  async fetchAIFromAPI(cropType) {
    // This would be replaced with actual AI API call
    throw new Error('AI API not implemented');
  }

  async fetchStatsFromAPI(userId) {
    // This would be replaced with actual stats API call
    throw new Error('Stats API not implemented');
  }

  async fetchUserFromAPI(userId) {
    // This would be replaced with actual user API call
    throw new Error('User API not implemented');
  }

  // 🌿 Get all reliable data at once
  async getAllReliableData(options = {}) {
    const {
      city = 'Jalgaon',
      cropType = 'general',
      userId = 'default'
    } = options;

    const [weather, market, ai, stats, user] = await Promise.all([
      this.getReliableWeather(city),
      this.getReliableMarket(),
      this.getReliableAI(cropType),
      this.getReliableStats(userId),
      this.getReliableUser(userId)
    ]);

    return {
      weather,
      market,
      ai,
      stats,
      user,
      timestamp: new Date().toISOString(),
      hasFallbackData: weather.isFallback || market.isFallback || ai.isFallback || stats.isFallback || user.isFallback
    };
  }

  // 🌿 Refresh all data
  async refreshAllData(options = {}) {
    // Clear cache to force fresh data
    this.cache.clear();
    return this.getAllReliableData(options);
  }

  // 🌿 Get data status
  getDataStatus() {
    const totalCached = this.cache.size;
    const cacheKeys = Array.from(this.cache.keys());
    
    return {
      totalCached,
      cacheKeys,
      cacheTimeout: this.cacheTimeout,
      lastCacheUpdate: Date.now()
    };
  }

  // 🌿 Clear cache
  clearCache() {
    this.cache.clear();
  }

  // 🌿 Get formatted error message
  getErrorMessage(error, defaultMessage = 'Something went wrong, retrying...') {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return defaultMessage;
  }

  // 🌿 Check if data is fresh
  isDataFresh(timestamp, maxAge = 5 * 60 * 1000) {
    return Date.now() - new Date(timestamp).getTime() < maxAge;
  }

  // 🌿 Get data age in human readable format
  getDataAge(timestamp) {
    const now = Date.now();
    const dataTime = new Date(timestamp).getTime();
    const ageMs = now - dataTime;
    
    if (ageMs < 60 * 1000) {
      return 'just now';
    } else if (ageMs < 60 * 60 * 1000) {
      return `${Math.floor(ageMs / (60 * 1000))} minutes ago`;
    } else if (ageMs < 24 * 60 * 60 * 1000) {
      return `${Math.floor(ageMs / (60 * 60 * 1000))} hours ago`;
    } else {
      return `${Math.floor(ageMs / (24 * 60 * 60 * 1000))} days ago`;
    }
  }
}

// 🌿 Export singleton instance
export const dataReliabilityService = new DataReliabilityService();
export default dataReliabilityService;
