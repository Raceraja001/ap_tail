import {
  AuthService,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  RefreshTokenResponse,
  User,
  AuthError,
  UserRole,
  Permission,
} from './types';

/**
 * Authentication Service Implementation
 * 
 * Implements Single Responsibility Principle by handling only authentication logic.
 * Implements Dependency Inversion Principle by depending on abstractions (interfaces).
 * 
 * In a real application, this would make HTTP requests to your backend API.
 * For demo purposes, this includes mock implementations.
 */
export class ApiAuthService implements AuthService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/api/auth') {
    this.baseUrl = baseUrl;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // In production, this would be a real API call
      const response = await this.mockApiCall('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await this.mockApiCall('/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response = await this.mockApiCall('/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.mockApiCall('/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Logout should not fail the user experience
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.mockApiCall('/me', {
        method: 'GET',
      });

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Mock API implementation for demo purposes
  private async mockApiCall(endpoint: string, options: RequestInit): Promise<Response> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const url = `${this.baseUrl}${endpoint}`;
    
    // Mock responses based on endpoint
    switch (endpoint) {
      case '/login':
        return this.mockLogin(options);
      case '/register':
        return this.mockRegister(options);
      case '/refresh':
        return this.mockRefresh(options);
      case '/logout':
        return new Response(null, { status: 200 });
      case '/me':
        return this.mockGetCurrentUser();
      default:
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }
  }

  private async mockLogin(options: RequestInit): Promise<Response> {
    const body = JSON.parse(options.body as string) as LoginCredentials;
    
    // Mock validation
    if (body.email === 'admin@example.com' && body.password === 'password') {
      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: UserRole.ADMIN,
          permissions: [Permission.READ_USERS, Permission.WRITE_USERS, Permission.MANAGE_SETTINGS],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: Date.now() + 3600000, // 1 hour
        },
      };
      
      return new Response(JSON.stringify(mockResponse), { status: 200 });
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid credentials' }),
      { status: 401 }
    );
  }

  private async mockRegister(options: RequestInit): Promise<Response> {
    const body = JSON.parse(options.body as string) as RegisterCredentials;
    
    // Mock validation
    if (body.password !== body.confirmPassword) {
      return new Response(
        JSON.stringify({ error: 'Passwords do not match' }),
        { status: 400 }
      );
    }
    
    const mockResponse: AuthResponse = {
      user: {
        id: '2',
        email: body.email,
        name: body.name,
        role: UserRole.USER,
        permissions: [Permission.READ_USERS],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: Date.now() + 3600000,
      },
    };
    
    return new Response(JSON.stringify(mockResponse), { status: 201 });
  }

  private async mockRefresh(options: RequestInit): Promise<Response> {
    const mockResponse: RefreshTokenResponse = {
      tokens: {
        accessToken: 'new-mock-access-token',
        refreshToken: 'new-mock-refresh-token',
        expiresAt: Date.now() + 3600000,
      },
    };
    
    return new Response(JSON.stringify(mockResponse), { status: 200 });
  }

  private async mockGetCurrentUser(): Promise<Response> {
    const mockUser: User = {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      permissions: [Permission.READ_USERS, Permission.WRITE_USERS, Permission.MANAGE_SETTINGS],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return new Response(JSON.stringify(mockUser), { status: 200 });
  }

  private async handleApiError(response: Response): Promise<AuthError> {
    try {
      const errorData = await response.json();
      return {
        code: `HTTP_${response.status}`,
        message: errorData.error || 'An error occurred',
        details: errorData,
      };
    } catch {
      return {
        code: `HTTP_${response.status}`,
        message: 'An unexpected error occurred',
      };
    }
  }

  private normalizeError(error: any): AuthError {
    if (error.code && error.message) {
      return error as AuthError;
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error,
    };
  }
}
