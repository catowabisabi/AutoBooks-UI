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
import { serviceRevenuesApi, ServiceRevenue } from '@/features/business/services';

// Format currency for display
const formatCurrency = (value?: number) => {
  if (!value) return '-';
  return `HK$${value.toLocaleString()}`;
};

// Format period for display
const formatPeriod = (year: number, month: number) => {
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                      '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return `${year}年 ${monthNames[month - 1] || month}`;
};

export default function ServiceRevenuesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [data, setData] = useState<ServiceRevenue[]>([]);

  // Service type label mapping with translations
  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'RETAINER': t('business.retainerService'),
      'PROJECT': t('business.projectFee'),
      'ANNOUNCEMENT': t('business.announcementService'),
      'IPO': t('business.ipoAdvisory'),
      'IR': t('business.investorRelations'),
      'MEDIA': t('business.mediaRelations'),
      'CRISIS': t('business.crisisManagement'),
      'OTHER': t('business.other'),
    };
    return labels[type] || type;
  };
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Mock data for demo
  const mockData: ServiceRevenue[] = [
    {
      id: 'demo-1',
      company: 'demo-company-1',
      company_name: 'ABC Holdings Ltd.',
      service_type: 'RETAINER',
      period_year: 2024,
      period_month: 12,
      amount: 150000,
      billable_hours: 40,
      notes: '月度常規服務',
      is_active: true,
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z',
    },
    {
      id: 'demo-2',
      company: 'demo-company-2',
      company_name: 'XYZ International',
      service_type: 'ANNOUNCEMENT',
      period_year: 2024,
      period_month: 12,
      amount: 80000,
      billable_hours: 20,
      notes: '業績公告服務',
      is_active: true,
      created_at: '2024-12-05T00:00:00Z',
      updated_at: '2024-12-05T00:00:00Z',
    },
    {
      id: 'demo-3',
      company: 'demo-company-3',
      company_name: 'Global Tech Inc.',
      service_type: 'IPO',
      period_year: 2024,
      period_month: 11,
      amount: 500000,
      billable_hours: 120,
      notes: 'IPO 項目費用',
      is_active: true,
      created_at: '2024-11-15T00:00:00Z',
      updated_at: '2024-11-15T00:00:00Z',
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await serviceRevenuesApi.list({ ordering: '-period_year,-period_month' });
      const results = response.results || [];
      
      if (results.length === 0) {
        console.log('[ServiceRevenues] API returned empty, using mock data');
        setData(mockData);
        setIsUsingMockData(true);
      } else {
        setData(results);
        setIsUsingMockData(false);
      }
    } catch (error) {
      console.error('Failed to fetch service revenues:', error);
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
      await serviceRevenuesApi.delete(deleteId);
      toast.success(t('common.deleteSuccess'));
      fetchData();
    } catch (error) {
      toast.error(t('common.deleteFailed'));
    }
    setDeleteId(null);
  };

  const columns: ColumnDef<ServiceRevenue>[] = [
    {
      accessorKey: 'company_name',
      header: t('business.client'),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/business/service-revenues/${row.original.id}`}
          className='font-medium text-primary hover:underline'
        >
          {row.original.company_name || '-'}
        </Link>
      ),
    },
    {
      id: 'period',
      header: t('business.period'),
      cell: ({ row }) => formatPeriod(row.original.period_year, row.original.period_month),
    },
    {
      accessorKey: 'service_type',
      header: t('business.serviceType'),
      cell: ({ row }) => (
        <Badge variant='outline'>
          {getServiceTypeLabel(row.original.service_type)}
        </Badge>
      ),
    },
    {
      accessorKey: 'amount',
      header: t('common.amount'),
      cell: ({ row }) => (
        <span className='font-semibold text-green-600'>
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'billable_hours',
      header: t('business.billableHoursAmount'),
      cell: ({ row }) => 
        row.original.billable_hours 
          ? `${row.original.billable_hours} ${t('common.hours')}`
          : '-',
    },
    {
      accessorKey: 'notes',
      header: t('common.remarks'),
      cell: ({ row }) => (
        <span className='line-clamp-1 max-w-[200px]'>
          {row.original.notes || '-'}
        </span>
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
                router.push(`/dashboard/business/service-revenues/${row.original.id}`)
              }
            >
              <IconEye className='mr-2 size-4' />
              {t('common.viewDetails')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/service-revenues/${row.original.id}/edit`)
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
            title={t('business.serviceRevenuesManagement')}
            description={t('business.serviceRevenuesDescription')}
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
              href='/dashboard/business/service-revenues/new'
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <IconPlus className='mr-2 size-4' />
              {t('business.newServiceRevenue')}
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
              {t('business.confirmDeleteServiceRevenue')}
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
