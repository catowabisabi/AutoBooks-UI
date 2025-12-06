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
import { ipoMandatesApi, IPOMandate } from '@/features/business/services';

const getStageColor = (stage: string) => {
  const colors: Record<string, string> = {
    PITCH: 'secondary',
    MANDATE: 'default',
    PREPARATION: 'outline',
    FILING: 'warning',
    LISTING: 'success',
    COMPLETED: 'success',
    WITHDRAWN: 'destructive',
  };
  return colors[stage] || 'secondary';
};

const getStageLabel = (stage: string) => {
  const labels: Record<string, string> = {
    PITCH: '提案階段',
    MANDATE: '獲得委託',
    PREPARATION: '準備階段',
    FILING: '遞交申請',
    LISTING: '上市階段',
    COMPLETED: '已完成',
    WITHDRAWN: '已撤回',
  };
  return labels[stage] || stage;
};

const formatDealSize = (value?: number) => {
  if (!value) return '-';
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
};

export default function IPOMandatesPage() {
  const router = useRouter();
  const [data, setData] = useState<IPOMandate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const mockData: IPOMandate[] = [
    {
      id: 'demo-1',
      project_name: 'Tech Solutions IPO',
      company: 'demo-company-1',
      company_name: 'Tech Solutions Ltd.',
      stage: 'FILING',
      target_exchange: 'HKEX',
      target_board: 'Main Board',
      deal_size: 500000000,
      deal_size_category: 'MEDIUM',
      fee_percentage: 3.5,
      estimated_fee: 17500000,
      probability: 75,
      pitch_date: '2023-06-01',
      mandate_date: '2023-08-15',
      target_listing_date: '2024-06-01',
      lead_partner: 'demo-user-1',
      lead_partner_name: '王總監',
      sfc_application_date: '2024-01-15',
      is_sfc_approved: false,
      is_active: true,
      created_at: '2023-06-01T00:00:00Z',
      updated_at: '2024-02-15T00:00:00Z',
    },
    {
      id: 'demo-2',
      project_name: 'Green Energy IPO',
      company: 'demo-company-2',
      company_name: 'Green Energy Holdings',
      stage: 'PREPARATION',
      target_exchange: 'HKEX',
      target_board: 'GEM',
      deal_size: 200000000,
      deal_size_category: 'SMALL',
      fee_percentage: 4.0,
      estimated_fee: 8000000,
      probability: 60,
      pitch_date: '2023-09-01',
      mandate_date: '2023-11-01',
      target_listing_date: '2024-09-01',
      lead_partner: 'demo-user-2',
      lead_partner_name: '李經理',
      is_sfc_approved: false,
      is_active: true,
      created_at: '2023-09-01T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z',
    },
    {
      id: 'demo-3',
      project_name: 'Healthcare Plus IPO',
      company: 'demo-company-3',
      company_name: 'Healthcare Plus Inc.',
      stage: 'COMPLETED',
      target_exchange: 'HKEX',
      target_board: 'Main Board',
      deal_size: 1200000000,
      deal_size_category: 'LARGE',
      fee_percentage: 3.0,
      estimated_fee: 36000000,
      probability: 100,
      pitch_date: '2022-06-01',
      mandate_date: '2022-08-01',
      target_listing_date: '2023-06-01',
      actual_listing_date: '2023-06-15',
      lead_partner: 'demo-user-1',
      lead_partner_name: '王總監',
      sfc_application_date: '2023-01-10',
      sfc_approval_date: '2023-04-20',
      is_sfc_approved: true,
      is_active: true,
      created_at: '2022-06-01T00:00:00Z',
      updated_at: '2023-06-15T00:00:00Z',
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await ipoMandatesApi.list({ ordering: '-created_at' });
      const results = response.results || [];
      
      if (results.length === 0) {
        console.log('[IPOMandates] API returned empty, using mock data');
        setData(mockData);
        setIsUsingMockData(true);
      } else {
        setData(results);
        setIsUsingMockData(false);
      }
    } catch (error) {
      console.error('Failed to fetch IPO mandates:', error);
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
      await ipoMandatesApi.delete(deleteId);
      toast.success('IPO項目已刪除');
      fetchData();
    } catch (error) {
      toast.error('刪除失敗');
    }
    setDeleteId(null);
  };

  const columns: ColumnDef<IPOMandate>[] = [
    {
      accessorKey: 'project_name',
      header: '項目名稱',
      cell: ({ row }) => (
        <Link
          href={`/dashboard/business/ipo-mandates/${row.original.id}`}
          className='font-medium text-primary hover:underline'
        >
          {row.original.project_name}
        </Link>
      ),
    },
    {
      accessorKey: 'company_name',
      header: '公司',
      cell: ({ row }) => row.original.company_name || '-',
    },
    {
      accessorKey: 'stage',
      header: '階段',
      cell: ({ row }) => (
        <Badge variant={getStageColor(row.original.stage) as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'}>
          {getStageLabel(row.original.stage)}
        </Badge>
      ),
    },
    {
      accessorKey: 'target_exchange',
      header: '目標交易所',
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span>{row.original.target_exchange}</span>
          <span className='text-xs text-muted-foreground'>
            {row.original.target_board}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'deal_size',
      header: '交易規模',
      cell: ({ row }) => formatDealSize(row.original.deal_size),
    },
    {
      accessorKey: 'probability',
      header: '成功率',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <div className='h-2 w-16 rounded-full bg-muted'>
            <div
              className='h-2 rounded-full bg-primary'
              style={{ width: `${row.original.probability || 0}%` }}
            />
          </div>
          <span className='text-sm text-muted-foreground'>
            {row.original.probability || 0}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'target_listing_date',
      header: '目標上市日期',
      cell: ({ row }) =>
        row.original.target_listing_date
          ? new Date(row.original.target_listing_date).toLocaleDateString('zh-TW')
          : '-',
    },
    {
      accessorKey: 'lead_partner_name',
      header: '負責合夥人',
      cell: ({ row }) => row.original.lead_partner_name || '-',
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
                router.push(`/dashboard/business/ipo-mandates/${row.original.id}`)
              }
            >
              <IconEye className='mr-2 size-4' />
              查看詳情
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/ipo-mandates/${row.original.id}/edit`)
              }
            >
              <IconEdit className='mr-2 size-4' />
              編輯
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='text-destructive'
              onClick={() => setDeleteId(row.original.id)}
            >
              <IconTrash className='mr-2 size-4' />
              刪除
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
            title='IPO 項目管理'
            description='管理上市保薦及財務顧問項目'
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
              href='/dashboard/business/ipo-mandates/new'
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <IconPlus className='mr-2 size-4' />
              新增項目
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
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除此IPO項目嗎？此操作無法撤銷。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>刪除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
