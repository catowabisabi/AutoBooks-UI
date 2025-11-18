import WorkflowBuilder from './_components/workflow-builder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DocumentsPage() {
  return (
    <div className='flex flex-1 flex-col space-y-2'>
      <div className='grid gap-4'>
        <Card className='col-span-1'>
          <CardHeader className='pb-2'>
            <CardTitle>Workflow Builder</CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <WorkflowBuilder />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
6;
