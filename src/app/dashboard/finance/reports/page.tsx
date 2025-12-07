'use client';

import { useEffect, useState, useCallback } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  IconFileReport,
  IconFileTypePdf,
  IconFileSpreadsheet,
  IconDownload,
  IconChartBar,
  IconWallet,
  IconReceipt,
  IconTrendingUp,
  IconCalendar,
  IconRefresh,
  IconLoader2,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import {
  downloadReportPDF,
  exportReportToExcel,
  formatCurrency,
  ReportData,
} from '@/lib/export-utils';
import {
  getTrialBalance,
  getBalanceSheet,
  getIncomeStatement,
  getARAgingReport,
  type TrialBalanceReport,
  type BalanceSheetReport,
  type IncomeStatementReport,
  type ARAgingReport,
} from '../services';

// Fallback demo data (used when API is unavailable)
const DEMO_BALANCE_SHEET = {
  assets: [
    { account: '現金及約當現金', amount: 2500000 },
    { account: '應收帳款', amount: 1850000 },
    { account: '存貨', amount: 980000 },
    { account: '預付費用', amount: 120000 },
    { account: '固定資產', amount: 3500000 },
    { account: '累計折舊', amount: -850000 },
  ],
  liabilities: [
    { account: '應付帳款', amount: 720000 },
    { account: '應付薪資', amount: 380000 },
    { account: '短期借款', amount: 500000 },
    { account: '長期負債', amount: 1200000 },
  ],
  equity: [
    { account: '股本', amount: 3000000 },
    { account: '資本公積', amount: 800000 },
    { account: '保留盈餘', amount: 1500000 },
  ],
};

const DEMO_INCOME_STATEMENT = {
  revenue: [
    { account: '服務收入', amount: 5800000 },
    { account: '顧問收入', amount: 2200000 },
    { account: '其他收入', amount: 180000 },
  ],
  expenses: [
    { account: '薪資費用', amount: 3200000 },
    { account: '租金費用', amount: 480000 },
    { account: '水電費', amount: 120000 },
    { account: '行銷費用', amount: 350000 },
    { account: '折舊費用', amount: 280000 },
    { account: '其他費用', amount: 450000 },
  ],
};

const DEMO_TRIAL_BALANCE = [
  { code: '1100', account: '現金', debit: 2500000, credit: 0 },
  { code: '1200', account: '應收帳款', debit: 1850000, credit: 0 },
  { code: '1300', account: '存貨', debit: 980000, credit: 0 },
  { code: '1500', account: '固定資產', debit: 3500000, credit: 0 },
  { code: '1510', account: '累計折舊', debit: 0, credit: 850000 },
  { code: '2100', account: '應付帳款', debit: 0, credit: 720000 },
  { code: '2200', account: '應付薪資', debit: 0, credit: 380000 },
  { code: '3100', account: '股本', debit: 0, credit: 3000000 },
  { code: '4100', account: '服務收入', debit: 0, credit: 5800000 },
  { code: '5100', account: '薪資費用', debit: 3200000, credit: 0 },
  { code: '5200', account: '租金費用', debit: 480000, credit: 0 },
];

const DEMO_AR_AGING = [
  { client: 'Acme Corporation', current: 125000, days30: 85000, days60: 25000, days90: 0, total: 235000 },
  { client: 'Globex Industries', current: 280000, days30: 0, days60: 45000, days90: 15000, total: 340000 },
  { client: 'Stark Enterprises', current: 450000, days30: 120000, days60: 0, days90: 0, total: 570000 },
  { client: 'Wayne Industries', current: 180000, days30: 95000, days60: 65000, days90: 35000, total: 375000 },
  { client: 'Umbrella Corp', current: 0, days30: 0, days60: 180000, days90: 150000, total: 330000 },
];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-Q4');
  const [isLoading, setIsLoading] = useState(true);
  
  // Report data states
  const [trialBalanceData, setTrialBalanceData] = useState<TrialBalanceReport | null>(null);
  const [balanceSheetApiData, setBalanceSheetApiData] = useState<BalanceSheetReport | null>(null);
  const [incomeStatementApiData, setIncomeStatementApiData] = useState<IncomeStatementReport | null>(null);
  const [arAgingApiData, setArAgingApiData] = useState<ARAgingReport | null>(null);

  // Use demo data as fallback when API data not available
  const balanceSheetData = DEMO_BALANCE_SHEET;
  const incomeStatementData = DEMO_INCOME_STATEMENT;

  // Load report data from API
  const loadReportData = useCallback(async () => {
    setIsLoading(true);
    toast.info('載入報表資料中...');
    
    try {
      const [trialBalance, balanceSheet, incomeStatement, arAging] = await Promise.all([
        getTrialBalance(),
        getBalanceSheet(),
        getIncomeStatement(),
        getARAgingReport(),
      ]);
      
      setTrialBalanceData(trialBalance);
      setBalanceSheetApiData(balanceSheet);
      setIncomeStatementApiData(incomeStatement);
      setArAgingApiData(arAging);
      toast.success('報表資料載入完成');
    } catch (error) {
      console.error('Failed to load report data:', error);
      toast.warning('使用示範資料顯示');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // 計算總額 (using demo or combined data)
  const totalAssets = balanceSheetApiData?.assets || balanceSheetData.assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = balanceSheetApiData?.liabilities || balanceSheetData.liabilities.reduce((sum, item) => sum + item.amount, 0);
  const totalEquity = balanceSheetApiData?.equity || balanceSheetData.equity.reduce((sum, item) => sum + item.amount, 0);
  
  const totalRevenue = incomeStatementApiData?.revenue || incomeStatementData.revenue.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = incomeStatementApiData?.expenses || incomeStatementData.expenses.reduce((sum, item) => sum + item.amount, 0);
  const netIncome = incomeStatementApiData?.net_income || (totalRevenue - totalExpenses);

  // Trial balance totals (from API or demo)
  const trialBalanceDisplayData = trialBalanceData?.accounts?.map(acc => ({
    code: acc.code,
    account: acc.name,
    debit: acc.debit,
    credit: acc.credit,
  })) || DEMO_TRIAL_BALANCE;
  
  const totalDebit = trialBalanceData?.totals?.debit || trialBalanceDisplayData.reduce((sum, item) => sum + item.debit, 0);
  const totalCredit = trialBalanceData?.totals?.credit || trialBalanceDisplayData.reduce((sum, item) => sum + item.credit, 0);
  const isBalanced = trialBalanceData?.totals?.is_balanced ?? (totalDebit === totalCredit);

  // AR Aging display data
  const arAgingDisplayData = arAgingApiData ? [{
    client: 'All Customers',
    current: arAgingApiData.current,
    days30: arAgingApiData['1_30_days'],
    days60: arAgingApiData['31_60_days'],
    days90: arAgingApiData['61_90_days'] + arAgingApiData.over_90_days,
    total: arAgingApiData.total,
  }] : DEMO_AR_AGING;

  // 匯出資產負債表
  const exportBalanceSheet = (format: 'pdf' | 'excel') => {
    const report: ReportData = {
      title: '資產負債表 Balance Sheet',
      subtitle: `期間: ${selectedPeriod}`,
      date: new Date().toLocaleDateString('zh-TW'),
      columns: ['科目', '金額 (TWD)'],
      rows: [
        ['【資產】', ''],
        ...balanceSheetData.assets.map(item => [item.account, formatCurrency(item.amount)]),
        ['資產總計', formatCurrency(totalAssets)],
        ['', ''],
        ['【負債】', ''],
        ...balanceSheetData.liabilities.map(item => [item.account, formatCurrency(item.amount)]),
        ['負債總計', formatCurrency(totalLiabilities)],
        ['', ''],
        ['【股東權益】', ''],
        ...balanceSheetData.equity.map(item => [item.account, formatCurrency(item.amount)]),
        ['股東權益總計', formatCurrency(totalEquity)],
      ],
      summary: [
        { label: '資產總計', value: formatCurrency(totalAssets) },
        { label: '負債 + 權益總計', value: formatCurrency(totalLiabilities + totalEquity) },
      ],
    };

    if (format === 'pdf') {
      downloadReportPDF(report);
      toast.success('資產負債表 PDF 已生成');
    } else {
      exportReportToExcel(report, `balance_sheet_${selectedPeriod}`);
      toast.success('資產負債表 Excel 已匯出');
    }
  };

  // 匯出損益表
  const exportIncomeStatement = (format: 'pdf' | 'excel') => {
    const report: ReportData = {
      title: '損益表 Income Statement',
      subtitle: `期間: ${selectedPeriod}`,
      date: new Date().toLocaleDateString('zh-TW'),
      columns: ['科目', '金額 (TWD)'],
      rows: [
        ['【營業收入】', ''],
        ...incomeStatementData.revenue.map(item => [item.account, formatCurrency(item.amount)]),
        ['收入總計', formatCurrency(totalRevenue)],
        ['', ''],
        ['【營業費用】', ''],
        ...incomeStatementData.expenses.map(item => [item.account, formatCurrency(item.amount)]),
        ['費用總計', formatCurrency(totalExpenses)],
      ],
      summary: [
        { label: '營業收入總計', value: formatCurrency(totalRevenue) },
        { label: '營業費用總計', value: formatCurrency(totalExpenses) },
        { label: '本期淨利', value: formatCurrency(netIncome) },
      ],
    };

    if (format === 'pdf') {
      downloadReportPDF(report);
      toast.success('損益表 PDF 已生成');
    } else {
      exportReportToExcel(report, `income_statement_${selectedPeriod}`);
      toast.success('損益表 Excel 已匯出');
    }
  };

  // 匯出試算表
  const exportTrialBalance = (format: 'pdf' | 'excel') => {
    const report: ReportData = {
      title: '試算表 Trial Balance',
      subtitle: `期間: ${selectedPeriod}`,
      date: new Date().toLocaleDateString('zh-TW'),
      columns: ['科目代碼', '科目名稱', '借方', '貸方'],
      rows: trialBalanceDisplayData.map(item => [
        item.code,
        item.account,
        item.debit > 0 ? formatCurrency(item.debit) : '',
        item.credit > 0 ? formatCurrency(item.credit) : '',
      ]),
      summary: [
        { label: '借方總計', value: formatCurrency(totalDebit) },
        { label: '貸方總計', value: formatCurrency(totalCredit) },
        { label: '差額', value: formatCurrency(totalDebit - totalCredit) },
      ],
    };

    if (format === 'pdf') {
      downloadReportPDF(report);
      toast.success('試算表 PDF 已生成');
    } else {
      exportReportToExcel(report, `trial_balance_${selectedPeriod}`);
      toast.success('試算表 Excel 已匯出');
    }
  };

  // 匯出應收帳款帳齡
  const exportARAgingReport = (format: 'pdf' | 'excel') => {
    const totalCurrent = arAgingDisplayData.reduce((sum, item) => sum + item.current, 0);
    const total30 = arAgingDisplayData.reduce((sum, item) => sum + item.days30, 0);
    const total60 = arAgingDisplayData.reduce((sum, item) => sum + item.days60, 0);
    const total90 = arAgingDisplayData.reduce((sum, item) => sum + item.days90, 0);
    const grandTotal = arAgingDisplayData.reduce((sum, item) => sum + item.total, 0);

    const report: ReportData = {
      title: '應收帳款帳齡分析 AR Aging Report',
      subtitle: `截止日期: ${new Date().toLocaleDateString('zh-TW')}`,
      date: new Date().toLocaleDateString('zh-TW'),
      columns: ['客戶', '未到期', '1-30天', '31-60天', '61-90天以上', '總計'],
      rows: [
        ...arAgingDisplayData.map(item => [
          item.client,
          formatCurrency(item.current),
          formatCurrency(item.days30),
          formatCurrency(item.days60),
          formatCurrency(item.days90),
          formatCurrency(item.total),
        ]),
        ['總計', formatCurrency(totalCurrent), formatCurrency(total30), formatCurrency(total60), formatCurrency(total90), formatCurrency(grandTotal)],
      ],
      summary: [
        { label: '總應收帳款', value: formatCurrency(grandTotal) },
        { label: '逾期款項 (>30天)', value: formatCurrency(total30 + total60 + total90) },
        { label: '逾期比例', value: `${grandTotal > 0 ? (((total30 + total60 + total90) / grandTotal) * 100).toFixed(1) : 0}%` },
      ],
    };

    if (format === 'pdf') {
      downloadReportPDF(report);
      toast.success('應收帳款帳齡分析 PDF 已生成');
    } else {
      exportReportToExcel(report, `ar_aging_${new Date().toISOString().split('T')[0]}`);
      toast.success('應收帳款帳齡分析 Excel 已匯出');
    }
  };

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title='Financial Reports / 財務報表'
          description='Generate and export financial reports to PDF/Excel. / 生成並匯出財務報表為 PDF/Excel。'
        />
        <div className='flex items-center gap-2'>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className='w-[150px]'>
              <IconCalendar className='mr-2 h-4 w-4' />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='2024-Q4'>2024 Q4</SelectItem>
              <SelectItem value='2024-Q3'>2024 Q3</SelectItem>
              <SelectItem value='2024-Q2'>2024 Q2</SelectItem>
              <SelectItem value='2024-Q1'>2024 Q1</SelectItem>
              <SelectItem value='2024'>2024 全年</SelectItem>
            </SelectContent>
          </Select>
          <Button variant='outline' onClick={loadReportData} disabled={isLoading}>
            <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      <Separator />

      <Tabs defaultValue='balance-sheet' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='balance-sheet'>
            <IconWallet className='mr-2 h-4 w-4' />
            資產負債表
          </TabsTrigger>
          <TabsTrigger value='income-statement'>
            <IconTrendingUp className='mr-2 h-4 w-4' />
            損益表
          </TabsTrigger>
          <TabsTrigger value='trial-balance'>
            <IconChartBar className='mr-2 h-4 w-4' />
            試算表
          </TabsTrigger>
          <TabsTrigger value='ar-aging'>
            <IconReceipt className='mr-2 h-4 w-4' />
            應收帳齡
          </TabsTrigger>
        </TabsList>

        {/* 資產負債表 */}
        <TabsContent value='balance-sheet'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle>資產負債表 Balance Sheet</CardTitle>
                <CardDescription>期間: {selectedPeriod}</CardDescription>
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => exportBalanceSheet('excel')}>
                  <IconFileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
                  Excel
                </Button>
                <Button onClick={() => exportBalanceSheet('pdf')}>
                  <IconFileTypePdf className='mr-2 h-4 w-4' />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* 資產 */}
                <div>
                  <h3 className='font-semibold mb-3 text-blue-600'>資產 Assets</h3>
                  <Table>
                    <TableBody>
                      {balanceSheetData.assets.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.account}</TableCell>
                          <TableCell className='text-right'>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className='font-bold bg-blue-50'>
                        <TableCell>資產總計</TableCell>
                        <TableCell className='text-right'>{formatCurrency(totalAssets)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* 負債 + 權益 */}
                <div>
                  <h3 className='font-semibold mb-3 text-red-600'>負債 Liabilities</h3>
                  <Table>
                    <TableBody>
                      {balanceSheetData.liabilities.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.account}</TableCell>
                          <TableCell className='text-right'>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className='font-bold bg-red-50'>
                        <TableCell>負債總計</TableCell>
                        <TableCell className='text-right'>{formatCurrency(totalLiabilities)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h3 className='font-semibold mb-3 mt-6 text-green-600'>股東權益 Equity</h3>
                  <Table>
                    <TableBody>
                      {balanceSheetData.equity.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.account}</TableCell>
                          <TableCell className='text-right'>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className='font-bold bg-green-50'>
                        <TableCell>權益總計</TableCell>
                        <TableCell className='text-right'>{formatCurrency(totalEquity)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 損益表 */}
        <TabsContent value='income-statement'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle>損益表 Income Statement</CardTitle>
                <CardDescription>期間: {selectedPeriod}</CardDescription>
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => exportIncomeStatement('excel')}>
                  <IconFileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
                  Excel
                </Button>
                <Button onClick={() => exportIncomeStatement('pdf')}>
                  <IconFileTypePdf className='mr-2 h-4 w-4' />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                {/* 收入 */}
                <div>
                  <h3 className='font-semibold mb-3 text-green-600'>營業收入 Revenue</h3>
                  <Table>
                    <TableBody>
                      {incomeStatementData.revenue.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.account}</TableCell>
                          <TableCell className='text-right'>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className='font-bold bg-green-50'>
                        <TableCell>收入總計</TableCell>
                        <TableCell className='text-right'>{formatCurrency(totalRevenue)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* 費用 */}
                <div>
                  <h3 className='font-semibold mb-3 text-red-600'>營業費用 Expenses</h3>
                  <Table>
                    <TableBody>
                      {incomeStatementData.expenses.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.account}</TableCell>
                          <TableCell className='text-right'>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className='font-bold bg-red-50'>
                        <TableCell>費用總計</TableCell>
                        <TableCell className='text-right'>{formatCurrency(totalExpenses)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* 淨利 */}
                <div className='p-4 rounded-lg bg-blue-100'>
                  <div className='flex justify-between items-center'>
                    <span className='text-lg font-bold'>本期淨利 Net Income</span>
                    <span className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(netIncome)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 試算表 */}
        <TabsContent value='trial-balance'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle>試算表 Trial Balance</CardTitle>
                <CardDescription>期間: {selectedPeriod}</CardDescription>
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => exportTrialBalance('excel')}>
                  <IconFileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
                  Excel
                </Button>
                <Button onClick={() => exportTrialBalance('pdf')}>
                  <IconFileTypePdf className='mr-2 h-4 w-4' />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>科目代碼</TableHead>
                    <TableHead>科目名稱</TableHead>
                    <TableHead className='text-right'>借方</TableHead>
                    <TableHead className='text-right'>貸方</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialBalanceDisplayData.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className='font-mono'>{item.code}</TableCell>
                      <TableCell>{item.account}</TableCell>
                      <TableCell className='text-right'>
                        {item.debit > 0 ? formatCurrency(item.debit) : ''}
                      </TableCell>
                      <TableCell className='text-right'>
                        {item.credit > 0 ? formatCurrency(item.credit) : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className='font-bold bg-gray-100'>
                    <TableCell></TableCell>
                    <TableCell>總計</TableCell>
                    <TableCell className='text-right'>{formatCurrency(totalDebit)}</TableCell>
                    <TableCell className='text-right'>{formatCurrency(totalCredit)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              {isBalanced ? (
                <Badge className='mt-4' variant='default'>✓ 借貸平衡</Badge>
              ) : (
                <Badge className='mt-4' variant='destructive'>✗ 借貸不平衡: {formatCurrency(totalDebit - totalCredit)}</Badge>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 應收帳款帳齡 */}
        <TabsContent value='ar-aging'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle>應收帳款帳齡分析 AR Aging Report</CardTitle>
                <CardDescription>截止日期: {new Date().toLocaleDateString('zh-TW')}</CardDescription>
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => exportARAgingReport('excel')}>
                  <IconFileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
                  Excel
                </Button>
                <Button onClick={() => exportARAgingReport('pdf')}>
                  <IconFileTypePdf className='mr-2 h-4 w-4' />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>客戶</TableHead>
                    <TableHead className='text-right'>未到期</TableHead>
                    <TableHead className='text-right'>1-30天</TableHead>
                    <TableHead className='text-right'>31-60天</TableHead>
                    <TableHead className='text-right'>61-90天+</TableHead>
                    <TableHead className='text-right'>總計</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arAgingDisplayData.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className='font-medium'>{item.client}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(item.current)}</TableCell>
                      <TableCell className='text-right text-yellow-600'>
                        {item.days30 > 0 ? formatCurrency(item.days30) : '-'}
                      </TableCell>
                      <TableCell className='text-right text-orange-600'>
                        {item.days60 > 0 ? formatCurrency(item.days60) : '-'}
                      </TableCell>
                      <TableCell className='text-right text-red-600'>
                        {item.days90 > 0 ? formatCurrency(item.days90) : '-'}
                      </TableCell>
                      <TableCell className='text-right font-bold'>{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

