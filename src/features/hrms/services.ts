/**
 * HRMS API Services
 * =================
 * API calls for Employees, Departments, Leaves, and Payroll
 */

import { api } from '@/lib/api';

const BASE_URL = '/hrms';

// Types
export interface Department {
  id: string;
  name: string;
  description?: string;
  code?: string;
  parent?: string;
  manager?: string;
  manager_name?: string;
  budget?: number;
  sub_departments_count?: number;
  employees_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Designation {
  id: string;
  name: string;
  description?: string;
  level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  user: string;
  user_email?: string;
  user_full_name?: string;
  employee_id: string;
  department?: string;
  department_name?: string;
  designation?: string;
  designation_name?: string;
  manager?: string;
  manager_name?: string;
  employment_status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'RESIGNED' | 'TERMINATED';
  employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'PROBATION';
  hire_date?: string;
  probation_end_date?: string;
  termination_date?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  id_number?: string;
  phone?: string;
  personal_email?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  base_salary?: number;
  payment_frequency?: string;
  bank_name?: string;
  bank_account?: string;
  annual_leave_balance?: number;
  sick_leave_balance?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaveApplication {
  id: string;
  employee: string;
  employee_name?: string;
  employee_id_code?: string;
  leave_type: 'SICK' | 'CASUAL' | 'EARNED' | 'MATERNITY' | 'PATERNITY' | 'UNPAID' | 'COMPASSIONATE' | 'STUDY';
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalance {
  id: string;
  employee: string;
  employee_name?: string;
  year: number;
  leave_type: string;
  entitled_days: number;
  used_days: number;
  carried_over: number;
  remaining_days?: number;
  created_at: string;
  updated_at: string;
}

export interface PayrollPeriod {
  id: string;
  name: string;
  year: number;
  month: number;
  start_date: string;
  end_date: string;
  payment_date?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'CANCELLED';
  payroll_count?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payroll {
  id: string;
  employee: string;
  employee_name?: string;
  employee_id_code?: string;
  period: string;
  period_name?: string;
  status: string;
  basic_salary: number;
  overtime_pay: number;
  allowances: number;
  bonus: number;
  commission: number;
  other_earnings: number;
  tax_deduction: number;
  mpf_employee: number;
  mpf_employer: number;
  insurance_deduction: number;
  loan_deduction: number;
  other_deductions: number;
  working_days: number;
  absent_days: number;
  overtime_hours: number;
  gross_pay?: number;
  total_deductions?: number;
  net_pay?: number;
  payment_date?: string;
  payment_reference?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: 'CREATED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  owner: string;
  owner_name?: string;
  budget?: number;
  progress: number;
  tasks_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project: string;
  project_name?: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigned_to?: string;
  assigned_to_name?: string;
  assigned_by?: string;
  assigned_by_name?: string;
  estimated_hours?: number;
  actual_hours?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HRMSDashboard {
  employees: {
    total: number;
    active: number;
    on_leave: number;
  };
  leaves: {
    pending: number;
    approved_this_month: number;
  };
  departments: number;
  recent_leaves: LeaveApplication[];
}

// API Response types
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Departments API
export const departmentsApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<Department>>(`${BASE_URL}/departments/`, { params }),
  
  get: (id: string) => 
    api.get<Department>(`${BASE_URL}/departments/${id}/`),
  
  create: (data: Partial<Department>) => 
    api.post<Department>(`${BASE_URL}/departments/`, data),
  
  update: (id: string, data: Partial<Department>) => 
    api.patch<Department>(`${BASE_URL}/departments/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/departments/${id}/`),
  
  tree: () => 
    api.get(`${BASE_URL}/departments/tree/`),
};

// Designations API
export const designationsApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<Designation>>(`${BASE_URL}/designations/`, { params }),
  
  get: (id: string) => 
    api.get<Designation>(`${BASE_URL}/designations/${id}/`),
  
  create: (data: Partial<Designation>) => 
    api.post<Designation>(`${BASE_URL}/designations/`, data),
  
  update: (id: string, data: Partial<Designation>) => 
    api.patch<Designation>(`${BASE_URL}/designations/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/designations/${id}/`),
};

// Employees API
export const employeesApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<Employee>>(`${BASE_URL}/employees/`, { params }),
  
  get: (id: string) => 
    api.get<Employee>(`${BASE_URL}/employees/${id}/`),
  
  create: (data: Partial<Employee>) => 
    api.post<Employee>(`${BASE_URL}/employees/`, data),
  
  update: (id: string, data: Partial<Employee>) => 
    api.patch<Employee>(`${BASE_URL}/employees/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/employees/${id}/`),
  
  summary: () => 
    api.get(`${BASE_URL}/employees/summary/`),
  
  leaveBalances: (id: string) => 
    api.get<LeaveBalance[]>(`${BASE_URL}/employees/${id}/leave_balances/`),
  
  payrollHistory: (id: string) => 
    api.get<Payroll[]>(`${BASE_URL}/employees/${id}/payroll_history/`),
};

// Leave Applications API
export const leaveApplicationsApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<LeaveApplication>>(`${BASE_URL}/leave-applications/`, { params }),
  
  get: (id: string) => 
    api.get<LeaveApplication>(`${BASE_URL}/leave-applications/${id}/`),
  
  create: (data: Partial<LeaveApplication>) => 
    api.post<LeaveApplication>(`${BASE_URL}/leave-applications/`, data),
  
  update: (id: string, data: Partial<LeaveApplication>) => 
    api.patch<LeaveApplication>(`${BASE_URL}/leave-applications/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/leave-applications/${id}/`),
  
  approve: (id: string) => 
    api.post<LeaveApplication>(`${BASE_URL}/leave-applications/${id}/approve/`),
  
  reject: (id: string, reason: string) => 
    api.post<LeaveApplication>(`${BASE_URL}/leave-applications/${id}/reject/`, { reason }),
  
  leaveTypes: () => 
    api.get(`${BASE_URL}/leave-applications/leave_types/`),
  
  leaveStatuses: () => 
    api.get(`${BASE_URL}/leave-applications/leave_statuses/`),
  
  summary: () => 
    api.get(`${BASE_URL}/leave-applications/summary/`),
};

// Leave Balances API
export const leaveBalancesApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<LeaveBalance>>(`${BASE_URL}/leave-balances/`, { params }),
  
  get: (id: string) => 
    api.get<LeaveBalance>(`${BASE_URL}/leave-balances/${id}/`),
  
  create: (data: Partial<LeaveBalance>) => 
    api.post<LeaveBalance>(`${BASE_URL}/leave-balances/`, data),
  
  update: (id: string, data: Partial<LeaveBalance>) => 
    api.patch<LeaveBalance>(`${BASE_URL}/leave-balances/${id}/`, data),
};

// Payroll Periods API
export const payrollPeriodsApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<PayrollPeriod>>(`${BASE_URL}/payroll-periods/`, { params }),
  
  get: (id: string) => 
    api.get<PayrollPeriod>(`${BASE_URL}/payroll-periods/${id}/`),
  
  create: (data: Partial<PayrollPeriod>) => 
    api.post<PayrollPeriod>(`${BASE_URL}/payroll-periods/`, data),
  
  update: (id: string, data: Partial<PayrollPeriod>) => 
    api.patch<PayrollPeriod>(`${BASE_URL}/payroll-periods/${id}/`, data),
  
  current: () => 
    api.get<PayrollPeriod>(`${BASE_URL}/payroll-periods/current/`),
};

// Payroll API
export const payrollsApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<Payroll>>(`${BASE_URL}/payrolls/`, { params }),
  
  get: (id: string) => 
    api.get<Payroll>(`${BASE_URL}/payrolls/${id}/`),
  
  create: (data: Partial<Payroll>) => 
    api.post<Payroll>(`${BASE_URL}/payrolls/`, data),
  
  update: (id: string, data: Partial<Payroll>) => 
    api.patch<Payroll>(`${BASE_URL}/payrolls/${id}/`, data),
  
  approve: (id: string) => 
    api.post<Payroll>(`${BASE_URL}/payrolls/${id}/approve/`),
  
  summary: (periodId?: string) => 
    api.get(`${BASE_URL}/payrolls/summary/`, { params: { period: periodId } }),
};

// Projects API
export const projectsApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<Project>>(`${BASE_URL}/projects/`, { params }),
  
  get: (id: string) => 
    api.get<Project>(`${BASE_URL}/projects/${id}/`),
  
  create: (data: Partial<Project>) => 
    api.post<Project>(`${BASE_URL}/projects/`, data),
  
  update: (id: string, data: Partial<Project>) => 
    api.patch<Project>(`${BASE_URL}/projects/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/projects/${id}/`),
  
  updateProgress: (id: string, progress: number) => 
    api.post<Project>(`${BASE_URL}/projects/${id}/update_progress/`, { progress }),
  
  projectStatuses: () => 
    api.get(`${BASE_URL}/projects/project_statuses/`),
  
  summary: () => 
    api.get(`${BASE_URL}/projects/summary/`),
};

// Tasks API
export const tasksApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<Task>>(`${BASE_URL}/tasks/`, { params }),
  
  get: (id: string) => 
    api.get<Task>(`${BASE_URL}/tasks/${id}/`),
  
  create: (data: Partial<Task>) => 
    api.post<Task>(`${BASE_URL}/tasks/`, data),
  
  update: (id: string, data: Partial<Task>) => 
    api.patch<Task>(`${BASE_URL}/tasks/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/tasks/${id}/`),
  
  updateStatus: (id: string, status: string) => 
    api.post<Task>(`${BASE_URL}/tasks/${id}/update_status/`, { status }),
  
  taskStatuses: () => 
    api.get(`${BASE_URL}/tasks/task_statuses/`),
  
  taskPriorities: () => 
    api.get(`${BASE_URL}/tasks/task_priorities/`),
  
  myTasks: () => 
    api.get<Task[]>(`${BASE_URL}/tasks/my_tasks/`),
};

// Dashboard API
export const hrmsDashboardApi = {
  overview: () => 
    api.get<HRMSDashboard>(`${BASE_URL}/dashboard/`),
};
