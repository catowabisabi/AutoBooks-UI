'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  MessageCircle, 
  Send, 
  X, 
  Loader2, 
  Bot, 
  User,
  Sparkles,
  MinusCircle,
  Maximize2
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/provider';
import { aiApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIButlerProps {
  position?: 'bottom-right' | 'bottom-left';
  defaultOpen?: boolean;
}

// System prompts for different contexts
const SYSTEM_PROMPTS = {
  general: `你是 Wisematic ERP 系統的智能管家助手。你的職責是：
1. 協助用戶了解和使用 ERP 系統的各項功能
2. 回答關於會計、人力資源、專案管理等模組的問題
3. 提供操作指導和最佳實踐建議
4. 使用繁體中文或英文回應（根據用戶語言偏好）

請保持友善、專業的態度，回答要簡潔明瞭。如果不確定答案，請誠實告知。`,

  accounting: `你是 Wisematic ERP 會計模組的專家助手。你熟悉：
- 會計科目表管理
- 日記帳分錄操作
- 發票和收款處理
- 財務報表生成（試算表、資產負債表、損益表）
- 應收/應付帳款管理

請提供準確的會計指導。`,

  hrms: `你是 Wisematic ERP 人力資源模組的專家助手。你熟悉：
- 員工資料管理
- 部門和職稱設定
- 請假申請和審核流程
- 薪資計算

請提供人力資源相關的專業建議。`,

  documents: `你是 Wisematic ERP 文件管理模組的專家助手。你熟悉：
- 文件上傳和分類
- OCR 文字識別
- 文件搜尋和檢索
- 權限管理

請協助用戶有效管理文件。`,
};

export function AIButler({ position = 'bottom-right', defaultOpen = false }: AIButlerProps) {
  const { t, messages: i18nMessages } = useTranslation();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<keyof typeof SYSTEM_PROMPTS>('general');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default suggestions as fallback
  const defaultSuggestions = [
    "How do I create an invoice?",
    "Show me the chart of accounts",
    "What's my current cash balance?",
    "How to record a journal entry?"
  ];
  
  // Get suggestions from i18n messages or use defaults
  const suggestions = (i18nMessages?.assistant as any)?.suggestions || defaultSuggestions;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Add greeting message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: t('assistant.greeting'),
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length, t]);

  // Detect context from current page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('accounting') || path.includes('finance')) {
        setContext('accounting');
      } else if (path.includes('hrms') || path.includes('employee')) {
        setContext('hrms');
      } else if (path.includes('document')) {
        setContext('documents');
      } else {
        setContext('general');
      }
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare chat history for API (including the new user message)
      const history = [
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: input.trim() }
      ];

      const response = await aiApi.chatWithHistory(
        history,
        'openai', // Default provider, can be made configurable
        {
          systemPrompt: SYSTEM_PROMPTS[context],
        }
      );

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content || 'Sorry, I could not process your request.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Butler error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      let userFriendlyMessage = '抱歉，我暫時無法處理您的請求。請稍後再試。';
      
      if (errorMsg.includes('Authentication') || errorMsg.includes('credentials')) {
        userFriendlyMessage = '請先登入以使用 AI 助手功能。您可以點擊右上角登入。';
      } else if (errorMsg.includes('API') || errorMsg.includes('key')) {
        userFriendlyMessage = '抱歉，AI 服務暫時無法使用。請確認後端 API 金鑰已正確設定。';
      }
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: userFriendlyMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, context]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const positionClasses = position === 'bottom-right' 
    ? 'right-4 bottom-4' 
    : 'left-4 bottom-4';

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed z-50 p-4 rounded-full bg-primary text-primary-foreground shadow-lg',
          'hover:scale-110 transition-transform duration-200',
          'flex items-center justify-center',
          positionClasses
        )}
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
          <Sparkles className="relative inline-flex h-4 w-4 text-primary-foreground" />
        </span>
      </button>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div
        className={cn(
          'fixed z-50 bg-card border rounded-full shadow-lg p-2',
          'flex items-center gap-2 cursor-pointer',
          positionClasses
        )}
        onClick={() => setIsMinimized(false)}
      >
        <Bot className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium pr-2">{t('ai.assistant')}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
            setIsMinimized(false);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Full chat panel
  return (
    <div
      className={cn(
        'fixed z-50 w-96 h-[500px] bg-card border rounded-lg shadow-xl flex flex-col',
        positionClasses
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary rounded-lg">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{t('ai.assistant')}</h3>
            <p className="text-xs text-muted-foreground">Wisematic ERP</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsMinimized(true)}
          >
            <MinusCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-2',
                message.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className={cn(
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                )}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'rounded-lg px-3 py-2 max-w-[80%] text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-muted">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg px-3 py-2 bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions (show when no messages or few messages) */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2">
          <p className="text-xs text-muted-foreground mb-2">建議問題：</p>
          <div className="flex flex-wrap gap-1">
            {suggestions.slice(0, 3).map((suggestion: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs px-2 py-1 bg-muted rounded-full hover:bg-muted/80 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('ai.askAnything')}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
