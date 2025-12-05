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
} from './services';

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
    queryFn: () => emailApi.getEmails(params),
  });
}

export function useEmail(id: string) {
  return useQuery({
    queryKey: ['email', id],
    queryFn: () => emailApi.getEmail(id),
    enabled: !!id,
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
    mutationFn: (id: string) => emailApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}

export function useToggleEmailStar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => emailApi.toggleStar(id),
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
    queryFn: () => plannerApi.getTasks(params),
  });
}

export function usePlannerTask(id: string) {
  return useQuery({
    queryKey: ['planner-task', id],
    queryFn: () => plannerApi.getTask(id),
    enabled: !!id,
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
    mutationFn: (data: CreateTaskData) => plannerApi.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaskData> }) =>
      plannerApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-tasks'] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plannerApi.completeTask(id),
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

// Schedule Events
export function useScheduleEvents(params?: {
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ['schedule-events', params],
    queryFn: () => plannerApi.getEvents(params),
  });
}

export function useTodayEvents() {
  return useQuery({
    queryKey: ['schedule-events', 'today'],
    queryFn: () => plannerApi.getTodayEvents(),
  });
}

export function useUpcomingEvents() {
  return useQuery({
    queryKey: ['schedule-events', 'upcoming'],
    queryFn: () => plannerApi.getUpcomingEvents(),
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
    queryFn: () => brainstormApi.getSessions(params),
  });
}

export function useBrainstormSession(id: string) {
  return useQuery({
    queryKey: ['brainstorm-session', id],
    queryFn: () => brainstormApi.getSession(id),
    enabled: !!id,
  });
}

export function useBrainstormStats() {
  return useQuery({
    queryKey: ['brainstorm-sessions', 'stats'],
    queryFn: () => brainstormApi.getStats(),
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
