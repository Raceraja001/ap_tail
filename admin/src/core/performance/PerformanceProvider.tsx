import React, { ReactNode, useState, useCallback, createContext, useContext } from 'react';

/**
 * Performance Provider Component
 * 
 * Provides global performance metrics context for the application.
 */

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: MemoryInfo;
  componentName: string;
  timestamp: number;
  props?: Record<string, any>;
}

interface PerformanceContextValue {
  metrics: PerformanceMetrics[];
  addMetric: (metric: PerformanceMetrics) => void;
  clearMetrics: () => void;
  getAverageRenderTime: (componentName?: string) => number;
}

const PerformanceContext = createContext<PerformanceContextValue | undefined>(undefined);

export const PerformanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);

  const addMetric = useCallback((metric: PerformanceMetrics) => {
    setMetrics(prev => [...prev.slice(-99), metric]); // Keep last 100 metrics
  }, []);

  const clearMetrics = useCallback(() => {
    setMetrics([]);
  }, []);

  const getAverageRenderTime = useCallback((componentName?: string) => {
    const filteredMetrics = componentName 
      ? metrics.filter(m => m.componentName === componentName)
      : metrics;
    
    if (filteredMetrics.length === 0) return 0;
    
    const totalTime = filteredMetrics.reduce((sum, m) => sum + m.renderTime, 0);
    return totalTime / filteredMetrics.length;
  }, [metrics]);

  const value: PerformanceContextValue = {
    metrics,
    addMetric,
    clearMetrics,
    getAverageRenderTime,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformanceContext = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceContext must be used within PerformanceProvider');
  }
  return context;
};
