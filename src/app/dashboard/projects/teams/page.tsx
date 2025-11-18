'use client';

import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Suspense } from 'react';

export default function LeavesPage() {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title='Leave Management'
          description='Manage all organization employees, view details, and take actions.'
        />
      </div>
      <Separator />
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
        }
      >
        {/* Replace this with actual employee table component */}
        <div className='text-muted-foreground text-sm'>
          leaves table will appear here...
        </div>
      </Suspense>
    </div>
  );
}
