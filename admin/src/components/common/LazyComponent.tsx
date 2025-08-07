import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';
import { ErrorBoundary } from '../../core/error/ErrorBoundary';

/**
 * Lazy Component Wrapper
 * 
 * Implements Single Responsibility Principle by handling lazy loading concerns.
 * Provides consistent loading states and error handling for lazy components.
 */

interface LazyComponentProps {
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType<any>;
  delay?: number;
  children: React.ReactNode;
}

interface LazyLoadOptions {
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType<any>;
  delay?: number;
  retryCount?: number;
}

/**
 * Enhanced Loading Spinner with Delay
 */
const DelayedSpinner: React.FC<{ delay?: number }> = ({ delay = 200 }) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return null;

  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin">
          <div className="absolute top-0 left-0 w-8 h-8 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loading Component
 */
export const SkeletonLoader: React.FC<{
  lines?: number;
  height?: string;
  className?: string;
}> = ({ lines = 3, height = 'h-4', className = '' }) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 dark:bg-gray-700 rounded ${height} ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

/**
 * Lazy Component Wrapper
 */
export const LazyComponent: React.FC<LazyComponentProps> = ({
  fallback: Fallback = DelayedSpinner,
  errorFallback,
  delay = 200,
  children,
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={<Fallback delay={delay} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * Higher-Order Component for Lazy Loading
 */
export function withLazyLoading<P extends object>(
  LazyComponent: LazyExoticComponent<ComponentType<P>>,
  options: LazyLoadOptions = {}
) {
  const {
    fallback: Fallback = DelayedSpinner,
    errorFallback,
    delay = 200,
  } = options;

  return function LazyWrapper(props: P) {
    return (
      <LazyComponent
        fallback={<Fallback delay={delay} />}
        errorFallback={errorFallback}
      >
        <LazyComponent {...props} />
      </LazyComponent>
    );
  };
}

/**
 * Lazy Load with Retry Logic
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const { retryCount = 3 } = options;

  return React.lazy(async () => {
    let lastError: Error;

    for (let i = 0; i <= retryCount; i++) {
      try {
        return await importFunc();
      } catch (error) {
        lastError = error as Error;
        
        if (i < retryCount) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, i) * 1000)
          );
        }
      }
    }

    throw lastError!;
  });
}

/**
 * Intersection Observer Lazy Loading
 */
interface IntersectionLazyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
}

export const IntersectionLazy: React.FC<IntersectionLazyProps> = ({
  children,
  fallback = <SkeletonLoader />,
  rootMargin = '50px',
  threshold = 0.1,
  triggerOnce = true,
  className = '',
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasTriggered, setHasTriggered] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            setHasTriggered(true);
            observer.disconnect();
          }
        } else if (!triggerOnce && !hasTriggered) {
          setIsVisible(false);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold, triggerOnce, hasTriggered]);

  return (
    <div ref={ref} className={className}>
      {isVisible || hasTriggered ? children : fallback}
    </div>
  );
};

/**
 * Image Lazy Loading Component
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  blurDataURL,
  onLoad,
  onError,
  className = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse">
          {blurDataURL && (
            <img
              src={blurDataURL}
              alt=""
              className="w-full h-full object-cover filter blur-sm"
            />
          )}
        </div>
      )}

      {/* Actual Image */}
      <img
        ref={imgRef}
        src={isInView ? src : placeholder}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...props}
      />

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
};
