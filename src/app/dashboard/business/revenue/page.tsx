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
    PENDING: '待收款',
    PARTIAL: '部分收款',
    RECEIVED: '已收款',
    OVERDUE: '逾期',
    WRITTEN_OFF: '已核銷',
  };
  return labels[status] || status;
};

export default function RevenueListPage() {
  const router = useRouter();
  const [data, setData] = useState<Revenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; revenue: Revenue | null }>({
    open: false,
    revenue: null,
  });
  const [paymentAmount, setPaymentAmount] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await revenueApi.list({ ordering: '-invoice_date' });
      setData(response.results || []);
      setIsUsingMockData(false);
    } catch (error) {
      console.error('Failed to fetch revenue:', error);
      setIsUsingMockData(true);
      setData([
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
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await revenueApi.delete(deleteId);
      toast.success('收入記錄已刪除');
      fetchData();
    } catch (error) {
      toast.error('刪除失敗');
    }
    setDeleteId(null);
  };

  const handleRecordPayment = async () => {
    if (!paymentDialog.revenue || !paymentAmount) return;
    try {
      await revenueApi.recordPayment(paymentDialog.revenue.id, parseFloat(paymentAmount));
      toast.success('付款已記錄');
      setPaymentDialog({ open: false, revenue: null });
      setPaymentAmount('');
      fetchData();
    } catch (error) {
      toast.error('記錄付款失敗');
    }
  };

  const columns: ColumnDef<Revenue>[] = [
    {
      accessorKey: 'invoice_number',
      header: '發票編號',
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
      header: '客戶公司',
      cell: ({ row }) => row.original.company_name || '-',
    },
    {
      accessorKey: 'description',
      header: '描述',
      cell: ({ row }) => (
        <span className='line-clamp-1 max-w-[200px]'>
          {row.original.description || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'total_amount',
      header: '總金額',
      cell: ({ row }) => `HK$${row.original.total_amount.toLocaleString()}`,
    },
    {
      accessorKey: 'received_amount',
      header: '已收金額',
      cell: ({ row }) => `HK$${row.original.received_amount.toLocaleString()}`,
    },
    {
      accessorKey: 'pending_amount',
      header: '待收金額',
      cell: ({ row }) =>
        row.original.pending_amount
          ? `HK$${row.original.pending_amount.toLocaleString()}`
          : '-',
    },
    {
      accessorKey: 'status',
      header: '狀態',
      cell: ({ row }) => (
        <Badge variant={getStatusColor(row.original.status)}>
          {getStatusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: 'due_date',
      header: '到期日',
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
              查看詳情
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/revenue/${row.original.id}/edit`)
              }
            >
              <IconEdit className='mr-2 size-4' />
              編輯
            </DropdownMenuItem>
            {row.original.status !== 'RECEIVED' && (
              <DropdownMenuItem
                onClick={() => setPaymentDialog({ open: true, revenue: row.original })}
              >
                <IconCash className='mr-2 size-4' />
                記錄付款
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='text-destructive'
              onClick={() => setDeleteId(row.original.id)}
            >
              <IconTrash className='mr-2 size-4' />
              刪除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount: Math.ceil(data.length / 10) || 1,
    shallow: false,
  });

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <Heading
            title='收入管理'
            description='管理所有收入記錄、追蹤應收帳款'
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
              新增收入
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
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除此收入記錄嗎？此操作無法撤銷。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>刪除</AlertDialogAction>
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
            <DialogTitle>記錄付款</DialogTitle>
            <DialogDescription>
              {paymentDialog.revenue && (
                <>
                  發票編號：{paymentDialog.revenue.invoice_number}
                  <br />
                  待收金額：HK${paymentDialog.revenue.pending_amount?.toLocaleString()}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='payment_amount'>付款金額 (HK$)</Label>
              <Input
                id='payment_amount'
                type='number'
                min={0}
                max={paymentDialog.revenue?.pending_amount}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder='輸入付款金額'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setPaymentDialog({ open: false, revenue: null })}>
              取消
            </Button>
            <Button onClick={handleRecordPayment}>確認付款</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
