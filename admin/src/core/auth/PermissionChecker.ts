import { PermissionChecker, Permission, UserRole, User } from './types';

/**
 * Permission Checker Implementation
 * 
 * Implements Single Responsibility Principle by focusing solely on permission logic.
 * Provides a clean interface for checking user permissions and roles.
 */
export class UserPermissionChecker implements PermissionChecker {
  constructor(private user: User | null) {}

  hasPermission(permission: Permission): boolean {
    if (!this.user) return false;
    return this.user.permissions.includes(permission);
  }

  hasRole(role: UserRole): boolean {
    if (!this.user) return false;
    return this.user.role === role;
  }

  hasAnyPermission(permissions: Permission[]): boolean {
    if (!this.user) return false;
    return permissions.some(permission => this.user!.permissions.includes(permission));
  }

  hasAllPermissions(permissions: Permission[]): boolean {
    if (!this.user) return false;
    return permissions.every(permission => this.user!.permissions.includes(permission));
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  isModerator(): boolean {
    return this.hasRole(UserRole.MODERATOR);
  }

  isUser(): boolean {
    return this.hasRole(UserRole.USER);
  }

  canManageUsers(): boolean {
    return this.hasAnyPermission([Permission.WRITE_USERS, Permission.DELETE_USERS]);
  }

  canViewAnalytics(): boolean {
    return this.hasPermission(Permission.READ_ANALYTICS);
  }

  canManageSettings(): boolean {
    return this.hasPermission(Permission.MANAGE_SETTINGS);
  }
}

/**
 * Role-based Permission Mapping
 * 
 * Defines default permissions for each role.
 * Follows Open/Closed Principle - easy to extend with new roles.
 */
export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.READ_USERS,
    Permission.WRITE_USERS,
    Permission.DELETE_USERS,
    Permission.READ_ANALYTICS,
    Permission.WRITE_ANALYTICS,
    Permission.MANAGE_SETTINGS,
  ],
  [UserRole.MODERATOR]: [
    Permission.READ_USERS,
    Permission.WRITE_USERS,
    Permission.READ_ANALYTICS,
  ],
  [UserRole.USER]: [
    Permission.READ_USERS,
  ],
};

/**
 * Permission Utility Functions
 */
export const PermissionUtils = {
  /**
   * Get default permissions for a role
   */
  getDefaultPermissions(role: UserRole): Permission[] {
    return RolePermissions[role] || [];
  },

  /**
   * Check if a role has a specific permission by default
   */
  roleHasPermission(role: UserRole, permission: Permission): boolean {
    return RolePermissions[role]?.includes(permission) || false;
  },

  /**
   * Get all available permissions
   */
  getAllPermissions(): Permission[] {
    return Object.values(Permission);
  },

  /**
   * Get permission display name
   */
  getPermissionDisplayName(permission: Permission): string {
    const displayNames: Record<Permission, string> = {
      [Permission.READ_USERS]: 'View Users',
      [Permission.WRITE_USERS]: 'Edit Users',
      [Permission.DELETE_USERS]: 'Delete Users',
      [Permission.READ_ANALYTICS]: 'View Analytics',
      [Permission.WRITE_ANALYTICS]: 'Edit Analytics',
      [Permission.MANAGE_SETTINGS]: 'Manage Settings',
    };
    
    return displayNames[permission] || permission;
  },

  /**
   * Get role display name
   */
  getRoleDisplayName(role: UserRole): string {
    const displayNames: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.MODERATOR]: 'Moderator',
      [UserRole.USER]: 'User',
    };
    
    return displayNames[role] || role;
  },
};
