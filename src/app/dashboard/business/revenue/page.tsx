'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { DataTable } from '@/components/ui/table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { useDataTable } from '@/hooks/use-data-table';
import { useTranslation } from '@/lib/i18n/provider';
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconTrash,
  IconRefresh,
  IconCloud,
  IconCloudOff,
  IconCash,
} from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { revenueApi, Revenue } from '@/features/business/services';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

export default function RevenueListPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [data, setData] = useState<Revenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; revenue: Revenue | null }>({
    open: false,
    revenue: null,
  });
  const [paymentAmount, setPaymentAmount] = useState('');

  const getStatusColor = (status: string): BadgeVariant => {
    const colors: Record<string, BadgeVariant> = {
      PENDING: 'secondary',
      PARTIAL: 'outline',
      RECEIVED: 'success',
      OVERDUE: 'destructive',
      WRITTEN_OFF: 'secondary',
    };
    return colors[status] || 'secondary';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: t('business.pendingPayment'),
      PARTIAL: t('business.partialPayment'),
      RECEIVED: t('business.received'),
      OVERDUE: t('business.overdue'),
      WRITTEN_OFF: t('business.writtenOff'),
    };
    return labels[status] || status;
  };

  // Mock data for demo
  const mockData: Revenue[] = [
    {
      id: 'demo-1',
      company: 'demo-company-1',
      company_name: 'ABC 有限公司',
      invoice_number: 'INV-2024-001',
      description: '2024年度審計服務費',
      total_amount: 150000,
      received_amount: 100000,
      pending_amount: 50000,
      is_fully_paid: false,
      status: 'PARTIAL',
      invoice_date: '2024-01-15',
      due_date: '2024-02-15',
      contact_name: '張先生',
      contact_email: 'zhang@abc.com',
      is_active: true,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z',
    },
    {
      id: 'demo-2',
      company: 'demo-company-2',
      company_name: 'XYZ 科技股份有限公司',
      invoice_number: 'INV-2024-002',
      description: '稅務諮詢服務',
      total_amount: 85000,
      received_amount: 85000,
      pending_amount: 0,
      is_fully_paid: true,
      status: 'RECEIVED',
      invoice_date: '2024-01-20',
      due_date: '2024-02-20',
      received_date: '2024-02-10',
      contact_name: '李小姐',
      contact_email: 'li@xyz.com',
      is_active: true,
      created_at: '2024-01-20T00:00:00Z',
      updated_at: '2024-02-10T00:00:00Z',
    },
    {
      id: 'demo-3',
      company: 'demo-company-3',
      company_name: 'Hong Kong Trading Ltd.',
      invoice_number: 'INV-2024-003',
      description: '內部審計服務',
      total_amount: 200000,
      received_amount: 0,
      pending_amount: 200000,
      is_fully_paid: false,
      status: 'PENDING',
      invoice_date: '2024-02-01',
      due_date: '2024-03-01',
      contact_name: 'Mr. Wong',
      contact_email: 'wong@hkt.com',
      is_active: true,
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z',
    },
    {
      id: 'demo-4',
      company: 'demo-company-4',
      company_name: '大灣區投資控股',
      invoice_number: 'INV-2024-004',
      description: '盡職調查服務',
      total_amount: 350000,
      received_amount: 175000,
      pending_amount: 175000,
      is_fully_paid: false,
      status: 'PARTIAL',
      invoice_date: '2024-01-25',
      due_date: '2024-02-25',
      contact_name: '陳總',
      contact_email: 'chen@gba.com',
      is_active: true,
      created_at: '2024-01-25T00:00:00Z',
      updated_at: '2024-02-05T00:00:00Z',
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await revenueApi.list({ ordering: '-invoice_date' });
      const results = response.results || [];
      
      // If API returns empty data, use mock data
      if (results.length === 0) {
        // eslint-disable-next-line no-console
        console.log('[Revenue] API returned empty, using mock data');
        setData(mockData);
        setIsUsingMockData(true);
      } else {
        setData(results);
        setIsUsingMockData(false);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch revenue:', error);
      setIsUsingMockData(true);
      setData(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await revenueApi.delete(deleteId);
      toast.success(t('common.deleteSuccess'));
      fetchData();
    } catch (error) {
      toast.error(t('common.deleteFailed'));
    }
    setDeleteId(null);
  };

  const handleRecordPayment = async () => {
    if (!paymentDialog.revenue || !paymentAmount) return;
    try {
      await revenueApi.recordPayment(paymentDialog.revenue.id, parseFloat(paymentAmount));
      toast.success(t('business.paymentRecorded'));
      setPaymentDialog({ open: false, revenue: null });
      setPaymentAmount('');
      fetchData();
    } catch (error) {
      toast.error(t('business.paymentFailed'));
    }
  };

  const columns: ColumnDef<Revenue>[] = [
    {
      accessorKey: 'invoice_number',
      header: t('business.invoiceNumber'),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/business/revenue/${row.original.id}`}
          className='font-medium text-primary hover:underline'
        >
          {row.original.invoice_number || '-'}
        </Link>
      ),
    },
    {
      accessorKey: 'company_name',
      header: t('business.clientCompany'),
      cell: ({ row }) => row.original.company_name || '-',
    },
    {
      accessorKey: 'description',
      header: t('common.description'),
      cell: ({ row }) => (
        <span className='line-clamp-1 max-w-[200px]'>
          {row.original.description || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'total_amount',
      header: t('business.totalAmount'),
      cell: ({ row }) => `HK$${row.original.total_amount.toLocaleString()}`,
    },
    {
      accessorKey: 'received_amount',
      header: t('business.receivedAmount'),
      cell: ({ row }) => `HK$${row.original.received_amount.toLocaleString()}`,
    },
    {
      accessorKey: 'pending_amount',
      header: t('business.pendingAmount'),
      cell: ({ row }) =>
        row.original.pending_amount
          ? `HK$${row.original.pending_amount.toLocaleString()}`
          : '-',
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ row }) => (
        <Badge variant={getStatusColor(row.original.status)}>
          {getStatusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: 'due_date',
      header: t('business.dueDate'),
      cell: ({ row }) =>
        row.original.due_date
          ? new Date(row.original.due_date).toLocaleDateString('zh-TW')
          : '-',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon'>
              <IconDotsVertical className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/revenue/${row.original.id}`)
              }
            >
              <IconEye className='mr-2 size-4' />
              {t('common.viewDetails')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/revenue/${row.original.id}/edit`)
              }
            >
              <IconEdit className='mr-2 size-4' />
              {t('common.edit')}
            </DropdownMenuItem>
            {row.original.status !== 'RECEIVED' && (
              <DropdownMenuItem
                onClick={() => setPaymentDialog({ open: true, revenue: row.original })}
              >
                <IconCash className='mr-2 size-4' />
                {t('business.recordPayment')}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='text-destructive'
              onClick={() => setDeleteId(row.original.id)}
            >
              <IconTrash className='mr-2 size-4' />
              {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount: -1,
    shallow: false,
    manualPagination: false,
    manualSorting: false,
    manualFiltering: false,
  });

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <Heading
            title={t('business.revenueManagement')}
            description={t('business.revenueDescription')}
          />
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              {isUsingMockData ? (
                <span className='flex items-center gap-1'>
                  <IconCloudOff className='size-3' />
                  Demo Data
                </span>
              ) : (
                <span className='flex items-center gap-1 text-green-600'>
                  <IconCloud className='size-3' />
                  Live API
                </span>
              )}
              <Button variant='ghost' size='icon' onClick={fetchData}>
                <IconRefresh className='size-4' />
              </Button>
            </div>
            <Link
              href='/dashboard/business/revenue/new'
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <IconPlus className='mr-2 size-4' />
              {t('business.newRevenue')}
            </Link>
          </div>
        </div>
        <Separator />
        {isLoading ? (
          <div className='space-y-4'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-96 w-full' />
          </div>
        ) : (
          <DataTable table={table} />
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('business.deleteRevenueConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Record payment dialog */}
      <Dialog
        open={paymentDialog.open}
        onOpenChange={(open) => setPaymentDialog({ open, revenue: open ? paymentDialog.revenue : null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('business.recordPayment')}</DialogTitle>
            <DialogDescription>
              {paymentDialog.revenue && (
                <>
                  {t('business.invoiceNumber')}：{paymentDialog.revenue.invoice_number}
                  <br />
                  {t('business.pendingAmount')}：HK${paymentDialog.revenue.pending_amount?.toLocaleString()}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='payment_amount'>{t('business.paymentAmount')} (HK$)</Label>
              <Input
                id='payment_amount'
                type='number'
                min={0}
                max={paymentDialog.revenue?.pending_amount}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={t('business.enterPaymentAmount')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setPaymentDialog({ open: false, revenue: null })}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleRecordPayment}>{t('business.confirmPayment')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
