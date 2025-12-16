'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseDataFetchingOptions<T> {
  /** Initial data value */
  initialData?: T | null;
  /** Auto-fetch on mount */
  autoFetch?: boolean;
  /** Show toast on success */
  showSuccessToast?: boolean;
  /** Show toast on error */
  showErrorToast?: boolean;
  /** Custom success message */
  successMessage?: string;
  /** Custom error message */
  errorMessage?: string;
  /** Dependencies that trigger refetch */
  deps?: any[];
  /** Cache key for deduplication */
  cacheKey?: string;
  /** Cache time in milliseconds */
  cacheTime?: number;
}

interface UseDataFetchingResult<T> {
  data: T | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  refetch: (showToast?: boolean) => Promise<void>;
  setData: (data: T | null) => void;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

/**
 * Custom hook for data fetching with loading states
 */
export function useDataFetching<T>(
  fetchFn: () => Promise<T>,
  options: UseDataFetchingOptions<T> = {}
): UseDataFetchingResult<T> {
  const {
    initialData = null,
    autoFetch = true,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Data loaded successfully',
    errorMessage = 'Failed to load data',
    deps = [],
    cacheKey,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  const fetchData = useCallback(async (showToast = false) => {
    // Check cache first
    if (cacheKey && !showToast) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setData(cached.data);
        setIsLoading(false);
        return;
      }
    }

    try {
      if (showToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const result = await fetchFn();

      if (!isMounted.current) return;

      setData(result);

      // Update cache
      if (cacheKey) {
        cache.set(cacheKey, { data: result, timestamp: Date.now() });
      }

      if (showToast && showSuccessToast) {
        toast.success(successMessage);
      }
    } catch (err) {
      if (!isMounted.current) return;
      
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      console.error('Fetch error:', error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [fetchFn, cacheKey, cacheTime, showSuccessToast, showErrorToast, successMessage, errorMessage]);

  // Auto-fetch on mount and when deps change
  useEffect(() => {
    isMounted.current = true;
    
    if (autoFetch) {
      fetchData();
    }

    return () => {
      isMounted.current = false;
    };
  }, [autoFetch, ...deps]);

  const refetch = useCallback(async (showToast = true) => {
    await fetchData(showToast);
  }, [fetchData]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refetch,
    setData,
  };
}

/**
 * Hook for multiple data fetching with combined loading state
 */
export function useMultiDataFetching<T extends Record<string, any>>(
  fetchFns: { [K in keyof T]: () => Promise<T[K]> },
  options: UseDataFetchingOptions<T> = {}
): UseDataFetchingResult<T> {
  const {
    initialData = null,
    autoFetch = true,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Data loaded successfully',
    errorMessage = 'Failed to load data',
    deps = [],
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  const fetchAllData = useCallback(async (showToast = false) => {
    try {
      if (showToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const keys = Object.keys(fetchFns) as (keyof T)[];
      const results = await Promise.allSettled(
        keys.map(key => fetchFns[key]())
      );

      if (!isMounted.current) return;

      const resultData = {} as T;
      let hasError = false;

      results.forEach((result, index) => {
        const key = keys[index];
        if (result.status === 'fulfilled') {
          resultData[key] = result.value;
        } else {
          hasError = true;
          console.error(`Failed to fetch ${String(key)}:`, result.reason);
        }
      });

      setData(resultData);

      if (hasError && showErrorToast) {
        toast.warning('Some data failed to load');
      } else if (showToast && showSuccessToast) {
        toast.success(successMessage);
      }
    } catch (err) {
      if (!isMounted.current) return;
      
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      console.error('Multi-fetch error:', error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [fetchFns, showSuccessToast, showErrorToast, successMessage, errorMessage]);

  useEffect(() => {
    isMounted.current = true;
    
    if (autoFetch) {
      fetchAllData();
    }

    return () => {
      isMounted.current = false;
    };
  }, [autoFetch, ...deps]);

  const refetch = useCallback(async (showToast = true) => {
    await fetchAllData(showToast);
  }, [fetchAllData]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refetch,
    setData,
  };
}

/**
 * Clear all cached data
 */
export function clearDataCache() {
  cache.clear();
}

/**
 * Clear specific cache entry
 */
export function clearCacheEntry(key: string) {
  cache.delete(key);
}
