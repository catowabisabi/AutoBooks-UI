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
  IconStar,
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
import { clientPerformanceApi, ClientPerformance } from '@/features/business/services';

// Format quarter for display
const formatQuarter = (year: number, quarter: number) => {
  return `${year}年 Q${quarter}`;
};

// Format currency for display
const formatCurrency = (value?: number) => {
  if (!value) return '-';
  if (value >= 1000000) return `HK$${(value / 1000000).toFixed(1)}M`;
  return `HK$${value.toLocaleString()}`;
};

// Get satisfaction score badge
const getSatisfactionBadge = (score?: number) => {
  if (!score) return { label: '-', variant: 'secondary' };
  if (score >= 4.5) return { label: `${score} 優秀`, variant: 'success' };
  if (score >= 3.5) return { label: `${score} 良好`, variant: 'default' };
  if (score >= 2.5) return { label: `${score} 一般`, variant: 'warning' };
  return { label: `${score} 需改善`, variant: 'destructive' };
};

export default function ClientPerformancePage() {
  const router = useRouter();
  const [data, setData] = useState<ClientPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Mock data for demo
  const mockData: ClientPerformance[] = [
    {
      id: 'demo-1',
      company: 'demo-company-1',
      company_name: 'ABC Holdings Ltd.',
      period_year: 2024,
      period_quarter: 4,
      revenue_generated: 450000,
      satisfaction_score: 4.8,
      projects_completed: 3,
      referrals_made: 2,
      response_time_hours: 4,
      notes: '表現優異，續約意願高',
      is_active: true,
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z',
    },
    {
      id: 'demo-2',
      company: 'demo-company-2',
      company_name: 'XYZ International',
      period_year: 2024,
      period_quarter: 4,
      revenue_generated: 800000,
      satisfaction_score: 4.2,
      projects_completed: 5,
      referrals_made: 1,
      response_time_hours: 6,
      notes: 'IPO 項目進行中',
      is_active: true,
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z',
    },
    {
      id: 'demo-3',
      company: 'demo-company-3',
      company_name: 'Global Tech Inc.',
      period_year: 2024,
      period_quarter: 3,
      revenue_generated: 150000,
      satisfaction_score: 3.5,
      projects_completed: 1,
      referrals_made: 0,
      response_time_hours: 12,
      notes: '需加強溝通',
      is_active: true,
      created_at: '2024-10-01T00:00:00Z',
      updated_at: '2024-10-01T00:00:00Z',
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await clientPerformanceApi.list({ ordering: '-period_year,-period_quarter' });
      const results = response.results || [];
      
      if (results.length === 0) {
        console.log('[ClientPerformance] API returned empty, using mock data');
        setData(mockData);
        setIsUsingMockData(true);
      } else {
        setData(results);
        setIsUsingMockData(false);
      }
    } catch (error) {
      console.error('Failed to fetch client performance:', error);
      setIsUsingMockData(true);
      setData(mockData);
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
      await clientPerformanceApi.delete(deleteId);
      toast.success('客戶績效記錄已刪除');
      fetchData();
    } catch (error) {
      toast.error('刪除失敗');
    }
    setDeleteId(null);
  };

  const columns: ColumnDef<ClientPerformance>[] = [
    {
      accessorKey: 'company_name',
      header: '客戶公司',
      cell: ({ row }) => (
        <Link
          href={`/dashboard/business/client-performance/${row.original.id}`}
          className='font-medium text-primary hover:underline'
        >
          {row.original.company_name || '-'}
        </Link>
      ),
    },
    {
      id: 'period',
      header: '期間',
      cell: ({ row }) => formatQuarter(row.original.period_year, row.original.period_quarter),
    },
    {
      accessorKey: 'revenue_generated',
      header: '產生收入',
      cell: ({ row }) => (
        <span className='font-semibold text-green-600'>
          {formatCurrency(row.original.revenue_generated)}
        </span>
      ),
    },
    {
      accessorKey: 'satisfaction_score',
      header: '滿意度',
      cell: ({ row }) => {
        const badge = getSatisfactionBadge(row.original.satisfaction_score);
        return (
          <Badge variant={badge.variant as any}>
            <IconStar className='mr-1 size-3' />
            {badge.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'projects_completed',
      header: '完成項目',
      cell: ({ row }) => row.original.projects_completed || 0,
    },
    {
      accessorKey: 'referrals_made',
      header: '推薦數',
      cell: ({ row }) => row.original.referrals_made || 0,
    },
    {
      accessorKey: 'response_time_hours',
      header: '響應時間',
      cell: ({ row }) => 
        row.original.response_time_hours 
          ? `${row.original.response_time_hours} 小時`
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
                router.push(`/dashboard/business/client-performance/${row.original.id}`)
              }
            >
              <IconEye className='mr-2 size-4' />
              查看詳情
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/client-performance/${row.original.id}/edit`)
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
            title='客戶績效'
            description='追蹤客戶季度績效表現'
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
              href='/dashboard/business/client-performance/new'
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <IconPlus className='mr-2 size-4' />
              新增記錄
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
              確定要刪除此客戶績效記錄嗎？此操作無法撤銷。
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
