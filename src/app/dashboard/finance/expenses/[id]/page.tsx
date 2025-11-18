'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import ExpenseView from '../_components/expense-view';

export default function ExpenseDetailPage() {
  const params = useParams();
  const expenseId = params.id as string;

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={2} rowCount={5} filterCount={0} />
        }
      >
        <ExpenseView expenseId={expenseId} />
      </Suspense>
    </div>
  );
}
