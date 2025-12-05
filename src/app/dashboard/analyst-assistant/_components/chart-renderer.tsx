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
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChartRendererProps {
  type: 'bar' | 'area' | 'pie' | 'scatter' | 'table' | 'line';
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
  '#FFBB28',
  '#0088FE',
  '#00C49F'
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
  if (!data || data.length === 0) {
    return (
      <div className='flex h-full items-center justify-center text-muted-foreground'>
        No data available / 無數據
      </div>
    );
  }

  // Table rendering
  if (type === 'table') {
    const columns = Object.keys(data[0] || {});
    return (
      <ScrollArea className='h-full w-full'>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className='font-medium'>
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 20).map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col}>{String(row[col] ?? '')}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length > 20 && (
          <p className='text-xs text-muted-foreground text-center py-2'>
            Showing 20 of {data.length} rows / 顯示 {data.length} 行中的 20 行
          </p>
        )}
      </ScrollArea>
    );
  }

  let chartElement = null;

  if (type === 'bar') {
    chartElement = (
      <BarChart data={data}>
        <CartesianGrid strokeDasharray='3 3' opacity={0.3} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))' 
          }} 
        />
        <Legend />
        <Bar dataKey={yKey} fill='#8884d8' radius={[4, 4, 0, 0]} />
      </BarChart>
    );
  }

  if (type === 'line') {
    chartElement = (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray='3 3' opacity={0.3} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))' 
          }} 
        />
        <Legend />
        <Line 
          type='monotone' 
          dataKey={yKey} 
          stroke='#8884d8' 
          strokeWidth={2}
          dot={{ fill: '#8884d8' }}
        />
      </LineChart>
    );
  }

  if (type === 'area') {
    chartElement = (
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray='3 3' opacity={0.3} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))' 
          }} 
        />
        <Legend />
        <Area 
          type='monotone' 
          dataKey={yKey} 
          stroke='#82ca9d' 
          fill='#82ca9d' 
          fillOpacity={0.6}
        />
      </AreaChart>
    );
  }

  if (type === 'scatter') {
    chartElement = (
      <ScatterChart>
        <CartesianGrid strokeDasharray='3 3' opacity={0.3} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} name={xKey} />
        <YAxis dataKey={yKey} tick={{ fontSize: 12 }} name={yKey} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))' 
          }} 
        />
        <Legend />
        <Scatter name='Data' data={data} fill='#8884d8' />
      </ScatterChart>
    );
  }

  if (type === 'pie') {
    chartElement = (
      <PieChart>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))' 
          }} 
        />
        <Legend />
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={labelKey}
          cx='50%'
          cy='50%'
          outerRadius={70}
          fill='#8884d8'
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    );
  }

  return chartElement ? (
    <ResponsiveContainer width='100%' height='100%'>
      {chartElement}
    </ResponsiveContainer>
  ) : (
    <div className='flex h-full items-center justify-center text-muted-foreground'>
      Unsupported chart type: {type}
    </div>
  );
}
