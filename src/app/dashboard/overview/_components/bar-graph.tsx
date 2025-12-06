'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { useApp } from '@/contexts/app-context';
import { useTranslation } from '@/lib/i18n/provider';

// Accounting - Monthly billable hours by service type
const accountingBillableData = [
  { month: 'Jul', audit: 420, tax: 180, advisory: 95 },
  { month: 'Aug', audit: 380, tax: 220, advisory: 110 },
  { month: 'Sep', audit: 450, tax: 195, advisory: 85 },
  { month: 'Oct', audit: 520, tax: 240, advisory: 120 },
  { month: 'Nov', audit: 480, tax: 280, advisory: 105 },
  { month: 'Dec', audit: 550, tax: 350, advisory: 140 }
];

// Financial PR - Client engagement metrics
const prEngagementData = [
  { month: 'Jul', announcements: 18, meetings: 42, events: 3 },
  { month: 'Aug', announcements: 22, meetings: 38, events: 2 },
  { month: 'Sep', announcements: 28, meetings: 52, events: 4 },
  { month: 'Oct', announcements: 24, meetings: 48, events: 3 },
  { month: 'Nov', announcements: 32, meetings: 58, events: 5 },
  { month: 'Dec', announcements: 35, meetings: 62, events: 4 }
];

// IPO Advisory - Deal value by stage (HK$ millions)
const ipoDealValueData = [
  { month: 'Jul', preparation: 850, filing: 420, listing: 1200 },
  { month: 'Aug', preparation: 920, filing: 680, listing: 0 },
  { month: 'Sep', preparation: 780, filing: 520, listing: 1850 },
  { month: 'Oct', preparation: 1100, filing: 890, listing: 2200 },
  { month: 'Nov', preparation: 950, filing: 720, listing: 1500 },
  { month: 'Dec', preparation: 1250, filing: 980, listing: 2800 }
];

const chartConfigs = {
  accounting: {
    metrics: {
      audit: { label: 'Audit', color: 'var(--primary)' },
      tax: { label: 'Tax', color: 'var(--primary)' },
      advisory: { label: 'Advisory', color: 'var(--primary)' }
    }
  },
  'financial-pr': {
    metrics: {
      announcements: { label: 'Announcements', color: 'var(--primary)' },
      meetings: { label: 'Investor Meetings', color: 'var(--primary)' },
      events: { label: 'Events', color: 'var(--primary)' }
    }
  },
  'ipo-advisory': {
    metrics: {
      preparation: { label: 'Preparation', color: 'var(--primary)' },
      filing: { label: 'Filing', color: 'var(--primary)' },
      listing: { label: 'Listed', color: 'var(--primary)' }
    }
  }
};

export function BarGraph() {
  const { t } = useTranslation();
  const { currentCompany } = useApp();
  const companyType = currentCompany.type;

  // i18n config for chart titles
  const chartConfigs = {
    accounting: {
      title: t('dashboard.charts.bar.accounting.title', 'Billable Hours by Service'),
      description: t('dashboard.charts.bar.accounting.description', 'Monthly breakdown of billable hours'),
      metrics: {
        audit: { label: t('dashboard.charts.bar.accounting.audit', 'Audit'), color: 'var(--primary)' },
        tax: { label: t('dashboard.charts.bar.accounting.tax', 'Tax'), color: 'var(--primary)' },
        advisory: { label: t('dashboard.charts.bar.accounting.advisory', 'Advisory'), color: 'var(--primary)' }
      }
    },
    'financial-pr': {
      title: t('dashboard.charts.bar.financialPR.title', 'Client Engagement Activities'),
      description: t('dashboard.charts.bar.financialPR.description', 'Monthly PR activities performed'),
      metrics: {
        announcements: { label: t('dashboard.charts.bar.financialPR.announcements', 'Announcements'), color: 'var(--primary)' },
        meetings: { label: t('dashboard.charts.bar.financialPR.meetings', 'Investor Meetings'), color: 'var(--primary)' },
        events: { label: t('dashboard.charts.bar.financialPR.events', 'Events'), color: 'var(--primary)' }
      }
    },
    'ipo-advisory': {
      title: t('dashboard.charts.bar.ipoAdvisory.title', 'Deal Pipeline Value'),
      description: t('dashboard.charts.bar.ipoAdvisory.description', 'Deal value by stage (HK$ millions)'),
      metrics: {
        preparation: { label: t('dashboard.charts.bar.ipoAdvisory.preparation', 'Preparation'), color: 'var(--primary)' },
        filing: { label: t('dashboard.charts.bar.ipoAdvisory.filing', 'Filing'), color: 'var(--primary)' },
        listing: { label: t('dashboard.charts.bar.ipoAdvisory.listing', 'Listed'), color: 'var(--primary)' }
      }
    }
  };
  
  const chartData = companyType === 'accounting'
    ? accountingBillableData
    : companyType === 'financial-pr'
    ? prEngagementData
    : ipoDealValueData;

  const config = chartConfigs[companyType];
  const metrics = Object.keys(config.metrics) as string[];
  
  const [activeMetric, setActiveMetric] = React.useState<string>(metrics[0]);

  // Reset active metric when company changes
  React.useEffect(() => {
    setActiveMetric(metrics[0]);
  }, [companyType]);

  const totals = React.useMemo(() => {
    const result: Record<string, number> = {};
    metrics.forEach(metric => {
      result[metric] = chartData.reduce((acc, curr) => acc + (curr[metric as keyof typeof curr] as number || 0), 0);
    });
    return result;
  }, [chartData, metrics]);

  const chartConfig = config.metrics as ChartConfig;

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <Card className='@container/card !pt-3'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 !py-0'>
          <CardTitle>{config.title}</CardTitle>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>
              {config.description}
            </span>
            <span className='@[540px]/card:hidden'>Last 6 months</span>
          </CardDescription>
        </div>
        <div className='flex'>
          {metrics.map((metric) => {
            const metricConfig = config.metrics[metric as keyof typeof config.metrics];
            return (
              <button
                key={metric}
                data-active={activeMetric === metric}
                className='data-[active=true]:bg-primary/5 hover:bg-primary/5 relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left transition-colors duration-200 even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6'
                onClick={() => setActiveMetric(metric)}
              >
                <span className='text-muted-foreground text-xs'>
                  {metricConfig?.label || metric}
                </span>
                <span className='text-lg leading-none font-bold sm:text-3xl'>
                  {totals[metric]?.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <BarChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillBar' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='0%'
                  stopColor='var(--primary)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='100%'
                  stopColor='var(--primary)'
                  stopOpacity={0.2}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey='value'
                />
              }
            />
            <Bar
              dataKey={activeMetric}
              fill='url(#fillBar)'
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
