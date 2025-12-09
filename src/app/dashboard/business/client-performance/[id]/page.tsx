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
  IconStar,
  IconClock,
  IconFileText,
  IconUsers,
  IconCheckbox,
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
import { clientPerformanceApi, ClientPerformance } from '@/features/business/services';

// Format quarter for display
const formatQuarter = (year: number, quarter: number) => {
  return `${year}年 Q${quarter}`;
};

// Format currency for display
const formatCurrency = (value?: number) => {
  if (!value) return '-';
  return `HK$${value.toLocaleString()}`;
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

// Get satisfaction score badge
const getSatisfactionBadge = (score?: number) => {
  if (!score) return { label: '-', variant: 'secondary' };
  if (score >= 4.5) return { label: '優秀', variant: 'success' };
  if (score >= 3.5) return { label: '良好', variant: 'default' };
  if (score >= 2.5) return { label: '一般', variant: 'warning' };
  return { label: '需改善', variant: 'destructive' };
};

export default function ClientPerformanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [data, setData] = useState<ClientPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await clientPerformanceApi.get(resolvedParams.id);
        setData(result);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch client performance:', error);
        toast.error('無法載入客戶績效資料');
        // Use mock data for demo
        setData({
          id: resolvedParams.id,
          company: 'demo-company-1',
          company_name: 'ABC Holdings Ltd.',
          period_year: 2024,
          period_quarter: 4,
          revenue_generated: 450000,
          satisfaction_score: 4.8,
          projects_completed: 3,
          referrals_made: 2,
          response_time_hours: 4,
          notes: '表現優異，續約意願高。本季度完成年度報告、業績公告及投資者會議安排，客戶反饋非常滿意。',
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
      await clientPerformanceApi.delete(resolvedParams.id);
      toast.success('客戶績效記錄已刪除');
      router.push('/dashboard/business/client-performance');
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
          <p className='text-muted-foreground'>找不到客戶績效資料</p>
          <Link
            href='/dashboard/business/client-performance'
            className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}
          >
            返回列表
          </Link>
        </div>
      </PageContainer>
    );
  }

  const satisfactionBadge = getSatisfactionBadge(data.satisfaction_score);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link
              href='/dashboard/business/client-performance'
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            >
              <IconArrowLeft className='size-4' />
            </Link>
            <div>
              <Heading
                title={data.company_name || '客戶績效詳情'}
                description={formatQuarter(data.period_year, data.period_quarter)}
              />
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Link
              href={`/dashboard/business/client-performance/${resolvedParams.id}/edit`}
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
          {/* Revenue Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconCurrencyDollar className='size-5' />
                收入表現
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>產生收入</p>
                <p className='text-2xl font-bold text-green-600'>
                  {formatCurrency(data.revenue_generated)}
                </p>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>年份</p>
                  <p className='font-medium'>{data.period_year}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>季度</p>
                  <p className='font-medium'>Q{data.period_quarter}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Satisfaction */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconStar className='size-5' />
                滿意度
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-4'>
                <div className='text-4xl font-bold'>{data.satisfaction_score || '-'}</div>
                <div className='flex flex-col'>
                  <span className='text-sm text-muted-foreground'>滿分 5.0</span>
                  <Badge variant={satisfactionBadge.variant as any}>
                    {satisfactionBadge.label}
                  </Badge>
                </div>
              </div>
              <div className='flex gap-1'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconStar
                    key={star}
                    className={cn(
                      'size-6',
                      star <= Math.round(data.satisfaction_score || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projects & Referrals */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconCheckbox className='size-5' />
                項目成果
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>完成項目數</p>
                  <p className='text-2xl font-bold'>{data.projects_completed || 0}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>推薦數</p>
                  <p className='text-2xl font-bold'>{data.referrals_made || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconClock className='size-5' />
                響應效率
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>平均響應時間</p>
                <p className='text-2xl font-bold'>
                  {data.response_time_hours ? `${data.response_time_hours} 小時` : '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className='md:col-span-2'>
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
                <IconUsers className='size-5' />
                系統資訊
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>創建時間</p>
                  <p className='font-medium'>{formatDate(data.created_at)}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>更新時間</p>
                  <p className='font-medium'>{formatDate(data.updated_at)}</p>
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
