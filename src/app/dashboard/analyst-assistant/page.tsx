'use client';

import { useState, useEffect, useRef } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  IconShare,
  IconLoader2,
  IconDatabase,
  IconRefresh,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
  IconBrain,
  IconMessageCircle,
  IconMaximize,
  IconCamera,
  IconLayoutDashboard,
  IconTable
} from '@tabler/icons-react';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { sendAnalystQuery, startAnalystAssistant } from './services';
import { useTranslation } from '@/lib/i18n/provider';
import { cn } from '@/lib/utils';

import DashboardGrid from './_components/DashboardGrid';
import RagDocumentPanel from './_components/RagDocumentPanel';
import AIChatPanel from './_components/AIChatPanel';
import BusinessDataView from './_components/BusinessDataView';

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

interface DashboardItem {
  id: string;
  nameKey?: string;
  name?: string;
}

// Initial dashboards
const initialDashboards: DashboardItem[] = [
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

// Max visible dashboards before scroll
const MAX_VISIBLE_DASHBOARDS = 4;

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

  const [dashboards, setDashboards] = useState<DashboardItem[]>(initialDashboards);
  const [widgets, setWidgets] = useState(initialWidgets);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState('sales');
  const [activeWidget, setActiveWidget] = useState<WidgetData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [dataInfo, setDataInfo] = useState<{ rows?: Record<string, number>; message?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tabScrollIndex, setTabScrollIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'dashboard' | 'data'>('dashboard');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

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

  // Filter widgets for the current dashboard
  const currentWidgets = widgets.filter(
    (widget) => widget.dashboardId === currentDashboard
  );

  // Tab navigation logic
  const visibleDashboards = dashboards.slice(tabScrollIndex, tabScrollIndex + MAX_VISIBLE_DASHBOARDS);
  const canScrollLeft = tabScrollIndex > 0;
  const canScrollRight = tabScrollIndex + MAX_VISIBLE_DASHBOARDS < dashboards.length;

  const scrollTabsLeft = () => {
    setTabScrollIndex(Math.max(0, tabScrollIndex - 1));
  };

  const scrollTabsRight = () => {
    setTabScrollIndex(Math.min(dashboards.length - MAX_VISIBLE_DASHBOARDS, tabScrollIndex + 1));
  };

  const handleSendMessage = async (newMessage: string) => {
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
    setIsLoading(true);

    try {
      // Call the API with the user's query
      const response = await sendAnalystQuery({ query: newMessage });
      
      // Debug: log the response
      console.log('Analyst API response:', response);

      // Remove loading message and add real response
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        
        // Create AI response message with the data from the API
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: response.type === 'invalid' 
            ? (response.message || t('analyst.couldntProcess'))
            : (response.message || `${t('analyst.analysisFor')} "${newMessage}":`),
          chart: response.type !== 'invalid' && response.type !== 'text' && response.type !== 'error' && response.data
            ? {
                type: response.type as WidgetType,
                title: response.title || `Analysis: ${newMessage}`,
                description: t('analyst.generatedFromQuery'),
                data: response.data,
                xKey: response.xKey,
                yKey: response.yKey,
                labelKey: response.labelKey,
                valueKey: response.valueKey
              }
            : undefined
        };
        
        // Debug: log the created message
        console.log('Created AI response message:', aiResponse);

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
    if (!chart) {
      console.warn('handleAddToDashboard: No chart provided');
      return;
    }
    
    if (!chart.data || chart.data.length === 0) {
      console.warn('handleAddToDashboard: Chart has no data', chart);
      // Still add it but show warning
    }

    console.log('Adding chart to dashboard:', chart);

    const newWidget: WidgetData = {
      id: `widget-${Date.now()}`,
      dashboardId: currentDashboard,
      type: chart.type,
      title: chart.title,
      description: chart.description,
      size: { width: 2, height: 1 },
      data: chart.data || [],
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
      <div className='flex h-[calc(100vh-6rem)] w-full gap-4'>
        {/* Center Section - Dashboard Area (flex-1 takes remaining space) */}
        <div className='flex flex-1 flex-col overflow-hidden min-w-0' ref={dashboardRef}>
          {/* Header with Dashboard Tabs */}
          <div className='mb-3 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <h2 className='text-xl font-bold tracking-tight'>
                🤖 {t('analyst.title')}
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
            <div className='flex items-center space-x-3'>
              {/* View Mode Switch */}
              <div className='flex items-center space-x-2 border rounded-lg px-3 py-1.5 bg-muted/30'>
                <IconLayoutDashboard className={cn('h-4 w-4', viewMode === 'dashboard' ? 'text-primary' : 'text-muted-foreground')} />
                <Switch
                  id='view-mode'
                  checked={viewMode === 'data'}
                  onCheckedChange={(checked) => setViewMode(checked ? 'data' : 'dashboard')}
                />
                <IconTable className={cn('h-4 w-4', viewMode === 'data' ? 'text-primary' : 'text-muted-foreground')} />
              </div>
              
              <Button variant='outline' size='sm' onClick={loadData}>
                <IconRefresh className='mr-2 h-4 w-4' />
                {t('analyst.reloadData')}
              </Button>
              <Button 
                variant='outline' 
                size='icon'
                className='h-8 w-8'
                onClick={() => {
                  if (dashboardRef.current) {
                    if (!document.fullscreenElement) {
                      dashboardRef.current.requestFullscreen();
                      setIsFullscreen(true);
                    } else {
                      document.exitFullscreen();
                      setIsFullscreen(false);
                    }
                  }
                }}
                title='全屏顯示'
              >
                <IconMaximize className='h-4 w-4' />
              </Button>
              <Button 
                variant='outline' 
                size='icon'
                className='h-8 w-8'
                onClick={async () => {
                  if (dashboardRef.current) {
                    try {
                      const html2canvas = (await import('html2canvas')).default;
                      const canvas = await html2canvas(dashboardRef.current);
                      const link = document.createElement('a');
                      link.download = `dashboard-${new Date().toISOString().slice(0, 10)}.png`;
                      link.href = canvas.toDataURL();
                      link.click();
                    } catch (err) {
                      console.error('Screenshot failed:', err);
                    }
                  }
                }}
                title='截圖'
              >
                <IconCamera className='h-4 w-4' />
              </Button>
              <Button variant='outline' size='sm'>
                <IconShare className='mr-2 h-4 w-4' />
                {t('analyst.share')}
              </Button>
            </div>
          </div>

          {/* Dashboard Tabs - With arrow navigation */}
          <div className='mb-3 flex items-center gap-1 border-b pb-2'>
            {/* Left Arrow */}
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 shrink-0'
              onClick={scrollTabsLeft}
              disabled={!canScrollLeft}
            >
              <IconChevronLeft className='h-4 w-4' />
            </Button>

            {/* Dashboard Tabs */}
            <div ref={tabContainerRef} className='flex items-center gap-1 flex-1 overflow-hidden'>
              {visibleDashboards.map((dashboard) => {
                const name = dashboard.nameKey ? t(dashboard.nameKey) : dashboard.name || dashboard.id;
                return (
                  <Button
                    key={dashboard.id}
                    variant={currentDashboard === dashboard.id ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setCurrentDashboard(dashboard.id)}
                    className={cn(
                      'text-sm whitespace-nowrap',
                      currentDashboard === dashboard.id && 'shadow-sm'
                    )}
                  >
                    {name}
                  </Button>
                );
              })}
            </div>

            {/* Right Arrow */}
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 shrink-0'
              onClick={scrollTabsRight}
              disabled={!canScrollRight}
            >
              <IconChevronRight className='h-4 w-4' />
            </Button>
            
            {/* Create new dashboard */}
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 shrink-0'
              onClick={handleCreateDashboard}
            >
              <IconPlus className='h-4 w-4' />
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant='destructive' className='mb-3'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Dashboard Grid - Takes all available space */}
          <div className='flex-1 overflow-auto'>
            {viewMode === 'dashboard' ? (
              // Dashboard View
              currentWidgets.length > 0 ? (
                <DashboardGrid
                  widgets={currentWidgets}
                  onDelete={handleDeleteWidget}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  activeWidget={activeWidget}
                />
              ) : (
                <div className='flex h-full items-center justify-center border rounded-lg bg-muted/20'>
                  <div className='text-center text-muted-foreground p-8'>
                    <IconDatabase className='mx-auto h-12 w-12 mb-4 opacity-50' />
                    <p className='text-lg font-medium'>{t('analyst.noCharts')}</p>
                    <p className='text-sm'>{t('analyst.askAiCreate')}</p>
                  </div>
                </div>
              )
            ) : (
              // Business Data View
              <BusinessDataView 
                onSelectItem={(type, item) => {
                  console.log('Selected from data view:', type, item);
                }}
              />
            )}
          </div>
        </div>

        {/* Right Section - Tabbed RAG & AI Chat */}
        <div className='w-[380px] shrink-0 flex flex-col border-l pl-4 overflow-hidden'>
          <Tabs defaultValue='chat' className='flex flex-col h-full overflow-hidden'>
            {/* Tab Header */}
            <TabsList className='grid w-full grid-cols-2 shrink-0'>
              <TabsTrigger value='chat' className='gap-1.5'>
                <IconMessageCircle className='h-4 w-4' />
                AI 助手
              </TabsTrigger>
              <TabsTrigger value='rag' className='gap-1.5'>
                <IconBrain className='h-4 w-4' />
                RAG 文件
              </TabsTrigger>
            </TabsList>

            {/* AI Chat Tab */}
            <TabsContent value='chat' className='flex-1 mt-3 overflow-hidden flex flex-col min-h-0'>
              <AIChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                onAddToDashboard={handleAddToDashboard}
                isLoading={isLoading}
                dataLoaded={dataLoaded}
                isDemo={isDemo}
                suggestedPrompts={samplePromptKeys}
              />
            </TabsContent>

            {/* RAG Documents Tab */}
            <TabsContent value='rag' className='flex-1 mt-3 overflow-hidden flex flex-col min-h-0'>
              <RagDocumentPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
}
