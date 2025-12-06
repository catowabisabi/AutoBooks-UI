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
  IconFilter,
  IconArrowRight,
} from '@tabler/icons-react';
import { ipoDealFunnelApi, IPODealFunnel } from '@/features/business/services';
import { useDataTable } from '@/hooks/use-data-table';

// Stage labels in Chinese
const stageLabels: Record<string, string> = {
  leads: '潛在客戶',
  qualified: '合格客戶',
  proposal: '提案中',
  negotiation: '談判中',
  closed_won: '已成交',
};

// Stage colors for badges
const stageConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'success' | 'outline' }> = {
  leads: { variant: 'outline' },
  qualified: { variant: 'secondary' },
  proposal: { variant: 'default' },
  negotiation: { variant: 'default' },
  closed_won: { variant: 'success' },
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
const mockData: IPODealFunnel[] = [
  {
    id: '1',
    company: '1',
    company_name: 'BMI (IPO)',
    period_date: '2024-12-01',
    stage: 'leads',
    deal_count: 45,
    conversion_rate: 0,
    total_value: 250000000,
    notes: '本月新增潛在客戶',
    is_active: true,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '2',
    company: '1',
    company_name: 'BMI (IPO)',
    period_date: '2024-12-01',
    stage: 'qualified',
    deal_count: 28,
    conversion_rate: 62.2,
    total_value: 180000000,
    notes: '通過初步篩選',
    is_active: true,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '3',
    company: '1',
    company_name: 'BMI (IPO)',
    period_date: '2024-12-01',
    stage: 'proposal',
    deal_count: 18,
    conversion_rate: 64.3,
    total_value: 120000000,
    notes: '提案階段',
    is_active: true,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '4',
    company: '1',
    company_name: 'BMI (IPO)',
    period_date: '2024-12-01',
    stage: 'negotiation',
    deal_count: 8,
    conversion_rate: 44.4,
    total_value: 80000000,
    notes: '談判階段',
    is_active: true,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '5',
    company: '1',
    company_name: 'BMI (IPO)',
    period_date: '2024-12-01',
    stage: 'closed_won',
    deal_count: 3,
    conversion_rate: 37.5,
    total_value: 45800000,
    notes: '本月成交',
    is_active: true,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
];

export default function IPODealFunnelPage() {
  const [data, setData] = useState<IPODealFunnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await ipoDealFunnelApi.list();
        setData(result.results || result);
      } catch (error) {
        console.error('Failed to fetch IPO deal funnel:', error);
        toast.error('無法載入交易漏斗資料，使用模擬數據');
        setData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await ipoDealFunnelApi.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success('記錄已刪除');
    } catch (error) {
      toast.error('刪除失敗');
    }
  };

  const columns: ColumnDef<IPODealFunnel>[] = useMemo(() => [
    {
      accessorKey: 'period_date',
      header: '期間',
      cell: ({ row }) => (
        <span className='font-medium'>{row.original.period_date}</span>
      ),
    },
    {
      accessorKey: 'stage',
      header: '漏斗階段',
      cell: ({ row }) => {
        const config = stageConfig[row.original.stage];
        return (
          <Badge variant={config?.variant || 'secondary'} className='gap-1'>
            <IconFilter className='size-3' />
            {stageLabels[row.original.stage] || row.original.stage}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'deal_count',
      header: '交易數量',
      cell: ({ row }) => (
        <span className='font-mono font-medium text-lg'>
          {row.original.deal_count}
        </span>
      ),
    },
    {
      accessorKey: 'conversion_rate',
      header: '轉換率',
      cell: ({ row }) => (
        <div className='flex items-center gap-1'>
          {row.original.conversion_rate > 0 ? (
            <>
              <IconArrowRight className='size-3 text-green-500' />
              <span className='font-mono text-green-600'>
                {parseFloat(String(row.original.conversion_rate || 0)).toFixed(1)}%
              </span>
            </>
          ) : (
            <span className='text-muted-foreground'>-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'total_value',
      header: '總價值',
      cell: ({ row }) => (
        <span className='font-mono font-medium'>
          {formatCurrency(row.original.total_value)}
        </span>
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
            href={`/dashboard/business/ipo-deal-funnel/${row.original.id}`}
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
          >
            <IconEye className='size-4' />
          </Link>
          <Link
            href={`/dashboard/business/ipo-deal-funnel/${row.original.id}/edit`}
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
            title='IPO 交易漏斗'
            description='追蹤從潛在客戶到成交的轉換過程'
          />
          <Link
            href='/dashboard/business/ipo-deal-funnel/new/edit'
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
