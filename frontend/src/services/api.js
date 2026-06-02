import axios from "axios";

// =====================================================
// 🌱 AGRIFUTURE — SINGLE SOURCE OF TRUTH API CONFIG
// =====================================================
// All API calls MUST use this centralized instance.
// Backend: http://127.0.0.1:9000
// Base path: /api/v1
// =====================================================

import { FULL_API_URL } from "../config/api";

const API_BASE_URL = FULL_API_URL;

// =====================================================
// 🔧 AXIOS INSTANCE
// =====================================================

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// 🔐 REQUEST INTERCEPTOR — Attach JWT Token
// =====================================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `🚀 [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`
      );
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// =====================================================
// ❌ RESPONSE INTERCEPTOR — Handle errors globally
// =====================================================

API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Keep farmer modules usable when optional protected APIs are unavailable.
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.dispatchEvent(new CustomEvent("agrifuture:auth-expired"));
    }

    // Network error (backend unreachable)
    if (!error.response && error.message === "Network Error") {
      console.error(
        "🔌 Backend unreachable. Check if server is running on port 9000."
      );
    }

    return Promise.reject(error);
  }
);

// =====================================================
// 📤 EXPORTS
// =====================================================

export { API_BASE_URL };
export default API;
