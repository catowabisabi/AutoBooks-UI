'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageContentLoader, LoadingSpinner } from '@/components/ui/loading-overlay';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { IconTrendingDown, IconTrendingUp, IconRefresh } from '@tabler/icons-react';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n/provider';
import {
  AICashFlowAnalysis,
  AIAnomalyDetection,
  AIPaymentPrediction,
  AIComplianceAlerts
} from '@/components/ai/finance-ai-cards';
import { AIAssistantCard } from '@/components/ai/ai-assistant-card';
import { getFinanceAnalytics, type FinanceAnalytics } from '../analytics/services';
import { toast } from 'sonner';

// Metadata needs to be in a separate layout file when using 'use client'

// Demo data for fallback
const demoRevenueData = [
  { month: 'Jan', Income: 45000, Expenses: 38000 },
  { month: 'Feb', Income: 50000, Expenses: 42000 },
  { month: 'Mar', Income: 52000, Expenses: 46000 },
  { month: 'Apr', Income: 58000, Expenses: 40000 },
  { month: 'May', Income: 55000, Expenses: 50000 },
  { month: 'Jun', Income: 60000, Expenses: 55000 }
];

const demoExpenseDistribution = [
  { name: 'Operations', value: 50 },
  { name: 'Marketing', value: 28 },
  { name: 'Payroll', value: 35 },
  { name: 'Equipment', value: 15 },
  { name: 'Miscellaneous', value: 7 }
];

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#06b6d4', '#8b5cf6'];

export default function FinanceHomePage() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiData, setApiData] = useState<FinanceAnalytics | null>(null);
  const [isUsingDemo, setIsUsingDemo] = useState(false);

  // Fetch data function
  const fetchData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setIsRefreshing(true);
      const data = await getFinanceAnalytics();
      setApiData(data);
      // Check if it's demo data (getFinanceAnalytics returns demo on error)
      setIsUsingDemo(data.total_income === 325890); // Known demo value
      if (showRefreshToast) {
        toast.success(t('common.refreshed') || 'Data refreshed');
      }
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
      setIsUsingDemo(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchData();
  }, []);

  // Derived data from API or demo
  const totalRevenue = apiData?.total_income ?? 325890;
  const totalExpenses = apiData?.total_expenses ?? 231450;
  const cashFlow = apiData?.cash_flow ?? 94440;
  const profitMargin = apiData?.profit_margin ?? 24.5;
  const accountsReceivable = apiData?.accounts_receivable ?? 78500;
  const accountsPayable = apiData?.accounts_payable ?? 45200;

  // Transform API data for charts
  const revenueData = useMemo(() => {
    if (apiData?.income_by_period && apiData.income_by_period.length > 0) {
      return apiData.income_by_period.map((item, idx) => ({
        month: item.period,
        Income: item.income,
        Expenses: apiData.expenses_by_category?.[idx]?.amount ?? item.income * 0.75
      }));
    }
    return demoRevenueData;
  }, [apiData]);

  const expenseDistribution = useMemo(() => {
    if (apiData?.expenses_by_category && apiData.expenses_by_category.length > 0) {
      return apiData.expenses_by_category.map(item => ({
        name: item.category,
        value: item.amount
      }));
    }
    return demoExpenseDistribution;
  }, [apiData]);

  if (!isClient) {
    return null;
  }

  if (isLoading) {
    return (
      <div className='flex flex-1 flex-col'>
        <PageContentLoader />
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col space-y-2'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-2xl font-bold tracking-tight'>
          {t('finance.overview')} 💰
          {isUsingDemo && (
            <span className='ml-2 text-sm font-normal text-amber-500'>
              (Demo data)
            </span>
          )}
        </h2>
        <Button
          variant='outline'
          size='icon'
          onClick={() => fetchData(true)}
          disabled={isRefreshing}
          title={t('common.refresh') || 'Refresh'}
        >
          <IconRefresh className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/*<Separator />*/}

      {/* Top Metrics */}
      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>{t('finance.totalRevenue')}</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              ${totalRevenue.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconTrendingUp className='mr-1 size-4' />
                +8%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              {t('finance.higherThanLastMonth')} <IconTrendingUp className='size-4' />
            </div>
            <div className='text-muted-foreground'>{t('finance.strongRevenueGrowth')}</div>
          </CardFooter>
        </Card>

        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>{t('finance.totalExpenses')}</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              ${totalExpenses.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconTrendingDown className='mr-1 size-4' />
                -3%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              {t('finance.lowerThanLastMonth')} <IconTrendingDown className='size-4' />
            </div>
            <div className='text-muted-foreground'>
              {t('finance.improvedCostManagement')}
            </div>
          </CardFooter>
        </Card>

        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>{t('finance.pendingInvoices')}</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              24
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconTrendingUp className='mr-1 size-4' />
                +2
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              {t('finance.twoMoreThanYesterday')} <IconTrendingUp className='size-4' />
            </div>
            <div className='text-muted-foreground'>{t('finance.needsAttention')}</div>
          </CardFooter>
        </Card>

        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>{t('finance.cashFlow')}</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              ${cashFlow.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconTrendingUp className='mr-1 size-4' />
                +12%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              {t('finance.increasedThisQuarter')} <IconTrendingUp className='size-4' />
            </div>
            <div className='text-muted-foreground'>{t('finance.healthyCashPosition')}</div>
          </CardFooter>
        </Card>
      </div>

      {/* Graphs */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='@container/card col-span-4'>
          <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
            <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
              <CardTitle>{t('finance.revenueVsExpenses')}</CardTitle>
              <CardDescription>
                <span className='hidden @[540px]/card:block'>
                  {t('finance.financialPerformanceLast6Months')}
                </span>
                <span className='@[540px]/card:hidden'>{t('finance.last6Months')}</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className='h-[250px] px-2 pt-4 sm:px-6 sm:pt-6'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id='colorIncome' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id='colorExpenses'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='5%' stopColor='#22c55e' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#22c55e' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey='month'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <Tooltip cursor={{ fill: 'var(--primary)', opacity: 0.1 }} />
                <Area
                  type='monotone'
                  dataKey='Income'
                  stroke='#3b82f6'
                  fillOpacity={1}
                  fill='url(#colorIncome)'
                />
                <Area
                  type='monotone'
                  dataKey='Expenses'
                  stroke='#22c55e'
                  fillOpacity={1}
                  fill='url(#colorExpenses)'
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='@container/card col-span-3'>
          <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
            <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
              <CardTitle>{t('finance.expenseDistribution')}</CardTitle>
              <CardDescription>
                <span>{t('finance.byCategory')}</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className='h-[250px] px-2 pt-4 sm:px-6 sm:pt-6'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={expenseDistribution}
                  dataKey='value'
                  nameKey='name'
                  outerRadius={80}
                  label
                >
                  {expenseDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lower Section */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
        {/* Recent Transactions */}
        <Card className='@container/card col-span-2'>
          <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
            <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
              <CardTitle>{t('finance.recentTransactions')}</CardTitle>
              <CardDescription>
                <span>{t('finance.latestFinancialActivities')}</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 px-6 pt-4'>
            {[
              { name: 'Office Supplies', amount: '$1,250', status: 'Expense' },
              {
                name: 'Client Payment',
                amount: '$5,400',
                status: 'Income'
              },
              {
                name: 'Software License',
                amount: '$899',
                status: 'Expense'
              },
              {
                name: 'Consulting Fee',
                amount: '$3,200',
                status: 'Income'
              }
            ].map((transaction, idx) => (
              <div key={idx} className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src='' />
                    <AvatarFallback>
                      {transaction.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col text-sm'>
                    <span className='font-medium'>{transaction.name}</span>
                    <span className='text-muted-foreground text-xs'>
                      {transaction.amount}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={
                    transaction.status === 'Income' ? 'default' : 'outline'
                  }
                >
                  {transaction.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card className='@container/card col-span-2'>
          <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
            <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
              <CardTitle>{t('finance.upcomingPayments')}</CardTitle>
              <CardDescription>
                <span>{t('finance.dueThisWeek')}</span>
              </CardDescription>
            </div>
            <div className='flex items-center px-6 py-4'>
              <Button size='sm'>+ {t('common.add')}</Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 px-6 pt-4'>
            {[
              {
                title: 'Vendor Payment',
                amount: '$2,450',
                dueDate: 'Tomorrow'
              },
              {
                title: 'Utility Bills',
                amount: '$850',
                dueDate: 'In 2 days'
              },
              {
                title: 'Insurance Premium',
                amount: '$1,200',
                dueDate: 'In 5 days'
              }
            ].map((payment, idx) => (
              <div key={idx} className='flex flex-col space-y-1'>
                <div className='font-medium'>
                  {payment.title} – {payment.amount}
                </div>
                <div className='text-muted-foreground text-xs'>
                  Due: {payment.dueDate}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Financial Insights */}
        <Card className='@container/card col-span-3'>
          <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
            <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
              <CardTitle>{t('finance.financialInsights')}</CardTitle>
              <CardDescription>
                <span>{t('finance.keyPerformanceIndicators')}</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 px-6 pt-4'>
            {[
              {
                name: 'Profit Margin',
                value: `${profitMargin.toFixed(1)}%`,
                trend: 'Up 2.3% from last month'
              },
              {
                name: 'Operating Expenses',
                value: `$${accountsPayable.toLocaleString()}`,
                trend: 'Down 5% from last month'
              },
              {
                name: 'Accounts Receivable',
                value: `$${accountsReceivable.toLocaleString()}`,
                trend: 'Up 12% from last month'
              }
            ].map((insight, idx) => (
              <div key={idx} className='flex items-center gap-3'>
                <Avatar className='h-10 w-10'>
                  <AvatarImage src='' />
                  <AvatarFallback>{insight.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                  <span className='font-medium'>{insight.name}</span>
                  <span className='text-muted-foreground text-xs'>
                    {insight.value} – {insight.trend}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI-Powered Insights Section */}
      <div className='mt-6'>
        <h3 className='text-lg font-semibold mb-4'>🤖 {t('finance.aiInsights') || 'AI-Powered Insights'}</h3>
        
        {/* Universal AI Assistant Card */}
        <div className='mb-4'>
          <AIAssistantCard
            module="finance"
            title="Finance AI Assistant"
            description="Summarize, analyze, and classify your financial data"
            contextData={{
              revenue: totalRevenue,
              expenses: totalExpenses,
              pendingInvoices: 24,
              cashFlow: cashFlow,
              recentTransactions: revenueData,
              expenseBreakdown: expenseDistribution,
            }}
            className="w-full"
          />
        </div>
        
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <AICashFlowAnalysis
            transactions={[
              { date: new Date().toISOString(), amount: 45000, type: 'IN', category: 'Revenue' },
              { date: new Date().toISOString(), amount: 38000, type: 'OUT', category: 'Operations' },
              { date: new Date(Date.now() - 86400000).toISOString(), amount: 50000, type: 'IN', category: 'Sales' },
              { date: new Date(Date.now() - 86400000).toISOString(), amount: 42000, type: 'OUT', category: 'Payroll' },
            ]}
            region="HK"
          />
          <AIAnomalyDetection
            transactions={[
              { id: '1', date: new Date().toISOString(), amount: 5000, description: 'Normal expense', category: 'Operations' },
              { id: '2', date: new Date().toISOString(), amount: 25000, description: 'Large purchase', category: 'Equipment' },
              { id: '3', date: new Date().toISOString(), amount: 3500, description: 'Regular payment', category: 'Utilities' },
            ]}
            region="HK"
          />
          <AIPaymentPrediction
            invoices={[
              { id: '1', customer: 'Acme Corp', amount: 12500, dueDate: new Date(Date.now() + 604800000).toISOString(), historyScore: 0.95 },
              { id: '2', customer: 'Tech Solutions', amount: 8900, dueDate: new Date(Date.now() + 1209600000).toISOString(), historyScore: 0.80 },
              { id: '3', customer: 'Global Inc', amount: 15000, dueDate: new Date(Date.now() + 259200000).toISOString(), historyScore: 0.65 },
            ]}
            region="HK"
          />
        </div>
        <div className='mt-4'>
          <AIComplianceAlerts region="HK" />
        </div>
      </div>
    </div>
  );
}
