'use client';

import { useState, useRef, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconShare, IconSend } from '@tabler/icons-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { sendAnalystQuery, startAnalystAssistant } from './services';

import DashboardSidebar from './_components/DashboardSidebar';
import DashboardGrid from './_components/DashboardGrid';
import ChatMessage from './_components/ChatMessage';
import ChatToggleButton from './_components/ChatToggleButton';

// Types
type WidgetType = 'text' | 'bar' | 'area' | 'pie';
type MessageRole = 'user' | 'assistant';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  chart?: {
    type: WidgetType;
    title: string;
    description: string;
    data?: any[];
    xKey?: string;
    yKey?: string;
    labelKey?: string;
    valueKey?: string;
  };
}

interface WidgetData {
  id: string;
  dashboardId: string;
  type: WidgetType;
  title: string;
  description: string;
  size: { width: number; height: number };
  content?: string;
  data?: any[];
  xKey?: string;
  yKey?: string;
  labelKey?: string;
  valueKey?: string;
}

// Mock data for dashboards
const initialDashboards = [
  { id: 'sales', name: 'Sales' },
  { id: 'finance', name: 'Finance' },
  { id: 'custom', name: 'Custom Dashboard' }
];

// Mock data for widgets
const initialWidgets: WidgetData[] = [
  {
    id: 'widget-1',
    dashboardId: 'sales',
    type: 'bar',
    title: 'Monthly Sales',
    description: 'Sales performance by month',
    size: { width: 2, height: 1 }
  },
  {
    id: 'widget-2',
    dashboardId: 'sales',
    type: 'area',
    title: 'Revenue Trend',
    description: 'Revenue over time',
    size: { width: 2, height: 1 }
  }
];

// Mock chat messages
const initialMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Show me the sales trend for the last quarter'
  },
  {
    id: '2',
    role: 'assistant',
    content: "Here's the sales trend for the last quarter:",
    chart: {
      type: 'area',
      title: 'Quarterly Sales Trend',
      description: 'Sales performance over the last quarter'
    }
  },
  {
    id: '3',
    role: 'user',
    content: 'What were our top selling products?'
  },
  {
    id: '4',
    role: 'assistant',
    content: 'Here are your top selling products:',
    chart: {
      type: 'bar',
      title: 'Top Selling Products',
      description: 'Products with highest sales volume'
    }
  }
];

export default function AnalystAssistantPage() {
  const [dashboards, setDashboards] = useState(initialDashboards);
  const [widgets, setWidgets] = useState(initialWidgets);
  const [messages, setMessages] = useState(initialMessages);
  const [currentDashboard, setCurrentDashboard] = useState('sales');
  const [newMessage, setNewMessage] = useState('');
  const [activeWidget, setActiveWidget] = useState<WidgetData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const startAssistant = async () => {
      try {
        const data = await startAnalystAssistant();
        console.log('Assistant started:', data);
      } catch (error) {
        console.error('Failed to start assistant:', error);
      }
    };

    startAssistant();
  }, []);

  // Filter widgets for the current dashboard
  const currentWidgets = widgets.filter(
    (widget) => widget.dashboardId === currentDashboard
  );
  currentWidgets.map((widget) => widget.id);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: newMessage
    };

    setMessages([...messages, userMessage]);
    setNewMessage('');

    try {
      // Call the API with the user's query
      const response = await sendAnalystQuery({ query: newMessage });

      // Create AI response message with the data from the API
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content:
          response.message || `Here's some information about "${newMessage}":`,
        chart:
          response.type !== 'invalid' && response.type !== 'text'
            ? {
                type: response.type as WidgetType,
                title: response.title || `Analysis of ${newMessage}`,
                description: 'Generated based on your query',
                data: response.data,
                xKey: response.xKey,
                yKey: response.yKey,
                labelKey: response.labelKey,
                valueKey: response.valueKey
              }
            : undefined
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      // Handle error
      console.error('Error getting response from analyst assistant:', error);

      // Add error message
      const errorResponse: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          'Sorry, I encountered an error processing your request. Please try again.'
      };

      setMessages((prev) => [...prev, errorResponse]);
    }
  };

  // Handle adding a chart to the dashboard
  const handleAddToDashboard = (
    chart:
      | {
          type: WidgetType;
          title: string;
          description: string;
          data?: any[];
          xKey?: string;
          yKey?: string;
          labelKey?: string;
          valueKey?: string;
        }
      | undefined
  ) => {
    if (!chart) return;

    const newWidget: WidgetData = {
      id: `widget-${Date.now()}`,
      dashboardId: currentDashboard,
      type: chart.type,
      title: chart.title,
      description: chart.description,
      size: { width: 2, height: 1 },
      data: chart.data,
      xKey: chart.xKey,
      yKey: chart.yKey,
      labelKey: chart.labelKey,
      valueKey: chart.valueKey
    };

    setWidgets([...widgets, newWidget]);
  };

  // Handle deleting a widget
  const handleDeleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter((widget) => widget.id !== widgetId));
  };

  // Handle creating a new dashboard
  const handleCreateDashboard = () => {
    const newDashboard = {
      id: `dashboard-${Date.now()}`,
      name: `New Dashboard ${dashboards.length + 1}`
    };

    setDashboards([...dashboards, newDashboard]);
    setCurrentDashboard(newDashboard.id);
  };

  function handleDragStart(event: DragStartEvent) {
    if (!event.active.data.current) return;

    const { widget } = event.active.data.current;
    if (widget) {
      setActiveWidget(widget);
    }
  }

  // Handle drag end
  function handleDragEnd(event: DragEndEvent) {
    setActiveWidget(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setWidgets((widgets) => {
      const oldIndex = widgets.findIndex((w) => w.id === activeId);
      const newIndex = widgets.findIndex((w) => w.id === overId);

      return arrayMove(widgets, oldIndex, newIndex);
    });
  }

  return (
    <PageContainer>
      <div className='flex h-[calc(100vh-10rem)] w-full'>
        {/* Dashboard List Sidebar */}
        <DashboardSidebar
          dashboards={dashboards}
          currentDashboard={currentDashboard}
          onDashboardSelect={setCurrentDashboard}
          onCreateDashboard={handleCreateDashboard}
          onRenameDashboard={(id, newName) => {
            setDashboards(
              dashboards.map((d) => (d.id === id ? { ...d, name: newName } : d))
            );
          }}
        />

        {/* Main Dashboard Area */}
        <div className='flex flex-1 flex-col overflow-hidden'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-2xl font-bold tracking-tight'>
              {dashboards.find((d) => d.id === currentDashboard)?.name ||
                'Dashboard'}
            </h2>
            <div className='flex items-center space-x-2'>
              <Button variant='outline'>
                <IconShare className='mr-2 h-4 w-4' />
                Share
              </Button>
            </div>
          </div>

          {/* Current Dashboard Content */}
          <div className='flex-1 overflow-auto'>
            <DashboardGrid
              widgets={currentWidgets}
              onDelete={handleDeleteWidget}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              activeWidget={activeWidget}
            />
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <ChatToggleButton onClick={() => setIsChatOpen(true)} />

      {/* Chat Panel (Sheet) */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent
          side='right'
          className='flex h-full w-[400px] flex-col p-0 sm:w-[540px]'
        >
          <SheetHeader className='border-border shrink-0 border-b p-4'>
            <SheetTitle>AI Assistant</SheetTitle>
            <SheetDescription>Ask questions about your data</SheetDescription>
          </SheetHeader>

          <ScrollArea className='flex-1 overflow-auto p-4'>
            <div className='flex flex-col'>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onAddToDashboard={handleAddToDashboard}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className='border-border mt-auto shrink-0 border-t p-4'>
            <div className='flex gap-2'>
              <Input
                placeholder='Ask a question...'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} size='icon'>
                <IconSend className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
