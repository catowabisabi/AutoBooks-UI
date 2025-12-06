'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  IconBrain, 
  IconSparkles, 
  IconClock, 
  IconAlertTriangle,
  IconArrowUp,
  IconArrowDown,
  IconRefresh
} from '@tabler/icons-react';
import { useTaskStore, Task } from '../utils/store';

interface AIInsight {
  type: 'priority' | 'bottleneck' | 'estimation' | 'workload';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  action?: string;
}

export function KanbanAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  
  const tasks = useTaskStore((state) => state.tasks);
  const columns = useTaskStore((state) => state.columns);
  const setTasks = useTaskStore((state) => state.setTasks);

  const analyzeBoard = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const todoTasks = tasks.filter(t => t.status === 'TODO');
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
    const doneTasks = tasks.filter(t => t.status === 'DONE');
    
    const newInsights: AIInsight[] = [];
    
    // Check for bottlenecks
    if (inProgressTasks.length > 5) {
      newInsights.push({
        type: 'bottleneck',
        title: 'Work in Progress Overload',
        description: `You have ${inProgressTasks.length} tasks in progress. Consider completing some before starting new ones.`,
        severity: 'warning',
        action: 'Focus on completing current tasks'
      });
    }
    
    // Check for empty TODO
    if (todoTasks.length === 0 && inProgressTasks.length > 0) {
      newInsights.push({
        type: 'workload',
        title: 'Backlog Empty',
        description: 'Your TODO column is empty. Consider planning ahead to avoid idle time.',
        severity: 'info'
      });
    }
    
    // Check for stale tasks (simulated)
    if (inProgressTasks.length > 3) {
      newInsights.push({
        type: 'bottleneck',
        title: 'Potential Stale Tasks',
        description: 'Some tasks may have been in progress too long. Review and update their status.',
        severity: 'warning',
        action: 'Review in-progress tasks'
      });
    }
    
    // Priority suggestions
    if (todoTasks.length > 3) {
      newInsights.push({
        type: 'priority',
        title: 'Priority Recommendation',
        description: 'Consider prioritizing tasks based on dependencies and deadlines.',
        severity: 'info',
        action: 'Auto-prioritize tasks'
      });
    }
    
    // Estimation insights
    newInsights.push({
      type: 'estimation',
      title: 'Sprint Progress',
      description: `${doneTasks.length} of ${tasks.length} tasks completed (${Math.round((doneTasks.length / Math.max(tasks.length, 1)) * 100)}%)`,
      severity: doneTasks.length >= tasks.length * 0.7 ? 'info' : 'warning'
    });
    
    // Add a positive insight if doing well
    if (doneTasks.length > inProgressTasks.length && doneTasks.length > 0) {
      newInsights.push({
        type: 'workload',
        title: 'Great Progress! 🎉',
        description: 'You\'re making excellent progress. Keep up the good work!',
        severity: 'info'
      });
    }
    
    setInsights(newInsights);
    setIsAnalyzing(false);
  };

  const smartPrioritize = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple prioritization: sort TODO tasks alphabetically as demo
    const todoTasks = tasks.filter(t => t.status === 'TODO');
    const otherTasks = tasks.filter(t => t.status !== 'TODO');
    
    const sortedTodo = [...todoTasks].sort((a, b) => a.title.localeCompare(b.title));
    
    setTasks([...sortedTodo, ...otherTasks]);
    setIsAnalyzing(false);
    
    setInsights(prev => [...prev, {
      type: 'priority',
      title: 'Tasks Prioritized',
      description: 'TODO tasks have been reordered based on AI analysis.',
      severity: 'info'
    }]);
  };

  const getSeverityColor = (severity: AIInsight['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'priority': return <IconArrowUp className="h-4 w-4" />;
      case 'bottleneck': return <IconAlertTriangle className="h-4 w-4" />;
      case 'estimation': return <IconClock className="h-4 w-4" />;
      case 'workload': return <IconSparkles className="h-4 w-4" />;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <IconBrain className="h-4 w-4" />
          AI Assistant
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <IconBrain className="h-5 w-5" />
            Kanban AI Assistant
          </SheetTitle>
          <SheetDescription>
            Get AI-powered insights and suggestions for your board
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={analyzeBoard} 
              disabled={isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <IconRefresh className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <IconSparkles className="h-4 w-4 mr-2" />
              )}
              Analyze Board
            </Button>
            <Button 
              onClick={smartPrioritize} 
              disabled={isAnalyzing}
              variant="outline"
              className="flex-1"
            >
              <IconArrowUp className="h-4 w-4 mr-2" />
              Smart Prioritize
            </Button>
          </div>
          
          {/* Board Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Board Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Tasks</span>
                <Badge variant="outline">{tasks.length}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Todo</span>
                <Badge variant="secondary">{tasks.filter(t => t.status === 'TODO').length}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>In Progress</span>
                <Badge variant="default">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Done</span>
                <Badge className="bg-green-500">{tasks.filter(t => t.status === 'DONE').length}</Badge>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion</span>
                  <span>{Math.round((tasks.filter(t => t.status === 'DONE').length / Math.max(tasks.length, 1)) * 100)}%</span>
                </div>
                <Progress 
                  value={(tasks.filter(t => t.status === 'DONE').length / Math.max(tasks.length, 1)) * 100} 
                />
              </div>
            </CardContent>
          </Card>
          
          {/* AI Insights */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">AI Insights</h4>
            <ScrollArea className="h-[300px]">
              {insights.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <IconBrain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click "Analyze Board" to get AI insights</p>
                </div>
              ) : (
                <div className="space-y-2 pr-4">
                  {insights.map((insight, idx) => (
                    <Card key={idx} className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getTypeIcon(insight.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{insight.title}</span>
                            <Badge variant={getSeverityColor(insight.severity)} className="text-xs">
                              {insight.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{insight.description}</p>
                          {insight.action && (
                            <Button size="sm" variant="link" className="h-auto p-0 text-xs">
                              {insight.action} →
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
