/**
 * Repository Pattern Implementation
 * 
 * Implements Repository Pattern for data access abstraction.
 * Follows Single Responsibility Principle by separating data access logic.
 * Implements Dependency Inversion Principle through interfaces.
 */

export interface Repository<T, K = string> {
  findAll(params?: any): Promise<T[]>;
  findById(id: K): Promise<T | null>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: K, entity: Partial<T>): Promise<T>;
  delete(id: K): Promise<void>;
  count(params?: any): Promise<number>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

/**
 * Base Repository Implementation
 */
export abstract class BaseRepository<T extends { id: string }, K = string> implements Repository<T, K> {
  protected abstract endpoint: string;

  constructor(protected httpClient: any) {}

  async findAll(params?: QueryParams): Promise<T[]> {
    const queryString = this.buildQueryString(params);
    const response = await this.httpClient.get(`${this.endpoint}${queryString}`);
    return response.data || response;
  }

  async findById(id: K): Promise<T | null> {
    try {
      const response = await this.httpClient.get(`${this.endpoint}/${id}`);
      return response.data || response;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async create(entity: Omit<T, 'id'>): Promise<T> {
    const response = await this.httpClient.post(this.endpoint, entity);
    return response.data || response;
  }

  async update(id: K, entity: Partial<T>): Promise<T> {
    const response = await this.httpClient.put(`${this.endpoint}/${id}`, entity);
    return response.data || response;
  }

  async delete(id: K): Promise<void> {
    await this.httpClient.delete(`${this.endpoint}/${id}`);
  }

  async count(params?: QueryParams): Promise<number> {
    const queryString = this.buildQueryString({ ...params, countOnly: true });
    const response = await this.httpClient.get(`${this.endpoint}/count${queryString}`);
    return response.count || response.data?.count || 0;
  }

  async findPaginated(params?: QueryParams): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10, ...otherParams } = params || {};
    const queryString = this.buildQueryString({ page, limit, ...otherParams });
    
    const response = await this.httpClient.get(`${this.endpoint}${queryString}`);
    
    // Handle different response formats
    if (response.data && response.meta) {
      // Standard paginated response
      return {
        data: response.data,
        total: response.meta.total,
        page: response.meta.page,
        limit: response.meta.limit,
        totalPages: response.meta.totalPages,
        hasNext: response.meta.hasNext,
        hasPrev: response.meta.hasPrev,
      };
    } else if (response.items) {
      // Alternative format
      const total = response.total || response.items.length;
      const totalPages = Math.ceil(total / limit);
      
      return {
        data: response.items,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } else {
      // Fallback for simple array response
      const data = Array.isArray(response) ? response : response.data || [];
      const total = data.length;
      const totalPages = Math.ceil(total / limit);
      
      return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    }
  }

  protected buildQueryString(params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }

    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object') {
          searchParams.append(key, JSON.stringify(value));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }
}

/**
 * In-Memory Repository Implementation (for testing/mocking)
 */
export class InMemoryRepository<T extends { id: string }> implements Repository<T> {
  private data: Map<string, T> = new Map();
  private idCounter = 1;

  constructor(initialData: T[] = []) {
    initialData.forEach(item => {
      this.data.set(item.id, item);
    });
  }

  async findAll(params?: QueryParams): Promise<T[]> {
    let items = Array.from(this.data.values());

    // Apply search filter
    if (params?.search) {
      const searchTerm = params.search.toLowerCase();
      items = items.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm)
        )
      );
    }

    // Apply custom filters
    if (params?.filters) {
      items = items.filter(item =>
        Object.entries(params.filters!).every(([key, value]) =>
          (item as any)[key] === value
        )
      );
    }

    // Apply sorting
    if (params?.sortBy) {
      const { sortBy, sortOrder = 'asc' } = params;
      items.sort((a, b) => {
        const aValue = (a as any)[sortBy];
        const bValue = (b as any)[sortBy];
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Apply pagination
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      const end = start + params.limit;
      items = items.slice(start, end);
    }

    return items;
  }

  async findById(id: string): Promise<T | null> {
    return this.data.get(id) || null;
  }

  async create(entity: Omit<T, 'id'>): Promise<T> {
    const id = String(this.idCounter++);
    const newEntity = { ...entity, id } as T;
    this.data.set(id, newEntity);
    return newEntity;
  }

  async update(id: string, entity: Partial<T>): Promise<T> {
    const existing = this.data.get(id);
    if (!existing) {
      throw new Error(`Entity with id ${id} not found`);
    }
    
    const updated = { ...existing, ...entity } as T;
    this.data.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!this.data.has(id)) {
      throw new Error(`Entity with id ${id} not found`);
    }
    this.data.delete(id);
  }

  async count(params?: QueryParams): Promise<number> {
    const items = await this.findAll(params);
    return items.length;
  }

  // Utility methods for testing
  clear(): void {
    this.data.clear();
    this.idCounter = 1;
  }

  seed(data: T[]): void {
    this.clear();
    data.forEach(item => {
      this.data.set(item.id, item);
    });
  }
}
