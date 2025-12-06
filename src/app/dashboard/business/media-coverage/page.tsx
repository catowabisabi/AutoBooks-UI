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
  IconExternalLink,
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
import { mediaCoverageApi, MediaCoverage } from '@/features/business/services';

const getSentimentColor = (sentiment: string) => {
  const colors: Record<string, string> = {
    POSITIVE: 'success',
    NEUTRAL: 'secondary',
    NEGATIVE: 'destructive',
  };
  return colors[sentiment] || 'secondary';
};

const getSentimentLabel = (sentiment: string) => {
  const labels: Record<string, string> = {
    POSITIVE: '正面',
    NEUTRAL: '中立',
    NEGATIVE: '負面',
  };
  return labels[sentiment] || sentiment;
};

const formatNumber = (value?: number) => {
  if (!value) return '-';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
};

export default function MediaCoveragePage() {
  const router = useRouter();
  const [data, setData] = useState<MediaCoverage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const mockData: MediaCoverage[] = [
    {
      id: 'demo-1',
      listed_client: 'demo-client-1',
      listed_client_name: 'ABC Holdings Ltd.',
      title: 'ABC Holdings 年度業績創新高',
      media_outlet: '經濟日報',
      publish_date: '2024-03-15',
      url: 'https://example.com/news/1',
      sentiment: 'POSITIVE',
      reach: 500000,
      engagement: 15000,
      is_press_release: false,
      is_active: true,
      created_at: '2024-03-15T00:00:00Z',
      updated_at: '2024-03-15T00:00:00Z',
    },
    {
      id: 'demo-2',
      listed_client: 'demo-client-2',
      listed_client_name: 'XYZ International',
      title: 'XYZ 宣布新產品線',
      media_outlet: '明報',
      publish_date: '2024-03-10',
      url: 'https://example.com/news/2',
      sentiment: 'POSITIVE',
      reach: 300000,
      engagement: 8000,
      is_press_release: true,
      is_active: true,
      created_at: '2024-03-10T00:00:00Z',
      updated_at: '2024-03-10T00:00:00Z',
    },
    {
      id: 'demo-3',
      listed_client: 'demo-client-1',
      listed_client_name: 'ABC Holdings Ltd.',
      title: '市場分析：ABC Holdings 前景',
      media_outlet: '信報',
      publish_date: '2024-03-08',
      sentiment: 'NEUTRAL',
      reach: 200000,
      engagement: 5000,
      is_press_release: false,
      is_active: true,
      created_at: '2024-03-08T00:00:00Z',
      updated_at: '2024-03-08T00:00:00Z',
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await mediaCoverageApi.list({ ordering: '-publish_date' });
      const results = response.results || [];
      
      if (results.length === 0) {
        console.log('[MediaCoverage] API returned empty, using mock data');
        setData(mockData);
        setIsUsingMockData(true);
      } else {
        setData(results);
        setIsUsingMockData(false);
      }
    } catch (error) {
      console.error('Failed to fetch media coverage:', error);
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
      await mediaCoverageApi.delete(deleteId);
      toast.success('媒體報導已刪除');
      fetchData();
    } catch (error) {
      toast.error('刪除失敗');
    }
    setDeleteId(null);
  };

  const columns: ColumnDef<MediaCoverage>[] = [
    {
      accessorKey: 'title',
      header: '標題',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Link
            href={`/dashboard/business/media-coverage/${row.original.id}`}
            className='font-medium text-primary hover:underline max-w-[250px] truncate block'
          >
            {row.original.title}
          </Link>
          {row.original.url && (
            <a href={row.original.url} target='_blank' rel='noopener noreferrer'>
              <IconExternalLink className='size-4 text-muted-foreground hover:text-primary' />
            </a>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'listed_client_name',
      header: '客戶',
      cell: ({ row }) => row.original.listed_client_name || row.original.company_name || '-',
    },
    {
      accessorKey: 'media_outlet',
      header: '媒體',
    },
    {
      accessorKey: 'publish_date',
      header: '發布日期',
      cell: ({ row }) =>
        row.original.publish_date
          ? new Date(row.original.publish_date).toLocaleDateString('zh-TW')
          : '-',
    },
    {
      accessorKey: 'sentiment',
      header: '情緒',
      cell: ({ row }) => (
        <Badge variant={getSentimentColor(row.original.sentiment) as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'}>
          {getSentimentLabel(row.original.sentiment)}
        </Badge>
      ),
    },
    {
      accessorKey: 'reach',
      header: '觸及人數',
      cell: ({ row }) => formatNumber(row.original.reach),
    },
    {
      accessorKey: 'is_press_release',
      header: '新聞稿',
      cell: ({ row }) => (
        <Badge variant={row.original.is_press_release ? 'default' : 'outline'}>
          {row.original.is_press_release ? '是' : '否'}
        </Badge>
      ),
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
                router.push(`/dashboard/business/media-coverage/${row.original.id}`)
              }
            >
              <IconEye className='mr-2 size-4' />
              查看詳情
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/media-coverage/${row.original.id}/edit`)
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
            title='媒體報導'
            description='管理媒體報導和新聞稿'
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
              href='/dashboard/business/media-coverage/new'
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <IconPlus className='mr-2 size-4' />
              新增報導
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
              確定要刪除此媒體報導嗎？此操作無法撤銷。
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
