'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import EmployeeView from '../../_components/employee-view';

export default function EmployeeDetailPage() {
  const params = useParams();
  const employeeId = params.id as string;

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={2} rowCount={5} filterCount={0} />
        }
      >
        <EmployeeView employeeId={employeeId} />
      </Suspense>
    </div>
  );
}
