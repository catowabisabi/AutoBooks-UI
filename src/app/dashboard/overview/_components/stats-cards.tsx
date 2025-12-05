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
import { IconTrendingUp, IconCloud, IconCloudOff, IconRefresh } from '@tabler/icons-react';
import { useDashboardData } from '@/hooks/use-dashboard-data';

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
        {/* Primary Industry Metric */}
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>{stats.primaryMetric.label}</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {stats.primaryMetric.value}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconTrendingUp />
                Active
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              {stats.primaryMetric.trend} <IconTrendingUp className='size-4' />
            </div>
            <div className='text-muted-foreground'>
              {stats.clientCount} total clients
            </div>
          </CardFooter>
        </Card>

        {/* Secondary Industry Metric */}
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>{stats.secondaryMetric.label}</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {stats.secondaryMetric.value}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconTrendingUp />
                +12%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              {stats.secondaryMetric.trend}
            </div>
            <div className='text-muted-foreground'>
              {stats.pendingTasks} pending tasks
            </div>
          </CardFooter>
        </Card>

        {/* Tertiary Industry Metric */}
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>{stats.tertiaryMetric.label}</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {stats.tertiaryMetric.value}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconTrendingUp />
                Excellent
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              {stats.tertiaryMetric.trend} <IconTrendingUp className='size-4' />
            </div>
            <div className='text-muted-foreground'>
              Compliance: {stats.complianceScore}
            </div>
          </CardFooter>
        </Card>

        {/* Revenue / Quaternary Metric */}
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Revenue YTD</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {stats.revenueYTD}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconTrendingUp />
                +15.3%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              {stats.quaternaryMetric.label}: {stats.quaternaryMetric.value}
            </div>
            <div className='text-muted-foreground'>
              {stats.quaternaryMetric.trend}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
