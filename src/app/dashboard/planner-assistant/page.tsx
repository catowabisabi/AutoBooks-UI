'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, Target, CheckCircle2, Circle, AlertCircle, Send, Plus, Trash2 } from 'lucide-react';
import { aiApi } from '@/lib/api';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  category: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function PlannerAssistantPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete Annual Audit Report',
      description: 'Finalize the FY2024 audit report for Tech Solutions Ltd.',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2024-06-30',
      category: 'Audit'
    },
    {
      id: '2',
      title: 'Tax Filing Preparation',
      description: 'Prepare profit tax returns for Q2 clients',
      priority: 'high',
      status: 'pending',
      dueDate: '2024-07-15',
      category: 'Tax'
    },
    {
      id: '3',
      title: 'IPO Due Diligence Review',
      description: 'Review financial statements for Asia Pacific Holdings IPO',
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-07-20',
      category: 'IPO'
    },
    {
      id: '4',
      title: 'Client Meeting - Green Energy Corp',
      description: 'Discuss quarterly compliance review findings',
      priority: 'medium',
      status: 'completed',
      dueDate: '2024-06-25',
      category: 'Meeting'
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your Planner Assistant. I can help you organize your tasks, set priorities, and plan your work schedule. You have 4 tasks this week - 2 are high priority. Would you like me to help you prioritize or schedule these?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // Create context about current tasks
      const taskContext = tasks.map(t => 
        `- ${t.title} (${t.priority} priority, ${t.status}, due: ${t.dueDate})`
      ).join('\n');

      const systemPrompt = `You are a professional planner assistant for an accounting and audit firm. Help users manage their tasks, set priorities, and plan their work. Current tasks:\n${taskContext}\n\nProvide helpful, concise advice about task management, scheduling, and prioritization.`;

      const conversationHistory = messages.slice(-5).map(m => ({
        role: m.type === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content
      }));
      conversationHistory.push({ role: 'user', content: newMessage });

      const response = await aiApi.chatWithHistory(
        conversationHistory,
        'openai',
        { systemPrompt }
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content || 'I can help you organize your tasks. What would you like to do?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Based on your current workload, I recommend focusing on the high-priority audit report first, followed by tax preparation. Would you like me to help break these down into smaller steps?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const statusOrder: Task['status'][] = ['pending', 'in-progress', 'completed'];
        const currentIndex = statusOrder.indexOf(task.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        return { ...task, status: nextStatus };
      }
      return task;
    }));
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: '',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'Task'
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className='h-4 w-4 text-green-500' />;
      case 'in-progress': return <Clock className='h-4 w-4 text-blue-500' />;
      default: return <Circle className='h-4 w-4 text-gray-400' />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  return (
    <div className='flex flex-1 flex-col p-6 gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Planner Assistant</h1>
          <p className='text-muted-foreground'>Organize your work and manage deadlines efficiently</p>
        </div>
        <div className='flex gap-2'>
          <Badge variant='outline' className='gap-1'>
            <Target className='h-3 w-3' />
            {tasks.filter(t => t.status !== 'completed').length} Active
          </Badge>
          <Badge variant='outline' className='gap-1'>
            <AlertCircle className='h-3 w-3' />
            {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length} High Priority
          </Badge>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Task List */}
        <Card className='h-[600px] flex flex-col'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              Tasks
            </CardTitle>
            <CardDescription>Your upcoming tasks and deadlines</CardDescription>
            <div className='flex gap-2 mt-2'>
              <Input 
                placeholder='Add new task...' 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                className='flex-1'
              />
              <Button size='icon' onClick={addTask}>
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          </CardHeader>
          <CardContent className='flex-1 overflow-hidden'>
            <ScrollArea className='h-full pr-4'>
              <div className='space-y-3'>
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    className='p-3 border rounded-lg hover:bg-muted/50 transition-colors'
                  >
                    <div className='flex items-start gap-3'>
                      <button onClick={() => toggleTaskStatus(task.id)} className='mt-1'>
                        {getStatusIcon(task.status)}
                      </button>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <span className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </span>
                          <Badge className={getPriorityColor(task.priority)} variant='secondary'>
                            {task.priority}
                          </Badge>
                          <Badge variant='outline'>{task.category}</Badge>
                        </div>
                        {task.description && (
                          <p className='text-sm text-muted-foreground mt-1'>{task.description}</p>
                        )}
                        <div className='flex items-center gap-2 mt-2 text-xs text-muted-foreground'>
                          <Calendar className='h-3 w-3' />
                          Due: {task.dueDate}
                        </div>
                      </div>
                      <Button variant='ghost' size='icon' onClick={() => deleteTask(task.id)}>
                        <Trash2 className='h-4 w-4 text-muted-foreground' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* AI Chat */}
        <Card className='h-[600px] flex flex-col'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2'>
              <Target className='h-5 w-5' />
              AI Planning Assistant
            </CardTitle>
            <CardDescription>Get help with scheduling and prioritization</CardDescription>
          </CardHeader>
          <CardContent className='flex-1 flex flex-col overflow-hidden'>
            <ScrollArea className='flex-1 pr-4'>
              <div className='space-y-4'>
                {messages.map(message => (
                  <div 
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className='text-sm whitespace-pre-wrap'>{message.content}</p>
                      <span className='text-xs opacity-70 mt-1 block'>{message.timestamp}</span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className='flex justify-start'>
                    <div className='bg-muted rounded-lg p-3'>
                      <div className='flex gap-1'>
                        <span className='animate-bounce'>●</span>
                        <span className='animate-bounce delay-100'>●</span>
                        <span className='animate-bounce delay-200'>●</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className='flex gap-2 mt-4 pt-4 border-t'>
              <Input
                placeholder='Ask for planning help...'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                disabled={isLoading}
                className='flex-1'
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !newMessage.trim()}>
                <Send className='h-4 w-4' />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
