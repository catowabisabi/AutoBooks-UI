'use client';

import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Suspense } from 'react';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default function LedgersPage() {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title='General Ledger'
          description='View and manage financial accounts, track transactions, and generate financial reports.'
        />
        <Link
          href='/dashboard/finance/ledgers/new'
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <IconPlus className='mr-2 h-4 w-4' /> Add Account
        </Link>
      </div>
      <Separator />
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
        }
      >
        {/* Replace this with actual ledger table component */}
        <div className='text-muted-foreground text-sm'>
          General ledger accounts will appear here...
        </div>
      </Suspense>
    </div>
  );
}
