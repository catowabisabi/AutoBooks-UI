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
  IconProgress,
  IconCalendar,
} from '@tabler/icons-react';
import { ipoTimelineProgressApi, IPOTimelineProgress } from '@/features/business/services';
import { useDataTable } from '@/hooks/use-data-table';
import { Progress } from '@/components/ui/progress';

// Phase labels in Chinese
const phaseLabels: Record<string, string> = {
  due_diligence: '盡職調查',
  documentation: '文件準備',
  regulatory: '監管申報',
  marketing: '路演推廣',
  pricing: '定價發行',
};

// Status badges
const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' }> = {
  not_started: { label: '未開始', variant: 'secondary' },
  in_progress: { label: '進行中', variant: 'default' },
  completed: { label: '已完成', variant: 'success' },
  delayed: { label: '延遲', variant: 'destructive' },
};

// Mock data matching frontend chart
const mockData: IPOTimelineProgress[] = [
  {
    id: '1',
    company: '1',
    company_name: 'BMI (IPO)',
    phase: 'due_diligence',
    progress_percentage: 92,
    target_date: '2024-11-15',
    status: 'completed',
    is_active: true,
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '2',
    company: '1',
    company_name: 'BMI (IPO)',
    phase: 'documentation',
    progress_percentage: 78,
    target_date: '2024-12-30',
    status: 'in_progress',
    is_active: true,
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '3',
    company: '1',
    company_name: 'BMI (IPO)',
    phase: 'regulatory',
    progress_percentage: 45,
    target_date: '2025-01-30',
    status: 'in_progress',
    is_active: true,
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '4',
    company: '1',
    company_name: 'BMI (IPO)',
    phase: 'marketing',
    progress_percentage: 30,
    target_date: '2025-02-28',
    status: 'not_started',
    is_active: true,
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '5',
    company: '1',
    company_name: 'BMI (IPO)',
    phase: 'pricing',
    progress_percentage: 15,
    target_date: '2025-03-31',
    status: 'not_started',
    is_active: true,
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
];

export default function IPOTimelineProgressPage() {
  const [data, setData] = useState<IPOTimelineProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await ipoTimelineProgressApi.list();
        setData(result.results || result);
      } catch (error) {
        console.error('Failed to fetch IPO timeline progress:', error);
        toast.error('無法載入IPO進度資料，使用模擬數據');
        setData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await ipoTimelineProgressApi.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success('記錄已刪除');
    } catch (error) {
      toast.error('刪除失敗');
    }
  };

  const columns: ColumnDef<IPOTimelineProgress>[] = useMemo(() => [
    {
      accessorKey: 'phase',
      header: '階段',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <IconProgress className='size-4 text-muted-foreground' />
          <span className='font-medium'>{phaseLabels[row.original.phase] || row.original.phase}</span>
        </div>
      ),
    },
    {
      accessorKey: 'progress_percentage',
      header: '完成進度',
      cell: ({ row }) => (
        <div className='flex items-center gap-3 min-w-[150px]'>
          <Progress value={row.original.progress_percentage} className='h-2 flex-1' />
          <span className='font-mono text-sm font-medium w-12 text-right'>
            {row.original.progress_percentage}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'target_date',
      header: '目標日期',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <IconCalendar className='size-4 text-muted-foreground' />
          <span>{row.original.target_date}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: '狀態',
      cell: ({ row }) => {
        const config = statusConfig[row.original.status];
        return (
          <Badge variant={config?.variant || 'secondary'}>
            {config?.label || row.original.status}
          </Badge>
        );
      },
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
            href={`/dashboard/business/ipo-timeline-progress/${row.original.id}`}
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
          >
            <IconEye className='size-4' />
          </Link>
          <Link
            href={`/dashboard/business/ipo-timeline-progress/${row.original.id}/edit`}
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
            title='IPO 時間線進度'
            description='追蹤各IPO階段的完成進度'
          />
          <Link
            href='/dashboard/business/ipo-timeline-progress/new/edit'
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
