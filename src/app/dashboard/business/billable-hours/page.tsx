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
  IconCheck,
  IconX,
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
import { billableHoursApi, BillableHour } from '@/features/business/services';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    CLERK: '文員',
    ACCOUNTANT: '會計師',
    MANAGER: '經理',
    DIRECTOR: '總監',
    PARTNER: '合夥人',
  };
  return labels[role] || role;
};

const getRoleBadgeColor = (role: string): BadgeVariant => {
  const colors: Record<string, BadgeVariant> = {
    CLERK: 'secondary',
    ACCOUNTANT: 'outline',
    MANAGER: 'default',
    DIRECTOR: 'default',
    PARTNER: 'success',
  };
  return colors[role] || 'secondary';
};

export default function BillableHoursListPage() {
  const router = useRouter();
  const [data, setData] = useState<BillableHour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Mock data for demo
  const mockData: BillableHour[] = [
    {
      id: 'demo-1',
      employee: 'demo-emp-1',
      employee_name: '張小明',
      company: 'demo-company-1',
      company_name: 'ABC 有限公司',
      project_reference: 'AUDIT-2024-001',
      role: 'ACCOUNTANT',
      base_hourly_rate: 200,
      hourly_rate_multiplier: 5,
      effective_rate: 1000,
      date: '2024-01-15',
      actual_hours: 8,
      total_cost: 8000,
      description: '年度審計 - 應收帳款測試',
      is_billable: true,
      is_invoiced: false,
      is_active: true,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 'demo-2',
      employee: 'demo-emp-2',
      employee_name: '李美玲',
      company: 'demo-company-2',
      company_name: 'XYZ 科技股份有限公司',
      project_reference: 'TAX-2024-001',
      role: 'MANAGER',
      base_hourly_rate: 300,
      hourly_rate_multiplier: 3,
      effective_rate: 900,
      date: '2024-01-16',
      actual_hours: 4,
      total_cost: 3600,
      description: '利得稅申報 - 複核',
      is_billable: true,
      is_invoiced: true,
      is_active: true,
      created_at: '2024-01-16T00:00:00Z',
      updated_at: '2024-01-16T00:00:00Z',
    },
    {
      id: 'demo-3',
      employee: 'demo-emp-3',
      employee_name: '王大華',
      company: 'demo-company-3',
      company_name: 'Hong Kong Trading Ltd.',
      project_reference: 'AUDIT-2024-002',
      role: 'DIRECTOR',
      base_hourly_rate: 500,
      hourly_rate_multiplier: 2,
      effective_rate: 1000,
      date: '2024-01-17',
      actual_hours: 3,
      total_cost: 3000,
      description: '內部審計 - 監督複核',
      is_billable: true,
      is_invoiced: false,
      is_active: true,
      created_at: '2024-01-17T00:00:00Z',
      updated_at: '2024-01-17T00:00:00Z',
    },
    {
      id: 'demo-4',
      employee: 'demo-emp-1',
      employee_name: '張小明',
      company: 'demo-company-4',
      company_name: '大灣區投資控股',
      project_reference: 'DD-2024-001',
      role: 'ACCOUNTANT',
      base_hourly_rate: 200,
      hourly_rate_multiplier: 5,
      effective_rate: 1000,
      date: '2024-01-18',
      actual_hours: 6,
      total_cost: 6000,
      description: '盡職調查 - 財務資料整理',
      is_billable: true,
      is_invoiced: false,
      is_active: true,
      created_at: '2024-01-18T00:00:00Z',
      updated_at: '2024-01-18T00:00:00Z',
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await billableHoursApi.list({ ordering: '-date' });
      const results = response.results || [];
      
      // If API returns empty data, use mock data
      if (results.length === 0) {
        console.log('[BillableHours] API returned empty, using mock data');
        setData(mockData);
        setIsUsingMockData(true);
      } else {
        setData(results);
        setIsUsingMockData(false);
      }
    } catch (error) {
      console.error('Failed to fetch billable hours:', error);
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
      await billableHoursApi.delete(deleteId);
      toast.success('工時記錄已刪除');
      fetchData();
    } catch (error) {
      toast.error('刪除失敗');
    }
    setDeleteId(null);
  };

  const columns: ColumnDef<BillableHour>[] = [
    {
      accessorKey: 'date',
      header: '日期',
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString('zh-TW'),
    },
    {
      accessorKey: 'employee_name',
      header: '員工',
      cell: ({ row }) => (
        <Link
          href={`/dashboard/business/billable-hours/${row.original.id}`}
          className='font-medium text-primary hover:underline'
        >
          {row.original.employee_name || row.original.employee}
        </Link>
      ),
    },
    {
      accessorKey: 'company_name',
      header: '客戶',
      cell: ({ row }) => row.original.company_name || '-',
    },
    {
      accessorKey: 'role',
      header: '職級',
      cell: ({ row }) => (
        <Badge variant={getRoleBadgeColor(row.original.role)}>
          {getRoleLabel(row.original.role)}
        </Badge>
      ),
    },
    {
      accessorKey: 'actual_hours',
      header: '工時',
      cell: ({ row }) => `${row.original.actual_hours} 小時`,
    },
    {
      accessorKey: 'effective_rate',
      header: '時薪',
      cell: ({ row }) =>
        row.original.effective_rate
          ? `HK$${row.original.effective_rate.toLocaleString()}`
          : '-',
    },
    {
      accessorKey: 'total_cost',
      header: '總費用',
      cell: ({ row }) =>
        row.original.total_cost
          ? `HK$${row.original.total_cost.toLocaleString()}`
          : '-',
    },
    {
      accessorKey: 'is_billable',
      header: '可收費',
      cell: ({ row }) =>
        row.original.is_billable ? (
          <IconCheck className='size-4 text-green-600' />
        ) : (
          <IconX className='size-4 text-muted-foreground' />
        ),
    },
    {
      accessorKey: 'is_invoiced',
      header: '已開票',
      cell: ({ row }) =>
        row.original.is_invoiced ? (
          <Badge variant='success'>已開票</Badge>
        ) : (
          <Badge variant='outline'>未開票</Badge>
        ),
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
                router.push(`/dashboard/business/billable-hours/${row.original.id}`)
              }
            >
              <IconEye className='mr-2 size-4' />
              查看詳情
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/business/billable-hours/${row.original.id}/edit`)
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
            title='工時記錄管理'
            description='管理員工計費工時、追蹤專案成本'
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
              href='/dashboard/business/billable-hours/new'
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <IconPlus className='mr-2 size-4' />
              新增工時
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
              確定要刪除此工時記錄嗎？此操作無法撤銷。
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
