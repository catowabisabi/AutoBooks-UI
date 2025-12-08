'use client';

import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Suspense } from 'react';
import ProjectList from './_components/project-list';

export default function ProjectsPage() {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
        }
      >
        <ProjectList />
      </Suspense>
    </div>
  );
}
