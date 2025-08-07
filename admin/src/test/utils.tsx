import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../core/auth/AuthProvider';
import { NotificationProvider } from '../core/notifications/NotificationProvider';
import { User, UserRole, Permission } from '../core/auth/types';

/**
 * Test Utilities
 * 
 * Provides utilities for testing React components with proper context providers.
 * Implements Test Helper Pattern for consistent test setup.
 */

// Mock user data
export const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: UserRole.USER,
  permissions: [Permission.READ_USERS],
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const mockAdminUser: User = {
  id: '2',
  email: 'admin@example.com',
  name: 'Admin User',
  role: UserRole.ADMIN,
  permissions: [
    Permission.READ_USERS,
    Permission.WRITE_USERS,
    Permission.DELETE_USERS,
    Permission.READ_ANALYTICS,
    Permission.WRITE_ANALYTICS,
    Permission.MANAGE_SETTINGS,
  ],
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

// Create a test query client
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// Mock auth service
export const createMockAuthService = (user: User | null = null) => ({
  login: vi.fn().mockResolvedValue({
    user: user || mockUser,
    tokens: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: Date.now() + 3600000,
    },
  }),
  register: vi.fn().mockResolvedValue({
    user: user || mockUser,
    tokens: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: Date.now() + 3600000,
    },
  }),
  logout: vi.fn().mockResolvedValue(undefined),
  refreshToken: vi.fn().mockResolvedValue({
    tokens: {
      accessToken: 'new-mock-access-token',
      refreshToken: 'new-mock-refresh-token',
      expiresAt: Date.now() + 3600000,
    },
  }),
  getCurrentUser: vi.fn().mockResolvedValue(user || mockUser),
});

// Mock storage
export const createMockStorage = (initialData: Record<string, any> = {}) => {
  const storage = { ...initialData };
  
  return {
    getTokens: vi.fn().mockReturnValue(storage.tokens || null),
    setTokens: vi.fn().mockImplementation((tokens) => { storage.tokens = tokens; }),
    removeTokens: vi.fn().mockImplementation(() => { delete storage.tokens; }),
    getUser: vi.fn().mockReturnValue(storage.user || null),
    setUser: vi.fn().mockImplementation((user) => { storage.user = user; }),
    removeUser: vi.fn().mockImplementation(() => { delete storage.user; }),
  };
};

// Test wrapper component
interface TestWrapperProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  initialUser?: User | null;
  authService?: any;
  storage?: any;
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  queryClient = createTestQueryClient(),
  initialUser = null,
  authService = createMockAuthService(initialUser),
  storage = createMockStorage(initialUser ? { user: initialUser } : {}),
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider authService={authService} storage={storage}>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialUser?: User | null;
  authService?: any;
  storage?: any;
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    queryClient,
    initialUser,
    authService,
    storage,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestWrapper
      queryClient={queryClient}
      initialUser={initialUser}
      authService={authService}
      storage={storage}
    >
      {children}
    </TestWrapper>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Helper to wait for async operations
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Mock form data
export const mockFormData = {
  signIn: {
    email: 'test@example.com',
    password: 'password123',
    rememberMe: false,
  },
  signUp: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    acceptTerms: true,
  },
  createUser: {
    name: 'New User',
    email: 'newuser@example.com',
    role: UserRole.USER,
    phone: '+1234567890',
    isActive: true,
  },
};

// Mock API responses
export const mockApiResponses = {
  users: [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'admin' },
  ],
  dashboardStats: {
    totalUsers: 150,
    activeUsers: 120,
    totalRevenue: 50000,
    monthlyGrowth: 12.5,
  },
  chartData: {
    type: 'line',
    data: [
      { label: 'Jan', value: 100 },
      { label: 'Feb', value: 120 },
      { label: 'Mar', value: 140 },
    ],
  },
};

// Test data generators
export const generateMockUsers = (count: number): User[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    email: `user${index + 1}@example.com`,
    name: `User ${index + 1}`,
    role: index === 0 ? UserRole.ADMIN : UserRole.USER,
    permissions: index === 0 ? [Permission.READ_USERS, Permission.WRITE_USERS] : [Permission.READ_USERS],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
};

// Custom matchers
export const customMatchers = {
  toBeInTheDocument: (received: any) => {
    const pass = received !== null && received !== undefined;
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to be in the document`,
      pass,
    };
  },
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Import vi from vitest
import { vi } from 'vitest';
