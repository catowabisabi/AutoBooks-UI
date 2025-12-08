/**
 * Projects API - 專案管理 API
 * Project management endpoints with full type safety
 */

import { typedApi } from './client';
import type {
  Project,
  ProjectCreateRequest,
  Task,
  TaskCreateRequest,
  TimeEntry,
  TimeEntryCreateRequest,
  PaginatedResponse,
  ListParams,
  UUID,
  DateString,
} from './types';

const BASE_PATH = '/projects';

// ---------------------------------------------------------------
// Projects / 專案
// ---------------------------------------------------------------

export const projectsApi = {
  /**
   * List projects
   * 列出專案
   */
  list: async (params?: ListParams & {
    status?: string;
    manager?: UUID;
    client?: UUID;
    is_billable?: boolean;
  }): Promise<PaginatedResponse<Project>> => {
    return typedApi.get<PaginatedResponse<Project>>(`${BASE_PATH}/`, params);
  },

  /**
   * Get my projects
   * 獲取我的專案
   */
  mine: async (params?: ListParams): Promise<PaginatedResponse<Project>> => {
    return typedApi.get<PaginatedResponse<Project>>(`${BASE_PATH}/mine/`, params);
  },

  /**
   * Get project by ID
   * 通過 ID 獲取專案
   */
  get: async (id: UUID): Promise<Project> => {
    return typedApi.get<Project>(`${BASE_PATH}/${id}/`);
  },

  /**
   * Create a new project
   * 創建新專案
   */
  create: async (data: ProjectCreateRequest): Promise<Project> => {
    return typedApi.post<Project>(`${BASE_PATH}/`, data);
  },

  /**
   * Update project
   * 更新專案
   */
  update: async (id: UUID, data: Partial<ProjectCreateRequest>): Promise<Project> => {
    return typedApi.patch<Project>(`${BASE_PATH}/${id}/`, data);
  },

  /**
   * Delete project
   * 刪除專案
   */
  delete: async (id: UUID): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/${id}/`);
  },

  /**
   * Get project statistics
   * 獲取專案統計
   */
  stats: async (id: UUID): Promise<{
    total_tasks: number;
    completed_tasks: number;
    progress_percent: number;
    total_hours: number;
    billable_hours: number;
    total_cost: number;
    budget_remaining: number;
  }> => {
    return typedApi.get(`${BASE_PATH}/${id}/stats/`);
  },

  /**
   * Get project team members
   * 獲取專案團隊成員
   */
  teamMembers: async (id: UUID): Promise<Array<{
    id: UUID;
    name: string;
    role: string;
    hours_logged: number;
  }>> => {
    return typedApi.get(`${BASE_PATH}/${id}/team/`);
  },

  /**
   * Add team member
   * 新增團隊成員
   */
  addTeamMember: async (id: UUID, userId: UUID): Promise<void> => {
    return typedApi.post(`${BASE_PATH}/${id}/team/`, { user_id: userId });
  },

  /**
   * Remove team member
   * 移除團隊成員
   */
  removeTeamMember: async (id: UUID, userId: UUID): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/${id}/team/${userId}/`);
  },

  /**
   * Get project timeline/gantt data
   * 獲取專案時間軸/甘特圖數據
   */
  timeline: async (id: UUID): Promise<Array<{
    task_id: UUID;
    title: string;
    start_date: DateString;
    end_date: DateString;
    progress: number;
    dependencies: UUID[];
  }>> => {
    return typedApi.get(`${BASE_PATH}/${id}/timeline/`);
  },
};

// ---------------------------------------------------------------
// Tasks / 任務
// ---------------------------------------------------------------

export const tasksApi = {
  /**
   * List tasks
   * 列出任務
   */
  list: async (params?: ListParams & {
    project?: UUID;
    assigned_to?: UUID;
    status?: string;
    priority?: string;
    due_date_from?: DateString;
    due_date_to?: DateString;
  }): Promise<PaginatedResponse<Task>> => {
    return typedApi.get<PaginatedResponse<Task>>(`${BASE_PATH}/tasks/`, params);
  },

  /**
   * Get my tasks
   * 獲取我的任務
   */
  mine: async (params?: ListParams & {
    status?: string;
    priority?: string;
  }): Promise<PaginatedResponse<Task>> => {
    return typedApi.get<PaginatedResponse<Task>>(`${BASE_PATH}/tasks/mine/`, params);
  },

  /**
   * Get task by ID
   * 通過 ID 獲取任務
   */
  get: async (id: UUID): Promise<Task> => {
    return typedApi.get<Task>(`${BASE_PATH}/tasks/${id}/`);
  },

  /**
   * Create a new task
   * 創建新任務
   */
  create: async (data: TaskCreateRequest): Promise<Task> => {
    return typedApi.post<Task>(`${BASE_PATH}/tasks/`, data);
  },

  /**
   * Update task
   * 更新任務
   */
  update: async (id: UUID, data: Partial<TaskCreateRequest>): Promise<Task> => {
    return typedApi.patch<Task>(`${BASE_PATH}/tasks/${id}/`, data);
  },

  /**
   * Delete task
   * 刪除任務
   */
  delete: async (id: UUID): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/tasks/${id}/`);
  },

  /**
   * Update task status
   * 更新任務狀態
   */
  updateStatus: async (id: UUID, status: string): Promise<Task> => {
    return typedApi.patch<Task>(`${BASE_PATH}/tasks/${id}/`, { status });
  },

  /**
   * Assign task
   * 分配任務
   */
  assign: async (id: UUID, userId: UUID): Promise<Task> => {
    return typedApi.post<Task>(`${BASE_PATH}/tasks/${id}/assign/`, { user_id: userId });
  },

  /**
   * Add subtask
   * 新增子任務
   */
  addSubtask: async (parentId: UUID, data: TaskCreateRequest): Promise<Task> => {
    return typedApi.post<Task>(`${BASE_PATH}/tasks/`, { ...data, parent: parentId });
  },

  /**
   * Get task subtasks
   * 獲取任務子任務
   */
  subtasks: async (id: UUID): Promise<Task[]> => {
    return typedApi.get<Task[]>(`${BASE_PATH}/tasks/${id}/subtasks/`);
  },

  /**
   * Add task dependency
   * 新增任務依賴
   */
  addDependency: async (id: UUID, dependencyId: UUID): Promise<Task> => {
    return typedApi.post<Task>(`${BASE_PATH}/tasks/${id}/dependencies/`, {
      dependency_id: dependencyId,
    });
  },

  /**
   * Remove task dependency
   * 移除任務依賴
   */
  removeDependency: async (id: UUID, dependencyId: UUID): Promise<Task> => {
    return typedApi.delete(`${BASE_PATH}/tasks/${id}/dependencies/${dependencyId}/`);
  },

  /**
   * Get task comments
   * 獲取任務評論
   */
  comments: async (id: UUID): Promise<Array<{
    id: UUID;
    user_id: UUID;
    user_name: string;
    content: string;
    created_at: string;
  }>> => {
    return typedApi.get(`${BASE_PATH}/tasks/${id}/comments/`);
  },

  /**
   * Add comment
   * 新增評論
   */
  addComment: async (id: UUID, content: string): Promise<{
    id: UUID;
    content: string;
    created_at: string;
  }> => {
    return typedApi.post(`${BASE_PATH}/tasks/${id}/comments/`, { content });
  },

  /**
   * Upload attachment
   * 上傳附件
   */
  uploadAttachment: async (id: UUID, file: File): Promise<{
    id: UUID;
    filename: string;
    url: string;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    return typedApi.upload(`${BASE_PATH}/tasks/${id}/attachments/`, formData);
  },
};

// ---------------------------------------------------------------
// Time Entries / 工時記錄
// ---------------------------------------------------------------

export const timeEntriesApi = {
  /**
   * List time entries
   * 列出工時記錄
   */
  list: async (params?: ListParams & {
    project?: UUID;
    task?: UUID;
    employee?: UUID;
    date_from?: DateString;
    date_to?: DateString;
    is_billable?: boolean;
    is_invoiced?: boolean;
  }): Promise<PaginatedResponse<TimeEntry>> => {
    return typedApi.get<PaginatedResponse<TimeEntry>>(`${BASE_PATH}/time-entries/`, params);
  },

  /**
   * Get my time entries
   * 獲取我的工時記錄
   */
  mine: async (params?: ListParams & {
    date_from?: DateString;
    date_to?: DateString;
  }): Promise<PaginatedResponse<TimeEntry>> => {
    return typedApi.get<PaginatedResponse<TimeEntry>>(`${BASE_PATH}/time-entries/mine/`, params);
  },

  /**
   * Get time entry by ID
   * 通過 ID 獲取工時記錄
   */
  get: async (id: UUID): Promise<TimeEntry> => {
    return typedApi.get<TimeEntry>(`${BASE_PATH}/time-entries/${id}/`);
  },

  /**
   * Create a new time entry
   * 創建新工時記錄
   */
  create: async (data: TimeEntryCreateRequest): Promise<TimeEntry> => {
    return typedApi.post<TimeEntry>(`${BASE_PATH}/time-entries/`, data);
  },

  /**
   * Update time entry
   * 更新工時記錄
   */
  update: async (id: UUID, data: Partial<TimeEntryCreateRequest>): Promise<TimeEntry> => {
    return typedApi.patch<TimeEntry>(`${BASE_PATH}/time-entries/${id}/`, data);
  },

  /**
   * Delete time entry
   * 刪除工時記錄
   */
  delete: async (id: UUID): Promise<void> => {
    return typedApi.delete(`${BASE_PATH}/time-entries/${id}/`);
  },

  /**
   * Start timer
   * 開始計時
   */
  startTimer: async (taskId: UUID): Promise<TimeEntry> => {
    return typedApi.post<TimeEntry>(`${BASE_PATH}/time-entries/start/`, { task_id: taskId });
  },

  /**
   * Stop timer
   * 停止計時
   */
  stopTimer: async (): Promise<TimeEntry> => {
    return typedApi.post<TimeEntry>(`${BASE_PATH}/time-entries/stop/`);
  },

  /**
   * Get running timer
   * 獲取正在計時的記錄
   */
  runningTimer: async (): Promise<TimeEntry | null> => {
    return typedApi.get<TimeEntry | null>(`${BASE_PATH}/time-entries/running/`);
  },

  /**
   * Get time entry summary
   * 獲取工時摘要
   */
  summary: async (params: {
    project?: UUID;
    employee?: UUID;
    date_from?: DateString;
    date_to?: DateString;
    group_by?: 'project' | 'task' | 'employee' | 'date';
  }): Promise<Array<{
    group: string;
    group_id?: UUID;
    total_hours: number;
    billable_hours: number;
    total_amount: number;
  }>> => {
    return typedApi.get(`${BASE_PATH}/time-entries/summary/`, params);
  },

  /**
   * Mark as invoiced
   * 標記為已開票
   */
  markInvoiced: async (ids: UUID[], invoiceId: UUID): Promise<void> => {
    return typedApi.post(`${BASE_PATH}/time-entries/mark-invoiced/`, {
      ids,
      invoice_id: invoiceId,
    });
  },
};

// ---------------------------------------------------------------
// Export all project APIs
// ---------------------------------------------------------------

export const projectsModule = {
  projects: projectsApi,
  tasks: tasksApi,
  timeEntries: timeEntriesApi,
};

export default projectsModule;
