'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconCash,
  IconBuilding,
  IconFileText,
  IconChartBar,
  IconCheck,
  IconX,
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
import { taxReturnsApi, TaxReturnCase } from '@/features/business/services';

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'secondary',
    IN_PROGRESS: 'default',
    UNDER_REVIEW: 'outline',
    SUBMITTED: 'default',
    ACCEPTED: 'success',
    REJECTED: 'destructive',
    AMENDED: 'outline',
  };
  return colors[status] || 'secondary';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: '待處理',
    IN_PROGRESS: '處理中',
    UNDER_REVIEW: '審核中',
    SUBMITTED: '已提交',
    ACCEPTED: '已接受',
    REJECTED: '已退回',
    AMENDED: '已修正',
  };
  return labels[status] || status;
};

export default function TaxReturnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taxReturnId = params.id as string;

  const [data, setData] = useState<TaxReturnCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await taxReturnsApi.get(taxReturnId);
        setData(response);
      } catch (error) {
        console.error('Failed to fetch tax return:', error);
        setData({
          id: taxReturnId,
          company: 'demo-company-1',
          company_name: 'ABC 有限公司',
          tax_year: '2023/24',
          tax_type: 'Profits Tax',
          progress: 60,
          status: 'IN_PROGRESS',
          deadline: '2024-04-30',
          handler: 'demo-user-1',
          handler_name: '王會計',
          tax_amount: 150000,
          documents_received: true,
          notes: '需要補充上季度的銷售資料',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-02-01T00:00:00Z',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [taxReturnId]);

  const handleDelete = async () => {
    try {
      await taxReturnsApi.delete(taxReturnId);
      toast.success('稅務申報已刪除');
      router.push('/dashboard/business/tax-returns');
    } catch (error) {
      toast.error('刪除失敗');
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className='space-y-6'>
          <Skeleton className='h-10 w-64' />
          <div className='grid gap-6 md:grid-cols-2'>
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
          <h2 className='text-xl font-semibold'>找不到此稅務申報案件</h2>
          <Link href='/dashboard/business/tax-returns'>
            <Button variant='link'>返回列表</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link href='/dashboard/business/tax-returns'>
              <Button variant='ghost' size='icon'>
                <IconArrowLeft className='size-5' />
              </Button>
            </Link>
            <div>
              <h1 className='text-2xl font-bold'>{data.company_name}</h1>
              <p className='text-muted-foreground'>
                {data.tax_type} - {data.tax_year}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant={getStatusColor(data.status) as any} className='text-sm'>
              {getStatusLabel(data.status)}
            </Badge>
            <Link href={`/dashboard/business/tax-returns/${taxReturnId}/edit`}>
              <Button variant='outline'>
                <IconEdit className='mr-2 size-4' />
                編輯
              </Button>
            </Link>
            <Button variant='destructive' onClick={() => setShowDeleteDialog(true)}>
              <IconTrash className='mr-2 size-4' />
              刪除
            </Button>
          </div>
        </div>

        <Separator />

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconChartBar className='size-5' />
              處理進度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>完成度</span>
                <span className='font-medium'>{data.progress}%</span>
              </div>
              <Progress value={data.progress} className='h-3' />
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className='grid gap-6 md:grid-cols-2'>
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconBuilding className='size-5' />
                基本資訊
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>客戶公司</p>
                  <p className='font-medium'>{data.company_name}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>課稅年度</p>
                  <p className='font-medium'>{data.tax_year}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>稅種</p>
                  <p className='font-medium'>{data.tax_type}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>負責人</p>
                  <p className='font-medium'>{data.handler_name || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconCalendar className='size-5' />
                時間軸
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>截止日期</p>
                  <p className='font-medium'>
                    {data.deadline
                      ? new Date(data.deadline).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>提交日期</p>
                  <p className='font-medium'>
                    {data.submitted_date
                      ? new Date(data.submitted_date).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>建立時間</p>
                  <p className='font-medium'>
                    {new Date(data.created_at).toLocaleDateString('zh-TW')}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>最後更新</p>
                  <p className='font-medium'>
                    {new Date(data.updated_at).toLocaleDateString('zh-TW')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Amount */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconCash className='size-5' />
                稅務資訊
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>應繳稅額</p>
                  <p className='text-2xl font-bold'>
                    {data.tax_amount
                      ? `HK$${data.tax_amount.toLocaleString()}`
                      : '待計算'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>文件已收齊</p>
                  <p className='flex items-center gap-2 font-medium'>
                    {data.documents_received ? (
                      <>
                        <IconCheck className='size-5 text-green-600' />
                        是
                      </>
                    ) : (
                      <>
                        <IconX className='size-5 text-red-600' />
                        否
                      </>
                    )}
                  </p>
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
              <p className='text-muted-foreground'>
                {data.notes || '暫無備註'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除稅務申報案件「{data.company_name} - {data.tax_year}」嗎？
              此操作無法撤銷。
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
