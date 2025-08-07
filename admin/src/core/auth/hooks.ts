import { useAuth } from './AuthProvider';
import { UserPermissionChecker } from './PermissionChecker';
import { Permission, UserRole } from './types';

/**
 * Authentication Hooks
 * 
 * Implements Single Responsibility Principle by providing focused hooks
 * for specific authentication concerns.
 */

/**
 * Hook for permission checking
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const permissionChecker = new UserPermissionChecker(user);

  return {
    hasPermission: (permission: Permission) => permissionChecker.hasPermission(permission),
    hasRole: (role: UserRole) => permissionChecker.hasRole(role),
    hasAnyPermission: (permissions: Permission[]) => permissionChecker.hasAnyPermission(permissions),
    hasAllPermissions: (permissions: Permission[]) => permissionChecker.hasAllPermissions(permissions),
    isAdmin: () => permissionChecker.isAdmin(),
    isModerator: () => permissionChecker.isModerator(),
    isUser: () => permissionChecker.isUser(),
    canManageUsers: () => permissionChecker.canManageUsers(),
    canViewAnalytics: () => permissionChecker.canViewAnalytics(),
    canManageSettings: () => permissionChecker.canManageSettings(),
  };
};

/**
 * Hook for user information
 */
export const useUser = () => {
  const { user, updateUser } = useAuth();
  
  return {
    user,
    updateUser,
    isLoggedIn: !!user,
  };
};

/**
 * Hook for authentication actions
 */
export const useAuthActions = () => {
  const { login, register, logout, clearError } = useAuth();
  
  return {
    login,
    register,
    logout,
    clearError,
  };
};

/**
 * Hook for authentication state
 */
export const useAuthState = () => {
  const { isAuthenticated, isLoading, error } = useAuth();
  
  return {
    isAuthenticated,
    isLoading,
    error,
  };
};
