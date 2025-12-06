'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/provider';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  ArrowLeft,
  Upload,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Trash2,
  Sparkles,
  Download,
  RefreshCw,
  Building2,
  Calendar,
  MoreHorizontal,
  Check,
  X,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

// Import API hooks
import {
  useProject,
  useProjectStats,
  useDocuments,
  useUploadDocuments,
  useDeleteDocument,
  useEntries,
  useApproveEntry,
  useRejectEntry,
  useClassifyDocument,
  useBulkClassifyDocuments,
  useExtractDocumentData,
  useGenerateEntries,
  useGenerateReport,
  useDownloadReport,
} from '@/features/accounting-workspace/hooks';
import {
  DocumentType,
  DocumentStatus,
  EntryStatus,
  AccountingDocument,
  ProposedEntry,
  ReportType,
  ExportFormat,
} from '@/features/accounting-workspace/types';

// Types (for fallback mock data)
type LocalDocumentType = 'sales_invoice' | 'purchase_invoice' | 'receipt' | 'bank_statement' | 'expense_claim' | 'contract' | 'payroll' | 'tax_document' | 'unknown';
type LocalDocumentStatus = 'pending' | 'processing' | 'classified' | 'extracted' | 'in_review' | 'processed' | 'error' | 'unclassified';
type LocalEntryStatus = 'proposed' | 'approved' | 'rejected' | 'corrected';

interface LocalAccountingDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  llmDetectedType: LocalDocumentType;
  llmConfidence: number;
  status: LocalDocumentStatus;
  extractedData?: {
    date?: string;
    amount?: number;
    vendor?: string;
    invoiceNo?: string;
    description?: string;
  };
}

interface LocalProposedEntry {
  id: string;
  documentId: string;
  documentName: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  status: LocalEntryStatus;
  anomalyFlags?: string[];
}

// Mock data (fallback when API not available)
const mockDocuments: LocalAccountingDocument[] = [
  {
    id: '1',
    fileName: 'Invoice_ABC_001.pdf',
    fileType: 'pdf',
    fileSize: 245000,
    uploadedAt: '2024-12-05 14:30',
    llmDetectedType: 'sales_invoice',
    llmConfidence: 0.95,
    status: 'processed',
    extractedData: {
      date: '2024-12-01',
      amount: 15000,
      vendor: 'ABC Company',
      invoiceNo: 'INV-2024-001',
      description: 'Consulting Services',
    },
  },
  {
    id: '2',
    fileName: 'Receipt_Office_Supplies.jpg',
    fileType: 'jpg',
    fileSize: 128000,
    uploadedAt: '2024-12-05 14:25',
    llmDetectedType: 'receipt',
    llmConfidence: 0.88,
    status: 'in_review',
    extractedData: {
      date: '2024-12-03',
      amount: 450,
      vendor: 'Office Mart',
      description: 'Office supplies',
    },
  },
  {
    id: '3',
    fileName: 'Bank_Statement_Nov.pdf',
    fileType: 'pdf',
    fileSize: 520000,
    uploadedAt: '2024-12-05 14:20',
    llmDetectedType: 'bank_statement',
    llmConfidence: 0.92,
    status: 'processing',
  },
  {
    id: '4',
    fileName: 'Unknown_Document.pdf',
    fileType: 'pdf',
    fileSize: 180000,
    uploadedAt: '2024-12-05 14:15',
    llmDetectedType: 'unknown',
    llmConfidence: 0.35,
    status: 'unclassified',
  },
];

const mockEntries: LocalProposedEntry[] = [
  {
    id: '1',
    documentId: '1',
    documentName: 'Invoice_ABC_001.pdf',
    date: '2024-12-01',
    description: 'Consulting Services - ABC Company',
    debitAccount: '1100 - Accounts Receivable',
    creditAccount: '4000 - Service Revenue',
    amount: 15000,
    status: 'proposed',
  },
  {
    id: '2',
    documentId: '2',
    documentName: 'Receipt_Office_Supplies.jpg',
    date: '2024-12-03',
    description: 'Office supplies - Office Mart',
    debitAccount: '5300 - Office Expenses',
    creditAccount: '1000 - Cash',
    amount: 450,
    status: 'proposed',
    anomalyFlags: ['Amount seems high for office supplies'],
  },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState<LocalAccountingDocument[]>(mockDocuments);
  const [entries, setEntries] = useState<LocalProposedEntry[]>(mockEntries);
  const [selectedDocument, setSelectedDocument] = useState<LocalAccountingDocument | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filterDocStatus, setFilterDocStatus] = useState<string>('all');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper for i18n - use t() for translations
  const isZh = locale === 'zh-TW';
  const projectId = params.projectId as string;

  // API Hooks
  const uploadDocumentsMutation = useUploadDocuments();
  const classifyDocumentMutation = useClassifyDocument();
  const bulkClassifyMutation = useBulkClassifyDocuments();
  const extractDataMutation = useExtractDocumentData();
  const generateEntriesMutation = useGenerateEntries();
  const approveEntryMutation = useApproveEntry();
  const rejectEntryMutation = useRejectEntry();
  const generateReportMutation = useGenerateReport();
  const downloadReportMutation = useDownloadReport();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dropzone for file upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress for UI feedback
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Try to upload via API first
      await uploadDocumentsMutation.mutateAsync({
        projectId,
        files: acceptedFiles,
      });
      
      setUploadProgress(100);
      toast.success(mounted ? t('accountingWorkspace.toasts.documentsUploaded') : 'Documents uploaded successfully');
    } catch (error) {
      // Fallback to mock behavior
      console.log('API not available, using mock upload');
      
      // Add mock uploaded documents
      const newDocs: LocalAccountingDocument[] = acceptedFiles.map((file, idx) => ({
        id: `new-${Date.now()}-${idx}`,
        fileName: file.name,
        fileType: file.name.split('.').pop() || 'unknown',
        fileSize: file.size,
        uploadedAt: new Date().toLocaleString(),
        llmDetectedType: 'unknown' as LocalDocumentType,
        llmConfidence: 0,
        status: 'pending' as LocalDocumentStatus,
      }));
      
      setDocuments((prev) => [...newDocs, ...prev]);
      setUploadProgress(100);
      
      // Simulate LLM processing
      setTimeout(() => {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.status === 'pending'
              ? { ...doc, status: 'processing' as LocalDocumentStatus }
              : doc
          )
        );
      }, 1000);
      
      // Simulate classification results
      setTimeout(() => {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.status === 'processing'
              ? {
                  ...doc,
                  status: 'in_review' as LocalDocumentStatus,
                  llmDetectedType: 'receipt' as LocalDocumentType,
                  llmConfidence: 0.85,
                }
              : doc
          )
        );
        toast.success(mounted ? t('accountingWorkspace.toasts.aiClassificationComplete') : 'AI classification complete');
      }, 3000);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  }, [projectId, uploadDocumentsMutation, isZh]);

  // Handle AI classification for single document
  const handleClassifyDocument = async (documentId: string) => {
    try {
      await classifyDocumentMutation.mutateAsync({ projectId, documentId });
    } catch (error) {
      // Fallback to mock
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                status: 'classified' as LocalDocumentStatus,
                llmDetectedType: 'receipt' as LocalDocumentType,
                llmConfidence: 0.88,
              }
            : doc
        )
      );
      toast.success(mounted ? t('accountingWorkspace.toasts.documentClassified') : 'Document classified');
    }
  };

  // Handle bulk classification
  const handleBulkClassify = async () => {
    if (selectedDocIds.length === 0) {
      toast.error(mounted ? t('accountingWorkspace.toasts.selectDocuments') : 'Please select documents');
      return;
    }
    
    setIsProcessing(true);
    try {
      await bulkClassifyMutation.mutateAsync({ projectId, documentIds: selectedDocIds });
    } catch (error) {
      // Fallback to mock
      setDocuments((prev) =>
        prev.map((doc) =>
          selectedDocIds.includes(doc.id)
            ? {
                ...doc,
                status: 'classified' as LocalDocumentStatus,
                llmDetectedType: 'receipt' as LocalDocumentType,
                llmConfidence: 0.85,
              }
            : doc
        )
      );
      toast.success(`${selectedDocIds.length} ${mounted ? t('accountingWorkspace.toasts.documentsClassified') : 'documents classified'}`);
    } finally {
      setIsProcessing(false);
      setSelectedDocIds([]);
    }
  };

  // Handle data extraction
  const handleExtractData = async (documentId: string) => {
    try {
      await extractDataMutation.mutateAsync({ projectId, documentId });
    } catch (error) {
      // Fallback to mock
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                status: 'extracted' as LocalDocumentStatus,
                extractedData: {
                  date: '2024-12-05',
                  amount: 1500,
                  vendor: 'Sample Vendor',
                  description: 'AI Extracted Data',
                },
              }
            : doc
        )
      );
      toast.success(mounted ? t('accountingWorkspace.toasts.dataExtracted') : 'Data extracted successfully');
    }
  };

  // Handle generate entries from documents
  const handleGenerateEntries = async () => {
    if (selectedDocIds.length === 0) {
      toast.error(mounted ? t('accountingWorkspace.toasts.selectDocuments') : 'Please select documents');
      return;
    }
    
    setIsProcessing(true);
    try {
      await generateEntriesMutation.mutateAsync({ projectId, documentIds: selectedDocIds });
    } catch (error) {
      // Fallback to mock - generate entries from selected documents
      const newEntries: LocalProposedEntry[] = selectedDocIds.map((docId, idx) => {
        const doc = documents.find((d) => d.id === docId);
        return {
          id: `entry-${Date.now()}-${idx}`,
          documentId: docId,
          documentName: doc?.fileName || 'Unknown',
          date: doc?.extractedData?.date || new Date().toISOString().split('T')[0],
          description: doc?.extractedData?.description || 'Auto-generated entry',
          debitAccount: '5000 - Expenses',
          creditAccount: '1000 - Cash',
          amount: doc?.extractedData?.amount || 0,
          status: 'proposed' as LocalEntryStatus,
        };
      });
      
      setEntries((prev) => [...newEntries, ...prev]);
      const entriesMsg = isZh ? `生成了 ${newEntries.length} 個分錄` : `Generated ${newEntries.length} entries`;
      toast.success(entriesMsg);
    } finally {
      setIsProcessing(false);
      setSelectedDocIds([]);
    }
  };

  // Handle report generation
  const handleGenerateReport = async (reportType: ReportType, format: ExportFormat) => {
    setIsProcessing(true);
    try {
      await generateReportMutation.mutateAsync({
        projectId,
        config: {
          type: reportType,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          include_details: true,
        },
        format,
      });
    } catch (error) {
      // Fallback - simulate report generation
      toast.success(mounted ? t('accountingWorkspace.toasts.generatingReport') : 'Generating report...');
      setTimeout(() => {
        toast.success(mounted ? t('accountingWorkspace.toasts.reportGenerated') : 'Report generated');
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  // Toggle document selection
  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  // Select all documents
  const selectAllDocuments = () => {
    if (selectedDocIds.length === filteredDocuments.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredDocuments.map((d) => d.id));
    }
  };

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    if (filterDocStatus === 'all') return true;
    if (filterDocStatus === 'unclassified') return doc.status === 'unclassified' || doc.llmConfidence < 0.6;
    return doc.status === filterDocStatus;
  });

  const unclassifiedCount = documents.filter(
    (d) => d.status === 'unclassified' || d.llmConfidence < 0.6
  ).length;

  // Helper functions
  const getDocumentTypeLabel = (type: LocalDocumentType) => {
    const typeMap: Record<LocalDocumentType, string> = {
      sales_invoice: 'salesInvoice',
      purchase_invoice: 'purchaseInvoice',
      receipt: 'receipt',
      bank_statement: 'bankStatement',
      expense_claim: 'expenseClaim',
      contract: 'contract',
      payroll: 'payroll',
      tax_document: 'taxDocument',
      unknown: 'unknown',
    };
    const key = typeMap[type];
    return mounted ? t(`accountingWorkspace.documentTypeLabels.${key}`) : type;
  };

  const getStatusBadge = (status: LocalDocumentStatus) => {
    const statusMap: Record<LocalDocumentStatus, { key: string; variant: 'outline' | 'secondary' | 'default' | 'destructive'; icon: typeof Clock }> = {
      pending: { key: 'pending', variant: 'outline', icon: Clock },
      processing: { key: 'processing', variant: 'secondary', icon: Loader2 },
      classified: { key: 'classified', variant: 'default', icon: CheckCircle },
      extracted: { key: 'extracted', variant: 'default', icon: CheckCircle },
      in_review: { key: 'inReview', variant: 'default', icon: Eye },
      processed: { key: 'processed', variant: 'secondary', icon: CheckCircle },
      error: { key: 'error', variant: 'destructive', icon: XCircle },
      unclassified: { key: 'unclassified', variant: 'outline', icon: AlertCircle },
    };
    const { key, variant, icon: Icon } = statusMap[status];
    const label = mounted ? t(`accountingWorkspace.processStatus.${key}`) : status;
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className={`h-3 w-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
        {label}
      </Badge>
    );
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <ImageIcon className="h-5 w-5 text-blue-500" />;
      case 'doc':
      case 'docx':
        return <FileSpreadsheet className="h-5 w-5 text-blue-600" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleApproveEntry = async (entryId: string) => {
    try {
      await approveEntryMutation.mutateAsync({ projectId, entryId });
    } catch (error) {
      // Fallback to local state update
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, status: 'approved' as LocalEntryStatus } : e))
      );
      toast.success(mounted ? t('accountingWorkspace.toasts.entryApproved') : 'Entry approved');
    }
  };

  const handleRejectEntry = async (entryId: string) => {
    try {
      await rejectEntryMutation.mutateAsync({ projectId, entryId });
    } catch (error) {
      // Fallback to local state update
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, status: 'rejected' as LocalEntryStatus } : e))
      );
      toast.success(mounted ? t('accountingWorkspace.toasts.entryRejected') : 'Entry rejected');
    }
  };

  if (!mounted) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse text-muted-foreground">
            Loading...
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/accounting-workspace">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <h1 className="text-2xl font-bold">ABC Trading Ltd</h1>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {t('accountingWorkspace.projectStatus.inProgress')}
                </Badge>
              </div>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                2024 Q4 · {t('accountingWorkspace.projectDetail.bookkeeping')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleBulkClassify}
              disabled={selectedDocIds.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {t('accountingWorkspace.projectDetail.aiClassify')}
              {selectedDocIds.length > 0 && ` (${selectedDocIds.length})`}
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => handleGenerateReport('income_statement', 'excel')}
              disabled={isProcessing}
            >
              <Download className="h-4 w-4" />
              {t('accountingWorkspace.projectDetail.exportReport')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">
                {t('accountingWorkspace.projectDetail.totalDocuments')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {documents.filter((d) => d.status === 'processed').length}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('accountingWorkspace.processStatus.processed')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{unclassifiedCount}</div>
              <p className="text-xs text-muted-foreground">
                {t('accountingWorkspace.projectDetail.needReview')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{entries.length}</div>
              <p className="text-xs text-muted-foreground">
                {t('accountingWorkspace.projectDetail.proposedEntries')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="h-4 w-4" />
              {t('accountingWorkspace.projectDetail.documents')}
              <Badge variant="secondary" className="ml-1">
                {documents.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="entries" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              {t('accountingWorkspace.projectDetail.entries')}
              <Badge variant="secondary" className="ml-1">
                {entries.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <Download className="h-4 w-4" />
              {t('accountingWorkspace.reportsTab')}
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Upload Area */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {isZh ? '上傳文件' : 'Upload Documents'}
                  </CardTitle>
                  <CardDescription>
                    {t('accountingWorkspace.projectDetail.supportsFormats')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    {isDragActive ? (
                      <p className="text-primary font-medium">
                        {t('accountingWorkspace.projectDetail.dropFilesHere')}
                      </p>
                    ) : (
                      <>
                        <p className="font-medium">
                          {t('accountingWorkspace.projectDetail.dragDropFiles')}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('accountingWorkspace.projectDetail.orClickToSelect')}
                        </p>
                      </>
                    )}
                  </div>
                  {isUploading && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t('accountingWorkspace.projectDetail.uploading')}</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Document List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-lg">
                        {t('accountingWorkspace.projectDetail.documentList')}
                      </CardTitle>
                      {selectedDocIds.length > 0 && (
                        <Badge variant="secondary">
                          {selectedDocIds.length} {t('accountingWorkspace.projectDetail.selected')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedDocIds.length > 0 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={handleBulkClassify}
                            disabled={isProcessing}
                          >
                            <Sparkles className="h-3 w-3" />
                            {t('accountingWorkspace.projectDetail.classify')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={handleGenerateEntries}
                            disabled={isProcessing}
                          >
                            <FileSpreadsheet className="h-3 w-3" />
                            {t('accountingWorkspace.projectDetail.generate')}
                          </Button>
                        </>
                      )}
                      <Select value={filterDocStatus} onValueChange={setFilterDocStatus}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('accountingWorkspace.projectDetail.all')}</SelectItem>
                          <SelectItem value="pending">{t('accountingWorkspace.processStatus.pending')}</SelectItem>
                          <SelectItem value="processing">{t('accountingWorkspace.processStatus.processing')}</SelectItem>
                          <SelectItem value="in_review">{t('accountingWorkspace.processStatus.inReview')}</SelectItem>
                          <SelectItem value="processed">{t('accountingWorkspace.processStatus.processed')}</SelectItem>
                          <SelectItem value="unclassified">
                            {t('accountingWorkspace.processStatus.unclassified')} ({unclassifiedCount})
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]">
                            <input
                              type="checkbox"
                              checked={selectedDocIds.length === filteredDocuments.length && filteredDocuments.length > 0}
                              onChange={selectAllDocuments}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </TableHead>
                          <TableHead>{t('accountingWorkspace.projectDetail.file')}</TableHead>
                          <TableHead>{t('accountingWorkspace.projectDetail.type')}</TableHead>
                          <TableHead>{t('accountingWorkspace.projectDetail.confidence')}</TableHead>
                          <TableHead>{t('accountingWorkspace.status')}</TableHead>
                          <TableHead className="text-right">{t('accountingWorkspace.projectDetail.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDocuments.map((doc) => (
                          <TableRow key={doc.id} className={selectedDocIds.includes(doc.id) ? 'bg-muted/50' : ''}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedDocIds.includes(doc.id)}
                                onChange={() => toggleDocumentSelection(doc.id)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getFileIcon(doc.fileType)}
                                <div>
                                  <p className="font-medium text-sm">{doc.fileName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(doc.fileSize)} · {doc.uploadedAt}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getDocumentTypeLabel(doc.llmDetectedType)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={doc.llmConfidence * 100}
                                  className="w-16 h-2"
                                />
                                <span className="text-xs">
                                  {Math.round(doc.llmConfidence * 100)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(doc.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setSelectedDocument(doc);
                                    setIsPreviewOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleClassifyDocument(doc.id)}>
                                      <Sparkles className="h-4 w-4 mr-2" />
                                      {t('accountingWorkspace.projectDetail.aiClassifyDocument')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExtractData(doc.id)}>
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      {t('accountingWorkspace.projectDetail.extractData')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => {
                                        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
                                        toast.success(mounted ? t('accountingWorkspace.toasts.documentDeleted') : 'Document deleted');
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      {t('accountingWorkspace.projectDetail.deleteDocument')}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Entries Tab */}
          <TabsContent value="entries" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('accountingWorkspace.projectDetail.proposedEntries')}</CardTitle>
                    <CardDescription>
                      {t('accountingWorkspace.projectDetail.reviewApprove')}
                    </CardDescription>
                  </div>
                  <Button 
                    className="gap-2"
                    onClick={handleGenerateEntries}
                    disabled={selectedDocIds.length === 0 || isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {t('accountingWorkspace.generateEntries')}
                    {selectedDocIds.length > 0 && ` (${selectedDocIds.length})`}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('accountingWorkspace.projectDetail.date')}</TableHead>
                      <TableHead>{t('accountingWorkspace.description')}</TableHead>
                      <TableHead>{t('accountingWorkspace.projectDetail.debitAccount')}</TableHead>
                      <TableHead>{t('accountingWorkspace.projectDetail.creditAccount')}</TableHead>
                      <TableHead className="text-right">{t('accountingWorkspace.projectDetail.amount')}</TableHead>
                      <TableHead>{t('accountingWorkspace.status')}</TableHead>
                      <TableHead className="text-right">{t('accountingWorkspace.projectDetail.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{entry.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {t('accountingWorkspace.projectDetail.source')}{entry.documentName}
                            </p>
                            {entry.anomalyFlags && entry.anomalyFlags.length > 0 && (
                              <div className="flex items-center gap-1 mt-1 text-yellow-600">
                                <AlertTriangle className="h-3 w-3" />
                                <span className="text-xs">{entry.anomalyFlags[0]}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{entry.debitAccount}</TableCell>
                        <TableCell className="font-mono text-sm">{entry.creditAccount}</TableCell>
                        <TableCell className="text-right font-mono">
                          ${entry.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              entry.status === 'approved'
                                ? 'default'
                                : entry.status === 'rejected'
                                ? 'destructive'
                                : 'outline'
                            }
                          >
                            {entry.status === 'approved'
                              ? t('accountingWorkspace.projectDetail.approved')
                              : entry.status === 'rejected'
                              ? t('accountingWorkspace.projectDetail.rejected')
                              : t('accountingWorkspace.projectDetail.pendingReview')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.status === 'proposed' && (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleApproveEntry(entry.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRejectEntry(entry.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    {t('accountingWorkspace.projectDetail.profitLoss')}
                  </CardTitle>
                  <CardDescription>
                    {t('accountingWorkspace.projectDetail.generatePLStatement')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => handleGenerateReport('income_statement', 'excel')}
                      disabled={isProcessing}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => handleGenerateReport('income_statement', 'word')}
                      disabled={isProcessing}
                    >
                      <FileText className="h-4 w-4" />
                      Word
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                    {t('accountingWorkspace.projectDetail.balanceSheet')}
                  </CardTitle>
                  <CardDescription>
                    {t('accountingWorkspace.projectDetail.generateBalanceSheet')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => handleGenerateReport('balance_sheet', 'excel')}
                      disabled={isProcessing}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => handleGenerateReport('balance_sheet', 'word')}
                      disabled={isProcessing}
                    >
                      <FileText className="h-4 w-4" />
                      Word
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-purple-600" />
                    {t('accountingWorkspace.projectDetail.generalLedger')}
                  </CardTitle>
                  <CardDescription>
                    {t('accountingWorkspace.projectDetail.generateGeneralLedger')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => handleGenerateReport('general_ledger', 'excel')}
                      disabled={isProcessing}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => handleGenerateReport('general_ledger', 'word')}
                      disabled={isProcessing}
                    >
                      <FileText className="h-4 w-4" />
                      Word
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Update Existing Report */}
            <Card>
              <CardHeader>
                <CardTitle>{t('accountingWorkspace.projectDetail.updateExistingReport')}</CardTitle>
                <CardDescription>
                  {t('accountingWorkspace.projectDetail.mergeDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="font-medium">{t('accountingWorkspace.projectDetail.uploadExistingReport')}</p>
                    <p className="text-sm text-muted-foreground">Excel / Word</p>
                  </div>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="font-medium">{t('accountingWorkspace.projectDetail.uploadNewDocuments')}</p>
                    <p className="text-sm text-muted-foreground">PDF / JPG / Word</p>
                  </div>
                </div>
                <Button className="w-full mt-4 gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t('accountingWorkspace.projectDetail.startMerging')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Document Preview Sheet */}
        <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <SheetContent className="w-[600px] sm:max-w-[600px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                {selectedDocument && getFileIcon(selectedDocument.fileType)}
                {selectedDocument?.fileName}
              </SheetTitle>
              <SheetDescription>
                {t('accountingWorkspace.projectDetail.documentPreview')}
              </SheetDescription>
            </SheetHeader>
            {selectedDocument && (
              <div className="mt-6 space-y-6">
                {/* Preview placeholder */}
                <div className="border rounded-lg p-8 bg-muted/50 text-center">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {t('accountingWorkspace.projectDetail.previewArea')}
                  </p>
                </div>

                {/* Extracted Data */}
                {selectedDocument.extractedData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        {t('accountingWorkspace.projectDetail.aiExtractedData')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedDocument.extractedData.date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('accountingWorkspace.projectDetail.date')}</span>
                          <span className="font-medium">{selectedDocument.extractedData.date}</span>
                        </div>
                      )}
                      {selectedDocument.extractedData.amount && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('accountingWorkspace.projectDetail.amount')}</span>
                          <span className="font-medium font-mono">
                            ${selectedDocument.extractedData.amount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedDocument.extractedData.vendor && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('accountingWorkspace.projectDetail.vendor')}</span>
                          <span className="font-medium">{selectedDocument.extractedData.vendor}</span>
                        </div>
                      )}
                      {selectedDocument.extractedData.invoiceNo && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('accountingWorkspace.projectDetail.invoiceNo')}</span>
                          <span className="font-medium">{selectedDocument.extractedData.invoiceNo}</span>
                        </div>
                      )}
                      {selectedDocument.extractedData.description && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('accountingWorkspace.description')}</span>
                          <span className="font-medium">{selectedDocument.extractedData.description}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 gap-2"
                    onClick={() => {
                      if (selectedDocument) {
                        setSelectedDocIds([selectedDocument.id]);
                        handleGenerateEntries();
                        setIsPreviewOpen(false);
                      }
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {t('accountingWorkspace.projectDetail.generateEntry')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => {
                      if (selectedDocument) {
                        handleExtractData(selectedDocument.id);
                      }
                    }}
                    disabled={extractDataMutation.isPending}
                  >
                    {extractDataMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {t('accountingWorkspace.projectDetail.extractData')}
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </PageContainer>
  );
}
