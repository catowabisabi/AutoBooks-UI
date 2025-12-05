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

export const description = 'An interactive bar chart for financial data';

// Accounting data: Invoices issued vs Payments received (in thousands HKD)
const chartData = [
  { date: '2024-04-01', invoices: 125, payments: 98 },
  { date: '2024-04-02', invoices: 87, payments: 112 },
  { date: '2024-04-03', invoices: 156, payments: 89 },
  { date: '2024-04-04', invoices: 234, payments: 178 },
  { date: '2024-04-05', invoices: 312, payments: 256 },
  { date: '2024-04-06', invoices: 189, payments: 201 },
  { date: '2024-04-07', invoices: 145, payments: 167 },
  { date: '2024-04-08', invoices: 278, payments: 234 },
  { date: '2024-04-09', invoices: 56, payments: 89 },
  { date: '2024-04-10', invoices: 198, payments: 145 },
  { date: '2024-04-11', invoices: 267, payments: 312 },
  { date: '2024-04-12', invoices: 234, payments: 189 },
  { date: '2024-04-13', invoices: 289, payments: 267 },
  { date: '2024-04-14', invoices: 123, payments: 145 },
  { date: '2024-04-15', invoices: 98, payments: 134 },
  { date: '2024-04-16', invoices: 167, payments: 156 },
  { date: '2024-04-17', invoices: 345, payments: 289 },
  { date: '2024-04-18', invoices: 289, payments: 312 },
  { date: '2024-04-19', invoices: 178, payments: 145 },
  { date: '2024-04-20', invoices: 67, payments: 98 },
  { date: '2024-04-21', invoices: 112, payments: 134 },
  { date: '2024-04-22', invoices: 189, payments: 156 },
  { date: '2024-04-23', invoices: 134, payments: 178 },
  { date: '2024-04-24', invoices: 312, payments: 234 },
  { date: '2024-04-25', invoices: 178, payments: 201 },
  { date: '2024-04-26', invoices: 56, payments: 89 },
  { date: '2024-04-27', invoices: 298, payments: 345 },
  { date: '2024-04-28', invoices: 98, payments: 123 },
  { date: '2024-04-29', invoices: 256, payments: 189 },
  { date: '2024-04-30', invoices: 378, payments: 312 },
  { date: '2024-05-01', invoices: 134, payments: 167 },
  { date: '2024-05-02', invoices: 234, payments: 256 },
  { date: '2024-05-03', invoices: 189, payments: 145 },
  { date: '2024-05-04', invoices: 312, payments: 345 },
  { date: '2024-05-05', invoices: 398, payments: 312 },
  { date: '2024-05-06', invoices: 423, payments: 456 },
  { date: '2024-05-07', invoices: 312, payments: 234 },
  { date: '2024-05-08', invoices: 123, payments: 167 },
  { date: '2024-05-09', invoices: 178, payments: 145 },
  { date: '2024-05-10', invoices: 234, payments: 267 },
  { date: '2024-05-11', invoices: 267, payments: 212 },
  { date: '2024-05-12', invoices: 156, payments: 189 },
  { date: '2024-05-13', invoices: 145, payments: 123 },
  { date: '2024-05-14', invoices: 367, payments: 398 },
  { date: '2024-05-15', invoices: 389, payments: 312 },
  { date: '2024-05-16', invoices: 278, payments: 334 },
  { date: '2024-05-17', invoices: 412, payments: 356 },
  { date: '2024-05-18', invoices: 256, payments: 289 },
  { date: '2024-05-19', invoices: 189, payments: 145 },
  { date: '2024-05-20', invoices: 145, payments: 178 },
  { date: '2024-05-21', invoices: 67, payments: 112 },
  { date: '2024-05-22', invoices: 78, payments: 98 },
  { date: '2024-05-23', invoices: 201, payments: 234 },
  { date: '2024-05-24', invoices: 234, payments: 178 },
  { date: '2024-05-25', invoices: 167, payments: 201 },
  { date: '2024-05-26', invoices: 178, payments: 134 },
  { date: '2024-05-27', invoices: 345, payments: 378 },
  { date: '2024-05-28', invoices: 189, payments: 156 },
  { date: '2024-05-29', invoices: 67, payments: 98 },
  { date: '2024-05-30', invoices: 278, payments: 234 },
  { date: '2024-05-31', invoices: 145, payments: 178 },
  { date: '2024-06-01', invoices: 145, payments: 167 },
  { date: '2024-06-02', invoices: 389, payments: 345 },
  { date: '2024-06-03', invoices: 89, payments: 123 },
  { date: '2024-06-04', invoices: 356, payments: 312 },
  { date: '2024-06-05', invoices: 78, payments: 112 },
  { date: '2024-06-06', invoices: 234, payments: 201 },
  { date: '2024-06-07', invoices: 267, payments: 298 },
  { date: '2024-06-08', invoices: 312, payments: 267 },
  { date: '2024-06-09', invoices: 356, payments: 389 },
  { date: '2024-06-10', invoices: 123, payments: 156 },
  { date: '2024-06-11', invoices: 78, payments: 112 },
  { date: '2024-06-12', invoices: 401, payments: 356 },
  { date: '2024-06-13', invoices: 67, payments: 98 },
  { date: '2024-06-14', invoices: 345, payments: 312 },
  { date: '2024-06-15', invoices: 256, payments: 289 },
  { date: '2024-06-16', invoices: 298, payments: 256 },
  { date: '2024-06-17', invoices: 389, payments: 423 },
  { date: '2024-06-18', invoices: 89, payments: 134 },
  { date: '2024-06-19', invoices: 278, payments: 234 },
  { date: '2024-06-20', invoices: 334, payments: 367 },
  { date: '2024-06-21', invoices: 134, payments: 167 },
  { date: '2024-06-22', invoices: 256, payments: 212 },
  { date: '2024-06-23', invoices: 389, payments: 423 },
  { date: '2024-06-24', invoices: 112, payments: 145 },
  { date: '2024-06-25', invoices: 123, payments: 156 },
  { date: '2024-06-26', invoices: 356, payments: 312 },
  { date: '2024-06-27', invoices: 367, payments: 398 },
  { date: '2024-06-28', invoices: 123, payments: 156 },
  { date: '2024-06-29', invoices: 89, payments: 123 },
  { date: '2024-06-30', invoices: 367, payments: 334 }
];

const chartConfig = {
  views: {
    label: 'Amount'
  },
  invoices: {
    label: 'Invoices',
    color: 'var(--primary)'
  },
  payments: {
    label: 'Payments',
    color: 'var(--primary)'
  }
} satisfies ChartConfig;

export function BarGraph() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('invoices');

  const total = React.useMemo(
    () => ({
      invoices: chartData.reduce((acc, curr) => acc + curr.invoices, 0),
      payments: chartData.reduce((acc, curr) => acc + curr.payments, 0)
    }),
    []
  );

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
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>
              Invoices vs Payments (HKD thousands) - Last 3 months
            </span>
            <span className='@[540px]/card:hidden'>Last 3 months</span>
          </CardDescription>
        </div>
        <div className='flex'>
          {['invoices', 'payments'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            if (!chart || total[key as keyof typeof total] === 0) return null;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className='data-[active=true]:bg-primary/5 hover:bg-primary/5 relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left transition-colors duration-200 even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6'
                onClick={() => setActiveChart(chart)}
              >
                <span className='text-muted-foreground text-xs'>
                  {chartConfig[chart].label}
                </span>
                <span className='text-lg leading-none font-bold sm:text-3xl'>
                  ${total[key as keyof typeof total]?.toLocaleString()}k
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
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });
              }}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
              content={
                <ChartTooltipContent
                  className='w-[180px]'
                  nameKey='views'
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }}
                  formatter={(value) => `$${value}k HKD`}
                />
              }
            />
            <Bar
              dataKey={activeChart}
              fill='url(#fillBar)'
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
