import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorFallback } from "./ErrorFallback";

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Implements Single Responsibility Principle by focusing solely on error handling.
 * Follows the Circuit Breaker pattern to prevent cascading failures.
 * 
 * Features:
 * - Catches JavaScript errors anywhere in the child component tree
 * - Logs error information for debugging
 * - Displays fallback UI instead of crashing the entire app
 * - Provides error recovery mechanism
 */
export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    this.logErrorToService(error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In production, send to error monitoring service (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production') {
      console.error('Error Boundary caught an error:', error, errorInfo);
      // Example: Sentry.captureException(error, { extra: errorInfo });
    } else {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
  };

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private resetErrorWithDelay = () => {
    // Auto-reset after 5 seconds to attempt recovery
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetError();
    }, 5000);
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for creating error boundaries in functional components
 */
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    // This would typically integrate with your error reporting service
    console.error('Error caught by error handler:', error, errorInfo);
    
    // In a real app, you might want to show a toast notification
    // or trigger some other error handling mechanism
  };
};
