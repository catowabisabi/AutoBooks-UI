'use client';

import { useState, useRef, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IconShare, IconSend, IconLoader2, IconDatabase, IconRefresh } from '@tabler/icons-react';
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
import { useTranslation } from '@/lib/i18n/provider';

import DashboardSidebar from './_components/DashboardSidebar';
import DashboardGrid from './_components/DashboardGrid';
import ChatMessage from './_components/ChatMessage';
import ChatToggleButton from './_components/ChatToggleButton';

// Types
type WidgetType = 'text' | 'bar' | 'area' | 'pie' | 'line' | 'scatter' | 'table';
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
  isLoading?: boolean;
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

// Initial dashboards
const initialDashboards = [
  { id: 'sales', nameKey: 'analyst.dashboards.salesAnalytics' },
  { id: 'finance', nameKey: 'analyst.dashboards.finance' },
  { id: 'marketing', nameKey: 'analyst.dashboards.marketing' },
  { id: 'custom', nameKey: 'analyst.dashboards.custom' }
];

// Initial widgets (empty - will be populated by AI)
const initialWidgets: WidgetData[] = [];

// Sample prompts for user guidance
const samplePromptKeys = [
  'analyst.prompts.monthlySales',
  'analyst.prompts.top10Products',
  'analyst.prompts.compareSalesByCustomer',
  'analyst.prompts.salesByCountry',
  'analyst.prompts.pieChartCategory',
  'analyst.prompts.quarterlyRevenue',
  'analyst.prompts.bestMonth',
  'analyst.prompts.salesTrend6Months',
  'analyst.prompts.top5Customers',
  'analyst.prompts.purchaseFrequency',
  'analyst.prompts.barChartRevenue',
  'analyst.prompts.highestQuantity',
  'analyst.prompts.avgUnitPrice',
  'analyst.prompts.compareProducts',
  'analyst.prompts.totalRevenue',
  'analyst.prompts.taxByMonth',
  'analyst.prompts.avgOrderValue',
  'analyst.prompts.discountAnalysis',
];

export default function AnalystAssistantPage() {
  const { t } = useTranslation();
  
  // Welcome message - created inside component to use translations
  const getWelcomeMessages = (): Message[] => [
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 ${t('analyst.welcome')}\n\n**${t('analyst.tryAsking')}**\n• "${t('analyst.prompts.monthlySales')}"\n• "${t('analyst.prompts.top10Products')}"\n• "${t('analyst.prompts.pieChartCategory')}"\n• "${t('analyst.prompts.quarterlyRevenue')}"\n\n💡 ${t('analyst.clickPrompts')}`
    }
  ];

  const [dashboards, setDashboards] = useState(initialDashboards);
  const [widgets, setWidgets] = useState(initialWidgets);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState('sales');
  const [newMessage, setNewMessage] = useState('');
  const [activeWidget, setActiveWidget] = useState<WidgetData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [dataInfo, setDataInfo] = useState<{ rows?: Record<string, number>; message?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(true); // Default open
  
  // Initialize welcome messages
  useEffect(() => {
    setMessages(getWelcomeMessages());
  }, []);

  // Load data on mount
  const loadData = async () => {
    setError(null);
    try {
      const data = await startAnalystAssistant();
      console.log('Assistant started:', data);
      setDataLoaded(true);
      setDataInfo(data);
      
      // Check if using demo mode
      const demoMode = (data as any).isDemo || data.status === 'demo';
      setIsDemo(demoMode);
      
      // Add data loaded message
      const rowCount = data.rows ? Object.values(data.rows).reduce((a, b) => a + b, 0) : 0;
      const dataLoadedMsg: Message = {
        id: `system-${Date.now()}`,
        role: 'assistant',
        content: demoMode 
          ? `⚠️ ${t('analyst.runningDemo')} ${rowCount > 0 ? t('analyst.usingSampleData') : ''}\n\n${t('analyst.exploreDemoFeatures')}`
          : `✅ ${t('analyst.dataLoaded')} ${rowCount > 0 ? `(${rowCount} rows)` : ''}\n\n${t('analyst.dataLoadedDesc')}`
      };
      setMessages(prev => [...prev, dataLoadedMsg]);
    } catch (error) {
      console.error('Failed to start assistant:', error);
      setError('Failed to load data. Please make sure the backend is running.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    // Add loading message
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: t('analyst.analyzing'),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    const currentQuery = newMessage;
    setNewMessage('');
    setIsLoading(true);

    try {
      // Call the API with the user's query
      const response = await sendAnalystQuery({ query: currentQuery });

      // Remove loading message and add real response
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        
        // Create AI response message with the data from the API
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: response.type === 'invalid' 
            ? (response.message || t('analyst.couldntProcess'))
            : (response.message || `${t('analyst.analysisFor')} "${currentQuery}":`),
          chart: response.type !== 'invalid' && response.type !== 'text' && response.data
            ? {
                type: response.type as WidgetType,
                title: response.title || `Analysis: ${currentQuery}`,
                description: t('analyst.generatedFromQuery'),
                data: response.data,
                xKey: response.xKey,
                yKey: response.yKey,
                labelKey: response.labelKey,
                valueKey: response.valueKey
              }
            : undefined
        };

        return [...filtered, aiResponse];
      });
    } catch (error) {
      console.error('Error getting response from analyst assistant:', error);

      // Remove loading and add error message
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        const errorResponse: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: t('analyst.errorProcessing')
        };
        return [...filtered, errorResponse];
      });
    } finally {
      setIsLoading(false);
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
      nameKey: 'analyst.dashboards.newDashboard',
      name: `${t('analyst.dashboards.newDashboard')} ${dashboards.length + 1}`
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
          dashboards={dashboards.map(d => ({ ...d, name: d.nameKey ? t(d.nameKey) : d.name || d.id }))}
          currentDashboard={currentDashboard}
          onDashboardSelect={setCurrentDashboard}
          onCreateDashboard={handleCreateDashboard}
          onRenameDashboard={(id, newName) => {
            setDashboards(
              dashboards.map((d) => (d.id === id ? { ...d, name: newName, nameKey: undefined } : d))
            );
          }}
        />

        {/* Main Dashboard Area */}
        <div className='flex flex-1 flex-col overflow-hidden'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <h2 className='text-2xl font-bold tracking-tight'>
                {(() => {
                  const dashboard = dashboards.find((d) => d.id === currentDashboard);
                  if (!dashboard) return 'Dashboard';
                  return dashboard.nameKey ? t(dashboard.nameKey) : dashboard.name || dashboard.id;
                })()}
              </h2>
              {dataLoaded ? (
                isDemo ? (
                  <Badge variant='outline' className='text-orange-600 border-orange-600'>
                    <IconDatabase className='mr-1 h-3 w-3' />
                    {t('analyst.demoMode')}
                  </Badge>
                ) : (
                  <Badge variant='outline' className='text-green-600 border-green-600'>
                    <IconDatabase className='mr-1 h-3 w-3' />
                    {t('analyst.dataReady')}
                  </Badge>
                )
              ) : (
                <Badge variant='outline' className='text-yellow-600 border-yellow-600'>
                  <IconLoader2 className='mr-1 h-3 w-3 animate-spin' />
                  {t('analyst.loading')}
                </Badge>
              )}
            </div>
            <div className='flex items-center space-x-2'>
              <Button variant='outline' size='sm' onClick={loadData}>
                <IconRefresh className='mr-2 h-4 w-4' />
                {t('analyst.reloadData')}
              </Button>
              <Button variant='outline'>
                <IconShare className='mr-2 h-4 w-4' />
                {t('analyst.share')}
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Current Dashboard Content */}
          <div className='flex-1 overflow-auto'>
            {currentWidgets.length > 0 ? (
              <DashboardGrid
                widgets={currentWidgets}
                onDelete={handleDeleteWidget}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                activeWidget={activeWidget}
              />
            ) : (
              <div className='flex h-full items-center justify-center'>
                <div className='text-center text-muted-foreground'>
                  <IconDatabase className='mx-auto h-12 w-12 mb-4 opacity-50' />
                  <p className='text-lg font-medium'>{t('analyst.noCharts')}</p>
                  <p className='text-sm'>{t('analyst.askAiCreate')}</p>
                  <Button className='mt-4' onClick={() => setIsChatOpen(true)}>
                    {t('analyst.openAiAssistant')}
                  </Button>
                </div>
              </div>
            )}
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
            <div className='flex items-center justify-between'>
              <div>
                <SheetTitle className='flex items-center gap-2'>
                  🤖 {t('analyst.title')}
                  {isLoading && <IconLoader2 className='h-4 w-4 animate-spin' />}
                </SheetTitle>
                <SheetDescription>
                  {t('analyst.description')}
                </SheetDescription>
              </div>
              {dataLoaded && (
                <Badge variant='secondary' className='text-xs'>
                  {t('analyst.dataReady')} ✓
                </Badge>
              )}
            </div>
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

          {/* Sample Prompts Section */}
          {messages.length <= 2 && (
            <div className='border-border border-t p-3 bg-muted/30'>
              <p className='text-xs font-medium text-muted-foreground mb-2'>
                💡 {t('analyst.samplePrompts')}：
              </p>
              <div className='flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto'>
                {samplePromptKeys.slice(0, 12).map((promptKey, index) => (
                  <button
                    key={index}
                    onClick={() => setNewMessage(t(promptKey))}
                    className='text-xs px-2 py-1 rounded-full bg-background border border-border hover:bg-primary/10 hover:border-primary/50 transition-colors text-left'
                  >
                    {t(promptKey)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className='border-border mt-auto shrink-0 border-t p-4'>
            <div className='flex gap-2'>
              <Input
                placeholder={t('analyst.askQuestion')}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} size='icon' disabled={isLoading || !newMessage.trim()}>
                {isLoading ? (
                  <IconLoader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <IconSend className='h-4 w-4' />
                )}
              </Button>
            </div>
            <p className='text-xs text-muted-foreground mt-2'>
              {t('analyst.pressEnter')}
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
