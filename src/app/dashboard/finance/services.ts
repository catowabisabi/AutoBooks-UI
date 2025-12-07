/**
 * Finance Services - API 服務
 * Comprehensive finance and accounting API services
 */

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/api/v1`;

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
  page?: number;
  page_size?: number;
}): Promise<{ count: number; results: Invoice[] }> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.page) searchParams.append('page', String(params.page));
  if (params?.page_size) searchParams.append('page_size', String(params.page_size));
  
  const url = `${API_BASE_URL}/accounting/invoices/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  
  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch invoices');
    return response.json();
  } catch (error) {
    console.warn('Using demo invoices data:', error);
    return { count: DEMO_INVOICES.length, results: DEMO_INVOICES };
  }
}

export async function getInvoice(id: string): Promise<Invoice> {
  try {
    const response = await fetch(`${API_BASE_URL}/accounting/invoices/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch invoice');
    return response.json();
  } catch (error) {
    const invoice = DEMO_INVOICES.find(inv => inv.id === id);
    if (invoice) return invoice;
    throw new Error('Invoice not found');
  }
}

export async function createInvoice(data: Partial<Invoice>): Promise<Invoice> {
  const response = await fetch(`${API_BASE_URL}/accounting/invoices/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to create invoice');
  return response.json();
}

export async function updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
  const response = await fetch(`${API_BASE_URL}/accounting/invoices/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to update invoice');
  return response.json();
}

export async function deleteInvoice(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/accounting/invoices/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to delete invoice');
}

export async function downloadInvoicePdf(id: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/accounting/invoices/${id}/pdf/`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to download invoice PDF');
  return response.blob();
}

export async function getOverdueInvoices(): Promise<Invoice[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/accounting/invoices/overdue/`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch overdue invoices');
    return response.json();
  } catch (error) {
    return DEMO_INVOICES.filter(inv => inv.status === 'OVERDUE');
  }
}

// Demo invoices data
const DEMO_INVOICES: Invoice[] = [
  {
    id: '1',
    invoice_number: 'INV-2024-001',
    invoice_type: 'SALES',
    contact: '1',
    contact_name: 'Acme Corporation',
    invoice_date: '2024-01-15',
    due_date: '2024-02-15',
    subtotal: 5000,
    tax_amount: 250,
    total: 5250,
    amount_paid: 5250,
    balance_due: 0,
    currency: 'USD',
    status: 'PAID',
    created_at: '2024-01-15',
  },
  {
    id: '2',
    invoice_number: 'INV-2024-002',
    invoice_type: 'SALES',
    contact: '2',
    contact_name: 'Globex Industries',
    invoice_date: '2024-01-20',
    due_date: '2024-02-20',
    subtotal: 3000,
    tax_amount: 150,
    total: 3150,
    amount_paid: 0,
    balance_due: 3150,
    currency: 'USD',
    status: 'SENT',
    created_at: '2024-01-20',
  },
  {
    id: '3',
    invoice_number: 'INV-2024-003',
    invoice_type: 'SALES',
    contact: '3',
    contact_name: 'Wayne Enterprises',
    invoice_date: '2024-01-25',
    due_date: '2024-02-25',
    subtotal: 8500,
    tax_amount: 425,
    total: 8925,
    amount_paid: 4000,
    balance_due: 4925,
    currency: 'USD',
    status: 'PARTIAL',
    created_at: '2024-01-25',
  },
  {
    id: '4',
    invoice_number: 'INV-2024-004',
    invoice_type: 'SALES',
    contact: '4',
    contact_name: 'Stark Industries',
    invoice_date: '2023-12-01',
    due_date: '2023-12-31',
    subtotal: 12000,
    tax_amount: 600,
    total: 12600,
    amount_paid: 0,
    balance_due: 12600,
    currency: 'USD',
    status: 'OVERDUE',
    created_at: '2023-12-01',
  },
  {
    id: '5',
    invoice_number: 'INV-2024-005',
    invoice_type: 'SALES',
    contact: '5',
    contact_name: 'Umbrella Corp',
    invoice_date: '2024-02-01',
    due_date: '2024-03-01',
    subtotal: 2500,
    tax_amount: 125,
    total: 2625,
    amount_paid: 0,
    balance_due: 2625,
    currency: 'USD',
    status: 'DRAFT',
    created_at: '2024-02-01',
  },
];

// =============================================
// Expenses / 費用
// =============================================

export async function getExpenses(params?: {
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}): Promise<{ count: number; results: Expense[] }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.date_from) searchParams.append('date_from', params.date_from);
  if (params?.date_to) searchParams.append('date_to', params.date_to);
  if (params?.page) searchParams.append('page', String(params.page));
  if (params?.page_size) searchParams.append('page_size', String(params.page_size));
  
  const url = `${API_BASE_URL}/accounting/expenses/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  
  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch expenses');
    return response.json();
  } catch (error) {
    console.warn('Using demo expenses data:', error);
    return { count: DEMO_EXPENSES.length, results: DEMO_EXPENSES };
  }
}

export async function getExpense(id: string): Promise<Expense> {
  try {
    const response = await fetch(`${API_BASE_URL}/accounting/expenses/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch expense');
    return response.json();
  } catch (error) {
    const expense = DEMO_EXPENSES.find(exp => exp.id === id);
    if (expense) return expense;
    throw new Error('Expense not found');
  }
}

export async function createExpense(data: Partial<Expense>): Promise<Expense> {
  const response = await fetch(`${API_BASE_URL}/accounting/expenses/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to create expense');
  return response.json();
}

export async function updateExpense(id: string, data: Partial<Expense>): Promise<Expense> {
  const response = await fetch(`${API_BASE_URL}/accounting/expenses/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to update expense');
  return response.json();
}

export async function deleteExpense(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/accounting/expenses/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to delete expense');
}

export async function approveExpense(id: string): Promise<Expense> {
  const response = await fetch(`${API_BASE_URL}/accounting/expenses/${id}/approve/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to approve expense');
  return response.json();
}

export async function rejectExpense(id: string): Promise<Expense> {
  const response = await fetch(`${API_BASE_URL}/accounting/expenses/${id}/reject/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to reject expense');
  return response.json();
}

// Demo expenses data
const DEMO_EXPENSES: Expense[] = [
  {
    id: '1',
    expense_number: 'EXP-2024-001',
    date: '2024-01-10',
    category: 'Travel',
    vendor: '1',
    vendor_name: 'Delta Airlines',
    description: 'Business trip to New York',
    amount: 850,
    tax_amount: 0,
    total: 850,
    status: 'APPROVED',
    created_at: '2024-01-10',
  },
  {
    id: '2',
    expense_number: 'EXP-2024-002',
    date: '2024-01-15',
    category: 'Office Supplies',
    vendor: '2',
    vendor_name: 'Office Depot',
    description: 'Printer cartridges and paper',
    amount: 125,
    tax_amount: 10,
    total: 135,
    status: 'PENDING',
    created_at: '2024-01-15',
  },
  {
    id: '3',
    expense_number: 'EXP-2024-003',
    date: '2024-01-20',
    category: 'Meals',
    vendor: '3',
    vendor_name: 'The Grand Hotel',
    description: 'Client dinner meeting',
    amount: 280,
    tax_amount: 28,
    total: 308,
    status: 'PENDING',
    created_at: '2024-01-20',
  },
  {
    id: '4',
    expense_number: 'EXP-2024-004',
    date: '2024-01-25',
    category: 'Software',
    vendor: '4',
    vendor_name: 'Microsoft',
    description: 'Annual Office 365 subscription',
    amount: 1200,
    tax_amount: 96,
    total: 1296,
    status: 'APPROVED',
    created_at: '2024-01-25',
  },
  {
    id: '5',
    expense_number: 'EXP-2024-005',
    date: '2024-02-01',
    category: 'Marketing',
    vendor: '5',
    vendor_name: 'Facebook Ads',
    description: 'Social media advertising campaign',
    amount: 500,
    tax_amount: 0,
    total: 500,
    status: 'REJECTED',
    created_at: '2024-02-01',
  },
];

// =============================================
// Financial Reports / 財務報表
// =============================================

export interface TrialBalanceReport {
  accounts: {
    code: string;
    name: string;
    type: string;
    debit: number;
    credit: number;
  }[];
  totals: {
    debit: number;
    credit: number;
    is_balanced: boolean;
  };
}

export interface BalanceSheetReport {
  as_of_date: string | null;
  assets: number;
  liabilities: number;
  equity: number;
  total_liabilities_equity: number;
  is_balanced: boolean;
}

export interface IncomeStatementReport {
  period: {
    start_date: string | null;
    end_date: string | null;
  };
  revenue: number;
  expenses: number;
  net_income: number;
}

export interface ARAgingReport {
  current: number;
  '1_30_days': number;
  '31_60_days': number;
  '61_90_days': number;
  over_90_days: number;
  total: number;
}

export async function getTrialBalance(): Promise<TrialBalanceReport> {
  try {
    const response = await fetch(`${API_BASE_URL}/accounting/reports/trial_balance/`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch trial balance');
    return response.json();
  } catch (error) {
    console.warn('Using demo trial balance:', error);
    return DEMO_TRIAL_BALANCE;
  }
}

export async function getBalanceSheet(date?: string): Promise<BalanceSheetReport> {
  const url = date 
    ? `${API_BASE_URL}/accounting/reports/balance_sheet/?date=${date}`
    : `${API_BASE_URL}/accounting/reports/balance_sheet/`;
  
  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch balance sheet');
    return response.json();
  } catch (error) {
    console.warn('Using demo balance sheet:', error);
    return DEMO_BALANCE_SHEET;
  }
}

export async function getIncomeStatement(startDate?: string, endDate?: string): Promise<IncomeStatementReport> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const url = `${API_BASE_URL}/accounting/reports/income_statement/${params.toString() ? '?' + params.toString() : ''}`;
  
  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch income statement');
    return response.json();
  } catch (error) {
    console.warn('Using demo income statement:', error);
    return DEMO_INCOME_STATEMENT;
  }
}

export async function getARAgingReport(): Promise<ARAgingReport> {
  try {
    const response = await fetch(`${API_BASE_URL}/accounting/reports/accounts_receivable_aging/`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch AR aging report');
    return response.json();
  } catch (error) {
    console.warn('Using demo AR aging report:', error);
    return DEMO_AR_AGING;
  }
}

// Demo report data
const DEMO_TRIAL_BALANCE: TrialBalanceReport = {
  accounts: [
    { code: '1100', name: 'Cash', type: 'ASSET', debit: 450000, credit: 0 },
    { code: '1200', name: 'Accounts Receivable', type: 'ASSET', debit: 280000, credit: 0 },
    { code: '1300', name: 'Inventory', type: 'ASSET', debit: 120000, credit: 0 },
    { code: '1500', name: 'Fixed Assets', type: 'ASSET', debit: 350000, credit: 0 },
    { code: '1510', name: 'Accumulated Depreciation', type: 'ASSET', debit: 0, credit: 50000 },
    { code: '2100', name: 'Accounts Payable', type: 'LIABILITY', debit: 0, credit: 150000 },
    { code: '2200', name: 'Accrued Expenses', type: 'LIABILITY', debit: 0, credit: 80000 },
    { code: '3100', name: 'Share Capital', type: 'EQUITY', debit: 0, credit: 300000 },
    { code: '3200', name: 'Retained Earnings', type: 'EQUITY', debit: 0, credit: 200000 },
    { code: '4100', name: 'Service Revenue', type: 'REVENUE', debit: 0, credit: 650000 },
    { code: '5100', name: 'Salaries', type: 'EXPENSE', debit: 200000, credit: 0 },
    { code: '5200', name: 'Rent', type: 'EXPENSE', debit: 30000, credit: 0 },
  ],
  totals: {
    debit: 1430000,
    credit: 1430000,
    is_balanced: true,
  },
};

const DEMO_BALANCE_SHEET: BalanceSheetReport = {
  as_of_date: new Date().toISOString().split('T')[0],
  assets: 1150000,
  liabilities: 230000,
  equity: 920000,
  total_liabilities_equity: 1150000,
  is_balanced: true,
};

const DEMO_INCOME_STATEMENT: IncomeStatementReport = {
  period: {
    start_date: '2024-01-01',
    end_date: '2024-12-31',
  },
  revenue: 850000,
  expenses: 480000,
  net_income: 370000,
};

const DEMO_AR_AGING: ARAgingReport = {
  current: 15000,
  '1_30_days': 8500,
  '31_60_days': 4200,
  '61_90_days': 2100,
  over_90_days: 1500,
  total: 31300,
};

// =============================================
// General Ledger / 總帳
// =============================================

export interface LedgerEntry {
  id: string;
  date: string;
  entry_number: string;
  description: string;
  reference?: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface LedgerAccount {
  account: Account;
  opening_balance: number;
  entries: LedgerEntry[];
  closing_balance: number;
  total_debit: number;
  total_credit: number;
}

export async function getGeneralLedger(accountId: string, params?: {
  start_date?: string;
  end_date?: string;
}): Promise<LedgerAccount> {
  const searchParams = new URLSearchParams();
  if (params?.start_date) searchParams.append('start_date', params.start_date);
  if (params?.end_date) searchParams.append('end_date', params.end_date);
  
  const url = `${API_BASE_URL}/accounting/accounts/${accountId}/ledger/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  
  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch general ledger');
    return response.json();
  } catch (error) {
    console.warn('Using demo ledger data:', error);
    // Return demo ledger data
    const account = flattenAccounts(DEMO_ACCOUNTS).find(a => a.id === accountId);
    return {
      account: account || DEMO_ACCOUNTS[0],
      opening_balance: 0,
      entries: DEMO_LEDGER_ENTRIES,
      closing_balance: account?.current_balance || 0,
      total_debit: 50000,
      total_credit: 20000,
    };
  }
}

const DEMO_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: '1',
    date: '2024-01-05',
    entry_number: 'JE-2024-001',
    description: 'Opening balance',
    debit: 100000,
    credit: 0,
    balance: 100000,
  },
  {
    id: '2',
    date: '2024-01-10',
    entry_number: 'JE-2024-002',
    description: 'Cash receipt from customer',
    debit: 25000,
    credit: 0,
    balance: 125000,
  },
  {
    id: '3',
    date: '2024-01-15',
    entry_number: 'JE-2024-003',
    description: 'Payment to supplier',
    debit: 0,
    credit: 15000,
    balance: 110000,
  },
  {
    id: '4',
    date: '2024-01-20',
    entry_number: 'JE-2024-004',
    description: 'Utility payment',
    debit: 0,
    credit: 5000,
    balance: 105000,
  },
];

// =============================================
// Approvals / 審批
// =============================================

export interface ApprovalItem {
  id: string;
  type: 'EXPENSE' | 'INVOICE' | 'JOURNAL_ENTRY' | 'PAYMENT';
  reference_number: string;
  description: string;
  amount: number;
  currency: string;
  submitted_by: string;
  submitted_by_name: string;
  submitted_at: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export async function getPendingApprovals(): Promise<{ count: number; results: ApprovalItem[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/accounting/approvals/pending/`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch pending approvals');
    return response.json();
  } catch (error) {
    console.warn('Using demo approvals data:', error);
    return { count: DEMO_APPROVALS.length, results: DEMO_APPROVALS };
  }
}

export async function approveItem(type: string, id: string): Promise<void> {
  const endpoint = type === 'EXPENSE' 
    ? `${API_BASE_URL}/accounting/expenses/${id}/approve/`
    : `${API_BASE_URL}/accounting/${type.toLowerCase()}s/${id}/approve/`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to approve item');
}

export async function rejectItem(type: string, id: string, reason?: string): Promise<void> {
  const endpoint = type === 'EXPENSE' 
    ? `${API_BASE_URL}/accounting/expenses/${id}/reject/`
    : `${API_BASE_URL}/accounting/${type.toLowerCase()}s/${id}/reject/`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  });
  
  if (!response.ok) throw new Error('Failed to reject item');
}

const DEMO_APPROVALS: ApprovalItem[] = [
  {
    id: '1',
    type: 'EXPENSE',
    reference_number: 'EXP-2024-002',
    description: 'Office supplies purchase',
    amount: 135,
    currency: 'USD',
    submitted_by: '1',
    submitted_by_name: 'John Smith',
    submitted_at: '2024-01-15',
    status: 'PENDING',
    priority: 'MEDIUM',
  },
  {
    id: '2',
    type: 'EXPENSE',
    reference_number: 'EXP-2024-003',
    description: 'Client dinner meeting',
    amount: 308,
    currency: 'USD',
    submitted_by: '2',
    submitted_by_name: 'Jane Doe',
    submitted_at: '2024-01-20',
    status: 'PENDING',
    priority: 'LOW',
  },
  {
    id: '3',
    type: 'INVOICE',
    reference_number: 'INV-2024-005',
    description: 'Sales invoice - Draft approval',
    amount: 2625,
    currency: 'USD',
    submitted_by: '1',
    submitted_by_name: 'John Smith',
    submitted_at: '2024-02-01',
    status: 'PENDING',
    priority: 'HIGH',
  },
];

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
