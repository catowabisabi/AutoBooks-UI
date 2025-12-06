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
import { Progress } from '@/components/ui/progress';
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
import { engagementsApi, ActiveEngagement } from '@/features/business/services';

// Status badge color mapping
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'ACTIVE': 'success',
    'PAUSED': 'warning',
    'COMPLETED': 'default',
    'CANCELLED': 'destructive',
  };
  return colors[status] || 'secondary';
};

// Format currency for display
const formatCurrency = (value?: number) => {
  if (!value) return '-';
  return `HK$${value.toLocaleString()}`;
};

// Format date
const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('zh-HK');
};

export default function EngagementsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [data, setData] = useState<ActiveEngagement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Engagement type label mapping
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'RETAINER': t('business.retainer'),
      'PROJECT': t('business.project'),
      'AD_HOC': t('business.adHoc'),
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'ACTIVE': t('business.inProgress'),
      'PAUSED': t('business.paused'),
      'COMPLETED': t('business.completed'),
      'CANCELLED': t('business.cancelled'),
    };
    return labels[status] || status;
  };

  // Mock data for demo
  const mockData: ActiveEngagement[] = [
    {
      id: 'demo-1',
      company: 'demo-company-1',
      company_name: 'ABC Holdings Ltd.',
      title: '年度公關服務',
      engagement_type: 'RETAINER',
      status: 'ACTIVE',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      value: 600000,
      progress: 75,
      lead: 'user-1',
      lead_name: 'John Wong',
      notes: '年度長期服務合約',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-11-15T00:00:00Z',
    },
    {
      id: 'demo-2',
      company: 'demo-company-2',
      company_name: 'XYZ International',
      title: 'IPO 顧問項目',
      engagement_type: 'PROJECT',
      status: 'ACTIVE',
      start_date: '2024-06-01',
      value: 2000000,
      progress: 45,
      lead: 'user-2',
      lead_name: 'Mary Lee',
      notes: 'IPO 上市項目',
      is_active: true,
      created_at: '2024-06-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z',
    },
    {
      id: 'demo-3',
      company: 'demo-company-3',
      company_name: 'Global Tech Inc.',
      title: '危機公關處理',
      engagement_type: 'AD_HOC',
      status: 'COMPLETED',
      start_date: '2024-10-01',
      end_date: '2024-11-15',
      value: 150000,
      progress: 100,
      lead: 'user-1',
      lead_name: 'John Wong',
      notes: '緊急危機處理',
      is_active: true,
      created_at: '2024-10-01T00:00:00Z',
      updated_at: '2024-11-15T00:00:00Z',
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await engagementsApi.list({ ordering: '-created_at' });
      const results = response.results || [];
      
      if (results.length === 0) {
        console.log('[Engagements] API returned empty, using mock data');
        setData(mockData);
        setIsUsingMockData(true);
      } else {
        setData(results);
        setIsUsingMockData(false);
      }
    } catch (error) {
      console.error('Failed to fetch engagements:', error);
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
      await engagementsApi.delete(deleteId);
      toast.success(t('business.recordDeleted'));
      fetchData();
    } catch (error) {
      toast.error(t('common.deleteFailed'));
    }
    setDeleteId(null);
  };

  const columns: ColumnDef<ActiveEngagement>[] = [
    {
      accessorKey: 'title',
      header: t('business.projectName'),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/business/engagements/${row.original.id}`}
          className='font-medium text-primary hover:underline'
        >
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: 'company_name',
      header: t('business.client'),
      cell: ({ row }) => row.original.company_name || '-',
    },
    {
      accessorKey: 'engagement_type',
      header: t('business.engagementType'),
      cell: ({ row }) => (
        <Badge variant='outline'>
          {getTypeLabel(row.original.engagement_type)}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ row }) => (
        <Badge variant={getStatusColor(row.original.status) as any}>
          {getStatusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: 'value',
      header: t('business.value'),
      cell: ({ row }) => (
        <span className='font-semibold'>
          {formatCurrency(row.original.value)}
        </span>
      ),
    },
    {
      accessorKey: 'progress',
      header: t('common.progress'),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Progress value={row.original.progress || 0} className='w-16' />
          <span className='text-sm text-muted-foreground'>
            {row.original.progress || 0}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'lead_name',
      header: t('business.lead'),
      cell: ({ row }) => row.original.lead_name || '-',
    },
    {
      accessorKey: 'start_date',
      header: t('business.startDate'),
      cell: ({ row }) => formatDate(row.original.start_date),
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
                router.push(`/dashboard/business/engagements/${row.original.id}`)
              }
            >
              <IconEye className='mr-2 size-4' />
              {t('common.viewDetails')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/engagements/${row.original.id}/edit`)
              }
            >
              <IconEdit className='mr-2 size-4' />
              {t('common.edit')}
            </DropdownMenuItem>
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
            title={t('business.engagementsManagement')}
            description={t('business.engagementsDescription')}
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
              href='/dashboard/business/engagements/new'
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <IconPlus className='mr-2 size-4' />
              {t('business.newEngagement')}
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
              確定要刪除此項目委託嗎？此操作無法撤銷。
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
