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

// Demo accounts data for development/fallback
const DEMO_ACCOUNTS: Account[] = [
  // Assets
  {
    id: '1',
    code: '1000',
    name: 'Assets',
    name_zh: '資產',
    account_type: 'ASSET',
    is_active: true,
    is_debit_positive: true,
    current_balance: 1250000,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    children: [
      {
        id: '1-1',
        code: '1100',
        name: 'Current Assets',
        name_zh: '流動資產',
        account_type: 'ASSET',
        parent: '1',
        is_active: true,
        is_debit_positive: true,
        current_balance: 850000,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        children: [
          {
            id: '1-1-1',
            code: '1110',
            name: 'Cash and Cash Equivalents',
            name_zh: '現金及現金等價物',
            account_type: 'ASSET',
            parent: '1-1',
            is_active: true,
            is_debit_positive: true,
            current_balance: 450000,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          {
            id: '1-1-2',
            code: '1120',
            name: 'Accounts Receivable',
            name_zh: '應收帳款',
            account_type: 'ASSET',
            parent: '1-1',
            is_active: true,
            is_debit_positive: true,
            current_balance: 280000,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          {
            id: '1-1-3',
            code: '1130',
            name: 'Inventory',
            name_zh: '存貨',
            account_type: 'ASSET',
            parent: '1-1',
            is_active: true,
            is_debit_positive: true,
            current_balance: 120000,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
        ],
      },
      {
        id: '1-2',
        code: '1200',
        name: 'Fixed Assets',
        name_zh: '固定資產',
        account_type: 'ASSET',
        parent: '1',
        is_active: true,
        is_debit_positive: true,
        current_balance: 400000,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        children: [
          {
            id: '1-2-1',
            code: '1210',
            name: 'Property and Equipment',
            name_zh: '物業及設備',
            account_type: 'ASSET',
            parent: '1-2',
            is_active: true,
            is_debit_positive: true,
            current_balance: 350000,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          {
            id: '1-2-2',
            code: '1220',
            name: 'Accumulated Depreciation',
            name_zh: '累計折舊',
            account_type: 'ASSET',
            parent: '1-2',
            is_active: true,
            is_debit_positive: true,
            current_balance: -50000,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
        ],
      },
    ],
  },
  // Liabilities
  {
    id: '2',
    code: '2000',
    name: 'Liabilities',
    name_zh: '負債',
    account_type: 'LIABILITY',
    is_active: true,
    is_debit_positive: false,
    current_balance: 380000,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    children: [
      {
        id: '2-1',
        code: '2100',
        name: 'Current Liabilities',
        name_zh: '流動負債',
        account_type: 'LIABILITY',
        parent: '2',
        is_active: true,
        is_debit_positive: false,
        current_balance: 280000,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        children: [
          {
            id: '2-1-1',
            code: '2110',
            name: 'Accounts Payable',
            name_zh: '應付帳款',
            account_type: 'LIABILITY',
            parent: '2-1',
            is_active: true,
            is_debit_positive: false,
            current_balance: 150000,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          {
            id: '2-1-2',
            code: '2120',
            name: 'Accrued Expenses',
            name_zh: '應計費用',
            account_type: 'LIABILITY',
            parent: '2-1',
            is_active: true,
            is_debit_positive: false,
            current_balance: 80000,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          {
            id: '2-1-3',
            code: '2130',
            name: 'Tax Payable',
            name_zh: '應付稅款',
            account_type: 'LIABILITY',
            parent: '2-1',
            is_active: true,
            is_debit_positive: false,
            current_balance: 50000,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
        ],
      },
      {
        id: '2-2',
        code: '2200',
        name: 'Long-term Liabilities',
        name_zh: '長期負債',
        account_type: 'LIABILITY',
        parent: '2',
        is_active: true,
        is_debit_positive: false,
        current_balance: 100000,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ],
  },
  // Equity
  {
    id: '3',
    code: '3000',
    name: 'Equity',
    name_zh: '權益',
    account_type: 'EQUITY',
    is_active: true,
    is_debit_positive: false,
    current_balance: 500000,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    children: [
      {
        id: '3-1',
        code: '3100',
        name: 'Share Capital',
        name_zh: '股本',
        account_type: 'EQUITY',
        parent: '3',
        is_active: true,
        is_debit_positive: false,
        current_balance: 300000,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: '3-2',
        code: '3200',
        name: 'Retained Earnings',
        name_zh: '保留盈餘',
        account_type: 'EQUITY',
        parent: '3',
        is_active: true,
        is_debit_positive: false,
        current_balance: 200000,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ],
  },
  // Revenue
  {
    id: '4',
    code: '4000',
    name: 'Revenue',
    name_zh: '收入',
    account_type: 'REVENUE',
    is_active: true,
    is_debit_positive: false,
    current_balance: 850000,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    children: [
      {
        id: '4-1',
        code: '4100',
        name: 'Service Revenue',
        name_zh: '服務收入',
        account_type: 'REVENUE',
        parent: '4',
        is_active: true,
        is_debit_positive: false,
        current_balance: 650000,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: '4-2',
        code: '4200',
        name: 'Interest Income',
        name_zh: '利息收入',
        account_type: 'REVENUE',
        parent: '4',
        is_active: true,
        is_debit_positive: false,
        current_balance: 15000,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: '4-3',
        code: '4300',
        name: 'Other Income',
        name_zh: '其他收入',
        account_type: 'REVENUE',
        parent: '4',
        is_active: true,
        is_debit_positive: false,
        current_balance: 185000,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ],
  },
  // Expenses
  {
    id: '5',
    code: '5000',
    name: 'Expenses',
    name_zh: '費用',
    account_type: 'EXPENSE',
    is_active: true,
    is_debit_positive: true,
    current_balance: 480000,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    children: [
      {
        id: '5-1',
        code: '5100',
        name: 'Operating Expenses',
        name_zh: '營運費用',
        account_type: 'EXPENSE',
        parent: '5',
        is_active: true,
        is_debit_positive: true,
        current_balance: 320000,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        children: [
          {
            id: '5-1-1',
            code: '5110',
            name: 'Salaries and Wages',
            name_zh: '薪金及工資',
            account_type: 'EXPENSE',
            parent: '5-1',
            is_active: true,
            is_debit_positive: true,
            current_balance: 200000,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          {
            id: '5-1-2',
            code: '5120',
            name: 'Rent Expense',
            name_zh: '租金費用',
            account_type: 'EXPENSE',
            parent: '5-1',
            is_active: true,
            is_debit_positive: true,
            current_balance: 60000,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          {
            id: '5-1-3',
            code: '5130',
            name: 'Utilities',
            name_zh: '水電費',
            account_type: 'EXPENSE',
            parent: '5-1',
            is_active: true,
            is_debit_positive: true,
            current_balance: 25000,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          {
            id: '5-1-4',
            code: '5140',
            name: 'Office Supplies',
            name_zh: '辦公用品',
            account_type: 'EXPENSE',
            parent: '5-1',
            is_active: true,
            is_debit_positive: true,
            current_balance: 15000,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          {
            id: '5-1-5',
            code: '5150',
            name: 'Professional Fees',
            name_zh: '專業費用',
            account_type: 'EXPENSE',
            parent: '5-1',
            is_active: true,
            is_debit_positive: true,
            current_balance: 20000,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
        ],
      },
      {
        id: '5-2',
        code: '5200',
        name: 'Marketing Expenses',
        name_zh: '市場推廣費用',
        account_type: 'EXPENSE',
        parent: '5',
        is_active: true,
        is_debit_positive: true,
        current_balance: 80000,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: '5-3',
        code: '5300',
        name: 'Depreciation',
        name_zh: '折舊',
        account_type: 'EXPENSE',
        parent: '5',
        is_active: true,
        is_debit_positive: true,
        current_balance: 50000,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: '5-4',
        code: '5400',
        name: 'Interest Expense',
        name_zh: '利息費用',
        account_type: 'EXPENSE',
        parent: '5',
        is_active: true,
        is_debit_positive: true,
        current_balance: 30000,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ],
  },
];

// Flatten chart of accounts for list view
function flattenAccounts(accounts: Account[]): Account[] {
  const result: Account[] = [];
  function traverse(accts: Account[]) {
    for (const acct of accts) {
      result.push(acct);
      if (acct.children && acct.children.length > 0) {
        traverse(acct.children);
      }
    }
  }
  traverse(accounts);
  return result;
}

export async function getAccounts(params?: {
  type?: string;
  active?: boolean;
}): Promise<{ count: number; results: Account[] }> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  if (params?.active !== undefined) searchParams.append('active', String(params.active));
  
  const url = `${API_BASE_URL}/accounting/accounts/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  
  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return response.json();
  } catch (error) {
    console.warn('Using demo accounts data:', error);
    // Return flattened demo data as fallback
    const flatAccounts = flattenAccounts(DEMO_ACCOUNTS);
    let filtered = flatAccounts;
    if (params?.type) {
      filtered = filtered.filter(a => a.account_type === params.type);
    }
    if (params?.active !== undefined) {
      filtered = filtered.filter(a => a.is_active === params.active);
    }
    return { count: filtered.length, results: filtered };
  }
}

export async function getChartOfAccounts(): Promise<Account[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/accounting/accounts/chart_of_accounts/`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch chart of accounts');
    return response.json();
  } catch (error) {
    console.warn('Using demo chart of accounts:', error);
    return DEMO_ACCOUNTS;
  }
}

export async function createAccount(data: Partial<Account>): Promise<Account> {
  try {
    const response = await fetch(`${API_BASE_URL}/accounting/accounts/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Failed to create account');
    return response.json();
  } catch (error) {
    console.warn('Demo mode: simulating account creation');
    // Return a simulated created account
    return {
      id: `demo-${Date.now()}`,
      code: data.code || '0000',
      name: data.name || 'New Account',
      name_zh: data.name_zh,
      account_type: data.account_type || 'ASSET',
      parent: data.parent,
      description: data.description,
      is_active: data.is_active ?? true,
      is_debit_positive: data.account_type === 'ASSET' || data.account_type === 'EXPENSE',
      current_balance: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}

export async function updateAccount(id: string, data: Partial<Account>): Promise<Account> {
  try {
    const response = await fetch(`${API_BASE_URL}/accounting/accounts/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Failed to update account');
    return response.json();
  } catch (error) {
    console.warn('Demo mode: simulating account update');
    // Return simulated updated account
    return {
      id,
      code: data.code || '0000',
      name: data.name || 'Updated Account',
      name_zh: data.name_zh,
      account_type: data.account_type || 'ASSET',
      parent: data.parent,
      description: data.description,
      is_active: data.is_active ?? true,
      is_debit_positive: data.account_type === 'ASSET' || data.account_type === 'EXPENSE',
      current_balance: data.current_balance || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
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
