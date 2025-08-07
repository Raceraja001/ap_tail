import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AuthContextValue, AuthState, LoginCredentials, RegisterCredentials, User } from './types';
import { AuthService, ApiAuthService } from './AuthService';
import { AuthStorage, AuthStorageFactory } from './AuthStorage';
import { authReducer, AuthAction } from './authReducer';

// Create context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

interface AuthProviderProps {
  children: React.ReactNode;
  authService?: AuthService;
  storage?: AuthStorage;
}

/**
 * Authentication Provider Component
 * 
 * Implements Provider Pattern and Dependency Injection.
 * Follows Single Responsibility Principle by managing only authentication state.
 * 
 * Features:
 * - Centralized authentication state management
 * - Automatic token refresh
 * - Persistent authentication across sessions
 * - Error handling and recovery
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  authService = new ApiAuthService(),
  storage = AuthStorageFactory.create('local'),
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const tokens = storage.getTokens();
        const user = storage.getUser();

        if (tokens && user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, tokens } });
          
          // Verify token validity by fetching current user
          try {
            const currentUser = await authService.getCurrentUser();
            dispatch({ type: 'UPDATE_USER', payload: currentUser });
          } catch (error) {
            // Token might be invalid, try to refresh
            try {
              const refreshResponse = await authService.refreshToken(tokens.refreshToken);
              storage.setTokens(refreshResponse.tokens);
              dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: refreshResponse.tokens });
            } catch (refreshError) {
              // Refresh failed, logout user
              handleLogout();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        handleLogout();
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!state.tokens) return;

    const refreshBuffer = 5 * 60 * 1000; // 5 minutes before expiration
    const timeUntilRefresh = state.tokens.expiresAt - Date.now() - refreshBuffer;

    if (timeUntilRefresh <= 0) {
      // Token is already expired or about to expire
      refreshToken();
      return;
    }

    const refreshTimer = setTimeout(() => {
      refreshToken();
    }, timeUntilRefresh);

    return () => clearTimeout(refreshTimer);
  }, [state.tokens]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authService.login(credentials);
      
      // Store in persistent storage
      storage.setTokens(response.tokens);
      storage.setUser(response.user);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Login failed' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [authService, storage]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authService.register(credentials);
      
      // Store in persistent storage
      storage.setTokens(response.tokens);
      storage.setUser(response.user);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Registration failed' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [authService, storage]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      handleLogout();
    }
  }, [authService]);

  const handleLogout = useCallback(() => {
    storage.removeTokens();
    storage.removeUser();
    dispatch({ type: 'LOGOUT' });
  }, [storage]);

  const refreshToken = useCallback(async () => {
    if (!state.tokens?.refreshToken) return;

    try {
      const response = await authService.refreshToken(state.tokens.refreshToken);
      storage.setTokens(response.tokens);
      dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: response.tokens });
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleLogout();
    }
  }, [state.tokens, authService, storage, handleLogout]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!state.user) return;
    
    const updatedUser = { ...state.user, ...updates };
    storage.setUser(updatedUser);
    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
  }, [state.user, storage]);

  const contextValue: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
