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
import { auditsApi, AuditProject } from '@/features/business/services';

export default function AuditsListPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [data, setData] = useState<AuditProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NOT_STARTED: 'secondary',
      PLANNING: 'outline',
      FIELDWORK: 'default',
      REVIEW: 'default',
      REPORTING: 'default',
      COMPLETED: 'success',
      ON_HOLD: 'destructive',
    };
    return colors[status] || 'secondary';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NOT_STARTED: t('business.notStarted'),
      PLANNING: t('business.planning'),
      FIELDWORK: t('business.fieldwork'),
      REVIEW: t('business.review'),
      REPORTING: t('business.reporting'),
      COMPLETED: t('business.completed'),
      ON_HOLD: t('business.onHold'),
    };
    return labels[status] || status;
  };

  // Mock data for demo
  const mockData: AuditProject[] = [
    {
      id: 'demo-1',
      company: 'demo-company-1',
      company_name: 'ABC 有限公司',
      fiscal_year: '2024',
      audit_type: 'Annual Audit',
      progress: 75,
      status: 'FIELDWORK',
      start_date: '2024-01-15',
      deadline: '2024-03-31',
      assigned_to: 'demo-user-1',
      assigned_to_name: '張經理',
      budget_hours: 200,
      actual_hours: 150,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 'demo-2',
      company: 'demo-company-2',
      company_name: 'XYZ 科技股份有限公司',
      fiscal_year: '2024',
      audit_type: 'Tax Audit',
      progress: 100,
      status: 'COMPLETED',
      start_date: '2024-01-01',
      deadline: '2024-02-28',
      completion_date: '2024-02-25',
      assigned_to: 'demo-user-2',
      assigned_to_name: '李會計師',
      budget_hours: 100,
      actual_hours: 95,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-02-25T00:00:00Z',
    },
    {
      id: 'demo-3',
      company: 'demo-company-3',
      company_name: 'Hong Kong Trading Ltd.',
      fiscal_year: '2024',
      audit_type: 'Internal Audit',
      progress: 30,
      status: 'PLANNING',
      start_date: '2024-02-01',
      deadline: '2024-04-30',
      assigned_to: 'demo-user-1',
      assigned_to_name: '張經理',
      budget_hours: 150,
      actual_hours: 45,
      is_active: true,
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-15T00:00:00Z',
    },
    {
      id: 'demo-4',
      company: 'demo-company-4',
      company_name: '大灣區投資控股',
      fiscal_year: '2024',
      audit_type: 'Due Diligence',
      progress: 50,
      status: 'REVIEW',
      start_date: '2024-01-20',
      deadline: '2024-03-15',
      assigned_to: 'demo-user-3',
      assigned_to_name: '王總監',
      budget_hours: 300,
      actual_hours: 150,
      is_active: true,
      created_at: '2024-01-20T00:00:00Z',
      updated_at: '2024-02-20T00:00:00Z',
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await auditsApi.list({ ordering: '-created_at' });
      const results = response.results || [];
      
      // If API returns empty data, use mock data
      if (results.length === 0) {
        // eslint-disable-next-line no-console
        console.log('[Audits] API returned empty, using mock data');
        setData(mockData);
        setIsUsingMockData(true);
      } else {
        setData(results);
        setIsUsingMockData(false);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch audits:', error);
      setIsUsingMockData(true);
      // Mock data fallback
      setData(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await auditsApi.delete(deleteId);
      toast.success(t('common.deleteSuccess'));
      fetchData();
    } catch (error) {
      toast.error(t('common.deleteFailed'));
    }
    setDeleteId(null);
  };

  const columns: ColumnDef<AuditProject>[] = [
    {
      accessorKey: 'company_name',
      header: t('business.clientCompany'),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/business/audits/${row.original.id}`}
          className='font-medium text-primary hover:underline'
        >
          {row.original.company_name || row.original.company}
        </Link>
      ),
    },
    {
      accessorKey: 'fiscal_year',
      header: t('business.fiscalYear'),
    },
    {
      accessorKey: 'audit_type',
      header: t('business.auditType'),
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
      accessorKey: 'assigned_to_name',
      header: t('business.assignedTo'),
      cell: ({ row }) => row.original.assigned_to_name || '-',
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
                router.push(`/dashboard/business/audits/${row.original.id}`)
              }
            >
              <IconEye className='mr-2 size-4' />
              {t('common.viewDetails')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/audits/${row.original.id}/edit`)
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
    pageCount: -1, // Client-side pagination, let the table handle it
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
            title={t('business.auditManagement')}
            description={t('business.auditDescription')}
          />
          <div className='flex items-center gap-2'>
            {/* Data source indicator */}
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
              href='/dashboard/business/audits/new'
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <IconPlus className='mr-2 size-4' />
              {t('business.newProject')}
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('business.deleteAuditConfirm')}
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
