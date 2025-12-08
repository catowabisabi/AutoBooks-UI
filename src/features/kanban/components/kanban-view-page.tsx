import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { KanbanBoard } from './kanban-board';
import NewTaskDialog from './new-task-dialog';
import { KanbanAIAssistant } from './kanban-ai-assistant';
import { AIAssistantCard } from '@/components/ai/ai-assistant-card';

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
        
        {/* AI Assistant Card */}
        <div className='mb-4'>
          <AIAssistantCard
            module="kanban"
            title="Kanban AI Assistant"
            description="Analyze board status, optimize workflow, and prioritize tasks"
            defaultCollapsed={true}
            className="w-full"
          />
        </div>
        
        <KanbanBoard />
      </div>
    </PageContainer>
  );
}
