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
import { toast } from 'sonner';
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconClock,
  IconUser,
  IconBuilding,
  IconFileText,
  IconCash,
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
import { billableHoursApi, BillableHour } from '@/features/business/services';

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    CLERK: '文員',
    ACCOUNTANT: '會計師',
    MANAGER: '經理',
    DIRECTOR: '總監',
    PARTNER: '合夥人',
  };
  return labels[role] || role;
};

export default function BillableHourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = params.id as string;

  const [data, setData] = useState<BillableHour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await billableHoursApi.get(recordId);
        setData(response);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch billable hour:', error);
        setData({
          id: recordId,
          employee: 'demo-emp-1',
          employee_name: '張小明',
          company: 'demo-company-1',
          company_name: 'ABC 有限公司',
          project_reference: 'AUDIT-2024-001',
          role: 'ACCOUNTANT',
          base_hourly_rate: 200,
          hourly_rate_multiplier: 5,
          effective_rate: 1000,
          date: '2024-01-15',
          actual_hours: 8,
          total_cost: 8000,
          description: '年度審計 - 應收帳款測試',
          is_billable: true,
          is_invoiced: false,
          is_active: true,
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [recordId]);

  const handleDelete = async () => {
    try {
      await billableHoursApi.delete(recordId);
      toast.success('工時記錄已刪除');
      router.push('/dashboard/business/billable-hours');
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
          <h2 className='text-xl font-semibold'>找不到此工時記錄</h2>
          <Link href='/dashboard/business/billable-hours'>
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
            <Link href='/dashboard/business/billable-hours'>
              <Button variant='ghost' size='icon'>
                <IconArrowLeft className='size-5' />
              </Button>
            </Link>
            <div>
              <h1 className='text-2xl font-bold'>{data.employee_name}</h1>
              <p className='text-muted-foreground'>
                {new Date(data.date).toLocaleDateString('zh-TW')} - {data.project_reference || '無專案編號'}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant={data.is_billable ? 'default' : 'secondary'}>
              {data.is_billable ? '可收費' : '不可收費'}
            </Badge>
            {data.is_invoiced && <Badge variant='success'>已開票</Badge>}
            <Link href={`/dashboard/business/billable-hours/${recordId}/edit`}>
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

        {/* Info Cards */}
        <div className='grid gap-6 md:grid-cols-2'>
          {/* Employee Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconUser className='size-5' />
                員工資訊
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>員工姓名</p>
                  <p className='font-medium'>{data.employee_name}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>職級</p>
                  <p className='font-medium'>{getRoleLabel(data.role)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconBuilding className='size-5' />
                專案資訊
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>客戶公司</p>
                  <p className='font-medium'>{data.company_name || '-'}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>專案編號</p>
                  <p className='font-medium'>{data.project_reference || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconClock className='size-5' />
                工時資訊
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>日期</p>
                  <p className='font-medium'>
                    {new Date(data.date).toLocaleDateString('zh-TW')}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>實際工時</p>
                  <p className='text-2xl font-bold'>{data.actual_hours} 小時</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconCash className='size-5' />
                費用資訊
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>基本時薪</p>
                  <p className='font-medium'>HK${data.base_hourly_rate.toLocaleString()}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>倍率</p>
                  <p className='font-medium'>{data.hourly_rate_multiplier}x</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>有效時薪</p>
                  <p className='font-medium'>
                    {data.effective_rate
                      ? `HK$${data.effective_rate.toLocaleString()}`
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>總費用</p>
                  <p className='text-2xl font-bold text-primary'>
                    {data.total_cost
                      ? `HK$${data.total_cost.toLocaleString()}`
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconCalendar className='size-5' />
                狀態
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>可收費</p>
                  <p className='flex items-center gap-2 font-medium'>
                    {data.is_billable ? (
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
                <div>
                  <p className='text-sm text-muted-foreground'>已開票</p>
                  <p className='flex items-center gap-2 font-medium'>
                    {data.is_invoiced ? (
                      <>
                        <IconCheck className='size-5 text-green-600' />
                        是
                      </>
                    ) : (
                      <>
                        <IconX className='size-5 text-muted-foreground' />
                        否
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconFileText className='size-5' />
                工作描述
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>
                {data.description || '暫無描述'}
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
              確定要刪除此工時記錄嗎？此操作無法撤銷。
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
