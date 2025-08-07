import { AuthState, AuthTokens, User, AuthResponse } from './types';

/**
 * Authentication Action Types
 * 
 * Implements Command Pattern for state mutations.
 * Each action represents a specific state change operation.
 */
export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthResponse }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: AuthTokens }
  | { type: 'UPDATE_USER'; payload: User };

/**
 * Authentication Reducer
 * 
 * Implements Single Responsibility Principle by handling only auth state changes.
 * Follows Immutability principle for predictable state updates.
 * 
 * @param state Current authentication state
 * @param action Action to perform
 * @returns New authentication state
 */
export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        tokens: action.payload,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
};

/**
 * Action Creators
 * 
 * Factory functions for creating action objects.
 * Provides type safety and consistency.
 */
export const authActions = {
  setLoading: (loading: boolean): AuthAction => ({
    type: 'SET_LOADING',
    payload: loading,
  }),

  setError: (error: string): AuthAction => ({
    type: 'SET_ERROR',
    payload: error,
  }),

  clearError: (): AuthAction => ({
    type: 'CLEAR_ERROR',
  }),

  loginSuccess: (response: AuthResponse): AuthAction => ({
    type: 'LOGIN_SUCCESS',
    payload: response,
  }),

  logout: (): AuthAction => ({
    type: 'LOGOUT',
  }),

  refreshTokenSuccess: (tokens: AuthTokens): AuthAction => ({
    type: 'REFRESH_TOKEN_SUCCESS',
    payload: tokens,
  }),

  updateUser: (user: User): AuthAction => ({
    type: 'UPDATE_USER',
    payload: user,
  }),
};
