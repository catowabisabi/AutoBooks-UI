'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { DataTable } from '@/components/ui/table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { useDataTable } from '@/hooks/use-data-table';
import { useTranslation } from '@/lib/i18n/provider';
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconTrash,
  IconRefresh,
  IconCloud,
  IconCloudOff,
} from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export default function AnnouncementsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [data, setData] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      RESULTS: 'default',
      CIRCULAR: 'secondary',
      ANNOUNCEMENT: 'outline',
      PRESS_RELEASE: 'success',
      REGULATORY: 'warning',
      OTHER: 'secondary',
    };
    return colors[type] || 'secondary';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      RESULTS: t('business.results'),
      CIRCULAR: t('business.circular'),
      ANNOUNCEMENT: t('business.announcement'),
      PRESS_RELEASE: t('business.pressRelease'),
      REGULATORY: t('business.regulatory'),
      OTHER: t('business.other'),
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: t('business.draft'),
      IN_PROGRESS: t('business.inProgress'),
      REVIEW: t('business.underReview'),
      APPROVED: t('business.approved'),
      PUBLISHED: t('business.published'),
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

  const mockData: Announcement[] = [
    {
      id: 'demo-1',
      listed_client: 'demo-client-1',
      listed_client_name: 'ABC Holdings Ltd.',
      stock_code: '1234',
      announcement_type: 'RESULTS',
      title: '2024年度業績公告',
      publish_date: '2024-03-15',
      deadline: '2024-03-10',
      status: 'PUBLISHED',
      handler: 'demo-user-1',
      handler_name: '張經理',
      word_count: 5000,
      languages: '中英文',
      is_active: true,
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-03-15T00:00:00Z',
    },
    {
      id: 'demo-2',
      listed_client: 'demo-client-2',
      listed_client_name: 'XYZ International',
      stock_code: '5678',
      announcement_type: 'CIRCULAR',
      title: '股東週年大會通函',
      publish_date: '2024-04-01',
      deadline: '2024-03-25',
      status: 'REVIEW',
      handler: 'demo-user-2',
      handler_name: '李經理',
      word_count: 8000,
      languages: '中英文',
      is_active: true,
      created_at: '2024-03-01T00:00:00Z',
      updated_at: '2024-03-20T00:00:00Z',
    },
    {
      id: 'demo-3',
      listed_client: 'demo-client-1',
      listed_client_name: 'ABC Holdings Ltd.',
      stock_code: '1234',
      announcement_type: 'PRESS_RELEASE',
      title: '新產品發布新聞稿',
      publish_date: '2024-03-20',
      status: 'IN_PROGRESS',
      handler: 'demo-user-1',
      handler_name: '張經理',
      word_count: 1500,
      languages: '中英文',
      is_active: true,
      created_at: '2024-03-10T00:00:00Z',
      updated_at: '2024-03-18T00:00:00Z',
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await announcementsApi.list({ ordering: '-publish_date' });
      const results = response.results || [];
      
      if (results.length === 0) {
        // eslint-disable-next-line no-console
        console.log('[Announcements] API returned empty, using mock data');
        setData(mockData);
        setIsUsingMockData(true);
      } else {
        setData(results);
        setIsUsingMockData(false);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch announcements:', error);
      setIsUsingMockData(true);
      setData(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await announcementsApi.delete(deleteId);
      toast.success(t('business.recordDeleted'));
      fetchData();
    } catch (error) {
      toast.error(t('common.deleteFailed'));
    }
    setDeleteId(null);
  };

  const columns: ColumnDef<Announcement>[] = [
    {
      accessorKey: 'title',
      header: t('common.name'),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/business/announcements/${row.original.id}`}
          className='font-medium text-primary hover:underline max-w-[300px] truncate block'
        >
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: 'listed_client_name',
      header: t('business.listedClients'),
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span>{row.original.listed_client_name}</span>
          <span className='text-xs text-muted-foreground font-mono'>
            {row.original.stock_code}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'announcement_type',
      header: t('business.announcementType'),
      cell: ({ row }) => (
        <Badge variant={getTypeColor(row.original.announcement_type) as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'}>
          {getTypeLabel(row.original.announcement_type)}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ row }) => (
        <Badge variant={getStatusColor(row.original.status) as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'}>
          {getStatusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: 'publish_date',
      header: t('business.publishDate'),
      cell: ({ row }) =>
        row.original.publish_date
          ? new Date(row.original.publish_date).toLocaleDateString('zh-TW')
          : '-',
    },
    {
      accessorKey: 'handler_name',
      header: t('business.handler'),
      cell: ({ row }) => row.original.handler_name || '-',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon'>
              <IconDotsVertical className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/announcements/${row.original.id}`)
              }
            >
              <IconEye className='mr-2 size-4' />
              {t('common.viewDetails')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/announcements/${row.original.id}/edit`)
              }
            >
              <IconEdit className='mr-2 size-4' />
              {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='text-destructive'
              onClick={() => setDeleteId(row.original.id)}
            >
              <IconTrash className='mr-2 size-4' />
              {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount: -1,
    shallow: false,
    manualPagination: false,
    manualSorting: false,
    manualFiltering: false,
  });

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <Heading
            title={t('business.announcementsManagement')}
            description={t('business.announcementsDescription')}
          />
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              {isUsingMockData ? (
                <span className='flex items-center gap-1'>
                  <IconCloudOff className='size-3' />
                  {t('business.usingMockData')}
                </span>
              ) : (
                <span className='flex items-center gap-1 text-green-600'>
                  <IconCloud className='size-3' />
                  {t('business.usingLiveData')}
                </span>
              )}
              <Button variant='ghost' size='icon' onClick={fetchData}>
                <IconRefresh className='size-4' />
              </Button>
            </div>
            <Link
              href='/dashboard/business/announcements/new'
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <IconPlus className='mr-2 size-4' />
              {t('business.newAnnouncement')}
            </Link>
          </div>
        </div>
        <Separator />
        {isLoading ? (
          <div className='space-y-4'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-96 w-full' />
          </div>
        ) : (
          <DataTable table={table} />
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('business.deleteAnnouncementConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
