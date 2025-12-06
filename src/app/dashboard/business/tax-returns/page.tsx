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
import { taxReturnsApi, TaxReturnCase } from '@/features/business/services';

export default function TaxReturnsListPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [data, setData] = useState<TaxReturnCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'secondary',
      IN_PROGRESS: 'default',
      UNDER_REVIEW: 'outline',
      SUBMITTED: 'default',
      ACCEPTED: 'success',
      REJECTED: 'destructive',
      AMENDED: 'outline',
    };
    return colors[status] || 'secondary';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: t('business.pending'),
      IN_PROGRESS: t('business.inProgress'),
      UNDER_REVIEW: t('business.underReview'),
      SUBMITTED: t('business.submitted'),
      ACCEPTED: t('business.accepted'),
      REJECTED: t('business.rejected'),
      AMENDED: t('business.amended'),
    };
    return labels[status] || status;
  };

  // Mock data for demo
  const mockData: TaxReturnCase[] = [
    {
      id: 'demo-1',
      company: 'demo-company-1',
      company_name: 'ABC 有限公司',
      tax_year: '2023/24',
      tax_type: 'Profits Tax',
      progress: 60,
      status: 'IN_PROGRESS',
      deadline: '2024-04-30',
      handler: 'demo-user-1',
      handler_name: '王會計',
      tax_amount: 150000,
      documents_received: true,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z',
    },
    {
      id: 'demo-2',
      company: 'demo-company-2',
      company_name: 'XYZ 科技股份有限公司',
      tax_year: '2023/24',
      tax_type: 'Salaries Tax',
      progress: 100,
      status: 'ACCEPTED',
      deadline: '2024-03-31',
      submitted_date: '2024-03-15',
      handler: 'demo-user-2',
      handler_name: '李經理',
      tax_amount: 85000,
      documents_received: true,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-03-15T00:00:00Z',
    },
    {
      id: 'demo-3',
      company: 'demo-company-3',
      company_name: 'Hong Kong Trading Ltd.',
      tax_year: '2023/24',
      tax_type: 'Profits Tax',
      progress: 30,
      status: 'PENDING',
      deadline: '2024-05-31',
      handler: 'demo-user-1',
      handler_name: '王會計',
      tax_amount: 280000,
      documents_received: false,
      is_active: true,
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-15T00:00:00Z',
    },
    {
      id: 'demo-4',
      company: 'demo-company-4',
      company_name: '大灣區投資控股',
      tax_year: '2023/24',
      tax_type: 'Property Tax',
      progress: 80,
      status: 'UNDER_REVIEW',
      deadline: '2024-04-15',
      handler: 'demo-user-3',
      handler_name: '陳主管',
      tax_amount: 95000,
      documents_received: true,
      is_active: true,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-03-01T00:00:00Z',
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await taxReturnsApi.list({ ordering: '-deadline' });
      const results = response.results || [];
      
      // If API returns empty data, use mock data
      if (results.length === 0) {
        console.log('[TaxReturns] API returned empty, using mock data');
        setData(mockData);
        setIsUsingMockData(true);
      } else {
        setData(results);
        setIsUsingMockData(false);
      }
    } catch (error) {
      console.error('Failed to fetch tax returns:', error);
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
      await taxReturnsApi.delete(deleteId);
      toast.success(t('common.deleteSuccess'));
      fetchData();
    } catch (error) {
      toast.error(t('common.deleteFailed'));
    }
    setDeleteId(null);
  };

  const columns: ColumnDef<TaxReturnCase>[] = [
    {
      accessorKey: 'company_name',
      header: t('business.clientCompany'),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/business/tax-returns/${row.original.id}`}
          className='font-medium text-primary hover:underline'
        >
          {row.original.company_name || row.original.company}
        </Link>
      ),
    },
    {
      accessorKey: 'tax_year',
      header: t('business.taxYear'),
    },
    {
      accessorKey: 'tax_type',
      header: t('business.taxType'),
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
      accessorKey: 'progress',
      header: t('common.progress'),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <div className='h-2 w-20 rounded-full bg-muted'>
            <div
              className='h-2 rounded-full bg-primary'
              style={{ width: `${row.original.progress}%` }}
            />
          </div>
          <span className='text-sm text-muted-foreground'>
            {row.original.progress}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'deadline',
      header: t('business.deadline'),
      cell: ({ row }) =>
        row.original.deadline
          ? new Date(row.original.deadline).toLocaleDateString('zh-TW')
          : '-',
    },
    {
      accessorKey: 'tax_amount',
      header: t('business.taxAmount'),
      cell: ({ row }) =>
        row.original.tax_amount
          ? `HK$${row.original.tax_amount.toLocaleString()}`
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
                router.push(`/dashboard/business/tax-returns/${row.original.id}`)
              }
            >
              <IconEye className='mr-2 size-4' />
              {t('common.viewDetails')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/tax-returns/${row.original.id}/edit`)
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
            title={t('business.taxReturnManagement')}
            description={t('business.taxReturnDescription')}
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
              href='/dashboard/business/tax-returns/new'
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <IconPlus className='mr-2 size-4' />
              {t('business.newCase')}
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
              {t('business.deleteTaxReturnConfirm')}
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
