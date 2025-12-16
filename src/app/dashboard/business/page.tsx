'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-overlay';
import {
  IconClipboardCheck,
  IconReceipt,
  IconClock,
  IconCash,
  IconArrowRight,
  IconTrendingUp,
  IconBuilding,
  IconChartLine,
  IconSpeakerphone,
  IconNews,
  IconRefresh,
} from '@tabler/icons-react';
import { useTranslation } from '@/lib/i18n/provider';
import { 
  auditsApi, 
  taxReturnsApi, 
  billableHoursApi, 
  revenueApi,
  listedClientsApi,
  ipoMandatesApi,
  announcementsApi,
  mediaCoverageApi,
} from '@/features/business/services';

interface QuickStats {
  listedClients: number;
  ipoProjects: number;
  monthlyAnnouncements: number;
  mediaCoverage: number;
  auditsInProgress: number;
  pendingTaxCases: number;
  monthlyHours: number;
  pendingReceivables: number;
}

export default function BusinessPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<QuickStats>({
    listedClients: 0,
    ipoProjects: 0,
    monthlyAnnouncements: 0,
    mediaCoverage: 0,
    auditsInProgress: 0,
    pendingTaxCases: 0,
    monthlyHours: 0,
    pendingReceivables: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch all stats in parallel
      const [
        listedClientsRes,
        ipoMandatesRes,
        announcementsRes,
        mediaCoverageRes,
        auditsRes,
        taxReturnsRes,
        billableHoursRes,
        revenueRes,
      ] = await Promise.all([
        listedClientsApi.list({ page_size: 1000 }).catch(() => null),
        ipoMandatesApi.list({ page_size: 1000 }).catch(() => null),
        announcementsApi.thisMonth().catch(() => null),
        mediaCoverageApi.list({ page_size: 1000 }).catch(() => null),
        auditsApi.list({ page_size: 1000 }).catch(() => null),
        taxReturnsApi.list({ page_size: 1000 }).catch(() => null),
        billableHoursApi.summary().catch(() => null),
        revenueApi.summary().catch(() => null),
      ]);

      const listedClients = listedClientsRes?.results || [];
      const ipoMandates = ipoMandatesRes?.results || [];
      const announcementsThisMonth = (announcementsRes as any)?.count || 0;
      const mediaCoverage = mediaCoverageRes?.results || [];
      const audits = auditsRes?.results || [];
      const taxReturns = taxReturnsRes?.results || [];
      const billableHours = (billableHoursRes || {}) as Record<string, any>;
      const revenue = (revenueRes || {}) as Record<string, any>;

      // Calculate stats
      const auditsInProgress = audits.filter((a: any) => 
        a.status?.toUpperCase() !== 'COMPLETED'
      ).length;
      
      const pendingTaxCases = taxReturns.filter((t: any) => 
        t.status?.toUpperCase() === 'PENDING'
      ).length;

      const totalBillableHours = parseFloat(billableHours['billable_hours'] || billableHours['total_hours'] || 0);
      const pendingAmount = parseFloat(revenue['pending_amount'] || 0);

      setStats({
        listedClients: listedClients.length,
        ipoProjects: ipoMandates.length,
        monthlyAnnouncements: announcementsThisMonth,
        mediaCoverage: mediaCoverage.length,
        auditsInProgress,
        pendingTaxCases,
        monthlyHours: totalBillableHours,
        pendingReceivables: pendingAmount,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch business stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `HK$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `HK$${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };
  
  const businessModules = [
    {
      title: t('businessOverview.listedClients'),
      description: t('businessOverview.listedClientsDesc'),
      href: '/dashboard/business/listed-clients',
      icon: IconBuilding,
      stats: t('businessOverview.activeClients'),
      color: 'bg-indigo-500/10 text-indigo-600',
    },
    {
      title: t('businessOverview.ipoProjects'),
      description: t('businessOverview.ipoProjectsDesc'),
      href: '/dashboard/business/ipo-mandates',
      icon: IconChartLine,
      stats: t('businessOverview.projectsInProgress'),
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      title: t('businessOverview.announcements'),
      description: t('businessOverview.announcementsDesc'),
      href: '/dashboard/business/announcements',
      icon: IconSpeakerphone,
      stats: t('businessOverview.monthlyAnnouncements'),
      color: 'bg-amber-500/10 text-amber-600',
    },
    {
      title: t('businessOverview.mediaCoverage'),
      description: t('businessOverview.mediaCoverageDesc'),
      href: '/dashboard/business/media-coverage',
      icon: IconNews,
      stats: t('businessOverview.monthlyMediaCoverage'),
      color: 'bg-rose-500/10 text-rose-600',
    },
    {
      title: t('businessOverview.auditProjects'),
      description: t('businessOverview.auditProjectsDesc'),
      href: '/dashboard/business/audits',
      icon: IconClipboardCheck,
      stats: t('businessOverview.auditsInProgress'),
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: t('businessOverview.taxReturns'),
      description: t('businessOverview.taxReturnsDesc'),
      href: '/dashboard/business/tax-returns',
      icon: IconReceipt,
      stats: t('businessOverview.pendingTaxCases'),
      color: 'bg-green-500/10 text-green-600',
    },
    {
      title: t('businessOverview.billableHours'),
      description: t('businessOverview.billableHoursDesc'),
      href: '/dashboard/business/billable-hours',
      icon: IconClock,
      stats: t('businessOverview.monthlyHours'),
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      title: t('businessOverview.revenueManagement'),
      description: t('businessOverview.revenueManagementDesc'),
      href: '/dashboard/business/revenue',
      icon: IconCash,
      stats: t('businessOverview.pendingReceivables'),
      color: 'bg-orange-500/10 text-orange-600',
    },
  ];

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>{t('businessOverview.title')}</h1>
          <p className='text-muted-foreground'>
            {t('businessOverview.description')}
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {businessModules.map((module) => (
            <Link key={module.href} href={module.href}>
              <Card className='transition-all hover:shadow-md hover:border-primary/50 cursor-pointer h-full'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <div className={`rounded-lg p-2.5 ${module.color}`}>
                    <module.icon className='size-6' />
                  </div>
                  <IconArrowRight className='size-5 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <CardTitle className='text-lg mb-2'>{module.title}</CardTitle>
                  <CardDescription className='text-sm line-clamp-2'>
                    {module.description}
                  </CardDescription>
                  <div className='mt-4 flex items-center gap-2'>
                    <Badge variant='secondary' className='text-xs'>
                      <IconTrendingUp className='mr-1 size-3' />
                      {module.stats}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <div>
              <CardTitle>{t('businessOverview.quickStats')}</CardTitle>
              <CardDescription>{t('businessOverview.businessOverviewData')}</CardDescription>
            </div>
            <button 
              onClick={fetchStats} 
              className='p-2 hover:bg-muted rounded-md transition-colors'
              disabled={isLoading}
            >
              <IconRefresh className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-4 lg:grid-cols-8'>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>{t('businessOverview.listedClients')}</p>
                {isLoading ? (
                  <Skeleton className='h-8 w-16 mt-1' />
                ) : (
                  <p className='text-2xl font-bold'>{stats.listedClients || '-'}</p>
                )}
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>{t('businessOverview.ipoProjects')}</p>
                {isLoading ? (
                  <Skeleton className='h-8 w-16 mt-1' />
                ) : (
                  <p className='text-2xl font-bold'>{stats.ipoProjects || '-'}</p>
                )}
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>{t('businessOverview.monthlyAnnouncements')}</p>
                {isLoading ? (
                  <Skeleton className='h-8 w-16 mt-1' />
                ) : (
                  <p className='text-2xl font-bold'>{stats.monthlyAnnouncements || '-'}</p>
                )}
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>{t('businessOverview.mediaCoverage')}</p>
                {isLoading ? (
                  <Skeleton className='h-8 w-16 mt-1' />
                ) : (
                  <p className='text-2xl font-bold'>{stats.mediaCoverage || '-'}</p>
                )}
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>{t('businessOverview.auditsInProgress')}</p>
                {isLoading ? (
                  <Skeleton className='h-8 w-16 mt-1' />
                ) : (
                  <p className='text-2xl font-bold'>{stats.auditsInProgress || '-'}</p>
                )}
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>{t('businessOverview.pendingTaxCases')}</p>
                {isLoading ? (
                  <Skeleton className='h-8 w-16 mt-1' />
                ) : (
                  <p className='text-2xl font-bold'>{stats.pendingTaxCases || '-'}</p>
                )}
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>{t('businessOverview.monthlyHours')}</p>
                {isLoading ? (
                  <Skeleton className='h-8 w-16 mt-1' />
                ) : (
                  <p className='text-2xl font-bold'>{stats.monthlyHours > 0 ? `${stats.monthlyHours}h` : '-'}</p>
                )}
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>{t('businessOverview.pendingReceivables')}</p>
                {isLoading ? (
                  <Skeleton className='h-8 w-16 mt-1' />
                ) : (
                  <p className='text-2xl font-bold'>{stats.pendingReceivables > 0 ? formatNumber(stats.pendingReceivables) : '-'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
