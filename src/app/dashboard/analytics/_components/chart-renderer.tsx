// // _components/chart-renderer.tsx
// 'use client';
//
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
//   ScatterChart,
//   Scatter
// } from 'recharts';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow
// } from '@/components/ui/table';
//
// interface ChartRendererProps {
//   type: 'bar' | 'area' | 'pie' | 'scatter' | 'line' | 'table' | 'text';
//   data: any[];
//   title: string;
//   description?: string;
//   xKey?: string;
//   yKey?: string;
//   labelKey?: string;
//   valueKey?: string;
// }
//
// const COLORS = [
//   '#8884d8',
//   '#82ca9d',
//   '#ffc658',
//   '#ff8042',
//   '#00C49F',
//   '#FFBB28',
//   '#FF6B6B',
//   '#4ECDC4',
//   '#45B7D1',
//   '#96CEB4'
// ];
//
// export function ChartRenderer({
//   type,
//   data,
//   title,
//   description,
//   xKey = 'x',
//   yKey = 'y',
//   labelKey = 'label',
//   valueKey = 'value'
// }: ChartRendererProps) {
//   if (!data || data.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className='text-base'>{title}</CardTitle>
//           {description && <CardDescription>{description}</CardDescription>}
//         </CardHeader>
//         <CardContent className='flex h-64 items-center justify-center'>
//           <p className='text-muted-foreground'>No data available</p>
//         </CardContent>
//       </Card>
//     );
//   }
//
//   let chartElement = null;
//
//   if (type === 'bar') {
//     chartElement = (
//       <BarChart data={data}>
//         <XAxis dataKey={xKey} />
//         <YAxis />
//         <Tooltip />
//         <Bar dataKey={yKey} fill='#8884d8' />
//       </BarChart>
//     );
//   }
//
//   if (type === 'line') {
//     chartElement = (
//       <LineChart data={data}>
//         <XAxis dataKey={xKey} />
//         <YAxis />
//         <Tooltip />
//         <Line
//           type='monotone'
//           dataKey={yKey}
//           stroke='#8884d8'
//           strokeWidth={2}
//           dot={{ fill: '#8884d8' }}
//         />
//       </LineChart>
//     );
//   }
//
//   if (type === 'area') {
//     chartElement = (
//       <AreaChart data={data}>
//         <XAxis dataKey={xKey} />
//         <YAxis />
//         <Tooltip />
//         <Area type='monotone' dataKey={yKey} stroke='#82ca9d' fill='#82ca9d' />
//       </AreaChart>
//     );
//   }
//
//   if (type === 'pie') {
//     chartElement = (
//       <PieChart>
//         <Tooltip />
//         <Pie
//           data={data}
//           dataKey={valueKey}
//           nameKey={labelKey}
//           cx='50%'
//           cy='50%'
//           outerRadius={80}
//           fill='#8884d8'
//           label
//         >
//           {data.map((_, index) => (
//             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//           ))}
//         </Pie>
//       </PieChart>
//     );
//   }
//
//   if (type === 'scatter') {
//     chartElement = (
//       <ScatterChart data={data}>
//         <XAxis dataKey={xKey} />
//         <YAxis dataKey={yKey} />
//         <Tooltip />
//         <Scatter fill='#8884d8' />
//       </ScatterChart>
//     );
//   }
//
//   if (type === 'table') {
//     // For table type, render a data table
//     const columns = data.length > 0 ? Object.keys(data[0]) : [];
//
//     return (
//       <Card className='w-full'>
//         <CardHeader className='pb-3'>
//           <CardTitle className='text-base font-semibold'>{title}</CardTitle>
//           {description && (
//             <CardDescription className='text-muted-foreground text-sm'>
//               {description}
//             </CardDescription>
//           )}
//         </CardHeader>
//         <CardContent className='p-0'>
//           <div className='rounded-md border'>
//             <div className='max-h-64 overflow-auto'>
//               <Table>
//                 <TableHeader>
//                   <TableRow className='hover:bg-transparent'>
//                     {columns.map((column) => (
//                       <TableHead
//                         key={column}
//                         className='text-muted-foreground bg-muted/50 sticky top-0 h-10 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0'
//                       >
//                         {column
//                           .replace(/([A-Z_])/g, ' $1')
//                           .replace(/^./, (str) => str.toUpperCase())
//                           .trim()}
//                       </TableHead>
//                     ))}
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {data.slice(0, 50).map((row, index) => (
//                     <TableRow
//                       key={index}
//                       className='hover:bg-muted/50 border-b transition-colors'
//                     >
//                       {columns.map((column) => (
//                         <TableCell key={column} className='p-4 align-middle'>
//                           {typeof row[column] === 'number'
//                             ? row[column].toLocaleString()
//                             : String(row[column] || '—')}
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           </div>
//           {data.length > 50 && (
//             <div className='bg-muted/25 border-t p-4 text-center'>
//               <p className='text-muted-foreground text-xs'>
//                 Showing first 50 of {data.length} rows
//               </p>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     );
//   }
//
//   if (type === 'text') {
//     // For text type, render a simple text display
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className='text-base'>{title}</CardTitle>
//           {description && <CardDescription>{description}</CardDescription>}
//         </CardHeader>
//         <CardContent className='flex h-64 items-center justify-center'>
//           <div className='text-center'>
//             <p className='text-muted-foreground'>Text Widget</p>
//             <p className='text-muted-foreground mt-2 text-sm'>
//               Use the edit button to add content
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }
//
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className='text-base'>{title}</CardTitle>
//         {description && <CardDescription>{description}</CardDescription>}
//       </CardHeader>
//       <CardContent className='h-64'>
//         {chartElement && (
//           <ResponsiveContainer width='100%' height='100%'>
//             {chartElement}
//           </ResponsiveContainer>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// _components/chart-renderer.tsx
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
  Scatter
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

// Import shared types
import type { WidgetType } from '@/types/dashboard';

interface ChartRendererProps {
  type: WidgetType;
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
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4'
];

export function ChartRenderer({
  type,
  data,
  title: _title,
  description: _description,
  xKey = 'x',
  yKey = 'y',
  labelKey = 'label',
  valueKey = 'value'
}: ChartRendererProps) {
  if (!data || data.length === 0) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-muted-foreground text-sm'>No data available</p>
      </div>
    );
  }

  let chartElement = null;

  if (type === 'bar') {
    chartElement = (
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis
            dataKey={xKey}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey={yKey} fill='#8884d8' radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'line') {
    chartElement = (
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <XAxis
            dataKey={xKey}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip />
          <Line
            type='monotone'
            dataKey={yKey}
            stroke='#8884d8'
            strokeWidth={2}
            dot={{ fill: '#8884d8', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'area') {
    chartElement = (
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <XAxis
            dataKey={xKey}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip />
          <Area
            type='monotone'
            dataKey={yKey}
            stroke='#82ca9d'
            fill='#82ca9d'
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'pie') {
    chartElement = (
      <ResponsiveContainer width='100%' height='100%'>
        <PieChart>
          <Tooltip />
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={labelKey}
            cx='50%'
            cy='50%'
            outerRadius='80%'
            fill='#8884d8'
            label={false}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'scatter') {
    chartElement = (
      <ResponsiveContainer width='100%' height='100%'>
        <ScatterChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <XAxis
            dataKey={xKey}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey={yKey}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip />
          <Scatter fill='#8884d8' />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'table') {
    // For table type, render a compact data table
    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    return (
      <div className='h-full w-full overflow-hidden'>
        <div className='max-h-full overflow-auto'>
          <Table>
            <TableHeader>
              <TableRow className='hover:bg-transparent'>
                {columns.map((column) => (
                  <TableHead
                    key={column}
                    className='text-muted-foreground bg-muted/50 sticky top-0 h-8 px-3 text-left align-middle text-xs font-medium [&:has([role=checkbox])]:pr-0'
                  >
                    {column
                      .replace(/([A-Z_])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())
                      .trim()}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 20).map((row, index) => (
                <TableRow
                  key={index}
                  className='hover:bg-muted/50 border-b transition-colors'
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column}
                      className='p-3 align-middle text-xs'
                    >
                      {typeof row[column] === 'number'
                        ? row[column].toLocaleString()
                        : String(row[column] || '—')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {data.length > 20 && (
          <div className='bg-muted/25 border-t p-2 text-center'>
            <p className='text-muted-foreground text-xs'>
              Showing first 20 of {data.length} rows
            </p>
          </div>
        )}
      </div>
    );
  }

  if (type === 'text') {
    // For text type, render a simple text display
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground text-sm'>Text Widget</p>
          <p className='text-muted-foreground mt-2 text-xs'>
            Use the edit button to add content
          </p>
        </div>
      </div>
    );
  }

  // For chart types, return the chart element
  return chartElement;
}
