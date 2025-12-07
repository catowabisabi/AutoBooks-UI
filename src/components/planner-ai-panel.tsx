'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles,
  Loader2,
  Send,
  ListPlus,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronUp,
  Brain,
  Lightbulb,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wand2,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { plannerApi } from '@/features/ai-assistants/services';
import { useAICreateTask, useAIReprioritize } from '@/features/ai-assistants/hooks';
import { useToast } from '@/hooks/use-toast';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  data?: any;
  timestamp: Date;
}

interface PlannerAIPanelProps {
  onTasksCreated?: (count: number) => void;
  onReprioritized?: (count: number) => void;
  className?: string;
}

export function PlannerAIPanel({ 
  onTasksCreated, 
  onReprioritized,
  className 
}: PlannerAIPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'create' | 'prioritize' | 'schedule' | 'query'>('create');
  const [inputText, setInputText] = useState('');
  const [queryText, setQueryText] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  
  // AI Create options
  const [autoPrioritize, setAutoPrioritize] = useState(true);
  const [autoSchedule, setAutoSchedule] = useState(true);
  
  // AI Reprioritize options
  const [considerDeadlines, setConsiderDeadlines] = useState(true);
  const [considerDependencies, setConsiderDependencies] = useState(true);
  
  // Messages for AI assistant
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'system',
      content: '👋 Welcome to Planner AI! I can help you:\n• Create tasks from notes or emails\n• Prioritize your workload intelligently\n• Suggest optimal schedules\n• Answer questions about your tasks',
      timestamp: new Date(),
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mutations
  const aiCreateMutation = useAICreateTask();
  const aiReprioritizeMutation = useAIReprioritize();
  
  const loadDatasetMutation = useMutation({
    mutationFn: () => plannerApi.start(),
    onSuccess: () => {
      toast({ title: 'Dataset loaded', description: 'Planner data is ready for queries.' });
      addMessage('system', '✅ Dataset loaded successfully. You can now ask questions about your planner data.');
    },
    onError: () => {
      toast({ title: 'Load failed', variant: 'destructive' });
    },
  });
  
  const queryDataMutation = useMutation({
    mutationFn: (query: string) => plannerApi.query(query),
    onSuccess: (data: any) => {
      setQueryResult(data);
      if (data?.type === 'table') {
        addMessage('assistant', `Found ${data.data?.length || 0} results for your query.`, data);
      } else if (data?.type === 'error' || data?.type === 'invalid') {
        addMessage('assistant', data.message || 'Unable to process that query.');
      } else {
        addMessage('assistant', 'Query completed.', data);
      }
    },
    onError: () => {
      addMessage('assistant', 'Sorry, there was an error processing your query.');
    },
  });
  
  const scheduleMutation = useMutation({
    mutationFn: (hours?: number) => plannerApi.aiSchedule({ available_hours_per_day: hours }),
    onSuccess: (data: any) => {
      addMessage('assistant', `📅 Schedule suggestion created with ${data.schedule?.length || 0} days planned.`, data);
      if (data.warnings?.length > 0) {
        addMessage('system', `⚠️ Warnings:\n${data.warnings.join('\n')}`);
      }
    },
    onError: () => {
      addMessage('assistant', 'Failed to generate schedule suggestion.');
    },
  });
  
  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const addMessage = (type: AIMessage['type'], content: string, data?: any) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type,
      content,
      data,
      timestamp: new Date(),
    }]);
  };
  
  // Handle AI Create Tasks
  const handleCreateTasks = async () => {
    if (!inputText.trim()) return;
    
    addMessage('user', inputText);
    setInputText('');
    
    try {
      const result = await aiCreateMutation.mutateAsync({
        input_text: inputText,
        auto_prioritize: autoPrioritize,
        auto_schedule: autoSchedule,
      });
      
      const taskCount = result.tasks_created || result.tasks?.length || 0;
      addMessage('assistant', `✅ Created ${taskCount} task(s):\n${result.summary || ''}`, result);
      
      onTasksCreated?.(taskCount);
      toast({ title: `${taskCount} task(s) created`, description: result.summary });
    } catch (error) {
      addMessage('assistant', '❌ Failed to create tasks. Please try again.');
      toast({ title: 'Failed to create tasks', variant: 'destructive' });
    }
  };
  
  // Handle AI Reprioritize
  const handleReprioritize = async () => {
    addMessage('user', 'Please reprioritize my tasks.');
    
    try {
      const result = await aiReprioritizeMutation.mutateAsync({
        consider_deadlines: considerDeadlines,
        consider_dependencies: considerDependencies,
      });
      
      const updateCount = result.tasks_updated || 0;
      let responseMsg = `✅ Reprioritized ${updateCount} task(s).\n${result.message || ''}`;
      
      if (result.recommendations && result.recommendations.length > 0) {
        responseMsg += '\n\n💡 Recommendations:\n• ' + result.recommendations.join('\n• ');
      }
      
      addMessage('assistant', responseMsg, result);
      onReprioritized?.(updateCount);
      toast({ title: 'Tasks reprioritized', description: result.message });
    } catch (error) {
      addMessage('assistant', '❌ Failed to reprioritize. Please try again.');
      toast({ title: 'Reprioritization failed', variant: 'destructive' });
    }
  };
  
  // Handle Schedule Generation
  const handleGenerateSchedule = async () => {
    addMessage('user', 'Generate an optimal schedule for my tasks.');
    await scheduleMutation.mutateAsync(8);
  };
  
  // Handle Data Query
  const handleQuery = async () => {
    if (!queryText.trim()) return;
    
    addMessage('user', queryText);
    const query = queryText;
    setQueryText('');
    
    await queryDataMutation.mutateAsync(query);
  };
  
  const isLoading = aiCreateMutation.isPending || aiReprioritizeMutation.isPending || 
                    scheduleMutation.isPending || queryDataMutation.isPending || 
                    loadDatasetMutation.isPending;
  
  const renderQueryResult = () => {
    if (!queryResult) return null;
    
    if (queryResult.type === 'table' && Array.isArray(queryResult.data) && queryResult.data.length > 0) {
      const columns = Object.keys(queryResult.data[0]).slice(0, 5);
      const rows = queryResult.data.slice(0, 8);
      
      return (
        <div className="mt-2 overflow-auto border rounded-md">
          <table className="min-w-full text-xs">
            <thead className="bg-muted">
              <tr>
                {columns.map(col => (
                  <th key={col} className="px-2 py-1 text-left font-medium">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, idx: number) => (
                <tr key={idx} className="border-t">
                  {columns.map(col => (
                    <td key={col} className="px-2 py-1 whitespace-nowrap">{String(row[col] ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {queryResult.data.length > rows.length && (
            <p className="p-2 text-xs text-muted-foreground">
              Showing {rows.length} of {queryResult.data.length} rows
            </p>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className={cn("border-purple-200 dark:border-purple-900 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer py-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    Planner AI Assistant
                    <Badge variant="secondary" className="text-xs">Beta</Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Create tasks, prioritize intelligently, and get scheduling suggestions
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-purple-500" />}
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="create" className="text-xs gap-1">
                  <ListPlus className="h-3 w-3" />
                  Create
                </TabsTrigger>
                <TabsTrigger value="prioritize" className="text-xs gap-1">
                  <Sparkles className="h-3 w-3" />
                  Prioritize
                </TabsTrigger>
                <TabsTrigger value="schedule" className="text-xs gap-1">
                  <Calendar className="h-3 w-3" />
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="query" className="text-xs gap-1">
                  <FileText className="h-3 w-3" />
                  Query
                </TabsTrigger>
              </TabsList>
              
              {/* AI Create Tab */}
              <TabsContent value="create" className="space-y-3 mt-0">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Paste notes, emails, or describe tasks. AI will extract and create structured tasks.
                  </Label>
                  <Textarea
                    placeholder="例如: 下週一前完成審計報告，週三要開客戶會議，記得跟進稅務文件..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="auto-prioritize"
                      checked={autoPrioritize}
                      onCheckedChange={setAutoPrioritize}
                    />
                    <Label htmlFor="auto-prioritize" className="text-xs">Auto-prioritize</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="auto-schedule"
                      checked={autoSchedule}
                      onCheckedChange={setAutoSchedule}
                    />
                    <Label htmlFor="auto-schedule" className="text-xs">Auto-schedule</Label>
                  </div>
                </div>
                
                <Button 
                  onClick={handleCreateTasks}
                  disabled={!inputText.trim() || aiCreateMutation.isPending}
                  className="w-full"
                  size="sm"
                >
                  {aiCreateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  Create Tasks with AI
                </Button>
              </TabsContent>
              
              {/* AI Prioritize Tab */}
              <TabsContent value="prioritize" className="space-y-3 mt-0">
                <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      AI will analyze all your active tasks and recalculate priority scores based on deadlines, 
                      importance, and workload balance.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="consider-deadlines"
                      checked={considerDeadlines}
                      onCheckedChange={setConsiderDeadlines}
                    />
                    <Label htmlFor="consider-deadlines" className="text-xs">Consider deadlines (overdue = higher priority)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="consider-dependencies"
                      checked={considerDependencies}
                      onCheckedChange={setConsiderDependencies}
                    />
                    <Label htmlFor="consider-dependencies" className="text-xs">Consider task dependencies</Label>
                  </div>
                </div>
                
                <Button 
                  onClick={handleReprioritize}
                  disabled={aiReprioritizeMutation.isPending}
                  className="w-full"
                  size="sm"
                  variant="secondary"
                >
                  {aiReprioritizeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                  )}
                  AI Reprioritize All Tasks
                </Button>
              </TabsContent>
              
              {/* AI Schedule Tab */}
              <TabsContent value="schedule" className="space-y-3 mt-0">
                <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      AI will suggest an optimal daily schedule for your tasks, considering due dates, 
                      priorities, and available working hours.
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateSchedule}
                  disabled={scheduleMutation.isPending}
                  className="w-full"
                  size="sm"
                  variant="outline"
                >
                  {scheduleMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-2" />
                  )}
                  Generate Schedule Suggestion
                </Button>
              </TabsContent>
              
              {/* Data Query Tab */}
              <TabsContent value="query" className="space-y-3 mt-0">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => loadDatasetMutation.mutate()}
                    disabled={loadDatasetMutation.isPending}
                  >
                    {loadDatasetMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    Load Dataset
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Textarea
                    placeholder="Ask a question about your planner data, e.g., 'Show all high priority tasks' or 'Plot tasks by status'"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    className="min-h-[60px] text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleQuery();
                      }
                    }}
                  />
                </div>
                
                <Button 
                  onClick={handleQuery}
                  disabled={!queryText.trim() || queryDataMutation.isPending}
                  className="w-full"
                  size="sm"
                >
                  {queryDataMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Run Query
                </Button>
                
                {renderQueryResult()}
              </TabsContent>
            </Tabs>
            
            {/* Messages History */}
            {messages.length > 1 && (
              <>
                <Separator className="my-3" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">AI Activity Log</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs"
                      onClick={() => setMessages([messages[0]])}
                    >
                      Clear
                    </Button>
                  </div>
                  <ScrollArea className="h-[120px] rounded-md border p-2">
                    <div className="space-y-2">
                      {messages.slice(1).map((msg) => (
                        <div 
                          key={msg.id}
                          className={cn(
                            "text-xs p-2 rounded",
                            msg.type === 'user' && "bg-primary/10 ml-4",
                            msg.type === 'assistant' && "bg-muted mr-4",
                            msg.type === 'system' && "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-200"
                          )}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <span className="text-[10px] opacity-50 mt-1 block">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default PlannerAIPanel;
