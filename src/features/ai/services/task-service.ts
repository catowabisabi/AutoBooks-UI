/**
 * Async Task Service
 * ===================
 * API calls for async task management and progress tracking.
 */

import { api } from "@/lib/api";

// Types
export type TaskStatus = "PENDING" | "STARTED" | "PROGRESS" | "SUCCESS" | "FAILURE" | "REVOKED";

export type TaskType =
  | "OCR_PROCESS"
  | "DOCUMENT_ANALYSIS"
  | "REPORT_GENERATION"
  | "BULK_IMPORT"
  | "AI_ANALYSIS"
  | "DATA_EXPORT"
  | "EMAIL_PROCESSING";

export interface AsyncTask {
  id: string;
  celery_task_id: string;
  task_type: TaskType;
  name: string;
  description?: string;
  status: TaskStatus;
  progress: number;
  progress_message?: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds: number;
  result?: Record<string, unknown>;
  error_message?: string;
  is_complete: boolean;
  is_running: boolean;
  created_at: string;
}

export interface CreateTaskRequest {
  task_type: TaskType;
  name: string;
  input_data: Record<string, unknown>;
}

export interface TaskStats {
  total: number;
  running: number;
  by_status: Array<{ status: TaskStatus; count: number }>;
  by_type: Array<{ task_type: TaskType; count: number }>;
  recent_24h: number;
}

// API Functions

/**
 * Get list of user's tasks
 */
export async function getTasks(params?: {
  status?: TaskStatus;
  task_type?: TaskType;
  running?: boolean;
  page?: number;
  page_size?: number;
}): Promise<{ count: number; results: AsyncTask[] }> {
  const response = await api.get("/api/ai/tasks/", {
    params: {
      ...params,
      running: params?.running ? "true" : undefined,
    },
  });
  return response.data;
}

/**
 * Get a specific task by ID
 */
export async function getTask(taskId: string): Promise<AsyncTask> {
  const response = await api.get<AsyncTask>(`/api/ai/tasks/${taskId}/`);
  return response.data;
}

/**
 * Get task progress by Celery task ID
 */
export async function getTaskProgress(celeryTaskId: string): Promise<AsyncTask> {
  const response = await api.get<AsyncTask>(`/api/ai/task-status/${celeryTaskId}/`);
  return response.data;
}

/**
 * Cancel a running task
 */
export async function cancelTask(taskId: string): Promise<{ message: string; task: AsyncTask }> {
  const response = await api.post(`/api/ai/tasks/${taskId}/cancel/`);
  return response.data;
}

/**
 * Get task statistics
 */
export async function getTaskStats(): Promise<TaskStats> {
  const response = await api.get<TaskStats>("/api/ai/tasks/stats/");
  return response.data;
}

/**
 * Create and start a new async task
 */
export async function createTask(data: CreateTaskRequest): Promise<AsyncTask> {
  const response = await api.post<AsyncTask>("/api/ai/tasks/create_task/", data);
  return response.data;
}

// Helper functions

/**
 * Get status color for UI
 */
export function getTaskStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    PENDING: "bg-gray-100 text-gray-800",
    STARTED: "bg-blue-100 text-blue-800",
    PROGRESS: "bg-blue-100 text-blue-800",
    SUCCESS: "bg-green-100 text-green-800",
    FAILURE: "bg-red-100 text-red-800",
    REVOKED: "bg-yellow-100 text-yellow-800",
  };
  return colors[status] || colors.PENDING;
}

/**
 * Get progress bar color
 */
export function getProgressBarColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    PENDING: "bg-gray-400",
    STARTED: "bg-blue-500",
    PROGRESS: "bg-blue-500",
    SUCCESS: "bg-green-500",
    FAILURE: "bg-red-500",
    REVOKED: "bg-yellow-500",
  };
  return colors[status] || colors.PENDING;
}

/**
 * Format duration in seconds to readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Get task type display name
 */
export function getTaskTypeDisplayName(type: TaskType): string {
  const names: Record<TaskType, string> = {
    OCR_PROCESS: "OCR Processing",
    DOCUMENT_ANALYSIS: "Document Analysis",
    REPORT_GENERATION: "Report Generation",
    BULK_IMPORT: "Bulk Import",
    AI_ANALYSIS: "AI Analysis",
    DATA_EXPORT: "Data Export",
    EMAIL_PROCESSING: "Email Processing",
  };
  return names[type] || type;
}
