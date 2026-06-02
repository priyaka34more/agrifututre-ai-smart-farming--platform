// 🎯 PERFORMANCE MONITORING UTILITIES
import React from "react";

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiCalls: [],
      renderTimes: [],
      userInteractions: [],
      errors: []
    };
    this.observers = new Set();
  }

  // Track API call performance
  trackApiCall(url, method, startTime, endTime, success, error = null) {
    const duration = endTime - startTime;
    const metric = {
      url,
      method,
      duration,
      success,
      error,
      timestamp: Date.now()
    };
    
    this.metrics.apiCalls.push(metric);
    this.notifyObservers('apiCall', metric);
    
    // Log slow API calls
    if (duration > 5000) {
      console.warn(`Slow API call detected: ${method} ${url} took ${duration}ms`);
    }
  }

  // Track component render performance
  trackRender(componentName, renderTime) {
    const metric = {
      componentName,
      renderTime,
      timestamp: Date.now()
    };
    
    this.metrics.renderTimes.push(metric);
    this.notifyObservers('render', metric);
    
    // Log slow renders
    if (renderTime > 100) {
      console.warn(`Slow render detected: ${componentName} took ${renderTime}ms`);
    }
  }

  // Track user interaction performance
  trackInteraction(type, target, startTime, endTime) {
    const duration = endTime - startTime;
    const metric = {
      type,
      target,
      duration,
      timestamp: Date.now()
    };
    
    this.metrics.userInteractions.push(metric);
    this.notifyObservers('interaction', metric);
  }

  // Track errors
  trackError(error, context = {}) {
    const metric = {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    };
    
    this.metrics.errors.push(metric);
    this.notifyObservers('error', metric);
  }

  // Subscribe to performance events
  subscribe(callback) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  // Notify observers of new metrics
  notifyObservers(type, metric) {
    this.observers.forEach(callback => {
      try {
        callback(type, metric);
      } catch (error) {
        console.error('Performance observer error:', error);
      }
    });
  }

  // Get performance summary
  getSummary() {
    const summary = {
      apiCalls: {
        total: this.metrics.apiCalls.length,
        averageDuration: this.metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0) / this.metrics.apiCalls.length || 0,
        successRate: this.metrics.apiCalls.filter(call => call.success).length / this.metrics.apiCalls.length || 0,
        slowCalls: this.metrics.apiCalls.filter(call => call.duration > 5000).length
      },
      renders: {
        total: this.metrics.renderTimes.length,
        averageRenderTime: this.metrics.renderTimes.reduce((sum, render) => sum + render.renderTime, 0) / this.metrics.renderTimes.length || 0,
        slowRenders: this.metrics.renderTimes.filter(render => render.renderTime > 100).length
      },
      interactions: {
        total: this.metrics.userInteractions.length,
        averageDuration: this.metrics.userInteractions.reduce((sum, interaction) => sum + interaction.duration, 0) / this.metrics.userInteractions.length || 0
      },
      errors: {
        total: this.metrics.errors.length,
        recentErrors: this.metrics.errors.filter(error => Date.now() - error.timestamp < 300000) // Last 5 minutes
      }
    };
    
    return summary;
  }

  // Clear old metrics (keep last 1000 of each type)
  cleanup() {
    Object.keys(this.metrics).forEach(key => {
      if (this.metrics[key].length > 1000) {
        this.metrics[key] = this.metrics[key].slice(-1000);
      }
    });
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-cleanup every 5 minutes
setInterval(() => {
  performanceMonitor.cleanup();
}, 300000);

export default performanceMonitor;

// Higher-order component for tracking render performance
export const withPerformanceTracking = (WrappedComponent, componentName) => {
  return class TrackedComponent extends React.Component {
    componentDidMount() {
      this.startTime = performance.now();
    }

    componentDidUpdate() {
      const renderTime = performance.now() - this.startTime;
      performanceMonitor.trackRender(componentName, renderTime);
      this.startTime = performance.now();
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
};

// Hook for tracking API calls
export const useApiTracking = () => {
  return (url, method, apiCall) => {
    const startTime = performance.now();
    
    return apiCall().then(
      result => {
        const endTime = performance.now();
        performanceMonitor.trackApiCall(url, method, startTime, endTime, true);
        return result;
      },
      error => {
        const endTime = performance.now();
        performanceMonitor.trackApiCall(url, method, startTime, endTime, false, error);
        throw error;
      }
    );
  };
};
