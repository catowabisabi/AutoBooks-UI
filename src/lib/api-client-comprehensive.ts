/**
 * Wisematic ERP - Comprehensive API Client
 * TypeScript definitions and API functions for all endpoints
 * 
 * Generated: 2025-12-08
 */

import { api } from '@/lib/api';

// =================================================================
// Common Types
// =================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

// =================================================================
// AI Service Types
// =================================================================

export type AIProvider = 'openai' | 'gemini' | 'deepseek' | 'anthropic';

export interface AIModel {
  name: string;
  description: string;
  vision?: boolean;
}

export interface AIProviderStatus {
  name: string;
  display_name: string;
  is_configured: boolean;
  default_model: string;
}

export interface ChatRequest {
  message: string;
  provider?: AIProvider;
  model?: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatWithHistoryRequest {
  messages: ChatMessage[];
  provider?: AIProvider;
  model?: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// =================================================================
// AI Service API
// =================================================================

export const aiServiceApi = {
  // Chat endpoints
  chat: (data: ChatRequest) =>
    api.post<AIResponse>('/api/v1/ai-service/chat/', data),
  
  chatWithHistory: (data: ChatWithHistoryRequest) =>
    api.post<AIResponse>('/api/v1/ai-service/chat-with-history/', data),
  
  analyzeImage: (formData: FormData) =>
    api.post<AIResponse>('/api/v1/ai-service/analyze-image/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // Provider/Model management
  getProviders: () =>
    api.get<{ providers: AIProviderStatus[] }>('/api/v1/ai-service/providers/'),
  
  getModels: (provider: AIProvider = 'openai') =>
    api.get<{ provider: string; models: AIModel[] }>('/api/v1/ai-service/models/', {
      params: { provider }
    }),
  
  setDefault: (provider: AIProvider, model?: string) =>
    api.post<ApiResponse<void>>('/api/v1/ai-service/set-default/', { provider, model }),
  
  testConnection: (provider: AIProvider) =>
    api.post<{ success: boolean; provider: string; model?: string; error?: string }>(
      '/api/v1/ai-service/test-connection/', 
      { provider }
    ),
};

// =================================================================
// Planner Assistant Types
// =================================================================

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PlannerTask {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  created_by?: string;
  status: TaskStatus;
  status_display: string;
  priority: TaskPriority;
  priority_display: string;
  due_date?: string;
  due_time?: string;
  reminder_at?: string;
  completed_at?: string;
  ai_generated: boolean;
  ai_priority_score: number;
  ai_suggested_deadline?: string;
  ai_reasoning?: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  is_recurring: boolean;
  ai_generated: boolean;
  created_at: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  assigned_to?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  due_time?: string;
  tags?: string[];
}

// =================================================================
// Planner Assistant API
// =================================================================

export const plannerApi = {
  // Core endpoints
  start: () => api.get('/api/v1/planner-assistant/start/'),
  getData: () => api.get('/api/v1/planner-assistant/data/'),
  query: (query: string) => 
    api.post<{ response: string; query_type: string }>('/api/v1/planner-assistant/query/', { query }),
  
  // Tasks CRUD
  getTasks: (params?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigned_to?: string;
    due_date?: string;
    overdue?: boolean;
    ai_generated?: boolean;
    search?: string;
    page?: number;
    page_size?: number;
  }) => api.get<PaginatedResponse<PlannerTask>>('/api/v1/planner-assistant/tasks/', { params }),
  
  getTask: (id: string) => 
    api.get<ApiResponse<PlannerTask>>(`/api/v1/planner-assistant/tasks/${id}/`),
  
  createTask: (data: CreateTaskData) => 
    api.post<ApiResponse<PlannerTask>>('/api/v1/planner-assistant/tasks/', data),
  
  updateTask: (id: string, data: Partial<CreateTaskData>) => 
    api.patch<ApiResponse<PlannerTask>>(`/api/v1/planner-assistant/tasks/${id}/`, data),
  
  deleteTask: (id: string) => 
    api.delete(`/api/v1/planner-assistant/tasks/${id}/`),
  
  // Task actions
  completeTask: (id: string) => 
    api.post(`/api/v1/planner-assistant/tasks/${id}/complete/`),
  
  startTask: (id: string) => 
    api.post(`/api/v1/planner-assistant/tasks/${id}/start/`),
  
  blockTask: (id: string) => 
    api.post(`/api/v1/planner-assistant/tasks/${id}/block/`),
  
  // AI features
  aiCreate: (input_text: string, options?: {
    auto_prioritize?: boolean;
    auto_schedule?: boolean;
  }) => api.post<{
    tasks: PlannerTask[];
    summary: string;
    tasks_created: number;
  }>('/api/v1/planner-assistant/tasks/ai_create/', { input_text, ...options }),
  
  aiReprioritize: () => 
    api.post('/api/v1/planner-assistant/tasks/ai_reprioritize/'),
  
  aiSchedule: (options?: { available_hours_per_day?: number }) => 
    api.post('/api/v1/planner-assistant/tasks/ai_schedule/', options),
  
  // Events
  getEvents: (params?: { start_date?: string; end_date?: string }) => 
    api.get<PaginatedResponse<ScheduleEvent>>('/api/v1/planner-assistant/events/', { params }),
  
  createEvent: (data: Partial<ScheduleEvent>) => 
    api.post<ApiResponse<ScheduleEvent>>('/api/v1/planner-assistant/events/', data),
};

// =================================================================
// Document Assistant Types
// =================================================================

export interface DocumentInfo {
  document_id: string;
  filename: string;
  content_type: string;
  page_count?: number;
  extracted_text?: string;
  metadata?: Record<string, any>;
}

export interface DocumentQueryResult {
  type: 'answer' | 'error';
  response?: string;
  query_type?: string;
  message?: string;
}

// =================================================================
// Document Assistant API
// =================================================================

export const documentApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<DocumentInfo>('/api/v1/document-assistant/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  getInfo: (documentId: string) => 
    api.get<DocumentInfo>(`/api/v1/document-assistant/${documentId}/info/`),
  
  query: (documentId: string, query: string) => 
    api.post<DocumentQueryResult>('/api/v1/document-assistant/query/', { 
      document_id: documentId, 
      query 
    }),
  
  process: (file: File, query: string, returnDocumentData: boolean = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('query', query);
    formData.append('return_document_data', String(returnDocumentData));
    return api.post<{
      success: boolean;
      document_id: string;
      query_result: string;
      filename: string;
    }>('/api/v1/document-assistant/process/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Document management (model-based)
  getDocuments: (params?: { search?: string; page?: number }) => 
    api.get('/api/v1/document-assistant/documents/', { params }),
  
  getDocument: (id: string) => 
    api.get(`/api/v1/document-assistant/documents/${id}/`),
  
  deleteDocument: (id: string) => 
    api.delete(`/api/v1/document-assistant/documents/${id}/`),
  
  // Comparisons
  getComparisons: () => 
    api.get('/api/v1/document-assistant/comparisons/'),
  
  compareDocuments: (doc1Id: string, doc2Id: string) => 
    api.post('/api/v1/document-assistant/comparisons/', { 
      document_1: doc1Id, 
      document_2: doc2Id 
    }),
};

// =================================================================
// Finance Assistant Types
// =================================================================

export interface ReceiptAnalysis {
  success: boolean;
  merchantName?: string;
  invoiceNo?: string;
  expenseDate?: string;
  currency?: string;
  claimedAmount?: number;
  city?: string;
  country?: string;
  description?: string;
  status: string;
}

export interface ReportAnalysisRequest {
  report_type: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'trial_balance' | 'general';
  report_data?: Record<string, any>;
  questions?: string[];
  period?: string;
}

export interface ReportAnalysisResponse {
  success: boolean;
  report_type: string;
  period?: string;
  analysis: string;
  model: string;
}

export interface PeriodComparisonRequest {
  report_type: string;
  periods: Array<{ period: string; data: Record<string, any> }>;
}

export interface ForecastRequest {
  historical_data: any[];
  forecast_periods: number;
  metric: string;
}

// =================================================================
// Finance Assistant API
// =================================================================

export const financeApi = {
  analyzeReceipt: (file: File, categories?: string[]) => {
    const formData = new FormData();
    formData.append('file', file);
    if (categories) {
      formData.append('category', JSON.stringify(categories));
    }
    return api.post<ReceiptAnalysis>('/api/v1/finance-assistant/analyze/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  analyzeReport: (data: ReportAnalysisRequest) => 
    api.post<ReportAnalysisResponse>('/api/v1/finance-assistant/analyze-report/', data),
  
  comparePeriods: (data: PeriodComparisonRequest) => 
    api.post<{
      success: boolean;
      analysis: string;
      periods_compared: string[];
    }>('/api/v1/finance-assistant/compare-periods/', data),
  
  forecast: (data: ForecastRequest) => 
    api.post<{
      success: boolean;
      metric: string;
      forecast_periods: number;
      forecast: string;
    }>('/api/v1/finance-assistant/forecast/', data),
};

// =================================================================
// Dashboard & Analytics Types
// =================================================================

export interface Dashboard {
  id: string;
  title: string;
  description?: string;
  is_default: boolean;
  charts: Chart[];
  created_at: string;
  updated_at: string;
}

export interface Chart {
  id: string;
  dashboard?: string;
  title: string;
  type: 'LINE' | 'BAR' | 'PIE' | 'DOUGHNUT' | 'AREA' | 'SCATTER' | 'RADAR';
  config: Record<string, any>;
  data_source?: string;
  position: number;
  width: number;
  height: number;
  created_at: string;
}

export interface KPIMetric {
  id: string;
  name: string;
  description?: string;
  category: string;
  current_value: number;
  previous_value: number;
  target_value?: number;
  unit: string;
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  period: string;
}

// =================================================================
// Dashboard & Analytics API
// =================================================================

export const analyticsApi = {
  // Dashboards
  getDashboards: () => 
    api.get<ApiResponse<Dashboard[]>>('/api/v1/analytics/dashboards/'),
  
  getDashboard: (id: string) => 
    api.get<ApiResponse<Dashboard>>(`/api/v1/analytics/dashboards/${id}/`),
  
  getDefaultDashboard: () => 
    api.get<Dashboard>('/api/v1/analytics/dashboards/default/'),
  
  createDashboard: (data: Partial<Dashboard>) => 
    api.post<ApiResponse<Dashboard>>('/api/v1/analytics/dashboards/', data),
  
  updateDashboard: (id: string, data: Partial<Dashboard>) => 
    api.patch<ApiResponse<Dashboard>>(`/api/v1/analytics/dashboards/${id}/`, data),
  
  deleteDashboard: (id: string) => 
    api.delete(`/api/v1/analytics/dashboards/${id}/`),
  
  // Charts
  getCharts: (params?: { dashboard?: string }) => 
    api.get<ApiResponse<Chart[]>>('/api/v1/analytics/charts/', { params }),
  
  getChart: (id: string) => 
    api.get<ApiResponse<Chart>>(`/api/v1/analytics/charts/${id}/`),
  
  createChart: (data: Partial<Chart>) => 
    api.post<ApiResponse<Chart>>('/api/v1/analytics/charts/', data),
  
  updateChart: (id: string, data: Partial<Chart>) => 
    api.patch<ApiResponse<Chart>>(`/api/v1/analytics/charts/${id}/`, data),
  
  deleteChart: (id: string) => 
    api.delete(`/api/v1/analytics/charts/${id}/`),
  
  // KPIs
  getKPIs: (params?: { category?: string }) => 
    api.get<ApiResponse<KPIMetric[]>>('/api/v1/analytics/kpis/', { params }),
  
  getKPIsByCategory: () => 
    api.get<Record<string, KPIMetric[]>>('/api/v1/analytics/kpis/by_category/'),
  
  updateKPIValue: (id: string, value: number) => 
    api.post<ApiResponse<KPIMetric>>(`/api/v1/analytics/kpis/${id}/update_value/`, { value }),
  
  // Sales Analytics
  getSalesData: (params?: { year?: number; month?: number }) => 
    api.get('/api/v1/analytics/sales/', { params }),
  
  getYearlySummary: (year?: number) => 
    api.get('/api/v1/analytics/sales/yearly_summary/', { params: { year } }),
  
  getSalesTrends: () => 
    api.get('/api/v1/analytics/sales/trends/'),
  
  // Overview
  getOverview: () => 
    api.get('/api/v1/analytics/overview/'),
};

// =================================================================
// Users Types
// =================================================================

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  phone?: string;
  avatar_url?: string;
  timezone?: string;
  language?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notify_task_assigned: boolean;
  notify_task_completed: boolean;
  notify_invoice_received: boolean;
  notify_payment_due: boolean;
  billing_email?: string;
  billing_address?: string;
  company_name?: string;
}

// =================================================================
// Users API
// =================================================================

export const usersApi = {
  // User list/detail
  getUsers: (params?: {
    role?: UserRole;
    is_active?: boolean;
    search?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
  }) => api.get<PaginatedResponse<User>>('/api/v1/users/', { params }),
  
  getUser: (id: string) => 
    api.get<ApiResponse<User>>(`/api/v1/users/${id}/`),
  
  createUser: (data: {
    email: string;
    full_name: string;
    password: string;
    role?: UserRole;
  }) => api.post<ApiResponse<User>>('/api/v1/users/', data),
  
  updateUser: (id: string, data: Partial<User>) => 
    api.patch<ApiResponse<User>>(`/api/v1/users/${id}/`, data),
  
  deleteUser: (id: string) => 
    api.delete(`/api/v1/users/${id}/`),
  
  // Current user
  getMe: () => 
    api.get<ApiResponse<User>>('/api/v1/users/me/'),
  
  updateProfile: (data: Partial<User>) => 
    api.patch<ApiResponse<User>>('/api/v1/users/profile/', data),
  
  register: (data: {
    email: string;
    full_name: string;
    password: string;
    password2: string;
  }) => api.post<{
    success: boolean;
    access: string;
    refresh: string;
    user: User;
  }>('/api/v1/users/register/', data),
  
  // Stats
  getStats: () => 
    api.get<ApiResponse<{
      total: number;
      active: number;
      inactive: number;
      admins: number;
      users: number;
    }>>('/api/v1/users/stats/'),
  
  // Settings
  getSettings: () => 
    api.get<ApiResponse<UserSettings>>('/api/v1/user-settings/'),
  
  updateNotifications: (data: Partial<UserSettings>) => 
    api.patch<ApiResponse<UserSettings>>('/api/v1/user-settings/notifications/', data),
  
  updateBilling: (data: Partial<UserSettings>) => 
    api.patch<ApiResponse<UserSettings>>('/api/v1/user-settings/billing/', data),
};

// =================================================================
// Visualization API
// =================================================================

export const visualizationApi = {
  getChartTypes: () => 
    api.get('/api/v1/visualization/chart-types/'),
  
  analyzeData: (data: any) => 
    api.post('/api/v1/visualization/analyze/', data),
  
  generateChart: (data: { type: string; data: any; options?: any }) => 
    api.post('/api/v1/visualization/generate/', data),
  
  generateWithAI: (data: { data: any; prompt?: string }) => 
    api.post('/api/v1/visualization/generate-ai/', data),
  
  getDashboardCharts: () => 
    api.get('/api/v1/visualization/dashboard/'),
  
  quickChart: (data: any) => 
    api.post('/api/v1/visualization/quick/', data),
};

// =================================================================
// RAG Knowledge Base API
// =================================================================

export const ragApi = {
  query: (query: string, options?: { top_k?: number }) => 
    api.post('/api/v1/rag/query/', { query, ...options }),
  
  chat: (message: string, history?: ChatMessage[]) => 
    api.post('/api/v1/rag/chat/', { message, history }),
  
  getKnowledge: () => 
    api.get('/api/v1/rag/knowledge/'),
};

// =================================================================
// Export All APIs
// =================================================================

export const erpApi = {
  ai: aiServiceApi,
  planner: plannerApi,
  document: documentApi,
  finance: financeApi,
  analytics: analyticsApi,
  users: usersApi,
  visualization: visualizationApi,
  rag: ragApi,
};

export default erpApi;
