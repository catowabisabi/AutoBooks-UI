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

export function PieGraph() {
  const { currentCompany } = useApp();
  
  // Transform service breakdown to chart data
  const chartData = React.useMemo(() => {
    return currentCompany.serviceBreakdown.map((item, index) => ({
      service: item.service,
      revenue: item.revenue,
      fill: `var(--primary)`,
      label: item.label
    }));
  }, [currentCompany]);

  // Dynamic chart config based on current company
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      revenue: {
        label: `Revenue (${currentCompany.currency})`
      }
    };
    currentCompany.serviceBreakdown.forEach(item => {
      config[item.service] = {
        label: item.label,
        color: 'var(--primary)'
      };
    });
    return config;
  }, [currentCompany]);

  const totalRevenue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [chartData]);

  const serviceKeys = currentCompany.serviceBreakdown.map(s => s.service);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Revenue by Service</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Service revenue distribution for the last 6 months
          </span>
          <span className='@[540px]/card:hidden'>Service distribution</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[250px]'
        >
          <PieChart>
            <defs>
              {serviceKeys.map(
                (service, index) => (
                  <linearGradient
                    key={service}
                    id={`fill${service}`}
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
                )
              )}
            </defs>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel formatter={(value) => `${currentCompany.currency}$${value}k`} />}
            />
            <Pie
              data={chartData.map((item) => ({
                ...item,
                fill: `url(#fill${item.service})`
              }))}
              dataKey='revenue'
              nameKey='service'
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
                          className='fill-foreground text-3xl font-bold'
                        >
                          ${(totalRevenue / 1000).toFixed(1)}M
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Total Revenue
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
          Audit services lead with{' '}
          {((chartData[0].revenue / totalRevenue) * 100).toFixed(1)}%{' '}
          <IconTrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          Based on data from January - June 2024
        </div>
      </CardFooter>
    </Card>
  );
}
