'use client';

import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Suspense } from 'react';
import DepartmentList from '../_components/department-list';

export default function DepartmentsPage() {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={6} rowCount={10} filterCount={2} />
        }
      >
        <DepartmentList />
      </Suspense>
    </div>
  );
}
