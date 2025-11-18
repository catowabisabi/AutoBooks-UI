'use client';

import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Suspense } from 'react';
import InvoiceList from '../_components/invoice-list';

export default function InvoicesPage() {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={7} rowCount={8} filterCount={2} />
        }
      >
        <InvoiceList />
      </Suspense>
    </div>
  );
}
