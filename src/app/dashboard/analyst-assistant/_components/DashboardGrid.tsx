'use client';

import { useState, useRef } from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { IconEdit, IconResize, IconTrash, IconDownload } from '@tabler/icons-react';
import { Download, Image, FileSpreadsheet, FileJson, Clipboard, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { ChartRenderer } from './chart-renderer';
import { 
  exportChartAsPNG, 
  exportDataAsCSV, 
  exportDataAsExcel,
  exportDataAsJSON,
  copyDataToClipboard 
} from './chart-export-utils';

type WidgetType = 'text' | 'bar' | 'area' | 'pie';

export interface WidgetData {
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

interface DashboardGridProps {
  widgets: WidgetData[];
  onDelete: (id: string) => void;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  activeWidget: WidgetData | null;
}

export default function DashboardGrid({
  widgets,
  onDelete,
  onDragStart,
  onDragEnd,
  activeWidget
}: DashboardGridProps) {
  const widgetIds = widgets.map((widget) => widget.id);

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className='grid min-h-full grid-cols-4 gap-4 p-4'>
        <SortableContext items={widgetIds}>
          {widgets.map((widget) => (
            <Widget key={widget.id} widget={widget} onDelete={onDelete} />
          ))}
        </SortableContext>

        {widgets.length === 0 && (
          <div className='bg-muted/20 border-muted col-span-4 flex h-64 flex-col items-center justify-center rounded-lg border border-dashed'>
            <p className='text-muted-foreground mb-4'>
              This dashboard is empty
            </p>
            <p className='text-muted-foreground text-sm'>
              Ask the AI assistant to generate insights
            </p>
          </div>
        )}
      </div>

      <DragOverlay>
        {activeWidget && (
          <Widget widget={activeWidget} isOverlay onDelete={onDelete} />
        )}
      </DragOverlay>
    </DndContext>
  );
}

interface WidgetProps {
  widget: WidgetData;
  isOverlay?: boolean;
  onDelete: (id: string) => void;
}

function Widget({ widget, isOverlay = false, onDelete }: WidgetProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: widget.id,
      data: { type: 'Widget', widget }
    });

  const handleExport = async (type: 'png' | 'csv' | 'excel' | 'json' | 'clipboard') => {
    const chartData = widget.data;
    const chartTitle = widget.title || 'chart';
    
    let success = false;
    
    switch (type) {
      case 'png':
        success = await exportChartAsPNG(chartRef.current, chartTitle);
        break;
      case 'csv':
        success = chartData ? exportDataAsCSV(chartData, chartTitle) : false;
        break;
      case 'excel':
        success = chartData ? exportDataAsExcel(chartData, chartTitle) : false;
        break;
      case 'json':
        success = chartData ? exportDataAsJSON(chartData, chartTitle) : false;
        break;
      case 'clipboard':
        success = chartData ? await copyDataToClipboard(chartData) : false;
        break;
    }
    
    setExportStatus(success ? 'success' : 'error');
    setTimeout(() => setExportStatus('idle'), 2000);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${widget.size.width}`,
    gridRow: `span ${widget.size.height}`
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('relative', isOverlay && 'z-50 opacity-80')}
      {...attributes}
      {...listeners}
    >
      <Card className='h-full'>
        <CardHeader className='cursor-move'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg'>{widget.title}</CardTitle>
            <div className='flex gap-1'>
              {widget.type === 'text' && (
                <Button variant='ghost' size='icon' className='h-8 w-8'>
                  <IconEdit className='h-4 w-4' />
                </Button>
              )}
              {/* Export dropdown for charts */}
              {widget.type !== 'text' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-8 w-8'>
                      {exportStatus === 'success' ? (
                        <Check className='h-4 w-4 text-green-500' />
                      ) : (
                        <Download className='h-4 w-4' />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-40'>
                    <DropdownMenuItem onClick={() => handleExport('png')}>
                      <Image className='h-4 w-4 mr-2' />
                      匯出 PNG
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                      <FileSpreadsheet className='h-4 w-4 mr-2' />
                      匯出 CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('excel')}>
                      <FileSpreadsheet className='h-4 w-4 mr-2' />
                      匯出 Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('json')}>
                      <FileJson className='h-4 w-4 mr-2' />
                      匯出 JSON
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleExport('clipboard')}>
                      <Clipboard className='h-4 w-4 mr-2' />
                      複製到剪貼板
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <IconResize className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => onDelete(widget.id)}
              >
                <IconTrash className='h-4 w-4' />
              </Button>
            </div>
          </div>
          <CardDescription>{widget.description}</CardDescription>
        </CardHeader>
        <CardContent
          className={cn(
            'p-6',
            widget.type !== 'text' && 'flex items-center justify-center'
          )}
        >
          {widget.type === 'text' && (
            <div className='prose max-w-none'>
              {widget.content || 'Click edit to add text content'}
            </div>
          )}
          {widget.type !== 'text' && widget.data && widget.data.length > 0 ? (
            <div className='h-40' ref={chartRef}>
              <ChartRenderer
                type={
                  widget.type as 'bar' | 'scatter' | 'pie' | 'table' | 'area'
                }
                data={widget.data}
                title={widget.title}
                description={widget.description}
                xKey={widget.xKey}
                yKey={widget.yKey}
                labelKey={widget.labelKey}
                valueKey={widget.valueKey}
              />
            </div>
          ) : (
            <>
              {widget.type === 'bar' && (
                <div className='bg-muted/30 flex h-40 w-full items-center justify-center rounded-md'>
                  <div className='flex h-32 gap-2'>
                    {[40, 65, 30, 70, 50, 90].map((height, i) => (
                      <div
                        key={i}
                        className='bg-primary w-8 self-end rounded-t-sm'
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {widget.type === 'area' && (
                <div className='bg-muted/30 flex h-40 w-full items-center justify-center rounded-md'>
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
              {widget.type === 'pie' && (
                <div className='bg-muted/30 flex h-40 w-full items-center justify-center rounded-md'>
                  <svg viewBox='0 0 100 100' className='h-32 w-32'>
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
      </Card>
    </div>
  );
}
