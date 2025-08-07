/**
 * HTTP Client with Resilience Patterns
 * 
 * Implements:
 * - Retry mechanism with exponential backoff
 * - Circuit breaker pattern
 * - Request/response interceptors
 * - Timeout handling
 * - Error normalization
 */

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  retryDelayMultiplier?: number;
  maxRetryDelay?: number;
  circuitBreakerThreshold?: number;
  circuitBreakerTimeout?: number;
}

export interface RequestConfig extends RequestInit {
  url: string;
  timeout?: number;
  retries?: number;
  skipRetry?: boolean;
}

export interface HttpError extends Error {
  status?: number;
  statusText?: string;
  response?: Response;
  isTimeout?: boolean;
  isNetworkError?: boolean;
}

export interface RequestInterceptor {
  (config: RequestConfig): RequestConfig | Promise<RequestConfig>;
}

export interface ResponseInterceptor {
  onFulfilled?: (response: Response) => Response | Promise<Response>;
  onRejected?: (error: HttpError) => HttpError | Promise<HttpError>;
}

/**
 * Circuit Breaker Implementation
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return this.state;
  }
}

/**
 * HTTP Client Implementation
 */
export class HttpClient {
  private config: Required<HttpClientConfig>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private circuitBreaker: CircuitBreaker;

  constructor(config: HttpClientConfig = {}) {
    this.config = {
      baseURL: '',
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      retryDelayMultiplier: 2,
      maxRetryDelay: 10000,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000,
      ...config,
    };

    this.circuitBreaker = new CircuitBreaker(
      this.config.circuitBreakerThreshold,
      this.config.circuitBreakerTimeout
    );
  }

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  async get<T>(url: string, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  async post<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({
      ...config,
      url,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });
  }

  async put<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({
      ...config,
      url,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });
  }

  async delete<T>(url: string, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  private async request<T>(config: RequestConfig): Promise<T> {
    // Apply request interceptors
    let finalConfig = config;
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }

    const url = this.buildUrl(finalConfig.url);
    const retries = finalConfig.retries ?? this.config.retries;

    return this.circuitBreaker.execute(async () => {
      return this.executeWithRetry<T>(url, finalConfig, retries);
    });
  }

  private async executeWithRetry<T>(
    url: string,
    config: RequestConfig,
    retriesLeft: number
  ): Promise<T> {
    try {
      const response = await this.executeRequest(url, config);
      
      // Apply response interceptors
      let finalResponse = response;
      for (const interceptor of this.responseInterceptors) {
        if (interceptor.onFulfilled) {
          finalResponse = await interceptor.onFulfilled(finalResponse);
        }
      }

      if (!finalResponse.ok) {
        throw await this.createHttpError(finalResponse);
      }

      return await finalResponse.json();
    } catch (error) {
      const httpError = error as HttpError;
      
      // Apply error interceptors
      let finalError = httpError;
      for (const interceptor of this.responseInterceptors) {
        if (interceptor.onRejected) {
          finalError = await interceptor.onRejected(finalError);
        }
      }

      // Retry logic
      if (retriesLeft > 0 && this.shouldRetry(finalError) && !config.skipRetry) {
        const delay = this.calculateRetryDelay(this.config.retries - retriesLeft);
        await this.sleep(delay);
        return this.executeWithRetry<T>(url, config, retriesLeft - 1);
      }

      throw finalError;
    }
  }

  private async executeRequest(url: string, config: RequestConfig): Promise<Response> {
    const controller = new AbortController();
    const timeout = config.timeout ?? this.config.timeout;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout') as HttpError;
        timeoutError.isTimeout = true;
        throw timeoutError;
      }
      
      const networkError = new Error(error.message || 'Network error') as HttpError;
      networkError.isNetworkError = true;
      throw networkError;
    }
  }

  private async createHttpError(response: Response): Promise<HttpError> {
    let message = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error || message;
    } catch {
      // Ignore JSON parsing errors
    }

    const error = new Error(message) as HttpError;
    error.status = response.status;
    error.statusText = response.statusText;
    error.response = response;
    
    return error;
  }

  private shouldRetry(error: HttpError): boolean {
    // Don't retry client errors (4xx) except for specific cases
    if (error.status && error.status >= 400 && error.status < 500) {
      return [408, 429].includes(error.status); // Timeout, Too Many Requests
    }
    
    // Retry on network errors, timeouts, and server errors (5xx)
    return error.isNetworkError || error.isTimeout || (error.status && error.status >= 500);
  }

  private calculateRetryDelay(attempt: number): number {
    const delay = this.config.retryDelay * Math.pow(this.config.retryDelayMultiplier, attempt);
    return Math.min(delay, this.config.maxRetryDelay);
  }

  private buildUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    return `${this.config.baseURL}${url}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
