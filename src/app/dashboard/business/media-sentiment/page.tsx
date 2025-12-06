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
  IconMoodSmile,
  IconMoodNeutral,
  IconMoodSad,
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
import { mediaSentimentApi, MediaSentimentRecord } from '@/features/business/services';

// Format date
const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('zh-HK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format number for display
const formatNumber = (value?: number) => {
  if (!value) return '0';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
};

// Get sentiment score badge
const getSentimentBadge = (score?: number) => {
  if (!score) return { label: '-', variant: 'secondary', icon: IconMoodNeutral };
  if (score >= 0.5) return { label: '正面', variant: 'success', icon: IconMoodSmile };
  if (score >= -0.5) return { label: '中性', variant: 'default', icon: IconMoodNeutral };
  return { label: '負面', variant: 'destructive', icon: IconMoodSad };
};

export default function MediaSentimentPage() {
  const router = useRouter();
  const [data, setData] = useState<MediaSentimentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Mock data for demo
  const mockData: MediaSentimentRecord[] = [
    {
      id: 'demo-1',
      period_date: '2024-12-01',
      positive_count: 45,
      neutral_count: 30,
      negative_count: 5,
      total_reach: 2500000,
      total_engagement: 125000,
      sentiment_score: 0.65,
      notes: '本月媒體報導整體正面，主要來自年度業績公告',
      is_active: true,
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z',
    },
    {
      id: 'demo-2',
      period_date: '2024-11-01',
      positive_count: 38,
      neutral_count: 28,
      negative_count: 8,
      total_reach: 2100000,
      total_engagement: 98000,
      sentiment_score: 0.45,
      notes: '季度業績公告期間',
      is_active: true,
      created_at: '2024-11-01T00:00:00Z',
      updated_at: '2024-11-01T00:00:00Z',
    },
    {
      id: 'demo-3',
      period_date: '2024-10-01',
      positive_count: 25,
      neutral_count: 40,
      negative_count: 15,
      total_reach: 1800000,
      total_engagement: 72000,
      sentiment_score: 0.12,
      notes: '市場波動期間，中性報導增加',
      is_active: true,
      created_at: '2024-10-01T00:00:00Z',
      updated_at: '2024-10-01T00:00:00Z',
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await mediaSentimentApi.list({ ordering: '-period_date' });
      const results = response.results || [];
      
      if (results.length === 0) {
        console.log('[MediaSentiment] API returned empty, using mock data');
        setData(mockData);
        setIsUsingMockData(true);
      } else {
        setData(results);
        setIsUsingMockData(false);
      }
    } catch (error) {
      console.error('Failed to fetch media sentiment:', error);
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
      await mediaSentimentApi.delete(deleteId);
      toast.success('媒體情緒記錄已刪除');
      fetchData();
    } catch (error) {
      toast.error('刪除失敗');
    }
    setDeleteId(null);
  };

  const columns: ColumnDef<MediaSentimentRecord>[] = [
    {
      accessorKey: 'period_date',
      header: '日期',
      cell: ({ row }) => (
        <Link
          href={`/dashboard/business/media-sentiment/${row.original.id}`}
          className='font-medium text-primary hover:underline'
        >
          {formatDate(row.original.period_date)}
        </Link>
      ),
    },
    {
      accessorKey: 'sentiment_score',
      header: '情緒評分',
      cell: ({ row }) => {
        const score = row.original.sentiment_score;
        const numScore = typeof score === 'string' ? parseFloat(score) : score;
        const badge = getSentimentBadge(numScore);
        const Icon = badge.icon;
        return (
          <div className='flex items-center gap-2'>
            <Icon className='size-4' />
            <Badge variant={badge.variant as any}>{badge.label}</Badge>
            <span className='text-sm text-muted-foreground'>
              ({numScore ? numScore.toFixed(2) : '-'})
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'positive_count',
      header: '正面報導',
      cell: ({ row }) => (
        <span className='text-green-600 font-medium'>
          {row.original.positive_count}
        </span>
      ),
    },
    {
      accessorKey: 'neutral_count',
      header: '中性報導',
      cell: ({ row }) => (
        <span className='text-muted-foreground'>
          {row.original.neutral_count}
        </span>
      ),
    },
    {
      accessorKey: 'negative_count',
      header: '負面報導',
      cell: ({ row }) => (
        <span className='text-red-600 font-medium'>
          {row.original.negative_count}
        </span>
      ),
    },
    {
      accessorKey: 'total_reach',
      header: '總觸及',
      cell: ({ row }) => formatNumber(row.original.total_reach),
    },
    {
      accessorKey: 'total_engagement',
      header: '總互動',
      cell: ({ row }) => formatNumber(row.original.total_engagement),
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
                router.push(`/dashboard/business/media-sentiment/${row.original.id}`)
              }
            >
              <IconEye className='mr-2 size-4' />
              查看詳情
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/media-sentiment/${row.original.id}/edit`)
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
            title='媒體情緒追蹤'
            description='追蹤媒體報導情緒分析'
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
              href='/dashboard/business/media-sentiment/new'
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
              確定要刪除此媒體情緒記錄嗎？此操作無法撤銷。
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
