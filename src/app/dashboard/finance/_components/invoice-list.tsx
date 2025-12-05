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
  IconTrash,
  IconFileTypePdf,
  IconFileSpreadsheet,
  IconDownload,
  IconPrinter,
} from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { toast } from 'sonner';
import {
  downloadInvoicePDF,
  exportInvoicesToExcel,
  InvoiceData,
} from '@/lib/export-utils';

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

  // 轉換為匯出格式
  const convertToExportFormat = (invoice: Invoice): InvoiceData => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    client: invoice.client,
    amount: invoice.amount,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: invoice.status,
    currency: 'TWD',
  });

  // 下載單一發票 PDF
  const handleDownloadPDF = (invoice: Invoice) => {
    const exportData = convertToExportFormat(invoice);
    downloadInvoicePDF(exportData);
    toast.success(`正在生成 ${invoice.invoiceNumber} 的 PDF...`);
  };

  // 匯出所有發票為 Excel
  const handleExportAllToExcel = () => {
    const exportData = data.map(convertToExportFormat);
    exportInvoicesToExcel(exportData, `invoices_${new Date().toISOString().split('T')[0]}`);
    toast.success('發票已匯出為 Excel 檔案');
  };

  // 匯出選取的發票為 Excel
  const handleExportSelectedToExcel = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.error('請先選取要匯出的發票');
      return;
    }
    const exportData = selectedRows.map(row => convertToExportFormat(row.original));
    exportInvoicesToExcel(exportData, `invoices_selected_${new Date().toISOString().split('T')[0]}`);
    toast.success(`已匯出 ${selectedRows.length} 筆發票`);
  };

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
                View Details / 檢視詳情
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/finance/invoices/${invoice.id}/edit`)
                }
              >
                <IconEdit className='mr-2 h-4 w-4' />
                Edit / 編輯
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                <IconFileTypePdf className='mr-2 h-4 w-4 text-red-500' />
                Download PDF / 下載 PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const exportData = convertToExportFormat(invoice);
                exportInvoicesToExcel([exportData], `invoice_${invoice.invoiceNumber}`);
                toast.success('發票已匯出為 Excel');
              }}>
                <IconFileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
                Export Excel / 匯出 Excel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-destructive'>
                <IconTrash className='mr-2 h-4 w-4' />
                Delete / 刪除
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
          title='Invoice Management / 發票管理'
          description='Create and manage invoices, track payments, and export to PDF/Excel. / 建立和管理發票、追蹤付款、匯出 PDF/Excel。'
        />
        <div className='flex items-center gap-2'>
          {/* 匯出按鈕 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>
                <IconDownload className='mr-2 h-4 w-4' />
                Export / 匯出
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={handleExportAllToExcel}>
                <IconFileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
                Export All to Excel / 全部匯出 Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportSelectedToExcel}>
                <IconFileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
                Export Selected to Excel / 匯出選取項目
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link
            href='/dashboard/finance/invoices/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> Create Invoice / 新增發票
          </Link>
        </div>
      </div>
      <Separator />
      <DataTable table={table} />
    </div>
  );
}
