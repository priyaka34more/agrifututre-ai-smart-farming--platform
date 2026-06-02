// 🎯 PERFORMANCE TESTING UTILITIES

// Performance threshold configurations
const PERFORMANCE_THRESHOLDS = {
  apiCallDuration: 5000, // 5 seconds
  renderTime: 100, // 100ms
  interactionTime: 300, // 300ms
  bundleSize: 1024 * 1024, // 1MB
  firstContentfulPaint: 2000, // 2 seconds
  largestContentfulPaint: 4000 // 4 seconds
};

// Performance test runner
class PerformanceTestRunner {
  constructor() {
    this.tests = new Map();
    this.results = new Map();
  }

  // Register a performance test
  registerTest(name, testFunction) {
    this.tests.set(name, testFunction);
  }

  // Run all registered tests
  async runAllTests() {
    const results = {};
    
    for (const [name, testFunction] of this.tests) {
      try {
        console.log(`Running performance test: ${name}`);
        const result = await testFunction();
        results[name] = result;
        this.results.set(name, result);
      } catch (error) {
        console.error(`Performance test failed: ${name}`, error);
        results[name] = {
          passed: false,
          error: error.message,
          timestamp: Date.now()
        };
      }
    }
    
    return results;
  }

  // Run a specific test
  async runTest(name) {
    const testFunction = this.tests.get(name);
    if (!testFunction) {
      throw new Error(`Test not found: ${name}`);
    }
    
    try {
      const result = await testFunction();
      this.results.set(name, result);
      return result;
    } catch (error) {
      console.error(`Performance test failed: ${name}`, error);
      const result = {
        passed: false,
        error: error.message,
        timestamp: Date.now()
      };
      this.results.set(name, result);
      return result;
    }
  }

  // Get test results
  getResults() {
    return Object.fromEntries(this.results);
  }

  // Clear results
  clearResults() {
    this.results.clear();
  }
}

// Create test runner instance
const testRunner = new PerformanceTestRunner();

// API performance test
testRunner.registerTest('api-performance', async () => {
  const startTime = performance.now();
  
  try {
    // Test multiple API endpoints
    const endpoints = [
      '/api/v1/weather',
      '/api/v1/market',
      '/api/v1/schemes/featured'
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      const apiStartTime = performance.now();
      
      try {
        const response = await fetch(endpoint);
        const apiEndTime = performance.now();
        const duration = apiEndTime - apiStartTime;
        
        results.push({
          endpoint,
          duration,
          success: response.ok,
          status: response.status
        });
      } catch (error) {
        results.push({
          endpoint,
          duration: 0,
          success: false,
          error: error.message
        });
      }
    }
    
    const endTime = performance.now();
    const totalDuration = endTime - startTime;
    
    const avgDuration = results.reduce((sum, result) => sum + result.duration, 0) / results.length;
    const successRate = results.filter(r => r.success).length / results.length;
    const slowCalls = results.filter(r => r.duration > PERFORMANCE_THRESHOLDS.apiCallDuration).length;
    
    return {
      passed: avgDuration < PERFORMANCE_THRESHOLDS.apiCallDuration && successRate > 0.8,
      metrics: {
        totalDuration,
        avgDuration,
        successRate,
        slowCalls,
        totalCalls: results.length
      },
      threshold: PERFORMANCE_THRESHOLDS.apiCallDuration,
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      passed: false,
      error: error.message,
      timestamp: Date.now()
    };
  }
});

// Bundle size test
testRunner.registerTest('bundle-size', async () => {
  try {
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(resource => 
      resource.name.includes('.js') && !resource.name.includes('chunk')
    );
    
    const totalSize = jsResources.reduce((sum, resource) => {
      return sum + (resource.transferSize || 0);
    }, 0);
    
    return {
      passed: totalSize < PERFORMANCE_THRESHOLDS.bundleSize,
      metrics: {
        totalSize,
        bundleCount: jsResources.length,
        averageSize: totalSize / jsResources.length
      },
      threshold: PERFORMANCE_THRESHOLDS.bundleSize,
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      passed: false,
      error: error.message,
      timestamp: Date.now()
    };
  }
});

// Page load performance test
testRunner.registerTest('page-load', async () => {
  try {
    const navigation = performance.getEntriesByType('navigation')[0];
    
    if (!navigation) {
      return {
        passed: false,
        error: 'Navigation timing not available',
        timestamp: Date.now()
      };
    }
    
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    const largestContentfulPaint = performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0;
    
    const metrics = {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstContentfulPaint,
      largestContentfulPaint
    };
    
    const passed = 
      metrics.firstContentfulPaint < PERFORMANCE_THRESHOLDS.firstContentfulPaint &&
      metrics.largestContentfulPaint < PERFORMANCE_THRESHOLDS.largestContentfulPaint;
    
    return {
      passed,
      metrics,
      thresholds: {
        firstContentfulPaint: PERFORMANCE_THRESHOLDS.firstContentfulPaint,
        largestContentfulPaint: PERFORMANCE_THRESHOLDS.largestContentfulPaint
      },
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      passed: false,
      error: error.message,
      timestamp: Date.now()
    };
  }
});

// Memory usage test
testRunner.registerTest('memory-usage', async () => {
  try {
    if (!performance.memory) {
      return {
        passed: true,
        metrics: { message: 'Memory API not available' },
        timestamp: Date.now()
      };
    }
    
    const memory = performance.memory;
    const metrics = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
    
    // Consider memory usage acceptable if less than 70% of limit
    const passed = metrics.usagePercentage < 70;
    
    return {
      passed,
      metrics,
      threshold: 70,
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      passed: false,
      error: error.message,
      timestamp: Date.now()
    };
  }
});

// Component render performance test
testRunner.registerTest('component-render', async () => {
  try {
    const startTime = performance.now();
    
    // Simulate component render test
    const testElement = document.createElement('div');
    testElement.innerHTML = '<div class="test-component">Test Content</div>';
    document.body.appendChild(testElement);
    
    // Force layout and paint
    void testElement.offsetHeight;
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Clean up
    document.body.removeChild(testElement);
    
    return {
      passed: renderTime < PERFORMANCE_THRESHOLDS.renderTime,
      metrics: {
        renderTime,
        elementCount: 1
      },
      threshold: PERFORMANCE_THRESHOLDS.renderTime,
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      passed: false,
      error: error.message,
      timestamp: Date.now()
    };
  }
});

// Automated performance regression detection
export const detectPerformanceRegression = async (baselineResults) => {
  const currentResults = await testRunner.runAllTests();
  const regressions = [];
  
  for (const [testName, currentResult] of Object.entries(currentResults)) {
    const baselineResult = baselineResults[testName];
    
    if (!baselineResult) {
      continue; // No baseline to compare against
    }
    
    if (currentResult.passed !== baselineResult.passed) {
      regressions.push({
        testName,
        type: 'status-change',
        current: currentResult.passed,
        baseline: baselineResult.passed
      });
    }
    
    // Check for metric degradation
    if (currentResult.metrics && baselineResult.metrics) {
      const currentMetrics = currentResult.metrics;
      const baselineMetrics = baselineResult.metrics;
      
      // API performance regression
      if (currentMetrics.avgDuration && baselineMetrics.avgDuration) {
        const degradation = (currentMetrics.avgDuration - baselineMetrics.avgDuration) / baselineMetrics.avgDuration;
        if (degradation > 0.2) { // 20% degradation
          regressions.push({
            testName,
            type: 'api-performance',
            degradation: degradation * 100,
            current: currentMetrics.avgDuration,
            baseline: baselineMetrics.avgDuration
          });
        }
      }
      
      // Bundle size regression
      if (currentMetrics.totalSize && baselineMetrics.totalSize) {
        const increase = (currentMetrics.totalSize - baselineMetrics.totalSize) / baselineMetrics.totalSize;
        if (increase > 0.1) { // 10% increase
          regressions.push({
            testName,
            type: 'bundle-size',
            increase: increase * 100,
            current: currentMetrics.totalSize,
            baseline: baselineMetrics.totalSize
          });
        }
      }
    }
  }
  
  return {
    regressions,
    summary: {
      totalTests: Object.keys(currentResults).length,
      passedTests: Object.values(currentResults).filter(r => r.passed).length,
      regressionCount: regressions.length
    }
  };
};

// Performance test scheduler
export const schedulePerformanceTests = (interval = 300000) => {
  // Run tests every 5 minutes by default
  setInterval(async () => {
    console.log('Running scheduled performance tests...');
    const results = await testRunner.runAllTests();
    
    // Log results
    const passedTests = Object.values(results).filter(r => r.passed).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`Performance tests completed: ${passedTests}/${totalTests} passed`);
    
    // Store results for regression detection
    localStorage.setItem('performance-test-results', JSON.stringify({
      results,
      timestamp: Date.now()
    }));
  }, interval);
};

// Export test runner and utilities
export { testRunner, PERFORMANCE_THRESHOLDS };
export default testRunner;
