import { HttpClient, HttpClientConfig } from '../http/HttpClient';

/**
 * API Service Base Class
 * 
 * Implements Single Responsibility Principle by providing a base for API services.
 * Follows Dependency Injection pattern for HTTP client.
 */
export abstract class ApiService {
  protected httpClient: HttpClient;

  constructor(httpClient?: HttpClient) {
    this.httpClient = httpClient || this.createDefaultHttpClient();
    this.setupInterceptors();
  }

  private createDefaultHttpClient(): HttpClient {
    const config: HttpClientConfig = {
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
    };

    return new HttpClient(config);
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.httpClient.addRequestInterceptor((config) => {
      const token = this.getAuthToken();
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    });

    // Response interceptor for error handling
    this.httpClient.addResponseInterceptor({
      onRejected: async (error) => {
        // Handle 401 errors by redirecting to login
        if (error.status === 401) {
          this.handleUnauthorized();
        }
        return error;
      },
    });
  }

  private getAuthToken(): string | null {
    try {
      const tokens = localStorage.getItem('auth_tokens');
      if (tokens) {
        const parsed = JSON.parse(tokens);
        return parsed.accessToken;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return null;
  }

  private handleUnauthorized() {
    // Clear auth data and redirect to login
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('auth_user');
    
    // Only redirect if not already on auth pages
    if (!window.location.pathname.includes('/signin')) {
      window.location.href = '/signin';
    }
  }
}

/**
 * User API Service
 */
export class UserApiService extends ApiService {
  async getUsers(params?: { page?: number; limit?: number; search?: string }) {
    return this.httpClient.get('/users', { 
      url: '/users' + (params ? `?${new URLSearchParams(params as any)}` : '')
    });
  }

  async getUser(id: string) {
    return this.httpClient.get(`/users/${id}`);
  }

  async createUser(userData: any) {
    return this.httpClient.post('/users', userData);
  }

  async updateUser(id: string, userData: any) {
    return this.httpClient.put(`/users/${id}`, userData);
  }

  async deleteUser(id: string) {
    return this.httpClient.delete(`/users/${id}`);
  }
}

/**
 * Analytics API Service
 */
export class AnalyticsApiService extends ApiService {
  async getDashboardStats() {
    return this.httpClient.get('/analytics/dashboard');
  }

  async getChartData(type: string, period: string) {
    return this.httpClient.get(`/analytics/charts/${type}?period=${period}`);
  }

  async getReports(params?: { startDate?: string; endDate?: string; type?: string }) {
    return this.httpClient.get('/analytics/reports', {
      url: '/analytics/reports' + (params ? `?${new URLSearchParams(params as any)}` : '')
    });
  }
}

/**
 * Settings API Service
 */
export class SettingsApiService extends ApiService {
  async getSettings() {
    return this.httpClient.get('/settings');
  }

  async updateSettings(settings: any) {
    return this.httpClient.put('/settings', settings);
  }

  async resetSettings() {
    return this.httpClient.post('/settings/reset');
  }
}

/**
 * API Service Factory
 * 
 * Implements Factory Pattern for creating API service instances.
 */
export class ApiServiceFactory {
  private static httpClient: HttpClient;

  static getHttpClient(): HttpClient {
    if (!this.httpClient) {
      this.httpClient = new HttpClient({
        baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
        timeout: 10000,
        retries: 3,
      });
    }
    return this.httpClient;
  }

  static createUserService(): UserApiService {
    return new UserApiService(this.getHttpClient());
  }

  static createAnalyticsService(): AnalyticsApiService {
    return new AnalyticsApiService(this.getHttpClient());
  }

  static createSettingsService(): SettingsApiService {
    return new SettingsApiService(this.getHttpClient());
  }
}
