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
  IconCurrencyDollar,
  IconUsers,
  IconTrendingUp,
  IconTrendingDown,
  IconClock,
  IconFileText,
  IconChartBar,
  IconRepeat,
  IconBriefcase,
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
import { revenueTrendsApi, RevenueTrend } from '@/features/business/services';

// Format number to currency
const formatCurrency = (value?: number) => {
  if (!value) return '-';
  return new Intl.NumberFormat('zh-HK', {
    style: 'currency',
    currency: 'HKD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format date
const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('zh-HK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function RevenueTrendDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [data, setData] = useState<RevenueTrend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await revenueTrendsApi.get(resolvedParams.id);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch revenue trend:', error);
        toast.error('無法載入收入趨勢資料');
        // Use mock data for demo
        setData({
          id: resolvedParams.id,
          period: '2024-Q4',
          total_revenue: 5800000,
          recurring_revenue: 3200000,
          project_revenue: 2600000,
          client_count: 45,
          avg_revenue_per_client: 128889,
          growth_rate: 15.5,
          notes: '本季度收入創新高，主要得益於新客戶增加及現有客戶合約升級。經常性收入佔比持續提升，業務穩定性增強。',
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
      await revenueTrendsApi.delete(resolvedParams.id);
      toast.success('收入趨勢記錄已刪除');
      router.push('/dashboard/business/revenue-trends');
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
          <p className='text-muted-foreground'>找不到收入趨勢資料</p>
          <Link
            href='/dashboard/business/revenue-trends'
            className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}
          >
            返回列表
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isPositiveGrowth = (data.growth_rate || 0) >= 0;
  const recurringPercentage = data.total_revenue
    ? ((data.recurring_revenue || 0) / data.total_revenue * 100).toFixed(1)
    : '0';
  const projectPercentage = data.total_revenue
    ? ((data.project_revenue || 0) / data.total_revenue * 100).toFixed(1)
    : '0';

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link
              href='/dashboard/business/revenue-trends'
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            >
              <IconArrowLeft className='size-4' />
            </Link>
            <Heading
              title={data.period || '收入趨勢'}
              description='收入趨勢追蹤記錄'
            />
          </div>
          <div className='flex items-center gap-2'>
            <Link
              href={`/dashboard/business/revenue-trends/${resolvedParams.id}/edit`}
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
          {/* Total Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconCurrencyDollar className='size-5' />
                總收入
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-4'>
                <div className='text-3xl font-bold'>
                  {formatCurrency(data.total_revenue)}
                </div>
                <Badge
                  variant={isPositiveGrowth ? 'success' : 'destructive'}
                  className='gap-1 text-sm px-3 py-1'
                >
                  {isPositiveGrowth ? (
                    <IconTrendingUp className='size-4' />
                  ) : (
                    <IconTrendingDown className='size-4' />
                  )}
                  {isPositiveGrowth ? '+' : ''}{data.growth_rate?.toFixed(1)}%
                </Badge>
              </div>
              <p className='text-sm text-muted-foreground'>
                與上期比較之增長率
              </p>
            </CardContent>
          </Card>

          {/* Client Stats */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconUsers className='size-5' />
                客戶統計
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>客戶數量</p>
                  <p className='text-2xl font-bold'>{data.client_count}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>平均客戶收入</p>
                  <p className='text-2xl font-bold font-mono'>
                    {formatCurrency(data.avg_revenue_per_client)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconChartBar className='size-5' />
                收入構成
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <IconRepeat className='size-4 text-blue-600' />
                    <span>經常性收入</span>
                  </div>
                  <div className='text-right'>
                    <span className='font-mono font-medium'>
                      {formatCurrency(data.recurring_revenue)}
                    </span>
                    <span className='ml-2 text-sm text-muted-foreground'>
                      ({recurringPercentage}%)
                    </span>
                  </div>
                </div>
                <div className='h-2 rounded-full bg-muted overflow-hidden'>
                  <div
                    className='h-full bg-blue-600 rounded-full'
                    style={{ width: `${recurringPercentage}%` }}
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <IconBriefcase className='size-4 text-green-600' />
                    <span>項目收入</span>
                  </div>
                  <div className='text-right'>
                    <span className='font-mono font-medium'>
                      {formatCurrency(data.project_revenue)}
                    </span>
                    <span className='ml-2 text-sm text-muted-foreground'>
                      ({projectPercentage}%)
                    </span>
                  </div>
                </div>
                <div className='h-2 rounded-full bg-muted overflow-hidden'>
                  <div
                    className='h-full bg-green-600 rounded-full'
                    style={{ width: `${projectPercentage}%` }}
                  />
                </div>
              </div>
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
                  <p className='text-sm text-muted-foreground'>期間</p>
                  <p className='font-medium'>{data.period}</p>
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
              確定要刪除此收入趨勢記錄嗎？此操作無法撤銷。
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
