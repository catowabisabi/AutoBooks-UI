'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, Line, LineChart, YAxis, RadialBar, RadialBarChart, PolarAngleAxis, Legend } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import { IconTrendingUp, IconClock, IconUsers, IconChartBar } from '@tabler/icons-react';

// Accounting - Monthly billable hours by service type (Bar Chart)
const accountingBillableData = [
  { month: 'Jul', audit: 420, tax: 180, advisory: 95 },
  { month: 'Aug', audit: 380, tax: 220, advisory: 110 },
  { month: 'Sep', audit: 450, tax: 195, advisory: 85 },
  { month: 'Oct', audit: 520, tax: 240, advisory: 120 },
  { month: 'Nov', audit: 480, tax: 280, advisory: 105 },
  { month: 'Dec', audit: 550, tax: 350, advisory: 140 }
];

// Financial PR - Media sentiment tracking (Line Chart)
const prSentimentData = [
  { month: 'Jul', positive: 72, neutral: 20, negative: 8 },
  { month: 'Aug', positive: 68, neutral: 25, negative: 7 },
  { month: 'Sep', positive: 78, neutral: 18, negative: 4 },
  { month: 'Oct', positive: 82, neutral: 15, negative: 3 },
  { month: 'Nov', positive: 75, neutral: 20, negative: 5 },
  { month: 'Dec', positive: 85, neutral: 12, negative: 3 }
];

// IPO Advisory - Service completion rates (Radial Bar Chart)
const ipoCompletionData = [
  { name: 'Due Diligence', value: 92, fill: 'var(--primary)' },
  { name: 'Documentation', value: 78, fill: 'var(--primary)' },
  { name: 'Regulatory', value: 85, fill: 'var(--primary)' },
  { name: 'Marketing', value: 65, fill: 'var(--primary)' }
];

const chartConfigs = {
  accounting: {
    title: 'Billable Hours by Service',
    description: 'Monthly breakdown of billable hours',
    metrics: {
      audit: { label: 'Audit', color: 'var(--primary)' },
      tax: { label: 'Tax', color: 'var(--primary)' },
      advisory: { label: 'Advisory', color: 'var(--primary)' }
    }
  },
  'financial-pr': {
    title: 'Media Sentiment Analysis',
    description: 'Monthly sentiment breakdown (%)',
    metrics: {
      positive: { label: 'Positive', color: 'hsl(142, 76%, 36%)' },
      neutral: { label: 'Neutral', color: 'hsl(48, 96%, 53%)' },
      negative: { label: 'Negative', color: 'hsl(0, 84%, 60%)' }
    }
  },
  'ipo-advisory': {
    title: 'IPO Process Completion',
    description: 'Current project milestone progress',
    metrics: {
      value: { label: 'Completion %', color: 'var(--primary)' }
    }
  }
};

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

// Bar Chart for Accounting
function AccountingBarChart() {
  const config = chartConfigs.accounting;
  
  const chartConfig = {
    audit: { label: 'Audit', color: COLORS.blue },
    tax: { label: 'Tax', color: COLORS.green },
    advisory: { label: 'Advisory', color: COLORS.orange }
  } satisfies ChartConfig;

  const totals = React.useMemo(() => {
    return {
      audit: accountingBillableData.reduce((acc, curr) => acc + curr.audit, 0),
      tax: accountingBillableData.reduce((acc, curr) => acc + curr.tax, 0),
      advisory: accountingBillableData.reduce((acc, curr) => acc + curr.advisory, 0)
    };
  }, []);

  const totalHours = totals.audit + totals.tax + totals.advisory;

  return (
    <Card className='@container/card !pt-3'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
          <CardTitle className='flex items-center gap-2'>
            <IconClock className='h-5 w-5 text-blue-500' />
            {config.title}
          </CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </div>
        <div className='flex'>
          <div className='flex flex-col justify-center gap-1 border-l px-6 py-4'>
            <span className='text-muted-foreground text-xs'>Total Hours</span>
            <span className='text-2xl font-bold'>{totalHours.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
          <BarChart data={accountingBillableData} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id='fillAuditBar' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={COLORS.blue} stopOpacity={0.9} />
                <stop offset='100%' stopColor={COLORS.blue} stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id='fillTaxBar' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={COLORS.green} stopOpacity={0.9} />
                <stop offset='100%' stopColor={COLORS.green} stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id='fillAdvisoryBar' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={COLORS.orange} stopOpacity={0.9} />
                <stop offset='100%' stopColor={COLORS.orange} stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey='audit' name='Audit' fill='url(#fillAuditBar)' radius={[4, 4, 0, 0]} />
            <Bar dataKey='tax' name='Tax' fill='url(#fillTaxBar)' radius={[4, 4, 0, 0]} />
            <Bar dataKey='advisory' name='Advisory' fill='url(#fillAdvisoryBar)' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col items-start gap-2 text-sm border-t pt-4'>
        <div className='flex gap-4 flex-wrap'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded' style={{ background: COLORS.blue }} />
            <span>Audit: <strong>{totals.audit.toLocaleString()}h</strong> ({((totals.audit/totalHours)*100).toFixed(0)}%)</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded' style={{ background: COLORS.green }} />
            <span>Tax: <strong>{totals.tax.toLocaleString()}h</strong> ({((totals.tax/totalHours)*100).toFixed(0)}%)</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded' style={{ background: COLORS.orange }} />
            <span>Advisory: <strong>{totals.advisory.toLocaleString()}h</strong> ({((totals.advisory/totalHours)*100).toFixed(0)}%)</span>
          </div>
        </div>
        <p className='text-muted-foreground'>📈 Audit hours increased 31% from Jul to Dec. Peak season in Q4.</p>
      </CardFooter>
    </Card>
  );
}

// Line Chart for Financial PR
function PRLineChart() {
  const config = chartConfigs['financial-pr'];
  
  const chartConfig = {
    positive: { label: 'Positive', color: COLORS.green },
    neutral: { label: 'Neutral', color: COLORS.yellow },
    negative: { label: 'Negative', color: COLORS.red }
  } satisfies ChartConfig;

  const latestData = prSentimentData[prSentimentData.length - 1];
  const firstData = prSentimentData[0];
  const positiveTrend = latestData.positive - firstData.positive;

  return (
    <Card className='@container/card !pt-3'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
          <CardTitle className='flex items-center gap-2'>
            <IconChartBar className='h-5 w-5 text-purple-500' />
            {config.title}
          </CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </div>
        <div className='flex'>
          <div className='flex flex-col justify-center gap-1 border-l px-4 py-4 text-center'>
            <span className='text-muted-foreground text-xs'>Positive</span>
            <span className='text-xl font-bold text-green-500'>{latestData.positive}%</span>
          </div>
          <div className='flex flex-col justify-center gap-1 border-l px-4 py-4 text-center'>
            <span className='text-muted-foreground text-xs'>Neutral</span>
            <span className='text-xl font-bold text-yellow-500'>{latestData.neutral}%</span>
          </div>
          <div className='flex flex-col justify-center gap-1 border-l px-4 py-4 text-center'>
            <span className='text-muted-foreground text-xs'>Negative</span>
            <span className='text-xl font-bold text-red-500'>{latestData.negative}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
          <LineChart data={prSentimentData} margin={{ left: 12, right: 12, top: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line type='monotone' dataKey='positive' name='Positive' stroke={COLORS.green} strokeWidth={3} dot={{ fill: COLORS.green, r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
            <Line type='monotone' dataKey='neutral' name='Neutral' stroke={COLORS.yellow} strokeWidth={3} dot={{ fill: COLORS.yellow, r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
            <Line type='monotone' dataKey='negative' name='Negative' stroke={COLORS.red} strokeWidth={3} dot={{ fill: COLORS.red, r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col items-start gap-2 text-sm border-t pt-4'>
        <div className='flex items-center gap-2'>
          <IconTrendingUp className='h-4 w-4 text-green-500' />
          <span>Positive sentiment <strong className='text-green-500'>+{positiveTrend}%</strong> since July</span>
        </div>
        <p className='text-muted-foreground'>🎯 Client media coverage shows strong positive momentum. Negative mentions reduced to just {latestData.negative}%.</p>
      </CardFooter>
    </Card>
  );
}

// IPO Completion Data with colors
const ipoCompletionDataColored = [
  { name: 'Due Diligence', value: 92, fill: COLORS.blue },
  { name: 'Documentation', value: 78, fill: COLORS.green },
  { name: 'Regulatory', value: 85, fill: COLORS.purple },
  { name: 'Marketing', value: 65, fill: COLORS.orange }
];

// Radial Bar Chart for IPO
function IPORadialChart() {
  const config = chartConfigs['ipo-advisory'];
  const avgCompletion = Math.round(ipoCompletionDataColored.reduce((acc, curr) => acc + curr.value, 0) / ipoCompletionDataColored.length);

  const chartConfig = {
    value: { label: 'Completion' }
  } satisfies ChartConfig;

  const getStatusText = (value: number) => {
    if (value >= 90) return { text: 'Excellent', color: 'text-green-500' };
    if (value >= 75) return { text: 'Good', color: 'text-blue-500' };
    if (value >= 60) return { text: 'In Progress', color: 'text-yellow-500' };
    return { text: 'Needs Attention', color: 'text-red-500' };
  };

  return (
    <Card className='@container/card !pt-3'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
          <CardTitle className='flex items-center gap-2'>
            <IconUsers className='h-5 w-5 text-cyan-500' />
            {config.title}
          </CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </div>
        <div className='flex flex-col justify-center gap-1 border-l px-6 py-4'>
          <span className='text-muted-foreground text-xs'>Average</span>
          <span className='text-2xl font-bold'>{avgCompletion}%</span>
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
          <RadialBarChart
            data={ipoCompletionDataColored}
            innerRadius='25%'
            outerRadius='100%'
            startAngle={180}
            endAngle={0}
            cx='50%'
            cy='85%'
          >
            <PolarAngleAxis type='number' domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: 'var(--muted)' }}
              dataKey='value'
              cornerRadius={8}
            />
            <ChartTooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className='bg-background border rounded-lg shadow-lg p-3'>
                      <p className='font-medium'>{data.name}</p>
                      <p className='text-sm'><strong>{data.value}%</strong> complete</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col items-start gap-3 text-sm border-t pt-4'>
        <div className='grid grid-cols-2 gap-3 w-full'>
          {ipoCompletionDataColored.map((item) => {
            const status = getStatusText(item.value);
            return (
              <div key={item.name} className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full' style={{ background: item.fill }} />
                <span className='text-sm'>{item.name}: <strong>{item.value}%</strong></span>
                <span className={`text-xs ${status.color}`}>({status.text})</span>
              </div>
            );
          })}
        </div>
        <p className='text-muted-foreground'>🚀 Due Diligence near completion. Marketing phase needs acceleration to meet Q1 listing target.</p>
      </CardFooter>
    </Card>
  );
}

export function BarGraph() {
  const { currentCompany } = useApp();
  const companyType = currentCompany.type;
  
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  // Render different chart types based on company
  if (companyType === 'accounting') {
    return <AccountingBarChart />;
  } else if (companyType === 'financial-pr') {
    return <PRLineChart />;
  } else {
    return <IPORadialChart />;
  }
}
