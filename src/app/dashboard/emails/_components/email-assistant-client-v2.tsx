'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '@/lib/i18n/provider';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import {
  useEmails,
  useEmailAccounts,
  useMarkEmailRead,
  useStarEmail,
  useDeleteEmail,
  useGenerateReply,
  useAnalyzeEmail,
  useSendEmail,
  type Email,
  type EmailListItem,
  type EmailAccount,
  type EmailCategory,
} from '@/features/ai-assistants';
import { emailApi } from '@/features/ai-assistants/services';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui/resizable';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Mail,
  Star,
  Trash2,
  Archive,
  Reply,
  Forward,
  MoreHorizontal,
  Search,
  Inbox,
  Send,
  AlertCircle,
  Clock,
  Circle,
  Menu,
  MessageSquare,
  Sparkles,
  Loader2,
  FileText,
  Users,
  Calendar,
  DollarSign,
  Megaphone,
  Receipt,
  AlertTriangle,
  Heart,
  Building,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Download,
  Eye,
  Bot,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiApi } from '@/lib/api';

// Email Category Configuration with Icons
const EMAIL_CATEGORIES = {
  PAYMENT_REMINDER: { labelKey: 'emailAssistant.emailCategories.paymentReminder', icon: DollarSign, color: 'bg-red-100 text-red-800' },
  PROJECT_FOLLOWUP: { labelKey: 'emailAssistant.emailCategories.projectFollowup', icon: FileText, color: 'bg-blue-100 text-blue-800' },
  TAX_DOC_REQUEST: { labelKey: 'emailAssistant.emailCategories.taxDocRequest', icon: Receipt, color: 'bg-amber-100 text-amber-800' },
  MEETING_CONFIRM: { labelKey: 'emailAssistant.emailCategories.meetingConfirm', icon: Calendar, color: 'bg-purple-100 text-purple-800' },
  INVOICE_SENT: { labelKey: 'emailAssistant.emailCategories.invoiceSent', icon: DollarSign, color: 'bg-green-100 text-green-800' },
  EVENT_INVITE: { labelKey: 'emailAssistant.emailCategories.eventInvite', icon: Megaphone, color: 'bg-pink-100 text-pink-800' },
  IPO_RELEASE: { labelKey: 'emailAssistant.emailCategories.ipoRelease', icon: Building, color: 'bg-indigo-100 text-indigo-800' },
  BILLING_ISSUE: { labelKey: 'emailAssistant.emailCategories.billingIssue', icon: AlertTriangle, color: 'bg-orange-100 text-orange-800' },
  DOCUMENT_MISSING: { labelKey: 'emailAssistant.emailCategories.documentMissing', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800' },
  APPRECIATION: { labelKey: 'emailAssistant.emailCategories.appreciation', icon: Heart, color: 'bg-rose-100 text-rose-800' },
  GENERAL: { labelKey: 'emailAssistant.emailCategories.general', icon: Mail, color: 'bg-gray-100 text-gray-800' },
};

type EmailFolder = 'all' | 'unread' | 'starred' | 'sent' | 'archived' | 'trash' | string;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface EmailAttachment {
  id: string;
  filename: string;
  file: string;
  content_type: string;
  size: number;
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Helper to get initials from email/name
function getInitials(name: string, email: string): string {
  if (name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  return email?.slice(0, 2).toUpperCase() || 'UN';
}

// Helper to format time ago
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Sidebar Component
function EmailSidebar({
  accounts,
  selectedFolder,
  onSelectFolder,
  unreadCount,
  onToggle,
  t,
}: {
  accounts: EmailAccount[];
  selectedFolder: EmailFolder;
  onSelectFolder: (folder: EmailFolder) => void;
  unreadCount: number;
  onToggle: () => void;
  t: (key: string) => string;
}) {
  const folders = [
    { id: 'all', label: t('emailAssistant.allMail'), icon: Inbox, count: undefined },
    { id: 'unread', label: t('emailAssistant.unread'), icon: Mail, count: unreadCount },
    { id: 'starred', label: t('emailAssistant.starred'), icon: Star, count: undefined },
    { id: 'sent', label: t('emailAssistant.sent'), icon: Send, count: undefined },
    { id: 'archived', label: t('emailAssistant.archived'), icon: Archive, count: undefined },
    { id: 'trash', label: t('emailAssistant.trash'), icon: Trash2, count: undefined },
  ];

  return (
    <div className="w-60 h-full flex flex-col border-r bg-muted/30">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg">{t('emailAssistant.title')}</h2>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggle}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-2 space-y-1">
        {folders.map(folder => {
          const Icon = folder.icon;
          return (
            <Button
              key={folder.id}
              variant={selectedFolder === folder.id ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onSelectFolder(folder.id as EmailFolder)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {folder.label}
              {folder.count !== undefined && folder.count > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {folder.count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      <Separator className="my-2" />

      <div className="p-2">
        <p className="text-xs text-muted-foreground px-2 mb-2">{t('emailAssistant.accounts')}</p>
        {accounts.map(account => (
          <Button
            key={account.id}
            variant={selectedFolder === account.id.toString() ? 'secondary' : 'ghost'}
            className="w-full justify-start text-sm"
            onClick={() => onSelectFolder(account.id.toString())}
          >
            <div
              className="h-2 w-2 rounded-full mr-2"
              style={{ backgroundColor: account.is_active ? '#22c55e' : '#ef4444' }}
            />
            <span className="truncate">{account.email_address}</span>
          </Button>
        ))}
      </div>

      <Separator className="my-2" />

      <div className="p-2">
        <p className="text-xs text-muted-foreground px-2 mb-2">{t('emailAssistant.categories')}</p>
        <ScrollArea className="h-[200px]">
          {Object.entries(EMAIL_CATEGORIES).slice(0, -1).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <Button
                key={key}
                variant={selectedFolder === key ? 'secondary' : 'ghost'}
                className="w-full justify-start text-sm mb-1"
                onClick={() => onSelectFolder(key)}
              >
                <Icon className="h-3 w-3 mr-2" />
                <span className="truncate text-xs">{t(config.labelKey)}</span>
              </Button>
            );
          })}
        </ScrollArea>
      </div>
    </div>
  );
}

// Email List Item
function EmailListItemComponent({
  email,
  isSelected,
  onSelect,
  onStar,
  t,
}: {
  email: EmailListItem;
  isSelected: boolean;
  onSelect: () => void;
  onStar: () => void;
  t: (key: string) => string;
}) {
  const category = EMAIL_CATEGORIES[email.category as keyof typeof EMAIL_CATEGORIES] || EMAIL_CATEGORIES.GENERAL;
  const CategoryIcon = category.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 border-b transition-colors",
        isSelected && "bg-muted",
        !email.is_read && "bg-primary/5"
      )}
      onClick={onSelect}
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className={cn(!email.is_read && "bg-primary text-primary-foreground")}>
          {getInitials(email.from_name || '', email.from_address)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("font-medium text-sm truncate", !email.is_read && "font-semibold")}>
            {email.from_name || email.from_address}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {timeAgo(email.received_at || email.sent_at || '')}
          </span>
        </div>
        
        <p className={cn("text-sm truncate", !email.is_read && "font-medium")}>
          {email.subject}
        </p>
        
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className={cn("text-xs py-0 h-5", category.color)}>
            <CategoryIcon className="h-3 w-3 mr-1" />
            {t(category.labelKey)}
          </Badge>
          {email.priority === 'HIGH' && (
            <Badge variant="destructive" className="text-xs py-0 h-5">Urgent</Badge>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onStar();
        }}
      >
        <Star className={cn("h-4 w-4", email.is_starred && "fill-yellow-400 text-yellow-400")} />
      </Button>
    </div>
  );
}

// Email List Component
function EmailList({
  emails,
  isLoading,
  selectedEmail,
  onSelectEmail,
  onStarEmail,
  onRefresh,
  t,
}: {
  emails: Email[];
  isLoading: boolean;
  selectedEmail: Email | null;
  onSelectEmail: (email: Email) => void;
  onStarEmail: (id: string) => void;
  t: (key: string) => string;
  onRefresh: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmails = useMemo(() => {
    if (!searchQuery.trim()) return emails;
    const query = searchQuery.toLowerCase();
    return emails.filter((email: Email) =>
      email.subject.toLowerCase().includes(query) ||
      email.from_name?.toLowerCase().includes(query) ||
      email.from_address.toLowerCase().includes(query) ||
      email.ai_summary?.toLowerCase().includes(query)
    );
  }, [emails, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('emailAssistant.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Mail className="h-12 w-12 mb-2" />
            <p>{t('emailAssistant.noEmails')}</p>
          </div>
        ) : (
          filteredEmails.map(email => (
            <EmailListItemComponent
              key={email.id}
              email={email}
              isSelected={selectedEmail?.id === email.id}
              onSelect={() => onSelectEmail(email)}
              onStar={() => onStarEmail(email.id)}
              t={t}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}

// Email Detail Component
function EmailDetail({
  email,
  onArchive,
  onDelete,
  onGenerateReply,
  onAnalyze,
  isGeneratingReply,
  isAnalyzing,
  t,
}: {
  email: Email;
  onArchive: () => void;
  onDelete: () => void;
  onGenerateReply: () => void;
  onAnalyze: () => void;
  isGeneratingReply: boolean;
  isAnalyzing: boolean;
  t: (key: string) => string;
}) {
  const category = EMAIL_CATEGORIES[email.category as keyof typeof EMAIL_CATEGORIES] || EMAIL_CATEGORIES.GENERAL;
  const CategoryIcon = category.icon;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", category.color)}>
            <CategoryIcon className="h-3 w-3 mr-1" />
            {t(category.labelKey)}
          </Badge>
          {email.priority === 'HIGH' && (
            <Badge variant="destructive">Urgent</Badge>
          )}
          {email.ai_summary && (
            <Badge variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Summary
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={onGenerateReply} disabled={isGeneratingReply}>
            {isGeneratingReply ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Reply className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <Forward className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onArchive}>
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <h1 className="text-xl font-semibold mb-4">{email.subject}</h1>

        <div className="flex items-start gap-3 mb-6">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {getInitials(email.from_name || '', email.from_address)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{email.from_name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">{email.from_address}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(email.received_at || email.sent_at || email.created_at).toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              To: {email.to_addresses?.join(', ')}
            </p>
          </div>
        </div>

        {email.ai_summary && (
          <Card className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{email.ai_summary}</p>
              {email.ai_action_items && email.ai_action_items.length > 0 && (
                <div className="mt-2 space-y-1">
                  {email.ai_action_items.map((item, idx) => (
                    <div key={`${item.action}-${idx}`} className="flex items-start gap-2 text-xs">
                      <Circle className="h-3 w-3 mt-0.5" />
                      <span>
                        {item.action}
                        {item.deadline ? ` — ${item.deadline}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {email.ai_sentiment && (
                <Badge variant="outline" className="mt-3">
                  Sentiment: {email.ai_sentiment}
                </Badge>
              )}
            </CardContent>
          </Card>
        )}

        <Separator className="my-4" />

        <div className="prose prose-sm dark:prose-invert max-w-none">
          {email.body_html ? (
            <div dangerouslySetInnerHTML={{ __html: email.body_html }} />
          ) : (
            <pre className="whitespace-pre-wrap font-sans">{email.body_text}</pre>
          )}
        </div>

        {email.has_attachments && (
          <>
            <Separator className="my-4" />
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Attachments
              </h3>
              <AttachmentList emailId={email.id} />
            </div>
          </>
        )}
      </ScrollArea>
    </div>
  );
}

// Attachment List Component
function AttachmentList({ emailId }: { emailId: string }) {
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const data = await emailApi.getAttachments(emailId);
        setAttachments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch attachments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttachments();
  }, [emailId]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No attachments available</p>
    );
  }

  const handleDownload = async (attachment: EmailAttachment) => {
    try {
      const blob = await emailApi.downloadAttachment(attachment.id);
      const url = window.URL.createObjectURL(blob as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download attachment:', error);
    }
  };

  const handlePreview = (attachment: EmailAttachment) => {
    const previewUrl = emailApi.previewAttachment(attachment.id);
    window.open(previewUrl, '_blank');
  };

  const isPreviewable = (contentType: string) => {
    return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'text/html'].includes(contentType);
  };

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center justify-between p-2 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{attachment.filename}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isPreviewable(attachment.content_type) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePreview(attachment)}
                title="Preview"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleDownload(attachment)}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// AI Chat Panel Component - Now as a collapsible top section
function AIChatPanel({
  email,
  messages,
  setMessages,
  isOpen,
  onToggle,
}: {
  email: Email | null;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const emailContext = email
        ? `Current email:\nFrom: ${email.from_name} <${email.from_address}>\nSubject: ${email.subject}\nCategory: ${email.category}\nContent: ${email.body_text?.substring(0, 500)}`
        : 'No email selected.';

      const systemPrompt = `You are a professional email assistant for AutoBooks ERP, a business services platform for accounting firms. Help users draft emails, respond to messages, summarize correspondence, and manage their inbox professionally. ${emailContext}`;

      const conversationHistory = messages.slice(-6).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));
      conversationHistory.push({ role: 'user', content: currentInput });

      const response = await aiApi.chatWithHistory(
        conversationHistory,
        'openai',
        { systemPrompt }
      );

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.content || "I'd be happy to help with your email. Could you provide more details?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: "I'd be happy to help you draft a professional response. Here's a suggested format:\n\nDear [Recipient],\n\nThank you for your email regarding [subject].\n\n[Your response here]\n\nBest regards,\n[Your name]",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: 'Summarize', prompt: 'Please summarize this email in 2-3 sentences.' },
    { label: 'Draft Reply', prompt: 'Help me draft a professional reply to this email.' },
    { label: 'Extract Tasks', prompt: 'What action items or tasks can you extract from this email?' },
    { label: 'Tone Check', prompt: 'What is the tone of this email and how should I respond?' },
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className="border-b rounded-none border-x-0 border-t-0 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CollapsibleTrigger asChild>
          <CardHeader className="py-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-base">AI Email Assistant</CardTitle>
                {email && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Context: {email.subject.substring(0, 30)}...
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 1 && (
                  <Badge variant="outline" className="text-xs">
                    {messages.length - 1} messages
                  </Badge>
                )}
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
            <CardDescription className="text-xs">
              Ask AI to help draft replies, summarize emails, or extract action items
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleQuickAction(action.prompt)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
            
            {/* Messages */}
            <ScrollArea className="h-[200px] border rounded-lg p-3 mb-3 bg-background">
              <div className="space-y-3">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[85%] rounded-lg p-2.5 text-sm",
                      message.role === 'user'
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "mr-auto bg-muted"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">{message.timestamp}</p>
                  </div>
                ))}
                {isLoading && (
                  <div className="mr-auto bg-muted rounded-lg p-2.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Ask AI about this email..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={isLoading} size="icon">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Main Email Assistant Client Component
export default function EmailAssistantClientV2() {
  const { t } = useTranslation();
  const [selectedFolder, setSelectedFolder] = useState<EmailFolder>('all');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your Email Assistant. I can help you draft replies, summarize emails, or manage your inbox. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const isMobile = useIsMobile();
  const { toast } = useToast();

  // API Hooks
  const { data: emails = [], isLoading: emailsLoading, refetch: refetchEmails } = useEmails({
    category: Object.keys(EMAIL_CATEGORIES).includes(selectedFolder) ? selectedFolder as EmailCategory : undefined,
    is_starred: selectedFolder === 'starred' ? true : undefined,
    is_read: selectedFolder === 'unread' ? false : undefined,
    status: selectedFolder === 'sent' ? 'SENT' : selectedFolder === 'archived' ? 'ARCHIVED' : selectedFolder === 'trash' ? 'DELETED' : undefined,
  });
  
  const { data: accounts = [], isLoading: accountsLoading } = useEmailAccounts();
  const markReadMutation = useMarkEmailRead();
  const starMutation = useStarEmail();
  const deleteMutation = useDeleteEmail();
  const analyzeMutation = useAnalyzeEmail();
  const generateReplyMutation = useGenerateReply();

  // Filter emails based on folder
  const filteredEmails = useMemo(() => {
    if (selectedFolder === 'all') return emails;
    if (selectedFolder === 'unread') return emails.filter((e: EmailListItem) => !e.is_read);
    if (selectedFolder === 'starred') return emails.filter((e: EmailListItem) => e.is_starred);
    // Account filter
    if (!isNaN(Number(selectedFolder))) {
      return emails.filter((e: EmailListItem) => (e as Email).account?.toString() === selectedFolder);
    }
    // Category filter
    if (Object.keys(EMAIL_CATEGORIES).includes(selectedFolder)) {
      return emails.filter((e: EmailListItem) => e.category === selectedFolder);
    }
    return emails;
  }, [emails, selectedFolder]);

  const unreadCount = useMemo(() => emails.filter((e: EmailListItem) => !e.is_read).length, [emails]);

  // Handle email selection
  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    if (!email.is_read) {
      markReadMutation.mutate(email.id);
    }
  };

  // Handle star toggle
  const handleStarEmail = (id: string) => {
    starMutation.mutate(id);
  };

  // Handle archive
  const handleArchive = () => {
    if (selectedEmail) {
      toast({ title: 'Email archived' });
      setSelectedEmail(null);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedEmail) {
      deleteMutation.mutate(selectedEmail.id);
      toast({ title: 'Email deleted' });
      setSelectedEmail(null);
    }
  };

  // Handle analyze
  const handleAnalyzeEmail = async () => {
    if (selectedEmail) {
      try {
        const result: any = await analyzeMutation.mutateAsync(selectedEmail.id);
        const updated = {
          ...selectedEmail,
          ai_summary: result?.summary,
          ai_action_items: result?.action_items,
          ai_sentiment: result?.sentiment,
        } as Email;
        setSelectedEmail(updated);
        toast({ title: 'Analysis complete' });
        refetchEmails();
      } catch (error) {
        toast({ title: 'Failed to analyze email', variant: 'destructive' });
      }
    }
  };

  // Handle generate reply
  const handleGenerateReply = async () => {
    if (selectedEmail) {
      try {
        const result = await generateReplyMutation.mutateAsync(selectedEmail.id);
        const data = result as { suggested_reply?: string };
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Here's a suggested reply:\n\n${data.suggested_reply || 'Draft your reply here...'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
        setChatOpen(true);
      } catch (error) {
        toast({ title: 'Failed to generate reply', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* AI Assistant Panel - Top Section */}
      <AIChatPanel
        email={selectedEmail}
        messages={chatMessages}
        setMessages={setChatMessages}
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {(sidebarOpen || !isMobile) && (
          <EmailSidebar
            accounts={accounts}
            selectedFolder={selectedFolder}
            onSelectFolder={setSelectedFolder}
            unreadCount={unreadCount}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            t={t}
          />
        )}

        {/* Main Content */}
        {isMobile ? (
          <div className="flex-1">
            {selectedEmail ? (
              <EmailDetail
                email={selectedEmail}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onAnalyze={handleAnalyzeEmail}
                onGenerateReply={handleGenerateReply}
                isAnalyzing={analyzeMutation.isPending}
                isGeneratingReply={generateReplyMutation.isPending}
                t={t}
              />
            ) : (
              <EmailList
                emails={filteredEmails}
                isLoading={emailsLoading}
                selectedEmail={selectedEmail}
                onSelectEmail={handleSelectEmail}
                onStarEmail={handleStarEmail}
                onRefresh={() => refetchEmails()}
                t={t}
              />
            )}
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={35} minSize={25}>
              <EmailList
                emails={filteredEmails}
                isLoading={emailsLoading}
                selectedEmail={selectedEmail}
                onSelectEmail={handleSelectEmail}
                onStarEmail={handleStarEmail}
                onRefresh={() => refetchEmails()}
                t={t}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={65}>
              {selectedEmail ? (
                <EmailDetail
                  email={selectedEmail}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                  onAnalyze={handleAnalyzeEmail}
                  onGenerateReply={handleGenerateReply}
                  isAnalyzing={analyzeMutation.isPending}
                  isGeneratingReply={generateReplyMutation.isPending}
                  t={t}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Mail className="h-16 w-16 mb-4" />
                  <p className="text-lg">{t('emailAssistant.selectEmail')}</p>
                  <p className="text-sm">
                    {filteredEmails.length} emails in {selectedFolder === 'all' ? 'inbox' : selectedFolder}
                  </p>
                </div>
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
