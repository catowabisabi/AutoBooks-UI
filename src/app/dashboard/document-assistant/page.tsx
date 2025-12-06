'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  IconPlus,
  IconSend,
  IconEdit,
  IconMessage,
  IconDownload,
  IconUpload,
  IconFile,
  IconFileText,
  IconSearch,
  IconX,
  IconLoader2,
  IconTrash,
  IconRefresh,
  IconFileSpreadsheet,
  IconPhoto,
  IconEye,
  IconRobot,
} from '@tabler/icons-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { aiApi, assistantsApi } from '@/lib/api';
import { MultiFileUploader, FileWithStatus, DOCUMENT_ACCEPT_TYPES } from '@/components/multi-file-uploader';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n/provider';

// Types
type DocumentType = 'pdf' | 'doc' | 'txt' | 'image' | 'excel' | 'csv';
type MessageRole = 'user' | 'assistant';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  document?: {
    id: string;
    name: string;
  };
}

interface ProcessedDocument {
  id: string;
  name: string;
  type: DocumentType;
  size: string;
  uploadedAt: string;
  documentId?: string;
  status: 'processing' | 'ready' | 'error';
  error?: string;
}

interface Folder {
  id: string;
  name: string;
  documents: number;
}

// Helper to get document type from file
function getDocumentType(file: File): DocumentType {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type.includes('spreadsheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) return 'excel';
  if (file.type === 'text/csv' || file.name.endsWith('.csv')) return 'csv';
  if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) return 'doc';
  return 'txt';
}

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Document type icons
const documentTypeIcons: Record<DocumentType, { icon: typeof IconFile; color: string }> = {
  pdf: { icon: IconFileText, color: 'text-red-500' },
  doc: { icon: IconFileText, color: 'text-blue-500' },
  txt: { icon: IconFileText, color: 'text-gray-500' },
  image: { icon: IconPhoto, color: 'text-green-500' },
  excel: { icon: IconFileSpreadsheet, color: 'text-emerald-600' },
  csv: { icon: IconFileSpreadsheet, color: 'text-emerald-600' },
};

// Initial folders - will be initialized with translations in component
const getInitialFolders = (t: (key: string) => string): Folder[] => [
  { id: 'all', name: t('documentAssistant.allDocuments'), documents: 0 },
  { id: 'receipts', name: t('documentAssistant.receipts'), documents: 0 },
  { id: 'invoices', name: t('documentAssistant.invoices'), documents: 0 },
  { id: 'contracts', name: t('documentAssistant.contracts'), documents: 0 },
  { id: 'reports', name: t('documentAssistant.reports'), documents: 0 },
];

// Document Item Component
interface DocumentItemProps {
  document: ProcessedDocument;
  onSelect: (document: ProcessedDocument) => void;
  onDelete: (document: ProcessedDocument) => void;
  t: (key: string) => string;
}

function DocumentItem({ document, onSelect, onDelete, t }: DocumentItemProps) {
  const typeConfig = documentTypeIcons[document.type];
  const Icon = typeConfig.icon;

  return (
    <Card
      className={cn(
        'hover:bg-muted/50 cursor-pointer transition-colors',
        document.status === 'error' && 'border-red-200',
        document.status === 'processing' && 'border-blue-200'
      )}
      onClick={() => document.status === 'ready' && onSelect(document)}
    >
      <CardContent className='p-4'>
        <div className='flex items-start gap-3'>
          <div className={cn('mt-1 text-2xl', typeConfig.color)}>
            <Icon className='h-6 w-6' />
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <h3 className='font-medium truncate'>{document.name}</h3>
              {document.status === 'processing' && (
                <IconLoader2 className='h-4 w-4 animate-spin text-blue-500' />
              )}
              {document.status === 'error' && (
                <Badge variant='destructive' className='text-xs'>{t('documentAssistant.error')}</Badge>
              )}
              {document.status === 'ready' && document.documentId && (
                <Badge variant='outline' className='text-xs'>{t('documentAssistant.ready')}</Badge>
              )}
            </div>
            <div className='text-muted-foreground mt-1 flex text-xs gap-2'>
              <span>{document.size}</span>
              <span>•</span>
              <span>{document.uploadedAt}</span>
              {document.documentId && (
                <>
                  <span>•</span>
                  <span className='text-green-600'>ID: {document.documentId.slice(0, 8)}...</span>
                </>
              )}
            </div>
            {document.error && (
              <p className='text-xs text-red-500 mt-1'>{document.error}</p>
            )}
          </div>
          <div className='flex gap-1'>
            {document.status === 'ready' && (
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(document);
                }}
              >
                <IconEye className='h-4 w-4' />
              </Button>
            )}
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-destructive'
              onClick={(e) => {
                e.stopPropagation();
                onDelete(document);
              }}
            >
              <IconTrash className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Chat message component
interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={cn(
        'mb-4 flex max-w-[90%] flex-col',
        message.role === 'user' ? 'ml-auto' : 'mr-auto'
      )}
    >
      <div
        className={cn(
          'rounded-lg p-3',
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <p className='whitespace-pre-line'>{message.content}</p>

        {message.document && (
          <div className='mt-3'>
            <Card className='mt-2'>
              <CardHeader className='py-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-sm'>
                    {message.document.name}
                  </CardTitle>
                  <Button variant='ghost' size='icon' className='h-8 w-8'>
                    <IconDownload className='h-4 w-4' />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DocumentAssistantPage() {
  const { t } = useTranslation();
  const [folders, setFolders] = useState(() => getInitialFolders(t));
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentFolder, setCurrentFolder] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // UI states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ProcessedDocument | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'upload'>('documents');

  // Upload states
  const [uploadFiles, setUploadFiles] = useState<FileWithStatus[]>([]);
  const [defaultQuery, setDefaultQuery] = useState('');

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter documents for current folder
  const filteredDocuments = documents.filter(doc => {
    if (currentFolder === 'all') return true;
    const folderName = folders.find(f => f.id === currentFolder)?.name.toLowerCase() || '';
    return doc.name.toLowerCase().includes(currentFolder) || 
           (currentFolder === 'receipts' && doc.type === 'image') ||
           (currentFolder === 'invoices' && doc.type === 'pdf') ||
           (currentFolder === 'reports' && (doc.type === 'excel' || doc.type === 'csv'));
  }).filter(doc => {
    if (!searchQuery) return true;
    return doc.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Update folder counts
  useEffect(() => {
    setFolders(prev => prev.map(folder => ({
      ...folder,
      documents: folder.id === 'all' 
        ? documents.length 
        : documents.filter(doc => {
            if (folder.id === 'receipts') return doc.type === 'image';
            if (folder.id === 'invoices') return doc.type === 'pdf';
            if (folder.id === 'reports') return doc.type === 'excel' || doc.type === 'csv';
            return doc.name.toLowerCase().includes(folder.id);
          }).length
    })));
  }, [documents]);

  // Handle single file upload
  const handleUploadSingle = useCallback(async (file: FileWithStatus, index: number): Promise<{ document_id?: string; query_result?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (defaultQuery) {
      formData.append('query', defaultQuery);
    } else {
      // Default query based on file type
      const docType = getDocumentType(file);
      let autoQuery = 'Summarize the key information in this document.';
      if (docType === 'image') {
        autoQuery = 'Analyze this image and extract any text, numbers, or key information.';
      } else if (docType === 'excel' || docType === 'csv') {
        autoQuery = 'Analyze this spreadsheet and summarize the key data and patterns.';
      }
      formData.append('query', autoQuery);
    }

    try {
      const response = await assistantsApi.documentProcess(formData);
      
      // Add to documents list
      const newDoc: ProcessedDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: getDocumentType(file),
        size: formatFileSize(file.size),
        uploadedAt: new Date().toLocaleDateString(),
        documentId: response.document_id,
        status: 'ready',
      };
      
      setDocuments(prev => [...prev, newDoc]);

      return {
        document_id: response.document_id,
        query_result: response.query_result,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }, [defaultQuery]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: newMessage
    };

    setMessages([...messages, userMessage]);
    const currentMessage = newMessage;
    setNewMessage('');
    setIsLoading(true);

    try {
      // If a document is selected, query about that specific document
      if (selectedDocument?.documentId) {
        const response = await assistantsApi.documentQuery(selectedDocument.documentId, currentMessage);
        
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: response.query_result || response.response || 'Analysis complete.',
          document: {
            id: selectedDocument.id,
            name: selectedDocument.name
          }
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // General document assistant chat
        const docContext = selectedDocument 
          ? `The user is asking about the document "${selectedDocument.name}".`
          : 'The user is asking about their documents in general.';

        const systemPrompt = `You are a helpful document assistant. ${docContext} Help users analyze, summarize, and find information in their documents.`;

        const conversationHistory = messages.slice(-6).map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }));
        conversationHistory.push({ role: 'user', content: currentMessage });

        const response = await aiApi.chatWithHistory(
          conversationHistory,
          'openai',
          { systemPrompt }
        );

        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: response.content || 'I can help you analyze documents. Please upload some documents first.',
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('AI response error:', error);
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document selection
  const handleSelectDocument = (document: ProcessedDocument) => {
    setSelectedDocument(document);
    setIsChatOpen(true);

    // Add initial message
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: `I've loaded "${document.name}". You can now ask me questions about this document.\n\nDocument ID: ${document.documentId}\nType: ${document.type.toUpperCase()}\nSize: ${document.size}`,
      document: {
        id: document.id,
        name: document.name
      }
    };
    setMessages([aiMessage]);
  };

  // Handle document deletion
  const handleDeleteDocument = (document: ProcessedDocument) => {
    setDocuments(prev => prev.filter(d => d.id !== document.id));
    if (selectedDocument?.id === document.id) {
      setSelectedDocument(null);
    }
    toast.success(`${document.name} deleted / 已刪除`);
  };

  // Handle creating a new folder
  const handleCreateFolder = () => {
    const newFolder = {
      id: `folder-${Date.now()}`,
      name: `New Folder ${folders.length}`,
      documents: 0
    };

    setFolders([...folders, newFolder]);
    setCurrentFolder(newFolder.id);
  };

  // Handle renaming a folder
  const handleStartRename = (folder: Folder) => {
    setEditingFolder(folder.id);
    setFolderName(folder.name);
  };

  const handleSaveRename = () => {
    if (!folderName.trim()) return;

    setFolders(
      folders.map((folder) =>
        folder.id === editingFolder ? { ...folder, name: folderName } : folder
      )
    );

    setEditingFolder(null);
  };

  return (
    <PageContainer>
      <div className='flex h-[calc(100vh-10rem)] w-full'>
        {/* Folders Sidebar */}
        <div className='border-border mr-4 w-[250px] overflow-y-auto border-r pr-2'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='font-medium'>{t('documentAssistant.folders')}</h3>
            <Button onClick={handleCreateFolder} size='sm' variant='ghost'>
              <IconPlus className='h-4 w-4' />
            </Button>
          </div>

          <div className='space-y-1'>
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={cn(
                  'group flex items-center justify-between rounded-md p-2',
                  currentFolder === folder.id ? 'bg-muted' : 'hover:bg-muted/50'
                )}
              >
                {editingFolder === folder.id ? (
                  <div className='flex w-full items-center gap-2'>
                    <Input
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                      className='h-7 text-sm'
                      autoFocus
                    />
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-7 w-7'
                      onClick={handleSaveRename}
                    >
                      <IconX className='h-4 w-4' />
                    </Button>
                  </div>
                ) : (
                  <>
                    <button
                      className='flex-1 truncate text-left text-sm font-medium'
                      onClick={() => setCurrentFolder(folder.id)}
                    >
                      {folder.name}
                      <span className='text-muted-foreground ml-1 text-xs'>
                        ({folder.documents})
                      </span>
                    </button>
                    {folder.id !== 'all' && (
                      <Button
                        size='icon'
                        variant='ghost'
                        className='h-7 w-7 opacity-0 group-hover:opacity-100'
                        onClick={() => handleStartRename(folder)}
                      >
                        <IconEdit className='h-3.5 w-3.5' />
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className='flex flex-1 flex-col overflow-hidden'>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'documents' | 'upload')} className='flex-1 flex flex-col'>
            <div className='mb-4 flex items-center justify-between'>
              <TabsList>
                <TabsTrigger value='documents'>
                  <IconFile className='h-4 w-4 mr-2' />
                  {t('documentAssistant.documentsTab')}
                </TabsTrigger>
                <TabsTrigger value='upload'>
                  <IconUpload className='h-4 w-4 mr-2' />
                  {t('documentAssistant.uploadTab')}
                </TabsTrigger>
              </TabsList>

              <div className='flex items-center space-x-2'>
                {activeTab === 'documents' && (
                  <div className='relative w-64'>
                    <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                    <Input
                      placeholder={t('documentAssistant.searchDocuments')}
                      className='pl-8'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                )}
                <Button onClick={() => setActiveTab('upload')}>
                  <IconUpload className='mr-2 h-4 w-4' />
                  {t('documentAssistant.uploadTab')}
                </Button>
              </div>
            </div>

            {/* Documents Tab */}
            <TabsContent value='documents' className='flex-1 overflow-hidden mt-0'>
              <ScrollArea className='h-full'>
                <div className='grid grid-cols-1 gap-4 p-1'>
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((document) => (
                      <DocumentItem
                        key={document.id}
                        document={document}
                        onSelect={handleSelectDocument}
                        onDelete={handleDeleteDocument}
                        t={t}
                      />
                    ))
                  ) : (
                    <div className='bg-muted/20 border-muted col-span-1 flex h-64 flex-col items-center justify-center rounded-lg border border-dashed'>
                      <IconFile className='h-12 w-12 text-muted-foreground mb-4' />
                      <p className='text-muted-foreground mb-4'>
                        {searchQuery 
                          ? t('documentAssistant.noDocumentsFound')
                          : t('documentAssistant.noDocuments')}
                      </p>
                      <Button onClick={() => setActiveTab('upload')}>
                        <IconUpload className='mr-2 h-4 w-4' />
                        {t('documentAssistant.uploadDocument')}
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value='upload' className='flex-1 overflow-hidden mt-0'>
              <Card className='h-full'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <IconUpload className='h-5 w-5' />
                    {t('documentAssistant.bulkUpload')}
                  </CardTitle>
                  <CardDescription>
                    {t('documentAssistant.supportedFormats')}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Default Query */}
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>
                      {t('documentAssistant.defaultQueryLabel')}
                    </label>
                    <Textarea
                      placeholder={t('documentAssistant.defaultQueryPlaceholder')}
                      value={defaultQuery}
                      onChange={(e) => setDefaultQuery(e.target.value)}
                      className='min-h-[80px]'
                    />
                    <p className='text-xs text-muted-foreground'>
                      {t('documentAssistant.defaultQueryHint')}
                    </p>
                  </div>

                  {/* Multi-File Uploader */}
                  <MultiFileUploader
                    value={uploadFiles}
                    onValueChange={setUploadFiles}
                    onUploadSingle={handleUploadSingle}
                    maxFiles={20}
                    maxSize={50 * 1024 * 1024}
                    showUploadButton={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Chat Button */}
      <Button
        className='fixed right-6 bottom-6 h-14 w-14 rounded-full shadow-lg'
        onClick={() => setIsChatOpen(true)}
      >
        <IconRobot className='h-6 w-6' />
      </Button>

      {/* Chat Panel (Sheet) */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent
          side='right'
          className='flex h-full w-[400px] flex-col p-0 sm:w-[540px]'
        >
          <SheetHeader className='border-border shrink-0 border-b p-4'>
            <SheetTitle className='flex items-center gap-2'>
              <IconRobot className='h-5 w-5' />
              {t('documentAssistant.title')}
            </SheetTitle>
            <SheetDescription>
              {selectedDocument 
                ? `${t('documentAssistant.analyzing')}: ${selectedDocument.name}`
                : t('documentAssistant.description')}
            </SheetDescription>
            {selectedDocument && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSelectedDocument(null)}
                className='mt-2'
              >
                <IconX className='h-4 w-4 mr-1' />
                {t('documentAssistant.clearSelection')}
              </Button>
            )}
          </SheetHeader>

          <ScrollArea className='flex-1 overflow-auto p-4'>
            <div className='flex flex-col'>
              {messages.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8'>
                  <IconMessage className='h-12 w-12 mb-4' />
                  <p>{t('documentAssistant.startConversation')}</p>
                  <p className='text-sm mt-2'>
                    {t('documentAssistant.selectDocument')}
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))
              )}
              {isLoading && (
                <div className='flex items-center gap-2 text-muted-foreground p-3'>
                  <IconLoader2 className='h-4 w-4 animate-spin' />
                  <span>{t('documentAssistant.thinking')}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className='border-border mt-auto shrink-0 border-t p-4'>
            <div className='flex gap-2'>
              <Input
                placeholder={t('documentAssistant.askAboutDocument')}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} size='icon' disabled={isLoading || !newMessage.trim()}>
                {isLoading ? (
                  <IconLoader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <IconSend className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
