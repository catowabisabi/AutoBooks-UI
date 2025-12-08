'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, RefreshCw, Loader2, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { financialReportApi } from '@/features/accounting-workspace/services';
import type {
  Report,
  IncomeStatementData,
  BalanceSheetData,
  GeneralLedgerData,
} from '@/features/accounting-workspace/types';

interface ReportViewerModalProps {
  open: boolean;
  onClose: () => void;
  reportId: string;
}

export function ReportViewerModal({
  open,
  onClose,
  reportId,
}: ReportViewerModalProps) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await financialReportApi.getReport(reportId);
      setReport(response.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && reportId) {
      fetchReport();
    }
  }, [open, reportId]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await financialReportApi.refreshReport(reportId);
      await fetchReport();
    } catch (err) {
      console.error('Error refreshing report:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Render Income Statement
  const renderIncomeStatement = (data: IncomeStatementData) => (
    <div className="space-y-6">
      {/* Revenue Section */}
      <div>
        <h4 className="mb-2 font-semibold text-green-700">Revenue</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              {data.comparison_total_revenue !== undefined && (
                <TableHead className="text-right">Prior Period</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.revenue?.map((item) => (
              <TableRow key={item.account_id}>
                <TableCell>
                  <span className="text-muted-foreground mr-2">{item.account_code}</span>
                  {item.account_name}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(item.current_amount)}</TableCell>
                {item.comparison_amount !== undefined && (
                  <TableCell className="text-right">{formatCurrency(item.comparison_amount)}</TableCell>
                )}
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-green-50">
              <TableCell>Total Revenue</TableCell>
              <TableCell className="text-right">{formatCurrency(data.total_revenue)}</TableCell>
              {data.comparison_total_revenue !== undefined && (
                <TableCell className="text-right">{formatCurrency(data.comparison_total_revenue)}</TableCell>
              )}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Operating Expenses Section */}
      <div>
        <h4 className="mb-2 font-semibold text-red-700">Operating Expenses</h4>
        <Table>
          <TableBody>
            {data.operating_expenses?.map((item) => (
              <TableRow key={item.account_id}>
                <TableCell>
                  <span className="text-muted-foreground mr-2">{item.account_code}</span>
                  {item.account_name}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(item.current_amount)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-red-50">
              <TableCell>Total Operating Expenses</TableCell>
              <TableCell className="text-right">{formatCurrency(data.total_operating_expenses)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Summary Section */}
      <div className="rounded-lg border p-4 bg-muted/50">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Gross Profit</p>
            <p className="text-lg font-semibold">{formatCurrency(data.gross_profit)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Operating Income</p>
            <p className="text-lg font-semibold">{formatCurrency(data.operating_income)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Net Income</p>
            <p className={`text-xl font-bold ${data.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.net_income)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Balance Sheet
  const renderBalanceSheet = (data: BalanceSheetData) => (
    <div className="space-y-6">
      {/* Assets */}
      <div>
        <h4 className="mb-2 font-semibold text-blue-700">Assets</h4>
        <Table>
          <TableBody>
            <TableRow className="bg-muted/50">
              <TableCell colSpan={2} className="font-medium">Current Assets</TableCell>
            </TableRow>
            {data.current_assets?.map((item) => (
              <TableRow key={item.account_id}>
                <TableCell className="pl-6">
                  <span className="text-muted-foreground mr-2">{item.account_code}</span>
                  {item.account_name}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(item.balance)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold">
              <TableCell className="pl-6">Total Current Assets</TableCell>
              <TableCell className="text-right">{formatCurrency(data.total_current_assets)}</TableCell>
            </TableRow>
            <TableRow className="bg-muted/50">
              <TableCell colSpan={2} className="font-medium">Fixed Assets</TableCell>
            </TableRow>
            {data.fixed_assets?.map((item) => (
              <TableRow key={item.account_id}>
                <TableCell className="pl-6">{item.account_name}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.balance)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold">
              <TableCell className="pl-6">Total Fixed Assets</TableCell>
              <TableCell className="text-right">{formatCurrency(data.total_fixed_assets)}</TableCell>
            </TableRow>
            <TableRow className="font-bold bg-blue-50">
              <TableCell>Total Assets</TableCell>
              <TableCell className="text-right">{formatCurrency(data.total_assets)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Liabilities */}
      <div>
        <h4 className="mb-2 font-semibold text-orange-700">Liabilities</h4>
        <Table>
          <TableBody>
            {data.current_liabilities?.map((item) => (
              <TableRow key={item.account_id}>
                <TableCell>
                  <span className="text-muted-foreground mr-2">{item.account_code}</span>
                  {item.account_name}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(item.balance)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold">
              <TableCell>Total Current Liabilities</TableCell>
              <TableCell className="text-right">{formatCurrency(data.total_current_liabilities)}</TableCell>
            </TableRow>
            <TableRow className="font-bold bg-orange-50">
              <TableCell>Total Liabilities</TableCell>
              <TableCell className="text-right">{formatCurrency(data.total_liabilities)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Equity */}
      <div>
        <h4 className="mb-2 font-semibold text-purple-700">Equity</h4>
        <Table>
          <TableBody>
            {data.equity?.map((item) => (
              <TableRow key={item.account_id}>
                <TableCell>{item.account_name}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.balance)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>Retained Earnings</TableCell>
              <TableCell className="text-right">{formatCurrency(data.retained_earnings)}</TableCell>
            </TableRow>
            <TableRow className="font-bold bg-purple-50">
              <TableCell>Total Equity</TableCell>
              <TableCell className="text-right">{formatCurrency(data.total_equity)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Balance Check */}
      <div className={`rounded-lg border p-4 ${data.is_balanced ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total Liabilities + Equity</span>
          <span className="font-bold">{formatCurrency(data.total_liabilities_and_equity)}</span>
        </div>
        <p className={`text-sm mt-2 ${data.is_balanced ? 'text-green-600' : 'text-red-600'}`}>
          {data.is_balanced ? '✓ Balance sheet is balanced' : '✗ Balance sheet is not balanced'}
        </p>
      </div>
    </div>
  );

  // Render General Ledger
  const renderGeneralLedger = (data: GeneralLedgerData) => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Debits</p>
          <p className="text-lg font-semibold">{formatCurrency(data.total_debits)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Credits</p>
          <p className="text-lg font-semibold">{formatCurrency(data.total_credits)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Entry Count</p>
          <p className="text-lg font-semibold">{data.entry_count}</p>
        </div>
      </div>

      {data.accounts?.map((account) => (
        <div key={account.account_id} className="border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-3 flex items-center justify-between">
            <div>
              <span className="text-muted-foreground mr-2">{account.account_code}</span>
              <span className="font-semibold">{account.account_name}</span>
              <Badge variant="outline" className="ml-2">{account.account_type}</Badge>
            </div>
            <div className="text-sm">
              Opening: {formatCurrency(account.opening_balance)}
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Entry #</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {account.entries?.slice(0, 10).map((entry, idx) => (
                <TableRow key={idx}>
                  <TableCell>{format(new Date(entry.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{entry.entry_number}</TableCell>
                  <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                  <TableCell className="text-right">{entry.debit ? formatCurrency(entry.debit) : '-'}</TableCell>
                  <TableCell className="text-right">{entry.credit ? formatCurrency(entry.credit) : '-'}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(entry.balance)}</TableCell>
                </TableRow>
              ))}
              {(account.entries?.length || 0) > 10 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    ... and {account.entries!.length - 10} more entries
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="bg-muted px-4 py-2 flex justify-between text-sm">
            <span>Closing Balance:</span>
            <span className="font-semibold">{formatCurrency(account.closing_balance)}</span>
          </div>
        </div>
      ))}
    </div>
  );

  // Render report data based on type
  const renderReportData = () => {
    if (!report?.cached_data) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No data available</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Report data has not been generated yet.
          </p>
          <Button className="mt-4" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Data
          </Button>
        </div>
      );
    }

    const data = report.cached_data as any;

    switch (report.report_type) {
      case 'INCOME_STATEMENT':
        return renderIncomeStatement(data);
      case 'BALANCE_SHEET':
        return renderBalanceSheet(data);
      case 'GENERAL_LEDGER':
      case 'SUB_LEDGER':
        return renderGeneralLedger(data);
      default:
        return (
          <pre className="text-sm overflow-auto bg-muted p-4 rounded-lg">
            {JSON.stringify(data, null, 2)}
          </pre>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div>
              <DialogTitle>{report?.name || 'Loading...'}</DialogTitle>
              {report && (
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(report.period_start), 'MMM d')} - {format(new Date(report.period_end), 'MMM d, yyyy')}
                  </span>
                  <Badge>{report.status}</Badge>
                  <span>v{report.version}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[70vh]">
          {loading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-destructive">{error}</p>
              <Button className="mt-4" variant="outline" onClick={fetchReport}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="p-4">
              {renderReportData()}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
