'use client';

import * as React from 'react';
import { IconTrendingUp } from '@tabler/icons-react';
import { Label, Pie, PieChart } from 'recharts';

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

// Accounting - Revenue by service type (HK$ thousands)
const accountingRevenueData = [
  { service: 'audit', revenue: 5200, label: 'Statutory Audit', fill: 'var(--primary)' },
  { service: 'tax', revenue: 2800, label: 'Tax Services', fill: 'var(--primary-light)' },
  { service: 'bookkeeping', revenue: 1800, label: 'Bookkeeping', fill: 'var(--primary-lighter)' },
  { service: 'advisory', revenue: 1500, label: 'Advisory', fill: 'var(--primary-dark)' },
  { service: 'secretarial', revenue: 1000, label: 'Company Secretary', fill: 'var(--primary-darker)' }
];

// Financial PR - Revenue by service type (HK$ thousands)
const prRevenueData = [
  { service: 'retainer', revenue: 6500, label: 'IR Retainer', fill: 'var(--primary)' },
  { service: 'ipo', revenue: 4200, label: 'IPO Campaigns', fill: 'var(--primary-light)' },
  { service: 'results', revenue: 3100, label: 'Results Announcements', fill: 'var(--primary-lighter)' },
  { service: 'annual', revenue: 2400, label: 'Annual Reports', fill: 'var(--primary-dark)' },
  { service: 'crisis', revenue: 1500, label: 'Crisis Comms', fill: 'var(--primary-darker)' }
];

// IPO Advisory - Revenue by deal type (HK$ thousands)
const ipoRevenueData = [
  { service: 'mainboard', revenue: 22000, label: 'Main Board IPO', fill: 'var(--primary)' },
  { service: 'gem', revenue: 9500, label: 'GEM Listing', fill: 'var(--primary-light)' },
  { service: 'preipo', revenue: 6200, label: 'Pre-IPO Advisory', fill: 'var(--primary-lighter)' },
  { service: 'corpfin', revenue: 5100, label: 'Corporate Finance', fill: 'var(--primary-dark)' },
  { service: 'compliance', revenue: 2200, label: 'Compliance', fill: 'var(--primary-darker)' }
];

const chartConfigs = {
  accounting: {
    title: 'Revenue by Service',
    description: 'Fee income breakdown by service line',
    centerLabel: 'Total Revenue',
    trend: 'Audit leads with',
    period: 'FY 2024 Year-to-Date'
  },
  'financial-pr': {
    title: 'Revenue by Service',
    description: 'Income breakdown by PR service type',
    centerLabel: 'Total Revenue',
    trend: 'IR Retainer leads with',
    period: 'FY 2024 Year-to-Date'
  },
  'ipo-advisory': {
    title: 'Revenue by Deal Type',
    description: 'Fee income by transaction category',
    centerLabel: 'Total Revenue',
    trend: 'Main Board IPO leads with',
    period: 'FY 2024 Year-to-Date'
  }
};

export function PieGraph() {
  const { currentCompany } = useApp();
  const companyType = currentCompany.type;
  
  const chartData = companyType === 'accounting'
    ? accountingRevenueData
    : companyType === 'financial-pr'
    ? prRevenueData
    : ipoRevenueData;

  const config = chartConfigs[companyType];
  
  const totalRevenue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [chartData]);

  const topService = chartData[0];
  const topPercentage = ((topService.revenue / totalRevenue) * 100).toFixed(1);

  const chartConfig = chartData.reduce((acc, item) => {
    acc[item.service] = { label: item.label, color: 'var(--primary)' };
    return acc;
  }, { revenue: { label: 'Revenue' } } as ChartConfig);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            {config.description}
          </span>
          <span className='@[540px]/card:hidden'>Revenue breakdown</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[250px]'
        >
          <PieChart>
            <defs>
              {chartData.map((item, index) => (
                <linearGradient
                  key={item.service}
                  id={`fill${item.service}`}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='0%'
                    stopColor='var(--primary)'
                    stopOpacity={1 - index * 0.15}
                  />
                  <stop
                    offset='100%'
                    stopColor='var(--primary)'
                    stopOpacity={0.8 - index * 0.15}
                  />
                </linearGradient>
              ))}
            </defs>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData.map((item) => ({
                ...item,
                fill: `url(#fill${item.service})`
              }))}
              dataKey='revenue'
              nameKey='label'
              innerRadius={60}
              strokeWidth={2}
              stroke='var(--background)'
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-2xl font-bold'
                        >
                          {companyType === 'ipo-advisory' 
                            ? `$${(totalRevenue / 1000).toFixed(1)}M`
                            : `$${(totalRevenue / 1000).toFixed(1)}M`}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-xs'
                        >
                          {config.centerLabel}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none font-medium'>
          {config.trend} {topPercentage}%{' '}
          <IconTrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          {config.period}
        </div>
      </CardFooter>
    </Card>
  );
}
