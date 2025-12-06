'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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

// Processing steps
const processingSteps = [
  { key: 'upload', en: 'Uploading image', zh: '上傳圖片' },
  { key: 'analyze', en: 'AI analyzing receipt', zh: 'AI 分析收據' },
  { key: 'categorize', en: 'Auto-categorizing expense', zh: '自動分類費用' },
  { key: 'journal', en: 'Generating journal entry', zh: '生成會計分錄' },
  { key: 'review', en: 'AI reviewing for errors', zh: 'AI 檢查錯誤' },
];

// Expense categories with translations
const expenseCategories = [
  { value: 'MEALS', en: 'Meals & Entertainment', zh: '餐飲娛樂' },
  { value: 'TRANSPORT', en: 'Transportation', zh: '交通運輸' },
  { value: 'SUPPLIES', en: 'Office Supplies', zh: '辦公用品' },
  { value: 'UTILITIES', en: 'Utilities', zh: '水電費' },
  { value: 'RENT', en: 'Rent', zh: '租金' },
  { value: 'SERVICES', en: 'Professional Services', zh: '專業服務' },
  { value: 'EQUIPMENT', en: 'Equipment', zh: '設備' },
  { value: 'TRAVEL', en: 'Travel', zh: '差旅' },
  { value: 'INSURANCE', en: 'Insurance', zh: '保險' },
  { value: 'OTHER', en: 'Other', zh: '其他' },
];

// Status badges
const statusConfig: Record<string, { color: string; en: string; zh: string }> = {
  PENDING: { color: 'secondary', en: 'Pending', zh: '待處理' },
  ANALYZING: { color: 'warning', en: 'Analyzing', zh: '分析中' },
  ANALYZED: { color: 'info', en: 'Analyzed', zh: '已分析' },
  CATEGORIZED: { color: 'info', en: 'Categorized', zh: '已分類' },
  JOURNAL_CREATED: { color: 'success', en: 'Journal Created', zh: '已建分錄' },
  APPROVED: { color: 'success', en: 'Approved', zh: '已核准' },
  REJECTED: { color: 'destructive', en: 'Rejected', zh: '已拒絕' },
  ERROR: { color: 'destructive', en: 'Error', zh: '錯誤' },
};

export default function AccountingAssistantPage() {
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
    setUploadProgress({ step: 'upload', progress: 10, message: 'Uploading...', messageZh: '上傳中...' });
    
    try {
      // Upload and process
      const result = await uploadReceipt(selectedFile, 'auto', true, true);
      
      // Simulate progress updates
      for (let i = 0; i < processingSteps.length; i++) {
        setUploadProgress({
          step: processingSteps[i].key,
          progress: ((i + 1) / processingSteps.length) * 100,
          message: processingSteps[i].en,
          messageZh: processingSteps[i].zh,
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
        message: error.message || 'Upload failed',
        messageZh: '上傳失敗',
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
        (completed, total, currentFile) => {
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
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer?.en || result.answer || 'No response',
        contentZh: result.answer?.zh,
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
            <h1 className="text-3xl font-bold tracking-tight">Accounting Assistant / 會計助手</h1>
            <p className="text-muted-foreground">
              AI-powered receipt scanning, categorization, and accounting automation
              <br />
              AI 驅動的收據掃描、分類和會計自動化
            </p>
          </div>
          <Button variant="outline" onClick={() => { loadReceipts(); loadStats(); }}>
            <IconRefresh className="mr-2 h-4 w-4" />
            Refresh / 重新整理
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Receipts / 總收據數
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_receipts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Amount / 總金額
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
                  Pending Approval / 待審核
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
                  Recent (30 days) / 近30天
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
              Upload / 上傳
            </TabsTrigger>
            <TabsTrigger value="receipts">
              <IconReceipt className="mr-2 h-4 w-4" />
              Receipts / 收據
            </TabsTrigger>
            <TabsTrigger value="compare">
              <IconArrowsExchange className="mr-2 h-4 w-4" />
              Compare / 比對
            </TabsTrigger>
            <TabsTrigger value="reports">
              <IconReport className="mr-2 h-4 w-4" />
              Reports / 報表
            </TabsTrigger>
            <TabsTrigger value="ai-chat">
              <IconRobot className="mr-2 h-4 w-4" />
              AI Chat / AI 對話
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Area */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <IconUpload className="inline mr-2 h-5 w-5" />
                    Upload Receipt / 上傳收據
                  </CardTitle>
                  <CardDescription>
                    Upload a receipt image for AI analysis and automatic categorization
                    <br />
                    上傳收據圖片進行 AI 分析和自動分類
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
                          Click to upload or drag and drop
                          <br />
                          點擊上傳或拖放
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
                        {uploadProgress.message} / {uploadProgress.messageZh}
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
                        Processing... / 處理中...
                      </>
                    ) : (
                      <>
                        <IconBrain className="mr-2 h-4 w-4" />
                        Analyze with AI / AI 分析
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
                    Analysis Result / 分析結果
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
                            Success / 成功
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <IconX className="mr-1 h-3 w-3" />
                            Error / 錯誤
                          </Badge>
                        )}
                      </div>
                      
                      {/* Receipt Data */}
                      {processingResult.receipt && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <Label className="text-muted-foreground">Vendor / 商家</Label>
                              <p className="font-medium">{processingResult.receipt.vendor_name || '-'}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Date / 日期</Label>
                              <p className="font-medium">{processingResult.receipt.receipt_date || '-'}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Amount / 金額</Label>
                              <p className="font-medium">
                                {processingResult.receipt.currency} {processingResult.receipt.total_amount?.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Category / 類別</Label>
                              <p className="font-medium">
                                {expenseCategories.find(c => c.value === processingResult.receipt?.category)?.zh || 
                                 processingResult.receipt.category || '-'}
                              </p>
                            </div>
                          </div>
                          
                          {/* AI Suggestions */}
                          {processingResult.receipt.ai_suggestions && processingResult.receipt.ai_suggestions.length > 0 && (
                            <Alert>
                              <IconBrain className="h-4 w-4" />
                              <AlertTitle>AI Suggestions / AI 建議</AlertTitle>
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
                              <Label className="text-muted-foreground">AI Confidence / AI 信心度</Label>
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
                      <p>Upload a receipt to see the analysis</p>
                      <p className="text-sm">上傳收據以查看分析結果</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Receipts Tab */}
          <TabsContent value="receipts">
            <Card>
              <CardHeader>
                <CardTitle>
                  <IconReceipt className="inline mr-2 h-5 w-5" />
                  Receipt List / 收據列表
                </CardTitle>
                <CardDescription>
                  View and manage all uploaded receipts
                  <br />
                  查看和管理所有上傳的收據
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
                    <p>No receipts found</p>
                    <p className="text-sm">尚無收據記錄</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date / 日期</TableHead>
                        <TableHead>Vendor / 商家</TableHead>
                        <TableHead>Category / 類別</TableHead>
                        <TableHead className="text-right">Amount / 金額</TableHead>
                        <TableHead>Status / 狀態</TableHead>
                        <TableHead>Actions / 操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipts.map((receipt) => (
                        <TableRow key={receipt.id}>
                          <TableCell>{receipt.receipt_date || '-'}</TableCell>
                          <TableCell>{receipt.vendor_name || '-'}</TableCell>
                          <TableCell>
                            {expenseCategories.find(c => c.value === receipt.category)?.zh || receipt.category || '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {receipt.currency} {receipt.total_amount?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig[receipt.status]?.color as any || 'secondary'}>
                              {statusConfig[receipt.status]?.zh || receipt.status}
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
                    Upload Excel for Comparison / 上傳 Excel 進行比對
                  </CardTitle>
                  <CardDescription>
                    Compare your Excel records with database entries
                    <br />
                    將您的 Excel 記錄與資料庫項目進行比對
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
                          Click to upload Excel file
                          <br />
                          點擊上傳 Excel 檔案
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
                        Comparing... / 比對中...
                      </>
                    ) : (
                      <>
                        <IconArrowsExchange className="mr-2 h-4 w-4" />
                        Start Comparison / 開始比對
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
                    Comparison Results / 比對結果
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {comparisonResult ? (
                    <div className="space-y-4">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold text-green-500">{comparisonResult.summary?.matched_count || 0}</p>
                          <p className="text-sm text-muted-foreground">Matched / 匹配</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold text-red-500">
                            {(comparisonResult.summary?.missing_in_db_count || 0) + (comparisonResult.summary?.missing_in_excel_count || 0)}
                          </p>
                          <p className="text-sm text-muted-foreground">Differences / 差異</p>
                        </div>
                      </div>
                      
                      {/* Health Score */}
                      {comparisonResult.comparison?.health_score !== undefined && (
                        <div>
                          <Label className="text-muted-foreground">Data Health Score / 資料健康度</Label>
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
                          <AlertTitle>AI Analysis / AI 分析</AlertTitle>
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
                      <p>Upload an Excel file to compare</p>
                      <p className="text-sm">上傳 Excel 檔案以進行比對</p>
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
                    Create Report / 建立報表
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Report Title / 報表標題</Label>
                    <Input
                      placeholder="Monthly Expense Report / 月度費用報表"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Period Start / 開始日期</Label>
                    <Input
                      type="date"
                      value={reportPeriod.start}
                      onChange={(e) => setReportPeriod(prev => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Period End / 結束日期</Label>
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
                        Creating... / 建立中...
                      </>
                    ) : (
                      <>
                        <IconFileSpreadsheet className="mr-2 h-4 w-4" />
                        Generate Report / 生成報表
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
                    Reports / 報表列表
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reports.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <IconReport className="mx-auto h-12 w-12 mb-2" />
                      <p>No reports created yet</p>
                      <p className="text-sm">尚未建立任何報表</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title / 標題</TableHead>
                          <TableHead>Period / 期間</TableHead>
                          <TableHead className="text-right">Amount / 金額</TableHead>
                          <TableHead>Status / 狀態</TableHead>
                          <TableHead>Actions / 操作</TableHead>
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
                                {report.status === 'APPROVED' ? '已核准' : report.status === 'DRAFT' ? '草稿' : report.status}
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
                  AI Accounting Assistant / AI 會計助手
                </CardTitle>
                <CardDescription>
                  Ask questions about accounting, receipts, or get suggestions
                  <br />
                  詢問有關會計、收據的問題，或獲取建議
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <IconMessageCircle className="mx-auto h-12 w-12 mb-4" />
                        <p className="mb-2">Start a conversation with the AI assistant</p>
                        <p className="text-sm mb-4">開始與 AI 助手對話</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {[
                            'How should I categorize office supplies?',
                            '如何處理營業稅？',
                            'What is double-entry bookkeeping?',
                            '差旅費報銷流程是什麼？',
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
                              <p className="text-xs font-medium mb-2">Suggestions / 建議:</p>
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
                    placeholder="Ask a question about accounting... / 詢問會計相關問題..."
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
              <DialogTitle>Receipt Details / 收據詳情</DialogTitle>
            </DialogHeader>
            {selectedReceipt && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Vendor / 商家</Label>
                    <p className="font-medium">{selectedReceipt.vendor_name || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date / 日期</Label>
                    <p className="font-medium">{selectedReceipt.receipt_date || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Receipt No. / 收據號碼</Label>
                    <p className="font-medium">{selectedReceipt.receipt_number || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Category / 類別</Label>
                    <p className="font-medium">
                      {expenseCategories.find(c => c.value === selectedReceipt.category)?.zh || selectedReceipt.category || '-'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Subtotal / 小計</Label>
                    <p className="font-medium">{selectedReceipt.currency} {selectedReceipt.subtotal?.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Tax / 稅額</Label>
                    <p className="font-medium">{selectedReceipt.currency} {selectedReceipt.tax_amount?.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Total / 總計</Label>
                    <p className="text-xl font-bold">{selectedReceipt.currency} {selectedReceipt.total_amount?.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Journal Entry */}
                {selectedReceipt.journal_entry_data && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Journal Entry / 會計分錄</h4>
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
                    Create Journal / 建立分錄
                  </Button>
                  <Button variant="outline" onClick={() => handleGetAiReview(selectedReceipt.id)}>
                    <IconBrain className="mr-2 h-4 w-4" />
                    AI Review / AI 審核
                  </Button>
                  <Button onClick={() => handleApproveReceipt(selectedReceipt.id)}>
                    <IconCheck className="mr-2 h-4 w-4" />
                    Approve / 核准
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
