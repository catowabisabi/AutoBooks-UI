import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planner Assistant',
  description: 'Manage your tasks and plans efficiently'
};

export default function PlannerAssistantPage() {
  return (
    <div className='p-6'>
      <h1 className='mb-4 text-2xl font-semibold'>Planner Assistant</h1>
      <p className='text-muted-foreground'>
        Plan your work, set deadlines, and stay organized.
      </p>
    </div>
  );
}
