/**
 * Generic CRUD API Factory
 * ========================
 * Creates type-safe CRUD API functions for any entity.
 * Reduces boilerplate and ensures consistency across all API services.
 * 
 * Usage:
 * ```typescript
 * interface Product { id: string; name: string; price: number; }
 * export const productsApi = createCrudApi<Product>('/api/v1/products');
 * 
 * // Now you can use:
 * productsApi.list({ search: 'keyword' });
 * productsApi.get('product-id');
 * productsApi.create({ name: 'New Product', price: 100 });
 * productsApi.update('product-id', { price: 120 });
 * productsApi.delete('product-id');
 * ```
 */

import { api } from './api';

// Generic paginated response type
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Base entity with common fields
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

// Query parameters for list operations
export interface ListParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
  is_active?: boolean;
  [key: string]: any;
}

// CRUD API interface
export interface CrudApi<T extends BaseEntity> {
  /** List entities with optional filtering and pagination */
  list: (params?: ListParams) => Promise<PaginatedResponse<T>>;
  
  /** Get a single entity by ID */
  get: (id: string) => Promise<T>;
  
  /** Create a new entity */
  create: (data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>) => Promise<T>;
  
  /** Update an existing entity */
  update: (id: string, data: Partial<T>) => Promise<T>;
  
  /** Partially update an existing entity */
  patch: (id: string, data: Partial<T>) => Promise<T>;
  
  /** Delete an entity */
  delete: (id: string) => Promise<void>;
  
  /** Soft delete (set is_active to false) */
  softDelete?: (id: string) => Promise<T>;
}

// Extended CRUD API with custom actions
export interface ExtendedCrudApi<T extends BaseEntity> extends CrudApi<T> {
  /** Get statistics/summary */
  stats?: () => Promise<Record<string, any>>;
  
  /** Get summary data */
  summary?: () => Promise<Record<string, any>>;
  
  /** Bulk create entities */
  bulkCreate?: (data: Partial<T>[]) => Promise<T[]>;
  
  /** Bulk update entities */
  bulkUpdate?: (updates: { id: string; data: Partial<T> }[]) => Promise<T[]>;
  
  /** Bulk delete entities */
  bulkDelete?: (ids: string[]) => Promise<void>;
  
  /** Export data */
  export?: (params?: ListParams) => Promise<Blob>;
}

/**
 * Create a CRUD API for an entity
 * @param baseUrl - The base URL for the entity's API endpoints (e.g., '/api/v1/products')
 * @param options - Optional configuration
 */
export function createCrudApi<T extends BaseEntity>(
  baseUrl: string,
  options?: {
    /** Include stats endpoint */
    hasStats?: boolean;
    /** Include summary endpoint */
    hasSummary?: boolean;
    /** Include bulk operations */
    hasBulk?: boolean;
    /** Include export endpoint */
    hasExport?: boolean;
    /** Custom endpoints */
    customEndpoints?: Record<string, (api: any, baseUrl: string) => any>;
  }
): ExtendedCrudApi<T> {
  const {
    hasStats = false,
    hasSummary = false,
    hasBulk = false,
    hasExport = false,
    customEndpoints = {},
  } = options || {};

  const crudApi: ExtendedCrudApi<T> = {
    // Basic CRUD operations
    list: (params?: ListParams) => 
      api.get<PaginatedResponse<T>>(`${baseUrl}/`, { params }),
    
    get: (id: string) => 
      api.get<T>(`${baseUrl}/${id}/`),
    
    create: (data) => 
      api.post<T>(`${baseUrl}/`, data),
    
    update: (id: string, data) => 
      api.put<T>(`${baseUrl}/${id}/`, data),
    
    patch: (id: string, data) => 
      api.patch<T>(`${baseUrl}/${id}/`, data),
    
    delete: (id: string) => 
      api.delete(`${baseUrl}/${id}/`),
    
    softDelete: (id: string) => 
      api.patch<T>(`${baseUrl}/${id}/`, { is_active: false }),
  };

  // Add optional endpoints
  if (hasStats) {
    crudApi.stats = () => api.get(`${baseUrl}/stats/`);
  }

  if (hasSummary) {
    crudApi.summary = () => api.get(`${baseUrl}/summary/`);
  }

  if (hasBulk) {
    crudApi.bulkCreate = (data) => api.post(`${baseUrl}/bulk_create/`, { items: data });
    crudApi.bulkUpdate = (updates) => api.post(`${baseUrl}/bulk_update/`, { items: updates });
    crudApi.bulkDelete = (ids) => api.post(`${baseUrl}/bulk_delete/`, { ids });
  }

  if (hasExport) {
    crudApi.export = async (params?: ListParams) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const queryString = params ? new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])
      ).toString() : '';
      const response = await fetch(
        `${api.baseUrl}${baseUrl}/export/${queryString ? '?' + queryString : ''}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      return response.blob();
    };
  }

  // Add custom endpoints
  Object.entries(customEndpoints).forEach(([name, factory]) => {
    (crudApi as any)[name] = factory(api, baseUrl);
  });

  return crudApi;
}

/**
 * Create a nested CRUD API (for child entities)
 * @param parentUrl - The parent entity's URL (e.g., '/api/v1/projects')
 * @param childPath - The child entity path (e.g., 'tasks')
 */
export function createNestedCrudApi<T extends BaseEntity>(
  parentUrl: string,
  childPath: string
) {
  return {
    list: (parentId: string, params?: ListParams) => 
      api.get<PaginatedResponse<T>>(`${parentUrl}/${parentId}/${childPath}/`, { params }),
    
    get: (parentId: string, id: string) => 
      api.get<T>(`${parentUrl}/${parentId}/${childPath}/${id}/`),
    
    create: (parentId: string, data: Partial<T>) => 
      api.post<T>(`${parentUrl}/${parentId}/${childPath}/`, data),
    
    update: (parentId: string, id: string, data: Partial<T>) => 
      api.patch<T>(`${parentUrl}/${parentId}/${childPath}/${id}/`, data),
    
    delete: (parentId: string, id: string) => 
      api.delete(`${parentUrl}/${parentId}/${childPath}/${id}/`),
  };
}

// ============================================================
// Example usage - these can be used directly in services files
// ============================================================

/*
// In features/business/services.ts:
import { createCrudApi } from '@/lib/crud-api';

export interface Company {
  id: string;
  name: string;
  registration_number?: string;
  // ... other fields
}

export const companiesApi = createCrudApi<Company>('/api/v1/business/companies', {
  hasStats: true,
  customEndpoints: {
    search: (api, baseUrl) => (query: string) => 
      api.get(`${baseUrl}/search/?q=${query}`),
  }
});

// Usage remains the same:
const companies = await companiesApi.list({ search: 'acme' });
const company = await companiesApi.get('company-id');
await companiesApi.create({ name: 'New Company' });
*/

export default createCrudApi;
