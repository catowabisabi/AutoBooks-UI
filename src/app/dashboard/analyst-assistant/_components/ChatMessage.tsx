'use client';

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
import { Loader2 } from 'lucide-react';

export type WidgetType = 'text' | 'bar' | 'area' | 'pie' | 'line' | 'scatter' | 'table';

export interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    contentZh?: string;
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

export default function ChatMessage({
  message,
  onAddToDashboard
}: ChatMessageProps) {
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
        ) : (
          <>
            <p className='whitespace-pre-line'>{message.content}</p>
            {message.contentZh && (
              <p className='whitespace-pre-line text-sm opacity-80 mt-2 border-t pt-2 border-current/20'>
                {message.contentZh}
              </p>
            )}
          </>
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
                  ➕ Add to Dashboard / 加入儀表板
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
