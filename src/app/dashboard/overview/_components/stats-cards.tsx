'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IconTrendingUp, IconCloud, IconCloudOff, IconRefresh, IconExternalLink } from '@tabler/icons-react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import Link from 'next/link';

export function StatsCards() {
  const { stats, isLoading, isUsingMockData, refetch } = useDashboardData();

  // Loading state
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className='@container/card'>
            <CardHeader>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-8 w-32' />
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-20' />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Card configurations with links
  const cardConfigs = [
    {
      label: stats.primaryMetric.label,
      value: stats.primaryMetric.value,
      trend: stats.primaryMetric.trend,
      badge: 'Active',
      footer: `${stats.clientCount} total clients`,
      href: '/dashboard/business/audits',
      linkText: '查看審計專案'
    },
    {
      label: stats.secondaryMetric.label,
      value: stats.secondaryMetric.value,
      trend: stats.secondaryMetric.trend,
      badge: '+12%',
      footer: `${stats.pendingTasks} pending tasks`,
      href: '/dashboard/business/tax-returns',
      linkText: '查看稅務申報'
    },
    {
      label: stats.tertiaryMetric.label,
      value: stats.tertiaryMetric.value,
      trend: stats.tertiaryMetric.trend,
      badge: 'Excellent',
      footer: `Compliance: ${stats.complianceScore}`,
      href: '/dashboard/business/billable-hours',
      linkText: '查看工時記錄'
    },
    {
      label: 'Revenue YTD',
      value: stats.revenueYTD,
      trend: `${stats.quaternaryMetric.label}: ${stats.quaternaryMetric.value}`,
      badge: '+15.3%',
      footer: stats.quaternaryMetric.trend,
      href: '/dashboard/business/revenue',
      linkText: '查看收入管理'
    }
  ];

  return (
    <div className='space-y-2'>
      {/* Data source indicator */}
      <div className='flex items-center justify-end gap-2 text-xs text-muted-foreground'>
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
        <button onClick={refetch} className='p-1 hover:bg-muted rounded'>
          <IconRefresh className='size-3' />
        </button>
      </div>

      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
        {cardConfigs.map((config, index) => (
          <Link key={index} href={config.href} className='group'>
            <Card className='@container/card h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 cursor-pointer'>
              <CardHeader>
                <CardDescription>{config.label}</CardDescription>
                <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                  {config.value}
                </CardTitle>
                <CardAction>
                  <Badge variant='outline'>
                    <IconTrendingUp />
                    {config.badge}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                <div className='line-clamp-1 flex gap-2 font-medium'>
                  {config.trend} <IconTrendingUp className='size-4' />
                </div>
                <div className='text-muted-foreground'>
                  {config.footer}
                </div>
                <div className='flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity'>
                  <IconExternalLink className='size-3' />
                  {config.linkText}
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
