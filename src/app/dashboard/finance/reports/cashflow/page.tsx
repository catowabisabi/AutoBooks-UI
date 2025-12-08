'use client';

import { useState, useMemo, useCallback } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  IconArrowUpRight,
  IconArrowDownRight,
  IconTrendingUp,
  IconTrendingDown,
  IconWallet,
  IconRefresh,
  IconDownload,
  IconChartLine,
  IconCalendar,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { formatCurrency, downloadReportPDF } from '@/lib/export-utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  ComposedChart,
  Line,
} from 'recharts';

// Demo cash flow data
const DEMO_CASHFLOW_DATA = [
  { month: 'Jan', inflow: 450000, outflow: 320000, balance: 130000 },
  { month: 'Feb', inflow: 520000, outflow: 380000, balance: 270000 },
  { month: 'Mar', inflow: 480000, outflow: 410000, balance: 340000 },
  { month: 'Apr', inflow: 610000, outflow: 350000, balance: 600000 },
  { month: 'May', inflow: 550000, outflow: 420000, balance: 730000 },
  { month: 'Jun', inflow: 680000, outflow: 480000, balance: 930000 },
  { month: 'Jul', inflow: 720000, outflow: 520000, balance: 1130000 },
  { month: 'Aug', inflow: 590000, outflow: 490000, balance: 1230000 },
  { month: 'Sep', inflow: 640000, outflow: 440000, balance: 1430000 },
  { month: 'Oct', inflow: 710000, outflow: 510000, balance: 1630000 },
  { month: 'Nov', inflow: 780000, outflow: 550000, balance: 1860000 },
  { month: 'Dec', inflow: 850000, outflow: 600000, balance: 2110000 },
];

// Demo forecast data (3 months ahead)
const DEMO_FORECAST_DATA = [
  { month: 'Jan (F)', inflow: 820000, outflow: 580000, balance: 2350000, isForecast: true },
  { month: 'Feb (F)', inflow: 780000, outflow: 560000, balance: 2570000, isForecast: true },
  { month: 'Mar (F)', inflow: 850000, outflow: 600000, balance: 2820000, isForecast: true },
];

// Demo breakdown by category
const DEMO_INFLOW_BREAKDOWN = [
  { category: 'Invoice Payments', amount: 6200000, percentage: 68 },
  { category: 'Product Sales', amount: 1850000, percentage: 20 },
  { category: 'Service Revenue', amount: 720000, percentage: 8 },
  { category: 'Interest Income', amount: 180000, percentage: 2 },
  { category: 'Other Income', amount: 180000, percentage: 2 },
];

const DEMO_OUTFLOW_BREAKDOWN = [
  { category: 'Payroll', amount: 2800000, percentage: 45 },
  { category: 'Vendor Payments', amount: 1550000, percentage: 25 },
  { category: 'Rent & Utilities', amount: 620000, percentage: 10 },
  { category: 'Marketing', amount: 496000, percentage: 8 },
  { category: 'Equipment', amount: 372000, percentage: 6 },
  { category: 'Other Expenses', amount: 372000, percentage: 6 },
];

type TimePeriod = 'ytd' | '6m' | '3m' | '1m';

export default function CashflowReportPage() {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<TimePeriod>('ytd');
  const [showForecast, setShowForecast] = useState(true);

  // Filter data based on selected period
  const filteredData = useMemo(() => {
    let months = 12;
    switch (period) {
      case '6m': months = 6; break;
      case '3m': months = 3; break;
      case '1m': months = 1; break;
    }
    const historical = DEMO_CASHFLOW_DATA.slice(-months);
    return showForecast ? [...historical, ...DEMO_FORECAST_DATA] : historical;
  }, [period, showForecast]);

  // Calculate totals
  const totals = useMemo(() => {
    const historicalData = DEMO_CASHFLOW_DATA.slice(period === '6m' ? -6 : period === '3m' ? -3 : period === '1m' ? -1 : 0);
    return {
      totalInflow: historicalData.reduce((sum, d) => sum + d.inflow, 0),
      totalOutflow: historicalData.reduce((sum, d) => sum + d.outflow, 0),
      netCashflow: historicalData.reduce((sum, d) => sum + (d.inflow - d.outflow), 0),
      currentBalance: historicalData[historicalData.length - 1]?.balance || 0,
      avgMonthlyInflow: historicalData.reduce((sum, d) => sum + d.inflow, 0) / historicalData.length,
      avgMonthlyOutflow: historicalData.reduce((sum, d) => sum + d.outflow, 0) / historicalData.length,
    };
  }, [period]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Cash flow data refreshed');
    } catch {
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExportPDF = useCallback(async () => {
    try {
      const reportData = {
        title: `Cash Flow Report - ${period === 'ytd' ? 'Year to Date' : period === '6m' ? 'Last 6 Months' : period === '3m' ? 'Last 3 Months' : 'Last Month'}`,
        date: new Date().toISOString().split('T')[0],
        columns: ['Month', 'Inflow', 'Outflow', 'Balance'],
        data: filteredData.map(d => ({
          month: d.month,
          inflow: d.inflow,
          outflow: d.outflow,
          balance: d.balance,
        })),
        summary: {
          total_inflow: totals.totalInflow,
          total_outflow: totals.totalOutflow,
          net_cashflow: totals.netCashflow,
        }
      };
      downloadReportPDF(reportData as any);
      toast.success('Report exported as PDF');
    } catch {
      toast.error('Failed to export report');
    }
  }, [filteredData, period, totals]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title='Cash Flow Report / 現金流量報告'
          description='Track your business cash inflows and outflows over time. Monitor trends and forecast future cash positions.'
        />
        <div className='flex items-center gap-2'>
          <Select value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Select period' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ytd'>Year to Date</SelectItem>
              <SelectItem value='6m'>Last 6 Months</SelectItem>
              <SelectItem value='3m'>Last 3 Months</SelectItem>
              <SelectItem value='1m'>Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant='outline' size='sm' onClick={() => setShowForecast(!showForecast)}>
            <IconChartLine className='mr-2 h-4 w-4' />
            {showForecast ? 'Hide Forecast' : 'Show Forecast'}
          </Button>
          <Button variant='outline' size='sm' onClick={handleRefresh} disabled={loading}>
            <IconRefresh className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant='outline' size='sm' onClick={handleExportPDF}>
            <IconDownload className='mr-2 h-4 w-4' />
            Export PDF
          </Button>
        </div>
      </div>
      <Separator />

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card className='bg-gradient-to-br from-green-500/10 to-green-500/5'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Inflow</CardTitle>
            <IconArrowUpRight className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>{formatCurrency(totals.totalInflow)}</div>
            <p className='text-xs text-muted-foreground'>
              Avg: {formatCurrency(totals.avgMonthlyInflow)}/month
            </p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-red-500/10 to-red-500/5'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Outflow</CardTitle>
            <IconArrowDownRight className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>{formatCurrency(totals.totalOutflow)}</div>
            <p className='text-xs text-muted-foreground'>
              Avg: {formatCurrency(totals.avgMonthlyOutflow)}/month
            </p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-blue-500/10 to-blue-500/5'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Net Cash Flow</CardTitle>
            {totals.netCashflow >= 0 ? (
              <IconTrendingUp className='h-4 w-4 text-blue-500' />
            ) : (
              <IconTrendingDown className='h-4 w-4 text-red-500' />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.netCashflow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(totals.netCashflow)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {totals.netCashflow >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
            </p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-purple-500/10 to-purple-500/5'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Current Balance</CardTitle>
            <IconWallet className='h-4 w-4 text-purple-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-600'>{formatCurrency(totals.currentBalance)}</div>
            <p className='text-xs text-muted-foreground'>
              As of end of period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className='grid gap-4 md:grid-cols-2'>
        {/* Cash Flow Trend Chart */}
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              Cash Flow Trend
              {showForecast && <Badge variant='outline'>Includes Forecast</Badge>}
            </CardTitle>
            <CardDescription>
              Monthly inflows, outflows, and cumulative balance
            </CardDescription>
          </CardHeader>
          <CardContent className='h-[350px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <ComposedChart data={filteredData}>
                <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                <XAxis dataKey='month' fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey='inflow' name='Inflow' fill='#22c55e' radius={[4, 4, 0, 0]} opacity={0.8} />
                <Bar dataKey='outflow' name='Outflow' fill='#ef4444' radius={[4, 4, 0, 0]} opacity={0.8} />
                <Line type='monotone' dataKey='balance' name='Balance' stroke='#8b5cf6' strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inflow Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Inflow Sources</CardTitle>
            <CardDescription>Revenue breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                  <TableHead className='text-right'>%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_INFLOW_BREAKDOWN.map((item) => (
                  <TableRow key={item.category}>
                    <TableCell className='font-medium'>{item.category}</TableCell>
                    <TableCell className='text-right text-green-600'>{formatCurrency(item.amount)}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <div className='h-2 bg-green-500/20 rounded-full' style={{ width: `${item.percentage}px` }}>
                          <div className='h-full bg-green-500 rounded-full' style={{ width: `${item.percentage}%` }} />
                        </div>
                        <span className='text-muted-foreground text-sm w-10'>{item.percentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Outflow Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Outflow Categories</CardTitle>
            <CardDescription>Expense breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                  <TableHead className='text-right'>%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_OUTFLOW_BREAKDOWN.map((item) => (
                  <TableRow key={item.category}>
                    <TableCell className='font-medium'>{item.category}</TableCell>
                    <TableCell className='text-right text-red-600'>{formatCurrency(item.amount)}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <div className='h-2 bg-red-500/20 rounded-full' style={{ width: `${item.percentage}px` }}>
                          <div className='h-full bg-red-500 rounded-full' style={{ width: `${item.percentage}%` }} />
                        </div>
                        <span className='text-muted-foreground text-sm w-10'>{item.percentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Section */}
      {showForecast && (
        <Card className='border-dashed'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconChartLine className='h-5 w-5' />
              3-Month Forecast
              <Badge variant='secondary'>Projected</Badge>
            </CardTitle>
            <CardDescription>
              Cash flow projections based on historical trends and recurring transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-3'>
              {DEMO_FORECAST_DATA.map((forecast) => (
                <Card key={forecast.month} className='bg-muted/30'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm flex items-center gap-2'>
                      <IconCalendar className='h-4 w-4' />
                      {forecast.month.replace(' (F)', '')} Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Expected Inflow:</span>
                      <span className='text-green-600 font-medium'>{formatCurrency(forecast.inflow)}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Expected Outflow:</span>
                      <span className='text-red-600 font-medium'>{formatCurrency(forecast.outflow)}</span>
                    </div>
                    <Separator />
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Projected Balance:</span>
                      <span className='font-bold text-purple-600'>{formatCurrency(forecast.balance)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
