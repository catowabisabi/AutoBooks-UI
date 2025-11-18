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

// Define the invoice type
type Invoice = {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
};

// Sample data
const invoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2023-001',
    client: 'Acme Corporation',
    amount: 5250.75,
    issueDate: '2023-06-01',
    dueDate: '2023-06-15',
    status: 'Paid'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2023-002',
    client: 'Globex Industries',
    amount: 3120.5,
    issueDate: '2023-06-05',
    dueDate: '2023-06-20',
    status: 'Paid'
  },
  {
    id: '3',
    invoiceNumber: 'INV-2023-003',
    client: 'Stark Enterprises',
    amount: 8999.99,
    issueDate: '2023-06-10',
    dueDate: '2023-06-25',
    status: 'Pending'
  },
  {
    id: '4',
    invoiceNumber: 'INV-2023-004',
    client: 'Wayne Industries',
    amount: 4500.0,
    issueDate: '2023-06-12',
    dueDate: '2023-06-27',
    status: 'Pending'
  },
  {
    id: '5',
    invoiceNumber: 'INV-2023-005',
    client: 'Umbrella Corp',
    amount: 12000.0,
    issueDate: '2023-05-15',
    dueDate: '2023-05-30',
    status: 'Overdue'
  },
  {
    id: '6',
    invoiceNumber: 'INV-2023-006',
    client: 'Cyberdyne Systems',
    amount: 7899.99,
    issueDate: '2023-05-20',
    dueDate: '2023-06-05',
    status: 'Overdue'
  },
  {
    id: '7',
    invoiceNumber: 'INV-2023-007',
    client: 'Initech',
    amount: 2500.0,
    issueDate: '2023-06-18',
    dueDate: '2023-07-03',
    status: 'Pending'
  },
  {
    id: '8',
    invoiceNumber: 'INV-2023-008',
    client: 'Massive Dynamic',
    amount: 9350.0,
    issueDate: '2023-06-20',
    dueDate: '2023-07-05',
    status: 'Pending'
  }
];

export default function InvoiceList() {
  const router = useRouter();
  const [data] = useState<Invoice[]>(invoices);

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #'
    },
    {
      accessorKey: 'client',
      header: 'Client'
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
      accessorKey: 'issueDate',
      header: 'Issue Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('issueDate'));
        return <div>{date.toLocaleDateString()}</div>;
      }
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('dueDate'));
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
              status === 'Paid'
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
        const invoice = row.original;
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
                  router.push(`/dashboard/finance/invoices/${invoice.id}`)
                }
              >
                <IconEye className='mr-2 h-4 w-4' />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/finance/invoices/${invoice.id}/edit`)
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
          title='Invoice Management'
          description='Create and manage invoices, track payments, and monitor outstanding balances.'
        />
        <Link
          href='/dashboard/finance/invoices/new'
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <IconPlus className='mr-2 h-4 w-4' /> Create Invoice
        </Link>
      </div>
      <Separator />
      <DataTable table={table} />
    </div>
  );
}
