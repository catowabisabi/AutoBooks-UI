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
import { listedClientsApi, ListedClient } from '@/features/business/services';

// Status badge color mapping
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    ACTIVE: 'success',
    INACTIVE: 'secondary',
    PROSPECT: 'warning',
    CHURNED: 'destructive',
  };
  return colors[status] || 'secondary';
};

// Format market cap for display
const formatMarketCap = (value?: number) => {
  if (!value) return '-';
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
};

export default function ListedClientsPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: t('business.active'),
      INACTIVE: t('business.inactive'),
      PROSPECT: t('business.prospect'),
      CHURNED: t('business.churned'),
    };
    return labels[status] || status;
  };
  const [data, setData] = useState<ListedClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Mock data for demo
  const mockData: ListedClient[] = [
    {
      id: 'demo-1',
      company: 'demo-company-1',
      company_name: 'ABC Holdings Ltd.',
      stock_code: '1234',
      exchange: 'HKEX',
      sector: 'Technology',
      market_cap: 2500000000,
      status: 'ACTIVE',
      contract_start_date: '2023-01-01',
      contract_end_date: '2024-12-31',
      annual_retainer: 500000,
      primary_contact: 'John Wong',
      contact_email: 'john@abc.com',
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 'demo-2',
      company: 'demo-company-2',
      company_name: 'XYZ International',
      stock_code: '5678',
      exchange: 'HKEX',
      sector: 'Finance',
      market_cap: 5000000000,
      status: 'ACTIVE',
      contract_start_date: '2023-06-01',
      annual_retainer: 800000,
      primary_contact: 'Mary Lee',
      contact_email: 'mary@xyz.com',
      is_active: true,
      created_at: '2023-06-01T00:00:00Z',
      updated_at: '2024-02-10T00:00:00Z',
    },
    {
      id: 'demo-3',
      company: 'demo-company-3',
      company_name: 'Global Tech Inc.',
      stock_code: '9999',
      exchange: 'NYSE',
      sector: 'Healthcare',
      market_cap: 1200000000,
      status: 'PROSPECT',
      primary_contact: 'David Chen',
      contact_email: 'david@globaltech.com',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-02-20T00:00:00Z',
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await listedClientsApi.list({ ordering: '-created_at' });
      const results = response.results || [];
      
      if (results.length === 0) {
        console.log('[ListedClients] API returned empty, using mock data');
        setData(mockData);
        setIsUsingMockData(true);
      } else {
        setData(results);
        setIsUsingMockData(false);
      }
    } catch (error) {
      console.error('Failed to fetch listed clients:', error);
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
      await listedClientsApi.delete(deleteId);
      toast.success(t('business.recordDeleted'));
      fetchData();
    } catch (error) {
      toast.error(t('common.deleteFailed'));
    }
    setDeleteId(null);
  };

  const columns: ColumnDef<ListedClient>[] = [
    {
      accessorKey: 'company_name',
      header: t('common.name'),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/business/listed-clients/${row.original.id}`}
          className='font-medium text-primary hover:underline'
        >
          {row.original.company_name || '-'}
        </Link>
      ),
    },
    {
      accessorKey: 'stock_code',
      header: t('business.stockCode'),
      cell: ({ row }) => (
        <span className='font-mono'>{row.original.stock_code}</span>
      ),
    },
    {
      accessorKey: 'exchange',
      header: t('business.exchange'),
    },
    {
      accessorKey: 'sector',
      header: t('business.sector'),
      cell: ({ row }) => row.original.sector || '-',
    },
    {
      accessorKey: 'market_cap',
      header: t('business.marketCap'),
      cell: ({ row }) => formatMarketCap(row.original.market_cap),
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
      accessorKey: 'annual_retainer',
      header: '年度服務費',
      cell: ({ row }) => 
        row.original.annual_retainer 
          ? `$${row.original.annual_retainer.toLocaleString()}`
          : '-',
    },
    {
      accessorKey: 'primary_contact',
      header: '主要聯繫人',
      cell: ({ row }) => row.original.primary_contact || '-',
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
                router.push(`/dashboard/business/listed-clients/${row.original.id}`)
              }
            >
              <IconEye className='mr-2 size-4' />
              {t('common.viewDetails')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/listed-clients/${row.original.id}/edit`)
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
            title={t('business.listedClientsManagement')}
            description={t('business.listedClientsDescription')}
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
              href='/dashboard/business/listed-clients/new'
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <IconPlus className='mr-2 size-4' />
              {t('business.newListedClient')}
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
              {t('business.deleteListedClientConfirm')}
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
