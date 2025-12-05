'use client';

import { IconTrendingUp } from '@tabler/icons-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

// Accounting firm - Cash Flow data (收入 vs 支出)
const accountingCashFlowData = [
  { month: 'Jul', income: 980, expenses: 650 },
  { month: 'Aug', income: 1150, expenses: 720 },
  { month: 'Sep', income: 1380, expenses: 780 },
  { month: 'Oct', income: 1520, expenses: 850 },
  { month: 'Nov', income: 1680, expenses: 920 },
  { month: 'Dec', income: 2100, expenses: 980 }
];

// Financial PR - Media Coverage data (正面 vs 負面報導)
const prMediaCoverageData = [
  { month: 'Jul', positive: 145, negative: 12 },
  { month: 'Aug', positive: 168, negative: 8 },
  { month: 'Sep', positive: 192, negative: 15 },
  { month: 'Oct', positive: 178, negative: 10 },
  { month: 'Nov', positive: 210, negative: 6 },
  { month: 'Dec', positive: 245, negative: 9 }
];

// IPO Advisory - Deal Pipeline data (進行中 vs 已完成)
const ipoDealPipelineData = [
  { month: 'Jul', active: 5, completed: 1 },
  { month: 'Aug', active: 6, completed: 2 },
  { month: 'Sep', active: 7, completed: 1 },
  { month: 'Oct', active: 8, completed: 2 },
  { month: 'Nov', active: 7, completed: 3 },
  { month: 'Dec', active: 8, completed: 2 }
];

const chartConfigs = {
  accounting: {
    primary: { label: 'Fee Income (HK$K)', color: 'var(--primary)' },
    secondary: { label: 'Operating Costs (HK$K)', color: 'var(--primary)' }
  },
  'financial-pr': {
    primary: { label: 'Positive Coverage', color: 'var(--primary)' },
    secondary: { label: 'Negative Coverage', color: 'var(--primary)' }
  },
  'ipo-advisory': {
    primary: { label: 'Active Deals', color: 'var(--primary)' },
    secondary: { label: 'Completed Deals', color: 'var(--primary)' }
  }
};

const chartTitles = {
  accounting: {
    title: 'Cash Flow Trend',
    description: 'Fee income vs operating costs (HK$ thousands)',
    trend: 'Net margin improved by 18.5%',
    period: 'July - December 2024'
  },
  'financial-pr': {
    title: 'Media Coverage Analysis',
    description: 'Positive vs negative media mentions for clients',
    trend: 'Positive sentiment up 24.3%',
    period: 'July - December 2024'
  },
  'ipo-advisory': {
    title: 'Deal Pipeline Progress',
    description: 'Active mandates vs completed listings',
    trend: '11 successful listings YTD',
    period: 'July - December 2024'
  }
};

export function AreaGraph() {
  const { currentCompany } = useApp();
  const companyType = currentCompany.type;
  
  const chartData = companyType === 'accounting' 
    ? accountingCashFlowData 
    : companyType === 'financial-pr' 
    ? prMediaCoverageData 
    : ipoDealPipelineData;
  
  const config = chartConfigs[companyType];
  const titles = chartTitles[companyType];
  
  const primaryKey = companyType === 'accounting' ? 'income' : companyType === 'financial-pr' ? 'positive' : 'active';
  const secondaryKey = companyType === 'accounting' ? 'expenses' : companyType === 'financial-pr' ? 'negative' : 'completed';

  const chartConfig = {
    primary: config.primary,
    secondary: config.secondary
  } satisfies ChartConfig;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>{titles.title}</CardTitle>
        <CardDescription>{titles.description}</CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillPrimary' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--primary)'
                  stopOpacity={1.0}
                />
                <stop
                  offset='95%'
                  stopColor='var(--primary)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillSecondary' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--primary)'
                  stopOpacity={0.5}
                />
                <stop
                  offset='95%'
                  stopColor='var(--primary)'
                  stopOpacity={0.05}
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
              cursor={false}
              content={<ChartTooltipContent indicator='dot' />}
            />
            <Area
              dataKey={secondaryKey}
              name={config.secondary.label}
              type='natural'
              fill='url(#fillSecondary)'
              stroke='var(--primary)'
              strokeOpacity={0.5}
              stackId='a'
            />
            <Area
              dataKey={primaryKey}
              name={config.primary.label}
              type='natural'
              fill='url(#fillPrimary)'
              stroke='var(--primary)'
              stackId='b'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 leading-none font-medium'>
              {titles.trend} <IconTrendingUp className='h-4 w-4' />
            </div>
            <div className='text-muted-foreground flex items-center gap-2 leading-none'>
              {titles.period}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
