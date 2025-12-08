/**
 * Typed API Client - Main Entry Point
 * 類型化 API 客戶端 - 主入口
 * 
 * This module provides a fully typed API client with:
 * - Full TypeScript type safety with generics
 * - Automatic token refresh on 401
 * - Rate limiting with queue
 * - Exponential backoff retry
 * - Request/response interceptors
 * - React Query hooks for easy integration
 * 
 * Usage:
 * ```typescript
 * // Direct API calls
 * import { typedApi, authApi, usersApi, accountingApi } from '@/lib/api';
 * 
 * await authApi.login({ email: 'user@example.com', password: 'password' });
 * const user = await authApi.getCurrentUser();
 * const accounts = await accountingApi.accounts.tree();
 * 
 * // React Query hooks
 * import { useCurrentUser, useAccountTree, useMyTasks } from '@/lib/api';
 * 
 * function MyComponent() {
 *   const { data: user, isLoading } = useCurrentUser();
 *   const { data: accounts } = useAccountTree();
 *   const { data: tasks } = useMyTasks({ status: 'in_progress' });
 *   // ...
 * }
 * 
 * // Generic CRUD
 * const customResource = typedApi.crud<MyType>('/my-resource');
 * const items = await customResource.list();
 * ```
 */

// Core client
export { TypedApiClient, typedApi, default as api } from './client';
export type { ApiClientConfig, RequestConfig } from './client';

// Types
export * from './types';

// API modules
export { authApi } from './auth';
export { usersApi } from './users';
export { tenantsApi } from './tenants';
export { accountingApi, accountsApi, journalEntriesApi, contactsApi, invoicesApi, expensesApi, paymentsApi, currenciesApi, taxRatesApi, fiscalYearsApi, accountingPeriodsApi } from './accounting';
export { hrmsApi, departmentsApi, positionsApi, employeesApi, leaveTypesApi, leaveRequestsApi, leaveBalancesApi, attendanceApi, payrollApi } from './hrms';
export { projectsModule, projectsApi, tasksApi, timeEntriesApi } from './projects';

// React Query hooks
export {
  // Query keys
  queryKeys,
  
  // Auth hooks
  useCurrentUser,
  useLogin,
  useLogout,
  
  // User hooks
  useUserSettings,
  useUpdateUserSettings,
  useUpdateUserProfile,
  
  // Tenant hooks
  useTenants,
  useCurrentTenant,
  useTenant,
  useCreateTenant,
  useSwitchTenant,
  
  // Accounting hooks
  useAccountTree,
  useAccounts,
  useAccount,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useInvoices,
  useInvoice,
  useCreateInvoice,
  useUpdateInvoice,
  useSendInvoice,
  useExpenses,
  useExpense,
  useCreateExpense,
  useApproveExpense,
  useRejectExpense,
  
  // HRMS hooks
  useEmployees,
  useEmployee,
  useMyEmployee,
  useCreateEmployee,
  useUpdateEmployee,
  useDepartments,
  useDepartmentTree,
  useMyLeaveRequests,
  usePendingLeaveApprovals,
  useCreateLeaveRequest,
  useApproveLeaveRequest,
  useTodayAttendance,
  useCheckIn,
  useCheckOut,
  
  // Project hooks
  useProjects,
  useMyProjects,
  useProject,
  useCreateProject,
  useTasks,
  useMyTasks,
  useTask,
  useCreateTask,
  useUpdateTaskStatus,
  useMyTimeEntries,
  useRunningTimer,
  useStartTimer,
  useStopTimer,
} from './hooks';

// Re-export typed client as default
export { typedApi as default } from './client';
