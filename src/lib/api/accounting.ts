/**
 * Accounting API - 會計 API
 * Full accounting module endpoints with type safety
 */

import { typedApi } from './client';
import type {
  Account,
  AccountCreateRequest,
  JournalEntry,
  JournalEntryCreateRequest,
  Contact,
  ContactCreateRequest,
  Invoice,
  InvoiceCreateRequest,
  Expense,
  ExpenseCreateRequest,
  Payment,
  PaymentCreateRequest,
  Currency,
  TaxRate,
  FiscalYear,
  AccountingPeriod,
  PaginatedResponse,
  ListParams,
  UUID,
  DateString,
} from './types';

const BASE_PATH = '/accounting';

// ---------------------------------------------------------------
// Accounts / 會計科目
// ---------------------------------------------------------------

export const accountsApi = {
  /**
   * List all accounts (Chart of Accounts)
   * 列出所有會計科目（會計科目表）
   */
  list: async (params?: ListParams & {
    account_type?: string;
    is_active?: boolean;
    parent?: string;
    is_header?: boolean;
  }): Promise<PaginatedResponse<Account>> => {
    return typedApi.get<PaginatedResponse<Account>>(`${BASE_PATH}/accounts/`, params);
  },

  /**
   * Get account tree structure
   * 獲取會計科目樹狀結構
   */
  tree: async (): Promise<Account[]> => {
    return typedApi.get<Account[]>(`${BASE_PATH}/accounts/tree/`);
  },

  /**
   * Get account by ID
   * 通過 ID 獲取會計科目
   */
  get: async (id: UUID): Promise<Account> => {
    return typedApi.get<Account>(`${BASE_PATH}/accounts/${id}/`);
  },

  /**
   * Get account by code
   * 通過代碼獲取會計科目
   */
  getByCode: async (code: string): Promise<Account> => {
    return typedApi.get<Account>(`${BASE_PATH}/accounts/by-code/${code}/`);
  },

  /**
   * Create a new account
   * 創建新會計科目
   */
  create: async (data: AccountCreateRequest): Promise<Account> => {
    return typedApi.post<Account>(`${BASE_PATH}/accounts/`, data);
  },

  /**
   * Update account
   * 更新會計科目
   */
  update: async (id: UUID, data: Partial<AccountCreateRequest>): Promise<Account> => {
    return typedApi.patch<Account>(`${BASE_PATH}/accounts/${id}/`, data);
  },

  /**
   * Delete account
   * 刪除會計科目
   */
  delete: async (id: UUID): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/accounts/${id}/`);
  },

  /**
   * Get account ledger (transactions)
   * 獲取會計科目分類帳（交易記錄）
   */
  ledger: async (id: UUID, params?: {
    start_date?: DateString;
    end_date?: DateString;
  }): Promise<{
    account: Account;
    opening_balance: number;
    closing_balance: number;
    transactions: Array<{
      date: DateString;
      description: string;
      reference: string;
      debit: number;
      credit: number;
      balance: number;
    }>;
  }> => {
    return typedApi.get(`${BASE_PATH}/accounts/${id}/ledger/`, params);
  },

  /**
   * Get account balance
   * 獲取會計科目餘額
   */
  balance: async (id: UUID, params?: {
    as_of_date?: DateString;
  }): Promise<{
    account_id: UUID;
    balance: number;
    as_of_date: DateString;
  }> => {
    return typedApi.get(`${BASE_PATH}/accounts/${id}/balance/`, params);
  },
};

// ---------------------------------------------------------------
// Journal Entries / 日記帳分錄
// ---------------------------------------------------------------

export const journalEntriesApi = {
  /**
   * List journal entries
   * 列出日記帳分錄
   */
  list: async (params?: ListParams & {
    status?: string;
    date_from?: DateString;
    date_to?: DateString;
  }): Promise<PaginatedResponse<JournalEntry>> => {
    return typedApi.get<PaginatedResponse<JournalEntry>>(`${BASE_PATH}/journal-entries/`, params);
  },

  /**
   * Get journal entry by ID
   * 通過 ID 獲取日記帳分錄
   */
  get: async (id: UUID): Promise<JournalEntry> => {
    return typedApi.get<JournalEntry>(`${BASE_PATH}/journal-entries/${id}/`);
  },

  /**
   * Create a new journal entry
   * 創建新日記帳分錄
   */
  create: async (data: JournalEntryCreateRequest): Promise<JournalEntry> => {
    return typedApi.post<JournalEntry>(`${BASE_PATH}/journal-entries/`, data);
  },

  /**
   * Update journal entry (draft only)
   * 更新日記帳分錄（僅限草稿）
   */
  update: async (id: UUID, data: Partial<JournalEntryCreateRequest>): Promise<JournalEntry> => {
    return typedApi.patch<JournalEntry>(`${BASE_PATH}/journal-entries/${id}/`, data);
  },

  /**
   * Delete journal entry (draft only)
   * 刪除日記帳分錄（僅限草稿）
   */
  delete: async (id: UUID): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/journal-entries/${id}/`);
  },

  /**
   * Post journal entry
   * 過帳日記帳分錄
   */
  post: async (id: UUID): Promise<JournalEntry> => {
    return typedApi.post<JournalEntry>(`${BASE_PATH}/journal-entries/${id}/post/`);
  },

  /**
   * Void journal entry
   * 作廢日記帳分錄
   */
  void: async (id: UUID, reason: string): Promise<JournalEntry> => {
    return typedApi.post<JournalEntry>(`${BASE_PATH}/journal-entries/${id}/void/`, { reason });
  },
};

// ---------------------------------------------------------------
// Contacts / 聯絡人
// ---------------------------------------------------------------

export const contactsApi = {
  /**
   * List contacts
   * 列出聯絡人
   */
  list: async (params?: ListParams & {
    contact_type?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<Contact>> => {
    return typedApi.get<PaginatedResponse<Contact>>(`${BASE_PATH}/contacts/`, params);
  },

  /**
   * Get contact by ID
   * 通過 ID 獲取聯絡人
   */
  get: async (id: UUID): Promise<Contact> => {
    return typedApi.get<Contact>(`${BASE_PATH}/contacts/${id}/`);
  },

  /**
   * Create a new contact
   * 創建新聯絡人
   */
  create: async (data: ContactCreateRequest): Promise<Contact> => {
    return typedApi.post<Contact>(`${BASE_PATH}/contacts/`, data);
  },

  /**
   * Update contact
   * 更新聯絡人
   */
  update: async (id: UUID, data: Partial<ContactCreateRequest>): Promise<Contact> => {
    return typedApi.patch<Contact>(`${BASE_PATH}/contacts/${id}/`, data);
  },

  /**
   * Delete contact
   * 刪除聯絡人
   */
  delete: async (id: UUID): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/contacts/${id}/`);
  },

  /**
   * Get contact statement
   * 獲取聯絡人對帳單
   */
  statement: async (id: UUID, params?: {
    start_date?: DateString;
    end_date?: DateString;
  }): Promise<{
    contact: Contact;
    opening_balance: number;
    closing_balance: number;
    transactions: Array<{
      date: DateString;
      type: string;
      reference: string;
      description: string;
      debit: number;
      credit: number;
      balance: number;
    }>;
  }> => {
    return typedApi.get(`${BASE_PATH}/contacts/${id}/statement/`, params);
  },
};

// ---------------------------------------------------------------
// Invoices / 發票
// ---------------------------------------------------------------

export const invoicesApi = {
  /**
   * List invoices
   * 列出發票
   */
  list: async (params?: ListParams & {
    invoice_type?: 'sales' | 'purchase';
    status?: string;
    contact?: UUID;
    date_from?: DateString;
    date_to?: DateString;
    overdue?: boolean;
  }): Promise<PaginatedResponse<Invoice>> => {
    return typedApi.get<PaginatedResponse<Invoice>>(`${BASE_PATH}/invoices/`, params);
  },

  /**
   * Get invoice by ID
   * 通過 ID 獲取發票
   */
  get: async (id: UUID): Promise<Invoice> => {
    return typedApi.get<Invoice>(`${BASE_PATH}/invoices/${id}/`);
  },

  /**
   * Create a new invoice
   * 創建新發票
   */
  create: async (data: InvoiceCreateRequest): Promise<Invoice> => {
    return typedApi.post<Invoice>(`${BASE_PATH}/invoices/`, data);
  },

  /**
   * Update invoice (draft only)
   * 更新發票（僅限草稿）
   */
  update: async (id: UUID, data: Partial<InvoiceCreateRequest>): Promise<Invoice> => {
    return typedApi.patch<Invoice>(`${BASE_PATH}/invoices/${id}/`, data);
  },

  /**
   * Delete invoice (draft only)
   * 刪除發票（僅限草稿）
   */
  delete: async (id: UUID): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/invoices/${id}/`);
  },

  /**
   * Send invoice
   * 發送發票
   */
  send: async (id: UUID): Promise<Invoice> => {
    return typedApi.post<Invoice>(`${BASE_PATH}/invoices/${id}/send/`);
  },

  /**
   * Mark invoice as sent
   * 標記發票為已發送
   */
  markSent: async (id: UUID): Promise<Invoice> => {
    return typedApi.post<Invoice>(`${BASE_PATH}/invoices/${id}/mark-sent/`);
  },

  /**
   * Void invoice
   * 作廢發票
   */
  void: async (id: UUID, reason: string): Promise<Invoice> => {
    return typedApi.post<Invoice>(`${BASE_PATH}/invoices/${id}/void/`, { reason });
  },

  /**
   * Get invoice PDF
   * 獲取發票 PDF
   */
  getPdf: async (id: UUID): Promise<Blob> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1${BASE_PATH}/invoices/${id}/pdf/`,
      {
        headers: {
          Authorization: `Bearer ${typedApi.getAccessToken()}`,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to generate PDF');
    return response.blob();
  },

  /**
   * Duplicate invoice
   * 複製發票
   */
  duplicate: async (id: UUID): Promise<Invoice> => {
    return typedApi.post<Invoice>(`${BASE_PATH}/invoices/${id}/duplicate/`);
  },

  /**
   * Get invoice summary
   * 獲取發票摘要
   */
  summary: async (params?: {
    invoice_type?: 'sales' | 'purchase';
    period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  }): Promise<{
    total_count: number;
    total_amount: number;
    paid_count: number;
    paid_amount: number;
    pending_count: number;
    pending_amount: number;
    overdue_count: number;
    overdue_amount: number;
  }> => {
    return typedApi.get(`${BASE_PATH}/invoices/summary/`, params);
  },
};

// ---------------------------------------------------------------
// Expenses / 費用
// ---------------------------------------------------------------

export const expensesApi = {
  /**
   * List expenses
   * 列出費用
   */
  list: async (params?: ListParams & {
    status?: string;
    category?: string;
    account?: UUID;
    date_from?: DateString;
    date_to?: DateString;
  }): Promise<PaginatedResponse<Expense>> => {
    return typedApi.get<PaginatedResponse<Expense>>(`${BASE_PATH}/expenses/`, params);
  },

  /**
   * Get expense by ID
   * 通過 ID 獲取費用
   */
  get: async (id: UUID): Promise<Expense> => {
    return typedApi.get<Expense>(`${BASE_PATH}/expenses/${id}/`);
  },

  /**
   * Create a new expense
   * 創建新費用
   */
  create: async (data: ExpenseCreateRequest): Promise<Expense> => {
    return typedApi.post<Expense>(`${BASE_PATH}/expenses/`, data);
  },

  /**
   * Update expense
   * 更新費用
   */
  update: async (id: UUID, data: Partial<ExpenseCreateRequest>): Promise<Expense> => {
    return typedApi.patch<Expense>(`${BASE_PATH}/expenses/${id}/`, data);
  },

  /**
   * Delete expense
   * 刪除費用
   */
  delete: async (id: UUID): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/expenses/${id}/`);
  },

  /**
   * Approve expense
   * 核准費用
   */
  approve: async (id: UUID): Promise<Expense> => {
    return typedApi.post<Expense>(`${BASE_PATH}/expenses/${id}/approve/`);
  },

  /**
   * Reject expense
   * 拒絕費用
   */
  reject: async (id: UUID, reason: string): Promise<Expense> => {
    return typedApi.post<Expense>(`${BASE_PATH}/expenses/${id}/reject/`, { reason });
  },

  /**
   * Upload receipt
   * 上傳收據
   */
  uploadReceipt: async (id: UUID, file: File): Promise<Expense> => {
    const formData = new FormData();
    formData.append('receipt', file);
    return typedApi.upload<Expense>(`${BASE_PATH}/expenses/${id}/upload-receipt/`, formData);
  },

  /**
   * Get expense summary by category
   * 按類別獲取費用摘要
   */
  summaryByCategory: async (params?: {
    start_date?: DateString;
    end_date?: DateString;
  }): Promise<Array<{
    category: string;
    total_amount: number;
    count: number;
    percentage: number;
  }>> => {
    return typedApi.get(`${BASE_PATH}/expenses/summary-by-category/`, params);
  },
};

// ---------------------------------------------------------------
// Payments / 付款
// ---------------------------------------------------------------

export const paymentsApi = {
  /**
   * List payments
   * 列出付款
   */
  list: async (params?: ListParams & {
    payment_type?: 'received' | 'made';
    contact?: UUID;
    date_from?: DateString;
    date_to?: DateString;
    is_reconciled?: boolean;
  }): Promise<PaginatedResponse<Payment>> => {
    return typedApi.get<PaginatedResponse<Payment>>(`${BASE_PATH}/payments/`, params);
  },

  /**
   * Get payment by ID
   * 通過 ID 獲取付款
   */
  get: async (id: UUID): Promise<Payment> => {
    return typedApi.get<Payment>(`${BASE_PATH}/payments/${id}/`);
  },

  /**
   * Create a new payment
   * 創建新付款
   */
  create: async (data: PaymentCreateRequest): Promise<Payment> => {
    return typedApi.post<Payment>(`${BASE_PATH}/payments/`, data);
  },

  /**
   * Update payment
   * 更新付款
   */
  update: async (id: UUID, data: Partial<PaymentCreateRequest>): Promise<Payment> => {
    return typedApi.patch<Payment>(`${BASE_PATH}/payments/${id}/`, data);
  },

  /**
   * Delete payment
   * 刪除付款
   */
  delete: async (id: UUID): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/payments/${id}/`);
  },

  /**
   * Reconcile payment
   * 對帳付款
   */
  reconcile: async (id: UUID): Promise<Payment> => {
    return typedApi.post<Payment>(`${BASE_PATH}/payments/${id}/reconcile/`);
  },

  /**
   * Unreconcile payment
   * 取消對帳付款
   */
  unreconcile: async (id: UUID): Promise<Payment> => {
    return typedApi.post<Payment>(`${BASE_PATH}/payments/${id}/unreconcile/`);
  },
};

// ---------------------------------------------------------------
// Currencies / 幣別
// ---------------------------------------------------------------

export const currenciesApi = {
  /**
   * List currencies
   * 列出幣別
   */
  list: async (): Promise<Currency[]> => {
    return typedApi.get<Currency[]>(`${BASE_PATH}/currencies/`);
  },

  /**
   * Get currency by ID
   * 通過 ID 獲取幣別
   */
  get: async (id: UUID): Promise<Currency> => {
    return typedApi.get<Currency>(`${BASE_PATH}/currencies/${id}/`);
  },

  /**
   * Update exchange rate
   * 更新匯率
   */
  updateExchangeRate: async (id: UUID, exchangeRate: number): Promise<Currency> => {
    return typedApi.patch<Currency>(`${BASE_PATH}/currencies/${id}/`, {
      exchange_rate: exchangeRate,
    });
  },
};

// ---------------------------------------------------------------
// Tax Rates / 稅率
// ---------------------------------------------------------------

export const taxRatesApi = {
  /**
   * List tax rates
   * 列出稅率
   */
  list: async (params?: ListParams & {
    tax_type?: 'sales' | 'purchase' | 'both';
    is_active?: boolean;
  }): Promise<PaginatedResponse<TaxRate>> => {
    return typedApi.get<PaginatedResponse<TaxRate>>(`${BASE_PATH}/tax-rates/`, params);
  },

  /**
   * Get tax rate by ID
   * 通過 ID 獲取稅率
   */
  get: async (id: UUID): Promise<TaxRate> => {
    return typedApi.get<TaxRate>(`${BASE_PATH}/tax-rates/${id}/`);
  },

  /**
   * Create a new tax rate
   * 創建新稅率
   */
  create: async (data: Partial<TaxRate>): Promise<TaxRate> => {
    return typedApi.post<TaxRate>(`${BASE_PATH}/tax-rates/`, data);
  },

  /**
   * Update tax rate
   * 更新稅率
   */
  update: async (id: UUID, data: Partial<TaxRate>): Promise<TaxRate> => {
    return typedApi.patch<TaxRate>(`${BASE_PATH}/tax-rates/${id}/`, data);
  },

  /**
   * Delete tax rate
   * 刪除稅率
   */
  delete: async (id: UUID): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/tax-rates/${id}/`);
  },
};

// ---------------------------------------------------------------
// Fiscal Years / 會計年度
// ---------------------------------------------------------------

export const fiscalYearsApi = {
  /**
   * List fiscal years
   * 列出會計年度
   */
  list: async (): Promise<FiscalYear[]> => {
    return typedApi.get<FiscalYear[]>(`${BASE_PATH}/fiscal-years/`);
  },

  /**
   * Get fiscal year by ID
   * 通過 ID 獲取會計年度
   */
  get: async (id: UUID): Promise<FiscalYear> => {
    return typedApi.get<FiscalYear>(`${BASE_PATH}/fiscal-years/${id}/`);
  },

  /**
   * Get current fiscal year
   * 獲取當前會計年度
   */
  current: async (): Promise<FiscalYear> => {
    return typedApi.get<FiscalYear>(`${BASE_PATH}/fiscal-years/current/`);
  },

  /**
   * Create a new fiscal year
   * 創建新會計年度
   */
  create: async (data: { name: string; start_date: DateString; end_date: DateString }): Promise<FiscalYear> => {
    return typedApi.post<FiscalYear>(`${BASE_PATH}/fiscal-years/`, data);
  },

  /**
   * Close fiscal year
   * 關閉會計年度
   */
  close: async (id: UUID): Promise<FiscalYear> => {
    return typedApi.post<FiscalYear>(`${BASE_PATH}/fiscal-years/${id}/close/`);
  },

  /**
   * Reopen fiscal year
   * 重新開啟會計年度
   */
  reopen: async (id: UUID): Promise<FiscalYear> => {
    return typedApi.post<FiscalYear>(`${BASE_PATH}/fiscal-years/${id}/reopen/`);
  },
};

// ---------------------------------------------------------------
// Accounting Periods / 會計期間
// ---------------------------------------------------------------

export const accountingPeriodsApi = {
  /**
   * List accounting periods
   * 列出會計期間
   */
  list: async (params?: { fiscal_year?: UUID }): Promise<AccountingPeriod[]> => {
    return typedApi.get<AccountingPeriod[]>(`${BASE_PATH}/periods/`, params);
  },

  /**
   * Get current period
   * 獲取當前期間
   */
  current: async (): Promise<AccountingPeriod> => {
    return typedApi.get<AccountingPeriod>(`${BASE_PATH}/periods/current/`);
  },

  /**
   * Close period
   * 關閉期間
   */
  close: async (id: UUID): Promise<AccountingPeriod> => {
    return typedApi.post<AccountingPeriod>(`${BASE_PATH}/periods/${id}/close/`);
  },

  /**
   * Reopen period
   * 重新開啟期間
   */
  reopen: async (id: UUID): Promise<AccountingPeriod> => {
    return typedApi.post<AccountingPeriod>(`${BASE_PATH}/periods/${id}/reopen/`);
  },
};

// ---------------------------------------------------------------
// Export all accounting APIs
// ---------------------------------------------------------------

export const accountingApi = {
  accounts: accountsApi,
  journalEntries: journalEntriesApi,
  contacts: contactsApi,
  invoices: invoicesApi,
  expenses: expensesApi,
  payments: paymentsApi,
  currencies: currenciesApi,
  taxRates: taxRatesApi,
  fiscalYears: fiscalYearsApi,
  periods: accountingPeriodsApi,
};

export default accountingApi;
