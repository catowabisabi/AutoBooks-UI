'use client';

import * as React from 'react';
import { IconTrendingUp, IconTrendingDown, IconChartPie, IconUsers, IconBuildingSkyscraper, IconExternalLink } from '@tabler/icons-react';
import { Label, Pie, PieChart, Cell, Treemap, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';

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

// Color schemes
const COLORS = {
  blue: 'hsl(217, 91%, 60%)',
  green: 'hsl(142, 76%, 36%)',
  orange: 'hsl(24, 95%, 53%)',
  purple: 'hsl(262, 83%, 58%)',
  pink: 'hsl(330, 81%, 60%)',
  cyan: 'hsl(186, 94%, 41%)',
  red: 'hsl(0, 84%, 60%)',
  yellow: 'hsl(48, 96%, 53%)'
};

// Accounting - Service revenue breakdown (Donut Chart)
const accountingServiceData = [
  { service: 'audit', label: 'Audit Services', revenue: 4850, fill: COLORS.blue },
  { service: 'tax', label: 'Tax Advisory', revenue: 2180, fill: COLORS.green },
  { service: 'consulting', label: 'Consulting', revenue: 1560, fill: COLORS.orange },
  { service: 'compliance', label: 'Compliance', revenue: 890, fill: COLORS.purple }
];

// Financial PR - Client industry distribution (Pie with custom labels)
const prIndustryData = [
  { name: 'Technology', value: 35, clients: 28, fill: COLORS.blue },
  { name: 'Healthcare', value: 22, clients: 18, fill: COLORS.green },
  { name: 'Finance', value: 18, clients: 14, fill: COLORS.purple },
  { name: 'Consumer', value: 15, clients: 12, fill: COLORS.orange },
  { name: 'Industrial', value: 10, clients: 8, fill: COLORS.cyan }
];

// IPO Advisory - Deal size distribution (Nested proportion)
const ipoSizeData = [
  { name: 'Mega (>$1B)', value: 2, amount: 3200, fill: COLORS.blue },
  { name: 'Large ($500M-1B)', value: 4, amount: 2800, fill: COLORS.green },
  { name: 'Mid ($100-500M)', value: 8, amount: 2400, fill: COLORS.orange },
  { name: 'Small (<$100M)', value: 12, amount: 720, fill: COLORS.purple }
];

// Accounting - Donut Chart
function AccountingDonutChart() {
  const { t } = useTranslation();
  const totalRevenue = accountingServiceData.reduce((acc, curr) => acc + curr.revenue, 0);
  
  const chartConfig = {
    revenue: { label: t('dashboard.charts.accounting.revenue') || 'Revenue (HK$k)' },
    audit: { label: t('dashboard.charts.accounting.audit') || 'Audit', color: COLORS.blue },
    tax: { label: t('dashboard.charts.accounting.tax') || 'Tax', color: COLORS.green },
    consulting: { label: t('dashboard.charts.accounting.consulting') || 'Consulting', color: COLORS.orange },
    compliance: { label: t('dashboard.charts.accounting.compliance') || 'Compliance', color: COLORS.purple }
  } satisfies ChartConfig;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconChartPie className='h-5 w-5 text-blue-500' />
          {t('dashboard.charts.accounting.pieTitle') || 'Revenue by Service'}
        </CardTitle>
        <CardDescription>{t('dashboard.charts.accounting.pieDescription') || 'Service revenue distribution (HK$k)'} • {t('dashboard.charts.accounting.piePeriod') || 'H2 2024'}</CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer config={chartConfig} className='mx-auto aspect-square h-[250px]'>
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={(value) => `HK$${value}k`} />} />
            <Pie
              data={accountingServiceData}
              dataKey='revenue'
              nameKey='label'
              innerRadius={60}
              strokeWidth={3}
              stroke='var(--background)'
            >
              {accountingServiceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                        <tspan x={viewBox.cx} y={viewBox.cy} className='fill-foreground text-3xl font-bold'>
                          ${(totalRevenue / 1000).toFixed(1)}M
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className='fill-muted-foreground text-sm'>
                          {t('dashboard.charts.accounting.pieCenterLabel') || 'Total Revenue'}
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
      <CardFooter className='flex-col items-start gap-3 text-sm border-t pt-4'>
        <div className='grid grid-cols-2 gap-2 w-full'>
          {accountingServiceData.map((item) => (
            <div key={item.service} className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full' style={{ background: item.fill }} />
              <span className='text-xs'>{item.label}: <strong>HK${item.revenue}k</strong> ({((item.revenue/totalRevenue)*100).toFixed(0)}%)</span>
            </div>
          ))}
        </div>
        <p className='text-muted-foreground'>📈 {t('dashboard.charts.accounting.pieFooterNote') || 'Audit services contribute 51% of total revenue. Consider expanding advisory services for diversification.'}</p>
      </CardFooter>
    </Card>
  );
}

// Financial PR - Client Industry Distribution
function PRIndustryChart() {
  const { t } = useTranslation();
  const totalClients = prIndustryData.reduce((acc, curr) => acc + curr.clients, 0);
  
  const chartConfig = {
    value: { label: t('common.sharePercent') || 'Share %' }
  } satisfies ChartConfig;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconUsers className='h-5 w-5 text-green-500' />
          {t('dashboard.charts.financialPR.industryTitle') || 'Client Industry Mix'}
        </CardTitle>
        <CardDescription>{t('dashboard.charts.financialPR.industryDescription') || 'Distribution across sectors'} • <strong>{totalClients}</strong> {t('dashboard.charts.financialPR.activeClients') || 'active clients'}</CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer config={chartConfig} className='mx-auto aspect-square h-[250px]'>
          <PieChart>
            <ChartTooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className='bg-background border rounded-lg shadow-lg p-3'>
                      <p className='font-medium'>{data.name}</p>
                      <p className='text-sm text-muted-foreground'>{data.value}% • {data.clients} {t('common.clients') || 'clients'}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={prIndustryData}
              dataKey='value'
              nameKey='name'
              cx='50%'
              cy='50%'
              innerRadius={50}
              outerRadius={100}
              paddingAngle={3}
              strokeWidth={3}
              stroke='var(--background)'
            >
              {prIndustryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                        <tspan x={viewBox.cx} y={viewBox.cy} className='fill-foreground text-3xl font-bold'>
                          {totalClients}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className='fill-muted-foreground text-sm'>
                          {t('dashboard.charts.financialPR.activeClientsLabel') || 'Active Clients'}
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
      <CardFooter className='flex-col items-start gap-3 text-sm border-t pt-4'>
        <div className='flex flex-wrap gap-3'>
          {prIndustryData.map((item) => (
            <div key={item.name} className='flex items-center gap-1'>
              <div className='w-2.5 h-2.5 rounded-full' style={{ background: item.fill }} />
              <span className='text-xs'>{item.name}: <strong>{item.clients}</strong> ({item.value}%)</span>
            </div>
          ))}
        </div>
        <p className='text-muted-foreground'>🎯 {t('dashboard.charts.financialPR.industryFooterNote') || 'Tech sector dominates with 35% of clients. Healthcare showing 15% YoY growth potential.'}</p>
      </CardFooter>
    </Card>
  );
}

// IPO Advisory - Deal Size Distribution
function IPODealSizeChart() {
  const { t } = useTranslation();
  const totalDeals = ipoSizeData.reduce((acc, curr) => acc + curr.value, 0);
  const totalAmount = ipoSizeData.reduce((acc, curr) => acc + curr.amount, 0);
  
  const chartConfig = {
    value: { label: t('dashboard.charts.ipoAdvisory.deals') || 'Deals' },
    amount: { label: t('dashboard.charts.ipoAdvisory.amountM') || 'Amount ($M)' }
  } satisfies ChartConfig;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconBuildingSkyscraper className='h-5 w-5 text-purple-500' />
          {t('dashboard.charts.ipoAdvisory.dealSizeTitle') || 'Deal Size Distribution'}
        </CardTitle>
        <CardDescription>{t('dashboard.charts.ipoAdvisory.dealSizeDescription') || 'Pipeline by deal size category'} • <strong>{totalDeals}</strong> {t('dashboard.charts.ipoAdvisory.deals') || 'deals'} {t('common.worth') || 'worth'} <strong>${(totalAmount/1000).toFixed(1)}B</strong></CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer config={chartConfig} className='mx-auto aspect-square h-[250px]'>
          <PieChart>
            <ChartTooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className='bg-background border rounded-lg shadow-lg p-3'>
                      <p className='font-medium'>{data.name}</p>
                      <p className='text-sm text-muted-foreground'>{data.value} {t('dashboard.charts.ipoAdvisory.deals') || 'deals'} • ${data.amount}M {t('common.totalValue') || 'total value'}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={ipoSizeData}
              dataKey='amount'
              nameKey='name'
              cx='50%'
              cy='50%'
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              strokeWidth={3}
              stroke='var(--background)'
            >
              {ipoSizeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                        <tspan x={viewBox.cx} y={viewBox.cy} className='fill-foreground text-3xl font-bold'>
                          ${(totalAmount / 1000).toFixed(1)}B
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className='fill-muted-foreground text-sm'>
                          {t('dashboard.charts.ipoAdvisory.pipelineValue') || 'Pipeline Value'}
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
      <CardFooter className='flex-col items-start gap-3 text-sm border-t pt-4'>
        <div className='grid grid-cols-2 gap-2 w-full'>
          {ipoSizeData.map((item) => (
            <div key={item.name} className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full' style={{ background: item.fill }} />
              <span className='text-xs'>{item.name}: <strong>{item.value}</strong> {t('dashboard.charts.ipoAdvisory.deals') || 'deals'} (${item.amount}M)</span>
            </div>
          ))}
        </div>
        <p className='text-muted-foreground'>💰 {t('dashboard.charts.ipoAdvisory.dealSizeFooterNote') || 'Mega deals contribute 35% of pipeline value with only 2 deals. Focus on maintaining these relationships.'}</p>
      </CardFooter>
    </Card>
  );
}

export function PieGraph() {
  const { currentCompany } = useApp();
  const { t } = useTranslation();
  const companyType = currentCompany.type;
  const router = useRouter();

  // 根據公司類型決定導航目標
  const getHref = () => {
    switch (companyType) {
      case 'accounting':
        return '/dashboard/business/service-revenues';
      case 'financial-pr':
        return '/dashboard/business/client-industries';
      case 'ipo-advisory':
        return '/dashboard/business/ipo-deal-size';
      default:
        return '/dashboard/business/service-revenues';
    }
  };

  const handleClick = () => {
    router.push(getHref());
  };

  // Render different chart types based on company
  const ChartComponent = () => {
    if (companyType === 'accounting') {
      return <AccountingDonutChart />;
    } else if (companyType === 'financial-pr') {
      return <PRIndustryChart />;
    } else {
      return <IPODealSizeChart />;
    }
  };

  return (
    <div 
      onClick={handleClick} 
      className='cursor-pointer group transition-all duration-200 hover:scale-[1.01]'
    >
      <div className='relative'>
        <ChartComponent />
        <div className='absolute top-4 right-4 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 px-2 py-1 rounded'>
          <IconExternalLink className='size-3' />
          {t('common.viewDetails') || '查看詳情'}
        </div>
      </div>
    </div>
  );
}
