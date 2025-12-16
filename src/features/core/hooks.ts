import { useQuery } from '@tanstack/react-query';
import { coreApi } from './services';

// These are reference data that rarely changes, so we cache them for a long time
const REFERENCE_DATA_STALE_TIME = 60 * 60 * 1000; // 1 hour
const REFERENCE_DATA_GC_TIME = 24 * 60 * 60 * 1000; // 24 hours

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: coreApi.getCurrencies,
    staleTime: REFERENCE_DATA_STALE_TIME,
    gcTime: REFERENCE_DATA_GC_TIME,
  });
}

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: coreApi.getCountries,
    staleTime: REFERENCE_DATA_STALE_TIME,
    gcTime: REFERENCE_DATA_GC_TIME,
  });
}

export function useTimezones() {
  return useQuery({
    queryKey: ['timezones'],
    queryFn: coreApi.getTimezones,
    staleTime: REFERENCE_DATA_STALE_TIME,
    gcTime: REFERENCE_DATA_GC_TIME,
  });
}
