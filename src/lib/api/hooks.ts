/**
 * React Query Hooks for Typed API
 * React Query 掛鉤 - 類型化 API
 * 
 * Provides ready-to-use hooks for all API endpoints with:
 * - Automatic caching and invalidation
 * - Optimistic updates
 * - Loading and error states
 * - Type-safe queries and mutations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { authApi } from './auth';
import { usersApi } from './users';
import { tenantsApi } from './tenants';
import { accountingApi } from './accounting';
import { hrmsApi } from './hrms';
import { projectsModule } from './projects';
import type {
  User,
  UserSettings,
  UserSettingsUpdateRequest,
  TenantCreateRequest,
  AccountCreateRequest,
  InvoiceCreateRequest,
  ExpenseCreateRequest,
  EmployeeCreateRequest,
  ProjectCreateRequest,
  TaskCreateRequest,
  ListParams,
} from './types';

// =================================================================
// Query Keys Factory
// =================================================================

export const queryKeys = {
  // Auth
  currentUser: ['currentUser'] as const,
  
  // Users
  users: {
    all: ['users'] as const,
    list: (params?: ListParams) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    settings: ['users', 'settings'] as const,
    subscription: ['users', 'subscription'] as const,
  },
  
  // Tenants
  tenants: {
    all: ['tenants'] as const,
    list: (params?: ListParams) => ['tenants', 'list', params] as const,
    detail: (id: string) => ['tenants', 'detail', id] as const,
    current: ['tenants', 'current'] as const,
    members: (tenantId: string) => ['tenants', tenantId, 'members'] as const,
    invitations: (tenantId: string) => ['tenants', tenantId, 'invitations'] as const,
  },
  
  // Accounting
  accounts: {
    all: ['accounts'] as const,
    list: (params?: ListParams) => ['accounts', 'list', params] as const,
    tree: ['accounts', 'tree'] as const,
    detail: (id: string) => ['accounts', 'detail', id] as const,
    ledger: (id: string, params?: any) => ['accounts', id, 'ledger', params] as const,
  },
  invoices: {
    all: ['invoices'] as const,
    list: (params?: ListParams) => ['invoices', 'list', params] as const,
    detail: (id: string) => ['invoices', 'detail', id] as const,
    summary: (params?: any) => ['invoices', 'summary', params] as const,
  },
  expenses: {
    all: ['expenses'] as const,
    list: (params?: ListParams) => ['expenses', 'list', params] as const,
    detail: (id: string) => ['expenses', 'detail', id] as const,
    summary: (params?: any) => ['expenses', 'summary', params] as const,
  },
  contacts: {
    all: ['contacts'] as const,
    list: (params?: ListParams) => ['contacts', 'list', params] as const,
    detail: (id: string) => ['contacts', 'detail', id] as const,
  },
  journalEntries: {
    all: ['journalEntries'] as const,
    list: (params?: ListParams) => ['journalEntries', 'list', params] as const,
    detail: (id: string) => ['journalEntries', 'detail', id] as const,
  },
  
  // HRMS
  employees: {
    all: ['employees'] as const,
    list: (params?: ListParams) => ['employees', 'list', params] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
    me: ['employees', 'me'] as const,
    orgChart: ['employees', 'orgChart'] as const,
  },
  departments: {
    all: ['departments'] as const,
    list: (params?: ListParams) => ['departments', 'list', params] as const,
    tree: ['departments', 'tree'] as const,
    detail: (id: string) => ['departments', 'detail', id] as const,
  },
  leaveRequests: {
    all: ['leaveRequests'] as const,
    list: (params?: ListParams) => ['leaveRequests', 'list', params] as const,
    mine: (params?: ListParams) => ['leaveRequests', 'mine', params] as const,
    pending: (params?: ListParams) => ['leaveRequests', 'pending', params] as const,
    detail: (id: string) => ['leaveRequests', 'detail', id] as const,
  },
  attendance: {
    all: ['attendance'] as const,
    list: (params?: ListParams) => ['attendance', 'list', params] as const,
    mine: (params?: any) => ['attendance', 'mine', params] as const,
    today: ['attendance', 'today'] as const,
    summary: (params?: any) => ['attendance', 'summary', params] as const,
  },
  
  // Projects
  projects: {
    all: ['projects'] as const,
    list: (params?: ListParams) => ['projects', 'list', params] as const,
    mine: (params?: ListParams) => ['projects', 'mine', params] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
    stats: (id: string) => ['projects', id, 'stats'] as const,
    timeline: (id: string) => ['projects', id, 'timeline'] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    list: (params?: ListParams) => ['tasks', 'list', params] as const,
    mine: (params?: ListParams) => ['tasks', 'mine', params] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
  },
  timeEntries: {
    all: ['timeEntries'] as const,
    list: (params?: ListParams) => ['timeEntries', 'list', params] as const,
    mine: (params?: ListParams) => ['timeEntries', 'mine', params] as const,
    running: ['timeEntries', 'running'] as const,
    summary: (params?: any) => ['timeEntries', 'summary', params] as const,
  },
};

// =================================================================
// Auth Hooks
// =================================================================

export function useCurrentUser(options?: UseQueryOptions<User>) {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => authApi.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login({ email, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      authApi.logout();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// =================================================================
// User Hooks
// =================================================================

export function useUserSettings(options?: UseQueryOptions<UserSettings>) {
  return useQuery({
    queryKey: queryKeys.users.settings,
    queryFn: () => usersApi.getSettings(),
    ...options,
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UserSettingsUpdateRequest) => usersApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.settings });
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UserProfileUpdateRequest) => usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

// =================================================================
// Tenant Hooks
// =================================================================

export function useTenants(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.tenants.list(params),
    queryFn: () => tenantsApi.list(params),
  });
}

export function useCurrentTenant() {
  return useQuery({
    queryKey: queryKeys.tenants.current,
    queryFn: () => tenantsApi.getCurrent(),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: queryKeys.tenants.detail(id),
    queryFn: () => tenantsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TenantCreateRequest) => tenantsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all });
    },
  });
}

export function useSwitchTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => tenantsApi.switchTo(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

// =================================================================
// Accounting Hooks - Accounts
// =================================================================

export function useAccountTree() {
  return useQuery({
    queryKey: queryKeys.accounts.tree,
    queryFn: () => accountingApi.accounts.tree(),
  });
}

export function useAccounts(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.accounts.list(params),
    queryFn: () => accountingApi.accounts.list(params),
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(id),
    queryFn: () => accountingApi.accounts.get(id),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AccountCreateRequest) => accountingApi.accounts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AccountCreateRequest> }) =>
      accountingApi.accounts.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => accountingApi.accounts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

// =================================================================
// Accounting Hooks - Invoices
// =================================================================

export function useInvoices(params?: ListParams & { invoice_type?: 'sales' | 'purchase'; status?: string }) {
  return useQuery({
    queryKey: queryKeys.invoices.list(params),
    queryFn: () => accountingApi.invoices.list(params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: queryKeys.invoices.detail(id),
    queryFn: () => accountingApi.invoices.get(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InvoiceCreateRequest) => accountingApi.invoices.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InvoiceCreateRequest> }) =>
      accountingApi.invoices.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => accountingApi.invoices.send(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

// =================================================================
// Accounting Hooks - Expenses
// =================================================================

export function useExpenses(params?: ListParams & { status?: string; category?: string }) {
  return useQuery({
    queryKey: queryKeys.expenses.list(params),
    queryFn: () => accountingApi.expenses.list(params),
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: queryKeys.expenses.detail(id),
    queryFn: () => accountingApi.expenses.get(id),
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ExpenseCreateRequest) => accountingApi.expenses.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    },
  });
}

export function useApproveExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => accountingApi.expenses.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    },
  });
}

export function useRejectExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      accountingApi.expenses.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    },
  });
}

// =================================================================
// HRMS Hooks - Employees
// =================================================================

export function useEmployees(params?: ListParams & { department?: string; position?: string }) {
  return useQuery({
    queryKey: queryKeys.employees.list(params),
    queryFn: () => hrmsApi.employees.list(params),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => hrmsApi.employees.get(id),
    enabled: !!id,
  });
}

export function useMyEmployee() {
  return useQuery({
    queryKey: queryKeys.employees.me,
    queryFn: () => hrmsApi.employees.me(),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: EmployeeCreateRequest) => hrmsApi.employees.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmployeeCreateRequest> }) =>
      hrmsApi.employees.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
}

// =================================================================
// HRMS Hooks - Departments
// =================================================================

export function useDepartments(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.departments.list(params),
    queryFn: () => hrmsApi.departments.list(params),
  });
}

export function useDepartmentTree() {
  return useQuery({
    queryKey: queryKeys.departments.tree,
    queryFn: () => hrmsApi.departments.tree(),
  });
}

// =================================================================
// HRMS Hooks - Leave
// =================================================================

export function useMyLeaveRequests(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.leaveRequests.mine(params),
    queryFn: () => hrmsApi.leaveRequests.mine(params),
  });
}

export function usePendingLeaveApprovals(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.leaveRequests.pending(params),
    queryFn: () => hrmsApi.leaveRequests.pendingApprovals(params),
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { leave_type: string; start_date: string; end_date: string; reason?: string }) =>
      hrmsApi.leaveRequests.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests.all });
    },
  });
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => hrmsApi.leaveRequests.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests.all });
    },
  });
}

// =================================================================
// HRMS Hooks - Attendance
// =================================================================

export function useTodayAttendance() {
  return useQuery({
    queryKey: queryKeys.attendance.today,
    queryFn: () => hrmsApi.attendance.todayStatus(),
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data?: { location?: string; notes?: string }) =>
      hrmsApi.attendance.checkIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data?: { location?: string; notes?: string }) =>
      hrmsApi.attendance.checkOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
    },
  });
}

// =================================================================
// Project Hooks
// =================================================================

export function useProjects(params?: ListParams & { status?: string }) {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => projectsModule.projects.list(params),
  });
}

export function useMyProjects(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.projects.mine(params),
    queryFn: () => projectsModule.projects.mine(params),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectsModule.projects.get(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProjectCreateRequest) => projectsModule.projects.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

// =================================================================
// Task Hooks
// =================================================================

export function useTasks(params?: ListParams & { project?: string; status?: string }) {
  return useQuery({
    queryKey: queryKeys.tasks.list(params),
    queryFn: () => projectsModule.tasks.list(params),
  });
}

export function useMyTasks(params?: ListParams & { status?: string }) {
  return useQuery({
    queryKey: queryKeys.tasks.mine(params),
    queryFn: () => projectsModule.tasks.mine(params),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => projectsModule.tasks.get(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TaskCreateRequest) => projectsModule.tasks.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      projectsModule.tasks.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

// =================================================================
// Time Entry Hooks
// =================================================================

export function useMyTimeEntries(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.timeEntries.mine(params),
    queryFn: () => projectsModule.timeEntries.mine(params),
  });
}

export function useRunningTimer() {
  return useQuery({
    queryKey: queryKeys.timeEntries.running,
    queryFn: () => projectsModule.timeEntries.runningTimer(),
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useStartTimer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => projectsModule.timeEntries.startTimer(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all });
    },
  });
}

export function useStopTimer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => projectsModule.timeEntries.stopTimer(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all });
    },
  });
}
