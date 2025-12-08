/**
 * External Integrations API Service
 * Handles banking APIs, Xero, QuickBooks, and other external system integrations
 */

import { typedApi } from './client';
import type {
  BankAccount,
  BankTransaction,
  BankingLinkToken,
  BankingSyncResult,
  AccountingSoftware,
  AccountingConnection,
  AccountingSyncSettings,
  SyncJob,
  SyncMapping,
  IntegrationConfig,
  ConnectIntegrationRequest,
  ConnectIntegrationResponse,
  TriggerSyncRequest,
  ReconcileTransactionRequest,
  SyncEntityType,
  BankingProvider,
} from './integrations-types';
import type { PaginatedResponse } from './types';

const BASE_PATH = '/integrations';

// ============================================
// Integration Configuration
// ============================================

export const integrationsConfigApi = {
  /**
   * Get all available integrations and their configurations
   */
  getAvailable: async (): Promise<IntegrationConfig[]> => {
    return typedApi.get<IntegrationConfig[]>(`${BASE_PATH}/available/`);
  },

  /**
   * Get all active connections for the current organization
   */
  getConnections: async (): Promise<AccountingConnection[]> => {
    return typedApi.get<AccountingConnection[]>(`${BASE_PATH}/connections/`);
  },

  /**
   * Get a specific connection by ID
   */
  getConnection: async (connectionId: string): Promise<AccountingConnection> => {
    return typedApi.get<AccountingConnection>(`${BASE_PATH}/connections/${connectionId}/`);
  },

  /**
   * Connect a new integration
   */
  connect: async (request: ConnectIntegrationRequest): Promise<ConnectIntegrationResponse> => {
    return typedApi.post<ConnectIntegrationResponse>(`${BASE_PATH}/connect/`, request);
  },

  /**
   * Disconnect an integration
   */
  disconnect: async (connectionId: string): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/connections/${connectionId}/`);
  },

  /**
   * Update sync settings for a connection
   */
  updateSettings: async (
    connectionId: string,
    settings: Partial<AccountingSyncSettings>
  ): Promise<AccountingConnection> => {
    return typedApi.patch<AccountingConnection>(
      `${BASE_PATH}/connections/${connectionId}/settings/`,
      settings
    );
  },
};

// ============================================
// Banking / Plaid Integration
// ============================================

export const bankingApi = {
  /**
   * Get a Plaid link token for connecting a bank account
   */
  getLinkToken: async (): Promise<BankingLinkToken> => {
    return typedApi.post<BankingLinkToken>(`${BASE_PATH}/banking/link-token/`);
  },

  /**
   * Exchange a public token for access token and save bank accounts
   */
  exchangeToken: async (publicToken: string): Promise<BankAccount[]> => {
    return typedApi.post<BankAccount[]>(`${BASE_PATH}/banking/exchange-token/`, {
      public_token: publicToken,
    });
  },

  /**
   * Get all connected bank accounts
   */
  getAccounts: async (): Promise<BankAccount[]> => {
    return typedApi.get<BankAccount[]>(`${BASE_PATH}/banking/accounts/`);
  },

  /**
   * Get a specific bank account
   */
  getAccount: async (accountId: string): Promise<BankAccount> => {
    return typedApi.get<BankAccount>(`${BASE_PATH}/banking/accounts/${accountId}/`);
  },

  /**
   * Remove a bank account connection
   */
  removeAccount: async (accountId: string): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/banking/accounts/${accountId}/`);
  },

  /**
   * Sync transactions for a bank account
   */
  syncTransactions: async (params?: {
    account_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<BankingSyncResult> => {
    return typedApi.post<BankingSyncResult>(`${BASE_PATH}/banking/sync/`, params);
  },

  /**
   * Get bank transactions with optional filtering
   */
  getTransactions: async (params?: {
    account_id?: string;
    start_date?: string;
    end_date?: string;
    is_reconciled?: boolean;
    category?: string;
    min_amount?: number;
    max_amount?: number;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<BankTransaction>> => {
    return typedApi.get<PaginatedResponse<BankTransaction>>(
      `${BASE_PATH}/banking/transactions/`,
      params
    );
  },

  /**
   * Reconcile a bank transaction with an internal record
   */
  reconcileTransaction: async (
    request: ReconcileTransactionRequest
  ): Promise<BankTransaction> => {
    return typedApi.post<BankTransaction>(
      `${BASE_PATH}/banking/transactions/${request.transaction_id}/reconcile/`,
      request
    );
  },

  /**
   * Auto-match bank transactions with internal records
   */
  autoMatch: async (accountId?: string): Promise<{ matched: number; unmatched: number }> => {
    return typedApi.post<{ matched: number; unmatched: number }>(
      `${BASE_PATH}/banking/transactions/auto-match/`,
      { account_id: accountId }
    );
  },
};

// ============================================
// Xero Integration
// ============================================

export const xeroApi = {
  /**
   * Get OAuth URL for Xero connection
   */
  getAuthUrl: async (): Promise<{ url: string }> => {
    return typedApi.get<{ url: string }>(`${BASE_PATH}/xero/auth-url/`);
  },

  /**
   * Import invoices from Xero
   */
  importInvoices: async (
    connectionId: string,
    options?: { start_date?: string; status?: string }
  ): Promise<SyncJob> => {
    return typedApi.post<SyncJob>(
      `${BASE_PATH}/xero/${connectionId}/import-invoices/`,
      options
    );
  },

  /**
   * Export invoices to Xero
   */
  exportInvoices: async (connectionId: string, invoiceIds: string[]): Promise<SyncJob> => {
    return typedApi.post<SyncJob>(
      `${BASE_PATH}/xero/${connectionId}/export-invoices/`,
      { invoice_ids: invoiceIds }
    );
  },

  /**
   * Import contacts from Xero
   */
  importContacts: async (connectionId: string): Promise<SyncJob> => {
    return typedApi.post<SyncJob>(`${BASE_PATH}/xero/${connectionId}/import-contacts/`);
  },
};

// ============================================
// QuickBooks Integration
// ============================================

export const quickBooksApi = {
  /**
   * Get OAuth URL for QuickBooks connection
   */
  getAuthUrl: async (): Promise<{ url: string }> => {
    return typedApi.get<{ url: string }>(`${BASE_PATH}/quickbooks/auth-url/`);
  },

  /**
   * Import invoices from QuickBooks
   */
  importInvoices: async (
    connectionId: string,
    options?: { start_date?: string }
  ): Promise<SyncJob> => {
    return typedApi.post<SyncJob>(
      `${BASE_PATH}/quickbooks/${connectionId}/import-invoices/`,
      options
    );
  },

  /**
   * Export invoices to QuickBooks
   */
  exportInvoices: async (connectionId: string, invoiceIds: string[]): Promise<SyncJob> => {
    return typedApi.post<SyncJob>(
      `${BASE_PATH}/quickbooks/${connectionId}/export-invoices/`,
      { invoice_ids: invoiceIds }
    );
  },

  /**
   * Import customers from QuickBooks
   */
  importCustomers: async (connectionId: string): Promise<SyncJob> => {
    return typedApi.post<SyncJob>(
      `${BASE_PATH}/quickbooks/${connectionId}/import-customers/`
    );
  },
};

// ============================================
// Generic Sync Operations
// ============================================

export const syncApi = {
  /**
   * Trigger a sync job
   */
  trigger: async (request: TriggerSyncRequest): Promise<SyncJob> => {
    return typedApi.post<SyncJob>(`${BASE_PATH}/sync/`, request);
  },

  /**
   * Get sync job status
   */
  getJob: async (jobId: string): Promise<SyncJob> => {
    return typedApi.get<SyncJob>(`${BASE_PATH}/sync/${jobId}/`);
  },

  /**
   * Get sync history
   */
  getHistory: async (params?: {
    provider?: AccountingSoftware | BankingProvider;
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<SyncJob>> => {
    return typedApi.get<PaginatedResponse<SyncJob>>(`${BASE_PATH}/sync/history/`, params);
  },

  /**
   * Get sync mappings for an entity type
   */
  getMappings: async (
    entityType: SyncEntityType,
    provider?: AccountingSoftware | BankingProvider
  ): Promise<SyncMapping[]> => {
    return typedApi.get<SyncMapping[]>(`${BASE_PATH}/mappings/`, {
      entity_type: entityType,
      provider,
    });
  },

  /**
   * Cancel a running sync job
   */
  cancelJob: async (jobId: string): Promise<SyncJob> => {
    return typedApi.post<SyncJob>(`${BASE_PATH}/sync/${jobId}/cancel/`);
  },
};

// Combined export for convenience
export const integrationsApi = {
  config: integrationsConfigApi,
  banking: bankingApi,
  xero: xeroApi,
  quickBooks: quickBooksApi,
  sync: syncApi,
};

export default integrationsApi;
