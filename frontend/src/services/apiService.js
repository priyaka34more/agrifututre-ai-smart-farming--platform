// =====================================================
// 🌱 AGRIFUTURE CENTRALIZED API SERVICE
// =====================================================
// All page-level API calls go through here.
// Uses the single centralized Axios instance from api.js
// BaseURL already includes /api/v1 — paths are RELATIVE.
// =====================================================

import API from "./api";

// =====================================================
// 🔐 AUTH API
// =====================================================

export const authApi = {
  login: async (data) => {
    const res = await API.post("/auth/login", data);
    return res.data;
  },

  register: async (data) => {
    const res = await API.post("/auth/register", data);
    return res.data;
  },

  googleLogin: async (data) => {
    const res = await API.post("/auth/google-login", data);
    return res.data;
  },

  forgotPassword: async (data) => {
    const res = await API.post("/auth/forgot-password", data);
    return res.data;
  },

  resetPassword: async (data) => {
    const res = await API.post("/auth/reset-password", data);
    return res.data;
  },
  verifyOtp: async (data) => {
    const res = await API.post("/auth/verify-otp", data);
    return res.data;
  },
};

// =====================================================
// 🌱 DISEASE API
// =====================================================

export const diseaseApi = {
  predict: async (formData, options = {}) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 seconds for image upload + processing
        ...options,
      };

      const res = await API.post("/disease/predict", formData, config);
      return res.data;
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Image processing timed out. Please try with a smaller image."
        );
      }
      if (error.response?.status === 413) {
        throw new Error("Image too large. Please use an image under 5MB.");
      }
      if (error.response?.status === 422) {
        throw new Error(
          "Invalid image format. Please use JPG, PNG, or WebP images."
        );
      }
      throw error;
    }
  },

  getHistory: async () => {
    const res = await API.get("/disease/history");
    return res.data;
  },

  getById: async (id) => {
    const res = await API.get(`/disease/history/${id}`);
    return res.data;
  },

  deleteHistory: async (id) => {
    const res = await API.delete(`/disease/history/${id}`);
    return res.data;
  },

  getOutbreakAlerts: async (region) => {
    const res = await API.get(`/disease/outbreaks?region=${region}`);
    return res.data;
  },

  reportOutbreak: async (data) => {
    const res = await API.post("/disease/report-outbreak", data);
    return res.data;
  },
};

// =====================================================
// 🌦️ WEATHER API
// =====================================================

export const weatherApi = {
  getWeather: async (city, lang = "en") => {
    try {
      const res = await API.post("/weather", { city, lang }, { timeout: 15000 });
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Unable to fetch weather data. Please try again."
      );
    }
  },

  getWeatherByLocation: async (lat, lon, lang = "en") => {
    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
        lang
      });
      const res = await API.get(`/weather?${params.toString()}`, {
        timeout: 15000,
      });
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Unable to fetch weather data for your location."
      );
    }
  },

  getForecast: async (city, days, lang = "en") => {
    const params = new URLSearchParams({
      city,
      days: String(days),
      lang
    });
    const res = await API.get(`/weather/forecast?${params.toString()}`, {
      timeout: 20000,
    });
    return res.data;
  },
};

// =====================================================
// 📈 MARKET API
// =====================================================

export const getMarketForecast = async (data) => {
  const res = await API.post("/market/forecast", data, { timeout: 15000 });
  return res.data;
};

export const marketApi = {
  getPrices: async () => {
    const res = await API.get("/market", { timeout: 12000 });
    return res.data;
  },

  getPriceHistory: async (crop, days) => {
    const res = await API.get(`/market/history?crop=${crop}&days=${days}`, {
      timeout: 15000,
    });
    return res.data;
  },

  getMarketForecast
};

// =====================================================
// 🏛️ GOVERNMENT SCHEMES API
// =====================================================

export const schemesApi = {
  getAll: async (state, category) => {
    try {
      const res = await API.get(
        `/schemes/?state=${encodeURIComponent(state || "maharashtra")}&category=${encodeURIComponent(category || "")}`,
        { timeout: 15000 }
      );
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Unable to fetch government schemes. Please try again."
      );
    }
  },

  getById: async (id, state) => {
    const res = await API.get(`/schemes/${id}?state=${state}`, {
      timeout: 10000,
    });
    return res.data;
  },

  getSchemes: async (params = {}) => {
    const query = params.params || params;
    const res = await API.get("/schemes/", {
      params: query,
      timeout: 15000,
    });
    return res.data;
  },

  getFeatured: async (state, limit) => {
    try {
      const res = await API.get(
        `/schemes/featured?state=${state}&limit=${limit}`,
        { timeout: 12000 }
      );
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Unable to fetch featured schemes. Please try again."
      );
    }
  },

  checkEligibility: async (schemeId, farmerProfile) => {
    const res = await API.post(
      "/schemes/eligibility",
      { scheme_id: schemeId, farmer_profile: farmerProfile },
      { timeout: 10000 }
    );
    return res.data;
  },

  search: async (query, state) => {
    const res = await API.post(
      "/schemes/search",
      { query, state },
      { timeout: 15000 }
    );
    return res.data;
  },

  apply: async (schemeId, farmerProfile, state) => {
    const res = await API.post(
      "/schemes/apply",
      { scheme_id: schemeId, farmer_profile: farmerProfile, state },
      { timeout: 20000 }
    );
    return res.data;
  },

  getCategories: async () => {
    const res = await API.get("/schemes/categories", { timeout: 8000 });
    return res.data;
  },

  getStatus: async (schemeId, state) => {
    const res = await API.get(`/schemes/status/${schemeId}?state=${state}`, {
      timeout: 10000,
    });
    return res.data;
  },
};

// =====================================================
// 🌾 YIELD API
// =====================================================

export const estimateYield = async (data) => {
  const res = await API.post("/yield/estimate-yield", data, { timeout: 15000 });
  return res.data;
};

export const yieldApi = {
  predict: async (data) => {
    return estimateYield(data);
  },

  estimate: async (data) => {
    return estimateYield(data);
  },

  getYieldHistory: async () => {
    const res = await API.get("/yield/history", { timeout: 10000 });
    return res.data;
  },

  getYieldById: async (id) => {
    const res = await API.get(`/yield/history/${id}`, { timeout: 8000 });
    return res.data;
  },

  deleteYieldHistory: async (id) => {
    const res = await API.delete(`/yield/history/${id}`, { timeout: 8000 });
    return res.data;
  },

  compareYield: async (data) => {
    const res = await API.post("/yield/compare", data, { timeout: 12000 });
    return res.data;
  },
};

// =====================================================
// 🛡️ ADMIN API
// =====================================================

export const adminApi = {
  getStats: async () => {
    const res = await API.get("/admin/stats", { timeout: 10000 });
    return res.data;
  },

  getUsers: async () => {
    const res = await API.get("/admin/users", { timeout: 15000 });
    return res.data;
  },

  testModel: async (formData) => {
    const res = await API.post("/admin/test-model", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return res.data;
  },

  getActivities: async () => {
    const res = await API.get("/admin/all-activities", { timeout: 15000 });
    return res.data;
  },

  getTopDiseases: async () => {
    const res = await API.get("/admin/top-diseases", { timeout: 10000 });
    return res.data;
  },

  getRecentScans: async () => {
    const res = await API.get("/admin/recent-scans", { timeout: 10000 });
    return res.data;
  },

  getAlerts: async () => {
    const res = await API.get("/admin/alerts", { timeout: 10000 });
    return res.data;
  },

  getGovtSchemeAnalytics: async () => {
    const res = await API.get("/admin/govt-scheme-activities", { timeout: 15000 });
    return res.data;
  },
};

// =====================================================
// 🤖 AI API
// =====================================================

export const aiApi = {
  insights: async () => {
    const res = await API.get("/ai/insights", { timeout: 10000 });
    return res.data;
  },

  getAdvice: async (crop, issue) => {
    const res = await API.post(
      "/ai/advice",
      { crop, issue },
      { timeout: 15000 }
    );
    return res.data;
  },

  chat: async (message, disease = "unknown", lang = "en") => {
    const res = await API.post(
      "/ai/chat",
      { message, disease, lang },
      { timeout: 20000 }
    );
    return res.data;
  },
};

// =====================================================
// 📚 HISTORY API
// =====================================================

export const historyApi = {
  getHistory: async () => {
    const res = await API.get("/history", { timeout: 10000 });
    return res.data;
  },
  getStats: async () => {
    const res = await API.get("/history", { timeout: 10000 });
    return res.data;
  },
};

// =====================================================
// 📤 DEFAULT EXPORT
// =====================================================

export default API;

