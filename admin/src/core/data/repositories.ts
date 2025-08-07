import { BaseRepository, QueryParams, PaginatedResult } from './Repository';
import { User, UserRole } from '../auth/types';

/**
 * Domain Entity Interfaces
 */
export interface DashboardStats {
  id: string;
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyGrowth: number;
  newSignups: number;
  conversionRate: number;
  updatedAt: string;
}

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  period: 'day' | 'week' | 'month' | 'year';
  data: Array<{
    label: string;
    value: number;
    date?: string;
  }>;
  updatedAt: string;
}

export interface Settings {
  id: string;
  category: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object';
  description?: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * User Repository
 */
export class UserRepository extends BaseRepository<User> {
  protected endpoint = '/users';

  async findByEmail(email: string): Promise<User | null> {
    try {
      const response = await this.httpClient.get(`${this.endpoint}/email/${email}`);
      return response.data || response;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async findByRole(role: UserRole, params?: QueryParams): Promise<User[]> {
    const queryString = this.buildQueryString({ ...params, role });
    const response = await this.httpClient.get(`${this.endpoint}${queryString}`);
    return response.data || response;
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    await this.httpClient.put(`${this.endpoint}/${id}/password`, {
      currentPassword,
      newPassword,
    });
  }

  async updateStatus(id: string, isActive: boolean): Promise<User> {
    const response = await this.httpClient.patch(`${this.endpoint}/${id}/status`, {
      isActive,
    });
    return response.data || response;
  }

  async getActiveUsers(params?: QueryParams): Promise<User[]> {
    return this.findByRole(UserRole.USER, { ...params, filters: { isActive: true } });
  }

  async searchUsers(query: string, params?: QueryParams): Promise<PaginatedResult<User>> {
    return this.findPaginated({ ...params, search: query });
  }
}

/**
 * Dashboard Repository
 */
export class DashboardRepository extends BaseRepository<DashboardStats> {
  protected endpoint = '/dashboard';

  async getStats(): Promise<DashboardStats> {
    const response = await this.httpClient.get(`${this.endpoint}/stats`);
    return response.data || response;
  }

  async getChartData(type: string, period: string): Promise<ChartData> {
    const response = await this.httpClient.get(`${this.endpoint}/charts/${type}?period=${period}`);
    return response.data || response;
  }

  async getRecentActivity(limit: number = 10): Promise<any[]> {
    const response = await this.httpClient.get(`${this.endpoint}/activity?limit=${limit}`);
    return response.data || response;
  }

  async exportData(format: 'csv' | 'xlsx' | 'pdf', params?: any): Promise<Blob> {
    const queryString = this.buildQueryString({ ...params, format });
    const response = await this.httpClient.get(`${this.endpoint}/export${queryString}`, {
      responseType: 'blob',
    });
    return response;
  }
}

/**
 * Settings Repository
 */
export class SettingsRepository extends BaseRepository<Settings> {
  protected endpoint = '/settings';

  async getByCategory(category: string): Promise<Settings[]> {
    const response = await this.httpClient.get(`${this.endpoint}/category/${category}`);
    return response.data || response;
  }

  async getByKey(key: string): Promise<Settings | null> {
    try {
      const response = await this.httpClient.get(`${this.endpoint}/key/${key}`);
      return response.data || response;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async updateByKey(key: string, value: any): Promise<Settings> {
    const response = await this.httpClient.put(`${this.endpoint}/key/${key}`, { value });
    return response.data || response;
  }

  async resetToDefaults(category?: string): Promise<void> {
    const endpoint = category 
      ? `${this.endpoint}/reset/${category}` 
      : `${this.endpoint}/reset`;
    await this.httpClient.post(endpoint);
  }

  async bulkUpdate(updates: Array<{ key: string; value: any }>): Promise<Settings[]> {
    const response = await this.httpClient.put(`${this.endpoint}/bulk`, { updates });
    return response.data || response;
  }
}

/**
 * Notification Repository
 */
export class NotificationRepository extends BaseRepository<Notification> {
  protected endpoint = '/notifications';

  async getUnreadCount(userId: string): Promise<number> {
    const response = await this.httpClient.get(`${this.endpoint}/unread-count/${userId}`);
    return response.count || response.data?.count || 0;
  }

  async markAsRead(id: string): Promise<Notification> {
    const response = await this.httpClient.patch(`${this.endpoint}/${id}/read`);
    return response.data || response;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.httpClient.patch(`${this.endpoint}/mark-all-read/${userId}`);
  }

  async getByUser(userId: string, params?: QueryParams): Promise<PaginatedResult<Notification>> {
    return this.findPaginated({ ...params, filters: { userId } });
  }

  async deleteOld(olderThanDays: number = 30): Promise<number> {
    const response = await this.httpClient.delete(`${this.endpoint}/old?days=${olderThanDays}`);
    return response.deletedCount || response.data?.deletedCount || 0;
  }

  async createBulk(notifications: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Notification[]> {
    const response = await this.httpClient.post(`${this.endpoint}/bulk`, { notifications });
    return response.data || response;
  }
}

/**
 * Repository Factory
 * 
 * Implements Factory Pattern for creating repository instances.
 * Follows Dependency Injection pattern.
 */
export class RepositoryFactory {
  constructor(private httpClient: any) {}

  createUserRepository(): UserRepository {
    return new UserRepository(this.httpClient);
  }

  createDashboardRepository(): DashboardRepository {
    return new DashboardRepository(this.httpClient);
  }

  createSettingsRepository(): SettingsRepository {
    return new SettingsRepository(this.httpClient);
  }

  createNotificationRepository(): NotificationRepository {
    return new NotificationRepository(this.httpClient);
  }
}

/**
 * Repository Provider Hook
 */
export const useRepositories = (httpClient: any) => {
  const factory = new RepositoryFactory(httpClient);
  
  return {
    userRepository: factory.createUserRepository(),
    dashboardRepository: factory.createDashboardRepository(),
    settingsRepository: factory.createSettingsRepository(),
    notificationRepository: factory.createNotificationRepository(),
  };
};
