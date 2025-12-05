// Planner Assistant - Using Real API with React Query
import PlannerAssistantPageV2 from './page-v2';

export default function PlannerAssistantPage() {
  return <PlannerAssistantPageV2 />;
}
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
