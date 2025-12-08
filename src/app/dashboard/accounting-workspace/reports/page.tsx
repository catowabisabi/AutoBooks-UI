'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n/provider';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Search,
  FileText,
  Download,
  RefreshCw,
  Loader2,
  Eye,
  Trash2,
  MoreHorizontal,
  Calendar,
  BarChart3,
  FileSpreadsheet,
  FileType,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { financialReportApi } from '@/features/accounting-workspace/services';
import type {
  FinancialReportListItem,
  FinancialReportType,
  FinancialReportStatus,
  FinancialReportTypeInfo,
} from '@/features/accounting-workspace/types';
import { GenerateReportModal, ReportViewerModal, ExportReportModal } from './components';

// Status badge colors
const statusColors: Record<FinancialReportStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  GENERATING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-yellow-100 text-yellow-700',
};

// Report type icons
const reportTypeIcons: Record<FinancialReportType, typeof FileText> = {
  INCOME_STATEMENT: BarChart3,
  BALANCE_SHEET: FileSpreadsheet,
  GENERAL_LEDGER: FileText,
  SUB_LEDGER: FileText,
  TRIAL_BALANCE: FileType,
  CASH_FLOW: BarChart3,
  ACCOUNTS_RECEIVABLE: FileSpreadsheet,
  ACCOUNTS_PAYABLE: FileSpreadsheet,
  EXPENSE_REPORT: FileText,
  TAX_SUMMARY: FileText,
  CUSTOM: FileText,
};

export default function FinancialReportsPage() {
  const { t } = useTranslation();
  
  // State
  const [reports, setReports] = useState<FinancialReportListItem[]>([]);
  const [reportTypes, setReportTypes] = useState<FinancialReportTypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal states
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  // Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | undefined> = {
        page,
        page_size: 20,
        search: searchQuery || undefined,
      };
      
      if (selectedType !== 'all') {
        params.report_type = selectedType;
      }
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      
      const response = await financialReportApi.getReports(params as any);
      setReports(response.results || []);
      setTotalCount(response.count || 0);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch report types
  const fetchReportTypes = async () => {
    try {
      const response = await financialReportApi.getReportTypes();
      setReportTypes(response.report_types || []);
    } catch (error) {
      console.error('Error fetching report types:', error);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchReportTypes();
  }, [page, selectedType, selectedStatus]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchReports();
      } else {
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Refresh a specific report
  const handleRefreshReport = async (reportId: string) => {
    try {
      setRefreshing(reportId);
      await financialReportApi.refreshReport(reportId);
      fetchReports();
    } catch (error) {
      console.error('Error refreshing report:', error);
    } finally {
      setRefreshing(null);
    }
  };

  // Delete report
  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await financialReportApi.deleteReport(reportId);
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  // View report
  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setViewerModalOpen(true);
  };

  // Export report
  const handleExportReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setExportModalOpen(true);
  };

  // Report type label
  const getReportTypeLabel = (type: FinancialReportType): string => {
    const typeInfo = reportTypes.find(t => t.value === type);
    return typeInfo?.label || type.replace(/_/g, ' ');
  };

  return (
    <PageContainer scrollable>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Financial Reports</h1>
            <p className="text-muted-foreground">
              Generate and manage financial reports with export capabilities
            </p>
          </div>
          <Button onClick={() => setGenerateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="GENERATING">Generating</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              {totalCount} report{totalCount !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No reports found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Generate your first financial report to get started.
                </p>
                <Button className="mt-4" onClick={() => setGenerateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => {
                    const TypeIcon = reportTypeIcons[report.report_type] || FileText;
                    return (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-muted p-2">
                              <TypeIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{report.name}</div>
                              <div className="text-sm text-muted-foreground">
                                #{report.report_number}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getReportTypeLabel(report.report_type)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(report.period_start), 'MMM d')} -{' '}
                            {format(new Date(report.period_end), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[report.status]}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>v{report.version}</TableCell>
                        <TableCell>{report.view_count}</TableCell>
                        <TableCell>
                          {format(new Date(report.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewReport(report.id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Report
                              </DropdownMenuItem>
                              {report.status === 'COMPLETED' && (
                                <DropdownMenuItem
                                  onClick={() => handleExportReport(report.id)}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Export
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleRefreshReport(report.id)}
                                disabled={refreshing === report.id}
                              >
                                {refreshing === report.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                )}
                                Refresh Data
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteReport(report.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalCount > 20 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, totalCount)} of {totalCount}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= totalCount}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <GenerateReportModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        reportTypes={reportTypes}
        onSuccess={() => {
          setGenerateModalOpen(false);
          fetchReports();
        }}
      />
      
      {selectedReportId && (
        <>
          <ReportViewerModal
            open={viewerModalOpen}
            onClose={() => {
              setViewerModalOpen(false);
              setSelectedReportId(null);
            }}
            reportId={selectedReportId}
          />
          
          <ExportReportModal
            open={exportModalOpen}
            onClose={() => {
              setExportModalOpen(false);
              setSelectedReportId(null);
            }}
            reportId={selectedReportId}
          />
        </>
      )}
    </PageContainer>
  );
}
