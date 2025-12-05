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
  contentZh?: string; // 中文內容
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
  { id: 'sales', name: 'Sales Analytics / 銷售分析' },
  { id: 'finance', name: 'Finance / 財務' },
  { id: 'custom', name: 'Custom Dashboard / 自訂儀表板' }
];

// Initial widgets (empty - will be populated by AI)
const initialWidgets: WidgetData[] = [];

// Sample prompts for user guidance / 範例提示
const samplePrompts = [
  // Sales Analysis / 銷售分析
  { en: 'Show me monthly sales trends', zh: '顯示每月銷售趨勢' },
  { en: 'What are the top 10 products by revenue?', zh: '營收前 10 名的產品是什麼？' },
  { en: 'Compare sales by customer', zh: '比較各客戶的銷售額' },
  { en: 'Show sales distribution by country', zh: '顯示各國家的銷售分佈' },
  { en: 'Create a pie chart of sales by category', zh: '建立各類別銷售的圓餅圖' },
  
  // Time-based Analysis / 時間分析
  { en: 'Show quarterly revenue comparison', zh: '顯示季度營收比較' },
  { en: 'What was the best performing month?', zh: '哪個月份表現最好？' },
  { en: 'Show sales trend for the past 6 months', zh: '顯示過去 6 個月的銷售趨勢' },
  
  // Customer Analysis / 客戶分析
  { en: 'Who are the top 5 customers by total purchases?', zh: '總購買額前 5 名的客戶是誰？' },
  { en: 'Show customer purchase frequency', zh: '顯示客戶購買頻率' },
  { en: 'Create a bar chart of revenue by customer', zh: '建立各客戶營收的長條圖' },
  
  // Product Analysis / 產品分析
  { en: 'Which products have the highest quantity sold?', zh: '哪些產品銷售數量最高？' },
  { en: 'Show average unit price by product', zh: '顯示各產品的平均單價' },
  { en: 'Compare product performance', zh: '比較產品表現' },
  
  // Financial Analysis / 財務分析
  { en: 'Calculate total revenue', zh: '計算總營收' },
  { en: 'Show tax amount by month', zh: '顯示每月稅額' },
  { en: 'What is the average order value?', zh: '平均訂單金額是多少？' },
  { en: 'Show discount analysis', zh: '顯示折扣分析' },
];

// Welcome message
const welcomeMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: '👋 Hello! I\'m your AI Analyst Assistant. I can help you analyze your sales data and create visualizations.\n\n**Try asking me questions like:**\n• "Show me monthly sales trends"\n• "What are the top 10 products by revenue?"\n• "Create a pie chart of sales by customer"\n• "Compare quarterly performance"\n\n💡 Click on the sample prompts below to get started!',
    contentZh: '👋 你好！我是你的 AI 分析助手。我可以幫助你分析銷售數據並創建視覺化圖表。\n\n**你可以這樣問我：**\n• 「顯示每月銷售趨勢」\n• 「營收前 10 名產品是什麼？」\n• 「建立各客戶銷售圓餅圖」\n• 「比較季度表現」\n\n💡 點擊下方的範例提示開始使用！'
  }
];

export default function AnalystAssistantPage() {
  const [dashboards, setDashboards] = useState(initialDashboards);
  const [widgets, setWidgets] = useState(initialWidgets);
  const [messages, setMessages] = useState<Message[]>(welcomeMessages);
  const [currentDashboard, setCurrentDashboard] = useState('sales');
  const [newMessage, setNewMessage] = useState('');
  const [activeWidget, setActiveWidget] = useState<WidgetData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataInfo, setDataInfo] = useState<{ rows?: Record<string, number>; message?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(true); // Default open

  // Load data on mount
  const loadData = async () => {
    setError(null);
    try {
      const data = await startAnalystAssistant();
      console.log('Assistant started:', data);
      setDataLoaded(true);
      setDataInfo(data);
      
      // Add data loaded message
      const dataLoadedMsg: Message = {
        id: `system-${Date.now()}`,
        role: 'assistant',
        content: `✅ Data loaded successfully! ${data.rows ? `(${Object.values(data.rows).reduce((a, b) => a + b, 0)} rows)` : ''}\n\nYou can now ask me questions about your data.`,
        contentZh: `✅ 數據載入成功！${data.rows ? `(共 ${Object.values(data.rows).reduce((a, b) => a + b, 0)} 行)` : ''}\n\n現在你可以向我提問有關數據的問題。`
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
      content: 'Analyzing your question...',
      contentZh: '正在分析您的問題...',
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
            ? (response.message || `I couldn't process that query. Please try rephrasing your question.`)
            : (response.message || `Here's the analysis for "${currentQuery}":`),
          contentZh: response.type === 'invalid'
            ? '無法處理該查詢，請嘗試重新表述您的問題。'
            : `以下是「${currentQuery}」的分析結果：`,
          chart: response.type !== 'invalid' && response.type !== 'text' && response.data
            ? {
                type: response.type as WidgetType,
                title: response.title || `Analysis: ${currentQuery}`,
                description: `Generated from your query / 根據您的查詢生成`,
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
          content: 'Sorry, I encountered an error processing your request. Please make sure the backend is running and try again.',
          contentZh: '抱歉，處理您的請求時發生錯誤。請確保後端正在運行，然後重試。'
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
            <div className='flex items-center gap-3'>
              <h2 className='text-2xl font-bold tracking-tight'>
                {dashboards.find((d) => d.id === currentDashboard)?.name ||
                  'Dashboard'}
              </h2>
              {dataLoaded ? (
                <Badge variant='outline' className='text-green-600 border-green-600'>
                  <IconDatabase className='mr-1 h-3 w-3' />
                  Data Ready
                </Badge>
              ) : (
                <Badge variant='outline' className='text-yellow-600 border-yellow-600'>
                  <IconLoader2 className='mr-1 h-3 w-3 animate-spin' />
                  Loading...
                </Badge>
              )}
            </div>
            <div className='flex items-center space-x-2'>
              <Button variant='outline' size='sm' onClick={loadData}>
                <IconRefresh className='mr-2 h-4 w-4' />
                Reload Data
              </Button>
              <Button variant='outline'>
                <IconShare className='mr-2 h-4 w-4' />
                Share
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
                  <p className='text-lg font-medium'>No charts yet</p>
                  <p className='text-sm'>Ask the AI assistant to create visualizations</p>
                  <p className='text-sm mt-1'>還沒有圖表，請使用 AI 助手創建視覺化</p>
                  <Button className='mt-4' onClick={() => setIsChatOpen(true)}>
                    Open AI Assistant
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
                  🤖 AI Analyst Assistant
                  {isLoading && <IconLoader2 className='h-4 w-4 animate-spin' />}
                </SheetTitle>
                <SheetDescription>
                  Ask questions about your data / 詢問有關數據的問題
                </SheetDescription>
              </div>
              {dataLoaded && (
                <Badge variant='secondary' className='text-xs'>
                  Data Loaded ✓
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
                💡 Sample Prompts / 範例提示：
              </p>
              <div className='flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto'>
                {samplePrompts.slice(0, 12).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setNewMessage(prompt.en)}
                    className='text-xs px-2 py-1 rounded-full bg-background border border-border hover:bg-primary/10 hover:border-primary/50 transition-colors text-left'
                    title={prompt.zh}
                  >
                    {prompt.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className='border-border mt-auto shrink-0 border-t p-4'>
            <div className='flex gap-2'>
              <Input
                placeholder='Ask a question... / 輸入問題...'
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
              Press Enter to send / 按 Enter 發送 • Hover prompts to see Chinese / 滑鼠移到提示上查看中文
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
