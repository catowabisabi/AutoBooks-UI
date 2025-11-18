'use client';

import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { IconFileReport } from '@tabler/icons-react';
import { Suspense } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default function ReportsPage() {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title='Financial Reports'
          description='Generate and view financial reports, analyze data, and export reports for stakeholders.'
        />
        <Link
          href='/dashboard/finance/reports/new'
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <IconFileReport className='mr-2 h-4 w-4' /> Generate Report
        </Link>
      </div>
      <Separator />
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
        }
      >
        {/* Replace this with actual reports component */}
        <div className='text-muted-foreground text-sm'>
          Financial reports will appear here...
        </div>
      </Suspense>
    </div>
  );
}
