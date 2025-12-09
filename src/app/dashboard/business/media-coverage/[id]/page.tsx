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
import { mediaCoverageApi, MediaCoverage } from '@/features/business/services';

const getSentimentColor = (sentiment: string) => {
  const colors: Record<string, string> = {
    POSITIVE: 'success',
    NEUTRAL: 'secondary',
    NEGATIVE: 'destructive',
  };
  return colors[sentiment] || 'secondary';
};

const getSentimentLabel = (sentiment: string) => {
  const labels: Record<string, string> = {
    POSITIVE: '正面',
    NEUTRAL: '中立',
    NEGATIVE: '負面',
  };
  return labels[sentiment] || sentiment;
};

const formatNumber = (value?: number) => {
  if (!value) return '-';
  return value.toLocaleString();
};

export default function MediaCoverageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const coverageId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [coverage, setCoverage] = useState<MediaCoverage | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!coverageId) return;
      
      setIsLoading(true);
      try {
        if (coverageId.startsWith('demo-')) {
          setCoverage({
            id: coverageId,
            listed_client: 'demo-client',
            listed_client_name: 'Demo Company Ltd.',
            title: 'Demo 公司業績創新高',
            media_outlet: '經濟日報',
            publish_date: '2024-03-15',
            url: 'https://example.com/news/1',
            sentiment: 'POSITIVE',
            reach: 500000,
            engagement: 15000,
            is_press_release: false,
            notes: '這是一個示範報導',
            is_active: true,
            created_at: '2024-03-15T00:00:00Z',
            updated_at: '2024-03-15T00:00:00Z',
          });
          return;
        }
        
        const data = await mediaCoverageApi.get(coverageId);
        setCoverage(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch coverage:', error);
        toast.error('找不到該媒體報導');
        router.push('/dashboard/business/media-coverage');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [coverageId, router]);

  const handleDelete = async () => {
    if (!coverageId) return;
    try {
      await mediaCoverageApi.delete(coverageId);
      toast.success('媒體報導已刪除');
      router.push('/dashboard/business/media-coverage');
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

  if (!coverage) {
    return null;
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link href='/dashboard/business/media-coverage'>
              <Button variant='ghost' size='icon'>
                <IconArrowLeft className='size-5' />
              </Button>
            </Link>
            <div>
              <div className='flex items-center gap-3'>
                <h1 className='text-2xl font-bold'>{coverage.title}</h1>
                <Badge variant={getSentimentColor(coverage.sentiment) as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'}>
                  {getSentimentLabel(coverage.sentiment)}
                </Badge>
                {coverage.is_press_release && (
                  <Badge variant='outline'>新聞稿</Badge>
                )}
              </div>
              <p className='text-muted-foreground'>
                {coverage.media_outlet} · {coverage.publish_date ? new Date(coverage.publish_date).toLocaleDateString('zh-TW') : ''}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {coverage.url && (
              <a href={coverage.url} target='_blank' rel='noopener noreferrer'>
                <Button variant='outline'>
                  <IconExternalLink className='mr-2 size-4' />
                  查看原文
                </Button>
              </a>
            )}
            <Link href={`/dashboard/business/media-coverage/${coverageId}/edit`}>
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
          <Card>
            <CardHeader>
              <CardTitle>基本資訊</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>媒體</p>
                <p className='font-medium'>{coverage.media_outlet}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>發布日期</p>
                <p className='font-medium'>
                  {coverage.publish_date 
                    ? new Date(coverage.publish_date).toLocaleDateString('zh-TW')
                    : '-'}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>關聯客戶</p>
                <p className='font-medium'>{coverage.listed_client_name || coverage.company_name || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>數據指標</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>觸及人數</p>
                  <p className='text-2xl font-bold'>{formatNumber(coverage.reach)}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>互動數</p>
                  <p className='text-2xl font-bold'>{formatNumber(coverage.engagement)}</p>
                </div>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>情緒分類</p>
                <Badge 
                  variant={getSentimentColor(coverage.sentiment) as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'}
                  className='mt-1'
                >
                  {getSentimentLabel(coverage.sentiment)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle>備註</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap text-sm'>
                {coverage.notes || '無備註'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className='py-4'>
            <div className='flex justify-between text-sm text-muted-foreground'>
              <span>建立時間: {new Date(coverage.created_at).toLocaleString('zh-TW')}</span>
              <span>更新時間: {new Date(coverage.updated_at).toLocaleString('zh-TW')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除 &quot;{coverage.title}&quot; 嗎？此操作無法撤銷。
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
