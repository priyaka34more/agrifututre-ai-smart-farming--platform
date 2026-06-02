/**
 * Health Service - Checks backend connectivity
 * Uses the centralized API instance.
 */

import API from './api';

class HealthService {
  constructor() {
    this.isHealthy = false;
    this.lastCheck = null;
    this.checkInterval = 30000; // 30 seconds
  }

  async checkHealth() {
    try {
      // /health is at the root, not under /api/v1
      // So we use a direct axios call with the base host
      const response = await API.get('/health');
      this.isHealthy = response?.data?.status === 'ok' || response?.status === 'ok';
      this.lastCheck = new Date();
      return this.isHealthy;
    } catch (error) {
      console.error('Health check failed:', error.message);
      this.isHealthy = false;
      this.lastCheck = new Date();
      return false;
    }
  }

  async startHealthCheck() {
    // Check immediately
    await this.checkHealth();
    
    // Set up periodic checks
    setInterval(() => {
      this.checkHealth();
    }, this.checkInterval);
  }

  getStatus() {
    return {
      isHealthy: this.isHealthy,
      lastCheck: this.lastCheck
    };
  }

  getFallbackData(type) {
    const fallbacks = {
      weather: {
        temperature: 30,
        humidity: 60,
        condition: "partly_cloudy",
        wind_speed: 10,
        message: "Unable to connect to weather service. Showing estimated data."
      },
      market: {
        current_price: 25.0,
        unit: "₹/kg",
        trend: "Stable ➖",
        forecast: [25.2, 25.5, 25.7, 26.0],
        labels: ["Today", "Tomorrow", "Day 3", "Day 4"],
        best_sell_day: "Day 4",
        max_price: 26.0,
        profit_per_kg: 1.0,
        advice: "Market conditions are stable. Consider waiting for better prices."
      },
      ai: {
        advice: "Water crops early morning for best results.",
        confidence: 0.8,
        message: "Unable to connect to AI service. Showing general advice."
      },
      schemes: {
        schemes: [
          {
            name: "Pradhan Mantri Krishi Sinchai Yojana",
            description: "Micro irrigation subsidy scheme",
            benefit: "Up to 55% subsidy on drip irrigation"
          }
        ],
        message: "Unable to connect to schemes service. Showing available schemes."
      }
    };
    
    return fallbacks[type] || null;
  }
}

const healthService = new HealthService();

export default healthService;
