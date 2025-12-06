import { useQuery } from '@tanstack/react-query';
import { coreApi } from './services';

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: coreApi.getCurrencies,
  });
}

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: coreApi.getCountries,
  });
}

export function useTimezones() {
  return useQuery({
    queryKey: ['timezones'],
    queryFn: coreApi.getTimezones,
  });
}
