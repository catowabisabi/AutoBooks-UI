// _components/chat-message.tsx
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
import { IconPlus } from '@tabler/icons-react';
import { MarkdownDisplay } from '@/components/ui/markdown-display';

export type WidgetType = 'text' | 'bar' | 'area' | 'pie';
export type ChartType = 'bar' | 'area' | 'pie' | 'line' | 'scatter' | 'table';

export interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
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
        {message.role === 'user' ? (
          <p className='whitespace-pre-wrap'>{message.content}</p>
        ) : (
          <MarkdownDisplay content={message.content} />
        )}

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
                      message.chart.type === 'table' ? 'h-auto' : 'h-24'
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
                  <>
                    {message.chart.type === 'area' && (
                      <div className='bg-muted/30 flex h-24 w-full items-center justify-center rounded-md'>
                        <svg viewBox='0 0 100 40' className='h-full w-full'>
                          <path
                            d='M0,40 L0,30 C10,25 20,35 30,20 C40,5 50,15 60,10 C70,5 80,15 90,20 L100,15 L100,40 Z'
                            fill='rgba(var(--primary), 0.2)'
                            stroke='hsl(var(--primary))'
                            strokeWidth='1'
                          />
                        </svg>
                      </div>
                    )}
                    {message.chart.type === 'bar' && (
                      <div className='bg-muted/30 flex h-24 w-full items-center justify-center rounded-md'>
                        <div className='flex h-20 gap-1'>
                          {[40, 65, 30, 70, 50, 90].map((height, i) => (
                            <div
                              key={i}
                              className='bg-primary w-4 self-end rounded-t-sm'
                              style={{ height: `${height}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {message.chart.type === 'pie' && (
                      <div className='bg-muted/30 flex h-24 w-full items-center justify-center rounded-md'>
                        <svg viewBox='0 0 100 100' className='h-20 w-20'>
                          <circle
                            cx='50'
                            cy='50'
                            r='40'
                            fill='transparent'
                            stroke='hsl(var(--primary))'
                            strokeWidth='20'
                            strokeDasharray='75 25'
                          />
                          <circle
                            cx='50'
                            cy='50'
                            r='40'
                            fill='transparent'
                            stroke='hsl(var(--muted))'
                            strokeWidth='20'
                            strokeDasharray='25 75'
                            strokeDashoffset='-75'
                          />
                        </svg>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
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
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
