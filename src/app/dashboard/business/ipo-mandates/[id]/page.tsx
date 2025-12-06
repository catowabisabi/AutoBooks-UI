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
import { IconArrowLeft, IconEdit, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
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
import { ipoMandatesApi, IPOMandate } from '@/features/business/services';

const getStageColor = (stage: string) => {
  const colors: Record<string, string> = {
    PITCH: 'secondary',
    MANDATE: 'default',
    PREPARATION: 'outline',
    FILING: 'warning',
    LISTING: 'success',
    COMPLETED: 'success',
    WITHDRAWN: 'destructive',
  };
  return colors[stage] || 'secondary';
};

const getStageLabel = (stage: string) => {
  const labels: Record<string, string> = {
    PITCH: '提案階段',
    MANDATE: '獲得委託',
    PREPARATION: '準備階段',
    FILING: '遞交申請',
    LISTING: '上市階段',
    COMPLETED: '已完成',
    WITHDRAWN: '已撤回',
  };
  return labels[stage] || stage;
};

const formatDealSize = (value?: number) => {
  if (!value) return '-';
  if (value >= 1000000000) return `HKD $${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `HKD $${(value / 1000000).toFixed(2)}M`;
  return `HKD $${value.toLocaleString()}`;
};

export default function IPOMandateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mandateId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [mandate, setMandate] = useState<IPOMandate | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!mandateId) return;
      
      setIsLoading(true);
      try {
        if (mandateId.startsWith('demo-')) {
          setMandate({
            id: mandateId,
            project_name: 'Demo IPO Project',
            company: 'demo-company',
            company_name: 'Demo Company Ltd.',
            stage: 'FILING',
            target_exchange: 'HKEX',
            target_board: 'Main Board',
            deal_size: 500000000,
            deal_size_category: 'MEDIUM',
            fee_percentage: 3.5,
            estimated_fee: 17500000,
            probability: 75,
            pitch_date: '2023-06-01',
            mandate_date: '2023-08-15',
            target_listing_date: '2024-06-01',
            lead_partner: 'demo-user',
            lead_partner_name: '王總監',
            sfc_application_date: '2024-01-15',
            is_sfc_approved: false,
            notes: '這是一個示範IPO項目',
            is_active: true,
            created_at: '2023-06-01T00:00:00Z',
            updated_at: '2024-02-15T00:00:00Z',
          });
          return;
        }
        
        const data = await ipoMandatesApi.get(mandateId);
        setMandate(data);
      } catch (error) {
        console.error('Failed to fetch mandate:', error);
        toast.error('找不到該IPO項目');
        router.push('/dashboard/business/ipo-mandates');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [mandateId, router]);

  const handleDelete = async () => {
    if (!mandateId) return;
    try {
      await ipoMandatesApi.delete(mandateId);
      toast.success('IPO項目已刪除');
      router.push('/dashboard/business/ipo-mandates');
    } catch (error) {
      toast.error('刪除失敗');
    }
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className='space-y-6'>
          <Skeleton className='h-10 w-64' />
          <div className='grid gap-6 md:grid-cols-2'>
            <Skeleton className='h-64' />
            <Skeleton className='h-64' />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!mandate) {
    return null;
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link href='/dashboard/business/ipo-mandates'>
              <Button variant='ghost' size='icon'>
                <IconArrowLeft className='size-5' />
              </Button>
            </Link>
            <div>
              <div className='flex items-center gap-3'>
                <h1 className='text-2xl font-bold'>{mandate.project_name}</h1>
                <Badge variant={getStageColor(mandate.stage) as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'}>
                  {getStageLabel(mandate.stage)}
                </Badge>
              </div>
              <p className='text-muted-foreground'>
                {mandate.company_name} · {mandate.target_exchange} {mandate.target_board}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Link href={`/dashboard/business/ipo-mandates/${mandateId}/edit`}>
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

        {/* Probability Overview */}
        <Card>
          <CardContent className='py-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>成功率</p>
                <p className='text-3xl font-bold'>{mandate.probability || 0}%</p>
              </div>
              <div className='w-1/2'>
                <Progress value={mandate.probability || 0} className='h-3' />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='grid gap-6 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>交易資訊</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>交易規模</p>
                  <p className='text-xl font-semibold'>{formatDealSize(mandate.deal_size)}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>規模類別</p>
                  <p className='font-medium'>{mandate.deal_size_category}</p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>費用比例</p>
                  <p className='font-medium'>{mandate.fee_percentage ? `${mandate.fee_percentage}%` : '-'}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>預計費用</p>
                  <p className='text-xl font-semibold text-green-600'>
                    {formatDealSize(mandate.estimated_fee)}
                  </p>
                </div>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>負責合夥人</p>
                <p className='font-medium'>{mandate.lead_partner_name || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>時間線</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>提案日期</p>
                  <p className='font-medium'>
                    {mandate.pitch_date 
                      ? new Date(mandate.pitch_date).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>委託日期</p>
                  <p className='font-medium'>
                    {mandate.mandate_date 
                      ? new Date(mandate.mandate_date).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>目標上市日期</p>
                  <p className='font-medium'>
                    {mandate.target_listing_date 
                      ? new Date(mandate.target_listing_date).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>實際上市日期</p>
                  <p className='font-medium'>
                    {mandate.actual_listing_date 
                      ? new Date(mandate.actual_listing_date).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>監管審批</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-4'>
                <div className={`flex size-10 items-center justify-center rounded-full ${mandate.is_sfc_approved ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {mandate.is_sfc_approved ? (
                    <IconCheck className='size-5 text-green-600' />
                  ) : (
                    <IconX className='size-5 text-yellow-600' />
                  )}
                </div>
                <div>
                  <p className='font-medium'>
                    {mandate.is_sfc_approved ? '已獲證監會批准' : '等待證監會批准'}
                  </p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>申請日期</p>
                  <p className='font-medium'>
                    {mandate.sfc_application_date 
                      ? new Date(mandate.sfc_application_date).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>批准日期</p>
                  <p className='font-medium'>
                    {mandate.sfc_approval_date 
                      ? new Date(mandate.sfc_approval_date).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>備註</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap text-sm'>
                {mandate.notes || '無備註'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className='py-4'>
            <div className='flex justify-between text-sm text-muted-foreground'>
              <span>建立時間: {new Date(mandate.created_at).toLocaleString('zh-TW')}</span>
              <span>更新時間: {new Date(mandate.updated_at).toLocaleString('zh-TW')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除 &quot;{mandate.project_name}&quot; 嗎？此操作無法撤銷。
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
