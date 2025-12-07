// AI Assistants React Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  emailApi, 
  plannerApi, 
  brainstormApi,
  EmailStatus,
  EmailCategory,
  TaskStatus,
  TaskPriority,
  SessionType,
  CreateTaskData,
  ComposeEmailData,
  GenerateRequest,
  CampaignBreakdownRequest,
  PitchWriterRequest,
  MarketAnalysisRequest,
  // Re-export types for consumers
  Email,
  EmailListItem,
  EmailAccount,
  EmailTemplate,
  PlannerTask,
  PlannerTaskListItem,
  ScheduleEvent,
  BrainstormSession,
  BrainstormSessionListItem,
  BrainstormIdea,
} from './services';

// Re-export all types for convenience
export type { 
  Email,
  EmailListItem,
  EmailAccount,
  EmailTemplate,
  EmailStatus,
  EmailCategory,
  PlannerTask,
  PlannerTaskListItem,
  ScheduleEvent,
  TaskStatus,
  TaskPriority,
  BrainstormSession,
  BrainstormSessionListItem,
  BrainstormIdea,
  SessionType,
  CreateTaskData,
  ComposeEmailData,
  GenerateRequest,
};

// =================================================================
// Email Assistant Hooks
// =================================================================

export function useEmails(params?: {
  status?: EmailStatus;
  category?: EmailCategory;
  is_read?: boolean;
  is_starred?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ['emails', params],
    queryFn: async () => {
      const response = await emailApi.getEmails(params);
      // Handle both paginated and array responses
      return Array.isArray(response) ? response : response.results || [];
    },
  });
}

export function useEmail(id: string) {
  return useQuery({
    queryKey: ['email', id],
    queryFn: () => emailApi.getEmail(id),
    enabled: !!id,
  });
}

export function useEmailAccounts() {
  return useQuery({
    queryKey: ['email-accounts'],
    queryFn: async () => {
      const response = await emailApi.getAccounts();
      return Array.isArray(response) ? response : response.results || [];
    },
  });
}

export function useInbox() {
  return useQuery({
    queryKey: ['emails', 'inbox'],
    queryFn: () => emailApi.getInbox(),
  });
}

export function useEmailStats() {
  return useQuery({
    queryKey: ['emails', 'stats'],
    queryFn: () => emailApi.getStats(),
  });
}

export function useEmailTemplates(category?: EmailCategory) {
  return useQuery({
    queryKey: ['email-templates', category],
    queryFn: () => emailApi.getTemplates(category),
  });
}

export function useMarkEmailRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => emailApi.markRead(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}

// Alias for backwards compatibility
export const useStarEmail = useToggleEmailStar;

export function useToggleEmailStar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => emailApi.toggleStar(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}

export function useDeleteEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => emailApi.delete(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}

export function useArchiveEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => emailApi.archive(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}

export function useGenerateReply() {
  return useMutation({
    mutationFn: (id: number | string) => emailApi.generateReply(String(id)),
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ComposeEmailData) => emailApi.compose(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}

export function useAnalyzeEmail() {
  return useMutation({
    mutationFn: (id: string) => emailApi.analyze(id),
  });
}

export function useGenerateEmailReply() {
  return useMutation({
    mutationFn: ({ id, tone }: { id: string; tone?: string }) => 
      emailApi.generateReply(id, tone),
  });
}

export function useComposeEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ComposeEmailData) => emailApi.compose(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}

export function useRenderEmailTemplate() {
  return useMutation({
    mutationFn: ({ id, variables }: { id: string; variables: Record<string, string> }) =>
      emailApi.renderTemplate(id, variables),
  });
}

// =================================================================
// Planner Assistant Hooks
// =================================================================

export function usePlannerTasks(params?: {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string;
  due_date?: string;
  overdue?: boolean;
  ai_generated?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ['planner-tasks', params],
    queryFn: async () => {
      const response = await plannerApi.getTasks(params);
      return Array.isArray(response) ? response : response.results || [];
    },
  });
}

export function usePlannerTask(id: string) {
  return useQuery({
    queryKey: ['planner-task', id],
    queryFn: () => plannerApi.getTask(id),
    enabled: !!id,
  });
}

export function useScheduleEvents(params?: {
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ['schedule-events', params],
    queryFn: async () => {
      const response = await plannerApi.getEvents(params);
      return Array.isArray(response) ? response : response.results || [];
    },
  });
}

export function useTodayTasks() {
  return useQuery({
    queryKey: ['planner-tasks', 'today'],
    queryFn: () => plannerApi.getToday(),
  });
}

export function useOverdueTasks() {
  return useQuery({
    queryKey: ['planner-tasks', 'overdue'],
    queryFn: () => plannerApi.getOverdue(),
  });
}

export function usePlannerStats() {
  return useQuery({
    queryKey: ['planner-tasks', 'stats'],
    queryFn: () => plannerApi.getStats(),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateTaskData>) => plannerApi.createTask(data as CreateTaskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<CreateTaskData> }) =>
      plannerApi.updateTask(String(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => plannerApi.deleteTask(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-tasks'] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => plannerApi.completeTask(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-tasks'] });
    },
  });
}

export function useStartTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plannerApi.startTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-tasks'] });
    },
  });
}

export function useAIPrioritize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (options?: { consider_deadlines?: boolean }) => plannerApi.aiReprioritize(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-tasks'] });
    },
  });
}

export function useAICreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input_text, ...options }: {
      input_text: string;
      source_email_id?: string;
      auto_prioritize?: boolean;
      auto_schedule?: boolean;
    }) => plannerApi.aiCreate(input_text, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-tasks'] });
    },
  });
}

export function useAIReprioritize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (options?: {
      consider_deadlines?: boolean;
      consider_dependencies?: boolean;
    }) => plannerApi.aiReprioritize(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-tasks'] });
    },
  });
}

export function useAISchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (options?: {
      available_hours_per_day?: number;
    }) => plannerApi.aiSchedule(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-tasks'] });
    },
  });
}

export function useCreateTasksFromEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email_id: string) => plannerApi.fromEmail(email_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-tasks'] });
    },
  });
}

export function useCreateTasksFromEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (event_id: string) => plannerApi.fromEvent(event_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-tasks'] });
    },
  });
}

// =================================================================
// Brainstorming Assistant Hooks
// =================================================================

export function useBrainstormSessions(params?: {
  session_type?: SessionType;
  campaign_id?: string;
  client_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ['brainstorm-sessions', params],
    queryFn: async () => {
      const response = await brainstormApi.getSessions(params);
      return Array.isArray(response) ? response : response.results || [];
    },
  });
}

export function useBrainstormSession(id: number | string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['brainstorm-session', id],
    queryFn: () => brainstormApi.getSession(String(id)),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useBrainstormIdeas(sessionId: number | string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['brainstorm-ideas', sessionId],
    queryFn: async () => {
      const response = await brainstormApi.getIdeas({ session_id: String(sessionId) });
      return Array.isArray(response) ? response : response.results || [];
    },
    enabled: options?.enabled !== false && !!sessionId,
  });
}

export function useBrainstormStats() {
  return useQuery({
    queryKey: ['brainstorm-sessions', 'stats'],
    queryFn: () => brainstormApi.getStats(),
  });
}

export function useCreateBrainstormSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      session_type?: SessionType;
      prompt?: string;
      context?: string;
      target_outcome?: string;
      related_campaign?: string;
      related_client?: string;
    }) => brainstormApi.createSession({
      title: data.title,
      session_type: data.session_type || 'STRATEGY',
      prompt: data.prompt || data.context || '',
      context: data.context ? { background: data.context, target: data.target_outcome } : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brainstorm-sessions'] });
    },
  });
}

export function useGenerateIdeas() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number | string) => brainstormApi.generate({
      session_type: 'IDEA_GENERATOR',
      prompt: `Generate ideas for session ${sessionId}`,
      num_ideas: 5,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brainstorm-ideas'] });
      queryClient.invalidateQueries({ queryKey: ['brainstorm-sessions'] });
    },
  });
}

export function useRateIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ideaId, rating }: { ideaId: number | string; rating: number }) =>
      brainstormApi.rateIdea(String(ideaId), rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brainstorm-ideas'] });
    },
  });
}

export function useGenerateBrainstorm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateRequest) => brainstormApi.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brainstorm-sessions'] });
    },
  });
}

export function useCampaignBreakdown() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CampaignBreakdownRequest) => brainstormApi.campaignBreakdown(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brainstorm-sessions'] });
    },
  });
}

export function useWritePitch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PitchWriterRequest) => brainstormApi.writePitch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brainstorm-sessions'] });
    },
  });
}

export function useMarketAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MarketAnalysisRequest) => brainstormApi.marketAnalysis(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brainstorm-sessions'] });
    },
  });
}

export function useSaveBrainstormIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, content, category }: { 
      sessionId: string; 
      content: string; 
      category?: string;
    }) => brainstormApi.saveIdea(sessionId, content, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brainstorm-sessions'] });
    },
  });
}

export function useRateBrainstormIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) =>
      brainstormApi.rateIdea(id, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brainstorm-sessions'] });
    },
  });
}

export function useSelectBrainstormIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brainstormApi.selectIdea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brainstorm-sessions'] });
    },
  });
}
