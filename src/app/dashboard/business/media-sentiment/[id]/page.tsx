'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  IconEdit,
  IconArrowLeft,
  IconTrash,
  IconMoodSmile,
  IconMoodNeutral,
  IconMoodSad,
  IconEye,
  IconThumbUp,
  IconClock,
  IconFileText,
  IconChartBar,
} from '@tabler/icons-react';
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
    month: 'long',
    day: 'numeric',
  });
};

// Format number for display
const formatNumber = (value?: number) => {
  if (!value) return '0';
  return value.toLocaleString();
};

// Get sentiment score badge
const getSentimentBadge = (score?: number) => {
  if (!score) return { label: '-', variant: 'secondary', icon: IconMoodNeutral };
  if (score >= 0.5) return { label: '正面', variant: 'success', icon: IconMoodSmile };
  if (score >= -0.5) return { label: '中性', variant: 'default', icon: IconMoodNeutral };
  return { label: '負面', variant: 'destructive', icon: IconMoodSad };
};

export default function MediaSentimentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [data, setData] = useState<MediaSentimentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await mediaSentimentApi.get(resolvedParams.id);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch media sentiment:', error);
        toast.error('無法載入媒體情緒資料');
        // Use mock data for demo
        setData({
          id: resolvedParams.id,
          period_date: '2024-12-01',
          positive_count: 45,
          neutral_count: 30,
          negative_count: 5,
          total_reach: 2500000,
          total_engagement: 125000,
          sentiment_score: 0.65,
          notes: '本月媒體報導整體正面，主要來自年度業績公告發佈。各主要財經媒體均有報導，社交媒體反應良好。',
          is_active: true,
          created_at: '2024-12-01T00:00:00Z',
          updated_at: '2024-12-01T00:00:00Z',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id]);

  const handleDelete = async () => {
    try {
      await mediaSentimentApi.delete(resolvedParams.id);
      toast.success('媒體情緒記錄已刪除');
      router.push('/dashboard/business/media-sentiment');
    } catch (error) {
      toast.error('刪除失敗');
    }
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className='space-y-4'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-96' />
          <Separator />
          <div className='grid gap-4 md:grid-cols-2'>
            <Skeleton className='h-48' />
            <Skeleton className='h-48' />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer>
        <div className='flex flex-col items-center justify-center py-12'>
          <p className='text-muted-foreground'>找不到媒體情緒資料</p>
          <Link
            href='/dashboard/business/media-sentiment'
            className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}
          >
            返回列表
          </Link>
        </div>
      </PageContainer>
    );
  }

  const sentimentBadge = getSentimentBadge(data.sentiment_score);
  const SentimentIcon = sentimentBadge.icon;
  const totalCount = data.positive_count + data.neutral_count + data.negative_count;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link
              href='/dashboard/business/media-sentiment'
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            >
              <IconArrowLeft className='size-4' />
            </Link>
            <Heading
              title={formatDate(data.period_date)}
              description='媒體情緒追蹤記錄'
            />
          </div>
          <div className='flex items-center gap-2'>
            <Link
              href={`/dashboard/business/media-sentiment/${resolvedParams.id}/edit`}
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              <IconEdit className='mr-2 size-4' />
              編輯
            </Link>
            <Button variant='destructive' onClick={() => setShowDeleteDialog(true)}>
              <IconTrash className='mr-2 size-4' />
              刪除
            </Button>
          </div>
        </div>
        <Separator />

        <div className='grid gap-4 md:grid-cols-2'>
          {/* Sentiment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <SentimentIcon className='size-5' />
                情緒總覽
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-4'>
                <div className='text-4xl font-bold'>
                  {data.sentiment_score?.toFixed(2) || '-'}
                </div>
                <Badge variant={sentimentBadge.variant as any} className='text-lg px-4 py-1'>
                  {sentimentBadge.label}
                </Badge>
              </div>
              <p className='text-sm text-muted-foreground'>
                情緒評分範圍：-1 (非常負面) 至 +1 (非常正面)
              </p>
            </CardContent>
          </Card>

          {/* Report Counts */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconChartBar className='size-5' />
                報導統計
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-3 gap-4 text-center'>
                <div>
                  <IconMoodSmile className='mx-auto size-8 text-green-600' />
                  <p className='mt-2 text-2xl font-bold text-green-600'>
                    {data.positive_count}
                  </p>
                  <p className='text-sm text-muted-foreground'>正面</p>
                </div>
                <div>
                  <IconMoodNeutral className='mx-auto size-8 text-gray-500' />
                  <p className='mt-2 text-2xl font-bold text-gray-500'>
                    {data.neutral_count}
                  </p>
                  <p className='text-sm text-muted-foreground'>中性</p>
                </div>
                <div>
                  <IconMoodSad className='mx-auto size-8 text-red-600' />
                  <p className='mt-2 text-2xl font-bold text-red-600'>
                    {data.negative_count}
                  </p>
                  <p className='text-sm text-muted-foreground'>負面</p>
                </div>
              </div>
              <div className='mt-4'>
                <p className='text-sm text-muted-foreground'>總報導數</p>
                <p className='text-xl font-bold'>{totalCount}</p>
              </div>
            </CardContent>
          </Card>

          {/* Reach & Engagement */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconEye className='size-5' />
                觸及與互動
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>總觸及人數</p>
                  <p className='text-2xl font-bold'>
                    {formatNumber(data.total_reach)}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>總互動數</p>
                  <p className='text-2xl font-bold'>
                    {formatNumber(data.total_engagement)}
                  </p>
                </div>
              </div>
              {data.total_reach && data.total_engagement && (
                <div>
                  <p className='text-sm text-muted-foreground'>互動率</p>
                  <p className='font-medium'>
                    {((data.total_engagement / data.total_reach) * 100).toFixed(2)}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconFileText className='size-5' />
                備註
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap'>{data.notes || '無備註'}</p>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconClock className='size-5' />
                系統資訊
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>記錄日期</p>
                  <p className='font-medium'>{formatDate(data.period_date)}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>創建時間</p>
                  <p className='font-medium'>{formatDate(data.created_at)}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>狀態</p>
                  <Badge variant={data.is_active ? 'success' : 'secondary'}>
                    {data.is_active ? '啟用' : '停用'}
                  </Badge>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>ID</p>
                  <p className='font-mono text-sm'>{data.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
