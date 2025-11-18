'use client';

import { SortableContext } from '@dnd-kit/sortable';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import Widget from './widget';

import type { WidgetData } from '@/types/dashboard';

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
