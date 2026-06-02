import React, { useState, useEffect } from 'react';
import performanceMonitor from '../utils/performanceMonitor';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Subscribe to performance updates
    const unsubscribe = performanceMonitor.subscribe((type, metric) => {
      setMetrics(performanceMonitor.getSummary());
    });

    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getSummary());
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#2e7d32',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: '12px',
          zIndex: 9999
        }}
      >
        📊 Perf
      </button>
    );
  }

  if (!metrics) {
    return <div>Loading metrics...</div>;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '320px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        fontSize: '12px',
        fontFamily: 'monospace'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
          Performance Monitor
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280' }}>
          API Calls
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Total: {metrics.apiCalls.total}</span>
          <span>Avg: {metrics.apiCalls.averageDuration.toFixed(0)}ms</span>
          <span>Success: {(metrics.apiCalls.successRate * 100).toFixed(1)}%</span>
        </div>
        {metrics.apiCalls.slowCalls > 0 && (
          <div style={{ color: '#ef4444', marginTop: '4px' }}>
            Slow calls: {metrics.apiCalls.slowCalls}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280' }}>
          Renders
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Total: {metrics.renders.total}</span>
          <span>Avg: {metrics.renders.averageRenderTime.toFixed(0)}ms</span>
        </div>
        {metrics.renders.slowRenders > 0 && (
          <div style={{ color: '#f59e0b', marginTop: '4px' }}>
            Slow renders: {metrics.renders.slowRenders}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280' }}>
          Interactions
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Total: {metrics.interactions.total}</span>
          <span>Avg: {metrics.interactions.averageDuration.toFixed(0)}ms</span>
        </div>
      </div>

      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280' }}>
          Errors
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Total: {metrics.errors.total}</span>
          <span>Recent: {metrics.errors.recentErrors.length}</span>
        </div>
        {metrics.errors.recentErrors.length > 0 && (
          <div style={{ color: '#ef4444', marginTop: '4px' }}>
            Recent errors detected
          </div>
        )}
      </div>

      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
        <button
          onClick={() => performanceMonitor.cleanup()}
          style={{
            backgroundColor: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '10px',
            cursor: 'pointer',
            marginRight: '8px'
          }}
        >
          Cleanup
        </button>
        <button
          onClick={() => console.log('Performance Metrics:', metrics)}
          style={{
            backgroundColor: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          Log
        </button>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
