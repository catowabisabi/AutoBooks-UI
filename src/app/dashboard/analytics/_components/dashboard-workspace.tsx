// // _components/dashboard-workspace.tsx
// 'use client';
//
// import { useState, useRef, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { IconShare, IconSend } from '@tabler/icons-react';
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetDescription
// } from '@/components/ui/sheet';
// import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
// import { arrayMove } from '@dnd-kit/sortable';
// import { sendAnalystQuery, RechartsResponse } from '../services';
//
// import DashboardGrid from './dashboard-grid';
// import ChatMessage from './chat-message';
// import ChatToggleButton from './chat-toggle-button';
//
// // Types
// type WidgetType = 'text' | 'bar' | 'area' | 'pie';
// type MessageRole = 'user' | 'assistant';
//
// interface Message {
//   id: string;
//   role: MessageRole;
//   content: string;
//   chart?: {
//     type: WidgetType;
//     title: string;
//     description: string;
//     data?: any[];
//     xKey?: string;
//     yKey?: string;
//     labelKey?: string;
//     valueKey?: string;
//   };
// }
//
// interface WidgetData {
//   id: string;
//   dashboardId: string;
//   type: WidgetType;
//   title: string;
//   description: string;
//   size: { width: number; height: number };
//   content?: string;
//   data?: any[];
//   xKey?: string;
//   yKey?: string;
//   labelKey?: string;
//   valueKey?: string;
// }
//
// // Mock data for dashboards
// const initialDashboards = [
//   { id: 'sales', name: 'Sales' },
//   { id: 'finance', name: 'Finance' },
//   { id: 'custom', name: 'Custom Dashboard' }
// ];
//
// // Mock data for widgets
// const initialWidgets: WidgetData[] = [
//   {
//     id: 'widget-1',
//     dashboardId: 'sales',
//     type: 'bar',
//     title: 'Monthly Sales',
//     description: 'Sales performance by month',
//     size: { width: 2, height: 1 }
//   },
//   {
//     id: 'widget-2',
//     dashboardId: 'sales',
//     type: 'area',
//     title: 'Revenue Trend',
//     description: 'Revenue over time',
//     size: { width: 2, height: 1 }
//   }
// ];
//
// // Mock chat messages
// const initialMessages: Message[] = [
//   {
//     id: '1',
//     role: 'user',
//     content: 'Show me the sales trend for the last quarter'
//   },
//   {
//     id: '2',
//     role: 'assistant',
//     content: "Here's the sales trend for the last quarter:",
//     chart: {
//       type: 'area',
//       title: 'Quarterly Sales Trend',
//       description: 'Sales performance over the last quarter'
//     }
//   }
// ];
//
// export default function DashboardWorkspace({
//   dashboardId
// }: {
//   dashboardId: string;
// }) {
//   const [dashboards, setDashboards] = useState(initialDashboards);
//   const [widgets, setWidgets] = useState(initialWidgets);
//   const [messages, setMessages] = useState(initialMessages);
//   const [currentDashboard, setCurrentDashboard] = useState(
//     dashboardId || 'sales'
//   );
//   const [newMessage, setNewMessage] = useState('');
//   const [activeWidget, setActiveWidget] = useState<WidgetData | null>(null);
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement | null>(null);
//
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);
//
//   useEffect(() => {
//     const startAssistant = async () => {
//       try {
//         const res = await fetch('http://127.0.0.1:8000/start');
//         const data = await res.json();
//         console.log('Assistant started:', data);
//       } catch (error) {
//         console.error('Failed to start assistant:', error);
//       }
//     };
//
//     startAssistant();
//   }, []);
//
//   // Filter widgets for the current dashboard
//   const currentWidgets = widgets.filter(
//     (widget) => widget.dashboardId === currentDashboard
//   );
//
//   const handleSendMessage = async () => {
//     if (!newMessage.trim()) return;
//
//     const userMessage: Message = {
//       id: `user-${Date.now()}`,
//       role: 'user',
//       content: newMessage
//     };
//
//     setMessages([...messages, userMessage]);
//     setNewMessage('');
//
//     try {
//       // Call the API with the user's query
//       const response = await sendAnalystQuery({ query: newMessage });
//
//       // Create AI response message with the data from the API
//       const aiResponse: Message = {
//         id: `ai-${Date.now()}`,
//         role: 'assistant',
//         content:
//           response.message || `Here's some information about "${newMessage}":`,
//         chart:
//           response.type !== 'invalid' && response.type !== 'text'
//             ? {
//                 type: response.type as WidgetType,
//                 title: response.title || `Analysis of ${newMessage}`,
//                 description: 'Generated based on your query',
//                 data: response.data,
//                 xKey: response.xKey,
//                 yKey: response.yKey,
//                 labelKey: response.labelKey,
//                 valueKey: response.valueKey
//               }
//             : undefined
//       };
//
//       setMessages((prev) => [...prev, aiResponse]);
//     } catch (error) {
//       console.error('Error getting response from analyst assistant:', error);
//
//       const errorResponse: Message = {
//         id: `error-${Date.now()}`,
//         role: 'assistant',
//         content:
//           'Sorry, I encountered an error processing your request. Please try again.'
//       };
//
//       setMessages((prev) => [...prev, errorResponse]);
//     }
//   };
//
//   // Handle adding a chart to the dashboard
//   const handleAddToDashboard = (
//     chart:
//       | {
//           type: WidgetType;
//           title: string;
//           description: string;
//           data?: any[];
//           xKey?: string;
//           yKey?: string;
//           labelKey?: string;
//           valueKey?: string;
//         }
//       | undefined
//   ) => {
//     if (!chart) return;
//
//     const newWidget: WidgetData = {
//       id: `widget-${Date.now()}`,
//       dashboardId: currentDashboard,
//       type: chart.type,
//       title: chart.title,
//       description: chart.description,
//       size: { width: 2, height: 1 },
//       data: chart.data,
//       xKey: chart.xKey,
//       yKey: chart.yKey,
//       labelKey: chart.labelKey,
//       valueKey: chart.valueKey
//     };
//
//     setWidgets([...widgets, newWidget]);
//   };
//
//   // Handle deleting a widget
//   const handleDeleteWidget = (widgetId: string) => {
//     setWidgets(widgets.filter((widget) => widget.id !== widgetId));
//   };
//
//   // Handle creating a new dashboard
//   const handleCreateDashboard = () => {
//     const newDashboard = {
//       id: `dashboard-${Date.now()}`,
//       name: `New Dashboard ${dashboards.length + 1}`
//     };
//
//     setDashboards([...dashboards, newDashboard]);
//     setCurrentDashboard(newDashboard.id);
//   };
//
//   // Handle saving dashboard
//   const handleSaveDashboard = async () => {
//     try {
//       // Here you would implement the actual save logic
//       // For now, we'll just show a success message
//       console.log('Saving dashboard:', {
//         id: currentDashboard,
//         widgets: currentWidgets
//       });
//
//       // You could show a toast notification here
//       alert('Dashboard saved successfully!');
//     } catch (error) {
//       console.error('Error saving dashboard:', error);
//       alert('Error saving dashboard. Please try again.');
//     }
//   };
//
//   function handleDragStart(event: DragStartEvent) {
//     if (!event.active.data.current) return;
//
//     const { widget } = event.active.data.current;
//     if (widget) {
//       setActiveWidget(widget);
//     }
//   }
//
//   // Handle drag end
//   function handleDragEnd(event: DragEndEvent) {
//     setActiveWidget(null);
//
//     const { active, over } = event;
//     if (!over) return;
//
//     const activeId = active.id;
//     const overId = over.id;
//
//     if (activeId === overId) return;
//
//     setWidgets((widgets) => {
//       const oldIndex = widgets.findIndex((w) => w.id === activeId);
//       const newIndex = widgets.findIndex((w) => w.id === overId);
//
//       return arrayMove(widgets, oldIndex, newIndex);
//     });
//   }
//
//   return (
//     <div className='flex h-[calc(100vh-8rem)] w-full'>
//       {/* Main Dashboard Area */}
//       <div className='flex flex-1 flex-col overflow-hidden'>
//         <div className='mb-4 flex items-center justify-between'>
//           <h2 className='text-2xl font-bold tracking-tight'>
//             {dashboards.find((d) => d.id === currentDashboard)?.name ||
//               'Dashboard'}
//           </h2>
//           <div className='flex items-center space-x-2'>
//             <Button variant='outline' onClick={handleSaveDashboard}>
//               Save Dashboard
//             </Button>
//             <Button variant='outline'>
//               <IconShare className='mr-2 h-4 w-4' />
//               Share
//             </Button>
//           </div>
//         </div>
//
//         {/* Current Dashboard Content */}
//         <div className='flex-1 overflow-auto'>
//           <DashboardGrid
//             widgets={currentWidgets}
//             onDelete={handleDeleteWidget}
//             onDragStart={handleDragStart}
//             onDragEnd={handleDragEnd}
//             activeWidget={activeWidget}
//           />
//         </div>
//       </div>
//
//       {/* Chat Button */}
//       <ChatToggleButton onClick={() => setIsChatOpen(true)} />
//
//       {/* Chat Panel (Sheet) */}
//       <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
//         <SheetContent
//           side='right'
//           className='flex h-full flex-col p-0'
//           style={{
//             width: '1000px',
//             maxWidth: '1000px',
//             minWidth: '1000px'
//           }}
//         >
//           <SheetHeader className='border-border shrink-0 border-b p-4'>
//             <SheetTitle>AI Assistant</SheetTitle>
//             <SheetDescription>Ask questions about your data</SheetDescription>
//           </SheetHeader>
//
//           <ScrollArea className='flex-1 overflow-auto p-4'>
//             <div className='flex flex-col'>
//               {messages.map((message) => (
//                 <ChatMessage
//                   key={message.id}
//                   message={message}
//                   onAddToDashboard={handleAddToDashboard}
//                 />
//               ))}
//               <div ref={messagesEndRef} />
//             </div>
//           </ScrollArea>
//
//           <div className='border-border mt-auto shrink-0 border-t p-4'>
//             <div className='flex gap-2'>
//               <Input
//                 placeholder='Ask a question...'
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//               />
//               <Button onClick={handleSendMessage} size='icon'>
//                 <IconSend className='h-4 w-4' />
//               </Button>
//             </div>
//           </div>
//         </SheetContent>
//       </Sheet>
//     </div>
//   );
// }

// _components/dashboard-workspace.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconShare, IconSend, IconCopy, IconDownload, IconClock } from '@tabler/icons-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { sendAnalystQuery } from '../services';

import DashboardGrid from './dashboard-grid';
import ChatMessage from './chat-message';
import ChatToggleButton from './chat-toggle-button';

import type {
  WidgetType,
  WidgetData,
  MessageRole,
  ChartData
} from '@/types/dashboard';

type ChartType = ChartData['type'];

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  chart?: ChartData;
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
  }
];

export default function DashboardWorkspace({
  dashboardId
}: {
  dashboardId: string;
}) {
  const [dashboards, setDashboards] = useState(initialDashboards);
  const [widgets, setWidgets] = useState(initialWidgets);
  const [messages, setMessages] = useState(initialMessages);
  const [currentDashboard, setCurrentDashboard] = useState(
    dashboardId || 'sales'
  );
  const [newMessage, setNewMessage] = useState('');
  const [activeWidget, setActiveWidget] = useState<WidgetData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const startAssistant = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${apiBaseUrl}/api/v1/analyst-assistant/start/`);
        const data = await res.json();
        console.log('Assistant started:', data);
      } catch (error) {
        console.error('Failed to start assistant:', error);
      }
    };

    startAssistant();
  }, []);

  // Listen for addToDashboard events from AI assistant
  useEffect(() => {
    const handleAddToDashboard = (event: CustomEvent) => {
      const { chart } = event.detail;
      if (!chart) {
        toast.error('No chart data provided');
        return;
      }
      
      // Validate that chart has data for data-driven chart types
      const requiresData = ['bar', 'area', 'line', 'pie', 'scatter', 'table'];
      if (requiresData.includes(chart.type) && (!chart.data || chart.data.length === 0)) {
        toast.error('Cannot add chart: No data available. Try a different query.');
        return;
      }
      
      addChartToDashboard(chart);
      toast.success(`"${chart.title}" added to dashboard`);
    };

    window.addEventListener(
      'addToDashboard',
      handleAddToDashboard as EventListener
    );

    return () => {
      window.removeEventListener(
        'addToDashboard',
        handleAddToDashboard as EventListener
      );
    };
  }, [currentDashboard]);

  // Filter widgets for the current dashboard
  const currentWidgets = widgets.filter(
    (widget) => widget.dashboardId === currentDashboard
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: newMessage
    };

    setMessages([...messages, userMessage]);
    setNewMessage('');
    setIsLoading(true);

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
                type: response.type as ChartType,
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
      console.error('Error getting response from analyst assistant:', error);

      const errorResponse: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          'Sorry, I encountered an error processing your request. Please try again.'
      };

      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert chart type to widget type
  const chartTypeToWidgetType = (chartType: ChartType): WidgetType => {
    // Map chart types to widget types
    switch (chartType) {
      case 'line':
      case 'scatter':
        return chartType;
      case 'table':
        return 'table';
      default:
        return chartType as WidgetType;
    }
  };

  // Function to add chart to dashboard
  const addChartToDashboard = (chart: {
    type: ChartType;
    title: string;
    description: string;
    data?: any[];
    xKey?: string;
    yKey?: string;
    labelKey?: string;
    valueKey?: string;
  }) => {
    const newWidget: WidgetData = {
      id: `widget-${Date.now()}`,
      dashboardId: currentDashboard,
      type: chartTypeToWidgetType(chart.type),
      title: chart.title,
      description: chart.description,
      size: {
        width: chart.type === 'table' ? 3 : 2,
        height: chart.type === 'table' ? 2 : 1
      },
      data: chart.data,
      xKey: chart.xKey,
      yKey: chart.yKey,
      labelKey: chart.labelKey,
      valueKey: chart.valueKey
    };

    setWidgets((prev) => [...prev, newWidget]);

    // Show success feedback
    console.log('Chart added to dashboard successfully:', newWidget);
  };

  // Handle adding a chart to the dashboard from chat
  const handleAddToDashboardFromChat = (
    chart:
      | {
          type: ChartType;
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
    if (!chart) {
      toast.error('No chart data provided');
      return;
    }

    // Validate that chart has data for data-driven chart types
    const requiresData = ['bar', 'area', 'line', 'pie', 'scatter', 'table'];
    if (requiresData.includes(chart.type) && (!chart.data || chart.data.length === 0)) {
      toast.error('Cannot add chart: No data available. Try a different query.');
      return;
    }

    addChartToDashboard(chart);
    toast.success(`"${chart.title}" added to dashboard`);
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

  // Handle saving dashboard
  const handleSaveDashboard = async () => {
    try {
      // Here you would implement the actual save logic
      // For now, we'll just show a success message
      console.log('Saving dashboard:', {
        id: currentDashboard,
        widgets: currentWidgets
      });

      // You could show a toast notification here
      alert('Dashboard saved successfully!');
    } catch (error) {
      console.error('Error saving dashboard:', error);
      alert('Error saving dashboard. Please try again.');
    }
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
    <div className='flex h-[calc(100vh-8rem)] w-full'>
      {/* Main Dashboard Area */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>
            {dashboards.find((d) => d.id === currentDashboard)?.name ||
              'Dashboard'}
          </h2>
          <div className='flex items-center space-x-2'>
            <Button variant='outline' onClick={handleSaveDashboard}>
              Save Dashboard
            </Button>
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

      {/* Chat Button */}
      <ChatToggleButton onClick={() => setIsChatOpen(true)} />

      {/* Chat Panel (Sheet) */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent
          side='right'
          className='flex h-full flex-col p-0'
          style={{
            width: '1000px',
            maxWidth: '1000px',
            minWidth: '1000px'
          }}
        >
          <SheetHeader className='border-border shrink-0 border-b p-4'>
            <SheetTitle>AI Assistant</SheetTitle>
            <SheetDescription>Ask questions about your data</SheetDescription>
          </SheetHeader>

          <ScrollArea className='flex-1 overflow-auto p-4'>
            <div className='flex flex-col gap-2'>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onAddToDashboard={handleAddToDashboardFromChat}
                />
              ))}
              {isLoading && (
                <div className='flex justify-start'>
                  <div className='bg-muted max-w-[80%] rounded-lg p-3'>
                    <div className='flex items-center gap-2'>
                      <div className='border-primary h-4 w-4 animate-spin rounded-full border-b-2'></div>
                      <span className='text-sm'>Analyzing your request...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className='border-border mt-auto shrink-0 border-t p-4'>
            <div className='flex gap-2'>
              <Input
                placeholder='Ask a question...'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && !e.shiftKey && handleSendMessage()
                }
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                size='icon'
                disabled={isLoading || !newMessage.trim()}
              >
                <IconSend className='h-4 w-4' />
              </Button>
            </div>
            <div className='mt-2'>
              <p className='text-muted-foreground text-xs'>
                Try: &#34;Show sales by region&#34; or &#34;Create a pie chart
                of product categories&#34;
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
