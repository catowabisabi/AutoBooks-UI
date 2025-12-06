import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeysApi } from '@/features/core/services';

export function useApiKeyStatus() {
  return useQuery({
    queryKey: ['api-keys-status'],
    queryFn: apiKeysApi.getStatus,
  });
}

export function useUpdateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, key }: { provider: string; key: string }) => 
      apiKeysApi.updateKey(provider, key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys-status'] });
    },
  });
}

export function useTestApiKey() {
  return useMutation({
    mutationFn: (provider: string) => apiKeysApi.testKey(provider),
  });
}
