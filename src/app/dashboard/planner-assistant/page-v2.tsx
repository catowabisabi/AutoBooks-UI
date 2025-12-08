'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Clock, 
  Target, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Send, 
  Plus, 
  Trash2,
  Sparkles,
  Loader2,
  MoreHorizontal,
  ListTodo,
  CalendarDays,
  Brain,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Play,
  Pause,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiApi } from '@/lib/api';
import {
  usePlannerTasks,
  useScheduleEvents,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useAIPrioritize,
  useCompleteTask,
  type PlannerTask,
  type ScheduleEvent,
  type TaskStatus,
  type TaskPriority,
  type CreateTaskData,
} from '@/features/ai-assistants';
import { plannerApi } from '@/features/ai-assistants/services';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n/provider';
import { PlannerAIPanel } from '@/components/planner-ai-panel';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Task status configuration (icons and colors only - labels are translated)
const TASK_STATUS_CONFIG_BASE = {
  TODO: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100' },
  IN_PROGRESS: { icon: Play, color: 'text-blue-500', bg: 'bg-blue-100 text-blue-800' },
  BLOCKED: { icon: Pause, color: 'text-yellow-500', bg: 'bg-yellow-100 text-yellow-800' },
  DONE: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 text-green-800' },
  CANCELLED: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100 text-red-800' },
};

const getTaskStatusConfig = (t: (key: string) => string) => ({
  TODO: { ...TASK_STATUS_CONFIG_BASE.TODO, label: t('plannerAssistant.status.todo') },
  IN_PROGRESS: { ...TASK_STATUS_CONFIG_BASE.IN_PROGRESS, label: t('plannerAssistant.status.inProgress') },
  BLOCKED: { ...TASK_STATUS_CONFIG_BASE.BLOCKED, label: t('plannerAssistant.status.blocked') },
  DONE: { ...TASK_STATUS_CONFIG_BASE.DONE, label: t('plannerAssistant.status.done') },
  CANCELLED: { ...TASK_STATUS_CONFIG_BASE.CANCELLED, label: t('plannerAssistant.status.cancelled') },
});

const TASK_PRIORITY_CONFIG_BASE = {
  LOW: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  MEDIUM: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  HIGH: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  CRITICAL: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

const getTaskPriorityConfig = (t: (key: string) => string) => ({
  LOW: { ...TASK_PRIORITY_CONFIG_BASE.LOW, label: t('plannerAssistant.priorities.low') },
  MEDIUM: { ...TASK_PRIORITY_CONFIG_BASE.MEDIUM, label: t('plannerAssistant.priorities.medium') },
  HIGH: { ...TASK_PRIORITY_CONFIG_BASE.HIGH, label: t('plannerAssistant.priorities.high') },
  CRITICAL: { ...TASK_PRIORITY_CONFIG_BASE.CRITICAL, label: t('plannerAssistant.priorities.critical') },
});

const TASK_CATEGORY_KEYS = [
  'AUDIT', 'TAX', 'IPO', 'FINANCIAL_PR', 'COMPLIANCE', 'MEETING', 'REPORT', 'CLIENT', 'INTERNAL', 'OTHER'
] as const;

const getTaskCategories = (t: (key: string) => string) => ({
  AUDIT: t('plannerAssistant.categories.audit'),
  TAX: t('plannerAssistant.categories.tax'),
  IPO: t('plannerAssistant.categories.ipo'),
  FINANCIAL_PR: t('plannerAssistant.categories.financialPr'),
  COMPLIANCE: t('plannerAssistant.categories.compliance'),
  MEETING: t('plannerAssistant.categories.meeting'),
  REPORT: t('plannerAssistant.categories.report'),
  CLIENT: t('plannerAssistant.categories.client'),
  INTERNAL: t('plannerAssistant.categories.internal'),
  OTHER: t('plannerAssistant.categories.other'),
});

// Task List Item Component
function TaskListItem({
  task,
  onToggleStatus,
  onDelete,
  onEdit,
  statusConfig: TASK_STATUS_CONFIG,
  priorityConfig: TASK_PRIORITY_CONFIG,
}: {
  task: PlannerTask;
  onToggleStatus: () => void;
  onDelete: () => void;
  onEdit: () => void;
  statusConfig: ReturnType<typeof getTaskStatusConfig>;
  priorityConfig: ReturnType<typeof getTaskPriorityConfig>;
}) {
  const statusCfg = TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG] || TASK_STATUS_CONFIG.TODO;
  const priorityCfg = TASK_PRIORITY_CONFIG[task.priority as keyof typeof TASK_PRIORITY_CONFIG] || TASK_PRIORITY_CONFIG.MEDIUM;
  const StatusIcon = statusCfg.icon;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE';

  return (
    <div className={cn(
      "p-4 border rounded-lg hover:bg-muted/50 transition-colors",
      task.status === 'DONE' && "opacity-60",
      isOverdue && "border-red-300 bg-red-50/50 dark:bg-red-950/20"
    )}>
      <div className="flex items-start gap-3">
        <button onClick={onToggleStatus} className="mt-1">
          <StatusIcon className={cn("h-5 w-5", statusCfg.color)} />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "font-medium",
              task.status === 'DONE' && "line-through text-muted-foreground"
            )}>
              {task.title}
            </span>
            <Badge className={priorityCfg.color} variant="secondary">
              {priorityCfg.label}
            </Badge>
            {task.ai_generated && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Sparkles className="h-3 w-3" />
                AI
              </Badge>
            )}
            {task.tags && task.tags.length > 0 && (
              <Badge variant="outline" className="text-xs">{task.tags[0]}</Badge>
            )}
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {task.due_date && (
              <div className={cn("flex items-center gap-1", isOverdue && "text-red-500")}>
                <Calendar className="h-3 w-3" />
                Due: {new Date(task.due_date).toLocaleDateString()}
              </div>
            )}
            {task.ai_priority_score !== undefined && task.ai_priority_score > 0 && (
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3 text-purple-500" />
                Score: {task.ai_priority_score}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Create Task Dialog Component
function CreateTaskDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  t,
  priorityConfig: TASK_PRIORITY_CONFIG,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: CreateTaskData) => void;
  isSubmitting: boolean;
  t: (key: string) => string;
  priorityConfig: ReturnType<typeof getTaskPriorityConfig>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title,
      description,
      priority,
      due_date: dueDate || undefined,
      status: 'TODO' as TaskStatus,
    });
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setDueDate('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('plannerAssistant.createTask')}</DialogTitle>
          <DialogDescription>
            {t('plannerAssistant.createTaskDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">{t('plannerAssistant.taskTitle')}</Label>
            <Input
              id="title"
              placeholder={t('plannerAssistant.enterTaskTitle')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">{t('plannerAssistant.taskDescription')}</Label>
            <Textarea
              id="description"
              placeholder={t('plannerAssistant.taskDescriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="priority">{t('plannerAssistant.priority')}</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="due_date">{t('plannerAssistant.dueDate')}</Label>
              <Input
                id="due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {t('plannerAssistant.createTask')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Events Sidebar Component
function EventsSidebar({ events, isLoading }: { events: ScheduleEvent[]; isLoading: boolean }) {
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => new Date(e.start_time) >= now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 5);
  }, [events]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcomingEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No upcoming events
        </p>
      ) : (
        upcomingEvents.map(event => (
          <div key={event.id} className="p-3 border rounded-lg">
            <div className="flex items-start gap-2">
              <div 
                className="w-1 h-full rounded-full bg-primary"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{event.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <CalendarDays className="h-3 w-3" />
                  {new Date(event.start_time).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Main Planner Assistant Page
export default function PlannerAssistantPageV2() {
  const { t } = useTranslation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'ai_score'>('due_date');
  
  // Translated configs
  const TASK_STATUS_CONFIG = useMemo(() => getTaskStatusConfig(t), [t]);
  const TASK_PRIORITY_CONFIG = useMemo(() => getTaskPriorityConfig(t), [t]);
  const TASK_CATEGORIES = useMemo(() => getTaskCategories(t), [t]);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your Planner Assistant. I can help you organize tasks, set priorities, and plan your work schedule. I can also analyze your tasks and suggest optimal prioritization. How can I help?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [plannerQueryText, setPlannerQueryText] = useState('');
  const [plannerResult, setPlannerResult] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  // Planner dataset actions
  const loadPlannerData = useMutation({
    mutationFn: () => plannerApi.start(),
    onSuccess: (data: any) => {
      toast({ title: 'Dataset loaded', description: data?.message || 'Planner dataset is ready.' });
    },
    onError: () => toast({ title: 'Load failed', description: 'Unable to load planner dataset.', variant: 'destructive' }),
  });

  const queryPlannerData = useMutation({
    mutationFn: (query: string) => plannerApi.query(query),
    onSuccess: (data: any) => {
      setPlannerResult(data);
      if (data?.message) {
        toast({ title: 'Query completed', description: data.message });
      }
    },
    onError: () => toast({ title: 'Query failed', description: 'Please try again.', variant: 'destructive' }),
  });

  // API Hooks
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = usePlannerTasks();
  const { data: events = [], isLoading: eventsLoading } = useScheduleEvents();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const aiPrioritizeMutation = useAIPrioritize();
  const completeTaskMutation = useCompleteTask();

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    
    // Filter by status
    if (filterStatus !== 'ALL') {
      result = result.filter(t => t.status === filterStatus);
    }
    
    // Filter by priority
    if (filterPriority !== 'ALL') {
      result = result.filter(t => t.priority === filterPriority);
    }
    
    // Sort
    result.sort((a, b) => {
      if (sortBy === 'due_date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - 
               (priorityOrder[b.priority as keyof typeof priorityOrder] || 3);
      }
      if (sortBy === 'ai_score') {
        return (b.ai_priority_score || 0) - (a.ai_priority_score || 0);
      }
      return 0;
    });
    
    return result;
  }, [tasks, filterStatus, filterPriority, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter((t: PlannerTask) => t.status === 'DONE').length,
    inProgress: tasks.filter((t: PlannerTask) => t.status === 'IN_PROGRESS').length,
    urgent: tasks.filter((t: PlannerTask) => t.priority === 'CRITICAL' && t.status !== 'DONE').length,
    overdue: tasks.filter((t: PlannerTask) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'DONE').length,
  }), [tasks]);

  // Handlers
  const handleCreateTask = (taskData: CreateTaskData) => {
    createTaskMutation.mutate(taskData, {
      onSuccess: () => {
        setCreateDialogOpen(false);
        toast({ title: 'Task created successfully' });
      },
    });
  };

  const handleToggleStatus = (task: PlannerTask) => {
    const statusOrder: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    if (nextStatus === 'DONE') {
      completeTaskMutation.mutate(task.id);
    } else {
      updateTaskMutation.mutate({ id: task.id, data: { status: nextStatus } });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId, {
      onSuccess: () => toast({ title: 'Task deleted' }),
    });
  };

  const handleAIPrioritize = async () => {
    try {
      const result = await aiPrioritizeMutation.mutateAsync(undefined);
      const data = result as { message?: string; tasks_updated?: number };
      toast({ title: 'AI prioritization complete', description: data.message });
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: `I've analyzed your tasks and updated their AI priority scores. ${data.message || 'Tasks are now sorted by optimal priority.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (error) {
      toast({ title: 'Failed to prioritize tasks', variant: 'destructive' });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const currentMsg = newMessage;
    setNewMessage('');
    setChatLoading(true);

    try {
      const taskContext = tasks.slice(0, 10).map((t: PlannerTask) =>
        `- ${t.title} (${t.priority}, ${t.status}, due: ${t.due_date || 'no date'})`
      ).join('\n');

      const systemPrompt = `You are a professional planner assistant for AutoBooks ERP, an accounting and audit firm platform. Help users manage tasks, set priorities, and plan their work. Current tasks:\n${taskContext}\n\nProvide helpful, concise advice about task management, scheduling, and prioritization.`;

      const conversationHistory = messages.slice(-5).map(m => ({
        role: m.type as 'user' | 'assistant',
        content: m.content
      }));
      conversationHistory.push({ role: 'user', content: currentMsg });

      const response = await aiApi.chatWithHistory(
        conversationHistory,
        'openai',
        { systemPrompt }
      );

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content || 'I can help you organize your tasks. What would you like to do?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Based on your current workload, I recommend focusing on high-priority tasks first. Would you like me to help break these down into smaller steps?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const renderPlannerResult = () => {
    if (!plannerResult) {
      return <p className="text-sm text-muted-foreground">Run a data question to see results.</p>;
    }

    if (plannerResult.type === 'error' || plannerResult.type === 'invalid') {
      return (
        <p className="text-sm text-destructive">
          {plannerResult.message || 'Unable to answer this question.'}
        </p>
      );
    }

    if (plannerResult.type === 'table' && Array.isArray(plannerResult.data) && plannerResult.data.length > 0) {
      const columns = Object.keys(plannerResult.data[0] || {}).slice(0, 6);
      const rows = plannerResult.data.slice(0, 10);

      return (
        <div className="space-y-2">
          <div className="overflow-auto border rounded-md">
            <table className="min-w-full text-xs">
              <thead className="bg-muted">
                <tr>
                  {columns.map(col => (
                    <th key={col} className="px-2 py-1 text-left font-medium text-muted-foreground">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any, idx: number) => (
                  <tr key={idx} className="border-t">
                    {columns.map(col => (
                      <td key={col} className="px-2 py-1 whitespace-nowrap">
                        {String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {plannerResult.data.length > rows.length && (
            <p className="text-xs text-muted-foreground">
              Showing first {rows.length} of {plannerResult.data.length} rows.
            </p>
          )}
        </div>
      );
    }

    return (
      <pre className="text-xs whitespace-pre-wrap bg-muted p-2 rounded-md">
        {JSON.stringify(plannerResult, null, 2)}
      </pre>
    );
  };

  return (
    <div className="flex flex-1 flex-col p-4 gap-4">
      {/* Header with AI Panel inline */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">{t('plannerAssistant.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('plannerAssistant.description')}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1 text-xs">
              <Target className="h-3 w-3" />
              {stats.total - stats.completed} {t('plannerAssistant.active')}
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs">
              <AlertCircle className="h-3 w-3" />
              {stats.urgent} {t('plannerAssistant.urgent')}
            </Badge>
            {stats.overdue > 0 && (
              <Badge variant="destructive" className="gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {stats.overdue} {t('plannerAssistant.overdue')}
              </Badge>
            )}
          </div>
        </div>
        <PlannerAIPanel 
          onTasksCreated={() => refetchTasks()}
          onReprioritized={() => refetchTasks()}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{t('plannerAssistant.totalTasks')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">{t('plannerAssistant.status.inProgress')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">{t('plannerAssistant.completed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xl font-bold">
                  {Math.round((stats.completed / (stats.total || 1)) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">{t('plannerAssistant.completion')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Task List */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  {t('plannerAssistant.tasks')}
                </CardTitle>
                <CardDescription className="text-xs">{t('plannerAssistant.tasksDescription')}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAIPrioritize}
                  disabled={aiPrioritizeMutation.isPending}
                  className="h-7 text-xs"
                >
                  {aiPrioritizeMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1 text-purple-500" />
                  )}
                  {t('plannerAssistant.aiPrioritize')}
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => refetchTasks()}>
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button size="sm" className="h-7 text-xs" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-3 w-3 mr-1" />
                  {t('plannerAssistant.addTask')}
                </Button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-2 mt-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[120px] h-7 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue placeholder={t('plannerAssistant.status.label')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('plannerAssistant.allStatus')}</SelectItem>
                  {Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[120px] h-7 text-xs">
                  <SelectValue placeholder={t('plannerAssistant.priority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('plannerAssistant.allPriority')}</SelectItem>
                  {Object.entries(TASK_PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[120px] h-7 text-xs">
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due_date">{t('plannerAssistant.dueDate')}</SelectItem>
                  <SelectItem value="priority">{t('plannerAssistant.priority')}</SelectItem>
                  <SelectItem value="ai_score">{t('plannerAssistant.aiScore')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden">
            {tasksLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-full pr-4">
                <div className="space-y-3">
                  {filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                      <ListTodo className="h-12 w-12 mb-2" />
                      <p>{t('plannerAssistant.noTasks')}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t('plannerAssistant.createTask')}
                      </Button>
                    </div>
                  ) : (
                    filteredTasks.map(task => (
                      <TaskListItem
                        key={task.id}
                        task={task}
                        onToggleStatus={() => handleToggleStatus(task)}
                        onDelete={() => handleDeleteTask(task.id)}
                        onEdit={() => {/* TODO: Edit dialog */}}
                        statusConfig={TASK_STATUS_CONFIG}
                        priorityConfig={TASK_PRIORITY_CONFIG}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Right Sidebar: Events + AI Chat */}
        <ScrollArea className="h-full">
          <div className="space-y-4 pr-2">
            {/* Upcoming Events */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {t('plannerAssistant.upcomingEvents')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <EventsSidebar events={events} isLoading={eventsLoading} />
              </CardContent>
            </Card>

            {/* AI Chat */}
            <Card className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  {t('plannerAssistant.aiChat')}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col p-3 pt-0">
                <div className="h-[200px] overflow-y-auto mb-2">
                  <div className="space-y-2">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={cn(
                          "max-w-[90%] rounded-lg p-2 text-xs",
                          message.type === 'user'
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "mr-auto bg-muted"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <span className="text-[10px] opacity-60 block mt-1">{message.timestamp}</span>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="mr-auto bg-muted rounded-lg p-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2 border-t">
                  <Input
                    placeholder={t('plannerAssistant.askForHelp')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={chatLoading}
                    className="h-7 text-xs"
                  />
                  <Button 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={handleSendMessage} 
                    disabled={chatLoading || !newMessage.trim()}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Planner Data Query */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  {t('plannerAssistant.dataExplorer', 'Planner Data Explorer')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('plannerAssistant.dataExplorerDesc', 'Load the demo dataset and ask a quick question.')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <Textarea
                  placeholder={t('plannerAssistant.dataExplorerPlaceholder', 'e.g. Show overdue tasks by priority')}
                  value={plannerQueryText}
                  onChange={(e) => setPlannerQueryText(e.target.value)}
                  className="text-xs h-16 resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => loadPlannerData.mutate()}
                    disabled={loadPlannerData.isPending}
                  >
                    {loadPlannerData.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                    {t('plannerAssistant.loadDataset', 'Load dataset')}
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => queryPlannerData.mutate(plannerQueryText)}
                    disabled={!plannerQueryText.trim() || queryPlannerData.isPending}
                  >
                    {queryPlannerData.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                    {t('plannerAssistant.runQuery', 'Run query')}
                  </Button>
                </div>
                <div className="rounded-md border p-2 bg-muted/30 min-h-[100px] max-h-[150px] overflow-y-auto">
                  {renderPlannerResult()}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateTask}
        isSubmitting={createTaskMutation.isPending}
        t={t}
        priorityConfig={TASK_PRIORITY_CONFIG}
      />
    </div>
  );
}
