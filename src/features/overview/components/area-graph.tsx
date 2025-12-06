'use client';

import * as React from 'react';
import { IconTrendingUp, IconChartAreaLine, IconRadar2, IconFilter, IconExternalLink } from '@tabler/icons-react';
import { Area, AreaChart, CartesianGrid, XAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Bar, Line, YAxis, Legend } from 'recharts';
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
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
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

// Accounting firm - Revenue trends (Stacked Area Chart)
const accountingRevenueData = [
  { month: 'Jul', audit: 1250, tax: 450, advisory: 280 },
  { month: 'Aug', audit: 1180, tax: 520, advisory: 310 },
  { month: 'Sep', audit: 1420, tax: 480, advisory: 265 },
  { month: 'Oct', audit: 1680, tax: 620, advisory: 420 },
  { month: 'Nov', audit: 1520, tax: 750, advisory: 380 },
  { month: 'Dec', audit: 1890, tax: 980, advisory: 520 }
];

// Financial PR - Client performance scores (Radar Chart)
const prPerformanceData = [
  { metric: 'Media Coverage', score: 85, benchmark: 70 },
  { metric: 'Social Reach', score: 78, benchmark: 65 },
  { metric: 'Investor Relations', score: 92, benchmark: 75 },
  { metric: 'Crisis Management', score: 88, benchmark: 80 },
  { metric: 'Brand Awareness', score: 75, benchmark: 60 },
  { metric: 'Stakeholder Trust', score: 82, benchmark: 72 }
];

// IPO Advisory - Deal funnel (Composed Chart - Bar + Line)
const ipoFunnelData = [
  { stage: 'Leads', count: 45, conversion: 100 },
  { stage: 'Qualified', count: 28, conversion: 62 },
  { stage: 'Proposal', count: 18, conversion: 40 },
  { stage: 'Due Diligence', count: 12, conversion: 27 },
  { stage: 'Filing', count: 8, conversion: 18 },
  { stage: 'Listed', count: 5, conversion: 11 }
];

// Accounting - Stacked Area Chart
function AccountingAreaChart() {
  const { t } = useTranslation();
  
  const chartConfig = {
    audit: { label: t('dashboard.charts.accounting.audit') || 'Audit', color: COLORS.blue },
    tax: { label: t('dashboard.charts.accounting.tax') || 'Tax', color: COLORS.green },
    advisory: { label: t('dashboard.charts.accounting.advisory') || 'Advisory', color: COLORS.orange }
  } satisfies ChartConfig;

  const totalRevenue = accountingRevenueData.reduce((acc, curr) => acc + curr.audit + curr.tax + curr.advisory, 0);
  const latestMonth = accountingRevenueData[accountingRevenueData.length - 1];
  const firstMonth = accountingRevenueData[0];
  const growth = (((latestMonth.audit + latestMonth.tax + latestMonth.advisory) / (firstMonth.audit + firstMonth.tax + firstMonth.advisory)) - 1) * 100;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconChartAreaLine className='h-5 w-5 text-blue-500' />
          {t('dashboard.charts.accounting.areaTitle') || 'Revenue Trends'}
        </CardTitle>
        <CardDescription>{t('dashboard.charts.accounting.areaDescription') || 'Monthly revenue by service line (HK$k)'} • {t('common.total') || 'Total'}: <strong>HK${(totalRevenue/1000).toFixed(1)}M</strong></CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
          <AreaChart data={accountingRevenueData} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id='fillAuditArea' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor={COLORS.blue} stopOpacity={0.8} />
                <stop offset='95%' stopColor={COLORS.blue} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id='fillTaxArea' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor={COLORS.green} stopOpacity={0.8} />
                <stop offset='95%' stopColor={COLORS.green} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id='fillAdvisoryArea' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor={COLORS.orange} stopOpacity={0.8} />
                <stop offset='95%' stopColor={COLORS.orange} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent indicator='dot' />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area dataKey='advisory' name={t('dashboard.charts.accounting.advisory') || 'Advisory'} type='natural' fill='url(#fillAdvisoryArea)' stroke={COLORS.orange} strokeWidth={2} stackId='a' />
            <Area dataKey='tax' name={t('dashboard.charts.accounting.tax') || 'Tax'} type='natural' fill='url(#fillTaxArea)' stroke={COLORS.green} strokeWidth={2} stackId='a' />
            <Area dataKey='audit' name={t('dashboard.charts.accounting.audit') || 'Audit'} type='natural' fill='url(#fillAuditArea)' stroke={COLORS.blue} strokeWidth={2} stackId='a' />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col items-start gap-2 text-sm border-t pt-4'>
        <div className='flex items-center gap-2'>
          <IconTrendingUp className='h-4 w-4 text-green-500' />
          <span>{t('dashboard.charts.accounting.revenueGrowth') || 'Revenue growth'} <strong className='text-green-500'>+{growth.toFixed(1)}%</strong> {t('dashboard.charts.accounting.fromJulToDec') || 'from Jul to Dec'}</span>
        </div>
        <p className='text-muted-foreground'>📊 {t('dashboard.charts.accounting.areaFooterNote') || 'Audit services remain the primary revenue driver. Tax advisory shows strongest growth trajectory (+117%).'}</p>
      </CardFooter>
    </Card>
  );
}

// Financial PR - Radar Chart
function PRRadarChart() {
  const { t } = useTranslation();
  
  const chartConfig = {
    score: { label: t('dashboard.charts.financialPR.yourScore') || 'Your Score', color: COLORS.purple },
    benchmark: { label: t('dashboard.charts.financialPR.industryAvg') || 'Industry Avg', color: COLORS.cyan }
  } satisfies ChartConfig;

  const avgScore = Math.round(prPerformanceData.reduce((acc, curr) => acc + curr.score, 0) / prPerformanceData.length);
  const avgBenchmark = Math.round(prPerformanceData.reduce((acc, curr) => acc + curr.benchmark, 0) / prPerformanceData.length);
  const outperformCount = prPerformanceData.filter(d => d.score > d.benchmark).length;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconRadar2 className='h-5 w-5 text-purple-500' />
          {t('dashboard.charts.financialPR.radarTitle') || 'Client Performance Radar'}
        </CardTitle>
        <CardDescription>{t('dashboard.charts.financialPR.radarDescription') || 'Performance vs industry benchmarks'} • {t('dashboard.charts.financialPR.yourAvg') || 'Your avg'}: <strong className='text-purple-500'>{avgScore}</strong> vs {t('dashboard.charts.financialPR.industryAvgLabel') || 'Industry'}: <strong>{avgBenchmark}</strong></CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer config={chartConfig} className='mx-auto aspect-square h-[250px]'>
          <RadarChart data={prPerformanceData}>
            <PolarGrid stroke='var(--border)' />
            <PolarAngleAxis dataKey='metric' tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Radar name={t('dashboard.charts.financialPR.industryAvg') || 'Industry Avg'} dataKey='benchmark' stroke={COLORS.cyan} fill={COLORS.cyan} fillOpacity={0.2} strokeWidth={2} />
            <Radar name={t('dashboard.charts.financialPR.yourScore') || 'Your Score'} dataKey='score' stroke={COLORS.purple} fill={COLORS.purple} fillOpacity={0.4} strokeWidth={2} />
            <Legend />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col items-start gap-2 text-sm border-t pt-4'>
        <div className='flex items-center gap-2'>
          <IconTrendingUp className='h-4 w-4 text-purple-500' />
          <span>{t('dashboard.charts.financialPR.outperforming') || 'Outperforming industry in'} <strong className='text-purple-500'>{outperformCount}/6</strong> {t('dashboard.charts.financialPR.keyMetrics') || 'key metrics'}</span>
        </div>
        <div className='grid grid-cols-2 gap-2 w-full text-xs'>
          {prPerformanceData.map((item) => (
            <div key={item.metric} className='flex items-center justify-between'>
              <span className='text-muted-foreground'>{item.metric}:</span>
              <span className={item.score > item.benchmark ? 'text-green-500 font-medium' : 'text-yellow-500'}>
                {item.score} {item.score > item.benchmark ? '↑' : '↓'}
              </span>
            </div>
          ))}
        </div>
        <p className='text-muted-foreground'>🎯 {t('dashboard.charts.financialPR.radarFooterNote') || 'Investor Relations (92) is the strongest area. Focus on improving Brand Awareness (75) to match competitors.'}</p>
      </CardFooter>
    </Card>
  );
}

// IPO Advisory - Composed Bar + Line Chart
function IPOFunnelChart() {
  const { t } = useTranslation();
  
  const chartConfig = {
    count: { label: t('dashboard.charts.ipoAdvisory.dealCount') || 'Deal Count', color: COLORS.blue },
    conversion: { label: t('dashboard.charts.ipoAdvisory.conversionPercent') || 'Conversion %', color: COLORS.orange }
  } satisfies ChartConfig;

  const totalLeads = ipoFunnelData[0].count;
  const totalListed = ipoFunnelData[ipoFunnelData.length - 1].count;
  const overallConversion = ((totalListed / totalLeads) * 100).toFixed(1);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconFilter className='h-5 w-5 text-cyan-500' />
          {t('dashboard.charts.ipoAdvisory.funnelTitle') || 'IPO Deal Funnel'}
        </CardTitle>
        <CardDescription>{t('dashboard.charts.ipoAdvisory.funnelDescription') || 'Pipeline stages and conversion rates'} • <strong>{totalLeads}</strong> {t('dashboard.charts.ipoAdvisory.leads') || 'leads'} → <strong className='text-green-500'>{totalListed}</strong> {t('dashboard.charts.ipoAdvisory.listed') || 'listed'} ({overallConversion}% {t('common.conversion') || 'conversion'})</CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
          <ComposedChart data={ipoFunnelData} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id='fillFunnelBar' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={COLORS.blue} stopOpacity={0.9} />
                <stop offset='100%' stopColor={COLORS.blue} stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis dataKey='stage' tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 10 }} />
            <YAxis yAxisId='left' tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis yAxisId='right' orientation='right' tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar yAxisId='left' dataKey='count' name={t('dashboard.charts.ipoAdvisory.dealCount') || 'Deal Count'} fill='url(#fillFunnelBar)' radius={[4, 4, 0, 0]} />
            <Line yAxisId='right' type='monotone' dataKey='conversion' name={t('dashboard.charts.ipoAdvisory.conversionPercent') || 'Conversion %'} stroke={COLORS.orange} strokeWidth={3} dot={{ fill: COLORS.orange, r: 6, strokeWidth: 2, stroke: '#fff' }} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col items-start gap-2 text-sm border-t pt-4'>
        <div className='flex gap-4 flex-wrap'>
          {ipoFunnelData.map((item, index) => (
            <div key={item.stage} className='text-xs'>
              <span className='text-muted-foreground'>{item.stage}:</span>{' '}
              <strong>{item.count}</strong>
              {index > 0 && (
                <span className='text-orange-500 ml-1'>({item.conversion}%)</span>
              )}
            </div>
          ))}
        </div>
        <p className='text-muted-foreground'>🚀 {t('dashboard.charts.ipoAdvisory.funnelFooterNote') || 'Strongest drop-off at Qualified stage (38% loss). Consider improving initial screening criteria.'}</p>
      </CardFooter>
    </Card>
  );
}

export function AreaGraph() {
  const { currentCompany } = useApp();
  const { t } = useTranslation();
  const companyType = currentCompany.type;
  const router = useRouter();

  // 根據公司類型決定導航目標
  const getHref = () => {
    switch (companyType) {
      case 'accounting':
        return '/dashboard/business/revenue-trends';
      case 'financial-pr':
        return '/dashboard/business/client-performance';
      case 'ipo-advisory':
        return '/dashboard/business/ipo-deal-funnel';
      default:
        return '/dashboard/business/revenue-trends';
    }
  };

  const handleClick = () => {
    router.push(getHref());
  };

  // Render different chart types based on company
  const ChartComponent = () => {
    if (companyType === 'accounting') {
      return <AccountingAreaChart />;
    } else if (companyType === 'financial-pr') {
      return <PRRadarChart />;
    } else {
      return <IPOFunnelChart />;
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
