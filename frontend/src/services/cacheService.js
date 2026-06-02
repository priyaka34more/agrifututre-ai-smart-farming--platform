/**
 * Cache Service for AgriFuture AI
 * Handles localStorage caching for offline access
 */

const CACHE_PREFIX = "agri_cache_";

const cacheService = {
  /**
   * Save data to cache
   * @param {string} key 
   * @param {any} data 
   */
  save: (key, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheData));
    } catch (e) {
      console.error("Cache Save Error:", e);
    }
  },

  /**
   * Get data from cache
   * @param {string} key 
   * @param {number} maxAge - Maximum age in milliseconds (optional)
   * @returns {any|null}
   */
  get: (key, maxAge = null) => {
    try {
      const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!item) return null;

      const { data, timestamp } = JSON.parse(item);
      
      if (maxAge && Date.now() - timestamp > maxAge) {
        return null; // Expired
      }

      return data;
    } catch (e) {
      console.error("Cache Get Error:", e);
      return null;
    }
  },

  /**
   * Clear specific cache or all app cache
   * @param {string} key (optional)
   */
  clear: (key = null) => {
    if (key) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } else {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(k);
        }
      });
    }
  },

  /**
   * Check if user is currently online
   */
  isOnline: () => navigator.onLine
};

export default cacheService;
