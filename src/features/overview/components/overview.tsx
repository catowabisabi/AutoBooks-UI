'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaGraph } from './area-graph';
import { BarGraph } from './bar-graph';
import { PieGraph } from './pie-graph';
import { RecentSales } from './recent-sales';
import { AnalysisDialog } from './analysis-dialog';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/app-context';

export default function OverViewPage() {
  const { currentCompany } = useApp();
  const stats = currentCompany.stats;

  // Prepare company data for analysis
  const companyDataForAnalysis = {
    name: currentCompany.name,
    type: currentCompany.type,
    stats: currentCompany.stats as unknown as Record<string, unknown>,
    engagements: currentCompany.engagements || [],
    serviceBreakdown: currentCompany.serviceBreakdown || [],
    currency: currentCompany.currency || 'HKD',
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi, Welcome back 👋
          </h2>
          <div className='hidden items-center space-x-2 md:flex'>
            <AnalysisDialog companyData={companyDataForAnalysis} />
            <Button>Download</Button>
          </div>
        </div>
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='analytics' disabled>
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value='overview' className='space-y-4'>
            <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
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
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
              <div className='col-span-4'>
                <BarGraph />
              </div>
              <Card className='col-span-4 md:col-span-3'>
                <RecentSales />
              </Card>
              <div className='col-span-4'>
                <AreaGraph />
              </div>
              <div className='col-span-4 md:col-span-3'>
                <PieGraph />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
