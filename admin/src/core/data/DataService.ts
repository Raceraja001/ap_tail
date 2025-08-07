/**
 * Data Service Layer with Caching
 * 
 * Implements Service Layer Pattern for business logic.
 * Includes caching strategies and data transformation.
 * Follows Single Responsibility Principle.
 */

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of cached items
  strategy: 'lru' | 'fifo' | 'ttl'; // Cache eviction strategy
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * Simple In-Memory Cache Implementation
 */
export class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100,
      strategy: 'lru',
      ...config,
    };
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access information for LRU
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    return entry.data;
  }

  set(key: string, data: T, ttl?: number): void {
    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  size(): number {
    return this.cache.size;
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string;

    switch (this.config.strategy) {
      case 'lru':
        keyToEvict = this.findLRUKey();
        break;
      case 'fifo':
        keyToEvict = this.cache.keys().next().value;
        break;
      case 'ttl':
        keyToEvict = this.findOldestKey();
        break;
      default:
        keyToEvict = this.cache.keys().next().value;
    }

    this.cache.delete(keyToEvict);
  }

  private findLRUKey(): string {
    let lruKey = '';
    let oldestAccess = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        lruKey = key;
      }
    }

    return lruKey;
  }

  private findOldestKey(): string {
    let oldestKey = '';
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }
}

/**
 * Base Data Service with Caching
 */
export abstract class BaseDataService<T, R> {
  protected cache: MemoryCache<T>;
  protected repository: R;

  constructor(repository: R, cacheConfig?: Partial<CacheConfig>) {
    this.repository = repository;
    this.cache = new MemoryCache<T>(cacheConfig);
  }

  protected getCacheKey(method: string, ...args: any[]): string {
    const argsString = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(':');
    return `${method}:${argsString}`;
  }

  protected async withCache<TResult>(
    cacheKey: string,
    fetcher: () => Promise<TResult>,
    ttl?: number
  ): Promise<TResult> {
    // Try to get from cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached as TResult;
    }

    // Fetch from repository
    const result = await fetcher();
    
    // Cache the result
    this.cache.set(cacheKey, result as T, ttl);
    
    return result;
  }

  protected invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    // Simple pattern matching - in production, you might want a more sophisticated approach
    const keysToDelete: string[] = [];
    
    for (const key of Array.from(this.cache['cache'].keys())) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

/**
 * User Data Service
 */
export class UserDataService extends BaseDataService<any, any> {
  async getUsers(params?: any) {
    const cacheKey = this.getCacheKey('getUsers', params);
    return this.withCache(cacheKey, () => this.repository.findAll(params));
  }

  async getUserById(id: string) {
    const cacheKey = this.getCacheKey('getUserById', id);
    return this.withCache(cacheKey, () => this.repository.findById(id), 10 * 60 * 1000); // 10 minutes
  }

  async createUser(userData: any) {
    const result = await this.repository.create(userData);
    this.invalidateCache('getUsers'); // Invalidate user lists
    return result;
  }

  async updateUser(id: string, userData: any) {
    const result = await this.repository.update(id, userData);
    this.invalidateCache('getUsers');
    this.cache.delete(this.getCacheKey('getUserById', id));
    return result;
  }

  async deleteUser(id: string) {
    await this.repository.delete(id);
    this.invalidateCache('getUsers');
    this.cache.delete(this.getCacheKey('getUserById', id));
  }

  async searchUsers(query: string, params?: any) {
    // Don't cache search results as they're typically one-time queries
    return this.repository.searchUsers(query, params);
  }
}

/**
 * Dashboard Data Service
 */
export class DashboardDataService extends BaseDataService<any, any> {
  async getStats() {
    const cacheKey = this.getCacheKey('getStats');
    return this.withCache(cacheKey, () => this.repository.getStats(), 2 * 60 * 1000); // 2 minutes
  }

  async getChartData(type: string, period: string) {
    const cacheKey = this.getCacheKey('getChartData', type, period);
    return this.withCache(cacheKey, () => this.repository.getChartData(type, period), 5 * 60 * 1000); // 5 minutes
  }

  async getRecentActivity(limit?: number) {
    const cacheKey = this.getCacheKey('getRecentActivity', limit);
    return this.withCache(cacheKey, () => this.repository.getRecentActivity(limit), 1 * 60 * 1000); // 1 minute
  }

  async refreshStats() {
    this.invalidateCache('getStats');
    return this.getStats();
  }

  async refreshChartData(type?: string) {
    if (type) {
      this.invalidateCache(`getChartData:${type}`);
    } else {
      this.invalidateCache('getChartData');
    }
  }
}

/**
 * Settings Data Service
 */
export class SettingsDataService extends BaseDataService<any, any> {
  async getSettings() {
    const cacheKey = this.getCacheKey('getSettings');
    return this.withCache(cacheKey, () => this.repository.findAll(), 10 * 60 * 1000); // 10 minutes
  }

  async getSettingsByCategory(category: string) {
    const cacheKey = this.getCacheKey('getSettingsByCategory', category);
    return this.withCache(cacheKey, () => this.repository.getByCategory(category), 10 * 60 * 1000);
  }

  async updateSetting(key: string, value: any) {
    const result = await this.repository.updateByKey(key, value);
    this.invalidateCache(); // Invalidate all settings cache
    return result;
  }

  async bulkUpdateSettings(updates: Array<{ key: string; value: any }>) {
    const result = await this.repository.bulkUpdate(updates);
    this.invalidateCache(); // Invalidate all settings cache
    return result;
  }

  async resetSettings(category?: string) {
    await this.repository.resetToDefaults(category);
    this.invalidateCache(); // Invalidate all settings cache
  }
}

/**
 * Data Service Factory
 */
export class DataServiceFactory {
  constructor(private repositoryFactory: any) {}

  createUserDataService(cacheConfig?: Partial<CacheConfig>): UserDataService {
    const repository = this.repositoryFactory.createUserRepository();
    return new UserDataService(repository, cacheConfig);
  }

  createDashboardDataService(cacheConfig?: Partial<CacheConfig>): DashboardDataService {
    const repository = this.repositoryFactory.createDashboardRepository();
    return new DashboardDataService(repository, cacheConfig);
  }

  createSettingsDataService(cacheConfig?: Partial<CacheConfig>): SettingsDataService {
    const repository = this.repositoryFactory.createSettingsRepository();
    return new SettingsDataService(repository, cacheConfig);
  }
}
