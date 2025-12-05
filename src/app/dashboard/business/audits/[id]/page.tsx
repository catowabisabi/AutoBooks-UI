'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconUser,
  IconClock,
  IconBuilding,
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
import { auditsApi, AuditProject } from '@/features/business/services';

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    NOT_STARTED: 'secondary',
    PLANNING: 'outline',
    FIELDWORK: 'default',
    REVIEW: 'default',
    REPORTING: 'default',
    COMPLETED: 'success',
    ON_HOLD: 'destructive',
  };
  return colors[status] || 'secondary';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    NOT_STARTED: '未開始',
    PLANNING: '規劃中',
    FIELDWORK: '現場工作',
    REVIEW: '審閱中',
    REPORTING: '報告編製',
    COMPLETED: '已完成',
    ON_HOLD: '暫停',
  };
  return labels[status] || status;
};

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params.id as string;

  const [data, setData] = useState<AuditProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await auditsApi.get(auditId);
        setData(response);
      } catch (error) {
        console.error('Failed to fetch audit:', error);
        // Demo data fallback
        setData({
          id: auditId,
          company: 'demo-company-1',
          company_name: 'ABC 有限公司',
          fiscal_year: '2024',
          audit_type: 'Annual Audit',
          progress: 75,
          status: 'FIELDWORK',
          start_date: '2024-01-15',
          deadline: '2024-03-31',
          assigned_to: 'demo-user-1',
          assigned_to_name: '張經理',
          budget_hours: 200,
          actual_hours: 150,
          notes: '此專案為年度審計，需重點關注應收帳款及存貨項目。',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [auditId]);

  const handleDelete = async () => {
    try {
      await auditsApi.delete(auditId);
      toast.success('審計專案已刪除');
      router.push('/dashboard/business/audits');
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
          <h2 className='text-xl font-semibold'>找不到此審計專案</h2>
          <Link href='/dashboard/business/audits'>
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
            <Link href='/dashboard/business/audits'>
              <Button variant='ghost' size='icon'>
                <IconArrowLeft className='size-5' />
              </Button>
            </Link>
            <div>
              <h1 className='text-2xl font-bold'>{data.company_name}</h1>
              <p className='text-muted-foreground'>
                {data.audit_type} - {data.fiscal_year}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant={getStatusColor(data.status) as any} className='text-sm'>
              {getStatusLabel(data.status)}
            </Badge>
            <Link href={`/dashboard/business/audits/${auditId}/edit`}>
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
              專案進度
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
                  <p className='text-sm text-muted-foreground'>會計年度</p>
                  <p className='font-medium'>{data.fiscal_year}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>審計類型</p>
                  <p className='font-medium'>{data.audit_type}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>負責人</p>
                  <p className='font-medium'>{data.assigned_to_name || '-'}</p>
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
                  <p className='text-sm text-muted-foreground'>開始日期</p>
                  <p className='font-medium'>
                    {data.start_date
                      ? new Date(data.start_date).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>截止日期</p>
                  <p className='font-medium'>
                    {data.deadline
                      ? new Date(data.deadline).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>完成日期</p>
                  <p className='font-medium'>
                    {data.completion_date
                      ? new Date(data.completion_date).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>建立時間</p>
                  <p className='font-medium'>
                    {new Date(data.created_at).toLocaleDateString('zh-TW')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hours */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconClock className='size-5' />
                工時記錄
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>預算工時</p>
                  <p className='text-2xl font-bold'>{data.budget_hours || 0} 小時</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>實際工時</p>
                  <p className='text-2xl font-bold'>{data.actual_hours || 0} 小時</p>
                </div>
              </div>
              {data.budget_hours && data.actual_hours && (
                <div>
                  <div className='flex justify-between text-sm'>
                    <span>工時使用率</span>
                    <span className='font-medium'>
                      {Math.round((data.actual_hours / data.budget_hours) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(data.actual_hours / data.budget_hours) * 100}
                    className='h-2'
                  />
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
              <p className='text-muted-foreground'>
                {data.notes || '暫無備註'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除審計專案「{data.company_name} - {data.fiscal_year}」嗎？
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
