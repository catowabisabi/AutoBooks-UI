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
import { useTranslation } from '@/lib/i18n/provider';

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
  const { t } = useTranslation();
  const [data, setData] = useState<IPOTimelineProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Phase labels
  const phaseLabels: Record<string, string> = {
    due_diligence: t('business.dueDiligencePhase'),
    documentation: t('business.documentation'),
    regulatory: t('business.regulatoryFiling'),
    marketing: t('business.marketing'),
    pricing: t('business.pricing'),
  };

  // Status badges
  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' }> = {
    not_started: { label: t('business.notStartedStatus'), variant: 'secondary' },
    in_progress: { label: t('business.inProgressStatus'), variant: 'default' },
    completed: { label: t('business.completedStatus'), variant: 'success' },
    delayed: { label: t('business.delayed'), variant: 'destructive' },
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await ipoTimelineProgressApi.list();
        // eslint-disable-next-line no-console
        console.log('IPO Timeline Progress API result:', result);
        // Handle both array and paginated response
        const items = Array.isArray(result) ? result : (result.results || []);
        setData(items);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch IPO timeline progress:', error);
        toast.error(t('business.loadFailed'));
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
      await ipoTimelineProgressApi.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success(t('business.recordDeleted'));
    } catch (error) {
      toast.error(t('common.deleteFailed'));
    }
  };

  const columns: ColumnDef<IPOTimelineProgress>[] = useMemo(() => [
    {
      accessorKey: 'phase',
      header: t('business.phase'),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <IconProgress className='size-4 text-muted-foreground' />
          <span className='font-medium'>{phaseLabels[row.original.phase] || row.original.phase}</span>
        </div>
      ),
    },
    {
      accessorKey: 'progress_percentage',
      header: t('common.progress'),
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
      header: t('business.targetDate'),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <IconCalendar className='size-4 text-muted-foreground' />
          <span>{row.original.target_date}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t, phaseLabels, statusConfig]);

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
            title={t('business.ipoTimelineProgressManagement')}
            description={t('business.ipoTimelineProgressDescription')}
          />
          <Link
            href='/dashboard/business/ipo-timeline-progress/new/edit'
            className={cn(buttonVariants())}
          >
            <IconPlus className='mr-2 size-4' />
            {t('business.newTimelineRecord')}
          </Link>
        </div>
        <Separator />
        <DataTable table={table} />
      </div>
    </PageContainer>
  );
}
