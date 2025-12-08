'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Download,
  Loader2,
  FileSpreadsheet,
  FileText,
  FileType,
  Check,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { financialReportApi } from '@/features/accounting-workspace/services';
import type { FinancialExportFormat, FinancialReportExport, ExportFinancialReportInput } from '@/features/accounting-workspace/types';

interface ExportReportModalProps {
  open: boolean;
  onClose: () => void;
  reportId: string;
}

const formatIcons: Record<FinancialExportFormat, typeof FileText> = {
  EXCEL: FileSpreadsheet,
  WORD: FileText,
  PDF: FileType,
  CSV: FileType,
};

const formatLabels: Record<FinancialExportFormat, string> = {
  EXCEL: 'Excel Spreadsheet (.xlsx)',
  WORD: 'Word Document (.docx)',
  PDF: 'PDF Document (.pdf)',
  CSV: 'CSV File (.csv)',
};

export function ExportReportModal({
  open,
  onClose,
  reportId,
}: ExportReportModalProps) {
  const [exports, setExports] = useState<FinancialReportExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<FinancialExportFormat>('EXCEL');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [landscape, setLandscape] = useState(false);

  const fetchExports = async () => {
    try {
      setLoading(true);
      const response = await financialReportApi.getExports(reportId);
      setExports(response.results || []);
    } catch (error) {
      console.error('Error fetching exports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && reportId) {
      fetchExports();
    }
  }, [open, reportId]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const exportData: ExportFinancialReportInput = {
        export_format: selectedFormat,
        export_config: {
          include_charts: includeCharts,
          page_orientation: landscape ? 'landscape' : 'portrait',
        },
      };
      
      await financialReportApi.exportReport(reportId, exportData);
      await fetchExports();
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleDownload = async (exportRecord: FinancialReportExport) => {
    try {
      setDownloading(exportRecord.id);
      const blob = await financialReportApi.downloadExport(reportId, exportRecord.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportRecord.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Refresh to update download count
      await fetchExports();
    } catch (error) {
      console.error('Error downloading export:', error);
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Export report to different formats
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup
              value={selectedFormat}
              onValueChange={(value) => setSelectedFormat(value as FinancialExportFormat)}
              className="grid grid-cols-2 gap-3"
            >
              {(['EXCEL', 'WORD', 'CSV'] as FinancialExportFormat[]).map((format) => {
                const Icon = formatIcons[format];
                return (
                  <div key={format}>
                    <RadioGroupItem
                      value={format}
                      id={format}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={format}
                      className="flex items-center gap-3 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm">{formatLabels[format]}</span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <Label>Options</Label>
            <div className="space-y-3">
              {selectedFormat !== 'CSV' && (
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="includeCharts"
                    checked={includeCharts}
                    onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                  />
                  <Label htmlFor="includeCharts" className="text-sm font-normal cursor-pointer">
                    Include charts and graphs
                  </Label>
                </div>
              )}
              {selectedFormat !== 'CSV' && (
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="landscape"
                    checked={landscape}
                    onCheckedChange={(checked) => setLandscape(checked as boolean)}
                  />
                  <Label htmlFor="landscape" className="text-sm font-normal cursor-pointer">
                    Landscape orientation
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="w-full"
          >
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export as {formatLabels[selectedFormat].split(' ')[0]}
              </>
            )}
          </Button>

          {/* Previous Exports */}
          <div className="space-y-3">
            <Label>Previous Exports</Label>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : exports.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No exports yet
              </p>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {exports.map((exportRecord) => {
                    const Icon = formatIcons[exportRecord.export_format] || FileText;
                    return (
                      <div
                        key={exportRecord.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-muted p-2">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate max-w-[180px]">
                              {exportRecord.file_name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatFileSize(exportRecord.file_size)}</span>
                              <span>•</span>
                              <span>{format(new Date(exportRecord.created_at), 'MMM d, HH:mm')}</span>
                              {exportRecord.download_count > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{exportRecord.download_count} downloads</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {exportRecord.status === 'COMPLETED' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(exportRecord)}
                              disabled={downloading === exportRecord.id}
                            >
                              {downloading === exportRecord.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                          ) : exportRecord.status === 'PROCESSING' ? (
                            <Badge variant="secondary" className="gap-1">
                              <Clock className="h-3 w-3" />
                              Processing
                            </Badge>
                          ) : exportRecord.status === 'FAILED' ? (
                            <Badge variant="destructive">Failed</Badge>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
