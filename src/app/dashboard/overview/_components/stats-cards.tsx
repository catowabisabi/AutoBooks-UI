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
import { IconTrendingUp } from '@tabler/icons-react';
import { useApp } from '@/contexts/app-context';

export function StatsCards() {
  const { currentCompany } = useApp();
  const stats = currentCompany.stats;

  return (
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
  );
}
