'use client';

import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Suspense } from 'react';
import EmployeeList from '../_components/employee-list';

export default function EmployeesPage() {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
        }
      >
        <EmployeeList />
      </Suspense>
    </div>
  );
}
