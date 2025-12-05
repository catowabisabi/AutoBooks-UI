/**
 * Business API Services
 * ====================
 * API calls for Audits, Tax Returns, Billable Hours, Revenue, and BMI IPO/PR
 */

import { api } from '@/lib/api';

const BASE_URL = '/business';

// Types
export interface Company {
  id: string;
  name: string;
  registration_number?: string;
  tax_id?: string;
  address?: string;
  industry?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditProject {
  id: string;
  company: string;
  company_name?: string;
  fiscal_year: string;
  audit_type: string;
  progress: number;
  status: 'NOT_STARTED' | 'PLANNING' | 'FIELDWORK' | 'REVIEW' | 'REPORTING' | 'COMPLETED' | 'ON_HOLD';
  start_date?: string;
  deadline?: string;
  completion_date?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  budget_hours?: number;
  actual_hours?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaxReturnCase {
  id: string;
  company: string;
  company_name?: string;
  tax_year: string;
  tax_type: string;
  progress: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'AMENDED';
  deadline?: string;
  submitted_date?: string;
  handler?: string;
  handler_name?: string;
  tax_amount?: number;
  documents_received: boolean;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillableHour {
  id: string;
  employee: string;
  employee_name?: string;
  company?: string;
  company_name?: string;
  project_reference?: string;
  role: 'CLERK' | 'ACCOUNTANT' | 'MANAGER' | 'DIRECTOR' | 'PARTNER';
  base_hourly_rate: number;
  hourly_rate_multiplier: number;
  effective_rate?: number;
  date: string;
  actual_hours: number;
  total_cost?: number;
  description?: string;
  is_billable: boolean;
  is_invoiced: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Revenue {
  id: string;
  company: string;
  company_name?: string;
  invoice_number?: string;
  description?: string;
  total_amount: number;
  received_amount: number;
  pending_amount?: number;
  is_fully_paid?: boolean;
  status: 'PENDING' | 'PARTIAL' | 'RECEIVED' | 'OVERDUE' | 'WRITTEN_OFF';
  invoice_date?: string;
  due_date?: string;
  received_date?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BMIIPOPRRecord {
  id: string;
  project_name: string;
  company: string;
  company_name?: string;
  stage: string;
  status: 'ACTIVE' | 'ON_TRACK' | 'DELAYED' | 'AT_RISK' | 'COMPLETED' | 'CANCELLED';
  project_type: string;
  estimated_value?: number;
  total_cost?: number;
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  progress: number;
  lead_manager?: string;
  lead_manager_name?: string;
  documents?: any[];
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardOverview {
  total_audits: number;
  audits_in_progress: number;
  total_tax_returns: number;
  tax_returns_pending: number;
  total_revenue: string;
  pending_revenue: string;
  total_billable_hours: string;
  bmi_projects_active: number;
  recent_audits: AuditProject[];
  recent_tax_returns: TaxReturnCase[];
  recent_revenues: Revenue[];
}

// API Response types
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Companies API
export const companiesApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<Company>>(`${BASE_URL}/companies/`, { params }),
  
  get: (id: string) => 
    api.get<Company>(`${BASE_URL}/companies/${id}/`),
  
  create: (data: Partial<Company>) => 
    api.post<Company>(`${BASE_URL}/companies/`, data),
  
  update: (id: string, data: Partial<Company>) => 
    api.patch<Company>(`${BASE_URL}/companies/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/companies/${id}/`),
  
  stats: () => 
    api.get(`${BASE_URL}/companies/stats/`),
};

// Audits API
export const auditsApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<AuditProject>>(`${BASE_URL}/audits/`, { params }),
  
  get: (id: string) => 
    api.get<AuditProject>(`${BASE_URL}/audits/${id}/`),
  
  create: (data: Partial<AuditProject>) => 
    api.post<AuditProject>(`${BASE_URL}/audits/`, data),
  
  update: (id: string, data: Partial<AuditProject>) => 
    api.patch<AuditProject>(`${BASE_URL}/audits/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/audits/${id}/`),
  
  summary: () => 
    api.get(`${BASE_URL}/audits/summary/`),
};

// Tax Returns API
export const taxReturnsApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<TaxReturnCase>>(`${BASE_URL}/tax-returns/`, { params }),
  
  get: (id: string) => 
    api.get<TaxReturnCase>(`${BASE_URL}/tax-returns/${id}/`),
  
  create: (data: Partial<TaxReturnCase>) => 
    api.post<TaxReturnCase>(`${BASE_URL}/tax-returns/`, data),
  
  update: (id: string, data: Partial<TaxReturnCase>) => 
    api.patch<TaxReturnCase>(`${BASE_URL}/tax-returns/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/tax-returns/${id}/`),
  
  summary: () => 
    api.get(`${BASE_URL}/tax-returns/summary/`),
};

// Billable Hours API
export const billableHoursApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<BillableHour>>(`${BASE_URL}/billable-hours/`, { params }),
  
  get: (id: string) => 
    api.get<BillableHour>(`${BASE_URL}/billable-hours/${id}/`),
  
  create: (data: Partial<BillableHour>) => 
    api.post<BillableHour>(`${BASE_URL}/billable-hours/`, data),
  
  update: (id: string, data: Partial<BillableHour>) => 
    api.patch<BillableHour>(`${BASE_URL}/billable-hours/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/billable-hours/${id}/`),
  
  summary: () => 
    api.get(`${BASE_URL}/billable-hours/summary/`),
  
  byEmployee: () => 
    api.get(`${BASE_URL}/billable-hours/by_employee/`),
};

// Revenue API
export const revenueApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<Revenue>>(`${BASE_URL}/revenues/`, { params }),
  
  get: (id: string) => 
    api.get<Revenue>(`${BASE_URL}/revenues/${id}/`),
  
  create: (data: Partial<Revenue>) => 
    api.post<Revenue>(`${BASE_URL}/revenues/`, data),
  
  update: (id: string, data: Partial<Revenue>) => 
    api.patch<Revenue>(`${BASE_URL}/revenues/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/revenues/${id}/`),
  
  summary: () => 
    api.get(`${BASE_URL}/revenues/summary/`),
  
  recordPayment: (id: string, amount: number) => 
    api.post(`${BASE_URL}/revenues/${id}/record_payment/`, { amount }),
};

// BMI IPO/PR API
export const bmiProjectsApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<BMIIPOPRRecord>>(`${BASE_URL}/bmi-projects/`, { params }),
  
  get: (id: string) => 
    api.get<BMIIPOPRRecord>(`${BASE_URL}/bmi-projects/${id}/`),
  
  create: (data: Partial<BMIIPOPRRecord>) => 
    api.post<BMIIPOPRRecord>(`${BASE_URL}/bmi-projects/`, data),
  
  update: (id: string, data: Partial<BMIIPOPRRecord>) => 
    api.patch<BMIIPOPRRecord>(`${BASE_URL}/bmi-projects/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/bmi-projects/${id}/`),
  
  summary: () => 
    api.get(`${BASE_URL}/bmi-projects/summary/`),
};

// Dashboard API
export const businessDashboardApi = {
  overview: () => 
    api.get<DashboardOverview>(`${BASE_URL}/dashboard/`),
};
