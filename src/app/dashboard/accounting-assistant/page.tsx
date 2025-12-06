'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/provider';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
import {
  IconUpload,
  IconReceipt,
  IconSend,
  IconLoader2,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconFileSpreadsheet,
  IconDownload,
  IconEye,
  IconRefresh,
  IconChartBar,
  IconBrain,
  IconArrowRight,
  IconCurrencyDollar,
  IconCalendar,
  IconBuilding,
  IconHash,
  IconCategory,
  IconFileText,
  IconClipboardCheck,
  IconArrowsExchange,
  IconReport,
  IconRobot,
  IconMessageCircle,
  IconSearch,
  IconFiles,
} from '@tabler/icons-react';
import {
  uploadReceipt,
  uploadReceiptsBatch,
  BatchUploadResult,
  getReceipts,
  getReceiptDetail,
  approveReceipt,
  createJournalEntry,
  getAiReview,
  compareExcel,
  createReport,
  getReports,
  aiQuery,
  getStats,
  Receipt,
  ProcessingResult,
  ComparisonResult,
  ExpenseReport,
  Stats,
} from './services';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  contentZh?: string;
  suggestions?: Array<{ title: string; description: string }>;
}

interface UploadProgress {
  step: string;
  progress: number;
  message: string;
  messageZh?: string;
}

// Processing steps - keys for translation
const processingStepKeys = [
  { key: 'upload', i18nKey: 'accountingAssistant.steps.uploading' },
  { key: 'analyze', i18nKey: 'accountingAssistant.steps.analyzing' },
  { key: 'categorize', i18nKey: 'accountingAssistant.steps.categorizing' },
  { key: 'journal', i18nKey: 'accountingAssistant.steps.generatingJournal' },
  { key: 'review', i18nKey: 'accountingAssistant.steps.reviewing' },
];

// Expense categories with translation keys
const expenseCategoryKeys = [
  { value: 'MEALS', i18nKey: 'accountingAssistant.categories.meals' },
  { value: 'TRANSPORT', i18nKey: 'accountingAssistant.categories.transport' },
  { value: 'SUPPLIES', i18nKey: 'accountingAssistant.categories.supplies' },
  { value: 'UTILITIES', i18nKey: 'accountingAssistant.categories.utilities' },
  { value: 'RENT', i18nKey: 'accountingAssistant.categories.rent' },
  { value: 'SERVICES', i18nKey: 'accountingAssistant.categories.services' },
  { value: 'EQUIPMENT', i18nKey: 'accountingAssistant.categories.equipment' },
  { value: 'TRAVEL', i18nKey: 'accountingAssistant.categories.travel' },
  { value: 'INSURANCE', i18nKey: 'accountingAssistant.categories.insurance' },
  { value: 'OTHER', i18nKey: 'accountingAssistant.categories.other' },
];

// Status badges with translation keys
const statusConfigKeys: Record<string, { color: string; i18nKey: string }> = {
  PENDING: { color: 'secondary', i18nKey: 'accountingAssistant.status.pending' },
  ANALYZING: { color: 'warning', i18nKey: 'accountingAssistant.status.analyzing' },
  ANALYZED: { color: 'info', i18nKey: 'accountingAssistant.status.analyzed' },
  CATEGORIZED: { color: 'info', i18nKey: 'accountingAssistant.status.categorized' },
  JOURNAL_CREATED: { color: 'success', i18nKey: 'accountingAssistant.status.journalCreated' },
  APPROVED: { color: 'success', i18nKey: 'accountingAssistant.status.approved' },
  REJECTED: { color: 'destructive', i18nKey: 'accountingAssistant.status.rejected' },
  ERROR: { color: 'destructive', i18nKey: 'accountingAssistant.status.error' },
};

export default function AccountingAssistantPage() {
  const { t } = useTranslation();
  
  // State
  const [activeTab, setActiveTab] = useState('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  
  // Batch upload state
  const [uploadMode, setUploadMode] = useState<'single' | 'batch'>('single');
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchResults, setBatchResults] = useState<BatchUploadResult | null>(null);
  const [batchProgress, setBatchProgress] = useState({ completed: 0, total: 0, currentFile: '' });
  
  // Receipts state
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);
  
  // Comparison state
  const [comparisonFile, setComparisonFile] = useState<File | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  
  // Reports state
  const [reports, setReports] = useState<ExpenseReport[]>([]);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [reportPeriod, setReportPeriod] = useState({ start: '', end: '' });
  const [reportTitle, setReportTitle] = useState('');
  
  // AI Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Stats state
  const [stats, setStats] = useState<Stats | null>(null);
  
  // Dialog state
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);
  const comparisonFileRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    loadReceipts();
    loadReports();
    loadStats();
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load receipts
  const loadReceipts = async () => {
    setIsLoadingReceipts(true);
    try {
      const data = await getReceipts();
      setReceipts(data.results || []);
    } catch (error) {
      console.error('Failed to load receipts:', error);
    } finally {
      setIsLoadingReceipts(false);
    }
  };

  // Load reports
  const loadReports = async () => {
    try {
      const data = await getReports();
      setReports(data.results || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessingResult(null);
    }
  };

  // Handle upload and process
  const handleUploadAndProcess = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress({ step: 'upload', progress: 10, message: t('accountingAssistant.steps.uploading') });
    
    try {
      // Upload and process
      const result = await uploadReceipt(selectedFile, 'auto', true, true);
      
      // Simulate progress updates
      for (let i = 0; i < processingStepKeys.length; i++) {
        setUploadProgress({
          step: processingStepKeys[i].key,
          progress: ((i + 1) / processingStepKeys.length) * 100,
          message: t(processingStepKeys[i].i18nKey),
        });
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setProcessingResult(result);
      loadReceipts(); // Refresh list
      loadStats(); // Refresh stats
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadProgress({
        step: 'error',
        progress: 0,
        message: error.message || t('accountingAssistant.uploadFailed'),
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle batch file selection
  const handleBatchFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setBatchFiles(Array.from(files));
      setBatchResults(null);
    }
  };

  // Handle batch upload
  const handleBatchUpload = async () => {
    if (batchFiles.length === 0) return;
    
    setIsUploading(true);
    setBatchResults(null);
    setBatchProgress({ completed: 0, total: batchFiles.length, currentFile: '' });
    
    try {
      const results = await uploadReceiptsBatch(
        batchFiles,
        'auto',
        true,
        true,
        (completed: number, total: number, currentFile: string) => {
          setBatchProgress({ completed, total, currentFile });
        }
      );
      
      setBatchResults(results);
      loadReceipts(); // Refresh list
      loadStats(); // Refresh stats
    } catch (error: any) {
      console.error('Batch upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Remove file from batch
  const removeBatchFile = (index: number) => {
    setBatchFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle comparison upload
  const handleComparisonUpload = async () => {
    if (!comparisonFile) return;
    
    setIsComparing(true);
    try {
      const result = await compareExcel(comparisonFile);
      setComparisonResult(result);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setIsComparing(false);
    }
  };

  // Handle report creation
  const handleCreateReport = async () => {
    if (!reportTitle || !reportPeriod.start || !reportPeriod.end) return;
    
    setIsCreatingReport(true);
    try {
      await createReport(reportTitle, reportPeriod.start, reportPeriod.end, true);
      loadReports();
      setReportTitle('');
      setReportPeriod({ start: '', end: '' });
    } catch (error) {
      console.error('Report creation failed:', error);
    } finally {
      setIsCreatingReport(false);
    }
  };

  // Handle AI query
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsAiLoading(true);
    
    try {
      const result = await aiQuery(inputMessage, selectedReceipt?.id);
      
      // Handle answer which may be string or { en, zh } object
      const answerContent = typeof result.answer === 'object' && result.answer !== null
        ? (result.answer as { en: string; zh?: string }).en
        : (result.answer as string) || 'No response';
      const answerContentZh = typeof result.answer === 'object' && result.answer !== null
        ? (result.answer as { en: string; zh?: string }).zh
        : undefined;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answerContent,
        contentZh: answerContentZh,
        suggestions: result.suggestions,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI query failed:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        contentZh: '抱歉，處理您的請求時發生錯誤。',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // View receipt detail
  const handleViewReceipt = async (receipt: Receipt) => {
    try {
      const detail = await getReceiptDetail(receipt.id);
      setSelectedReceipt(detail);
      setShowReceiptDialog(true);
    } catch (error) {
      console.error('Failed to load receipt detail:', error);
    }
  };

  // Approve receipt
  const handleApproveReceipt = async (receiptId: string) => {
    try {
      await approveReceipt(receiptId);
      loadReceipts();
      setShowReceiptDialog(false);
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  // Create journal entry
  const handleCreateJournal = async (receiptId: string) => {
    try {
      await createJournalEntry(receiptId);
      loadReceipts();
    } catch (error) {
      console.error('Journal creation failed:', error);
    }
  };

  // Get AI review
  const handleGetAiReview = async (receiptId: string) => {
    try {
      const review = await getAiReview(receiptId);
      // Show review in dialog or update receipt
      console.log('AI Review:', review);
    } catch (error) {
      console.error('AI review failed:', error);
    }
  };

  return (
    <PageContainer scrollable>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('accountingAssistant.title')}</h1>
            <p className="text-muted-foreground">
              {t('accountingAssistant.description')}
            </p>
          </div>
          <Button variant="outline" onClick={() => { loadReceipts(); loadStats(); }}>
            <IconRefresh className="mr-2 h-4 w-4" />
            {t('accountingAssistant.refresh')}
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('accountingAssistant.stats.totalReceipts')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_receipts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('accountingAssistant.stats.totalAmount')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.total_amount?.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('accountingAssistant.stats.pendingApproval')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {stats.pending_approval}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('accountingAssistant.stats.recent30Days')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recent_30_days}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="upload">
              <IconUpload className="mr-2 h-4 w-4" />
              {t('accountingAssistant.uploadTab')}
            </TabsTrigger>
            <TabsTrigger value="receipts">
              <IconReceipt className="mr-2 h-4 w-4" />
              {t('accountingAssistant.receiptsTab')}
            </TabsTrigger>
            <TabsTrigger value="compare">
              <IconArrowsExchange className="mr-2 h-4 w-4" />
              {t('accountingAssistant.compareTab')}
            </TabsTrigger>
            <TabsTrigger value="reports">
              <IconReport className="mr-2 h-4 w-4" />
              {t('accountingAssistant.reportsTab')}
            </TabsTrigger>
            <TabsTrigger value="ai-chat">
              <IconRobot className="mr-2 h-4 w-4" />
              {t('accountingAssistant.chatTab')}
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            {/* Upload Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={uploadMode === 'single' ? 'default' : 'outline'}
                onClick={() => setUploadMode('single')}
              >
                <IconUpload className="mr-2 h-4 w-4" />
                {t('accountingAssistant.singleUpload')}
              </Button>
              <Button
                variant={uploadMode === 'batch' ? 'default' : 'outline'}
                onClick={() => setUploadMode('batch')}
              >
                <IconFiles className="mr-2 h-4 w-4" />
                {t('accountingAssistant.batchUpload')}
              </Button>
            </div>

            {uploadMode === 'single' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Single Upload Area */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <IconUpload className="inline mr-2 h-5 w-5" />
                      {t('accountingAssistant.uploadReceipt')}
                    </CardTitle>
                    <CardDescription>
                      {t('accountingAssistant.uploadDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto" />
                      ) : (
                        <div className="space-y-2">
                          <IconUpload className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {t('accountingAssistant.clickToUpload')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, HEIC up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    
                    {uploadProgress && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress.progress} />
                      <p className="text-sm text-muted-foreground text-center">
                        {uploadProgress.message}
                      </p>
                    </div>
                  )}
                  
                  <Button
                    className="w-full"
                    disabled={!selectedFile || isUploading}
                    onClick={handleUploadAndProcess}
                  >
                    {isUploading ? (
                      <>
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('accountingAssistant.processing')}
                      </>
                    ) : (
                      <>
                        <IconBrain className="mr-2 h-4 w-4" />
                        {t('accountingAssistant.analyzeWithAI')}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Processing Result */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <IconReceipt className="inline mr-2 h-5 w-5" />
                    {t('accountingAssistant.analysisResult')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {processingResult ? (
                    <div className="space-y-4">
                      {/* Status */}
                      <div className="flex items-center gap-2">
                        {processingResult.status === 'success' ? (
                          <Badge variant="default" className="bg-green-500">
                            <IconCheck className="mr-1 h-3 w-3" />
                            {t('accountingAssistant.success')}
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <IconX className="mr-1 h-3 w-3" />
                            {t('accountingAssistant.error')}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Receipt Data */}
                      {processingResult.receipt && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <Label className="text-muted-foreground">{t('accountingAssistant.merchant')}</Label>
                              <p className="font-medium">{processingResult.receipt.vendor_name || '-'}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('accountingAssistant.date')}</Label>
                              <p className="font-medium">{processingResult.receipt.receipt_date || '-'}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('accountingAssistant.amount')}</Label>
                              <p className="font-medium">
                                {processingResult.receipt.currency} {processingResult.receipt.total_amount?.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('accountingAssistant.category')}</Label>
                              <p className="font-medium">
                                {t(expenseCategoryKeys.find(c => c.value === processingResult.receipt?.category)?.i18nKey || 'accountingAssistant.categories.other')}
                              </p>
                            </div>
                          </div>
                          
                          {/* AI Suggestions */}
                          {processingResult.receipt.ai_suggestions && processingResult.receipt.ai_suggestions.length > 0 && (
                            <Alert>
                              <IconBrain className="h-4 w-4" />
                              <AlertTitle>{t('accountingAssistant.aiSuggestions')}</AlertTitle>
                              <AlertDescription>
                                <ul className="list-disc list-inside text-sm">
                                  {processingResult.receipt.ai_suggestions.map((suggestion: any, index: number) => (
                                    <li key={index}>{typeof suggestion === 'string' ? suggestion : suggestion.message}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {/* Confidence Score */}
                          {processingResult.receipt.ai_confidence_score && (
                            <div>
                              <Label className="text-muted-foreground">{t('accountingAssistant.aiConfidence')}</Label>
                              <Progress value={processingResult.receipt.ai_confidence_score} className="mt-1" />
                              <p className="text-xs text-right text-muted-foreground mt-1">
                                {processingResult.receipt.ai_confidence_score}%
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <IconReceipt className="mx-auto h-12 w-12 mb-2" />
                      <p>{t('accountingAssistant.uploadToSeeAnalysis')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            ) : (
              /* Batch Upload Mode */
              <Card>
                <CardHeader>
                  <CardTitle>
                    <IconUpload className="inline mr-2 h-5 w-5" />
                    {t('accountingAssistant.batchUpload')}
                  </CardTitle>
                  <CardDescription>
                    {t('accountingAssistant.batchUploadDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Batch File Input */}
                  <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <input
                        type="file"
                        id="batch-file-input"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={handleBatchFileSelect}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="batch-file-input"
                        className={`cursor-pointer flex flex-col items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <IconFiles className="h-12 w-12 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{t('accountingAssistant.clickToSelectMultiple')}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Supports: PNG, JPG, JPEG, GIF, WEBP, PDF
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Batch Files List */}
                  {batchFiles.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          {t('accountingAssistant.selectedFiles')} ({batchFiles.length})
                        </h4>
                        <Button
                          onClick={handleBatchUpload}
                          disabled={isUploading || batchFiles.length === 0}
                        >
                          {isUploading ? (
                            <>
                              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t('accountingAssistant.processing')}
                            </>
                          ) : (
                            <>
                              <IconUpload className="mr-2 h-4 w-4" />
                              {t('accountingAssistant.startBatchUpload')}
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Progress Bar */}
                      {isUploading && batchProgress.total > 0 && (
                        <div className="space-y-2">
                          <Progress value={(batchProgress.completed / batchProgress.total) * 100} />
                          <p className="text-sm text-muted-foreground text-center">
                            {batchProgress.completed} / {batchProgress.total} - {batchProgress.currentFile}
                          </p>
                        </div>
                      )}

                      {/* File List */}
                      <div className="border rounded-lg divide-y max-h-60 overflow-auto">
                        {batchFiles.map((file: File, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <IconReceipt className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBatchFile(index)}
                              disabled={isUploading}
                            >
                              <IconX className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Batch Results */}
                  {batchResults && batchResults.results.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">
                        {t('accountingAssistant.processingResults')}
                      </h4>
                      <div className="grid gap-2">
                        {batchResults.results.map((result: { filename: string; status: 'success' | 'error'; receipt_id?: string; error?: string }, index: number) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              result.status === 'success'
                                ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                                : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {result.status === 'success' ? (
                                <IconCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <IconX className="h-5 w-5 text-red-600 dark:text-red-400" />
                              )}
                              <span className="text-sm font-medium">{result.filename}</span>
                            </div>
                            {result.status === 'success' ? (
                              <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                                {t('accountingAssistant.success')}
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                {t('accountingAssistant.failed')}: {result.error}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Summary */}
                      <Alert>
                        <IconBrain className="h-4 w-4" />
                        <AlertTitle>{t('accountingAssistant.batchSummary')}</AlertTitle>
                        <AlertDescription>
                          {t('accountingAssistant.batchSummaryText', { successful: batchResults.successful, total: batchResults.total })}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Receipts Tab */}
          <TabsContent value="receipts">
            <Card>
              <CardHeader>
                <CardTitle>
                  <IconReceipt className="inline mr-2 h-5 w-5" />
                  {t('accountingAssistant.receiptList')}
                </CardTitle>
                <CardDescription>
                  {t('accountingAssistant.receiptListDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingReceipts ? (
                  <div className="flex items-center justify-center py-8">
                    <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : receipts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <IconReceipt className="mx-auto h-12 w-12 mb-2" />
                    <p>{t('accountingAssistant.noReceipts')}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('accountingAssistant.date')}</TableHead>
                        <TableHead>{t('accountingAssistant.merchant')}</TableHead>
                        <TableHead>{t('accountingAssistant.category')}</TableHead>
                        <TableHead className="text-right">{t('accountingAssistant.amount')}</TableHead>
                        <TableHead>{t('accountingAssistant.statusLabel')}</TableHead>
                        <TableHead>{t('accountingAssistant.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipts.map((receipt) => (
                        <TableRow key={receipt.id}>
                          <TableCell>{receipt.receipt_date || '-'}</TableCell>
                          <TableCell>{receipt.vendor_name || '-'}</TableCell>
                          <TableCell>
                            {t(expenseCategoryKeys.find(c => c.value === receipt.category)?.i18nKey || 'accountingAssistant.categories.other')}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {receipt.currency} {receipt.total_amount?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfigKeys[receipt.status]?.color as any || 'secondary'}>
                              {t(statusConfigKeys[receipt.status]?.i18nKey || 'accountingAssistant.status.pending')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewReceipt(receipt)}>
                                <IconEye className="h-4 w-4" />
                              </Button>
                              {receipt.status !== 'APPROVED' && (
                                <Button variant="ghost" size="sm" onClick={() => handleApproveReceipt(receipt.id)}>
                                  <IconCheck className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Excel */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <IconFileSpreadsheet className="inline mr-2 h-5 w-5" />
                    {t('accountingAssistant.uploadExcel')}
                  </CardTitle>
                  <CardDescription>
                    {t('accountingAssistant.uploadExcelDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => comparisonFileRef.current?.click()}
                  >
                    {comparisonFile ? (
                      <div className="space-y-2">
                        <IconFileSpreadsheet className="mx-auto h-12 w-12 text-green-500" />
                        <p className="font-medium">{comparisonFile.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <IconFileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {t('accountingAssistant.clickToUploadExcel')}
                        </p>
                        <p className="text-xs text-muted-foreground">.xlsx, .xls</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={comparisonFileRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => setComparisonFile(e.target.files?.[0] || null)}
                  />
                  
                  <Button
                    className="w-full"
                    disabled={!comparisonFile || isComparing}
                    onClick={handleComparisonUpload}
                  >
                    {isComparing ? (
                      <>
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('accountingAssistant.comparing')}
                      </>
                    ) : (
                      <>
                        <IconArrowsExchange className="mr-2 h-4 w-4" />
                        {t('accountingAssistant.startComparison')}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Comparison Results */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <IconChartBar className="inline mr-2 h-5 w-5" />
                    {t('accountingAssistant.comparisonResults')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {comparisonResult ? (
                    <div className="space-y-4">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold text-green-500">{comparisonResult.summary?.matched_count || 0}</p>
                          <p className="text-sm text-muted-foreground">{t('accountingAssistant.matched')}</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold text-red-500">
                            {(comparisonResult.summary?.missing_in_db_count || 0) + (comparisonResult.summary?.missing_in_excel_count || 0)}
                          </p>
                          <p className="text-sm text-muted-foreground">{t('accountingAssistant.differences')}</p>
                        </div>
                      </div>
                      
                      {/* Health Score */}
                      {comparisonResult.comparison?.health_score !== undefined && (
                        <div>
                          <Label className="text-muted-foreground">{t('accountingAssistant.dataHealthScore')}</Label>
                          <Progress value={comparisonResult.comparison.health_score} className="mt-1" />
                          <p className="text-xs text-right text-muted-foreground mt-1">
                            {comparisonResult.comparison.health_score}%
                          </p>
                        </div>
                      )}
                      
                      {/* AI Analysis */}
                      {comparisonResult.ai_analysis && (
                        <Alert>
                          <IconBrain className="h-4 w-4" />
                          <AlertTitle>{t('accountingAssistant.aiAnalysis')}</AlertTitle>
                          <AlertDescription className="text-sm whitespace-pre-wrap">
                            {typeof comparisonResult.ai_analysis === 'string' 
                              ? comparisonResult.ai_analysis 
                              : JSON.stringify(comparisonResult.ai_analysis, null, 2)}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <IconArrowsExchange className="mx-auto h-12 w-12 mb-2" />
                      <p>{t('accountingAssistant.uploadExcelToCompare')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Create Report */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <IconReport className="inline mr-2 h-5 w-5" />
                    {t('accountingAssistant.createReport')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('accountingAssistant.reportTitle')}</Label>
                    <Input
                      placeholder={t('accountingAssistant.reportTitlePlaceholder')}
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('accountingAssistant.periodStart')}</Label>
                    <Input
                      type="date"
                      value={reportPeriod.start}
                      onChange={(e) => setReportPeriod(prev => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('accountingAssistant.periodEnd')}</Label>
                    <Input
                      type="date"
                      value={reportPeriod.end}
                      onChange={(e) => setReportPeriod(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!reportTitle || !reportPeriod.start || !reportPeriod.end || isCreatingReport}
                    onClick={handleCreateReport}
                  >
                    {isCreatingReport ? (
                      <>
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('accountingAssistant.creating')}
                      </>
                    ) : (
                      <>
                        <IconFileSpreadsheet className="mr-2 h-4 w-4" />
                        {t('accountingAssistant.generateReport')}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Reports List */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>
                    <IconFileText className="inline mr-2 h-5 w-5" />
                    {t('accountingAssistant.reportsList')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reports.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <IconReport className="mx-auto h-12 w-12 mb-2" />
                      <p>{t('accountingAssistant.noReports')}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('accountingAssistant.titleLabel')}</TableHead>
                          <TableHead>{t('accountingAssistant.period')}</TableHead>
                          <TableHead className="text-right">{t('accountingAssistant.amount')}</TableHead>
                          <TableHead>{t('accountingAssistant.statusLabel')}</TableHead>
                          <TableHead>{t('accountingAssistant.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">{report.title}</TableCell>
                            <TableCell>
                              {report.period_start} ~ {report.period_end}
                            </TableCell>
                            <TableCell className="text-right">
                              ${report.total_amount?.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={report.status === 'APPROVED' ? 'default' : 'secondary'}>
                                {report.status === 'APPROVED' ? t('accountingAssistant.status.approved') : report.status === 'DRAFT' ? t('accountingAssistant.status.draft') : report.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <IconDownload className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Chat Tab */}
          <TabsContent value="ai-chat">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>
                  <IconRobot className="inline mr-2 h-5 w-5" />
                  {t('accountingAssistant.aiAssistant')}
                </CardTitle>
                <CardDescription>
                  {t('accountingAssistant.aiAssistantDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <IconMessageCircle className="mx-auto h-12 w-12 mb-4" />
                        <p className="mb-2">{t('accountingAssistant.startConversation')}</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {[
                            t('accountingAssistant.sampleQuestion1'),
                            t('accountingAssistant.sampleQuestion2'),
                            t('accountingAssistant.sampleQuestion3'),
                            t('accountingAssistant.sampleQuestion4'),
                          ].map((prompt, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              onClick={() => setInputMessage(prompt)}
                            >
                              {prompt}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p>{message.content}</p>
                          {message.contentZh && message.contentZh !== message.content && (
                            <p className="mt-2 text-sm opacity-80">{message.contentZh}</p>
                          )}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <p className="text-xs font-medium mb-2">{t('accountingAssistant.suggestionsLabel')}:</p>
                              <ul className="text-sm space-y-1">
                                {message.suggestions.map((s, i) => (
                                  <li key={i}>• {s.title}: {s.description}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isAiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-4">
                          <IconLoader2 className="h-5 w-5 animate-spin" />
                        </div>
                      </div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Input Area */}
                <div className="flex gap-2 pt-4 border-t">
                  <Input
                    placeholder={t('accountingAssistant.askQuestion')}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isAiLoading}>
                    <IconSend className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Receipt Detail Dialog */}
        <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('accountingAssistant.receiptDetails')}</DialogTitle>
            </DialogHeader>
            {selectedReceipt && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">{t('accountingAssistant.merchant')}</Label>
                    <p className="font-medium">{selectedReceipt.vendor_name || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('accountingAssistant.date')}</Label>
                    <p className="font-medium">{selectedReceipt.receipt_date || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('accountingAssistant.receiptNo')}</Label>
                    <p className="font-medium">{selectedReceipt.receipt_number || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('accountingAssistant.category')}</Label>
                    <p className="font-medium">
                      {t(expenseCategoryKeys.find(c => c.value === selectedReceipt.category)?.i18nKey || 'accountingAssistant.categories.other')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('accountingAssistant.subtotal')}</Label>
                    <p className="font-medium">{selectedReceipt.currency} {selectedReceipt.subtotal?.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('accountingAssistant.tax')}</Label>
                    <p className="font-medium">{selectedReceipt.currency} {selectedReceipt.tax_amount?.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">{t('accountingAssistant.total')}</Label>
                    <p className="text-xl font-bold">{selectedReceipt.currency} {selectedReceipt.total_amount?.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Journal Entry */}
                {selectedReceipt.journal_entry_data && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{t('accountingAssistant.journalEntry')}</h4>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(selectedReceipt.journal_entry_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              {selectedReceipt && selectedReceipt.status !== 'APPROVED' && (
                <>
                  <Button variant="outline" onClick={() => handleCreateJournal(selectedReceipt.id)}>
                    <IconFileText className="mr-2 h-4 w-4" />
                    {t('accountingAssistant.createEntry')}
                  </Button>
                  <Button variant="outline" onClick={() => handleGetAiReview(selectedReceipt.id)}>
                    <IconBrain className="mr-2 h-4 w-4" />
                    {t('accountingAssistant.aiReview')}
                  </Button>
                  <Button onClick={() => handleApproveReceipt(selectedReceipt.id)}>
                    <IconCheck className="mr-2 h-4 w-4" />
                    {t('accountingAssistant.approve')}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
