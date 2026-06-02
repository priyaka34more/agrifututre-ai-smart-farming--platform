// =====================================================
// AGRIFUTURE AI - CENTRALIZED API CONFIG
// =====================================================
// Capacitor note:
// In an Android APK, localhost points to the phone itself, not the PC backend.
// Use REACT_APP_CAPACITOR_API_URL or REACT_APP_CAPACITOR_HOST for physical devices.
// =====================================================

const API_PATH = "/api/v1";
const DEFAULT_API_PORT = process.env.REACT_APP_API_PORT || "8000";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const normalizeApiUrl = (value) => {
  if (!value) return "";
  const trimmed = trimTrailingSlash(value.trim());
  return trimmed.endsWith(API_PATH) ? trimmed : `${trimmed}${API_PATH}`;
};

const isLoopbackUrl = (value) => {
  if (!value) return false;
  try {
    const { hostname } = new URL(value);
    return ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(hostname);
  } catch {
    return value.includes("localhost") || value.includes("127.0.0.1");
  }
};

const isNativeCapacitor = () => {
  if (typeof window === "undefined" || !window.Capacitor) return false;
  if (typeof window.Capacitor.isNativePlatform === "function") {
    return window.Capacitor.isNativePlatform();
  }
  return true;
};

const getPortFromUrl = (value) => {
  try {
    return new URL(value).port || DEFAULT_API_PORT;
  } catch {
    return DEFAULT_API_PORT;
  }
};

const buildHostUrl = (host, sourceUrl) => {
  const port = process.env.REACT_APP_CAPACITOR_API_PORT || getPortFromUrl(sourceUrl);
  return normalizeApiUrl(`http://${host}:${port}`);
};

export const getApiBaseUrl = () => {
  const envApiUrl = process.env.REACT_APP_API_URL;
  const capacitorApiUrl =
    process.env.REACT_APP_CAPACITOR_API_URL ||
    process.env.REACT_APP_MOBILE_API_URL;

  if (isNativeCapacitor()) {
    if (capacitorApiUrl) return normalizeApiUrl(capacitorApiUrl);

    const capacitorHost =
      process.env.REACT_APP_CAPACITOR_HOST ||
      process.env.REACT_APP_MOBILE_API_HOST;
    if (capacitorHost) return buildHostUrl(capacitorHost, envApiUrl);

    if (envApiUrl && !isLoopbackUrl(envApiUrl)) return normalizeApiUrl(envApiUrl);

    // Android emulator can reach host-machine localhost through 10.0.2.2.
    if (typeof navigator !== "undefined" && navigator.userAgent.includes("Android")) {
      return buildHostUrl("10.0.2.2", envApiUrl);
    }
  }

  if (envApiUrl) return normalizeApiUrl(envApiUrl);

  if (typeof window !== "undefined" && window.location.hostname) {
    return buildHostUrl(window.location.hostname, `http://localhost:${DEFAULT_API_PORT}`);
  }

  return normalizeApiUrl(`http://localhost:${DEFAULT_API_PORT}`);
};

export const API_BASE_URL = getApiBaseUrl();
export const FULL_API_URL = API_BASE_URL;
