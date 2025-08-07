import { Suspense } from "react";
import { BrowserRouter as Router } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Core Providers
import { AuthProvider } from "./core/auth/AuthProvider";
import { NotificationProvider } from "./core/notifications/NotificationProvider";
import { ErrorBoundary } from "./core/error/ErrorBoundary";

// Components
import { AppRoutes } from "./core/routing/AppRoutes";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { GlobalLoadingSpinner } from "./components/common/GlobalLoadingSpinner";

// Create QueryClient with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Main Application Component
 *
 * Implements the Provider Pattern and follows Single Responsibility Principle
 * by delegating routing, state management, and error handling to specialized components.
 *
 * Architecture Principles Applied:
 * - Separation of Concerns: Each provider handles a specific domain
 * - Dependency Injection: Services are injected through context
 * - Error Isolation: ErrorBoundary prevents cascading failures
 * - Performance: Lazy loading and code splitting
 */
export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <NotificationProvider>
              <ScrollToTop />
              <Suspense fallback={<GlobalLoadingSpinner />}>
                <AppRoutes />
              </Suspense>
              <ReactQueryDevtools initialIsOpen={false} />
            </NotificationProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
