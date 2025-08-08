import { useEffect, useRef, useState, useCallback } from 'react';
import { PerformanceMetrics, usePerformanceContext } from './PerformanceProvider';

/**
 * Performance Monitoring Hook
 *
 * Implements Single Responsibility Principle by focusing on performance tracking.
 * Provides metrics for component render times, memory usage, and user interactions.
 */

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
  const hasInitialized = useRef<boolean>(false);

  // Initialize performance tracking once
  useEffect(() => {
    if (!isEnabled || hasInitialized.current) return;

    hasInitialized.current = true;
    renderStartTime.current = performance.now();

    // Measure performance after a delay to avoid infinite loops
    const timeoutId = setTimeout(() => {
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
    }, 100); // Small delay to ensure DOM is updated

    return () => {
      clearTimeout(timeoutId);
      hasInitialized.current = false;
    };
  }, [componentName, isEnabled]); // Only run when component name or enabled state changes

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


