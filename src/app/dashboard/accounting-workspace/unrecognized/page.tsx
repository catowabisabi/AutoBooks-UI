'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/provider';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  Search,
  AlertTriangle,
  FileQuestion,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  RefreshCw,
  Loader2,
  ImageIcon,
  Calendar,
  Building2,
  DollarSign,
  Tag,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { useUnrecognizedReceipts, useReclassifyReceipt, useBatchReclassify } from '@/features/accounting-workspace/hooks';
import type { AccountingDocument, DocumentType, DocumentStatus } from '@/features/accounting-workspace/types';

// Category options for manual classification
const CATEGORY_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'receipt', label: 'Receipt / 收據' },
  { value: 'sales_invoice', label: 'Sales Invoice / 銷售發票' },
  { value: 'purchase_invoice', label: 'Purchase Invoice / 採購發票' },
  { value: 'expense_claim', label: 'Expense Claim / 費用報銷' },
  { value: 'bank_statement', label: 'Bank Statement / 銀行對帳單' },
  { value: 'contract', label: 'Contract / 合約' },
  { value: 'payroll', label: 'Payroll / 薪資單' },
  { value: 'tax_document', label: 'Tax Document / 稅務文件' },
  { value: 'OFFICE_SUPPLIES', label: 'Office Supplies / 辦公用品' },
  { value: 'TRANSPORTATION', label: 'Transportation / 交通' },
  { value: 'MEALS', label: 'Meals / 餐飲' },
  { value: 'ACCOMMODATION', label: 'Accommodation / 住宿' },
  { value: 'UTILITIES', label: 'Utilities / 公用事業' },
  { value: 'OTHER', label: 'Other / 其他' },
];

// Mock data for demo
const getMockUnrecognized = (): AccountingDocument[] => [
  {
    id: '1',
    original_filename: 'blurry_receipt_001.jpg',
    file_name: 'blurry_receipt_001.jpg',
    image: '/placeholder-receipt.png',
    status: 'UNRECOGNIZED',
    unrecognized_reason: 'Image too blurry, unable to extract text',
    ai_confidence_score: 0.12,
    ai_warnings: ['Low image quality', 'No text detected'],
    created_at: '2024-12-05T10:30:00Z',
    updated_at: '2024-12-05T10:30:00Z',
  },
  {
    id: '2',
    original_filename: 'foreign_receipt_002.pdf',
    file_name: 'foreign_receipt_002.pdf',
    image: '/placeholder-receipt.png',
    status: 'UNRECOGNIZED',
    unrecognized_reason: 'Unknown language detected (Arabic)',
    ai_confidence_score: 0.25,
    ai_warnings: ['Unsupported language', 'Unable to parse structure'],
    created_at: '2024-12-04T14:20:00Z',
    updated_at: '2024-12-04T14:20:00Z',
  },
  {
    id: '3',
    original_filename: 'damaged_scan_003.png',
    file_name: 'damaged_scan_003.png',
    image: '/placeholder-receipt.png',
    status: 'UNRECOGNIZED',
    unrecognized_reason: 'Partial image, missing critical sections',
    ai_confidence_score: 0.35,
    ai_warnings: ['Incomplete document', 'Total amount not found'],
    created_at: '2024-12-03T09:15:00Z',
    updated_at: '2024-12-03T09:15:00Z',
  },
];

export default function UnrecognizedReceiptsPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isClassifyDialogOpen, setIsClassifyDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<AccountingDocument | null>(null);
  const [classificationData, setClassificationData] = useState({
    vendor_name: '',
    receipt_date: '',
    total_amount: '',
    category: '' as DocumentType | '',
    new_status: 'PENDING_REVIEW' as DocumentStatus,
  });
  
  // Use hooks for API
  const { data: apiData, isLoading, error, refetch } = useUnrecognizedReceipts();
  const reclassifyMutation = useReclassifyReceipt();
  const batchReclassifyMutation = useBatchReclassify();
  
  // Use API data or fallback to mock
  const receipts: AccountingDocument[] = useMemo(() => {
    if (apiData?.results && apiData.results.length > 0) {
      return apiData.results;
    }
    if (error || !apiData) {
      return getMockUnrecognized();
    }
    return [];
  }, [apiData, error]);
  
  // Filter receipts
  const filteredReceipts: AccountingDocument[] = receipts.filter((receipt: AccountingDocument) =>
    receipt.original_filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    receipt.unrecognized_reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredReceipts.map((r: AccountingDocument) => r.id));
    } else {
      setSelectedIds([]);
    }
  };
  
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };
  
  // Open classification dialog
  const handleOpenClassify = (receipt: AccountingDocument) => {
    setSelectedReceipt(receipt);
    setClassificationData({
      vendor_name: receipt.vendor_name || '',
      receipt_date: receipt.receipt_date || '',
      total_amount: receipt.total_amount?.toString() || '',
      category: receipt.category || '',
      new_status: 'PENDING_REVIEW',
    });
    setIsClassifyDialogOpen(true);
  };
  
  // Submit classification
  const handleSubmitClassification = () => {
    if (!selectedReceipt) return;
    
    reclassifyMutation.mutate({
      receiptId: selectedReceipt.id,
      category: classificationData.category as string,
      notes: `Vendor: ${classificationData.vendor_name}, Date: ${classificationData.receipt_date}, Amount: ${classificationData.total_amount}`,
    }, {
      onSuccess: () => {
        setIsClassifyDialogOpen(false);
        setSelectedReceipt(null);
      },
    });
  };
  
  // Batch move to pending
  const handleBatchMoveToPending = () => {
    if (selectedIds.length === 0) {
      toast.warning('Please select at least one receipt / 請至少選擇一張收據');
      return;
    }
    
    batchReclassifyMutation.mutate({
      receiptIds: selectedIds,
      category: 'PENDING_REVIEW',
      notes: 'Moved from unrecognized list for manual review',
    }, {
      onSuccess: () => {
        setSelectedIds([]);
      },
    });
  };
  
  // Confidence badge
  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null;
    const percent = Math.round(confidence * 100);
    return (
      <Badge variant={percent < 30 ? 'destructive' : percent < 60 ? 'secondary' : 'default'}>
        {percent}%
      </Badge>
    );
  };
  
  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-16 w-16" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/accounting-workspace">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileQuestion className="h-8 w-8 text-amber-500" />
              {t('unrecognized.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('unrecognized.description')}
              {error && (
                <span className="text-amber-500 ml-2">(Demo data)</span>
              )}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('unrecognized.total')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredReceipts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('unrecognized.selected')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedIds.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('unrecognized.avgConfidence')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredReceipts.length > 0
                  ? Math.round(
                      (filteredReceipts.reduce((acc: number, r: AccountingDocument) => acc + (r.ai_confidence_score || 0), 0) /
                        filteredReceipts.length) *
                        100
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters & Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('unrecognized.search')}
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleBatchMoveToPending}
                  disabled={selectedIds.length === 0 || batchReclassifyMutation.isPending}
                >
                  {batchReclassifyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {t('unrecognized.moveToPending')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* List */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === filteredReceipts.length && filteredReceipts.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-20">{t('unrecognized.preview')}</TableHead>
                  <TableHead>{t('unrecognized.filename')}</TableHead>
                  <TableHead>{t('unrecognized.reason')}</TableHead>
                  <TableHead className="w-24">{t('unrecognized.confidence')}</TableHead>
                  <TableHead className="w-36">{t('unrecognized.date')}</TableHead>
                  <TableHead className="w-20 text-right">{t('unrecognized.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <FileQuestion className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {t('unrecognized.empty')}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReceipts.map((receipt: AccountingDocument) => (
                    <TableRow key={receipt.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(receipt.id)}
                          onCheckedChange={(checked) => handleSelectOne(receipt.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                          {receipt.image ? (
                            <img
                              src={receipt.image}
                              alt={receipt.original_filename}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{receipt.original_filename}</div>
                        {receipt.ai_warnings && receipt.ai_warnings.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {receipt.ai_warnings.slice(0, 2).map((warning: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {warning}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {receipt.unrecognized_reason || 'Unknown reason'}
                        </p>
                      </TableCell>
                      <TableCell>{getConfidenceBadge(receipt.ai_confidence_score)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(receipt.created_at).toLocaleDateString(locale)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenClassify(receipt)}>
                              <Tag className="h-4 w-4 mr-2" />
                              {t('unrecognized.classify')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('unrecognized.viewOriginal')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Classification Dialog */}
        <Dialog open={isClassifyDialogOpen} onOpenChange={setIsClassifyDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {t('unrecognized.classifyTitle')}
              </DialogTitle>
              <DialogDescription>
                {t('unrecognized.classifyDesc')}
              </DialogDescription>
            </DialogHeader>
            
            {selectedReceipt && (
              <div className="grid gap-6 py-4">
                {/* Preview */}
                <div className="flex gap-4">
                  <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {selectedReceipt.image ? (
                      <img
                        src={selectedReceipt.image}
                        alt={selectedReceipt.original_filename}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{selectedReceipt.original_filename}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedReceipt.unrecognized_reason}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm">AI Confidence:</span>
                      {getConfidenceBadge(selectedReceipt.ai_confidence_score)}
                    </div>
                  </div>
                </div>
                
                {/* Form */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vendor_name">
                      <Building2 className="h-4 w-4 inline mr-1" />
                      {t('unrecognized.vendorName')}
                    </Label>
                    <Input
                      id="vendor_name"
                      value={classificationData.vendor_name}
                      onChange={(e) =>
                        setClassificationData({ ...classificationData, vendor_name: e.target.value })
                      }
                      placeholder={t('unrecognized.vendorName')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="receipt_date">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {t('unrecognized.receiptDate')}
                    </Label>
                    <Input
                      id="receipt_date"
                      type="date"
                      value={classificationData.receipt_date}
                      onChange={(e) =>
                        setClassificationData({ ...classificationData, receipt_date: e.target.value })
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="total_amount">
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      {t('unrecognized.totalAmount')}
                    </Label>
                    <Input
                      id="total_amount"
                      type="number"
                      step="0.01"
                      value={classificationData.total_amount}
                      onChange={(e) =>
                        setClassificationData({ ...classificationData, total_amount: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      <Tag className="h-4 w-4 inline mr-1" />
                      {t('unrecognized.category')}
                    </Label>
                    <Select
                      value={classificationData.category}
                      onValueChange={(value) =>
                        setClassificationData({ ...classificationData, category: value as DocumentType })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new_status">
                    {t('unrecognized.newStatus')}
                  </Label>
                  <Select
                    value={classificationData.new_status}
                    onValueChange={(value) =>
                      setClassificationData({ ...classificationData, new_status: value as DocumentStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING_REVIEW">Pending Review / 待審核</SelectItem>
                      <SelectItem value="CATEGORIZED">Categorized / 已分類</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsClassifyDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSubmitClassification}
                disabled={reclassifyMutation.isPending}
              >
                {reclassifyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {t('unrecognized.saveClassification')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
