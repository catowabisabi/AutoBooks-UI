/**
 * API Types - Full DTO interfaces
 * Generated from Django REST Framework serializers
 * 完整的 API 類型定義
 */

// =================================================================
// Common Types / 通用類型
// =================================================================

/** UUID string type */
export type UUID = string;

/** ISO date string (YYYY-MM-DD) */
export type DateString = string;

/** ISO datetime string */
export type DateTimeString = string;

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** API error response */
export interface ApiError {
  detail?: string;
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

/** Query parameters for list endpoints */
export interface ListParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

// =================================================================
// Auth Types / 認證類型
// =================================================================

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface GoogleAuthUrlResponse {
  auth_url: string;
}

export interface GoogleCallbackRequest {
  code: string;
  state?: string;
}

// =================================================================
// User Types / 用戶類型
// =================================================================

export type UserRole = 'admin' | 'manager' | 'user' | 'viewer';

export interface User {
  id: UUID;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  phone?: string | null;
  avatar_url?: string | null;
  timezone?: string;
  language?: string;
}

export interface UserProfile extends User {
  // Extended profile fields
}

export interface UserProfileUpdateRequest {
  full_name?: string;
  phone?: string | null;
  avatar_url?: string | null;
  timezone?: string;
  language?: string;
}

export interface UserSettings {
  id: UUID;
  // Notification Settings
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notify_task_assigned: boolean;
  notify_task_completed: boolean;
  notify_invoice_received: boolean;
  notify_payment_due: boolean;
  notify_system_updates: boolean;
  notify_security_alerts: boolean;
  notify_weekly_digest: boolean;
  notify_monthly_report: boolean;
  // Billing Settings
  billing_email?: string | null;
  billing_address?: string | null;
  billing_city?: string | null;
  billing_country?: string | null;
  billing_postal_code?: string | null;
  company_name?: string | null;
  tax_id?: string | null;
  // Subscription
  subscription_plan?: string | null;
  subscription_status?: string | null;
  subscription_start_date?: DateTimeString | null;
  subscription_end_date?: DateTimeString | null;
  // Payment
  payment_method_type?: string | null;
  payment_method_last_four?: string | null;
  payment_method_expiry?: string | null;
}

export interface UserSettingsUpdateRequest {
  email_notifications?: boolean;
  push_notifications?: boolean;
  sms_notifications?: boolean;
  notify_task_assigned?: boolean;
  notify_task_completed?: boolean;
  notify_invoice_received?: boolean;
  notify_payment_due?: boolean;
  notify_system_updates?: boolean;
  notify_security_alerts?: boolean;
  notify_weekly_digest?: boolean;
  notify_monthly_report?: boolean;
  billing_email?: string | null;
  billing_address?: string | null;
  billing_city?: string | null;
  billing_country?: string | null;
  billing_postal_code?: string | null;
  company_name?: string | null;
  tax_id?: string | null;
}

// =================================================================
// Tenant Types / 租戶類型
// =================================================================

export type TenantRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
export type SubscriptionPlanType = 'free' | 'starter' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired';

export interface Tenant {
  id: UUID;
  name: string;
  slug: string;
  legal_name?: string | null;
  tax_id?: string | null;
  industry?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  default_currency: string;
  fiscal_year_start_month: number;
  timezone: string;
  subscription_plan: SubscriptionPlanType;
  subscription_status: SubscriptionStatus;
  max_users: number;
  logo_url?: string | null;
  is_active: boolean;
  member_count: number;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export interface TenantListItem {
  id: UUID;
  name: string;
  slug: string;
  logo_url?: string | null;
  member_count: number;
  role?: TenantRole | null;
  subscription_plan: SubscriptionPlanType;
}

export interface TenantCreateRequest {
  name: string;
  slug?: string;
  legal_name?: string;
  tax_id?: string;
  industry?: string;
  country?: string;
  default_currency?: string;
}

export interface TenantMembership {
  id: UUID;
  tenant: UUID;
  tenant_name: string;
  user: UUID;
  user_email: string;
  user_name: string;
  role: TenantRole;
  custom_permissions: Record<string, boolean>;
  is_active: boolean;
  has_write_access: boolean;
  has_admin_access: boolean;
  invited_at?: DateTimeString | null;
  accepted_at?: DateTimeString | null;
  created_at: DateTimeString;
}

export interface TenantInvitation {
  id: UUID;
  tenant: UUID;
  tenant_name: string;
  email: string;
  role: TenantRole;
  invited_by: UUID;
  invited_by_email: string;
  expires_at: DateTimeString;
  is_valid: boolean;
  is_expired: boolean;
  created_at: DateTimeString;
}

export interface InviteUserRequest {
  email: string;
  role?: TenantRole;
}

// =================================================================
// Subscription Types / 訂閱類型
// =================================================================

export interface SubscriptionPlanFeature {
  key: string;
  en: string;
  zh: string;
}

export interface SubscriptionPlan {
  id: UUID;
  plan_type: SubscriptionPlanType;
  name: string;
  name_en: string;
  name_zh: string;
  description?: string | null;
  description_en?: string | null;
  description_zh?: string | null;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  max_users: number;
  max_companies: number;
  max_storage_gb: number;
  max_documents: number;
  max_invoices_monthly: number;
  max_employees: number;
  max_projects: number;
  has_ai_assistant: boolean;
  has_advanced_analytics: boolean;
  has_custom_reports: boolean;
  has_api_access: boolean;
  has_priority_support: boolean;
  has_sso: boolean;
  has_audit_logs: boolean;
  has_data_export: boolean;
  has_multi_currency: boolean;
  has_custom_branding: boolean;
  ai_queries_monthly: number;
  rag_documents: number;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  features: SubscriptionPlanFeature[];
}

export interface UserSubscription {
  id: UUID;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_cycle: 'monthly' | 'yearly';
  start_date: DateTimeString;
  end_date?: DateTimeString | null;
  trial_end_date?: DateTimeString | null;
  next_billing_date?: DateTimeString | null;
  cancelled_at?: DateTimeString | null;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

// =================================================================
// Accounting Types / 會計類型
// =================================================================

export type AccountType = 
  | 'asset' | 'liability' | 'equity' | 'income' | 'expense'
  | 'bank' | 'cash' | 'current_asset' | 'fixed_asset' | 'inventory'
  | 'accounts_receivable' | 'accounts_payable' | 'current_liability'
  | 'long_term_liability' | 'retained_earnings' | 'revenue'
  | 'cost_of_goods_sold' | 'operating_expense' | 'other_income' | 'other_expense';

export type JournalStatus = 'draft' | 'pending' | 'posted' | 'void';
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'void' | 'cancelled';
export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
export type ContactType = 'customer' | 'vendor' | 'both' | 'other';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'credit_card' | 'other';

export interface Account {
  id: UUID;
  code: string;
  name: string;
  name_en?: string | null;
  name_zh?: string | null;
  account_type: AccountType;
  parent?: UUID | null;
  parent_code?: string | null;
  parent_name?: string | null;
  children?: Account[];
  description?: string | null;
  is_active: boolean;
  is_system: boolean;
  is_header: boolean;
  allows_direct_posting: boolean;
  tax_rate?: UUID | null;
  currency?: string;
  opening_balance: number;
  current_balance: number;
  level: number;
  full_path: string;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export interface AccountCreateRequest {
  code: string;
  name: string;
  name_en?: string;
  name_zh?: string;
  account_type: AccountType;
  parent?: UUID | null;
  description?: string;
  is_active?: boolean;
  is_header?: boolean;
  allows_direct_posting?: boolean;
  tax_rate?: UUID | null;
  currency?: string;
  opening_balance?: number;
}

export interface JournalEntryLine {
  id: UUID;
  account: UUID;
  account_code: string;
  account_name: string;
  description?: string | null;
  debit: number;
  credit: number;
  contact?: UUID | null;
  project?: UUID | null;
}

export interface JournalEntryLineRequest {
  account: UUID;
  description?: string;
  debit?: number;
  credit?: number;
  contact?: UUID;
  project?: UUID;
}

export interface JournalEntry {
  id: UUID;
  entry_number: string;
  date: DateString;
  reference?: string | null;
  description?: string | null;
  status: JournalStatus;
  lines: JournalEntryLine[];
  total_debit: number;
  total_credit: number;
  is_balanced: boolean;
  created_by?: UUID | null;
  approved_by?: UUID | null;
  posted_at?: DateTimeString | null;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export interface JournalEntryCreateRequest {
  date: DateString;
  reference?: string;
  description?: string;
  lines: JournalEntryLineRequest[];
}

export interface Contact {
  id: UUID;
  contact_type: ContactType;
  name: string;
  email?: string | null;
  phone?: string | null;
  company_name?: string | null;
  tax_id?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  default_account?: UUID | null;
  payment_terms?: number | null;
  credit_limit?: number | null;
  notes?: string | null;
  is_active: boolean;
  total_receivable: number;
  total_payable: number;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export interface ContactCreateRequest {
  contact_type: ContactType;
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  tax_id?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  default_account?: UUID;
  payment_terms?: number;
  credit_limit?: number;
  notes?: string;
  is_active?: boolean;
}

export interface InvoiceLine {
  id: UUID;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate?: UUID | null;
  tax_rate_name?: string | null;
  tax_amount: number;
  line_total: number;
  account?: UUID | null;
  account_code?: string | null;
  account_name?: string | null;
  project?: UUID | null;
}

export interface InvoiceLineRequest {
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  tax_rate?: UUID;
  account?: UUID;
  project?: UUID;
}

export interface Invoice {
  id: UUID;
  invoice_number: string;
  invoice_type: 'sales' | 'purchase';
  contact: UUID;
  contact_name: string;
  contact_email?: string | null;
  issue_date: DateString;
  due_date: DateString;
  reference?: string | null;
  status: InvoiceStatus;
  currency: string;
  exchange_rate: number;
  lines: InvoiceLine[];
  subtotal: number;
  tax_total: number;
  discount_total: number;
  total: number;
  amount_paid: number;
  amount_due: number;
  notes?: string | null;
  terms?: string | null;
  created_by?: UUID | null;
  approved_by?: UUID | null;
  sent_at?: DateTimeString | null;
  paid_at?: DateTimeString | null;
  void_reason?: string | null;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export interface InvoiceCreateRequest {
  invoice_type: 'sales' | 'purchase';
  contact: UUID;
  issue_date: DateString;
  due_date: DateString;
  reference?: string;
  currency?: string;
  exchange_rate?: number;
  lines: InvoiceLineRequest[];
  notes?: string;
  terms?: string;
}

export interface Expense {
  id: UUID;
  expense_number: string;
  date: DateString;
  description: string;
  category?: string | null;
  contact?: UUID | null;
  contact_name?: string | null;
  account: UUID;
  account_code: string;
  account_name: string;
  amount: number;
  currency: string;
  exchange_rate: number;
  tax_rate?: UUID | null;
  tax_amount: number;
  total_amount: number;
  status: ExpenseStatus;
  payment_method?: PaymentMethod | null;
  reference?: string | null;
  receipt_url?: string | null;
  notes?: string | null;
  project?: UUID | null;
  created_by?: UUID | null;
  approved_by?: UUID | null;
  approved_at?: DateTimeString | null;
  paid_at?: DateTimeString | null;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export interface ExpenseCreateRequest {
  date: DateString;
  description: string;
  category?: string;
  contact?: UUID;
  account: UUID;
  amount: number;
  currency?: string;
  exchange_rate?: number;
  tax_rate?: UUID;
  payment_method?: PaymentMethod;
  reference?: string;
  notes?: string;
  project?: UUID;
}

export interface Payment {
  id: UUID;
  payment_number: string;
  payment_type: 'received' | 'made';
  contact: UUID;
  contact_name: string;
  date: DateString;
  amount: number;
  currency: string;
  exchange_rate: number;
  bank_account: UUID;
  bank_account_name: string;
  payment_method: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
  invoices: UUID[];
  is_reconciled: boolean;
  reconciled_at?: DateTimeString | null;
  created_by?: UUID | null;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export interface PaymentCreateRequest {
  payment_type: 'received' | 'made';
  contact: UUID;
  date: DateString;
  amount: number;
  currency?: string;
  exchange_rate?: number;
  bank_account: UUID;
  payment_method: PaymentMethod;
  reference?: string;
  notes?: string;
  invoices?: UUID[];
}

export interface Currency {
  id: UUID;
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  is_base: boolean;
  is_active: boolean;
  exchange_rate: number;
}

export interface TaxRate {
  id: UUID;
  name: string;
  rate: number;
  tax_type: 'sales' | 'purchase' | 'both';
  is_compound: boolean;
  is_active: boolean;
  description?: string | null;
}

export interface FiscalYear {
  id: UUID;
  name: string;
  start_date: DateString;
  end_date: DateString;
  is_closed: boolean;
  closed_at?: DateTimeString | null;
  closed_by?: UUID | null;
}

export interface AccountingPeriod {
  id: UUID;
  fiscal_year: UUID;
  fiscal_year_name: string;
  period_number: number;
  name: string;
  start_date: DateString;
  end_date: DateString;
  is_closed: boolean;
  is_adjustment: boolean;
}

// =================================================================
// HRMS Types / 人資類型
// =================================================================

export type EmploymentStatus = 'active' | 'probation' | 'notice' | 'terminated' | 'resigned' | 'retired';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern' | 'freelance';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'early_leave' | 'half_day' | 'remote';

export interface Department {
  id: UUID;
  name: string;
  code: string;
  description?: string | null;
  parent?: UUID | null;
  manager?: UUID | null;
  manager_name?: string | null;
  is_active: boolean;
  employee_count: number;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export interface Position {
  id: UUID;
  title: string;
  code: string;
  department: UUID;
  department_name: string;
  description?: string | null;
  min_salary?: number | null;
  max_salary?: number | null;
  is_active: boolean;
  employee_count: number;
}

export interface Employee {
  id: UUID;
  employee_id: string;
  user?: UUID | null;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string | null;
  mobile?: string | null;
  personal_email?: string | null;
  date_of_birth?: DateString | null;
  gender?: 'male' | 'female' | 'other' | null;
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed' | null;
  nationality?: string | null;
  national_id?: string | null;
  passport_number?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  department: UUID;
  department_name: string;
  position: UUID;
  position_title: string;
  manager?: UUID | null;
  manager_name?: string | null;
  hire_date: DateString;
  probation_end_date?: DateString | null;
  termination_date?: DateString | null;
  employment_type: EmploymentType;
  employment_status: EmploymentStatus;
  work_location?: string | null;
  salary: number;
  currency: string;
  salary_frequency: 'hourly' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_routing_number?: string | null;
  avatar_url?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relationship?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export interface EmployeeCreateRequest {
  employee_id?: string;
  user?: UUID;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  mobile?: string;
  personal_email?: string;
  date_of_birth?: DateString;
  gender?: 'male' | 'female' | 'other';
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  nationality?: string;
  national_id?: string;
  department: UUID;
  position: UUID;
  manager?: UUID;
  hire_date: DateString;
  probation_end_date?: DateString;
  employment_type: EmploymentType;
  employment_status?: EmploymentStatus;
  work_location?: string;
  salary: number;
  currency?: string;
  salary_frequency?: 'hourly' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
}

export interface LeaveType {
  id: UUID;
  name: string;
  code: string;
  description?: string | null;
  days_per_year: number;
  is_paid: boolean;
  requires_approval: boolean;
  is_active: boolean;
}

export interface LeaveRequest {
  id: UUID;
  employee: UUID;
  employee_name: string;
  leave_type: UUID;
  leave_type_name: string;
  start_date: DateString;
  end_date: DateString;
  days_requested: number;
  reason?: string | null;
  status: LeaveStatus;
  approved_by?: UUID | null;
  approved_by_name?: string | null;
  approved_at?: DateTimeString | null;
  rejection_reason?: string | null;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export interface LeaveRequestCreateRequest {
  leave_type: UUID;
  start_date: DateString;
  end_date: DateString;
  reason?: string;
}

export interface LeaveBalance {
  id: UUID;
  employee: UUID;
  leave_type: UUID;
  leave_type_name: string;
  year: number;
  entitled_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
  carried_over: number;
}

export interface Attendance {
  id: UUID;
  employee: UUID;
  employee_name: string;
  date: DateString;
  check_in?: DateTimeString | null;
  check_out?: DateTimeString | null;
  worked_hours: number;
  overtime_hours: number;
  status: AttendanceStatus;
  notes?: string | null;
  location?: string | null;
  ip_address?: string | null;
}

export interface Payroll {
  id: UUID;
  employee: UUID;
  employee_name: string;
  period_start: DateString;
  period_end: DateString;
  pay_date: DateString;
  basic_salary: number;
  allowances: number;
  deductions: number;
  tax: number;
  net_salary: number;
  currency: string;
  status: 'draft' | 'pending' | 'approved' | 'paid';
  payment_method?: PaymentMethod | null;
  payment_reference?: string | null;
  notes?: string | null;
}

// =================================================================
// Project Types / 專案類型
// =================================================================

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';

export interface Project {
  id: UUID;
  name: string;
  code: string;
  description?: string | null;
  client?: UUID | null;
  client_name?: string | null;
  manager: UUID;
  manager_name: string;
  status: ProjectStatus;
  priority: TaskPriority;
  start_date?: DateString | null;
  end_date?: DateString | null;
  deadline?: DateString | null;
  budget?: number | null;
  currency: string;
  actual_cost: number;
  progress_percent: number;
  is_billable: boolean;
  hourly_rate?: number | null;
  team_members: UUID[];
  tags: string[];
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export interface ProjectCreateRequest {
  name: string;
  code?: string;
  description?: string;
  client?: UUID;
  manager: UUID;
  status?: ProjectStatus;
  priority?: TaskPriority;
  start_date?: DateString;
  end_date?: DateString;
  deadline?: DateString;
  budget?: number;
  is_billable?: boolean;
  hourly_rate?: number;
  team_members?: UUID[];
  tags?: string[];
}

export interface Task {
  id: UUID;
  project: UUID;
  project_name: string;
  title: string;
  description?: string | null;
  assigned_to?: UUID | null;
  assigned_to_name?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  start_date?: DateString | null;
  due_date?: DateString | null;
  estimated_hours?: number | null;
  actual_hours: number;
  progress_percent: number;
  parent?: UUID | null;
  subtasks: UUID[];
  dependencies: UUID[];
  tags: string[];
  attachments: string[];
  created_by: UUID;
  created_by_name: string;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export interface TaskCreateRequest {
  project: UUID;
  title: string;
  description?: string;
  assigned_to?: UUID;
  status?: TaskStatus;
  priority?: TaskPriority;
  start_date?: DateString;
  due_date?: DateString;
  estimated_hours?: number;
  parent?: UUID;
  dependencies?: UUID[];
  tags?: string[];
}

export interface TimeEntry {
  id: UUID;
  task: UUID;
  task_title: string;
  project: UUID;
  project_name: string;
  employee: UUID;
  employee_name: string;
  date: DateString;
  hours: number;
  description?: string | null;
  is_billable: boolean;
  is_invoiced: boolean;
  invoice?: UUID | null;
  hourly_rate?: number | null;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export interface TimeEntryCreateRequest {
  task: UUID;
  date: DateString;
  hours: number;
  description?: string;
  is_billable?: boolean;
}

// =================================================================
// Analytics Types / 分析類型
// =================================================================

export interface DashboardMetrics {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  accounts_receivable: number;
  accounts_payable: number;
  cash_balance: number;
  pending_invoices: number;
  overdue_invoices: number;
  active_projects: number;
  active_employees: number;
  pending_tasks: number;
}

export interface RevenueByPeriod {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ExpenseByCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface CashFlowData {
  date: DateString;
  inflow: number;
  outflow: number;
  balance: number;
}

// =================================================================
// AI/RAG Types / AI/RAG 類型
// =================================================================

export interface AIRequestLog {
  id: UUID;
  session_id: string;
  query: string;
  response?: string | null;
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  latency_ms: number;
  estimated_cost: number;
  is_cached: boolean;
  cache_hit: boolean;
  status: 'success' | 'error' | 'timeout';
  error_message?: string | null;
  metadata: Record<string, unknown>;
  created_at: DateTimeString;
}

export interface VectorSearchLog {
  id: UUID;
  query: string;
  collection: string;
  results_count: number;
  avg_similarity: number;
  min_similarity: number;
  max_similarity: number;
  latency_ms: number;
  threshold_used: number;
  metadata: Record<string, unknown>;
  created_at: DateTimeString;
}

export interface KnowledgeGapLog {
  id: UUID;
  query: string;
  reason: string;
  frequency: number;
  is_resolved: boolean;
  resolution_notes?: string | null;
  resolved_at?: DateTimeString | null;
  resolved_by?: UUID | null;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export interface AIUsageSummary {
  id: UUID;
  date: DateString;
  provider: string;
  model: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_tokens: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  avg_latency_ms: number;
  cache_hit_rate: number;
}

export interface RAGDashboard {
  summary: {
    total_requests: number;
    total_tokens: number;
    total_cost: number;
    avg_latency_ms: number;
    success_rate: number;
    cache_hit_rate: number;
    knowledge_gaps_count: number;
  };
  token_usage_trend: Array<{
    date: DateString;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  }>;
  latency_distribution: Array<{
    bucket: string;
    count: number;
  }>;
  usage_by_model: Array<{
    model: string;
    provider: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
  top_failing_queries: Array<{
    query: string;
    error_count: number;
    last_error: string;
  }>;
  knowledge_gaps: KnowledgeGapLog[];
}
