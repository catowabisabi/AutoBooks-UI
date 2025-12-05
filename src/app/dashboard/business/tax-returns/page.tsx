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
import { taxReturnsApi, TaxReturnCase } from '@/features/business/services';

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'secondary',
    IN_PROGRESS: 'default',
    UNDER_REVIEW: 'outline',
    SUBMITTED: 'default',
    ACCEPTED: 'success',
    REJECTED: 'destructive',
    AMENDED: 'outline',
  };
  return colors[status] || 'secondary';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: '待處理',
    IN_PROGRESS: '處理中',
    UNDER_REVIEW: '審核中',
    SUBMITTED: '已提交',
    ACCEPTED: '已接受',
    REJECTED: '已退回',
    AMENDED: '已修正',
  };
  return labels[status] || status;
};

export default function TaxReturnsListPage() {
  const router = useRouter();
  const [data, setData] = useState<TaxReturnCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await taxReturnsApi.list({ ordering: '-deadline' });
      setData(response.results || []);
      setIsUsingMockData(false);
    } catch (error) {
      console.error('Failed to fetch tax returns:', error);
      setIsUsingMockData(true);
      setData([
        {
          id: 'demo-1',
          company: 'demo-company-1',
          company_name: 'ABC 有限公司',
          tax_year: '2023/24',
          tax_type: 'Profits Tax',
          progress: 60,
          status: 'IN_PROGRESS',
          deadline: '2024-04-30',
          handler: 'demo-user-1',
          handler_name: '王會計',
          tax_amount: 150000,
          documents_received: true,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-02-01T00:00:00Z',
        },
        {
          id: 'demo-2',
          company: 'demo-company-2',
          company_name: 'XYZ 科技股份有限公司',
          tax_year: '2023/24',
          tax_type: 'Salaries Tax',
          progress: 100,
          status: 'ACCEPTED',
          deadline: '2024-03-31',
          submitted_date: '2024-03-15',
          handler: 'demo-user-2',
          handler_name: '李經理',
          tax_amount: 85000,
          documents_received: true,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-03-15T00:00:00Z',
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
      await taxReturnsApi.delete(deleteId);
      toast.success('稅務申報已刪除');
      fetchData();
    } catch (error) {
      toast.error('刪除失敗');
    }
    setDeleteId(null);
  };

  const columns: ColumnDef<TaxReturnCase>[] = [
    {
      accessorKey: 'company_name',
      header: '客戶公司',
      cell: ({ row }) => (
        <Link
          href={`/dashboard/business/tax-returns/${row.original.id}`}
          className='font-medium text-primary hover:underline'
        >
          {row.original.company_name || row.original.company}
        </Link>
      ),
    },
    {
      accessorKey: 'tax_year',
      header: '課稅年度',
    },
    {
      accessorKey: 'tax_type',
      header: '稅種',
    },
    {
      accessorKey: 'status',
      header: '狀態',
      cell: ({ row }) => (
        <Badge variant={getStatusColor(row.original.status) as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'}>
          {getStatusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: 'progress',
      header: '進度',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <div className='h-2 w-20 rounded-full bg-muted'>
            <div
              className='h-2 rounded-full bg-primary'
              style={{ width: `${row.original.progress}%` }}
            />
          </div>
          <span className='text-sm text-muted-foreground'>
            {row.original.progress}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'deadline',
      header: '截止日期',
      cell: ({ row }) =>
        row.original.deadline
          ? new Date(row.original.deadline).toLocaleDateString('zh-TW')
          : '-',
    },
    {
      accessorKey: 'tax_amount',
      header: '稅額',
      cell: ({ row }) =>
        row.original.tax_amount
          ? `HK$${row.original.tax_amount.toLocaleString()}`
          : '-',
    },
    {
      accessorKey: 'handler_name',
      header: '負責人',
      cell: ({ row }) => row.original.handler_name || '-',
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
                router.push(`/dashboard/business/tax-returns/${row.original.id}`)
              }
            >
              <IconEye className='mr-2 size-4' />
              查看詳情
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/tax-returns/${row.original.id}/edit`)
              }
            >
              <IconEdit className='mr-2 size-4' />
              編輯
            </DropdownMenuItem>
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
            title='稅務申報管理'
            description='管理所有稅務申報案件、追蹤進度與狀態'
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
              href='/dashboard/business/tax-returns/new'
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <IconPlus className='mr-2 size-4' />
              新增案件
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除此稅務申報案件嗎？此操作無法撤銷。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>刪除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
