/**
 * External Integration Types
 * Types for banking APIs, Xero, QuickBooks, and other external system integrations
 */

// ============================================
// Banking / Plaid Integration Types
// ============================================

export type BankingProvider = 'plaid' | 'stripe' | 'manual';

export interface BankAccount {
  id: string;
  provider: BankingProvider;
  external_id: string;
  name: string;
  official_name?: string;
  type: 'checking' | 'savings' | 'credit' | 'loan' | 'investment' | 'other';
  subtype?: string;
  mask?: string; // Last 4 digits
  currency: string;
  balance_current?: number;
  balance_available?: number;
  last_synced_at?: string;
  institution_id?: string;
  institution_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankTransaction {
  id: string;
  account_id: string;
  external_id: string;
  date: string;
  name: string;
  merchant_name?: string;
  amount: number;
  currency: string;
  category?: string[];
  pending: boolean;
  transaction_type: 'debit' | 'credit';
  payment_channel?: 'online' | 'in_store' | 'other';
  location?: {
    address?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
  // Internal matching
  matched_expense_id?: string;
  matched_receipt_id?: string;
  matched_invoice_id?: string;
  is_reconciled: boolean;
  created_at: string;
}

export interface BankingLinkToken {
  link_token: string;
  expiration: string;
}

export interface BankingSyncResult {
  accounts_synced: number;
  transactions_added: number;
  transactions_modified: number;
  transactions_removed: number;
  last_synced_at: string;
  errors?: string[];
}

// ============================================
// Accounting Software Integration Types (Xero / QuickBooks)
// ============================================

export type AccountingSoftware = 'xero' | 'quickbooks' | 'sage' | 'freshbooks';

export interface AccountingConnection {
  id: string;
  provider: AccountingSoftware;
  organization_id: string;
  organization_name: string;
  access_token_expires_at: string;
  is_active: boolean;
  last_synced_at?: string;
  sync_settings: AccountingSyncSettings;
  created_at: string;
  updated_at: string;
}

export interface AccountingSyncSettings {
  auto_sync_enabled: boolean;
  sync_interval_minutes: number;
  sync_invoices: boolean;
  sync_expenses: boolean;
  sync_payments: boolean;
  sync_contacts: boolean;
  sync_chart_of_accounts: boolean;
  default_income_account?: string;
  default_expense_account?: string;
  tax_inclusive: boolean;
}

// Xero-specific types
export interface XeroInvoice {
  InvoiceID: string;
  InvoiceNumber: string;
  Type: 'ACCREC' | 'ACCPAY';
  Status: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID' | 'VOIDED';
  Contact: {
    ContactID: string;
    Name: string;
  };
  Date: string;
  DueDate: string;
  LineItems: XeroLineItem[];
  SubTotal: number;
  TotalTax: number;
  Total: number;
  AmountDue: number;
  AmountPaid: number;
  CurrencyCode: string;
}

export interface XeroLineItem {
  LineItemID?: string;
  Description: string;
  Quantity: number;
  UnitAmount: number;
  TaxAmount: number;
  LineAmount: number;
  AccountCode?: string;
  TaxType?: string;
}

export interface XeroContact {
  ContactID: string;
  ContactStatus: 'ACTIVE' | 'ARCHIVED' | 'GDPRREQUEST';
  Name: string;
  FirstName?: string;
  LastName?: string;
  EmailAddress?: string;
  Phones?: Array<{
    PhoneType: string;
    PhoneNumber: string;
  }>;
  Addresses?: Array<{
    AddressType: string;
    AddressLine1?: string;
    City?: string;
    Region?: string;
    PostalCode?: string;
    Country?: string;
  }>;
  IsSupplier: boolean;
  IsCustomer: boolean;
}

// QuickBooks-specific types
export interface QuickBooksInvoice {
  Id: string;
  DocNumber: string;
  TxnDate: string;
  DueDate: string;
  CustomerRef: {
    value: string;
    name: string;
  };
  Line: QuickBooksLineItem[];
  TotalAmt: number;
  Balance: number;
  CurrencyRef: {
    value: string;
  };
}

export interface QuickBooksLineItem {
  Id: string;
  Description?: string;
  Amount: number;
  DetailType: 'SalesItemLineDetail' | 'SubTotalLineDetail';
  SalesItemLineDetail?: {
    ItemRef: { value: string; name: string };
    Qty: number;
    UnitPrice: number;
    TaxCodeRef?: { value: string };
  };
}

export interface QuickBooksCustomer {
  Id: string;
  DisplayName: string;
  CompanyName?: string;
  GivenName?: string;
  FamilyName?: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  BillAddr?: {
    Line1?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
    Country?: string;
  };
  Active: boolean;
}

// ============================================
// Sync Status and History Types
// ============================================

export type SyncDirection = 'import' | 'export' | 'bidirectional';
export type SyncStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial';
export type SyncEntityType = 'invoice' | 'expense' | 'payment' | 'contact' | 'account' | 'transaction';

export interface SyncJob {
  id: string;
  provider: AccountingSoftware | BankingProvider;
  direction: SyncDirection;
  status: SyncStatus;
  entity_types: SyncEntityType[];
  started_at: string;
  completed_at?: string;
  items_processed: number;
  items_created: number;
  items_updated: number;
  items_failed: number;
  errors: SyncError[];
  created_by: string;
}

export interface SyncError {
  entity_type: SyncEntityType;
  entity_id?: string;
  external_id?: string;
  error_code: string;
  error_message: string;
  timestamp: string;
}

export interface SyncMapping {
  id: string;
  provider: AccountingSoftware | BankingProvider;
  entity_type: SyncEntityType;
  internal_id: string;
  external_id: string;
  last_synced_at: string;
  sync_hash?: string; // For change detection
}

// ============================================
// Integration Configuration Types
// ============================================

export interface IntegrationConfig {
  provider: AccountingSoftware | BankingProvider;
  display_name: string;
  description: string;
  icon_url: string;
  is_available: boolean;
  requires_oauth: boolean;
  oauth_url?: string;
  supported_features: IntegrationFeature[];
  setup_steps: string[];
}

export type IntegrationFeature = 
  | 'sync_invoices'
  | 'sync_expenses'
  | 'sync_payments'
  | 'sync_contacts'
  | 'sync_bank_transactions'
  | 'real_time_sync'
  | 'two_way_sync'
  | 'attachment_sync';

// ============================================
// API Request/Response Types
// ============================================

export interface ConnectIntegrationRequest {
  provider: AccountingSoftware | BankingProvider;
  oauth_code?: string;
  access_token?: string;
  refresh_token?: string;
  organization_id?: string;
}

export interface ConnectIntegrationResponse {
  connection_id: string;
  provider: AccountingSoftware | BankingProvider;
  organization_name: string;
  status: 'connected' | 'pending' | 'error';
  message?: string;
}

export interface TriggerSyncRequest {
  connection_id: string;
  entity_types?: SyncEntityType[];
  full_sync?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface ReconcileTransactionRequest {
  transaction_id: string;
  match_type: 'expense' | 'receipt' | 'invoice' | 'manual';
  match_id?: string;
  notes?: string;
}
