'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Upload,
  FileText,
  MoreHorizontal,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  Download,
  X,
  ChevronDown,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';

import {
  getReceipts,
  getUnrecognizedReceipts,
  bulkUploadReceipts,
  classifyReceipt,
  bulkClassifyReceipts,
  deleteReceipt,
  reprocessReceipt,
  getReceiptStatistics,
  type ReceiptListItem,
  type RecognitionStatus,
  type BulkUploadResponse,
  type ReceiptStatistics,
} from '../../services';

// Status badge mapping
const statusConfig: Record<RecognitionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  PENDING: { label: 'Pending', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  RECOGNIZED: { label: 'Recognized', variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
  UNRECOGNIZED: { label: 'Unrecognized', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
  MANUALLY_CLASSIFIED: { label: 'Classified', variant: 'outline', icon: <Edit className="h-3 w-3" /> },
};

function StatusBadge({ status }: { status: RecognitionStatus }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {config.icon}
      {config.label}
    </Badge>
  );
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Format currency
function formatCurrency(amount: number | null, currency = 'TWD'): string {
  if (amount === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function ReceiptList() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [data, setData] = useState<ReceiptListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<ReceiptStatistics | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnrecognizedOnly, setShowUnrecognizedOnly] = useState(false);
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  
  // Upload dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<BulkUploadResponse | null>(null);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  
  // Classify dialog
  const [classifyDialogOpen, setClassifyDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptListItem | null>(null);
  const [classifyData, setClassifyData] = useState({
    vendor: '',
    amount: '',
    date: '',
    notes: '',
  });
  
  // Bulk classify
  const [bulkClassifyDialogOpen, setBulkClassifyDialogOpen] = useState(false);
  const [bulkClassifyData, setBulkClassifyData] = useState({
    notes: '',
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (showUnrecognizedOnly) {
        response = await getUnrecognizedReceipts({ page: currentPage, page_size: pageSize });
      } else {
        response = await getReceipts({
          status: statusFilter !== 'all' ? statusFilter as RecognitionStatus : undefined,
          search: searchQuery || undefined,
          page: currentPage,
          page_size: pageSize,
        });
      }
      setData(response.results);
      setTotalCount(response.count);
      
      // Fetch statistics
      const stats = await getReceiptStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, searchQuery, showUnrecognizedOnly]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle file selection for upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFilesToUpload(files);
    if (files.length > 0) {
      setUploadDialogOpen(true);
    }
  };

  // Handle bulk upload
  const handleUpload = async () => {
    if (filesToUpload.length === 0) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      filesToUpload.forEach(file => {
        formData.append('files', file);
      });
      formData.append('auto_process', 'true');
      
      const response = await bulkUploadReceipts(formData);
      setUploadProgress(response);
      
      toast.success(`Uploaded ${response.total_files} files. ${response.recognized} recognized, ${response.unrecognized} need review.`);
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  // Handle classify single receipt
  const handleClassify = async () => {
    if (!selectedReceipt) return;
    
    try {
      await classifyReceipt(selectedReceipt.id, {
        vendor: classifyData.vendor || undefined,
        amount: classifyData.amount ? parseFloat(classifyData.amount) : undefined,
        date: classifyData.date || undefined,
        notes: classifyData.notes || undefined,
      });
      
      toast.success('Receipt classified successfully');
      setClassifyDialogOpen(false);
      setSelectedReceipt(null);
      setClassifyData({ vendor: '', amount: '', date: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Classification failed:', error);
      toast.error('Failed to classify receipt');
    }
  };

  // Handle bulk classify
  const handleBulkClassify = async () => {
    const selectedIds = Object.keys(rowSelection).map(
      index => data[parseInt(index)]?.id
    ).filter(Boolean);
    
    if (selectedIds.length === 0) {
      toast.error('Please select receipts to classify');
      return;
    }
    
    try {
      const result = await bulkClassifyReceipts({
        receipt_ids: selectedIds,
        notes: bulkClassifyData.notes || undefined,
      });
      
      toast.success(`Classified ${result.updated_count} receipts`);
      setBulkClassifyDialogOpen(false);
      setBulkClassifyData({ notes: '' });
      setRowSelection({});
      fetchData();
    } catch (error) {
      console.error('Bulk classification failed:', error);
      toast.error('Failed to classify receipts');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this receipt?')) return;
    
    try {
      await deleteReceipt(id);
      toast.success('Receipt deleted');
      fetchData();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete receipt');
    }
  };

  // Handle reprocess
  const handleReprocess = async (id: string) => {
    try {
      await reprocessReceipt(id);
      toast.success('Receipt reprocessing started');
      fetchData();
    } catch (error: unknown) {
      console.error('Reprocess failed:', error);
      toast.error((error as Error).message || 'Failed to reprocess receipt');
    }
  };

  // Table columns
  const columns: ColumnDef<ReceiptListItem>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'original_filename',
      header: 'File',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium truncate max-w-[200px]">
              {row.original.original_filename}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatFileSize(row.original.file_size)}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'recognition_status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.recognition_status} />,
    },
    {
      accessorKey: 'confidence_score',
      header: 'Confidence',
      cell: ({ row }) => {
        const score = row.original.confidence_score;
        if (score === null) return '-';
        const percent = (score * 100).toFixed(0);
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-secondary rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  score >= 0.7 ? 'bg-green-500' : score >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-sm">{percent}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'final_vendor',
      header: 'Vendor',
      cell: ({ row }) => row.original.final_vendor || '-',
    },
    {
      accessorKey: 'final_amount',
      header: 'Amount',
      cell: ({ row }) => formatCurrency(row.original.final_amount),
    },
    {
      accessorKey: 'final_date',
      header: 'Date',
      cell: ({ row }) => 
        row.original.final_date ? format(new Date(row.original.final_date), 'yyyy-MM-dd') : '-',
    },
    {
      accessorKey: 'project_name',
      header: 'Project',
      cell: ({ row }) => row.original.project_name || '-',
    },
    {
      accessorKey: 'created_at',
      header: 'Uploaded',
      cell: ({ row }) => format(new Date(row.original.created_at), 'yyyy-MM-dd HH:mm'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => window.open(row.original.file_url, '_blank')}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSelectedReceipt(row.original);
              setClassifyData({
                vendor: row.original.final_vendor || '',
                amount: row.original.final_amount?.toString() || '',
                date: row.original.final_date || '',
                notes: '',
              });
              setClassifyDialogOpen(true);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Classify
            </DropdownMenuItem>
            {row.original.recognition_status === 'UNRECOGNIZED' && (
              <DropdownMenuItem onClick={() => handleReprocess(row.original.id)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reprocess
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDelete(row.original.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-4">
      {/* Header with statistics */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Receipts</h2>
          <p className="text-muted-foreground">
            Manage uploaded receipts and classify unrecognized items
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*,.pdf"
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Receipts
          </Button>
        </div>
      </div>

      {/* Statistics cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_receipts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recognized</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(statistics.by_status.RECOGNIZED || 0) + (statistics.by_status.MANUALLY_CLASSIFIED || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{statistics.needs_review}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(statistics.total_recognized_amount)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search receipts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="RECOGNIZED">Recognized</SelectItem>
            <SelectItem value="UNRECOGNIZED">Unrecognized</SelectItem>
            <SelectItem value="MANUALLY_CLASSIFIED">Classified</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant={showUnrecognizedOnly ? "default" : "outline"}
          onClick={() => setShowUnrecognizedOnly(!showUnrecognizedOnly)}
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          Unrecognized Only
        </Button>
        
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        
        {selectedCount > 0 && (
          <Button onClick={() => setBulkClassifyDialogOpen(true)}>
            Classify Selected ({selectedCount})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={row.original.needs_manual_review ? "bg-destructive/5" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No receipts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {selectedCount} of {totalCount} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {Math.ceil(totalCount / pageSize) || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage >= Math.ceil(totalCount / pageSize)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Receipts</DialogTitle>
            <DialogDescription>
              Upload {filesToUpload.length} file(s) for processing
            </DialogDescription>
          </DialogHeader>
          
          {!uploadProgress ? (
            <>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto">
                  {filesToUpload.map((file, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setUploadDialogOpen(false);
                  setFilesToUpload([]);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-green-500">{uploadProgress.recognized}</div>
                      <div className="text-sm text-muted-foreground">Recognized</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-destructive">{uploadProgress.unrecognized}</div>
                      <div className="text-sm text-muted-foreground">Needs Review</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="border rounded-lg p-4 max-h-[200px] overflow-y-auto">
                  {uploadProgress.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        {result.recognition_status === 'RECOGNIZED' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : result.recognition_status === 'FAILED' ? (
                          <X className="h-4 w-4 text-destructive" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-sm truncate max-w-[200px]">{result.original_filename}</span>
                      </div>
                      {result.error && (
                        <span className="text-xs text-destructive">{result.error}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => {
                  setUploadDialogOpen(false);
                  setUploadProgress(null);
                  setFilesToUpload([]);
                }}>
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Classify Dialog */}
      <Dialog open={classifyDialogOpen} onOpenChange={setClassifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Classify Receipt</DialogTitle>
            <DialogDescription>
              Manually classify {selectedReceipt?.original_filename}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={classifyData.vendor}
                onChange={(e) => setClassifyData(d => ({ ...d, vendor: e.target.value }))}
                placeholder="Enter vendor name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={classifyData.amount}
                onChange={(e) => setClassifyData(d => ({ ...d, amount: e.target.value }))}
                placeholder="Enter amount"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={classifyData.date}
                onChange={(e) => setClassifyData(d => ({ ...d, date: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={classifyData.notes}
                onChange={(e) => setClassifyData(d => ({ ...d, notes: e.target.value }))}
                placeholder="Add notes..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setClassifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleClassify}>
              Save Classification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Classify Dialog */}
      <Dialog open={bulkClassifyDialogOpen} onOpenChange={setBulkClassifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Classify Receipts</DialogTitle>
            <DialogDescription>
              Classify {selectedCount} selected receipt(s)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-notes">Notes</Label>
              <Textarea
                id="bulk-notes"
                value={bulkClassifyData.notes}
                onChange={(e) => setBulkClassifyData(d => ({ ...d, notes: e.target.value }))}
                placeholder="Add notes for all selected receipts..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkClassifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkClassify}>
              Classify All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
