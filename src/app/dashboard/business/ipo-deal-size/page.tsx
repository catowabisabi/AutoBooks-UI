'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/provider';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import {
  IconPlus,
  IconEdit,
  IconEye,
  IconTrash,
  IconChartPie,
  IconCash,
} from '@tabler/icons-react';
import { ipoDealSizeApi, IPODealSize } from '@/features/business/services';
import { useDataTable } from '@/hooks/use-data-table';

// Size category colors
const sizeConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'success' | 'outline'; color: string }> = {
  mega: { variant: 'default', color: 'bg-purple-500' },
  large: { variant: 'default', color: 'bg-blue-500' },
  mid: { variant: 'secondary', color: 'bg-green-500' },
  small: { variant: 'outline', color: 'bg-gray-400' },
};

// Format number to currency
const formatCurrency = (value?: number) => {
  if (!value && value !== 0) return '-';
  return new Intl.NumberFormat('zh-HK', {
    style: 'currency',
    currency: 'HKD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
};

// Mock data matching frontend chart
const mockData: IPODealSize[] = [
  {
    id: '1',
    company: '1',
    company_name: 'BMI (IPO)',
    period_date: '2024-12-01',
    size_category: 'mega',
    deal_count: 2,
    total_amount: 2500000000,
    avg_deal_size: 1250000000,
    notes: '超大型交易',
    is_active: true,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '2',
    company: '1',
    company_name: 'BMI (IPO)',
    period_date: '2024-12-01',
    size_category: 'large',
    deal_count: 4,
    total_amount: 2800000000,
    avg_deal_size: 700000000,
    notes: '大型交易',
    is_active: true,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '3',
    company: '1',
    company_name: 'BMI (IPO)',
    period_date: '2024-12-01',
    size_category: 'mid',
    deal_count: 12,
    total_amount: 3200000000,
    avg_deal_size: 266666667,
    notes: '中型交易',
    is_active: true,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '4',
    company: '1',
    company_name: 'BMI (IPO)',
    period_date: '2024-12-01',
    size_category: 'small',
    deal_count: 27,
    total_amount: 1800000000,
    avg_deal_size: 66666667,
    notes: '小型交易',
    is_active: true,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
];

export default function IPODealSizePage() {
  const { t } = useTranslation();
  const [data, setData] = useState<IPODealSize[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Size category labels with i18n
  const sizeLabels: Record<string, string> = useMemo(() => ({
    mega: t('business.mega'),
    large: t('business.large'),
    mid: t('business.mid'),
    small: t('business.small'),
  }), [t]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await ipoDealSizeApi.list();
        // eslint-disable-next-line no-console
        console.log('IPO Deal Size API result:', result);
        // Handle both array and paginated response
        const items = Array.isArray(result) ? result : (result.results || []);
        setData(items);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch IPO deal size:', error);
        toast.error(t('business.loadDealSizeError'));
        setData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await ipoDealSizeApi.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success(t('business.recordDeleted'));
    } catch (error) {
      toast.error(t('business.deleteFailed'));
    }
  };

  const columns: ColumnDef<IPODealSize>[] = useMemo(() => [
    {
      accessorKey: 'period_date',
      header: t('business.period'),
      cell: ({ row }) => (
        <span className='font-medium'>{row.original.period_date}</span>
      ),
    },
    {
      accessorKey: 'size_category',
      header: t('business.sizeCategory'),
      cell: ({ row }) => {
        const config = sizeConfig[row.original.size_category];
        return (
          <div className='flex items-center gap-2'>
            <div className={cn('size-3 rounded-full', config?.color || 'bg-gray-400')} />
            <Badge variant={config?.variant || 'secondary'}>
              {sizeLabels[row.original.size_category] || row.original.size_category}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'deal_count',
      header: t('business.dealCount'),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <IconChartPie className='size-4 text-muted-foreground' />
          <span className='font-mono font-medium text-lg'>
            {row.original.deal_count}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'total_amount',
      header: t('business.totalValue'),
      cell: ({ row }) => (
        <span className='font-mono font-medium'>
          {formatCurrency(row.original.total_amount)}
        </span>
      ),
    },
    {
      accessorKey: 'avg_deal_size',
      header: t('business.avgDealSize'),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <IconCash className='size-4 text-muted-foreground' />
          <span className='font-mono'>
            {formatCurrency(row.original.avg_deal_size)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'company_name',
      header: t('business.company'),
      cell: ({ row }) => row.original.company_name || '-',
    },
    {
      id: 'actions',
      header: t('business.actions'),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Link
            href={`/dashboard/business/ipo-deal-size/${row.original.id}`}
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
          >
            <IconEye className='size-4' />
          </Link>
          <Link
            href={`/dashboard/business/ipo-deal-size/${row.original.id}/edit`}
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
          >
            <IconEdit className='size-4' />
          </Link>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => handleDelete(row.original.id)}
          >
            <IconTrash className='size-4 text-destructive' />
          </Button>
        </div>
      ),
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t, sizeLabels]);

  const { table } = useDataTable({
    data,
    columns,
    pageCount: Math.ceil(data.length / 10),
    shallow: false,
    debounceMs: 500
  });

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <Heading
            title={t('business.ipoDealSizeManagement')}
            description={t('business.ipoDealSizeDescription')}
          />
          <Link
            href='/dashboard/business/ipo-deal-size/new/edit'
            className={cn(buttonVariants())}
          >
            <IconPlus className='mr-2 size-4' />
            {t('business.newDealSizeRecord')}
          </Link>
        </div>
        <Separator />
        <DataTable table={table} />
      </div>
    </PageContainer>
  );
}
