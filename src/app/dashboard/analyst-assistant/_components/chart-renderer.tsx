'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface ChartRendererProps {
  type: 'bar' | 'area' | 'pie' | 'scatter' | 'table';
  data: any[];
  title: string;
  description?: string;
  xKey?: string;
  yKey?: string;
  labelKey?: string;
  valueKey?: string;
}

const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042',
  '#00C49F',
  '#FFBB28'
];

export function ChartRenderer({
  type,
  data,
  title,
  description,
  xKey = 'x',
  yKey = 'y',
  labelKey = 'label',
  valueKey = 'value'
}: ChartRendererProps) {
  let chartElement = null;

  if (type === 'bar') {
    chartElement = (
      <BarChart data={data}>
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={yKey} fill='#8884d8' />
      </BarChart>
    );
  }

  if (type === 'area') {
    chartElement = (
      <AreaChart data={data}>
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Area type='monotone' dataKey={yKey} stroke='#82ca9d' fill='#82ca9d' />
      </AreaChart>
    );
  }

  if (type === 'pie') {
    chartElement = (
      <PieChart>
        <Tooltip />
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={labelKey}
          cx='50%'
          cy='50%'
          outerRadius={80}
          fill='#8884d8'
          label
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className='h-64'>
        {chartElement && (
          <ResponsiveContainer width='100%' height='100%'>
            {chartElement}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
