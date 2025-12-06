'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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

// Size category labels in Chinese
const sizeLabels: Record<string, string> = {
  mega: '超大型 (>$1B)',
  large: '大型 ($500M-1B)',
  mid: '中型 ($100M-500M)',
  small: '小型 (<$100M)',
};

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
  const [data, setData] = useState<IPODealSize[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await ipoDealSizeApi.list();
        setData(result.results || result);
      } catch (error) {
        console.error('Failed to fetch IPO deal size:', error);
        toast.error('無法載入交易規模資料，使用模擬數據');
        setData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await ipoDealSizeApi.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success('記錄已刪除');
    } catch (error) {
      toast.error('刪除失敗');
    }
  };

  const columns: ColumnDef<IPODealSize>[] = useMemo(() => [
    {
      accessorKey: 'period_date',
      header: '期間',
      cell: ({ row }) => (
        <span className='font-medium'>{row.original.period_date}</span>
      ),
    },
    {
      accessorKey: 'size_category',
      header: '規模類別',
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
      header: '交易數量',
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
      header: '總金額',
      cell: ({ row }) => (
        <span className='font-mono font-medium'>
          {formatCurrency(row.original.total_amount)}
        </span>
      ),
    },
    {
      accessorKey: 'avg_deal_size',
      header: '平均交易規模',
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
      header: '公司',
      cell: ({ row }) => row.original.company_name || '-',
    },
    {
      id: 'actions',
      header: '操作',
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
  ], []);

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
            title='IPO 交易規模分佈'
            description='分析不同規模的IPO交易分佈情況'
          />
          <Link
            href='/dashboard/business/ipo-deal-size/new/edit'
            className={cn(buttonVariants())}
          >
            <IconPlus className='mr-2 size-4' />
            新增記錄
          </Link>
        </div>
        <Separator />
        <DataTable table={table} />
      </div>
    </PageContainer>
  );
}
