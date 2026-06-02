// =====================================================
// 🛡️ ADMIN SERVICE
// =====================================================
// Uses the centralized API instance — no hardcoded URLs.
// =====================================================

import { adminApi } from "./apiService";

// Re-export from centralized apiService for backward compatibility
export const getAdminStats = () => adminApi.getStats();
export const getUsers = () => adminApi.getUsers();
export const getActivities = () => adminApi.getActivities();
export const getTopDiseases = () => adminApi.getTopDiseases();
export const getRecentScans = () => adminApi.getRecentScans();
export const getAlerts = () => adminApi.getAlerts();
export const getGovtSchemeAnalytics = () => adminApi.getGovtSchemeAnalytics();