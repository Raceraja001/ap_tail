import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Performance Monitoring Hook
 * 
 * Implements Single Responsibility Principle by focusing on performance tracking.
 * Provides metrics for component render times, memory usage, and user interactions.
 */

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: MemoryInfo;
  componentName: string;
  timestamp: number;
  props?: Record<string, any>;
}

export interface UsePerformanceOptions {
  componentName: string;
  trackMemory?: boolean;
  trackProps?: boolean;
  onMetricsCollected?: (metrics: PerformanceMetrics) => void;
  enableInProduction?: boolean;
}

export const usePerformance = (options: UsePerformanceOptions) => {
  const {
    componentName,
    trackMemory = false,
    trackProps = false,
    onMetricsCollected,
    enableInProduction = false,
  } = options;

  const renderStartTime = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const isEnabled = import.meta.env.DEV || enableInProduction;

  // Start timing on component mount and re-renders
  useEffect(() => {
    if (!isEnabled) return;
    
    renderStartTime.current = performance.now();
  });

  // Measure render time after DOM updates
  useEffect(() => {
    if (!isEnabled) return;

    const renderTime = performance.now() - renderStartTime.current;
    
    const newMetrics: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now(),
    };

    if (trackMemory && 'memory' in performance) {
      newMetrics.memoryUsage = (performance as any).memory;
    }

    setMetrics(newMetrics);
    onMetricsCollected?.(newMetrics);
  });

  const measureFunction = useCallback(
    <T extends (...args: any[]) => any>(fn: T, functionName: string): T => {
      if (!isEnabled) return fn;

      return ((...args: any[]) => {
        const start = performance.now();
        const result = fn(...args);
        const end = performance.now();
        
        console.log(`${componentName}.${functionName} took ${end - start}ms`);
        
        return result;
      }) as T;
    },
    [componentName, isEnabled]
  );

  const measureAsyncFunction = useCallback(
    <T extends (...args: any[]) => Promise<any>>(fn: T, functionName: string): T => {
      if (!isEnabled) return fn;

      return (async (...args: any[]) => {
        const start = performance.now();
        const result = await fn(...args);
        const end = performance.now();
        
        console.log(`${componentName}.${functionName} (async) took ${end - start}ms`);
        
        return result;
      }) as T;
    },
    [componentName, isEnabled]
  );

  return {
    metrics,
    measureFunction,
    measureAsyncFunction,
    isEnabled,
  };
};

/**
 * Performance Observer Hook
 * 
 * Monitors Web Vitals and other performance metrics
 */
export const usePerformanceObserver = () => {
  const [vitals, setVitals] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!('PerformanceObserver' in window)) return;

    // Observe Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      setVitals(prev => ({ ...prev, lcp: lastEntry.startTime }));
    });

    // Observe First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        setVitals(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
      });
    });

    // Observe Cumulative Layout Shift (CLS)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      setVitals(prev => ({ ...prev, cls: clsValue }));
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  return vitals;
};

/**
 * Bundle Size Analyzer
 */
export const useBundleAnalyzer = () => {
  const [bundleInfo, setBundleInfo] = useState<{
    totalSize: number;
    chunks: Array<{ name: string; size: number }>;
  } | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      // In development, we can analyze the bundle
      const analyzeBundle = async () => {
        try {
          // This would typically integrate with webpack-bundle-analyzer or similar
          const response = await fetch('/__bundle_info');
          if (response.ok) {
            const info = await response.json();
            setBundleInfo(info);
          }
        } catch (error) {
          console.warn('Bundle analysis not available:', error);
        }
      };

      analyzeBundle();
    }
  }, []);

  return bundleInfo;
};

/**
 * Memory Usage Hook
 */
export const useMemoryUsage = () => {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);

  useEffect(() => {
    if (!('memory' in performance)) return;

    const updateMemoryInfo = () => {
      setMemoryInfo((performance as any).memory);
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

/**
 * Performance Context for Global Metrics
 */
import { createContext, useContext, ReactNode } from 'react';

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
