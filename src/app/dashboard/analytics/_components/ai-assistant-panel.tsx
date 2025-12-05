// _components/ai-assistant-panel.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconMessage, IconSend, IconPlus } from '@tabler/icons-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ChartRenderer } from './chart-renderer';
import { sendAnalystQuery } from '../services';
import { toast } from 'sonner';

// Updated type to match chart-renderer
type ChartType = 'bar' | 'area' | 'pie' | 'line' | 'scatter' | 'table' | 'text';
type MessageRole = 'user' | 'assistant';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  chart?: {
    type: ChartType;
    title: string;
    description: string;
    data?: any[];
    xKey?: string;
    yKey?: string;
    labelKey?: string;
    valueKey?: string;
  };
}

interface ChatMessageProps {
  message: Message;
  onAddToDashboard?: (chart: Message['chart']) => void;
}

function ChatMessage({ message, onAddToDashboard }: ChatMessageProps) {
  return (
    <div
      className={`mb-4 flex max-w-[90%] flex-col ${
        message.role === 'user' ? 'ml-auto' : 'mr-auto'
      }`}
    >
      <div
        className={`rounded-lg p-3 ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <p className='break-words whitespace-pre-wrap'>{message.content}</p>

        {message.chart && (
          <div className='mt-3'>
            <Card className='mt-2'>
              <CardHeader className='py-2'>
                <CardTitle className='text-sm'>{message.chart.title}</CardTitle>
                <CardDescription className='text-xs'>
                  {message.chart.description}
                </CardDescription>
              </CardHeader>
              <CardContent className='p-2'>
                {message.chart.data && message.chart.data.length > 0 ? (
                  <div
                    className={
                      message.chart.type === 'table'
                        ? 'max-h-48 overflow-auto'
                        : 'h-32'
                    }
                  >
                    <ChartRenderer
                      type={message.chart.type}
                      data={message.chart.data}
                      title={message.chart.title}
                      description={message.chart.description}
                      xKey={message.chart.xKey}
                      yKey={message.chart.yKey}
                      labelKey={message.chart.labelKey}
                      valueKey={message.chart.valueKey}
                    />
                  </div>
                ) : (
                  <div className='bg-muted/30 flex h-24 w-full items-center justify-center rounded-md'>
                    <span className='text-muted-foreground text-sm'>
                      Chart Preview
                    </span>
                  </div>
                )}
              </CardContent>
              {onAddToDashboard && (
                <CardFooter className='py-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => onAddToDashboard(message.chart)}
                  >
                    <IconPlus className='mr-1 h-3 w-3' />
                    Add to Dashboard
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AiAssistantPanel() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello! I can help you create charts and analyze your data. What would you like to explore?'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const startAssistant = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
        const res = await fetch(
          `${apiBaseUrl}/api/v1/analyst-assistant/start/`
        );
        const data = await res.json();
        console.log('Assistant started:', data);
      } catch (error) {
        console.error('Failed to start assistant:', error);
      }
    };

    startAssistant();
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Call the analyst API
      const response = await sendAnalystQuery({ query: message });

      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.message || `Here's the analysis for "${message}":`,
        chart:
          response.type !== 'invalid' && response.type !== 'text'
            ? {
                type: response.type as ChartType, // Now properly typed
                title: response.title || `Analysis of ${message}`,
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

  const handleAddToDashboard = (chart: Message['chart']) => {
    if (!chart) return;

    // Create a custom event to communicate with parent components
    const event = new CustomEvent('addToDashboard', {
      detail: {
        chart: {
          type: chart.type,
          title: chart.title,
          description: chart.description,
          data: chart.data,
          xKey: chart.xKey,
          yKey: chart.yKey,
          labelKey: chart.labelKey,
          valueKey: chart.valueKey
        }
      }
    });

    window.dispatchEvent(event);

    // Also log for debugging
    console.log('Adding chart to dashboard:', chart);

    toast(`Chart "${chart.title}" would be added to dashboard`);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        className='fixed right-6 bottom-6 z-50 h-12 w-12 rounded-full shadow-lg'
        onClick={() => setIsChatOpen(true)}
      >
        <IconMessage className='h-5 w-5' />
      </Button>

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
            <SheetDescription>
              Ask questions about your data or request chart visualizations
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className='flex-1 overflow-auto p-4'>
            <div className='flex flex-col gap-2'>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onAddToDashboard={handleAddToDashboard}
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
                placeholder='Ask about your data or request a chart...'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && !e.shiftKey && handleSendMessage()
                }
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                size='icon'
                disabled={isLoading || !message.trim()}
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
    </>
  );
}
