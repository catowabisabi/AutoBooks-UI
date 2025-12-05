'use client';

import { useState, useRef, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  IconLoader2
} from '@tabler/icons-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { aiApi } from '@/lib/api';

// Types
type DocumentType = 'pdf' | 'doc' | 'txt' | 'image';
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

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: string;
  lastModified: string;
  tags: string[];
  content?: string;
  folderId: string;
}

interface Folder {
  id: string;
  name: string;
  documents: number;
}

// Mock data for folders
const initialFolders: Folder[] = [
  { id: 'important', name: 'Important Documents', documents: 5 },
  { id: 'contracts', name: 'Contracts', documents: 3 },
  { id: 'reports', name: 'Reports', documents: 7 }
];

// Mock data for documents
const initialDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Annual Report 2023.pdf',
    type: 'pdf',
    size: '2.4 MB',
    lastModified: '2023-12-15',
    tags: ['report', 'finance'],
    folderId: 'reports'
  },
  {
    id: 'doc-2',
    name: 'Client Contract.doc',
    type: 'doc',
    size: '1.2 MB',
    lastModified: '2023-11-20',
    tags: ['legal', 'contract'],
    folderId: 'contracts'
  },
  {
    id: 'doc-3',
    name: 'Meeting Notes.txt',
    type: 'txt',
    size: '45 KB',
    lastModified: '2023-12-10',
    tags: ['notes', 'meeting'],
    folderId: 'important'
  }
];

// Mock chat messages
const initialMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Can you summarize the annual report?'
  },
  {
    id: '2',
    role: 'assistant',
    content:
      "I've analyzed the annual report and here are the key points:\n\n- Revenue increased by 15% compared to last year\n- New market expansion in Asia Pacific region\n- R&D investments grew by 20%\n- Customer satisfaction score improved to 92%",
    document: {
      id: 'doc-1',
      name: 'Annual Report 2023.pdf'
    }
  },
  {
    id: '3',
    role: 'user',
    content: 'What are the main terms in the client contract?'
  },
  {
    id: '4',
    role: 'assistant',
    content:
      'The client contract contains these key terms:\n\n- 12-month service period with automatic renewal\n- Payment terms: Net 30 days\n- Confidentiality clause covering all shared materials\n- Termination requires 60-day written notice',
    document: {
      id: 'doc-2',
      name: 'Client Contract.doc'
    }
  }
];

// Document component
interface DocumentItemProps {
  document: Document;
  onSelect: (document: Document) => void;
}

function DocumentItem({ document, onSelect }: DocumentItemProps) {
  const getIconByType = (type: DocumentType) => {
    switch (type) {
      case 'pdf':
        return <IconFileText className='text-red-500' />;
      case 'doc':
        return <IconFileText className='text-blue-500' />;
      case 'txt':
        return <IconFile className='text-gray-500' />;
      case 'image':
        return <IconFile className='text-green-500' />;
      default:
        return <IconFile />;
    }
  };

  return (
    <Card
      className='hover:bg-muted/50 cursor-pointer'
      onClick={() => onSelect(document)}
    >
      <CardContent className='p-4'>
        <div className='flex items-start gap-3'>
          <div className='mt-1 text-2xl'>{getIconByType(document.type)}</div>
          <div className='flex-1'>
            <h3 className='font-medium'>{document.name}</h3>
            <div className='text-muted-foreground mt-1 flex text-xs'>
              <span>{document.size}</span>
              <span className='mx-2'>•</span>
              <span>Modified {document.lastModified}</span>
            </div>
            <div className='mt-2 flex flex-wrap gap-1'>
              {document.tags.map((tag) => (
                <span
                  key={tag}
                  className='bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs'
                >
                  {tag}
                </span>
              ))}
            </div>
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
  const [folders, setFolders] = useState(initialFolders);
  const [documents, setDocuments] = useState(initialDocuments);
  const [messages, setMessages] = useState(initialMessages);
  const [currentFolder, setCurrentFolder] = useState('important');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // New state variables
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter documents for current folder
  const currentDocuments = documents.filter(
    (doc) => doc.folderId === currentFolder
  );

  const [isLoading, setIsLoading] = useState(false);

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
      // Create context about the document
      const docContext = selectedDocument 
        ? `The user is asking about the document "${selectedDocument.name}" (${selectedDocument.type} file, ${selectedDocument.size}). Tags: ${selectedDocument.tags.join(', ')}.`
        : 'The user is asking about their documents in general.';

      const systemPrompt = `You are a helpful document assistant for a professional services firm (accounting, audit, financial PR). Help users analyze, summarize, and find information in their documents. ${docContext} Provide clear, professional responses.`;

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
        content: response.content || 'I can help you analyze this document. What specific information are you looking for?',
        document: selectedDocument
          ? {
              id: selectedDocument.id,
              name: selectedDocument.name
            }
          : undefined
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI response error:', error);
      // Fallback response
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `I've analyzed your question about "${currentMessage}". Here's what I found:\n\n- Key points related to your query\n- Supporting information from the documents\n- Suggested next steps\n\nWould you like me to elaborate on any of these points?`,
        document: selectedDocument
          ? {
              id: selectedDocument.id,
              name: selectedDocument.name
            }
          : undefined
      };
      setMessages((prev) => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document selection
  const handleSelectDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsChatOpen(true);

    // Add a message about the selected document if chat is empty
    if (messages.length === 0) {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `I've opened "${document.name}". How can I help you with this document?`,
        document: {
          id: document.id,
          name: document.name
        }
      };
      setMessages([aiMessage]);
    }
  };

  // Handle creating a new folder
  const handleCreateFolder = () => {
    const newFolder = {
      id: `folder-${Date.now()}`,
      name: `New Folder ${folders.length + 1}`,
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
            <h3 className='font-medium'>Folders</h3>
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
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-7 w-7 opacity-0 group-hover:opacity-100'
                      onClick={() => handleStartRename(folder)}
                    >
                      <IconEdit className='h-3.5 w-3.5' />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Document Area */}
        <div className='flex flex-1 flex-col overflow-hidden'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-2xl font-bold tracking-tight'>
              {folders.find((f) => f.id === currentFolder)?.name || 'Documents'}
            </h2>
            <div className='flex items-center space-x-2'>
              <div className='relative w-64'>
                <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                <Input
                  placeholder='Search documents...'
                  className='pl-8'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button>
                <IconUpload className='mr-2 h-4 w-4' />
                Upload
              </Button>
            </div>
          </div>

          {/* Document List */}
          <ScrollArea className='flex-1'>
            <div className='grid grid-cols-1 gap-4 p-4'>
              {currentDocuments.length > 0 ? (
                currentDocuments.map((document) => (
                  <DocumentItem
                    key={document.id}
                    document={document}
                    onSelect={handleSelectDocument}
                  />
                ))
              ) : (
                <div className='bg-muted/20 border-muted col-span-1 flex h-64 flex-col items-center justify-center rounded-lg border border-dashed'>
                  <p className='text-muted-foreground mb-4'>
                    This folder is empty
                  </p>
                  <Button>
                    <IconUpload className='mr-2 h-4 w-4' />
                    Upload Documents
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Chat Button */}
      <Button
        className='fixed right-6 bottom-6 h-12 w-12 rounded-full shadow-lg'
        onClick={() => setIsChatOpen(true)}
      >
        <IconMessage className='h-5 w-5' />
      </Button>

      {/* Chat Panel (Sheet) */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent
          side='right'
          className='flex h-full w-[400px] flex-col p-0 sm:w-[540px]'
        >
          <SheetHeader className='border-border shrink-0 border-b p-4'>
            <SheetTitle>Document Assistant</SheetTitle>
            <SheetDescription>
              Ask questions about your documents
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className='flex-1 overflow-auto p-4'>
            <div className='flex flex-col'>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className='border-border mt-auto shrink-0 border-t p-4'>
            <div className='flex gap-2'>
              <Input
                placeholder='Ask about your documents...'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} size='icon'>
                <IconSend className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
