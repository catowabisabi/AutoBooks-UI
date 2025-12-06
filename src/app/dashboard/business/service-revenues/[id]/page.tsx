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
  IconCalendar,
  IconClock,
  IconFileText,
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
import { serviceRevenuesApi, ServiceRevenue } from '@/features/business/services';

// Service type label mapping
const getServiceTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'RETAINER': '常規服務費',
    'PROJECT': '項目收費',
    'ANNOUNCEMENT': '公告服務',
    'IPO': 'IPO 顧問',
    'IR': '投資者關係',
    'MEDIA': '媒體關係',
    'CRISIS': '危機公關',
    'OTHER': '其他',
  };
  return labels[type] || type;
};

// Format currency for display
const formatCurrency = (value?: number) => {
  if (!value) return '-';
  return `HK$${value.toLocaleString()}`;
};

// Format period for display
const formatPeriod = (year: number, month: number) => {
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                      '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return `${year}年 ${monthNames[month - 1] || month}`;
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

export default function ServiceRevenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [data, setData] = useState<ServiceRevenue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await serviceRevenuesApi.get(resolvedParams.id);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch service revenue:', error);
        toast.error('無法載入服務收入資料');
        // Use mock data for demo
        setData({
          id: resolvedParams.id,
          company: 'demo-company-1',
          company_name: 'ABC Holdings Ltd.',
          service_type: 'RETAINER',
          period_year: 2024,
          period_month: 12,
          amount: 150000,
          billable_hours: 40,
          notes: '月度常規服務費用',
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
      await serviceRevenuesApi.delete(resolvedParams.id);
      toast.success('服務收入記錄已刪除');
      router.push('/dashboard/business/service-revenues');
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
          <p className='text-muted-foreground'>找不到服務收入資料</p>
          <Link
            href='/dashboard/business/service-revenues'
            className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}
          >
            返回列表
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link
              href='/dashboard/business/service-revenues'
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            >
              <IconArrowLeft className='size-4' />
            </Link>
            <div>
              <Heading
                title={data.company_name || '服務收入詳情'}
                description={`${formatPeriod(data.period_year, data.period_month)} - ${getServiceTypeLabel(data.service_type)}`}
              />
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Link
              href={`/dashboard/business/service-revenues/${resolvedParams.id}/edit`}
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
          {/* Financial Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconCurrencyDollar className='size-5' />
                財務資訊
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>金額</p>
                  <p className='text-2xl font-bold text-green-600'>
                    {formatCurrency(data.amount)}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>計費小時</p>
                  <p className='text-xl font-semibold'>
                    {data.billable_hours ? `${data.billable_hours} 小時` : '-'}
                  </p>
                </div>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>服務類型</p>
                <Badge variant='outline' className='mt-1'>
                  {getServiceTypeLabel(data.service_type)}
                </Badge>
              </div>
              {data.billable_hours && data.amount && (
                <div>
                  <p className='text-sm text-muted-foreground'>每小時費率</p>
                  <p className='font-medium'>
                    {formatCurrency(Math.round(data.amount / data.billable_hours))}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Period Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconCalendar className='size-5' />
                期間資訊
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>期間</p>
                <p className='text-lg font-medium'>
                  {formatPeriod(data.period_year, data.period_month)}
                </p>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>年份</p>
                  <p className='font-medium'>{data.period_year}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>月份</p>
                  <p className='font-medium'>{data.period_month}</p>
                </div>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>客戶公司</p>
                <p className='font-medium'>{data.company_name || '-'}</p>
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
                <IconClock className='size-5' />
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
              確定要刪除此服務收入記錄嗎？此操作無法撤銷。
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
