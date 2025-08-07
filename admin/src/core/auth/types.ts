/**
 * Authentication Types and Interfaces
 * 
 * Implements Interface Segregation Principle by defining specific interfaces
 * for different authentication concerns.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export enum Permission {
  READ_USERS = 'read:users',
  WRITE_USERS = 'write:users',
  DELETE_USERS = 'delete:users',
  READ_ANALYTICS = 'read:analytics',
  WRITE_ANALYTICS = 'write:analytics',
  MANAGE_SETTINGS = 'manage:settings',
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// API Response types
export interface LoginResponse extends AuthResponse {}
export interface RegisterResponse extends AuthResponse {}
export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

// Storage interface for dependency injection
export interface AuthStorage {
  getTokens(): AuthTokens | null;
  setTokens(tokens: AuthTokens): void;
  removeTokens(): void;
  getUser(): User | null;
  setUser(user: User): void;
  removeUser(): void;
}

// Auth service interface for dependency injection
export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(credentials: RegisterCredentials): Promise<AuthResponse>;
  refreshToken(refreshToken: string): Promise<RefreshTokenResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
}

// Permission checker interface
export interface PermissionChecker {
  hasPermission(permission: Permission): boolean;
  hasRole(role: UserRole): boolean;
  hasAnyPermission(permissions: Permission[]): boolean;
  hasAllPermissions(permissions: Permission[]): boolean;
}
