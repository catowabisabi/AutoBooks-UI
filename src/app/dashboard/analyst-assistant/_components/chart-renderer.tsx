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
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
  ComposedChart
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
  type: 'bar' | 'area' | 'pie' | 'scatter' | 'table' | 'line' | 'radar' | 'treemap' | 'funnel' | 'composed' | 'stacked-bar' | 'donut';
  data: any[];
  title: string;
  description?: string;
  xKey?: string;
  yKey?: string;
  labelKey?: string;
  valueKey?: string;
  keys?: string[]; // For multi-series charts
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
  valueKey = 'value',
  keys = []
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

  // Donut chart (pie with inner radius)
  if (type === 'donut') {
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
          innerRadius={40}
          outerRadius={70}
          fill='#8884d8'
          paddingAngle={2}
          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    );
  }

  // Radar chart
  if (type === 'radar') {
    const radarKeys = keys.length > 0 ? keys : [yKey];
    chartElement = (
      <RadarChart cx='50%' cy='50%' outerRadius='70%' data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey={labelKey} tick={{ fontSize: 11 }} />
        <PolarRadiusAxis tick={{ fontSize: 10 }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))' 
          }} 
        />
        <Legend />
        {radarKeys.map((key, index) => (
          <Radar
            key={key}
            name={key}
            dataKey={key}
            stroke={COLORS[index % COLORS.length]}
            fill={COLORS[index % COLORS.length]}
            fillOpacity={0.3}
          />
        ))}
      </RadarChart>
    );
  }

  // Treemap chart
  if (type === 'treemap') {
    chartElement = (
      <Treemap
        data={data}
        dataKey={valueKey}
        aspectRatio={4 / 3}
        stroke='hsl(var(--background))'
        fill='#8884d8'
      >
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))' 
          }} 
        />
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Treemap>
    );
  }

  // Funnel chart
  if (type === 'funnel') {
    chartElement = (
      <FunnelChart>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))' 
          }} 
        />
        <Funnel
          dataKey={valueKey}
          data={data}
          isAnimationActive
        >
          <LabelList 
            position='center' 
            fill='#fff' 
            stroke='none' 
            dataKey={labelKey}
            fontSize={11}
          />
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Funnel>
      </FunnelChart>
    );
  }

  // Stacked bar chart
  if (type === 'stacked-bar') {
    const stackKeys = keys.length > 0 ? keys : [yKey];
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
        {stackKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            stackId='stack'
            fill={COLORS[index % COLORS.length]}
            radius={index === stackKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    );
  }

  // Composed chart (line + bar)
  if (type === 'composed') {
    const barKey = keys[0] || yKey;
    const lineKey = keys[1] || yKey;
    chartElement = (
      <ComposedChart data={data}>
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
        <Bar dataKey={barKey} fill='#8884d8' radius={[4, 4, 0, 0]} />
        <Line type='monotone' dataKey={lineKey} stroke='#ff7300' strokeWidth={2} />
      </ComposedChart>
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
