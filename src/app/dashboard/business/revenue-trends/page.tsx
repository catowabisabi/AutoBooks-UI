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
  IconTrendingUp,
  IconTrendingDown,
} from '@tabler/icons-react';
import { revenueTrendsApi, RevenueTrend } from '@/features/business/services';
import { useDataTable } from '@/hooks/use-data-table';

// Mock data
const mockData: RevenueTrend[] = [
  {
    id: '1',
    period: '2024-Q4',
    total_revenue: 5800000,
    recurring_revenue: 3200000,
    project_revenue: 2600000,
    client_count: 45,
    avg_revenue_per_client: 128889,
    growth_rate: 15.5,
    notes: '季度收入創新高',
    is_active: true,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '2',
    period: '2024-Q3',
    total_revenue: 5020000,
    recurring_revenue: 3000000,
    project_revenue: 2020000,
    client_count: 42,
    avg_revenue_per_client: 119524,
    growth_rate: 8.2,
    notes: '穩定增長',
    is_active: true,
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-09-01T00:00:00Z',
  },
  {
    id: '3',
    period: '2024-Q2',
    total_revenue: 4640000,
    recurring_revenue: 2800000,
    project_revenue: 1840000,
    client_count: 40,
    avg_revenue_per_client: 116000,
    growth_rate: -2.1,
    notes: '季節性調整',
    is_active: true,
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
];

// Format number to currency
const formatCurrency = (value?: number) => {
  if (!value) return '-';
  return new Intl.NumberFormat('zh-HK', {
    style: 'currency',
    currency: 'HKD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Get growth rate badge
const getGrowthBadge = (rate?: number) => {
  if (!rate) return { label: '-', variant: 'secondary', icon: null };
  if (rate > 0) return {
    label: `+${rate.toFixed(1)}%`,
    variant: 'success',
    icon: IconTrendingUp,
  };
  return {
    label: `${rate.toFixed(1)}%`,
    variant: 'destructive',
    icon: IconTrendingDown,
  };
};

export default function RevenueTrendsPage() {
  const [data, setData] = useState<RevenueTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await revenueTrendsApi.list();
        setData(result.results || result);
      } catch (error) {
        console.error('Failed to fetch revenue trends:', error);
        toast.error('無法載入收入趨勢資料，使用模擬數據');
        setData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await revenueTrendsApi.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success('記錄已刪除');
    } catch (error) {
      toast.error('刪除失敗');
    }
  };

  const columns: ColumnDef<RevenueTrend>[] = useMemo(() => [
    {
      accessorKey: 'period',
      header: '期間',
      cell: ({ row }) => (
        <span className='font-medium'>{row.original.period}</span>
      ),
    },
    {
      accessorKey: 'total_revenue',
      header: '總收入',
      cell: ({ row }) => (
        <span className='font-mono font-medium'>
          {formatCurrency(row.original.total_revenue)}
        </span>
      ),
    },
    {
      accessorKey: 'recurring_revenue',
      header: '經常性收入',
      cell: ({ row }) => (
        <span className='font-mono'>
          {formatCurrency(row.original.recurring_revenue)}
        </span>
      ),
    },
    {
      accessorKey: 'project_revenue',
      header: '項目收入',
      cell: ({ row }) => (
        <span className='font-mono'>
          {formatCurrency(row.original.project_revenue)}
        </span>
      ),
    },
    {
      accessorKey: 'client_count',
      header: '客戶數',
      cell: ({ row }) => row.original.client_count,
    },
    {
      accessorKey: 'growth_rate',
      header: '增長率',
      cell: ({ row }) => {
        const growth = getGrowthBadge(row.original.growth_rate);
        const Icon = growth.icon;
        return (
          <Badge variant={growth.variant as any} className='gap-1'>
            {Icon && <Icon className='size-3' />}
            {growth.label}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Link
            href={`/dashboard/business/revenue-trends/${row.original.id}`}
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
          >
            <IconEye className='size-4' />
          </Link>
          <Link
            href={`/dashboard/business/revenue-trends/${row.original.id}/edit`}
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
            title='收入趨勢'
            description='追蹤和分析公司收入變化趨勢'
          />
          <Link
            href='/dashboard/business/revenue-trends/new/edit'
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
