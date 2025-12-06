'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/provider';
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
import { clientIndustriesApi, ClientIndustry } from '@/features/business/services';

// Format currency for display
const formatCurrency = (value?: number) => {
  if (!value) return '-';
  if (value >= 1000000) return `HK$${(value / 1000000).toFixed(1)}M`;
  return `HK$${value.toLocaleString()}`;
};

export default function ClientIndustriesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [data, setData] = useState<ClientIndustry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Mock data for demo
  const mockData: ClientIndustry[] = [
    {
      id: 'demo-1',
      name: '科技',
      code: 'TECH',
      description: '科技行業客戶',
      color: '#3B82F6',
      client_count: 12,
      total_revenue: 2500000,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z',
    },
    {
      id: 'demo-2',
      name: '金融服務',
      code: 'FIN',
      description: '金融服務行業客戶',
      color: '#10B981',
      client_count: 8,
      total_revenue: 3200000,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z',
    },
    {
      id: 'demo-3',
      name: '房地產',
      code: 'RE',
      description: '房地產行業客戶',
      color: '#F59E0B',
      client_count: 6,
      total_revenue: 1800000,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z',
    },
    {
      id: 'demo-4',
      name: '消費品',
      code: 'CONS',
      description: '消費品行業客戶',
      color: '#EF4444',
      client_count: 10,
      total_revenue: 1500000,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z',
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await clientIndustriesApi.list({ ordering: '-client_count' });
      const results = response.results || [];
      
      if (results.length === 0) {
        console.log('[ClientIndustries] API returned empty, using mock data');
        setData(mockData);
        setIsUsingMockData(true);
      } else {
        setData(results);
        setIsUsingMockData(false);
      }
    } catch (error) {
      console.error('Failed to fetch client industries:', error);
      setIsUsingMockData(true);
      setData(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await clientIndustriesApi.delete(deleteId);
      toast.success(t('business.recordDeleted'));
      fetchData();
    } catch (error) {
      toast.error(t('common.deleteFailed'));
    }
    setDeleteId(null);
  };

  const columns: ColumnDef<ClientIndustry>[] = [
    {
      accessorKey: 'name',
      header: t('common.name'),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <div
            className='size-3 rounded-full'
            style={{ backgroundColor: row.original.color || '#6B7280' }}
          />
          <Link
            href={`/dashboard/business/client-industries/${row.original.id}`}
            className='font-medium text-primary hover:underline'
          >
            {row.original.name}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: 'code',
      header: t('business.industryCode'),
      cell: ({ row }) => (
        <Badge variant='outline' className='font-mono'>
          {row.original.code}
        </Badge>
      ),
    },
    {
      accessorKey: 'description',
      header: t('common.description'),
      cell: ({ row }) => (
        <span className='line-clamp-1 max-w-[200px]'>
          {row.original.description || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'client_count',
      header: t('business.clientCount'),
      cell: ({ row }) => (
        <span className='font-semibold'>{row.original.client_count || 0}</span>
      ),
    },
    {
      accessorKey: 'total_revenue',
      header: t('business.totalRevenueAmount'),
      cell: ({ row }) => (
        <span className='font-semibold text-green-600'>
          {formatCurrency(row.original.total_revenue)}
        </span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: t('common.status'),
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'secondary'}>
          {row.original.is_active ? t('common.active') : t('common.inactive')}
        </Badge>
      ),
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
                router.push(`/dashboard/business/client-industries/${row.original.id}`)
              }
            >
              <IconEye className='mr-2 size-4' />
              {t('common.viewDetails')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/client-industries/${row.original.id}/edit`)
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
            title={t('business.clientIndustriesManagement')}
            description={t('business.clientIndustriesDescription')}
          />
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              {isUsingMockData ? (
                <span className='flex items-center gap-1'>
                  <IconCloudOff className='size-3' />
                  Demo Data
                </span>
              ) : (
                <span className='flex items-center gap-1 text-green-600'>
                  <IconCloud className='size-3' />
                  Live API
                </span>
              )}
              <Button variant='ghost' size='icon' onClick={fetchData}>
                <IconRefresh className='size-4' />
              </Button>
            </div>
            <Link
              href='/dashboard/business/client-industries/new'
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <IconPlus className='mr-2 size-4' />
              {t('business.newIndustry')}
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
              {t('business.confirmDeleteIndustry')}
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
