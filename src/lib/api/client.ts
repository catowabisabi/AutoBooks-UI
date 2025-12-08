/**
 * Typed API Client with Axios Interceptors
 * 具備完整 DTO 類型的 API 客戶端
 * 
 * Features:
 * - Full TypeScript type safety with generics
 * - Automatic token refresh on 401
 * - Rate limiting with queue
 * - Exponential backoff retry
 * - Request/response interceptors
 */

import type {
  PaginatedResponse,
  ApiError,
  ListParams,
  TokenResponse,
  TokenRefreshResponse,
} from './types';

// =================================================================
// Configuration / 配置
// =================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
const API_PREFIX = '/api/v1';

/** Rate limit configuration */
const RATE_LIMIT_CONFIG = {
  maxRequestsPerSecond: 10,
  maxConcurrent: 5,
};

/** Retry configuration */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffFactor: 2,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
};

// =================================================================
// Types / 類型
// =================================================================

export interface ApiClientConfig {
  baseUrl?: string;
  prefix?: string;
  timeout?: number;
  maxRetries?: number;
  rateLimit?: {
    maxRequestsPerSecond: number;
    maxConcurrent: number;
  };
}

export interface RequestConfig {
  skipAuth?: boolean;
  skipRetry?: boolean;
  timeout?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

interface QueuedRequest {
  execute: () => Promise<void>;
  timestamp: number;
}

type RequestInterceptor = (config: RequestInit & { url: string }) => RequestInit & { url: string };
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;
type ErrorInterceptor = (error: Error) => Error | Promise<never>;

// =================================================================
// Token Management / Token 管理
// =================================================================

class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token') || localStorage.getItem('token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  getAccessToken(): string | null {
    // Always re-read from storage to ensure consistency
    this.loadFromStorage();
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    this.loadFromStorage();
    return this.refreshToken;
  }

  setTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  async refresh(baseUrl: string): Promise<boolean> {
    // If already refreshing, wait for the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${baseUrl}${API_PREFIX}/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (response.ok) {
          const data: TokenRefreshResponse = await response.json();
          this.accessToken = data.access;
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('token', data.access);
          }
          return true;
        }

        // Refresh token invalid/expired
        this.clearTokens();
        return false;
      } catch (error) {
        console.error('[TokenManager] Refresh failed:', error);
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }
}

// =================================================================
// Rate Limiter / 請求速率限制器
// =================================================================

class RateLimiter {
  private queue: QueuedRequest[] = [];
  private activeRequests = 0;
  private requestTimestamps: number[] = [];
  private config: typeof RATE_LIMIT_CONFIG;

  constructor(config: typeof RATE_LIMIT_CONFIG = RATE_LIMIT_CONFIG) {
    this.config = config;
  }

  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      const request: QueuedRequest = {
        execute: async () => {
          await this.waitForSlot();
          this.activeRequests++;
          this.requestTimestamps.push(Date.now());
          resolve();
        },
        timestamp: Date.now(),
      };

      this.queue.push(request);
      this.processQueue();
    });
  }

  release(): void {
    this.activeRequests--;
    this.processQueue();
  }

  private async waitForSlot(): Promise<void> {
    const now = Date.now();
    
    // Clean up old timestamps (older than 1 second)
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < 1000
    );

    // Check rate limit
    if (this.requestTimestamps.length >= this.config.maxRequestsPerSecond) {
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = 1000 - (now - oldestTimestamp);
      if (waitTime > 0) {
        await this.sleep(waitTime);
      }
    }
  }

  private processQueue(): void {
    while (
      this.queue.length > 0 &&
      this.activeRequests < this.config.maxConcurrent
    ) {
      const request = this.queue.shift();
      if (request) {
        request.execute();
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =================================================================
// Retry Handler / 重試處理器
// =================================================================

class RetryHandler {
  private config: typeof RETRY_CONFIG;

  constructor(config: typeof RETRY_CONFIG = RETRY_CONFIG) {
    this.config = config;
  }

  shouldRetry(status: number, attempt: number): boolean {
    return (
      attempt < this.config.maxRetries &&
      this.config.retryStatusCodes.includes(status)
    );
  }

  getDelay(attempt: number): number {
    const delay = Math.min(
      this.config.initialDelayMs * Math.pow(this.config.backoffFactor, attempt),
      this.config.maxDelayMs
    );
    // Add jitter (±25%)
    const jitter = delay * 0.25 * (Math.random() * 2 - 1);
    return Math.round(delay + jitter);
  }

  async wait(attempt: number): Promise<void> {
    const delay = this.getDelay(attempt);
    console.log(`[RetryHandler] Retrying in ${delay}ms (attempt ${attempt + 1}/${this.config.maxRetries})`);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

// =================================================================
// API Client / API 客戶端
// =================================================================

export class TypedApiClient {
  private baseUrl: string;
  private prefix: string;
  private tokenManager: TokenManager;
  private rateLimiter: RateLimiter;
  private retryHandler: RetryHandler;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private defaultTimeout: number;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || API_BASE_URL;
    this.prefix = config.prefix || API_PREFIX;
    this.defaultTimeout = config.timeout || 30000;
    this.tokenManager = new TokenManager();
    this.rateLimiter = new RateLimiter(config.rateLimit);
    this.retryHandler = new RetryHandler({
      ...RETRY_CONFIG,
      maxRetries: config.maxRetries ?? RETRY_CONFIG.maxRetries,
    });
  }

  // ---------------------------------------------------------------
  // Interceptors / 攔截器
  // ---------------------------------------------------------------

  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.errorInterceptors.splice(index, 1);
      }
    };
  }

  // ---------------------------------------------------------------
  // Token Management / Token 管理
  // ---------------------------------------------------------------

  setTokens(access: string, refresh: string): void {
    this.tokenManager.setTokens(access, refresh);
  }

  clearTokens(): void {
    this.tokenManager.clearTokens();
  }

  isAuthenticated(): boolean {
    return this.tokenManager.isAuthenticated();
  }

  getAccessToken(): string | null {
    return this.tokenManager.getAccessToken();
  }

  // ---------------------------------------------------------------
  // Core Request Method / 核心請求方法
  // ---------------------------------------------------------------

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<T> {
    const { skipAuth = false, skipRetry = false, timeout = this.defaultTimeout, signal, headers: customHeaders = {} } = config;

    // Build URL
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${this.prefix}${endpoint}`;

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    // Add auth header if needed
    if (!skipAuth) {
      const token = this.tokenManager.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Build request config
    let requestConfig: RequestInit & { url: string } = {
      url,
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      requestConfig = interceptor(requestConfig);
    }

    // Execute with rate limiting and retry
    return this.executeWithRetry<T>(requestConfig, {
      skipAuth,
      skipRetry,
      timeout,
      signal,
    });
  }

  private async executeWithRetry<T>(
    requestConfig: RequestInit & { url: string },
    options: { skipAuth: boolean; skipRetry: boolean; timeout: number; signal?: AbortSignal }
  ): Promise<T> {
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= RETRY_CONFIG.maxRetries) {
      try {
        // Acquire rate limit slot
        await this.rateLimiter.acquire();

        try {
          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), options.timeout);

          // Merge with external signal if provided
          const signal = options.signal
            ? this.mergeAbortSignals(options.signal, controller.signal)
            : controller.signal;

          // Execute request
          let response = await fetch(requestConfig.url, {
            ...requestConfig,
            signal,
          });

          clearTimeout(timeoutId);

          // Apply response interceptors
          for (const interceptor of this.responseInterceptors) {
            response = await interceptor(response);
          }

          // Handle 401 - try to refresh token
          if (response.status === 401 && !options.skipAuth) {
            const refreshed = await this.tokenManager.refresh(this.baseUrl);
            if (refreshed) {
              // Retry with new token
              const newHeaders = {
                ...(requestConfig.headers as Record<string, string>),
                Authorization: `Bearer ${this.tokenManager.getAccessToken()}`,
              };
              response = await fetch(requestConfig.url, {
                ...requestConfig,
                headers: newHeaders,
              });
            } else {
              throw new Error('Authentication expired. Please log in again.');
            }
          }

          // Check if should retry
          if (!response.ok) {
            if (!options.skipRetry && this.retryHandler.shouldRetry(response.status, attempt)) {
              await this.retryHandler.wait(attempt);
              attempt++;
              continue;
            }

            // Parse error response
            const errorData: ApiError = await response.json().catch(() => ({
              detail: `HTTP error ${response.status}`,
            }));
            
            const error = new Error(
              errorData.detail || errorData.message || `Request failed with status ${response.status}`
            );
            (error as any).status = response.status;
            (error as any).data = errorData;
            throw error;
          }

          // Handle empty responses (204 No Content)
          if (response.status === 204) {
            return {} as T;
          }

          return response.json();
        } finally {
          this.rateLimiter.release();
        }
      } catch (error) {
        lastError = error as Error;

        // Apply error interceptors
        for (const interceptor of this.errorInterceptors) {
          try {
            await interceptor(lastError);
          } catch (e) {
            lastError = e as Error;
          }
        }

        // Check if should retry on network errors
        if (
          !options.skipRetry &&
          attempt < RETRY_CONFIG.maxRetries &&
          (lastError.name === 'TypeError' || lastError.name === 'AbortError')
        ) {
          await this.retryHandler.wait(attempt);
          attempt++;
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new Error('Request failed after max retries');
  }

  private mergeAbortSignals(...signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();
    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        break;
      }
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
    return controller.signal;
  }

  // ---------------------------------------------------------------
  // HTTP Methods / HTTP 方法
  // ---------------------------------------------------------------

  async get<T>(endpoint: string, params?: ListParams, config?: RequestConfig): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', endpoint, data, config);
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  async delete<T = void>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }

  // ---------------------------------------------------------------
  // File Upload / 文件上傳
  // ---------------------------------------------------------------

  async upload<T>(
    endpoint: string,
    formData: FormData,
    config?: RequestConfig
  ): Promise<T> {
    const { skipAuth = false, timeout = 60000, signal } = config || {};

    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${this.prefix}${endpoint}`;

    const headers: Record<string, string> = {};
    
    if (!skipAuth) {
      const token = this.tokenManager.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    await this.rateLimiter.acquire();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: signal || controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(errorData.detail || 'Upload failed');
      }

      return response.json();
    } finally {
      this.rateLimiter.release();
    }
  }

  // ---------------------------------------------------------------
  // CRUD Helpers / CRUD 輔助方法
  // ---------------------------------------------------------------

  /**
   * Create a typed CRUD API for a resource
   * 為資源創建類型化的 CRUD API
   */
  crud<T, TCreate = Partial<T>, TUpdate = Partial<T>>(basePath: string) {
    return {
      list: (params?: ListParams, config?: RequestConfig) =>
        this.get<PaginatedResponse<T>>(basePath + '/', params, config),
      
      get: (id: string, config?: RequestConfig) =>
        this.get<T>(`${basePath}/${id}/`, undefined, config),
      
      create: (data: TCreate, config?: RequestConfig) =>
        this.post<T>(basePath + '/', data, config),
      
      update: (id: string, data: TUpdate, config?: RequestConfig) =>
        this.patch<T>(`${basePath}/${id}/`, data, config),
      
      replace: (id: string, data: TCreate, config?: RequestConfig) =>
        this.put<T>(`${basePath}/${id}/`, data, config),
      
      delete: (id: string, config?: RequestConfig) =>
        this.delete<void>(`${basePath}/${id}/`, config),
    };
  }
}

// =================================================================
// Default Instance / 默認實例
// =================================================================

export const typedApi = new TypedApiClient();

// Add default logging interceptor in development
if (process.env.NODE_ENV === 'development') {
  typedApi.addRequestInterceptor((config) => {
    console.log(`[API] ${config.method} ${config.url}`);
    return config;
  });

  typedApi.addErrorInterceptor((error) => {
    console.error('[API Error]', error);
    return error;
  });
}

export default typedApi;
