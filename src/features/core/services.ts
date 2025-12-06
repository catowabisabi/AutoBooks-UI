import { api } from '@/lib/api';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface Country {
  code: string;
  name: string;
}

export interface Timezone {
  code: string;
  name: string;
}

export interface ApiKeyStatus {
  provider: string;
  is_configured: boolean;
  is_valid: boolean;
  last_checked?: string;
}

export const coreApi = {
  getCurrencies: () => api.get<Currency[]>('/api/v1/currency-list'),
  getCountries: () => api.get<Country[]>('/api/v1/country-list'),
  getTimezones: () => api.get<Timezone[]>('/api/v1/timezone-list'),
};

export const apiKeysApi = {
  getStatus: () => api.get<ApiKeyStatus[]>('/api/v1/settings/api-keys/status/'),
  updateKey: (provider: string, key: string) => 
    api.post(`/api/v1/settings/api-keys/${provider}/`, { key }),
  testKey: (provider: string) => 
    api.post<{ success: boolean; message: string }>(`/api/v1/settings/api-keys/${provider}/test/`),
};
