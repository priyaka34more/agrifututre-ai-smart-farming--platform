import API from "./api";

// =====================================================
// 🌾 AI Advice Service
// =====================================================
// Uses centralized Axios instance. Endpoint path is relative
// to the configured backend base URL.
// =====================================================

export const adviceApi = {
  getAdvice: async (params = {}) => {
    const requestUrl = `${API.defaults.baseURL}/advice`;
    console.log("Calling AI advice API:", requestUrl, params);
    try {
      const res = await API.get("/advice", { params, timeout: 20000 });
      console.log("AI advice response status:", res.status);
      console.log("AI advice response body:", res.data);
      return res.data;
    } catch (error) {
      console.error("AI advice request failed:", {
        message: error.message,
        url: requestUrl,
        params,
        status: error.response?.status,
        responseBody: error.response?.data,
      });
      throw error;
    }
  },
};
