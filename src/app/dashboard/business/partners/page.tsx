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
  IconUsers,
  IconStar,
  IconMail,
  IconPhone,
} from '@tabler/icons-react';
import { businessPartnersApi, BusinessPartner } from '@/features/business/services';
import { useDataTable } from '@/hooks/use-data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Partner type icons and colors
const partnerTypeConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'success' | 'outline' }> = {
  kol: { variant: 'default' },
  provider: { variant: 'secondary' },
  vendor: { variant: 'outline' },
  media: { variant: 'default' },
  consultant: { variant: 'success' },
};

// Format number to currency
const formatCurrency = (value?: number) => {
  if (!value && value !== 0) return '-';
  return new Intl.NumberFormat('zh-HK', {
    style: 'currency',
    currency: 'HKD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Mock data
const mockData: BusinessPartner[] = [
  {
    id: '1',
    company: '1',
    company_name: 'BMI (IPO)',
    name: 'Goldman Investment Banking',
    partner_type: 'consultant',
    status: 'active',
    contact_person: 'John Smith',
    contact_email: 'john@goldman.com',
    contact_phone: '+852 9876 5432',
    service_description: 'Underwriting services',
    contract_start_date: '2024-01-01',
    contract_end_date: '2025-12-31',
    contract_value: 5000000,
    rating: 4.9,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '2',
    company: '2',
    company_name: 'BMI Innovation (PR)',
    name: 'KOL Connect',
    partner_type: 'kol',
    status: 'active',
    contact_person: 'Alice Wong',
    contact_email: 'alice@kolconnect.com',
    contact_phone: '+852 8765 4321',
    service_description: 'Influencer marketing',
    contract_start_date: '2024-03-01',
    contract_end_date: '2025-06-30',
    contract_value: 280000,
    rating: 4.6,
    is_active: true,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '3',
    company: '3',
    company_name: 'ZL CPA',
    name: 'Elite Tax Advisory',
    partner_type: 'consultant',
    status: 'active',
    contact_person: 'David Chen',
    contact_email: 'david@elitetax.com',
    contact_phone: '+852 7654 3210',
    service_description: 'Tax planning services',
    contract_start_date: '2024-02-01',
    contract_end_date: '2025-01-31',
    contract_value: 250000,
    rating: 4.8,
    is_active: true,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '4',
    company: '2',
    company_name: 'BMI Innovation (PR)',
    name: 'MediaMax HK',
    partner_type: 'media',
    status: 'active',
    contact_person: 'Tom Lee',
    contact_email: 'tom@mediamax.hk',
    contact_phone: '+852 6543 2109',
    service_description: 'Press release distribution',
    contract_start_date: '2024-04-01',
    contract_end_date: '2025-03-31',
    contract_value: 150000,
    rating: 4.7,
    is_active: true,
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '5',
    company: '1',
    company_name: 'BMI (IPO)',
    name: 'Market Research Pro',
    partner_type: 'provider',
    status: 'active',
    contact_person: 'Sarah Chan',
    contact_email: 'sarah@mrpro.com',
    contact_phone: '+852 5432 1098',
    service_description: 'Market analysis',
    contract_start_date: '2024-05-01',
    contract_end_date: '2025-04-30',
    contract_value: 350000,
    rating: 4.6,
    is_active: true,
    created_at: '2024-05-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
];

export default function BusinessPartnersPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<BusinessPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Partner type labels with i18n
  const partnerTypeLabels: Record<string, string> = {
    kol: t('business.kol'),
    provider: t('business.vendor'),
    vendor: t('business.vendor'),
    media: t('business.media'),
    consultant: t('business.consultant'),
  };

  // Status configuration with i18n
  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'outline' }> = {
    active: { label: t('business.active'), variant: 'success' },
    inactive: { label: t('business.inactive'), variant: 'secondary' },
    pending: { label: t('business.pending'), variant: 'outline' },
    terminated: { label: t('business.terminated'), variant: 'destructive' },
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await businessPartnersApi.list();
        console.log('Business Partners API result:', result);
        // Handle both array and paginated response
        const items = Array.isArray(result) ? result : (result.results || []);
        setData(items);
      } catch (error) {
        console.error('Failed to fetch business partners:', error);
        toast.error(t('business.loadPartnersError'));
        setData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await businessPartnersApi.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success(t('common.recordDeleted'));
    } catch (error) {
      toast.error(t('common.deleteFailed'));
    }
  };

  const columns: ColumnDef<BusinessPartner>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: t('common.name'),
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <Avatar className='size-8'>
            <AvatarImage src='' alt={row.original.name} />
            <AvatarFallback className='text-xs'>
              {row.original.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-medium'>{row.original.name}</span>
            <span className='text-xs text-muted-foreground'>
              {row.original.contact_person}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'partner_type',
      header: t('business.partnerType'),
      cell: ({ row }) => {
        const config = partnerTypeConfig[row.original.partner_type];
        return (
          <Badge variant={config?.variant || 'secondary'}>
            {partnerTypeLabels[row.original.partner_type] || row.original.partner_type}
          </Badge>
        );
      },
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
      accessorKey: 'service_description',
      header: t('business.serviceDescription'),
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground max-w-[200px] truncate block'>
          {row.original.service_description || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'contract_value',
      header: t('business.contractValue'),
      cell: ({ row }) => (
        <span className='font-mono font-medium'>
          {formatCurrency(row.original.contract_value)}
        </span>
      ),
    },
    {
      accessorKey: 'rating',
      header: t('business.rating'),
      cell: ({ row }) => (
        <div className='flex items-center gap-1'>
          <IconStar className='size-4 text-yellow-500 fill-yellow-500' />
          <span className='font-medium'>
            {row.original.rating ? parseFloat(String(row.original.rating)).toFixed(1) : '-'}
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
      header: t('common.actions'),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Link
            href={`/dashboard/business/partners/${row.original.id}`}
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
          >
            <IconEye className='size-4' />
          </Link>
          <Link
            href={`/dashboard/business/partners/${row.original.id}/edit`}
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
  ], [t, partnerTypeLabels, statusConfig]);

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
            title={t('business.partnersManagement')}
            description={t('business.partnersDescription')}
          />
          <Link
            href='/dashboard/business/partners/new/edit'
            className={cn(buttonVariants())}
          >
            <IconPlus className='mr-2 size-4' />
            {t('business.newPartner')}
          </Link>
        </div>
        <Separator />
        <DataTable table={table} />
      </div>
    </PageContainer>
  );
}
