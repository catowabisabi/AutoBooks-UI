'use client';

import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { IconPlus } from '@tabler/icons-react';
import { Suspense } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default function AnalyticsDataSourcesPage() {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title='Reports'
          description='Manage all your analytics reports, view details, and take actions.'
        />
        <Link
          href='/dashboard/analytics/reports/new'
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <IconPlus className='mr-2 h-4 w-4' /> Add Employee
        </Link>
      </div>
      <Separator />
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
        }
      >
        {/* Replace this with actual employee table component */}
        <div className='text-muted-foreground text-sm'>
          Attendance table will appear here...
        </div>
      </Suspense>
    </div>
  );
}
