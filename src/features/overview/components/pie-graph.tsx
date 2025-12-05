'use client';

import * as React from 'react';
import { IconTrendingUp, IconTrendingDown, IconChartPie, IconUsers, IconBuildingSkyscraper } from '@tabler/icons-react';
import { Label, Pie, PieChart, Cell, Treemap, ResponsiveContainer } from 'recharts';

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
  const totalRevenue = accountingServiceData.reduce((acc, curr) => acc + curr.revenue, 0);
  
  const chartConfig = {
    revenue: { label: 'Revenue (HK$k)' },
    audit: { label: 'Audit', color: COLORS.blue },
    tax: { label: 'Tax', color: COLORS.green },
    consulting: { label: 'Consulting', color: COLORS.orange },
    compliance: { label: 'Compliance', color: COLORS.purple }
  } satisfies ChartConfig;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconChartPie className='h-5 w-5 text-blue-500' />
          Revenue by Service
        </CardTitle>
        <CardDescription>Service revenue distribution (HK$k) • H2 2024</CardDescription>
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
      <CardFooter className='flex-col items-start gap-3 text-sm border-t pt-4'>
        <div className='grid grid-cols-2 gap-2 w-full'>
          {accountingServiceData.map((item) => (
            <div key={item.service} className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full' style={{ background: item.fill }} />
              <span className='text-xs'>{item.label}: <strong>HK${item.revenue}k</strong> ({((item.revenue/totalRevenue)*100).toFixed(0)}%)</span>
            </div>
          ))}
        </div>
        <p className='text-muted-foreground'>📈 Audit services contribute 51% of total revenue. Consider expanding advisory services for diversification.</p>
      </CardFooter>
    </Card>
  );
}

// Financial PR - Client Industry Distribution
function PRIndustryChart() {
  const totalClients = prIndustryData.reduce((acc, curr) => acc + curr.clients, 0);
  
  const chartConfig = {
    value: { label: 'Share %' }
  } satisfies ChartConfig;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconUsers className='h-5 w-5 text-green-500' />
          Client Industry Mix
        </CardTitle>
        <CardDescription>Distribution across sectors • <strong>{totalClients}</strong> active clients</CardDescription>
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
                      <p className='text-sm text-muted-foreground'>{data.value}% • {data.clients} clients</p>
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
                          Active Clients
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
        <p className='text-muted-foreground'>🎯 Tech sector dominates with 35% of clients. Healthcare showing 15% YoY growth potential.</p>
      </CardFooter>
    </Card>
  );
}

// IPO Advisory - Deal Size Distribution
function IPODealSizeChart() {
  const totalDeals = ipoSizeData.reduce((acc, curr) => acc + curr.value, 0);
  const totalAmount = ipoSizeData.reduce((acc, curr) => acc + curr.amount, 0);
  
  const chartConfig = {
    value: { label: 'Deals' },
    amount: { label: 'Amount ($M)' }
  } satisfies ChartConfig;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconBuildingSkyscraper className='h-5 w-5 text-purple-500' />
          Deal Size Distribution
        </CardTitle>
        <CardDescription>Pipeline by deal size category • <strong>{totalDeals}</strong> deals worth <strong>${(totalAmount/1000).toFixed(1)}B</strong></CardDescription>
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
                      <p className='text-sm text-muted-foreground'>{data.value} deals • ${data.amount}M total value</p>
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
                          Pipeline Value
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
              <span className='text-xs'>{item.name}: <strong>{item.value}</strong> deals (${item.amount}M)</span>
            </div>
          ))}
        </div>
        <p className='text-muted-foreground'>💰 Mega deals contribute 35% of pipeline value with only 2 deals. Focus on maintaining these relationships.</p>
      </CardFooter>
    </Card>
  );
}

export function PieGraph() {
  const { currentCompany } = useApp();
  const companyType = currentCompany.type;

  // Render different chart types based on company
  if (companyType === 'accounting') {
    return <AccountingDonutChart />;
  } else if (companyType === 'financial-pr') {
    return <PRIndustryChart />;
  } else {
    return <IPODealSizeChart />;
  }
}
