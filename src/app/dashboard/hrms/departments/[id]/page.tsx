'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import DepartmentView from '../../_components/department-view';

export default function DepartmentDetailPage() {
  const params = useParams();
  const departmentId = params.id as string;

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={2} rowCount={5} filterCount={0} />
        }
      >
        <DepartmentView departmentId={departmentId} />
      </Suspense>
    </div>
  );
}
