import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { KanbanBoard } from './kanban-board';
import NewTaskDialog from './new-task-dialog';
import { KanbanAIAssistant } from './kanban-ai-assistant';

export default function KanbanViewPage() {
  return (
    <PageContainer>
      <div className='space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title={`Kanban`} description='Manage tasks by dnd' />
          <div className='flex items-center gap-2'>
            <KanbanAIAssistant />
            <NewTaskDialog />
          </div>
        </div>
        <KanbanBoard />
      </div>
    </PageContainer>
  );
}
