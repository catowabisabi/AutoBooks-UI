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
import { toast } from 'sonner';
import { IconArrowLeft, IconEdit, IconTrash, IconExternalLink } from '@tabler/icons-react';
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
import { listedClientsApi, ListedClient } from '@/features/business/services';

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    ACTIVE: 'success',
    INACTIVE: 'secondary',
    PROSPECT: 'warning',
    CHURNED: 'destructive',
  };
  return colors[status] || 'secondary';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ACTIVE: '活躍',
    INACTIVE: '非活躍',
    PROSPECT: '潛在客戶',
    CHURNED: '已流失',
  };
  return labels[status] || status;
};

const formatMarketCap = (value?: number) => {
  if (!value) return '-';
  if (value >= 1000000000) return `HKD $${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `HKD $${(value / 1000000).toFixed(2)}M`;
  return `HKD $${value.toLocaleString()}`;
};

export default function ListedClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [client, setClient] = useState<ListedClient | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) return;
      
      setIsLoading(true);
      try {
        // Handle demo data
        if (clientId.startsWith('demo-')) {
          setClient({
            id: clientId,
            company: 'demo-company',
            company_name: 'Demo Company Ltd.',
            stock_code: '1234',
            exchange: 'HKEX',
            sector: 'Technology',
            market_cap: 2500000000,
            status: 'ACTIVE',
            contract_start_date: '2023-01-01',
            annual_retainer: 500000,
            primary_contact: 'John Wong',
            contact_email: 'john@demo.com',
            is_active: true,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z',
          });
          return;
        }
        
        const data = await listedClientsApi.get(clientId);
        setClient(data);
      } catch (error) {
        console.error('Failed to fetch client:', error);
        toast.error('找不到該客戶');
        router.push('/dashboard/business/listed-clients');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [clientId, router]);

  const handleDelete = async () => {
    if (!clientId) return;
    try {
      await listedClientsApi.delete(clientId);
      toast.success('上市公司客戶已刪除');
      router.push('/dashboard/business/listed-clients');
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

  if (!client) {
    return null;
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link href='/dashboard/business/listed-clients'>
              <Button variant='ghost' size='icon'>
                <IconArrowLeft className='size-5' />
              </Button>
            </Link>
            <div>
              <div className='flex items-center gap-3'>
                <h1 className='text-2xl font-bold'>{client.company_name}</h1>
                <Badge variant={getStatusColor(client.status) as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'}>
                  {getStatusLabel(client.status)}
                </Badge>
              </div>
              <p className='text-muted-foreground'>
                {client.stock_code} · {client.exchange}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Link href={`/dashboard/business/listed-clients/${clientId}/edit`}>
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

        <div className='grid gap-6 md:grid-cols-2'>
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>基本資訊</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>股票代碼</p>
                  <p className='font-mono font-medium'>{client.stock_code}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>交易所</p>
                  <p className='font-medium'>{client.exchange}</p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>行業</p>
                  <p className='font-medium'>{client.sector || '-'}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>市值</p>
                  <p className='font-medium'>{formatMarketCap(client.market_cap)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Info */}
          <Card>
            <CardHeader>
              <CardTitle>合約資訊</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>合約開始日期</p>
                  <p className='font-medium'>
                    {client.contract_start_date 
                      ? new Date(client.contract_start_date).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>合約結束日期</p>
                  <p className='font-medium'>
                    {client.contract_end_date 
                      ? new Date(client.contract_end_date).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>年度服務費</p>
                <p className='text-xl font-semibold'>
                  {client.annual_retainer 
                    ? `HKD $${client.annual_retainer.toLocaleString()}`
                    : '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>聯繫資訊</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>主要聯繫人</p>
                <p className='font-medium'>{client.primary_contact || '-'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>電子郵件</p>
                <p className='font-medium'>
                  {client.contact_email ? (
                    <a href={`mailto:${client.contact_email}`} className='text-primary hover:underline'>
                      {client.contact_email}
                    </a>
                  ) : '-'}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>電話</p>
                <p className='font-medium'>{client.contact_phone || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>備註</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap text-sm'>
                {client.notes || '無備註'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Metadata */}
        <Card>
          <CardContent className='py-4'>
            <div className='flex justify-between text-sm text-muted-foreground'>
              <span>建立時間: {new Date(client.created_at).toLocaleString('zh-TW')}</span>
              <span>更新時間: {new Date(client.updated_at).toLocaleString('zh-TW')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除 &quot;{client.company_name}&quot; 嗎？此操作無法撤銷。
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
