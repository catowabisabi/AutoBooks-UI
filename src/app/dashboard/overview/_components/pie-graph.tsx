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
import { useTranslation } from '@/lib/i18n/provider';

// Accounting - Revenue by service type (HK$ thousands)
const accountingRevenueData = [
  { service: 'audit', revenue: 5200, labelKey: 'dashboard.charts.pie.accounting.audit', fill: 'var(--primary)' },
  { service: 'tax', revenue: 2800, labelKey: 'dashboard.charts.pie.accounting.tax', fill: 'var(--primary-light)' },
  { service: 'bookkeeping', revenue: 1800, labelKey: 'dashboard.charts.pie.accounting.bookkeeping', fill: 'var(--primary-lighter)' },
  { service: 'advisory', revenue: 1500, labelKey: 'dashboard.charts.pie.accounting.advisory', fill: 'var(--primary-dark)' },
  { service: 'secretarial', revenue: 1000, labelKey: 'dashboard.charts.pie.accounting.secretarial', fill: 'var(--primary-darker)' }
];

// Financial PR - Revenue by service type (HK$ thousands)
const prRevenueData = [
  { service: 'retainer', revenue: 6500, labelKey: 'dashboard.charts.pie.financialPR.retainer', fill: 'var(--primary)' },
  { service: 'ipo', revenue: 4200, labelKey: 'dashboard.charts.pie.financialPR.ipo', fill: 'var(--primary-light)' },
  { service: 'results', revenue: 3100, labelKey: 'dashboard.charts.pie.financialPR.results', fill: 'var(--primary-lighter)' },
  { service: 'annual', revenue: 2400, labelKey: 'dashboard.charts.pie.financialPR.annual', fill: 'var(--primary-dark)' },
  { service: 'crisis', revenue: 1500, labelKey: 'dashboard.charts.pie.financialPR.crisis', fill: 'var(--primary-darker)' }
];

// IPO Advisory - Revenue by deal type (HK$ thousands)
const ipoRevenueData = [
  { service: 'mainboard', revenue: 22000, labelKey: 'dashboard.charts.pie.ipoAdvisory.mainboard', fill: 'var(--primary)' },
  { service: 'gem', revenue: 9500, labelKey: 'dashboard.charts.pie.ipoAdvisory.gem', fill: 'var(--primary-light)' },
  { service: 'preipo', revenue: 6200, labelKey: 'dashboard.charts.pie.ipoAdvisory.preipo', fill: 'var(--primary-lighter)' },
  { service: 'corpfin', revenue: 5100, labelKey: 'dashboard.charts.pie.ipoAdvisory.corpfin', fill: 'var(--primary-dark)' },
  { service: 'compliance', revenue: 2200, labelKey: 'dashboard.charts.pie.ipoAdvisory.compliance', fill: 'var(--primary-darker)' }
];

export function PieGraph() {
  const { t } = useTranslation();
  const { currentCompany } = useApp();
  const companyType = currentCompany.type;

  // i18n config for chart titles
  const chartConfigs = {
    accounting: {
      title: t('dashboard.charts.pie.accounting.title', 'Revenue by Service'),
      description: t('dashboard.charts.pie.accounting.description', 'Fee income breakdown by service line'),
      centerLabel: t('dashboard.charts.pie.totalRevenue', 'Total Revenue'),
      trend: t('dashboard.charts.pie.accounting.trend', 'Audit leads with'),
      period: t('dashboard.charts.pie.period', 'FY 2024 Year-to-Date')
    },
    'financial-pr': {
      title: t('dashboard.charts.pie.financialPR.title', 'Revenue by Service'),
      description: t('dashboard.charts.pie.financialPR.description', 'Income breakdown by PR service type'),
      centerLabel: t('dashboard.charts.pie.totalRevenue', 'Total Revenue'),
      trend: t('dashboard.charts.pie.financialPR.trend', 'IR Retainer leads with'),
      period: t('dashboard.charts.pie.period', 'FY 2024 Year-to-Date')
    },
    'ipo-advisory': {
      title: t('dashboard.charts.pie.ipoAdvisory.title', 'Revenue by Deal Type'),
      description: t('dashboard.charts.pie.ipoAdvisory.description', 'Fee income by transaction category'),
      centerLabel: t('dashboard.charts.pie.totalRevenue', 'Total Revenue'),
      trend: t('dashboard.charts.pie.ipoAdvisory.trend', 'Main Board IPO leads with'),
      period: t('dashboard.charts.pie.period', 'FY 2024 Year-to-Date')
    }
  };
  
  const rawChartData = companyType === 'accounting'
    ? accountingRevenueData
    : companyType === 'financial-pr'
    ? prRevenueData
    : ipoRevenueData;

  // Translate labels
  const chartData = rawChartData.map(item => ({
    ...item,
    label: t(item.labelKey, item.service)
  }));

  const config = chartConfigs[companyType];
  
  const totalRevenue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [chartData]);

  const topService = chartData[0];
  const topPercentage = ((topService.revenue / totalRevenue) * 100).toFixed(1);

  const chartConfig = chartData.reduce((acc, item) => {
    acc[item.service] = { label: item.label, color: 'var(--primary)' };
    return acc;
  }, { revenue: { label: t('dashboard.charts.pie.revenue', 'Revenue') } } as ChartConfig);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            {config.description}
          </span>
          <span className='@[540px]/card:hidden'>{t('dashboard.charts.pie.breakdown', 'Revenue breakdown')}</span>
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
