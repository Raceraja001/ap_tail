import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import { UserPermissionChecker } from '../auth/PermissionChecker';
import { Permission, UserRole } from '../auth/types';
import { GlobalLoadingSpinner } from '../../components/common/GlobalLoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRoles?: UserRole[];
  requireAll?: boolean; // If true, user must have ALL permissions/roles, otherwise ANY
  fallbackPath?: string;
}

/**
 * Protected Route Component
 * 
 * Implements Single Responsibility Principle by handling only route protection.
 * Implements Guard Pattern for access control.
 * 
 * Features:
 * - Authentication checking
 * - Permission-based access control
 * - Role-based access control
 * - Flexible permission requirements (ANY or ALL)
 * - Automatic redirection to login
 * - Loading state handling
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  requireAll = false,
  fallbackPath = '/signin',
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication is being determined
  if (isLoading) {
    return <GlobalLoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check permissions and roles if specified
  if (requiredPermissions.length > 0 || requiredRoles.length > 0) {
    const permissionChecker = new UserPermissionChecker(user);
    
    let hasRequiredAccess = true;

    // Check permissions
    if (requiredPermissions.length > 0) {
      const hasPermissions = requireAll
        ? permissionChecker.hasAllPermissions(requiredPermissions)
        : permissionChecker.hasAnyPermission(requiredPermissions);
      
      if (!hasPermissions) {
        hasRequiredAccess = false;
      }
    }

    // Check roles
    if (requiredRoles.length > 0 && hasRequiredAccess) {
      const hasRoles = requireAll
        ? requiredRoles.every(role => permissionChecker.hasRole(role))
        : requiredRoles.some(role => permissionChecker.hasRole(role));
      
      if (!hasRoles) {
        hasRequiredAccess = false;
      }
    }

    // Show access denied if user doesn't have required permissions/roles
    if (!hasRequiredAccess) {
      return <AccessDenied />;
    }
  }

  return <>{children}</>;
};

/**
 * Access Denied Component
 * 
 * Displayed when user doesn't have required permissions.
 */
const AccessDenied: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-7a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>

        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};
