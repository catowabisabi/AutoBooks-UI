// AI Assistants Frontend Services
// Email, Planner, Document, Brainstorming

import { apiClient, PaginatedResponse } from '@/lib/api-client';

// =================================================================
// Email Assistant Types
// =================================================================

export type EmailStatus = 'DRAFT' | 'SENT' | 'RECEIVED' | 'ARCHIVED' | 'DELETED';
export type EmailCategory = 
  | 'PAYMENT_REMINDER' 
  | 'PROJECT_FOLLOWUP' 
  | 'TAX_DOC_REQUEST' 
  | 'MEETING_CONFIRM' 
  | 'INVOICE_SENT' 
  | 'EVENT_INVITE' 
  | 'IPO_RELEASE' 
  | 'BILLING_ISSUE' 
  | 'DOCUMENT_MISSING' 
  | 'APPRECIATION' 
  | 'GENERAL';
export type EmailPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Email {
  id: string;
  account?: string;
  from_address: string;
  from_name: string;
  to_addresses: string[];
  cc_addresses?: string[];
  bcc_addresses?: string[];
  reply_to?: string;
  subject: string;
  body_text: string;
  body_html?: string;
  status: EmailStatus;
  status_display: string;
  category: EmailCategory;
  category_display: string;
  priority: EmailPriority;
  priority_display: string;
  thread_id?: string;
  in_reply_to?: string;
  sent_at?: string;
  received_at?: string;
  read_at?: string;
  is_read: boolean;
  is_starred: boolean;
  is_spam: boolean;
  has_attachments: boolean;
  ai_summary?: string;
  ai_sentiment?: string;
  ai_action_items?: Array<{ action: string; deadline: string }>;
  ai_suggested_reply?: string;
  ai_keywords?: string[];
  related_project?: string;
  related_client?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailListItem {
  id: string;
  from_address: string;
  from_name: string;
  subject: string;
  status: EmailStatus;
  status_display: string;
  category: EmailCategory;
  category_display: string;
  priority: EmailPriority;
  priority_display: string;
  received_at?: string;
  sent_at?: string;
  is_read: boolean;
  is_starred: boolean;
  has_attachments: boolean;
  ai_summary?: string;
}

export interface EmailAccount {
  id: string;
  email_address: string;
  display_name: string;
  smtp_host?: string;
  smtp_port?: number;
  is_demo: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: EmailCategory;
  category_display: string;
  subject_template: string;
  body_template: string;
  variables: string[];
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComposeEmailData {
  account_id?: string;
  to_addresses: string[];
  cc_addresses?: string[];
  bcc_addresses?: string[];
  subject: string;
  body_text?: string;
  body_html?: string;
  priority?: EmailPriority;
  reply_to_id?: string;
}

export interface EmailStats {
  total: number;
  unread: number;
  starred: number;
  by_category: Record<EmailCategory, number>;
}

// =================================================================
// Email Assistant API
// =================================================================

export const emailApi = {
  // Emails
  getEmails: (params?: {
    status?: EmailStatus;
    category?: EmailCategory;
    is_read?: boolean;
    is_starred?: boolean;
    search?: string;
    page?: number;
    page_size?: number;
  }) => apiClient.get<PaginatedResponse<EmailListItem>>('/email-assistant/emails/', { params }),

  getEmail: (id: string) => 
    apiClient.get<Email>(`/email-assistant/emails/${id}/`),

  getInbox: () => 
    apiClient.get<EmailListItem[]>('/email-assistant/emails/inbox/'),

  getSent: () => 
    apiClient.get<EmailListItem[]>('/email-assistant/emails/sent/'),

  getDrafts: () => 
    apiClient.get<EmailListItem[]>('/email-assistant/emails/drafts/'),

  markRead: (id: string) => 
    apiClient.post(`/email-assistant/emails/${id}/mark_read/`),

  markUnread: (id: string) => 
    apiClient.post(`/email-assistant/emails/${id}/mark_unread/`),

  toggleStar: (id: string) => 
    apiClient.post<{ is_starred: boolean }>(`/email-assistant/emails/${id}/toggle_star/`),

  archive: (id: string) => 
    apiClient.post(`/email-assistant/emails/${id}/archive/`),

  delete: (id: string) =>
    apiClient.delete(`/email-assistant/emails/${id}/`),

  analyze: (id: string) => 
    apiClient.post<{
      summary: string;
      action_items: Array<{ action: string; deadline: string }>;
      sentiment: string;
    }>(`/email-assistant/emails/${id}/analyze/`),

  generateReply: (id: string, tone?: string) => 
    apiClient.post<{
      suggested_reply: string;
      tone: string;
    }>(`/email-assistant/emails/${id}/generate_reply/`, { tone }),

  compose: (data: ComposeEmailData) => 
    apiClient.post<Email>('/email-assistant/emails/compose/', data),

  getStats: () => 
    apiClient.get<EmailStats>('/email-assistant/emails/stats/'),

  // Accounts
  getAccounts: () => 
    apiClient.get<PaginatedResponse<EmailAccount>>('/email-assistant/accounts/'),

  createAccount: (data: Partial<EmailAccount>) => 
    apiClient.post<EmailAccount>('/email-assistant/accounts/', data),

  // Templates
  getTemplates: (category?: EmailCategory) => 
    apiClient.get<PaginatedResponse<EmailTemplate>>('/email-assistant/templates/', { 
      params: category ? { category } : undefined 
    }),

  getTemplate: (id: string) => 
    apiClient.get<EmailTemplate>(`/email-assistant/templates/${id}/`),

  renderTemplate: (id: string, variables: Record<string, string>) => 
    apiClient.post<{ subject: string; body: string }>(
      `/email-assistant/templates/${id}/render/`, 
      { variables }
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
  source_type?: string;
  source_id?: string;
  related_project?: string;
  related_client?: string;
  related_email?: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlannerTaskListItem {
  id: string;
  title: string;
  status: TaskStatus;
  status_display: string;
  priority: TaskPriority;
  priority_display: string;
  due_date?: string;
  due_time?: string;
  assigned_to_name?: string;
  ai_generated: boolean;
  ai_priority_score: number;
  tags: string[];
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  organizer?: string;
  organizer_name?: string;
  attendees?: string[];
  attendee_names?: string[];
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  timezone: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  meeting_link?: string;
  meeting_type?: string;
  ai_generated: boolean;
  source_email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlannerStats {
  total: number;
  todo: number;
  in_progress: number;
  done: number;
  overdue: number;
  due_today: number;
  ai_generated: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  assigned_to?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  due_time?: string;
  reminder_at?: string;
  related_project?: string;
  related_client?: string;
  tags?: string[];
}

// =================================================================
// Planner Assistant API
// =================================================================

export const plannerApi = {
  // Tasks
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
  }) => apiClient.get<PaginatedResponse<PlannerTaskListItem>>('/planner-assistant/tasks/', { params }),

  getTask: (id: string) => 
    apiClient.get<PlannerTask>(`/planner-assistant/tasks/${id}/`),

  createTask: (data: CreateTaskData) => 
    apiClient.post<PlannerTask>('/planner-assistant/tasks/', data),

  updateTask: (id: string, data: Partial<CreateTaskData>) => 
    apiClient.patch<PlannerTask>(`/planner-assistant/tasks/${id}/`, data),

  deleteTask: (id: string) => 
    apiClient.delete(`/planner-assistant/tasks/${id}/`),

  completeTask: (id: string) => 
    apiClient.post(`/planner-assistant/tasks/${id}/complete/`),

  startTask: (id: string) => 
    apiClient.post(`/planner-assistant/tasks/${id}/start/`),

  blockTask: (id: string) => 
    apiClient.post(`/planner-assistant/tasks/${id}/block/`),

  getToday: () => 
    apiClient.get<PlannerTaskListItem[]>('/planner-assistant/tasks/today/'),

  getOverdue: () => 
    apiClient.get<PlannerTaskListItem[]>('/planner-assistant/tasks/overdue/'),

  getStats: () => 
    apiClient.get<PlannerStats>('/planner-assistant/tasks/stats/'),

  // AI features
  aiCreate: (input_text: string, options?: {
    source_email_id?: string;
    auto_prioritize?: boolean;
    auto_schedule?: boolean;
  }) => apiClient.post<PlannerTask>('/planner-assistant/tasks/ai_create/', {
    input_text,
    ...options,
  }),

  aiReprioritize: (options?: {
    consider_deadlines?: boolean;
    consider_dependencies?: boolean;
  }) => apiClient.post<{ status: string; tasks_updated: number }>(
    '/planner-assistant/tasks/ai_reprioritize/', 
    options
  ),

  // Events
  getEvents: (params?: {
    start_date?: string;
    end_date?: string;
    page?: number;
    page_size?: number;
  }) => apiClient.get<PaginatedResponse<ScheduleEvent>>('/planner-assistant/events/', { params }),

  getEvent: (id: string) => 
    apiClient.get<ScheduleEvent>(`/planner-assistant/events/${id}/`),

  createEvent: (data: Partial<ScheduleEvent>) => 
    apiClient.post<ScheduleEvent>('/planner-assistant/events/', data),

  updateEvent: (id: string, data: Partial<ScheduleEvent>) => 
    apiClient.patch<ScheduleEvent>(`/planner-assistant/events/${id}/`, data),

  deleteEvent: (id: string) => 
    apiClient.delete(`/planner-assistant/events/${id}/`),

  getTodayEvents: () => 
    apiClient.get<ScheduleEvent[]>('/planner-assistant/events/today/'),

  getUpcomingEvents: () => 
    apiClient.get<ScheduleEvent[]>('/planner-assistant/events/upcoming/'),

  // Extended Planner Endpoints
  start: () => apiClient.post('/planner-assistant/start/'),
  getData: () => apiClient.get('/planner-assistant/data/'),
  query: (query: string) => apiClient.post('/planner-assistant/query/', { query }),
  generatePlan: (goal: string) => apiClient.post('/planner-assistant/generate-plan/', { goal }),
};

// =================================================================
// Brainstorming Assistant Types
// =================================================================

export type SessionType = 
  | 'IDEA_GENERATOR' 
  | 'CAMPAIGN_BREAKDOWN' 
  | 'MARKET_ANALYSIS' 
  | 'PITCH_WRITER' 
  | 'STRATEGY' 
  | 'GENERAL';

export interface BrainstormSession {
  id: string;
  title: string;
  session_type: SessionType;
  prompt: string;
  context?: Record<string, any>;
  ai_response?: string;
  ai_structured_output?: Record<string, any>;
  saved_ideas?: any[];
  ideas?: BrainstormIdea[];
  created_by?: string;
  created_by_name?: string;
  related_campaign?: string;
  related_client?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrainstormSessionListItem {
  id: string;
  title: string;
  session_type: SessionType;
  prompt: string;
  ideas_count: number;
  created_at: string;
}

export interface BrainstormIdea {
  id: string;
  session: string;
  content: string;
  category?: string;
  is_selected: boolean;
  rating: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GenerateRequest {
  session_type: SessionType;
  prompt: string;
  context?: Record<string, any>;
  campaign_id?: string;
  client_id?: string;
  num_ideas?: number;
  creativity_level?: 'low' | 'medium' | 'high';
}

export interface CampaignBreakdownRequest {
  campaign_name: string;
  campaign_type: 'BMI' | 'IPO' | 'PR';
  target_audience?: string;
  budget?: number;
  timeline_days?: number;
  goals?: string[];
}

export interface PitchWriterRequest {
  topic: string;
  pitch_type: 'elevator' | 'investor' | 'sales' | 'press';
  key_points: string[];
  tone?: 'professional' | 'casual' | 'enthusiastic' | 'formal';
  max_words?: number;
}

export interface MarketAnalysisRequest {
  industry: string;
  region: 'HK' | 'CN' | 'APAC' | 'GLOBAL';
  analysis_type: 'competitor' | 'trend' | 'swot' | 'opportunity';
  specific_questions?: string[];
}

export interface BrainstormStats {
  total_sessions: number;
  by_type: Record<SessionType, number>;
  total_ideas: number;
}

// =================================================================
// Brainstorming Assistant API
// =================================================================

export const brainstormApi = {
  // Sessions
  getSessions: (params?: {
    session_type?: SessionType;
    campaign_id?: string;
    client_id?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }) => apiClient.get<PaginatedResponse<BrainstormSessionListItem>>(
    '/brainstorm-assistant/sessions/', 
    { params }
  ),

  getSession: (id: string) => 
    apiClient.get<BrainstormSession>(`/brainstorm-assistant/sessions/${id}/`),

  createSession: (data: {
    title: string;
    session_type: SessionType;
    prompt: string;
    context?: Record<string, any>;
    related_campaign?: string;
    related_client?: string;
  }) => apiClient.post<BrainstormSession>('/brainstorm-assistant/sessions/', data),

  deleteSession: (id: string) => 
    apiClient.delete(`/brainstorm-assistant/sessions/${id}/`),

  // AI Generation
  generate: (data: GenerateRequest) => 
    apiClient.post<{
      session: BrainstormSession;
      ideas: BrainstormIdea[];
    }>('/brainstorm-assistant/sessions/generate/', data),

  campaignBreakdown: (data: CampaignBreakdownRequest) => 
    apiClient.post<{
      session_id: string;
      breakdown: {
        campaign_name: string;
        campaign_type: string;
        phases: Array<{
          name: string;
          duration: string;
          activities: string[];
          budget_percent: number;
        }>;
        key_messages: string[];
        target_channels: string[];
        success_metrics: string[];
      };
    }>('/brainstorm-assistant/sessions/campaign_breakdown/', data),

  writePitch: (data: PitchWriterRequest) => 
    apiClient.post<{
      session_id: string;
      pitch: string;
      word_count: number;
    }>('/brainstorm-assistant/sessions/write_pitch/', data),

  marketAnalysis: (data: MarketAnalysisRequest) => 
    apiClient.post<{
      session_id: string;
      analysis: {
        industry: string;
        region: string;
        analysis_type: string;
        key_findings: string[];
        opportunities: string[];
        threats: string[];
        recommendations: string[];
      };
    }>('/brainstorm-assistant/sessions/market_analysis/', data),

  saveIdea: (sessionId: string, content: string, category?: string) => 
    apiClient.post<BrainstormIdea>(
      `/brainstorm-assistant/sessions/${sessionId}/save_idea/`, 
      { content, category }
    ),

  getStats: () => 
    apiClient.get<BrainstormStats>('/brainstorm-assistant/sessions/stats/'),

  // Ideas
  getIdeas: (params?: {
    session_id?: string;
    is_selected?: boolean;
    page?: number;
    page_size?: number;
  }) => apiClient.get<PaginatedResponse<BrainstormIdea>>(
    '/brainstorm-assistant/ideas/', 
    { params }
  ),

  getIdea: (id: string) => 
    apiClient.get<BrainstormIdea>(`/brainstorm-assistant/ideas/${id}/`),

  updateIdea: (id: string, data: Partial<BrainstormIdea>) => 
    apiClient.patch<BrainstormIdea>(`/brainstorm-assistant/ideas/${id}/`, data),

  selectIdea: (id: string) => 
    apiClient.post(`/brainstorm-assistant/ideas/${id}/select/`),

  deselectIdea: (id: string) => 
    apiClient.post(`/brainstorm-assistant/ideas/${id}/deselect/`),

  rateIdea: (id: string, rating: number) => 
    apiClient.post<{ rating: number }>(
      `/brainstorm-assistant/ideas/${id}/rate/`, 
      { rating }
    ),
};

// =================================================================
// Document Assistant API (Extended)
// =================================================================

export const documentApi = {
  upload: (formData: FormData) => 
    apiClient.upload('/document-assistant/upload/', formData),
    
  getComparisons: () => 
    apiClient.get('/document-assistant/comparisons/'),
    
  getDocumentInfo: (id: string) => 
    apiClient.get(`/document-assistant/${id}/info/`),
    
  query: (documentId: string, query: string) => 
    apiClient.post('/document-assistant/query/', { document_id: documentId, query }),
    
  process: (formData: FormData) => 
    apiClient.upload('/document-assistant/process/', formData),
};

// =================================================================
// Analyst Assistant API (Extended)
// =================================================================

export const analystApi = {
  getData: () => apiClient.get('/analyst-assistant/data/'),
  start: () => apiClient.post('/analyst-assistant/start/'),
  query: (query: string) => apiClient.post('/analyst-assistant/query/', { query }),
};

// =================================================================
// AI Agent API
// =================================================================

export const agentApi = {
  chat: (message: string, sessionId?: string) => 
    apiClient.post('/agent/chat/', { message, session_id: sessionId }),
    
  getAgents: () => apiClient.get('/agent/agents/'),
  getTools: () => apiClient.get('/agent/tools/'),
  getActions: () => apiClient.get('/agent/actions/'),
  getSessions: () => apiClient.get('/agent/sessions/'),
  getSession: (id: string) => apiClient.get(`/agent/sessions/${id}/`),
  rollbackAction: (actionId: string) => apiClient.post(`/agent/actions/${actionId}/rollback/`),
};

// =================================================================
// Export all services
// =================================================================

export const aiAssistantsApi = {
  email: emailApi,
  planner: plannerApi,
  brainstorm: brainstormApi,
  document: documentApi,
  analyst: analystApi,
  agent: agentApi,
};

export default aiAssistantsApi;
