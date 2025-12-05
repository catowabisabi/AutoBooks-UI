/**
 * Finance Services - API 服務
 * Comprehensive finance and accounting API services
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// =============================================
// Types / 類型定義
// =============================================

export interface Account {
  id: string;
  code: string;
  name: string;
  name_zh?: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parent?: string;
  description?: string;
  is_active: boolean;
  is_debit_positive: boolean;
  current_balance: number;
  children?: Account[];
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  entry_number: string;
  date: string;
  description: string;
  reference?: string;
  status: 'DRAFT' | 'POSTED' | 'VOIDED';
  lines: JournalEntryLine[];
  total_debit: number;
  total_credit: number;
  is_balanced: boolean;
  created_by?: string;
  created_by_name?: string;
  posted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryLine {
  id: string;
  account: string;
  account_name?: string;
  account_code?: string;
  description?: string;
  debit: number;
  credit: number;
}

export interface Contact {
  id: string;
  contact_type: 'CUSTOMER' | 'VENDOR' | 'BOTH';
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  payment_terms?: number;
  credit_limit?: number;
  outstanding_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  payment_number: string;
  payment_type: 'RECEIVED' | 'MADE';
  contact: string;
  contact_name?: string;
  date: string;
  amount: number;
  currency: string;
  payment_method: 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'CREDIT_CARD' | 'OTHER';
  reference?: string;
  notes?: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol?: string;
  exchange_rate?: number;
  decimal_places?: number;
  is_base?: boolean;
  is_active: boolean;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  tax_type?: 'SALES' | 'PURCHASE' | 'BOTH';
  description?: string;
  is_compound?: boolean;
  is_recoverable?: boolean;
  is_default?: boolean;
  is_active: boolean;
}

export interface FiscalYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  is_closed?: boolean;
  is_current?: boolean;
}

export interface Period {
  id: string;
  fiscal_year: string | number;
  fiscal_year_name?: string;
  name: string;
  start_date: string;
  end_date: string;
  period_number?: number;
  is_closed: boolean;
}

export interface AccountingPeriod {
  id: string;
  fiscal_year: string;
  fiscal_year_name?: string;
  name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type?: 'SALES' | 'PURCHASE';
  contact: string;
  contact_name?: string;
  invoice_date: string;
  due_date: string;
  subtotal?: number;
  tax_amount?: number;
  total?: number;
  amount_paid?: number;
  balance_due?: number;
  currency?: string;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';
  lines?: InvoiceLine[];
  created_at?: string;
}

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate?: string;
  tax_amount: number;
  total: number;
}

export interface Expense {
  id: string;
  expense_number: string;
  date: string;
  category: string;
  vendor?: string;
  vendor_name?: string;
  description: string;
  amount: number;
  tax_amount: number;
  total: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  receipt_url?: string;
  created_at: string;
}

export interface FinanceSummary {
  total_revenue: number;
  total_expenses: number;
  net_income: number;
  accounts_receivable: number;
  accounts_payable: number;
  cash_balance: number;
  pending_invoices: number;
  overdue_invoices: number;
  recent_transactions: any[];
  revenue_by_month: { month: string; amount: number }[];
  expense_by_category: { category: string; amount: number }[];
}

// =============================================
// Chart of Accounts / 會計科目
// =============================================

export async function getAccounts(params?: {
  type?: string;
  active?: boolean;
}): Promise<{ count: number; results: Account[] }> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  if (params?.active !== undefined) searchParams.append('active', String(params.active));
  
  const url = `${API_BASE_URL}/accounting/accounts/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to fetch accounts');
  return response.json();
}

export async function getChartOfAccounts(): Promise<Account[]> {
  const response = await fetch(`${API_BASE_URL}/accounting/accounts/chart_of_accounts/`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to fetch chart of accounts');
  return response.json();
}

export async function createAccount(data: Partial<Account>): Promise<Account> {
  const response = await fetch(`${API_BASE_URL}/accounting/accounts/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to create account');
  return response.json();
}

export async function updateAccount(id: string, data: Partial<Account>): Promise<Account> {
  const response = await fetch(`${API_BASE_URL}/accounting/accounts/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to update account');
  return response.json();
}

// =============================================
// Journal Entries / 日記帳分錄
// =============================================

export async function getJournalEntries(params?: {
  status?: string;
  date_from?: string;
  date_to?: string;
}): Promise<{ count: number; results: JournalEntry[] }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.date_from) searchParams.append('date_from', params.date_from);
  if (params?.date_to) searchParams.append('date_to', params.date_to);
  
  const url = `${API_BASE_URL}/accounting/journal-entries/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to fetch journal entries');
  return response.json();
}

export async function getJournalEntry(id: string): Promise<JournalEntry> {
  const response = await fetch(`${API_BASE_URL}/accounting/journal-entries/${id}/`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to fetch journal entry');
  return response.json();
}

export async function createJournalEntry(data: {
  date: string;
  description: string;
  reference?: string;
  lines: { account: string; description?: string; debit: number; credit: number }[];
}): Promise<JournalEntry> {
  const response = await fetch(`${API_BASE_URL}/accounting/journal-entries/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create journal entry');
  }
  return response.json();
}

export async function postJournalEntry(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/accounting/journal-entries/${id}/post/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to post journal entry');
  }
}

export async function voidJournalEntry(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/accounting/journal-entries/${id}/void/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to void journal entry');
  }
}

// =============================================
// Contacts / 聯絡人
// =============================================

export async function getContacts(params?: {
  type?: 'CUSTOMER' | 'VENDOR';
}): Promise<{ count: number; results: Contact[] }> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  
  const url = `${API_BASE_URL}/accounting/contacts/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to fetch contacts');
  return response.json();
}

export async function createContact(data: Partial<Contact>): Promise<Contact> {
  const response = await fetch(`${API_BASE_URL}/accounting/contacts/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to create contact');
  return response.json();
}

export async function updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
  const response = await fetch(`${API_BASE_URL}/accounting/contacts/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to update contact');
  return response.json();
}

// =============================================
// Payments / 收付款
// =============================================

export async function getPayments(params?: {
  type?: 'RECEIVED' | 'MADE';
  status?: string;
}): Promise<{ count: number; results: Payment[] }> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  if (params?.status) searchParams.append('status', params.status);
  
  const url = `${API_BASE_URL}/accounting/payments/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to fetch payments');
  return response.json();
}

export async function createPayment(data: Partial<Payment>): Promise<Payment> {
  const response = await fetch(`${API_BASE_URL}/accounting/payments/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to create payment');
  return response.json();
}

// =============================================
// Currencies / 貨幣
// =============================================

export async function getCurrencies(): Promise<{ count: number; results: Currency[] }> {
  const response = await fetch(`${API_BASE_URL}/accounting/currencies/`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to fetch currencies');
  return response.json();
}

export async function createCurrency(data: Partial<Currency>): Promise<Currency> {
  const response = await fetch(`${API_BASE_URL}/accounting/currencies/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to create currency');
  return response.json();
}

export async function updateCurrency(id: string, data: Partial<Currency>): Promise<Currency> {
  const response = await fetch(`${API_BASE_URL}/accounting/currencies/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to update currency');
  return response.json();
}

// =============================================
// Tax Rates / 稅率
// =============================================

export async function getTaxRates(): Promise<{ count: number; results: TaxRate[] }> {
  const response = await fetch(`${API_BASE_URL}/accounting/tax-rates/`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to fetch tax rates');
  return response.json();
}

export async function createTaxRate(data: Partial<TaxRate>): Promise<TaxRate> {
  const response = await fetch(`${API_BASE_URL}/accounting/tax-rates/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to create tax rate');
  return response.json();
}

export async function updateTaxRate(id: string, data: Partial<TaxRate>): Promise<TaxRate> {
  const response = await fetch(`${API_BASE_URL}/accounting/tax-rates/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to update tax rate');
  return response.json();
}

// =============================================
// Fiscal Years / 財年
// =============================================

export async function getFiscalYears(): Promise<{ count: number; results: FiscalYear[] }> {
  const response = await fetch(`${API_BASE_URL}/accounting/fiscal-years/`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to fetch fiscal years');
  return response.json();
}

export async function createFiscalYear(data: Partial<FiscalYear>): Promise<FiscalYear> {
  const response = await fetch(`${API_BASE_URL}/accounting/fiscal-years/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to create fiscal year');
  return response.json();
}

export async function updateFiscalYear(id: string, data: Partial<FiscalYear>): Promise<FiscalYear> {
  const response = await fetch(`${API_BASE_URL}/accounting/fiscal-years/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to update fiscal year');
  return response.json();
}

// =============================================
// Accounting Periods / 會計期間
// =============================================

export async function getAccountingPeriods(fiscalYearId?: string): Promise<{ count: number; results: AccountingPeriod[] }> {
  const searchParams = new URLSearchParams();
  if (fiscalYearId) searchParams.append('fiscal_year', fiscalYearId);
  
  const url = `${API_BASE_URL}/accounting/periods/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to fetch accounting periods');
  return response.json();
}

export async function getPeriods(params?: {
  fiscal_year?: string;
}): Promise<{ count: number; results: Period[] }> {
  const searchParams = new URLSearchParams();
  if (params?.fiscal_year) searchParams.append('fiscal_year', params.fiscal_year);
  
  const url = `${API_BASE_URL}/accounting/periods/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to fetch periods');
  return response.json();
}

export async function createPeriod(data: Partial<Period>): Promise<Period> {
  const response = await fetch(`${API_BASE_URL}/accounting/periods/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to create period');
  return response.json();
}

export async function updatePeriod(id: string, data: Partial<Period>): Promise<Period> {
  const response = await fetch(`${API_BASE_URL}/accounting/periods/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to update period');
  return response.json();
}

// =============================================
// Invoices / 發票
// =============================================

export async function getInvoices(params?: {
  type?: 'SALES' | 'PURCHASE';
  status?: string;
}): Promise<{ count: number; results: Invoice[] }> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  if (params?.status) searchParams.append('status', params.status);
  
  const url = `${API_BASE_URL}/accounting/invoices/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to fetch invoices');
  return response.json();
}

// =============================================
// Expenses / 費用
// =============================================

export async function getExpenses(params?: {
  status?: string;
  date_from?: string;
  date_to?: string;
}): Promise<{ count: number; results: Expense[] }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.date_from) searchParams.append('date_from', params.date_from);
  if (params?.date_to) searchParams.append('date_to', params.date_to);
  
  const url = `${API_BASE_URL}/accounting/expenses/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to fetch expenses');
  return response.json();
}

// =============================================
// Finance Summary / 財務摘要
// =============================================

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const response = await fetch(`${API_BASE_URL}/accounting/summary/`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    // Return mock data for demo
    return {
      total_revenue: 325890,
      total_expenses: 271000,
      net_income: 54890,
      accounts_receivable: 45200,
      accounts_payable: 32100,
      cash_balance: 128500,
      pending_invoices: 12,
      overdue_invoices: 3,
      recent_transactions: [],
      revenue_by_month: [
        { month: 'Jan', amount: 45000 },
        { month: 'Feb', amount: 50000 },
        { month: 'Mar', amount: 52000 },
        { month: 'Apr', amount: 58000 },
        { month: 'May', amount: 55000 },
        { month: 'Jun', amount: 60000 },
      ],
      expense_by_category: [
        { category: 'Operations', amount: 50000 },
        { category: 'Marketing', amount: 28000 },
        { category: 'Payroll', amount: 135000 },
        { category: 'Equipment', amount: 15000 },
        { category: 'Miscellaneous', amount: 7000 },
      ],
    };
  }
  return response.json();
}
