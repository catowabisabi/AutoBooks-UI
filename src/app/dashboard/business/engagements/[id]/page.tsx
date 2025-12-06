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
import { Progress } from '@/components/ui/progress';
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
  IconUser,
  IconFileText,
  IconClock,
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
import { engagementsApi, ActiveEngagement } from '@/features/business/services';

// Engagement type label mapping
const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'RETAINER': '長期合約',
    'PROJECT': '項目',
    'AD_HOC': '臨時委託',
  };
  return labels[type] || type;
};

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

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'ACTIVE': '進行中',
    'PAUSED': '暫停',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消',
  };
  return labels[status] || status;
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

export default function EngagementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [data, setData] = useState<ActiveEngagement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await engagementsApi.get(resolvedParams.id);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch engagement:', error);
        toast.error('無法載入項目委託資料');
        // Use mock data for demo
        setData({
          id: resolvedParams.id,
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
          notes: '年度長期服務合約，包含月度媒體監測、季度投資者關係報告等服務',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-11-15T00:00:00Z',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id]);

  const handleDelete = async () => {
    try {
      await engagementsApi.delete(resolvedParams.id);
      toast.success('項目委託已刪除');
      router.push('/dashboard/business/engagements');
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
          <p className='text-muted-foreground'>找不到項目委託資料</p>
          <Link
            href='/dashboard/business/engagements'
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
              href='/dashboard/business/engagements'
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            >
              <IconArrowLeft className='size-4' />
            </Link>
            <div>
              <Heading
                title={data.title}
                description={data.company_name || '項目委託詳情'}
              />
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Link
              href={`/dashboard/business/engagements/${resolvedParams.id}/edit`}
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
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconBriefcase className='size-5' />
                項目資訊
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>項目名稱</p>
                <p className='text-lg font-medium'>{data.title}</p>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>類型</p>
                  <Badge variant='outline' className='mt-1'>
                    {getTypeLabel(data.engagement_type)}
                  </Badge>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>狀態</p>
                  <Badge variant={getStatusColor(data.status) as any} className='mt-1'>
                    {getStatusLabel(data.status)}
                  </Badge>
                </div>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>客戶公司</p>
                <p className='font-medium'>{data.company_name || '-'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>進度</p>
                <div className='mt-2 flex items-center gap-3'>
                  <Progress value={data.progress || 0} className='flex-1' />
                  <span className='font-semibold'>{data.progress || 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial & Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconCurrencyDollar className='size-5' />
                財務與時間
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>項目價值</p>
                <p className='text-2xl font-bold text-green-600'>
                  {formatCurrency(data.value)}
                </p>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>開始日期</p>
                  <p className='font-medium'>{formatDate(data.start_date)}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>結束日期</p>
                  <p className='font-medium'>{formatDate(data.end_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconUser className='size-5' />
                團隊資訊
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>項目負責人</p>
                <p className='font-medium'>{data.lead_name || '-'}</p>
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
