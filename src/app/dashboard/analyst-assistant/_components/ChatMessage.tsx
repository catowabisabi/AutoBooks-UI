'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChartRenderer } from './chart-renderer';
import { Loader2, Copy, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/provider';

export type WidgetType = 'text' | 'bar' | 'area' | 'pie' | 'line' | 'scatter' | 'table';

export interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isLoading?: boolean;
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
  };
  onAddToDashboard: (chart: ChatMessageProps['message']['chart']) => void;
}

// Simple markdown renderer
function MarkdownContent({ content }: { content: string }) {
  const [copiedBlock, setCopiedBlock] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedBlock(index);
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  const rendered = useMemo(() => {
    const lines = content.split('\n');
    const elements: React.ReactElement[] = [];
    let inCodeBlock = false;
    let codeBlockContent = '';
    let codeBlockLang = '';
    let codeBlockIndex = 0;
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'ol') {
          elements.push(
            <ol key={`list-${elements.length}`} className='list-decimal list-inside my-2 space-y-1'>
              {listItems.map((item, i) => (
                <li key={i} className='text-sm'>{formatInlineText(item)}</li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`list-${elements.length}`} className='list-disc list-inside my-2 space-y-1'>
              {listItems.map((item, i) => (
                <li key={i} className='text-sm'>{formatInlineText(item)}</li>
              ))}
            </ul>
          );
        }
        listItems = [];
        listType = null;
      }
    };

    const formatInlineText = (text: string): React.ReactNode => {
      // Handle inline code
      let processed = text.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">$1</code>');
      // Handle bold
      processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // Handle italic
      processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      // Handle links
      processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline" target="_blank">$1</a>');
      
      return <span dangerouslySetInnerHTML={{ __html: processed }} />;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block start/end
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          flushList();
          inCodeBlock = true;
          codeBlockLang = line.slice(3).trim();
          codeBlockContent = '';
        } else {
          const blockIndex = codeBlockIndex++;
          const finalContent = codeBlockContent;
          const lang = codeBlockLang;
          elements.push(
            <div key={`code-${blockIndex}`} className='my-3 rounded-lg bg-zinc-900 overflow-hidden'>
              <div className='flex items-center justify-between px-3 py-1.5 bg-zinc-800 border-b border-zinc-700'>
                <span className='text-xs text-zinc-400'>{lang || 'code'}</span>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6 text-zinc-400 hover:text-white'
                  onClick={() => copyToClipboard(finalContent, blockIndex)}
                >
                  {copiedBlock === blockIndex ? (
                    <Check className='h-3 w-3' />
                  ) : (
                    <Copy className='h-3 w-3' />
                  )}
                </Button>
              </div>
              <pre className='p-3 overflow-x-auto'>
                <code className='text-xs text-zinc-100 font-mono whitespace-pre'>
                  {finalContent}
                </code>
              </pre>
            </div>
          );
          inCodeBlock = false;
          codeBlockContent = '';
          codeBlockLang = '';
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent += (codeBlockContent ? '\n' : '') + line;
        continue;
      }

      // Headers
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${i}`} className='text-base font-semibold mt-3 mb-2'>
            {formatInlineText(line.slice(4))}
          </h3>
        );
        continue;
      }
      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${i}`} className='text-lg font-semibold mt-4 mb-2'>
            {formatInlineText(line.slice(3))}
          </h2>
        );
        continue;
      }
      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={`h1-${i}`} className='text-xl font-bold mt-4 mb-3'>
            {formatInlineText(line.slice(2))}
          </h1>
        );
        continue;
      }

      // Lists
      const bulletMatch = line.match(/^[\s]*[-*•]\s+(.+)/);
      const numberMatch = line.match(/^[\s]*(\d+)\.\s+(.+)/);
      
      if (bulletMatch) {
        if (listType === 'ol') flushList();
        listType = 'ul';
        listItems.push(bulletMatch[1]);
        continue;
      }
      if (numberMatch) {
        if (listType === 'ul') flushList();
        listType = 'ol';
        listItems.push(numberMatch[2]);
        continue;
      }

      // Horizontal rule
      if (line.match(/^[-*_]{3,}$/)) {
        flushList();
        elements.push(<hr key={`hr-${i}`} className='my-3 border-muted' />);
        continue;
      }

      // Empty line
      if (line.trim() === '') {
        flushList();
        continue;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${i}`} className='text-sm my-1.5'>
          {formatInlineText(line)}
        </p>
      );
    }

    flushList();
    return elements;
  }, [content, copiedBlock]);

  return <div className='prose prose-sm dark:prose-invert max-w-none'>{rendered}</div>;
}

export default function ChatMessage({
  message,
  onAddToDashboard
}: ChatMessageProps) {
  const { t } = useTranslation();
  
  return (
    <div
      className={cn(
        'mb-4 flex max-w-[90%] flex-col',
        message.role === 'user' ? 'ml-auto' : 'mr-auto'
      )}
    >
      <div
        className={cn(
          'rounded-lg p-3',
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        {message.isLoading ? (
          <div className='flex items-center gap-2'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>{message.content}</span>
          </div>
        ) : message.role === 'assistant' ? (
          <MarkdownContent content={message.content} />
        ) : (
          <p className='whitespace-pre-line text-sm'>{message.content}</p>
        )}

        {message.chart && !message.isLoading && (
          <div className='mt-3'>
            <Card className='mt-2 bg-background'>
              <CardHeader className='py-2'>
                <CardTitle className='text-sm'>{message.chart.title}</CardTitle>
                <CardDescription className='text-xs'>
                  {message.chart.description}
                </CardDescription>
              </CardHeader>
              <CardContent className='p-2'>
                {message.chart.data && message.chart.data.length > 0 ? (
                  <div className='h-48'>
                    <ChartRenderer
                      type={message.chart.type as 'bar' | 'scatter' | 'pie' | 'table' | 'area' | 'line'}
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
                    <p className='text-sm text-muted-foreground'>No data available</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className='py-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => onAddToDashboard(message.chart)}
                >
                  ➕ {t('analyst.addToDashboard')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
