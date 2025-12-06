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
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';
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
import { announcementsApi, Announcement } from '@/features/business/services';

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    RESULTS: '業績公告',
    CIRCULAR: '通函',
    ANNOUNCEMENT: '公告',
    PRESS_RELEASE: '新聞稿',
    REGULATORY: '監管公告',
    OTHER: '其他',
  };
  return labels[type] || type;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    DRAFT: '草稿',
    IN_PROGRESS: '進行中',
    REVIEW: '審核中',
    APPROVED: '已批准',
    PUBLISHED: '已發布',
  };
  return labels[status] || status;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    DRAFT: 'secondary',
    IN_PROGRESS: 'warning',
    REVIEW: 'outline',
    APPROVED: 'default',
    PUBLISHED: 'success',
  };
  return colors[status] || 'secondary';
};

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const announcementId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!announcementId) return;
      
      setIsLoading(true);
      try {
        if (announcementId.startsWith('demo-')) {
          setAnnouncement({
            id: announcementId,
            listed_client: 'demo-client',
            listed_client_name: 'Demo Company Ltd.',
            stock_code: '1234',
            announcement_type: 'RESULTS',
            title: '2024年度業績公告',
            publish_date: '2024-03-15',
            deadline: '2024-03-10',
            status: 'PUBLISHED',
            handler: 'demo-user',
            handler_name: '張經理',
            word_count: 5000,
            languages: '中英文',
            notes: '這是一個示範公告',
            is_active: true,
            created_at: '2024-02-01T00:00:00Z',
            updated_at: '2024-03-15T00:00:00Z',
          });
          return;
        }
        
        const data = await announcementsApi.get(announcementId);
        setAnnouncement(data);
      } catch (error) {
        console.error('Failed to fetch announcement:', error);
        toast.error('找不到該公告');
        router.push('/dashboard/business/announcements');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [announcementId, router]);

  const handleDelete = async () => {
    if (!announcementId) return;
    try {
      await announcementsApi.delete(announcementId);
      toast.success('公告已刪除');
      router.push('/dashboard/business/announcements');
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

  if (!announcement) {
    return null;
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link href='/dashboard/business/announcements'>
              <Button variant='ghost' size='icon'>
                <IconArrowLeft className='size-5' />
              </Button>
            </Link>
            <div>
              <div className='flex items-center gap-3'>
                <h1 className='text-2xl font-bold'>{announcement.title}</h1>
                <Badge variant={getStatusColor(announcement.status) as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'}>
                  {getStatusLabel(announcement.status)}
                </Badge>
              </div>
              <p className='text-muted-foreground'>
                {announcement.listed_client_name} · {announcement.stock_code}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Link href={`/dashboard/business/announcements/${announcementId}/edit`}>
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
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>類型</p>
                  <p className='font-medium'>{getTypeLabel(announcement.announcement_type)}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>狀態</p>
                  <p className='font-medium'>{getStatusLabel(announcement.status)}</p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>字數</p>
                  <p className='font-medium'>{announcement.word_count?.toLocaleString() || '-'}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>語言</p>
                  <p className='font-medium'>{announcement.languages || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>時間與負責人</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>發布日期</p>
                  <p className='font-medium'>
                    {announcement.publish_date 
                      ? new Date(announcement.publish_date).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>截止日期</p>
                  <p className='font-medium'>
                    {announcement.deadline 
                      ? new Date(announcement.deadline).toLocaleDateString('zh-TW')
                      : '-'}
                  </p>
                </div>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>負責人</p>
                <p className='font-medium'>{announcement.handler_name || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle>備註</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap text-sm'>
                {announcement.notes || '無備註'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className='py-4'>
            <div className='flex justify-between text-sm text-muted-foreground'>
              <span>建立時間: {new Date(announcement.created_at).toLocaleString('zh-TW')}</span>
              <span>更新時間: {new Date(announcement.updated_at).toLocaleString('zh-TW')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除 &quot;{announcement.title}&quot; 嗎？此操作無法撤銷。
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
