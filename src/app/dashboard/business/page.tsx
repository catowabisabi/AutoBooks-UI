'use client';

import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from '@tabler/icons-react';
import { useTranslation } from '@/lib/i18n/provider';

export default function BusinessPage() {
  const { t } = useTranslation();
  
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
          <CardHeader>
            <CardTitle>{t('businessOverview.quickStats')}</CardTitle>
            <CardDescription>{t('businessOverview.businessOverviewData')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-4 lg:grid-cols-8'>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>{t('businessOverview.listedClients')}</p>
                <p className='text-2xl font-bold'>-</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>{t('businessOverview.ipoProjects')}</p>
                <p className='text-2xl font-bold'>-</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>{t('businessOverview.monthlyAnnouncements')}</p>
                <p className='text-2xl font-bold'>-</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>{t('businessOverview.mediaCoverage')}</p>
                <p className='text-2xl font-bold'>-</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>{t('businessOverview.auditsInProgress')}</p>
                <p className='text-2xl font-bold'>-</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>{t('businessOverview.pendingTaxCases')}</p>
                <p className='text-2xl font-bold'>-</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>{t('businessOverview.monthlyHours')}</p>
                <p className='text-2xl font-bold'>-</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>{t('businessOverview.pendingReceivables')}</p>
                <p className='text-2xl font-bold'>-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
