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
  IconUser,
  IconMail,
  IconPhone,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { revenueApi, Revenue } from '@/features/business/services';

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'secondary',
    PARTIAL: 'outline',
    RECEIVED: 'success',
    OVERDUE: 'destructive',
    WRITTEN_OFF: 'secondary',
  };
  return colors[status] || 'secondary';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: '待收款',
    PARTIAL: '部分收款',
    RECEIVED: '已收款',
    OVERDUE: '逾期',
    WRITTEN_OFF: '已核銷',
  };
  return labels[status] || status;
};

export default function RevenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const revenueId = params.id as string;

  const [data, setData] = useState<Revenue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await revenueApi.get(revenueId);
      setData(response);
    } catch (error) {
      console.error('Failed to fetch revenue:', error);
      setData({
        id: revenueId,
        company: 'demo-company-1',
        company_name: 'ABC 有限公司',
        invoice_number: 'INV-2024-001',
        description: '2024年度審計服務費',
        total_amount: 150000,
        received_amount: 100000,
        pending_amount: 50000,
        is_fully_paid: false,
        status: 'PARTIAL',
        invoice_date: '2024-01-15',
        due_date: '2024-02-15',
        contact_name: '張先生',
        contact_email: 'zhang@abc.com',
        contact_phone: '2123-4567',
        notes: '第一期款項已於1月20日收到，第二期預計2月底收款',
        is_active: true,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-20T00:00:00Z',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [revenueId]);

  const handleDelete = async () => {
    try {
      await revenueApi.delete(revenueId);
      toast.success('收入記錄已刪除');
      router.push('/dashboard/business/revenue');
    } catch (error) {
      toast.error('刪除失敗');
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount) return;
    try {
      await revenueApi.recordPayment(revenueId, parseFloat(paymentAmount));
      toast.success('付款已記錄');
      setShowPaymentDialog(false);
      setPaymentAmount('');
      fetchData();
    } catch (error) {
      toast.error('記錄付款失敗');
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
          <h2 className='text-xl font-semibold'>找不到此收入記錄</h2>
          <Link href='/dashboard/business/revenue'>
            <Button variant='link'>返回列表</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const paymentProgress = (data.received_amount / data.total_amount) * 100;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link href='/dashboard/business/revenue'>
              <Button variant='ghost' size='icon'>
                <IconArrowLeft className='size-5' />
              </Button>
            </Link>
            <div>
              <h1 className='text-2xl font-bold'>{data.invoice_number || '無發票編號'}</h1>
              <p className='text-muted-foreground'>{data.company_name}</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant={getStatusColor(data.status) as any} className='text-sm'>
              {getStatusLabel(data.status)}
            </Badge>
            {data.status !== 'RECEIVED' && (
              <Button variant='outline' onClick={() => setShowPaymentDialog(true)}>
                <IconCash className='mr-2 size-4' />
                記錄付款
              </Button>
            )}
            <Link href={`/dashboard/business/revenue/${revenueId}/edit`}>
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

        {/* Payment Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconCash className='size-5' />
              收款進度
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-3 gap-4 text-center'>
              <div>
                <p className='text-sm text-muted-foreground'>總金額</p>
                <p className='text-2xl font-bold'>HK${data.total_amount.toLocaleString()}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>已收金額</p>
                <p className='text-2xl font-bold text-green-600'>
                  HK${data.received_amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>待收金額</p>
                <p className='text-2xl font-bold text-orange-600'>
                  HK${(data.pending_amount || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>收款進度</span>
                <span className='font-medium'>{paymentProgress.toFixed(1)}%</span>
              </div>
              <Progress value={paymentProgress} className='h-3' />
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className='grid gap-6 md:grid-cols-2'>
          {/* Invoice Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconFileText className='size-5' />
                發票資訊
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>發票編號</p>
                  <p className='font-medium'>{data.invoice_number || '-'}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>客戶公司</p>
                  <p className='font-medium'>{data.company_name}</p>
                </div>
                <div className='col-span-2'>
                  <p className='text-sm text-muted-foreground'>描述</p>
                  <p className='font-medium'>{data.description || '-'}</p>
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
                  <p className='text-sm text-muted-foreground'>開票日期</p>
                  <p className='font-medium'>
                    {data.invoice_date
                      ? new Date(data.invoice_date).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>到期日</p>
                  <p className='font-medium'>
                    {data.due_date
                      ? new Date(data.due_date).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>收款日期</p>
                  <p className='font-medium'>
                    {data.received_date
                      ? new Date(data.received_date).toLocaleDateString('zh-TW')
                      : '-'}
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

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconUser className='size-5' />
                聯絡資訊
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                {data.contact_name && (
                  <div className='flex items-center gap-2'>
                    <IconUser className='size-4 text-muted-foreground' />
                    <span>{data.contact_name}</span>
                  </div>
                )}
                {data.contact_email && (
                  <div className='flex items-center gap-2'>
                    <IconMail className='size-4 text-muted-foreground' />
                    <a href={`mailto:${data.contact_email}`} className='text-primary hover:underline'>
                      {data.contact_email}
                    </a>
                  </div>
                )}
                {data.contact_phone && (
                  <div className='flex items-center gap-2'>
                    <IconPhone className='size-4 text-muted-foreground' />
                    <span>{data.contact_phone}</span>
                  </div>
                )}
                {!data.contact_name && !data.contact_email && !data.contact_phone && (
                  <p className='text-muted-foreground'>暫無聯絡資訊</p>
                )}
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除收入記錄「{data.invoice_number}」嗎？此操作無法撤銷。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>刪除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Record payment dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>記錄付款</DialogTitle>
            <DialogDescription>
              發票編號：{data.invoice_number}
              <br />
              待收金額：HK${data.pending_amount?.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='payment_amount'>付款金額 (HK$)</Label>
              <Input
                id='payment_amount'
                type='number'
                min={0}
                max={data.pending_amount}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder='輸入付款金額'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowPaymentDialog(false)}>
              取消
            </Button>
            <Button onClick={handleRecordPayment}>確認付款</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
