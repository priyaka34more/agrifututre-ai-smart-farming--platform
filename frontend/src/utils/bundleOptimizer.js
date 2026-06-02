// 🎯 BUNDLE OPTIMIZATION UTILITIES
import { lazy } from 'react';
// Dynamic import helper with loading states
export const dynamicImport = (importFunction, fallback = null) => {
  return async () => {
    try {
      const startTime = performance.now();
      const module = await importFunction();
      const endTime = performance.now();
      
      // Log loading performance
      console.log(`Module loaded in ${(endTime - startTime).toFixed(2)}ms`);
      
      return module;
    } catch (error) {
      console.error('Failed to load module:', error);
      if (fallback) {
        return fallback;
      }
      throw error;
    }
  };
};

// Preload critical modules
export const preloadCriticalModules = async () => {
  const criticalModules = [
    () => import('../pages/Dashboard'),
    () => import('../pages/DiseasePage'),
    () => import('../contexts/LanguageContext')
  ];

  try {
    await Promise.all(criticalModules.map(module => dynamicImport(module)()));
    console.log('Critical modules preloaded successfully');
  } catch (error) {
    console.warn('Some critical modules failed to preload:', error);
  }
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
};

// Image optimization utilities
export const optimizeImage = (src, options = {}) => {
  const {
    width,
    height
    // quality = 80,
    // format = 'auto'
  } = options;

  if (!src) return null;

  // For external images, we can't optimize them directly
  // but we can add loading hints
  const img = new Image();
  img.loading = 'lazy';
  img.decoding = 'async';
  
  return {
    src,
    loading: 'lazy',
    decoding: 'async',
    ...(width && { width }),
    ...(height && { height })
  };
};

// Code splitting helper
export const codeSplit = (componentPath, componentName) => {
  return lazy(() => {
    return import(componentPath).then(module => ({
      default: module.default || module[componentName]
    }));
  });
};

// Performance monitoring for bundle loading
export const monitorBundlePerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Monitor navigation timing
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: null,
        firstContentfulPaint: null
      };

      // Get paint metrics
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          metrics.firstPaint = entry.startTime;
        }
        if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
        }
      });

      console.log('Bundle Performance Metrics:', metrics);
      return metrics;
    }
  }
  return null;
};

// Resource hint utilities
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;

  // Preconnect to external APIs
  const preconnectUrls = [
    'https://api.openweathermap.org',
    'https://kindwise.ai'
  ];

  preconnectUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    document.head.appendChild(link);
  });

  // DNS prefetch for commonly used domains
  const dnsPrefetchUrls = [
    'https://vegetablemarketprice.com'
  ];

  dnsPrefetchUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.log('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

// Critical CSS inlining helper
export const inlineCriticalCSS = (css) => {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};

// Bundle size monitoring
export const monitorBundleSize = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(resource => 
      resource.name.includes('.js') && !resource.name.includes('chunk')
    );
    
    const totalSize = jsResources.reduce((sum, resource) => {
      return sum + (resource.transferSize || 0);
    }, 0);

    console.log(`Bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
    return totalSize;
  }
  return 0;
};
