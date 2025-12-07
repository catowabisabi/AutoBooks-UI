'use client';

import { useState, useEffect } from 'react';
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
  IconLoader2,
  IconRefresh,
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
import { useTranslation } from '@/lib/i18n/provider';
import {
  getInvoices,
  deleteInvoice,
  downloadInvoicePdf,
  Invoice as ApiInvoice,
} from '../services';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Map API Invoice to display format
type Invoice = {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partial' | 'Draft' | 'Sent';
  type: 'SALES' | 'PURCHASE';
};

function mapApiInvoice(invoice: ApiInvoice): Invoice {
  const statusMap: Record<string, Invoice['status']> = {
    'DRAFT': 'Draft',
    'SENT': 'Sent',
    'VIEWED': 'Pending',
    'PAID': 'Paid',
    'PARTIAL': 'Partial',
    'OVERDUE': 'Overdue',
    'CANCELLED': 'Draft',
  };
  
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    client: invoice.contact_name || 'Unknown',
    amount: invoice.total || 0,
    issueDate: invoice.invoice_date,
    dueDate: invoice.due_date,
    status: statusMap[invoice.status] || 'Pending',
    type: invoice.invoice_type || 'SALES',
  };
}

export default function InvoiceList() {
  const router = useRouter();
  const { t } = useTranslation();
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params: { type?: 'SALES' | 'PURCHASE'; status?: string } = {};
      if (typeFilter !== 'all') params.type = typeFilter as 'SALES' | 'PURCHASE';
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await getInvoices(params);
      setData(response.results.map(mapApiInvoice));
    } catch (error) {
      console.error('Failed to load invoices:', error);
      toast.error(t('invoices.loadError') || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [statusFilter, typeFilter]);

  // 轉換為匯出格式
  const convertToExportFormat = (invoice: Invoice): InvoiceData => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    client: invoice.client,
    amount: invoice.amount,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: invoice.status,
    currency: 'USD',
  });

  // 下載單一發票 PDF
  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      toast.info(t('invoices.generating') || 'Generating PDF...');
      const blob = await downloadInvoicePdf(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(t('invoices.pdfDownloaded') || 'PDF downloaded');
    } catch {
      // Fallback to client-side PDF generation
      const exportData = convertToExportFormat(invoice);
      downloadInvoicePDF(exportData);
      toast.success(t('invoices.generating') || 'PDF generated');
    }
  };

  // 刪除發票
  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!confirm(t('invoices.confirmDelete') || `Are you sure you want to delete ${invoice.invoiceNumber}?`)) {
      return;
    }
    try {
      await deleteInvoice(invoice.id);
      toast.success(t('invoices.deleted') || 'Invoice deleted');
      loadInvoices();
    } catch {
      toast.error(t('invoices.deleteError') || 'Failed to delete invoice');
    }
  };

  // 匯出所有發票為 Excel
  const handleExportAllToExcel = () => {
    const exportData = data.map(convertToExportFormat);
    exportInvoicesToExcel(exportData, `invoices_${new Date().toISOString().split('T')[0]}`);
    toast.success(t('invoices.exported') || 'Exported to Excel');
  };

  // 匯出選取的發票為 Excel
  const handleExportSelectedToExcel = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.error(t('invoices.selectToExport') || 'Please select invoices to export');
      return;
    }
    const exportData = selectedRows.map(row => convertToExportFormat(row.original));
    exportInvoicesToExcel(exportData, `invoices_selected_${new Date().toISOString().split('T')[0]}`);
    toast.success(t('invoices.exported') || 'Exported to Excel');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Paid': return 'default';
      case 'Partial': return 'secondary';
      case 'Sent':
      case 'Pending': return 'outline';
      case 'Draft': return 'secondary';
      case 'Overdue': return 'destructive';
      default: return 'outline';
    }
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: t('invoices.invoiceNumber') || 'Invoice #'
    },
    {
      accessorKey: 'type',
      header: t('invoices.type') || 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return (
          <Badge variant={type === 'SALES' ? 'default' : 'secondary'}>
            {type === 'SALES' ? t('invoices.sales') || 'Sales' : t('invoices.purchase') || 'Purchase'}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'client',
      header: t('invoices.client') || 'Client'
    },
    {
      accessorKey: 'amount',
      header: t('invoices.amount') || 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      }
    },
    {
      accessorKey: 'issueDate',
      header: t('invoices.issueDate') || 'Issue Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('issueDate'));
        return <div>{date.toLocaleDateString()}</div>;
      }
    },
    {
      accessorKey: 'dueDate',
      header: t('invoices.dueDate') || 'Due Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('dueDate'));
        return <div>{date.toLocaleDateString()}</div>;
      }
    },
    {
      accessorKey: 'status',
      header: t('invoices.status') || 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {t(`invoices.${status.toLowerCase()}`) || status}
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
                {t('invoices.viewDetails') || 'View Details'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/finance/invoices/${invoice.id}/edit`)
                }
              >
                <IconEdit className='mr-2 h-4 w-4' />
                {t('invoices.edit') || 'Edit'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                <IconFileTypePdf className='mr-2 h-4 w-4 text-red-500' />
                {t('invoices.downloadPdf') || 'Download PDF'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const exportData = convertToExportFormat(invoice);
                exportInvoicesToExcel([exportData], `invoice_${invoice.invoiceNumber}`);
                toast.success(t('invoices.exported') || 'Exported');
              }}>
                <IconFileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
                {t('invoices.exportExcel') || 'Export Excel'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className='text-destructive'
                onClick={() => handleDeleteInvoice(invoice)}
              >
                <IconTrash className='mr-2 h-4 w-4' />
                {t('invoices.delete') || 'Delete'}
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
          title={t('invoices.title') || 'Invoices'}
          description={t('invoices.description') || 'Manage your invoices and track payments'}
        />
        <div className='flex items-center gap-2'>
          {/* 刷新按鈕 */}
          <Button variant='outline' size='icon' onClick={loadInvoices} disabled={loading}>
            <IconRefresh className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
          
          {/* 匯出按鈕 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>
                <IconDownload className='mr-2 h-4 w-4' />
                {t('invoices.export') || 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={handleExportAllToExcel}>
                <IconFileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
                {t('invoices.exportAll') || 'Export All'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportSelectedToExcel}>
                <IconFileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
                {t('invoices.exportSelected') || 'Export Selected'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link
            href='/dashboard/finance/invoices/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> {t('invoices.createInvoice') || 'New Invoice'}
          </Link>
        </div>
      </div>
      <Separator />
      
      {/* Filters */}
      <div className='flex gap-4'>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder={t('invoices.type') || 'Type'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('invoices.allTypes') || 'All Types'}</SelectItem>
            <SelectItem value='SALES'>{t('invoices.sales') || 'Sales'}</SelectItem>
            <SelectItem value='PURCHASE'>{t('invoices.purchase') || 'Purchase'}</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder={t('invoices.status') || 'Status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('invoices.allStatuses') || 'All Statuses'}</SelectItem>
            <SelectItem value='DRAFT'>{t('invoices.draft') || 'Draft'}</SelectItem>
            <SelectItem value='SENT'>{t('invoices.sent') || 'Sent'}</SelectItem>
            <SelectItem value='PAID'>{t('invoices.paid') || 'Paid'}</SelectItem>
            <SelectItem value='PARTIAL'>{t('invoices.partial') || 'Partial'}</SelectItem>
            <SelectItem value='OVERDUE'>{t('invoices.overdue') || 'Overdue'}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <IconLoader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      ) : (
        <DataTable table={table} />
      )}
    </div>
  );
}
