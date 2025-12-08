/**
 * HRMS API - 人資管理 API
 * Human Resource Management System endpoints with full type safety
 */

import { typedApi } from './client';
import type {
  Department,
  Position,
  Employee,
  EmployeeCreateRequest,
  LeaveType,
  LeaveRequest,
  LeaveRequestCreateRequest,
  LeaveBalance,
  Attendance,
  Payroll,
  PaginatedResponse,
  ListParams,
  UUID,
  DateString,
} from './types';

const BASE_PATH = '/hrms';

// ---------------------------------------------------------------
// Departments / 部門
// ---------------------------------------------------------------

export const departmentsApi = {
  /**
   * List departments
   * 列出部門
   */
  list: async (params?: ListParams & {
    is_active?: boolean;
    parent?: UUID;
  }): Promise<PaginatedResponse<Department>> => {
    return typedApi.get<PaginatedResponse<Department>>(`${BASE_PATH}/departments/`, params);
  },

  /**
   * Get department tree
   * 獲取部門樹狀結構
   */
  tree: async (): Promise<Department[]> => {
    return typedApi.get<Department[]>(`${BASE_PATH}/departments/tree/`);
  },

  /**
   * Get department by ID
   * 通過 ID 獲取部門
   */
  get: async (id: UUID): Promise<Department> => {
    return typedApi.get<Department>(`${BASE_PATH}/departments/${id}/`);
  },

  /**
   * Create a new department
   * 創建新部門
   */
  create: async (data: Partial<Department>): Promise<Department> => {
    return typedApi.post<Department>(`${BASE_PATH}/departments/`, data);
  },

  /**
   * Update department
   * 更新部門
   */
  update: async (id: UUID, data: Partial<Department>): Promise<Department> => {
    return typedApi.patch<Department>(`${BASE_PATH}/departments/${id}/`, data);
  },

  /**
   * Delete department
   * 刪除部門
   */
  delete: async (id: UUID): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/departments/${id}/`);
  },
};

// ---------------------------------------------------------------
// Positions / 職位
// ---------------------------------------------------------------

export const positionsApi = {
  /**
   * List positions
   * 列出職位
   */
  list: async (params?: ListParams & {
    department?: UUID;
    is_active?: boolean;
  }): Promise<PaginatedResponse<Position>> => {
    return typedApi.get<PaginatedResponse<Position>>(`${BASE_PATH}/positions/`, params);
  },

  /**
   * Get position by ID
   * 通過 ID 獲取職位
   */
  get: async (id: UUID): Promise<Position> => {
    return typedApi.get<Position>(`${BASE_PATH}/positions/${id}/`);
  },

  /**
   * Create a new position
   * 創建新職位
   */
  create: async (data: Partial<Position>): Promise<Position> => {
    return typedApi.post<Position>(`${BASE_PATH}/positions/`, data);
  },

  /**
   * Update position
   * 更新職位
   */
  update: async (id: UUID, data: Partial<Position>): Promise<Position> => {
    return typedApi.patch<Position>(`${BASE_PATH}/positions/${id}/`, data);
  },

  /**
   * Delete position
   * 刪除職位
   */
  delete: async (id: UUID): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/positions/${id}/`);
  },
};

// ---------------------------------------------------------------
// Employees / 員工
// ---------------------------------------------------------------

export const employeesApi = {
  /**
   * List employees
   * 列出員工
   */
  list: async (params?: ListParams & {
    department?: UUID;
    position?: UUID;
    employment_status?: string;
    employment_type?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<Employee>> => {
    return typedApi.get<PaginatedResponse<Employee>>(`${BASE_PATH}/employees/`, params);
  },

  /**
   * Get employee by ID
   * 通過 ID 獲取員工
   */
  get: async (id: UUID): Promise<Employee> => {
    return typedApi.get<Employee>(`${BASE_PATH}/employees/${id}/`);
  },

  /**
   * Get employee by employee ID (code)
   * 通過員工編號獲取員工
   */
  getByEmployeeId: async (employeeId: string): Promise<Employee> => {
    return typedApi.get<Employee>(`${BASE_PATH}/employees/by-id/${employeeId}/`);
  },

  /**
   * Get current user's employee profile
   * 獲取當前用戶的員工資料
   */
  me: async (): Promise<Employee> => {
    return typedApi.get<Employee>(`${BASE_PATH}/employees/me/`);
  },

  /**
   * Create a new employee
   * 創建新員工
   */
  create: async (data: EmployeeCreateRequest): Promise<Employee> => {
    return typedApi.post<Employee>(`${BASE_PATH}/employees/`, data);
  },

  /**
   * Update employee
   * 更新員工
   */
  update: async (id: UUID, data: Partial<EmployeeCreateRequest>): Promise<Employee> => {
    return typedApi.patch<Employee>(`${BASE_PATH}/employees/${id}/`, data);
  },

  /**
   * Delete employee
   * 刪除員工
   */
  delete: async (id: UUID): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/employees/${id}/`);
  },

  /**
   * Terminate employee
   * 終止員工
   */
  terminate: async (id: UUID, data: {
    termination_date: DateString;
    reason?: string;
  }): Promise<Employee> => {
    return typedApi.post<Employee>(`${BASE_PATH}/employees/${id}/terminate/`, data);
  },

  /**
   * Upload avatar
   * 上傳頭像
   */
  uploadAvatar: async (id: UUID, file: File): Promise<Employee> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return typedApi.upload<Employee>(`${BASE_PATH}/employees/${id}/avatar/`, formData);
  },

  /**
   * Get employee org chart
   * 獲取員工組織圖
   */
  orgChart: async (): Promise<Employee[]> => {
    return typedApi.get<Employee[]>(`${BASE_PATH}/employees/org-chart/`);
  },

  /**
   * Get direct reports
   * 獲取直接下屬
   */
  directReports: async (id: UUID): Promise<Employee[]> => {
    return typedApi.get<Employee[]>(`${BASE_PATH}/employees/${id}/direct-reports/`);
  },
};

// ---------------------------------------------------------------
// Leave Types / 假別
// ---------------------------------------------------------------

export const leaveTypesApi = {
  /**
   * List leave types
   * 列出假別
   */
  list: async (params?: { is_active?: boolean }): Promise<LeaveType[]> => {
    return typedApi.get<LeaveType[]>(`${BASE_PATH}/leave-types/`, params);
  },

  /**
   * Get leave type by ID
   * 通過 ID 獲取假別
   */
  get: async (id: UUID): Promise<LeaveType> => {
    return typedApi.get<LeaveType>(`${BASE_PATH}/leave-types/${id}/`);
  },

  /**
   * Create a new leave type
   * 創建新假別
   */
  create: async (data: Partial<LeaveType>): Promise<LeaveType> => {
    return typedApi.post<LeaveType>(`${BASE_PATH}/leave-types/`, data);
  },

  /**
   * Update leave type
   * 更新假別
   */
  update: async (id: UUID, data: Partial<LeaveType>): Promise<LeaveType> => {
    return typedApi.patch<LeaveType>(`${BASE_PATH}/leave-types/${id}/`, data);
  },

  /**
   * Delete leave type
   * 刪除假別
   */
  delete: async (id: UUID): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/leave-types/${id}/`);
  },
};

// ---------------------------------------------------------------
// Leave Requests / 請假申請
// ---------------------------------------------------------------

export const leaveRequestsApi = {
  /**
   * List leave requests
   * 列出請假申請
   */
  list: async (params?: ListParams & {
    employee?: UUID;
    leave_type?: UUID;
    status?: string;
    start_date?: DateString;
    end_date?: DateString;
  }): Promise<PaginatedResponse<LeaveRequest>> => {
    return typedApi.get<PaginatedResponse<LeaveRequest>>(`${BASE_PATH}/leave-requests/`, params);
  },

  /**
   * Get my leave requests
   * 獲取我的請假申請
   */
  mine: async (params?: ListParams): Promise<PaginatedResponse<LeaveRequest>> => {
    return typedApi.get<PaginatedResponse<LeaveRequest>>(`${BASE_PATH}/leave-requests/mine/`, params);
  },

  /**
   * Get pending approvals (for managers)
   * 獲取待審核的申請（主管用）
   */
  pendingApprovals: async (params?: ListParams): Promise<PaginatedResponse<LeaveRequest>> => {
    return typedApi.get<PaginatedResponse<LeaveRequest>>(`${BASE_PATH}/leave-requests/pending-approvals/`, params);
  },

  /**
   * Get leave request by ID
   * 通過 ID 獲取請假申請
   */
  get: async (id: UUID): Promise<LeaveRequest> => {
    return typedApi.get<LeaveRequest>(`${BASE_PATH}/leave-requests/${id}/`);
  },

  /**
   * Create a new leave request
   * 創建新請假申請
   */
  create: async (data: LeaveRequestCreateRequest): Promise<LeaveRequest> => {
    return typedApi.post<LeaveRequest>(`${BASE_PATH}/leave-requests/`, data);
  },

  /**
   * Update leave request (pending only)
   * 更新請假申請（僅限待審核）
   */
  update: async (id: UUID, data: Partial<LeaveRequestCreateRequest>): Promise<LeaveRequest> => {
    return typedApi.patch<LeaveRequest>(`${BASE_PATH}/leave-requests/${id}/`, data);
  },

  /**
   * Cancel leave request
   * 取消請假申請
   */
  cancel: async (id: UUID): Promise<LeaveRequest> => {
    return typedApi.post<LeaveRequest>(`${BASE_PATH}/leave-requests/${id}/cancel/`);
  },

  /**
   * Approve leave request
   * 核准請假申請
   */
  approve: async (id: UUID): Promise<LeaveRequest> => {
    return typedApi.post<LeaveRequest>(`${BASE_PATH}/leave-requests/${id}/approve/`);
  },

  /**
   * Reject leave request
   * 拒絕請假申請
   */
  reject: async (id: UUID, reason: string): Promise<LeaveRequest> => {
    return typedApi.post<LeaveRequest>(`${BASE_PATH}/leave-requests/${id}/reject/`, { reason });
  },
};

// ---------------------------------------------------------------
// Leave Balances / 假期餘額
// ---------------------------------------------------------------

export const leaveBalancesApi = {
  /**
   * Get leave balances for an employee
   * 獲取員工的假期餘額
   */
  forEmployee: async (employeeId: UUID, year?: number): Promise<LeaveBalance[]> => {
    return typedApi.get<LeaveBalance[]>(`${BASE_PATH}/leave-balances/`, {
      employee: employeeId,
      year,
    });
  },

  /**
   * Get my leave balances
   * 獲取我的假期餘額
   */
  mine: async (year?: number): Promise<LeaveBalance[]> => {
    return typedApi.get<LeaveBalance[]>(`${BASE_PATH}/leave-balances/mine/`, { year });
  },

  /**
   * Adjust leave balance (admin only)
   * 調整假期餘額（僅限管理員）
   */
  adjust: async (id: UUID, adjustment: number, reason: string): Promise<LeaveBalance> => {
    return typedApi.post<LeaveBalance>(`${BASE_PATH}/leave-balances/${id}/adjust/`, {
      adjustment,
      reason,
    });
  },
};

// ---------------------------------------------------------------
// Attendance / 出勤
// ---------------------------------------------------------------

export const attendanceApi = {
  /**
   * List attendance records
   * 列出出勤記錄
   */
  list: async (params?: ListParams & {
    employee?: UUID;
    date?: DateString;
    date_from?: DateString;
    date_to?: DateString;
    status?: string;
  }): Promise<PaginatedResponse<Attendance>> => {
    return typedApi.get<PaginatedResponse<Attendance>>(`${BASE_PATH}/attendance/`, params);
  },

  /**
   * Get my attendance records
   * 獲取我的出勤記錄
   */
  mine: async (params?: {
    date_from?: DateString;
    date_to?: DateString;
  }): Promise<Attendance[]> => {
    return typedApi.get<Attendance[]>(`${BASE_PATH}/attendance/mine/`, params);
  },

  /**
   * Check in
   * 打卡上班
   */
  checkIn: async (data?: {
    location?: string;
    notes?: string;
  }): Promise<Attendance> => {
    return typedApi.post<Attendance>(`${BASE_PATH}/attendance/check-in/`, data);
  },

  /**
   * Check out
   * 打卡下班
   */
  checkOut: async (data?: {
    location?: string;
    notes?: string;
  }): Promise<Attendance> => {
    return typedApi.post<Attendance>(`${BASE_PATH}/attendance/check-out/`, data);
  },

  /**
   * Get today's status
   * 獲取今日狀態
   */
  todayStatus: async (): Promise<Attendance | null> => {
    return typedApi.get<Attendance | null>(`${BASE_PATH}/attendance/today/`);
  },

  /**
   * Get attendance summary
   * 獲取出勤摘要
   */
  summary: async (params: {
    employee?: UUID;
    month?: number;
    year?: number;
  }): Promise<{
    total_days: number;
    present_days: number;
    absent_days: number;
    late_days: number;
    early_leave_days: number;
    total_hours: number;
    overtime_hours: number;
  }> => {
    return typedApi.get(`${BASE_PATH}/attendance/summary/`, params);
  },

  /**
   * Manually create/update attendance (admin only)
   * 手動創建/更新出勤記錄（僅限管理員）
   */
  manualEntry: async (data: {
    employee: UUID;
    date: DateString;
    check_in?: string;
    check_out?: string;
    status?: string;
    notes?: string;
  }): Promise<Attendance> => {
    return typedApi.post<Attendance>(`${BASE_PATH}/attendance/manual/`, data);
  },
};

// ---------------------------------------------------------------
// Payroll / 薪資
// ---------------------------------------------------------------

export const payrollApi = {
  /**
   * List payroll records
   * 列出薪資記錄
   */
  list: async (params?: ListParams & {
    employee?: UUID;
    status?: string;
    period_start?: DateString;
    period_end?: DateString;
  }): Promise<PaginatedResponse<Payroll>> => {
    return typedApi.get<PaginatedResponse<Payroll>>(`${BASE_PATH}/payroll/`, params);
  },

  /**
   * Get my payroll records
   * 獲取我的薪資記錄
   */
  mine: async (params?: ListParams): Promise<PaginatedResponse<Payroll>> => {
    return typedApi.get<PaginatedResponse<Payroll>>(`${BASE_PATH}/payroll/mine/`, params);
  },

  /**
   * Get payroll by ID
   * 通過 ID 獲取薪資記錄
   */
  get: async (id: UUID): Promise<Payroll> => {
    return typedApi.get<Payroll>(`${BASE_PATH}/payroll/${id}/`);
  },

  /**
   * Create payroll (admin only)
   * 創建薪資記錄（僅限管理員）
   */
  create: async (data: Partial<Payroll>): Promise<Payroll> => {
    return typedApi.post<Payroll>(`${BASE_PATH}/payroll/`, data);
  },

  /**
   * Update payroll (admin only)
   * 更新薪資記錄（僅限管理員）
   */
  update: async (id: UUID, data: Partial<Payroll>): Promise<Payroll> => {
    return typedApi.patch<Payroll>(`${BASE_PATH}/payroll/${id}/`, data);
  },

  /**
   * Approve payroll
   * 核准薪資
   */
  approve: async (id: UUID): Promise<Payroll> => {
    return typedApi.post<Payroll>(`${BASE_PATH}/payroll/${id}/approve/`);
  },

  /**
   * Mark as paid
   * 標記為已支付
   */
  markPaid: async (id: UUID, data: {
    payment_method: string;
    payment_reference?: string;
  }): Promise<Payroll> => {
    return typedApi.post<Payroll>(`${BASE_PATH}/payroll/${id}/mark-paid/`, data);
  },

  /**
   * Generate payslip PDF
   * 生成薪資單 PDF
   */
  getPdf: async (id: UUID): Promise<Blob> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1${BASE_PATH}/payroll/${id}/pdf/`,
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
   * Run payroll for period
   * 執行期間薪資計算
   */
  runPayroll: async (data: {
    period_start: DateString;
    period_end: DateString;
    pay_date: DateString;
    department?: UUID;
  }): Promise<Payroll[]> => {
    return typedApi.post<Payroll[]>(`${BASE_PATH}/payroll/run/`, data);
  },
};

// ---------------------------------------------------------------
// Export all HRMS APIs
// ---------------------------------------------------------------

export const hrmsApi = {
  departments: departmentsApi,
  positions: positionsApi,
  employees: employeesApi,
  leaveTypes: leaveTypesApi,
  leaveRequests: leaveRequestsApi,
  leaveBalances: leaveBalancesApi,
  attendance: attendanceApi,
  payroll: payrollApi,
};

export default hrmsApi;
