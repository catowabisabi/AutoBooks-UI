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
  IconUsers,
  IconClock,
  IconFileText,
  IconTag,
  IconPalette,
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
import { clientIndustriesApi, ClientIndustry } from '@/features/business/services';

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

export default function ClientIndustryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [data, setData] = useState<ClientIndustry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await clientIndustriesApi.get(resolvedParams.id);
        setData(result);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch client industry:', error);
        toast.error('無法載入客戶行業資料');
        // Use mock data for demo
        setData({
          id: resolvedParams.id,
          name: '科技',
          code: 'TECH',
          description: '科技行業客戶，包括軟件開發、硬件製造、互聯網服務等領域的上市公司。',
          color: '#3B82F6',
          client_count: 12,
          total_revenue: 2500000,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
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
      await clientIndustriesApi.delete(resolvedParams.id);
      toast.success('客戶行業已刪除');
      router.push('/dashboard/business/client-industries');
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
          <p className='text-muted-foreground'>找不到客戶行業資料</p>
          <Link
            href='/dashboard/business/client-industries'
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
              href='/dashboard/business/client-industries'
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            >
              <IconArrowLeft className='size-4' />
            </Link>
            <div className='flex items-center gap-3'>
              <div
                className='size-6 rounded-full'
                style={{ backgroundColor: data.color || '#6B7280' }}
              />
              <Heading
                title={data.name}
                description={`行業代碼: ${data.code}`}
              />
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Link
              href={`/dashboard/business/client-industries/${resolvedParams.id}/edit`}
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
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconTag className='size-5' />
                基本資訊
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>行業名稱</p>
                <p className='text-lg font-medium'>{data.name}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>行業代碼</p>
                <Badge variant='outline' className='mt-1 font-mono'>
                  {data.code}
                </Badge>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>狀態</p>
                <Badge variant={data.is_active ? 'success' : 'secondary'} className='mt-1'>
                  {data.is_active ? '啟用' : '停用'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconUsers className='size-5' />
                統計資訊
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>客戶數量</p>
                  <p className='text-2xl font-bold'>{data.client_count || 0}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>總收入</p>
                  <p className='text-2xl font-bold text-green-600'>
                    {formatCurrency(data.total_revenue)}
                  </p>
                </div>
              </div>
              {data.client_count && data.total_revenue && (
                <div>
                  <p className='text-sm text-muted-foreground'>平均客戶收入</p>
                  <p className='font-medium'>
                    {formatCurrency(Math.round(data.total_revenue / data.client_count))}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Color */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconPalette className='size-5' />
                顏色設定
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-4'>
                <div
                  className='size-12 rounded-lg border'
                  style={{ backgroundColor: data.color || '#6B7280' }}
                />
                <div>
                  <p className='text-sm text-muted-foreground'>顏色代碼</p>
                  <p className='font-mono'>{data.color || '#6B7280'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconFileText className='size-5' />
                描述
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap'>{data.description || '無描述'}</p>
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
              確定要刪除此客戶行業嗎？此操作無法撤銷。
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
