'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import ProjectView from '../_components/project-view';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={2} rowCount={5} filterCount={0} />
        }
      >
        <ProjectView projectId={projectId} />
      </Suspense>
    </div>
  );
}
