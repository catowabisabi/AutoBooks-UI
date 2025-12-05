'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
} from '@/features/ai-assistants';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Task status configuration
const TASK_STATUS_CONFIG = {
  PENDING: { label: 'Pending', icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100' },
  IN_PROGRESS: { label: 'In Progress', icon: Play, color: 'text-blue-500', bg: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 text-green-800' },
  PAUSED: { label: 'Paused', icon: Pause, color: 'text-yellow-500', bg: 'bg-yellow-100 text-yellow-800' },
  CANCELLED: { label: 'Cancelled', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100 text-red-800' },
};

const TASK_PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  MEDIUM: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

const TASK_CATEGORIES = [
  'AUDIT', 'TAX', 'IPO', 'FINANCIAL_PR', 'COMPLIANCE', 'MEETING', 'REPORT', 'CLIENT', 'INTERNAL', 'OTHER'
];

// Task List Item Component
function TaskListItem({
  task,
  onToggleStatus,
  onDelete,
  onEdit,
}: {
  task: PlannerTask;
  onToggleStatus: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const statusConfig = TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG] || TASK_STATUS_CONFIG.PENDING;
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority as keyof typeof TASK_PRIORITY_CONFIG] || TASK_PRIORITY_CONFIG.MEDIUM;
  const StatusIcon = statusConfig.icon;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'COMPLETED';

  return (
    <div className={cn(
      "p-4 border rounded-lg hover:bg-muted/50 transition-colors",
      task.status === 'COMPLETED' && "opacity-60",
      isOverdue && "border-red-300 bg-red-50/50 dark:bg-red-950/20"
    )}>
      <div className="flex items-start gap-3">
        <button onClick={onToggleStatus} className="mt-1">
          <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "font-medium",
              task.status === 'COMPLETED' && "line-through text-muted-foreground"
            )}>
              {task.title}
            </span>
            <Badge className={priorityConfig.color} variant="secondary">
              {priorityConfig.label}
            </Badge>
            {task.category && (
              <Badge variant="outline" className="text-xs">{task.category}</Badge>
            )}
            {task.ai_generated && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Sparkles className="h-3 w-3" />
                AI
              </Badge>
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
            {task.estimated_hours && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.estimated_hours}h estimated
              </div>
            )}
            {task.ai_priority_score && (
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3 text-purple-500" />
                Score: {task.ai_priority_score}
              </div>
            )}
          </div>
          
          {task.progress !== undefined && task.progress > 0 && task.status !== 'COMPLETED' && (
            <div className="mt-2 flex items-center gap-2">
              <Progress value={task.progress} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground">{task.progress}%</span>
            </div>
          )}
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Partial<PlannerTask>) => void;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [category, setCategory] = useState<string>('OTHER');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title,
      description,
      priority,
      category,
      due_date: dueDate || undefined,
      estimated_hours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      status: 'PENDING',
    });
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setCategory('OTHER');
    setDueDate('');
    setEstimatedHours('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your planner. Set priorities and due dates.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Task description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
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
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="estimated">Estimated Hours</Label>
              <Input
                id="estimated"
                type="number"
                placeholder="Hours"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Task
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
                className="w-1 h-full rounded-full"
                style={{ backgroundColor: event.color || '#6366f1' }}
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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'ai_score'>('due_date');
  
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

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
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    urgent: tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length,
    overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'COMPLETED').length,
  }), [tasks]);

  // Handlers
  const handleCreateTask = (taskData: Partial<PlannerTask>) => {
    createTaskMutation.mutate(taskData as Omit<PlannerTask, 'id'>, {
      onSuccess: () => {
        setCreateDialogOpen(false);
        toast({ title: 'Task created successfully' });
      },
    });
  };

  const handleToggleStatus = (task: PlannerTask) => {
    const statusOrder = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    if (nextStatus === 'COMPLETED') {
      completeTaskMutation.mutate(task.id);
    } else {
      updateTaskMutation.mutate({ id: task.id, data: { status: nextStatus } });
    }
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTaskMutation.mutate(taskId, {
      onSuccess: () => toast({ title: 'Task deleted' }),
    });
  };

  const handleAIPrioritize = () => {
    aiPrioritizeMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast({ title: 'AI prioritization complete', description: data.message });
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'assistant',
          content: `I've analyzed your tasks and updated their AI priority scores. ${data.message || 'Tasks are now sorted by optimal priority.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      },
    });
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
      const taskContext = tasks.slice(0, 10).map(t =>
        `- ${t.title} (${t.priority}, ${t.status}, due: ${t.due_date || 'no date'})`
      ).join('\n');

      const systemPrompt = `You are a professional planner assistant for WiseMatic ERP, an accounting and audit firm platform. Help users manage tasks, set priorities, and plan their work. Current tasks:\n${taskContext}\n\nProvide helpful, concise advice about task management, scheduling, and prioritization.`;

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

  return (
    <div className="flex flex-1 flex-col p-6 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planner Assistant</h1>
          <p className="text-muted-foreground">Organize your work and manage deadlines efficiently</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Target className="h-3 w-3" />
            {stats.total - stats.completed} Active
          </Badge>
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {stats.urgent} Urgent
          </Badge>
          {stats.overdue > 0 && (
            <Badge variant="destructive" className="gap-1">
              <Clock className="h-3 w-3" />
              {stats.overdue} Overdue
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round((stats.completed / (stats.total || 1)) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <Card className="lg:col-span-2 h-[600px] flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Tasks
                </CardTitle>
                <CardDescription>Your upcoming tasks and deadlines</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAIPrioritize}
                  disabled={aiPrioritizeMutation.isPending}
                >
                  {aiPrioritizeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1 text-purple-500" />
                  )}
                  AI Prioritize
                </Button>
                <Button variant="outline" size="icon" onClick={() => refetchTasks()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-2 mt-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] h-8">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  {Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priority</SelectItem>
                  {Object.entries(TASK_PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[140px] h-8">
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due_date">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="ai_score">AI Score</SelectItem>
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
                      <p>No tasks found</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create Task
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
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Right Sidebar: Events + AI Chat */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EventsSidebar events={events} isLoading={eventsLoading} />
            </CardContent>
          </Card>

          {/* AI Chat */}
          <Card className="h-[350px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-3">
              <ScrollArea className="flex-1">
                <div className="space-y-3 pr-2">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={cn(
                        "max-w-[90%] rounded-lg p-2.5 text-sm",
                        message.type === 'user'
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "mr-auto bg-muted"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <span className="text-xs opacity-60 block mt-1">{message.timestamp}</span>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="mr-auto bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Input
                  placeholder="Ask for help..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={chatLoading}
                  className="h-8 text-sm"
                />
                <Button 
                  size="sm" 
                  onClick={handleSendMessage} 
                  disabled={chatLoading || !newMessage.trim()}
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateTask}
        isSubmitting={createTaskMutation.isPending}
      />
    </div>
  );
}
