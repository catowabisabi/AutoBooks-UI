'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  IconSend,
  IconLoader2,
  IconSparkles,
  IconPaperclip,
  IconX,
  IconTable,
  IconFileText,
  IconChartBar,
  IconMessageCircle,
  IconDatabase,
  IconBulb
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import ChatMessage from './ChatMessage';
import { useTranslation } from '@/lib/i18n/provider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

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

interface AIChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string, context?: ContextChip[]) => void;
  onAddToDashboard: (chart: any) => void;
  isLoading?: boolean;
  dataLoaded?: boolean;
  isDemo?: boolean;
  suggestedPrompts?: string[];
  availableTables?: string[];
  selectedTable?: string;
}

// Context chip type
interface ContextChip {
  id: string;
  type: 'table' | 'file' | 'chart' | 'custom';
  label: string;
  value: string;
}

// Query type hints
interface QueryTypeHint {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  prefix: string;
}

// Sample prompts
const defaultPromptKeys = [
  'analyst.prompts.monthlySales',
  'analyst.prompts.top10Products',
  'analyst.prompts.pieChartCategory',
  'analyst.prompts.quarterlyRevenue',
  'analyst.prompts.top5Customers',
  'analyst.prompts.salesTrend6Months',
];

// Query type hints
const QUERY_TYPE_HINTS: QueryTypeHint[] = [
  {
    id: 'chart',
    icon: <IconChartBar className='h-3.5 w-3.5' />,
    label: '圖表',
    description: '生成數據圖表',
    prefix: '生成一個圖表顯示',
  },
  {
    id: 'table',
    icon: <IconTable className='h-3.5 w-3.5' />,
    label: '表格',
    description: '查詢表格數據',
    prefix: '顯示表格包含',
  },
  {
    id: 'analysis',
    icon: <IconBulb className='h-3.5 w-3.5' />,
    label: '分析',
    description: '數據分析洞察',
    prefix: '分析以下數據',
  },
  {
    id: 'chat',
    icon: <IconMessageCircle className='h-3.5 w-3.5' />,
    label: '對話',
    description: '一般問答',
    prefix: '',
  },
];

export default function AIChatPanel({
  messages,
  onSendMessage,
  onAddToDashboard,
  isLoading = false,
  dataLoaded = false,
  isDemo = false,
  suggestedPrompts,
  availableTables = [],
  selectedTable
}: AIChatPanelProps) {
  const { t } = useTranslation();
  const [newMessage, setNewMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [contextChips, setContextChips] = useState<ContextChip[]>([]);
  const [showQueryHints, setShowQueryHints] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Add selected table as context chip if changed
  useEffect(() => {
    if (selectedTable && !contextChips.find(c => c.value === selectedTable)) {
      setContextChips(prev => [
        ...prev.filter(c => c.type !== 'table'),
        {
          id: `table-${selectedTable}`,
          type: 'table',
          label: selectedTable,
          value: selectedTable
        }
      ]);
    }
  }, [selectedTable]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || isLoading) return;
    onSendMessage(newMessage.trim(), contextChips);
    setNewMessage('');
    setContextChips([]);
    setIsExpanded(false);
    setShowQueryHints(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Show query hints on /
    if (e.key === '/' && newMessage === '') {
      e.preventDefault();
      setShowQueryHints(true);
    }
  };

  const handlePromptClick = (promptKey: string) => {
    const prompt = t(promptKey);
    setNewMessage(prompt);
    textareaRef.current?.focus();
    setShowQueryHints(false);
  };

  const handleQueryHintClick = (hint: QueryTypeHint) => {
    setNewMessage(hint.prefix);
    textareaRef.current?.focus();
    setShowQueryHints(false);
  };

  const removeContextChip = (chipId: string) => {
    setContextChips(prev => prev.filter(c => c.id !== chipId));
  };

  const addTableContext = (tableName: string) => {
    if (!contextChips.find(c => c.value === tableName)) {
      setContextChips(prev => [
        ...prev,
        {
          id: `table-${tableName}`,
          type: 'table',
          label: tableName,
          value: tableName
        }
      ]);
    }
  };

  const prompts = suggestedPrompts || defaultPromptKeys;

  return (
    <TooltipProvider>
      <div className='flex h-full flex-col border rounded-lg bg-card overflow-hidden'>
        {/* Header */}
        <div className='shrink-0 border-b px-3 py-2 bg-muted/30'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>💬 AI {t('analyst.title')}</span>
            {dataLoaded && (
              <Badge
                variant='outline'
                className={cn(
                  'text-[10px]',
                  isDemo
                    ? 'text-orange-600 border-orange-600'
                    : 'text-green-600 border-green-600'
                )}
              >
                <IconSparkles className='h-2.5 w-2.5 mr-1' />
                {isDemo ? t('analyst.demoMode') : t('analyst.dataReady')}
              </Badge>
            )}
          </div>
        </div>

        {/* Chat messages area - scrollable */}
        <ScrollArea className='flex-1 min-h-0'>
          <div className='flex flex-col space-y-3 p-3'>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onAddToDashboard={onAddToDashboard}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Query type hints popup */}
        {showQueryHints && (
          <div className='shrink-0 border-t px-3 py-2 bg-muted/50'>
            <p className='text-[10px] font-medium text-muted-foreground mb-1.5'>
              選擇查詢類型 / Query Type
            </p>
            <div className='grid grid-cols-2 gap-1.5'>
              {QUERY_TYPE_HINTS.map((hint) => (
                <button
                  key={hint.id}
                  onClick={() => handleQueryHintClick(hint)}
                  className='flex items-center gap-2 px-2 py-1.5 rounded-md bg-background border border-border hover:bg-primary/10 hover:border-primary/50 transition-colors text-left'
                >
                  <span className='text-primary'>{hint.icon}</span>
                  <div>
                    <p className='text-xs font-medium'>{hint.label}</p>
                    <p className='text-[10px] text-muted-foreground'>{hint.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggested prompts - only show when few messages */}
        {messages.length <= 2 && !showQueryHints && (
          <div className='shrink-0 border-t px-3 py-2 bg-muted/30'>
            <p className='text-[10px] font-medium text-muted-foreground mb-1.5'>
              💡 {t('analyst.samplePrompts')}
            </p>
            <div className='flex flex-wrap gap-1'>
              {prompts.slice(0, 6).map((promptKey, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(promptKey)}
                  className='text-[10px] px-2 py-0.5 rounded-full bg-background border border-border hover:bg-primary/10 hover:border-primary/50 transition-colors'
                >
                  {t(promptKey)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Context chips */}
        {contextChips.length > 0 && (
          <div className='shrink-0 border-t px-3 py-1.5 bg-muted/20'>
            <div className='flex flex-wrap gap-1 items-center'>
              <span className='text-[10px] text-muted-foreground mr-1'>Context:</span>
              {contextChips.map((chip) => (
                <Badge
                  key={chip.id}
                  variant='secondary'
                  className='text-[10px] pr-1 gap-1'
                >
                  {chip.type === 'table' && <IconDatabase className='h-2.5 w-2.5' />}
                  {chip.type === 'file' && <IconFileText className='h-2.5 w-2.5' />}
                  {chip.type === 'chart' && <IconChartBar className='h-2.5 w-2.5' />}
                  {chip.label}
                  <button
                    onClick={() => removeContextChip(chip.id)}
                    className='ml-0.5 hover:bg-muted rounded-full p-0.5'
                  >
                    <IconX className='h-2.5 w-2.5' />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Input area - fixed at bottom */}
        <div className='shrink-0 border-t p-2 bg-muted/20'>
          <div className='flex items-end gap-2'>
            <div className='flex-1 relative'>
              <Textarea
                ref={textareaRef}
                placeholder={t('analyst.askQuestion')}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  if (e.target.value === '') setShowQueryHints(false);
                }}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={isExpanded ? 3 : 1}
                className='resize-none pr-10 min-h-[36px] text-sm'
                onFocus={() => setIsExpanded(true)}
                onBlur={() => {
                  if (!newMessage) {
                    setIsExpanded(false);
                    setShowQueryHints(false);
                  }
                }}
              />
              <div className='absolute right-2 bottom-2 flex items-center gap-0.5'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6'
                      disabled={isLoading}
                      onClick={() => setShowQueryHints(!showQueryHints)}
                    >
                      <IconPaperclip className='h-3.5 w-3.5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='top' className='text-xs'>
                    添加附件或輸入 / 選擇查詢類型
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <Button
              onClick={handleSend}
              size='icon'
              disabled={isLoading || !newMessage.trim()}
              className='h-9 w-9 shrink-0'
            >
              {isLoading ? (
                <IconLoader2 className='h-4 w-4 animate-spin' />
              ) : (
                <IconSend className='h-4 w-4' />
              )}
            </Button>
          </div>
          <p className='text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5'>
            {t('analyst.pressEnter')}
            <span className='text-muted-foreground/50'>•</span>
            <span className='opacity-70'>輸入 / 查看快捷鍵</span>
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
