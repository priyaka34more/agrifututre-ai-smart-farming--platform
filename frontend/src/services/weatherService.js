import axios from 'axios';

// 🌿 Live Weather API Service for AgriFuture AI
// Using OpenWeatherMap API for weather and rainfall data

const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY || 'demo_key';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0';

// 🌿 Default cities for Indian agricultural regions
const DEFAULT_CITIES = {
  jalgaon: { lat: 21.0038, lon: 75.5627, name: 'Jalgaon' },
  mumbai: { lat: 19.0760, lon: 72.8777, name: 'Mumbai' },
  delhi: { lat: 28.6139, lon: 77.2090, name: 'Delhi' },
  pune: { lat: 18.5204, lon: 73.8567, name: 'Pune' },
  bangalore: { lat: 12.9716, lon: 77.5946, name: 'Bangalore' },
  kolkata: { lat: 22.5726, lon: 88.3639, name: 'Kolkata' },
  chennai: { lat: 13.0827, lon: 80.2707, name: 'Chennai' },
  hyderabad: { lat: 17.3850, lon: 78.4867, name: 'Hyderabad' }
};

// 🌿 Weather Service Class
class WeatherService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  // 🌿 Get cached data or fetch new data
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // 🌿 Set cached data
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 🌿 Get current weather with rainfall data
  async getCurrentWeather(city = 'jalgaon') {
    try {
      const cacheKey = `current_${city}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const cityData = DEFAULT_CITIES[city.toLowerCase()] || DEFAULT_CITIES.jalgaon;
      
      const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
        params: {
          lat: cityData.lat,
          lon: cityData.lon,
          appid: WEATHER_API_KEY,
          units: 'metric',
          lang: 'en'
        }
      });

      const weatherData = this.formatCurrentWeather(response.data, cityData.name);
      this.setCachedData(cacheKey, weatherData);
      return weatherData;
    } catch (error) {
      console.error('Weather API error:', error);
      return this.getMockWeatherData(city);
    }
  }

  // 🌿 Get weather forecast with rainfall prediction
  async getWeatherForecast(city = 'jalgaon') {
    try {
      const cacheKey = `forecast_${city}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const cityData = DEFAULT_CITIES[city.toLowerCase()] || DEFAULT_CITIES.jalgaon;
      
      const response = await axios.get(`${WEATHER_BASE_URL}/forecast`, {
        params: {
          lat: cityData.lat,
          lon: cityData.lon,
          appid: WEATHER_API_KEY,
          units: 'metric',
          lang: 'en'
        }
      });

      const forecastData = this.formatForecastData(response.data, cityData.name);
      this.setCachedData(cacheKey, forecastData);
      return forecastData;
    } catch (error) {
      console.error('Weather forecast API error:', error);
      return this.getMockForecastData(city);
    }
  }

  // 🌿 Get rainfall data (historical and forecast)
  async getRainfallData(city = 'jalgaon') {
    try {
      const forecast = await this.getWeatherForecast(city);
      const rainfallData = this.extractRainfallData(forecast);
      return rainfallData;
    } catch (error) {
      console.error('Rainfall data error:', error);
      return this.getMockRainfallData(city);
    }
  }

  // 🌿 Format current weather data
  formatCurrentWeather(data, cityName) {
    return {
      city: cityName,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      visibility: data.visibility / 1000, // Convert to km
      uvIndex: data.uvi || 0,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      rainfall: {
        current: data.rain ? data.rain['1h'] || 0 : 0,
        last24h: data.rain ? data.rain['24h'] || 0 : 0
      },
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
      timestamp: new Date().toISOString()
    };
  }

  // 🌿 Format forecast data
  formatForecastData(data, cityName) {
    const forecasts = data.list.slice(0, 8).map(item => ({
      datetime: new Date(item.dt * 1000),
      temperature: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      windSpeed: item.wind.speed,
      windDirection: item.wind.deg,
      condition: item.weather[0].main,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      rainfall: item.rain ? item.rain['3h'] || 0 : 0,
      snowfall: item.snow ? item.snow['3h'] || 0 : 0,
      cloudCover: item.clouds.all,
      pop: item.pop * 100 // Probability of precipitation
    }));

    return {
      city: cityName,
      forecasts,
      timestamp: new Date().toISOString()
    };
  }

  // 🌿 Extract rainfall data from forecast
  extractRainfallData(forecastData) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRainfall = forecastData.forecasts
      .filter(f => new Date(f.datetime).toDateString() === today.toDateString())
      .reduce((sum, f) => sum + f.rainfall, 0);

    const tomorrowRainfall = forecastData.forecasts
      .filter(f => new Date(f.datetime).toDateString() === tomorrow.toDateString())
      .reduce((sum, f) => sum + f.rainfall, 0);

    const weeklyRainfall = forecastData.forecasts
      .reduce((sum, f) => sum + f.rainfall, 0);

    return {
      city: forecastData.city,
      current24h: todayRainfall,
      next24h: tomorrowRainfall,
      weekly7d: weeklyRainfall,
      forecast: forecastData.forecasts.map(f => ({
        date: f.datetime.toLocaleDateString(),
        time: f.datetime.toLocaleTimeString(),
        rainfall: f.rainfall,
        probability: f.pop,
        intensity: this.getRainfallIntensity(f.rainfall)
      })),
      recommendation: this.getIrrigationRecommendation(todayRainfall, tomorrowRainfall),
      timestamp: new Date().toISOString()
    };
  }

  // 🌿 Get rainfall intensity
  getRainfallIntensity(rainfall) {
    if (rainfall === 0) return 'none';
    if (rainfall < 2.5) return 'light';
    if (rainfall < 7.5) return 'moderate';
    if (rainfall < 15) return 'heavy';
    return 'extreme';
  }

  // 🌿 Get irrigation recommendation
  getIrrigationRecommendation(current24h, next24h) {
    if (next24h > 10) {
      return {
        action: 'skip_irrigation',
        reason: 'Heavy rainfall expected',
        priority: 'low'
      };
    } else if (next24h > 5) {
      return {
        action: 'reduce_irrigation',
        reason: 'Moderate rainfall expected',
        priority: 'medium'
      };
    } else if (current24h > 5) {
      return {
        action: 'delay_irrigation',
        reason: 'Recent rainfall, soil moisture sufficient',
        priority: 'medium'
      };
    } else {
      return {
        action: 'normal_irrigation',
        reason: 'No significant rainfall expected',
        priority: 'high'
      };
    }
  }

  // 🌿 Mock weather data (fallback)
  getMockWeatherData(city) {
    const cityData = DEFAULT_CITIES[city.toLowerCase()] || DEFAULT_CITIES.jalgaon;
    return {
      city: cityData.name,
      temperature: 28,
      feelsLike: 30,
      humidity: 65,
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
      timestamp: new Date().toISOString()
    };
  }

  // 🌿 Mock forecast data (fallback)
  getMockForecastData(city) {
    const cityData = DEFAULT_CITIES[city.toLowerCase()] || DEFAULT_CITIES.jalgaon;
    const forecasts = [];
    
    for (let i = 0; i < 8; i++) {
      const datetime = new Date(Date.now() + i * 3 * 60 * 60 * 1000);
      forecasts.push({
        datetime,
        temperature: 25 + Math.random() * 10,
        feelsLike: 27 + Math.random() * 10,
        humidity: 60 + Math.random() * 20,
        pressure: 1010 + Math.random() * 10,
        windSpeed: 5 + Math.random() * 15,
        windDirection: Math.random() * 360,
        condition: ['Clear', 'Cloudy', 'Rain', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
        description: 'mock weather',
        icon: '01d',
        rainfall: Math.random() * 5,
        snowfall: 0,
        cloudCover: Math.random() * 100,
        pop: Math.random() * 100
      });
    }

    return {
      city: cityData.name,
      forecasts,
      timestamp: new Date().toISOString()
    };
  }

  // 🌿 Mock rainfall data (fallback)
  getMockRainfallData(city) {
    const cityData = DEFAULT_CITIES[city.toLowerCase()] || DEFAULT_CITIES.jalgaon;
    return {
      city: cityData.name,
      current24h: 2.5,
      next24h: 3.2,
      weekly7d: 15.8,
      forecast: [
        {
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          rainfall: 0.5,
          probability: 20,
          intensity: 'light'
        },
        {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleTimeString(),
          rainfall: 1.2,
          probability: 40,
          intensity: 'light'
        }
      ],
      recommendation: {
        action: 'normal_irrigation',
        reason: 'No significant rainfall expected',
        priority: 'high'
      },
      timestamp: new Date().toISOString()
    };
  }

  // 🌿 Search for city by name
  async searchCity(cityName) {
    try {
      const cacheKey = `search_${cityName}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${GEOCODING_URL}/direct`, {
        params: {
          q: cityName,
          limit: 5,
          appid: WEATHER_API_KEY
        }
      });

      const cities = response.data.map(city => ({
        name: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
        state: city.state
      }));

      this.setCachedData(cacheKey, cities);
      return cities;
    } catch (error) {
      console.error('City search error:', error);
      return [];
    }
  }
}

// 🌿 Export singleton instance
export const weatherService = new WeatherService();
export default weatherService;
