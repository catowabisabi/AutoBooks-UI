'use client';

import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Suspense } from 'react';
import ReceiptList from './_components/receipt-list';

export default function ReceiptsPage() {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={6} rowCount={8} filterCount={3} />
        }
      >
        <ReceiptList />
      </Suspense>
    </div>
  );
}
