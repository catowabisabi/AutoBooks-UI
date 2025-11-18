'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { useDataTable } from '@/hooks/use-data-table';
import {
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconTrash
} from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';

// Define the expense type
type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
};

// Sample data
const expenses: Expense[] = [
  {
    id: '1',
    description: 'Office Supplies',
    amount: 250.75,
    category: 'Office Expenses',
    date: '2023-06-15',
    status: 'Approved'
  },
  {
    id: '2',
    description: 'Client Lunch',
    amount: 120.5,
    category: 'Meals & Entertainment',
    date: '2023-06-18',
    status: 'Approved'
  },
  {
    id: '3',
    description: 'Software Subscription',
    amount: 99.99,
    category: 'Software',
    date: '2023-06-20',
    status: 'Pending'
  },
  {
    id: '4',
    description: 'Travel Expenses',
    amount: 450.0,
    category: 'Travel',
    date: '2023-06-22',
    status: 'Pending'
  },
  {
    id: '5',
    description: 'Office Rent',
    amount: 2000.0,
    category: 'Rent',
    date: '2023-06-01',
    status: 'Approved'
  },
  {
    id: '6',
    description: 'Internet Bill',
    amount: 89.99,
    category: 'Utilities',
    date: '2023-06-05',
    status: 'Rejected'
  },
  {
    id: '7',
    description: 'Marketing Campaign',
    amount: 1500.0,
    category: 'Marketing',
    date: '2023-06-10',
    status: 'Approved'
  },
  {
    id: '8',
    description: 'Team Building Event',
    amount: 350.0,
    category: 'Team Activities',
    date: '2023-06-25',
    status: 'Pending'
  }
];

export default function ExpenseList() {
  const router = useRouter();
  const [data] = useState<Expense[]>(expenses);

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: 'description',
      header: 'Description'
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount);
        return <div>{formatted}</div>;
      }
    },
    {
      accessorKey: 'category',
      header: 'Category'
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <div>{date.toLocaleDateString()}</div>;
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge
            variant={
              status === 'Approved'
                ? 'default'
                : status === 'Pending'
                  ? 'outline'
                  : 'destructive'
            }
          >
            {status}
          </Badge>
        );
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <IconDotsVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/finance/expenses/${expense.id}`)
                }
              >
                <IconEye className='mr-2 h-4 w-4' />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/finance/expenses/${expense.id}/edit`)
                }
              >
                <IconEdit className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconTrash className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount: Math.ceil(data.length / 10),
    shallow: false,
    debounceMs: 500
  });

  return (
    <div className='space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title='Expense Management'
          description='View and manage all expenses, track spending, and approve expense requests.'
        />
        <Link
          href='/dashboard/finance/expenses/new'
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <IconPlus className='mr-2 h-4 w-4' /> Add Expense
        </Link>
      </div>
      <Separator />
      <DataTable table={table} />
    </div>
  );
}
