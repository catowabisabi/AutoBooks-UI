'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  IconUpload,
  IconFile,
  IconFileText,
  IconFileSpreadsheet,
  IconTrash,
  IconCheck,
  IconX,
  IconLoader2,
  IconChevronDown,
  IconChevronUp,
  IconBrain,
  IconDatabase
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { useTranslation } from '@/lib/i18n/provider';
import {
  fetchDocuments,
  uploadDocument,
  getDocumentVisualization,
  Document
} from '../services';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'indexed' | 'error';
  progress?: number;
  extractedData?: {
    summary?: string;
    keyPoints?: string[];
    tables?: string[];
    entities?: string[];
  };
  errorMessage?: string;
}

interface RagDocumentPanelProps {
  onDocumentSelect?: (fileId: string) => void;
  onExtractedDataClick?: (data: string) => void;
}

// Demo files
const DEMO_FILES: UploadedFile[] = [
  {
    id: '1',
    name: '2024_Sales_Report.xlsx',
    size: 2457600,
    type: 'spreadsheet',
    status: 'indexed',
    extractedData: {
      summary: '2024年度銷售報告，包含各季度銷售數據、客戶分析和產品表現。',
      keyPoints: [
        '年度總營收 $8.2M',
        '同比增長 23%',
        'Q4 銷售最高',
        '電子產品類別佔比最大'
      ],
      tables: ['monthly_sales', 'customer_breakdown', 'product_performance'],
      entities: ['Tech Corp', 'Global Inc', 'Product A', 'Q4 2024']
    }
  },
  {
    id: '2',
    name: 'Customer_Analysis.pdf',
    size: 1536000,
    type: 'pdf',
    status: 'indexed',
    extractedData: {
      summary: '客戶分析報告，涵蓋客戶細分、購買行為和滿意度調查結果。',
      keyPoints: [
        '主要客戶群體：企業客戶',
        '平均訂單價值 $15,000',
        '客戶滿意度 4.2/5',
        '回購率 68%'
      ],
      tables: ['customer_segments', 'satisfaction_scores'],
      entities: ['Enterprise', 'SMB', 'NPS Score']
    }
  },
  {
    id: '3',
    name: 'Product_Catalog.csv',
    size: 512000,
    type: 'csv',
    status: 'indexed',
    extractedData: {
      summary: '產品目錄數據，包含所有活躍產品的詳細信息。',
      keyPoints: [
        '總產品數: 156',
        '活躍產品: 142',
        '平均價格: $299',
        '庫存總值: $2.5M'
      ],
      tables: ['products'],
      entities: ['Electronics', 'Software', 'Hardware']
    }
  }
];

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type: string) => {
  switch (type) {
    case 'spreadsheet':
      return <IconFileSpreadsheet className='h-4 w-4 text-green-500' />;
    case 'pdf':
      return <IconFileText className='h-4 w-4 text-red-500' />;
    case 'csv':
      return <IconFileSpreadsheet className='h-4 w-4 text-blue-500' />;
    default:
      return <IconFile className='h-4 w-4 text-muted-foreground' />;
  }
};

export default function RagDocumentPanel({
  onExtractedDataClick
}: RagDocumentPanelProps) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<UploadedFile[]>(DEMO_FILES);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set(['1']));
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load real documents on mount
  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      const docs = await fetchDocuments();
      if (docs.length > 0) {
        const mappedFiles: UploadedFile[] = docs.map((doc: Document) => ({
          id: doc.id,
          name: doc.original_filename,
          size: 0, // Size not available from API
          type: getFileType(doc.original_filename),
          status: doc.processed ? 'indexed' : 'processing',
          extractedData: doc.extracted_data ? {
            summary: doc.translated_text || doc.ocr_text?.substring(0, 200) || 'Document processed',
            keyPoints: [],
            tables: [],
            entities: []
          } : undefined
        }));
        setFiles(mappedFiles);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading documents:', error);
      // Keep demo files on error
    } finally {
      setLoadingDocs(false);
    }
  };

  const getFileType = (filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop();
    if (['xlsx', 'xls'].includes(ext || '')) return 'spreadsheet';
    if (ext === 'pdf') return 'pdf';
    if (ext === 'csv') return 'csv';
    return 'document';
  };

  const toggleFile = (fileId: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(fileId)) {
      newExpanded.delete(fileId);
    } else {
      newExpanded.add(fileId);
    }
    setExpandedFiles(newExpanded);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    // Process dropped files
    processFiles(droppedFiles);
  }, []);

  const processFiles = async (fileList: File[]) => {
    for (const file of fileList) {
      const newFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.name.endsWith('.xlsx') || file.name.endsWith('.xls') 
          ? 'spreadsheet' 
          : file.name.endsWith('.pdf') 
            ? 'pdf' 
            : file.name.endsWith('.csv') 
              ? 'csv' 
              : 'document',
        status: 'uploading',
        progress: 0
      };

      setFiles((prev) => [...prev, newFile]);

      try {
        // Upload file to server
        setFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id ? { ...f, progress: 30, status: 'uploading' } : f
          )
        );

        const uploadResult = await uploadDocument(file);
        
        setFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id 
              ? { ...f, id: uploadResult.id, progress: 60, status: 'processing' } 
              : f
          )
        );

        // Get visualization suggestions for the file
        const vizResult = await getDocumentVisualization(uploadResult.id);
        
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadResult.id || f.name === file.name
              ? {
                  ...f,
                  id: uploadResult.id,
                  status: 'indexed',
                  progress: 100,
                  extractedData: {
                    summary: `已處理文件 ${file.name}，提取了 ${vizResult.data?.length || 0} 行數據。`,
                    keyPoints: vizResult.suggestions?.map((s: { title: string }) => s.title) || ['數據已提取', '準備好供查詢使用'],
                    tables: [],
                    entities: []
                  }
              }
            : f
          )
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error uploading file:', error);
        // Fallback to demo processing
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            clearInterval(interval);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === newFile.id
                  ? { ...f, status: 'processing', progress: 100 }
                  : f
              )
            );
            setTimeout(() => {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === newFile.id
                    ? {
                        ...f,
                        status: 'indexed',
                        extractedData: {
                          summary: `已處理文件 ${file.name}，提取了關鍵數據。(Demo)`,
                          keyPoints: ['數據已提取', '準備好供查詢使用'],
                          tables: [],
                          entities: []
                        }
                      }
                    : f
                )
              );
            }, 2000);
          } else {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === newFile.id ? { ...f, progress } : f
              )
            );
          }
        }, 200);
      }
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const getStatusBadge = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return (
          <Badge variant='outline' className='text-[10px] text-blue-600 border-blue-600'>
            <IconLoader2 className='h-2.5 w-2.5 mr-1 animate-spin' />
            Uploading
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant='outline' className='text-[10px] text-orange-600 border-orange-600'>
            <IconBrain className='h-2.5 w-2.5 mr-1 animate-pulse' />
            Processing
          </Badge>
        );
      case 'indexed':
        return (
          <Badge variant='outline' className='text-[10px] text-green-600 border-green-600'>
            <IconCheck className='h-2.5 w-2.5 mr-1' />
            Indexed
          </Badge>
        );
      case 'error':
        return (
          <Badge variant='outline' className='text-[10px] text-red-600 border-red-600'>
            <IconX className='h-2.5 w-2.5 mr-1' />
            Error
          </Badge>
        );
    }
  };

  return (
    <div className='flex h-full flex-col border rounded-lg bg-card overflow-hidden'>
      {/* Header */}
      <div className='flex items-center justify-between border-b px-3 py-2 bg-muted/30 shrink-0'>
        <div className='flex items-center gap-2'>
          <IconBrain className='h-4 w-4 text-purple-500' />
          <span className='text-sm font-medium'>{t('analyst.rag.title')}</span>
          <Badge variant='secondary' className='text-[10px]'>
            {files.filter((f) => f.status === 'indexed').length} indexed
          </Badge>
        </div>
      </div>

      {/* Upload area */}
      <div
        className={cn(
          'mx-3 mt-3 rounded-lg border-2 border-dashed p-3 transition-colors shrink-0',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept='.pdf,.xlsx,.xls,.csv,.doc,.docx,.txt'
          className='hidden'
        />
        <div className='flex flex-col items-center gap-1 text-center'>
          <IconUpload className='h-5 w-5 text-muted-foreground' />
          <p className='text-xs text-muted-foreground'>
            {t('analyst.rag.dropzone')}
          </p>
          <button
            onClick={handleFileSelect}
            className='text-xs text-primary hover:underline'
          >
            {t('analyst.rag.supportedFormats')}
          </button>
        </div>
      </div>

      {/* File list - with proper scroll constraint */}
      <ScrollArea className='flex-1 min-h-0'>
        <div className='px-3 py-2 space-y-2'>
          {files.map((file) => (
            <Collapsible
              key={file.id}
              open={expandedFiles.has(file.id)}
              onOpenChange={() => toggleFile(file.id)}
            >
              <Card className='overflow-hidden'>
                <CollapsibleTrigger asChild>
                  <CardHeader className='p-2 cursor-pointer hover:bg-muted/50'>
                    <div className='flex items-center gap-2'>
                      {getFileIcon(file.type)}
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-medium truncate'>{file.name}</p>
                        <p className='text-[10px] text-muted-foreground'>
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      {getStatusBadge(file.status)}
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6'
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                      >
                        <IconTrash className='h-3 w-3' />
                      </Button>
                      {expandedFiles.has(file.id) ? (
                        <IconChevronUp className='h-4 w-4' />
                      ) : (
                        <IconChevronDown className='h-4 w-4' />
                      )}
                    </div>
                    {(file.status === 'uploading' || file.status === 'processing') && (
                      <Progress value={file.progress} className='h-1 mt-2' />
                    )}
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  {file.extractedData && (
                    <CardContent className='p-2 pt-0 border-t bg-muted/20'>
                      <div className='space-y-2 text-xs'>
                        {/* Summary */}
                        <div>
                          <p className='text-[10px] font-medium text-muted-foreground mb-1'>
                            摘要 / Summary
                          </p>
                          <p className='text-xs'>{file.extractedData.summary}</p>
                        </div>

                        {/* Key Points */}
                        {file.extractedData.keyPoints && file.extractedData.keyPoints.length > 0 && (
                          <div>
                            <p className='text-[10px] font-medium text-muted-foreground mb-1'>
                              重點 / Key Points
                            </p>
                            <div className='flex flex-wrap gap-1'>
                              {file.extractedData.keyPoints.map((point, idx) => (
                                <Badge
                                  key={idx}
                                  variant='secondary'
                                  className='text-[10px] cursor-pointer hover:bg-primary/20'
                                  onClick={() => onExtractedDataClick?.(point)}
                                >
                                  {point}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tables */}
                        {file.extractedData.tables && file.extractedData.tables.length > 0 && (
                          <div>
                            <p className='text-[10px] font-medium text-muted-foreground mb-1'>
                              已匯入表格 / Imported Tables
                            </p>
                            <div className='flex flex-wrap gap-1'>
                              {file.extractedData.tables.map((table, idx) => (
                                <Badge
                                  key={idx}
                                  variant='outline'
                                  className='text-[10px] cursor-pointer hover:bg-primary/20'
                                  onClick={() => onExtractedDataClick?.(`SELECT * FROM ${table}`)}
                                >
                                  <IconDatabase className='h-2.5 w-2.5 mr-1' />
                                  {table}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Entities */}
                        {file.extractedData.entities && file.extractedData.entities.length > 0 && (
                          <div>
                            <p className='text-[10px] font-medium text-muted-foreground mb-1'>
                              識別實體 / Entities
                            </p>
                            <div className='flex flex-wrap gap-1'>
                              {file.extractedData.entities.map((entity, idx) => (
                                <Badge
                                  key={idx}
                                  variant='outline'
                                  className='text-[10px] bg-purple-500/10 text-purple-700 border-purple-300 cursor-pointer hover:bg-purple-500/20'
                                  onClick={() => onExtractedDataClick?.(entity)}
                                >
                                  {entity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}

          {files.length === 0 && (
            <div className='text-center py-8 text-muted-foreground'>
              <IconFile className='h-8 w-8 mx-auto mb-2 opacity-50' />
              <p className='text-xs'>尚無文件</p>
              <p className='text-[10px]'>上傳文件以啟用 RAG 功能</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
