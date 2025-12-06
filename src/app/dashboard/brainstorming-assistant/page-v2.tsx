'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import {
  Search,
  Plus,
  Shield,
  DollarSign,
  MessageSquare,
  Brain,
  Lightbulb,
  Sparkles,
  Loader2,
  Send,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Zap,
  FolderOpen,
  RefreshCw,
  Target,
  Briefcase,
  Megaphone,
  PieChart,
  Save,
  Trash2,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { aiApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import PageContainer from '@/components/layout/page-container';

// =========================================
// Types
// =========================================

type SessionType = 
  | 'STRATEGY' 
  | 'PITCH_WRITER' 
  | 'MARKET_ANALYSIS' 
  | 'CAMPAIGN_BREAKDOWN' 
  | 'IDEA_GENERATOR' 
  | 'FINANCIAL_PLANNING' 
  | 'RISK_ASSESSMENT' 
  | 'PROCESS_OPTIMIZATION';

interface BrainstormSession {
  id: string;
  title: string;
  session_type: SessionType;
  prompt: string;
  context?: Record<string, unknown>;
  target_outcome?: string;
  ideas_count: number;
  created_at: string;
  updated_at: string;
  user_id?: string;
  organization_id?: string;
  company_id?: string;
}

interface BrainstormIdea {
  id: string;
  session_id: string;
  content: string;
  category?: string;
  rating: number;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// =========================================
// Session Type Configuration
// =========================================

const SESSION_TYPES: Record<SessionType, { labelKey: string; icon: React.ElementType; color: string; description: string }> = {
  STRATEGY: { 
    labelKey: 'brainstormingAssistant.sessionTypes.strategy', 
    icon: Target, 
    color: 'bg-blue-500',
    description: '策略規劃與商業決策'
  },
  PITCH_WRITER: { 
    labelKey: 'brainstormingAssistant.sessionTypes.pitchWriter', 
    icon: Briefcase, 
    color: 'bg-purple-500',
    description: '簡報內容與說服文案'
  },
  MARKET_ANALYSIS: { 
    labelKey: 'brainstormingAssistant.sessionTypes.marketAnalysis', 
    icon: PieChart, 
    color: 'bg-green-500',
    description: '市場趨勢與競爭分析'
  },
  CAMPAIGN_BREAKDOWN: { 
    labelKey: 'brainstormingAssistant.sessionTypes.campaign', 
    icon: Megaphone, 
    color: 'bg-orange-500',
    description: '行銷活動策劃與執行'
  },
  IDEA_GENERATOR: { 
    labelKey: 'brainstormingAssistant.sessionTypes.ideas', 
    icon: Lightbulb, 
    color: 'bg-yellow-500',
    description: '創意發想與腦力激盪'
  },
  FINANCIAL_PLANNING: { 
    labelKey: 'brainstormingAssistant.sessionTypes.financial', 
    icon: DollarSign, 
    color: 'bg-emerald-500',
    description: '財務規劃與預算分析'
  },
  RISK_ASSESSMENT: { 
    labelKey: 'brainstormingAssistant.sessionTypes.risk', 
    icon: Shield, 
    color: 'bg-red-500',
    description: '風險評估與應對策略'
  },
  PROCESS_OPTIMIZATION: { 
    labelKey: 'brainstormingAssistant.sessionTypes.process', 
    icon: Zap, 
    color: 'bg-cyan-500',
    description: '流程優化與效率提升'
  },
};

// =========================================
// LocalStorage Functions
// =========================================

const STORAGE_KEY = 'brainstorm_sessions';
const IDEAS_STORAGE_KEY = 'brainstorm_ideas';

function getStoredSessions(): BrainstormSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: BrainstormSession[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function getStoredIdeas(): BrainstormIdea[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(IDEAS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveIdeas(ideas: BrainstormIdea[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// =========================================
// Session Card Component
// =========================================

function SessionCard({
  session,
  isSelected,
  onClick,
  onDelete,
}: {
  session: BrainstormSession;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation();
  const typeConfig = SESSION_TYPES[session.session_type] || SESSION_TYPES.STRATEGY;
  const TypeIcon = typeConfig.icon;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md group",
        isSelected && "ring-2 ring-primary bg-accent/50"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-start gap-2">
          <div className={cn("p-1.5 rounded-md shrink-0", typeConfig.color)}>
            <TypeIcon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium truncate">{session.title}</CardTitle>
            <CardDescription className="text-xs mt-0.5 line-clamp-2">
              {session.prompt}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(session.id);
            }}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-2 px-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {t(typeConfig.labelKey)}
          </Badge>
          <span className="flex items-center gap-0.5">
            <Lightbulb className="h-3 w-3" />
            {session.ideas_count}
          </span>
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {new Date(session.created_at).toLocaleDateString('zh-TW')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// =========================================
// Idea Card Component
// =========================================

function IdeaCard({
  idea,
  onRate,
  onSave,
  onDelete,
  onCopy,
}: {
  idea: BrainstormIdea;
  onRate: (rating: 'up' | 'down') => void;
  onSave: () => void;
  onDelete: () => void;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={cn(
      "transition-all group",
      idea.is_saved && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
    )}>
      <CardContent className="p-3">
        <div className="flex gap-2">
          <div className="p-1 rounded-full shrink-0 bg-muted h-fit">
            <Lightbulb className={cn(
              "h-3.5 w-3.5",
              idea.is_saved ? "text-green-600" : "text-muted-foreground"
            )} />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm whitespace-pre-wrap">{idea.content}</p>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onRate('up')}
                >
                  <ThumbsUp className={cn(
                    "h-3 w-3",
                    idea.rating > 0 && "fill-green-500 text-green-500"
                  )} />
                </Button>
                <span className="text-xs text-muted-foreground min-w-[20px] text-center">
                  {idea.rating}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onRate('down')}
                >
                  <ThumbsDown className={cn(
                    "h-3 w-3",
                    idea.rating < 0 && "fill-red-500 text-red-500"
                  )} />
                </Button>
              </div>
              
              <div className="flex items-center gap-1">
                {idea.category && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 mr-1">
                    {idea.category}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-6 w-6", idea.is_saved && "text-green-600")}
                  onClick={onSave}
                >
                  <Save className={cn("h-3 w-3", idea.is_saved && "fill-current")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100"
                  onClick={onDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =========================================
// Create Session Dialog
// =========================================

function CreateSessionDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<BrainstormSession, 'id' | 'ideas_count' | 'created_at' | 'updated_at'>) => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>('STRATEGY');
  const [targetOutcome, setTargetOutcome] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !prompt.trim()) return;
    onSubmit({
      title: title.trim(),
      prompt: prompt.trim(),
      session_type: sessionType,
      target_outcome: targetOutcome.trim() || undefined,
    });
    setTitle('');
    setPrompt('');
    setSessionType('STRATEGY');
    setTargetOutcome('');
    onOpenChange(false);
  };

  const selectedType = SESSION_TYPES[sessionType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            {t('brainstormingAssistant.newSession')}
          </DialogTitle>
          <DialogDescription>
            {t('brainstormingAssistant.newSessionDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">{t('brainstormingAssistant.sessionTitle')}</Label>
            <Input
              id="title"
              placeholder={t('brainstormingAssistant.sessionTitlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">{t('brainstormingAssistant.sessionType')}</Label>
            <Select value={sessionType} onValueChange={(v) => setSessionType(v as SessionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SESSION_TYPES).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1 rounded", config.color)}>
                          <Icon className="h-3 w-3 text-white" />
                        </div>
                        <span>{t(config.labelKey)}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedType && (
              <p className="text-xs text-muted-foreground">{selectedType.description}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prompt">{t('brainstormingAssistant.prompt')}</Label>
            <Textarea
              id="prompt"
              placeholder={t('brainstormingAssistant.promptPlaceholder')}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="outcome">{t('brainstormingAssistant.targetOutcome')}</Label>
            <Input
              id="outcome"
              placeholder={t('brainstormingAssistant.targetOutcomePlaceholder')}
              value={targetOutcome}
              onChange={(e) => setTargetOutcome(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !prompt.trim()}>
            {t('brainstormingAssistant.createSession')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =========================================
// Session Detail Panel
// =========================================

function SessionDetailPanel({
  session,
  ideas,
  onGenerateIdeas,
  onRateIdea,
  onSaveIdea,
  onDeleteIdea,
  onCopyIdea,
  isGenerating,
}: {
  session: BrainstormSession;
  ideas: BrainstormIdea[];
  onGenerateIdeas: (customPrompt?: string) => void;
  onRateIdea: (ideaId: string, rating: 'up' | 'down') => void;
  onSaveIdea: (ideaId: string) => void;
  onDeleteIdea: (ideaId: string) => void;
  onCopyIdea: (content: string) => void;
  isGenerating: boolean;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const typeConfig = SESSION_TYPES[session.session_type] || SESSION_TYPES.STRATEGY;
  const TypeIcon = typeConfig.icon;

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [additionalPrompt, setAdditionalPrompt] = useState('');

  const savedIdeasCount = ideas.filter(i => i.is_saved).length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    const newUserMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: userMsg,
      timestamp: new Date(),
    };
    
    setChatMessages(prev => [...prev, newUserMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const existingIdeas = ideas.map(i => `- ${i.content}`).join('\n');
      const systemPrompt = `你是 AutoBooks ERP 的 AI 腦力激盪助手。
當前會議: "${session.title}"
會議類型: ${t(typeConfig.labelKey)}
主題提示: "${session.prompt}"
${session.target_outcome ? `目標成果: ${session.target_outcome}` : ''}
${existingIdeas ? `\n已有的點子:\n${existingIdeas}` : ''}

請幫助用戶擴展這些點子、提供新的建議或給予回饋。用繁體中文回覆。`;

      const response = await aiApi.chatWithHistory(
        [...chatMessages.slice(-10).map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMsg }],
        'openai',
        { systemPrompt }
      );

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.content || "我可以幫你進一步思考這個問題。你想從哪個角度來探討？",
        timestamp: new Date(),
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: "讓我幫你腦力激盪！可以考慮從不同角度思考、結合現有點子，或探索邊緣案例。",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateWithPrompt = () => {
    onGenerateIdeas(additionalPrompt || undefined);
    setAdditionalPrompt('');
  };

  const handleExportIdeas = () => {
    const savedOnly = ideas.filter(i => i.is_saved);
    const toExport = savedOnly.length > 0 ? savedOnly : ideas;
    
    const content = `# ${session.title}\n\n` +
      `**類型:** ${t(typeConfig.labelKey)}\n` +
      `**提示:** ${session.prompt}\n` +
      `${session.target_outcome ? `**目標:** ${session.target_outcome}\n` : ''}` +
      `**建立日期:** ${new Date(session.created_at).toLocaleDateString('zh-TW')}\n\n` +
      `## 點子 (${toExport.length})\n\n` +
      toExport.map((idea, idx) => 
        `${idx + 1}. ${idea.content}${idea.category ? ` [${idea.category}]` : ''} ${idea.is_saved ? '⭐' : ''}`
      ).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.title.replace(/\s+/g, '_')}_ideas.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: t('brainstormingAssistant.exported') });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b shrink-0">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg shrink-0", typeConfig.color)}>
            <TypeIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">{session.title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{session.prompt}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">{t(typeConfig.labelKey)}</Badge>
              <span className="text-xs text-muted-foreground">
                {ideas.length} {t('brainstormingAssistant.ideas')} · {savedIdeasCount} {t('brainstormingAssistant.saved')}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(session.created_at).toLocaleDateString('zh-TW')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleExportIdeas}>
              <Download className="h-3.5 w-3.5 mr-1" />
              {t('brainstormingAssistant.export')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Ideas + Chat */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Ideas List */}
        <div className="flex-1 flex flex-col border-r min-w-0">
          {/* Generate Section */}
          <div className="p-3 border-b shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder={t('brainstormingAssistant.additionalPromptPlaceholder')}
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerateWithPrompt()}
                className="text-sm"
              />
              <Button
                onClick={handleGenerateWithPrompt}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shrink-0"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span className="ml-1.5 hidden sm:inline">{t('brainstormingAssistant.generateIdeas')}</span>
              </Button>
            </div>
          </div>
          
          {/* Ideas Header */}
          <div className="px-3 py-2 border-b shrink-0">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              {t('brainstormingAssistant.ideas')} ({ideas.length})
            </h3>
          </div>
          
          {/* Ideas Scroll Area */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {ideas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Lightbulb className="h-10 w-10 mb-3 opacity-50" />
                  <p className="text-sm font-medium">{t('brainstormingAssistant.noIdeasYet')}</p>
                  <p className="text-xs mt-1">{t('brainstormingAssistant.clickGenerateIdeas')}</p>
                </div>
              ) : (
                ideas.map(idea => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onRate={(rating) => onRateIdea(idea.id, rating)}
                    onSave={() => onSaveIdea(idea.id)}
                    onDelete={() => onDeleteIdea(idea.id)}
                    onCopy={() => onCopyIdea(idea.content)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Panel */}
        <div className="w-72 lg:w-80 flex flex-col shrink-0">
          <div className="px-3 py-2 border-b shrink-0">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t('brainstormingAssistant.aiDiscussion')}
            </h3>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-xs text-center">{t('brainstormingAssistant.chatWithAI')}</p>
                </div>
              )}
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "max-w-[90%] rounded-lg p-2 text-sm",
                    msg.role === 'user'
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-muted"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-[10px] opacity-60 mt-1 block">
                    {msg.timestamp.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {chatLoading && (
                <div className="mr-auto bg-muted rounded-lg p-2.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-2 border-t shrink-0">
            <div className="flex gap-1.5">
              <Input
                placeholder={t('brainstormingAssistant.discussIdeas')}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                disabled={chatLoading}
                className="h-8 text-sm"
              />
              <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleChat} disabled={chatLoading || !chatInput.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================
// Main Page Component
// =========================================

export default function BrainstormingAssistantPageV2() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [sessions, setSessions] = useState<BrainstormSession[]>([]);
  const [ideas, setIdeas] = useState<BrainstormIdea[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSessions(getStoredSessions());
    setIdeas(getStoredIdeas());
    setIsLoading(false);
  }, []);

  const selectedSession = useMemo(() => 
    sessions.find(s => s.id === selectedSessionId) || null,
    [sessions, selectedSessionId]
  );

  const sessionIdeas = useMemo(() => 
    ideas.filter(i => i.session_id === selectedSessionId)
      .sort((a, b) => {
        if (a.is_saved !== b.is_saved) return a.is_saved ? -1 : 1;
        if (a.rating !== b.rating) return b.rating - a.rating;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [ideas, selectedSessionId]
  );

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const query = searchQuery.toLowerCase();
    return sessions.filter(s =>
      s.title.toLowerCase().includes(query) ||
      s.prompt.toLowerCase().includes(query)
    );
  }, [sessions, searchQuery]);

  const stats = useMemo(() => ({
    totalSessions: sessions.length,
    totalIdeas: ideas.length,
    savedIdeas: ideas.filter(i => i.is_saved).length,
  }), [sessions, ideas]);

  const handleCreateSession = useCallback((data: Omit<BrainstormSession, 'id' | 'ideas_count' | 'created_at' | 'updated_at'>) => {
    const newSession: BrainstormSession = {
      id: generateId(),
      ...data,
      ideas_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const updated = [newSession, ...sessions];
    setSessions(updated);
    saveSessions(updated);
    setSelectedSessionId(newSession.id);
    toast({ title: t('brainstormingAssistant.sessionCreated') });
  }, [sessions, toast, t]);

  const handleDeleteSession = useCallback((sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDeleteSession = useCallback(() => {
    if (!sessionToDelete) return;
    
    const updatedSessions = sessions.filter(s => s.id !== sessionToDelete);
    const updatedIdeas = ideas.filter(i => i.session_id !== sessionToDelete);
    
    setSessions(updatedSessions);
    setIdeas(updatedIdeas);
    saveSessions(updatedSessions);
    saveIdeas(updatedIdeas);
    
    if (selectedSessionId === sessionToDelete) {
      setSelectedSessionId(null);
    }
    
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
    toast({ title: t('brainstormingAssistant.sessionDeleted') });
  }, [sessionToDelete, sessions, ideas, selectedSessionId, toast, t]);

  const handleGenerateIdeas = useCallback(async (customPrompt?: string) => {
    if (!selectedSession || isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      const typeConfig = SESSION_TYPES[selectedSession.session_type];
      const prompt = `你是一個專業的 ${t(typeConfig.labelKey)} 專家。
      
任務: ${selectedSession.prompt}
${customPrompt ? `額外要求: ${customPrompt}` : ''}
${selectedSession.target_outcome ? `期望成果: ${selectedSession.target_outcome}` : ''}

請生成 5 個創新且實用的點子。每個點子要具體、可執行、並帶有獨特見解。
用繁體中文回覆，每個點子用換行分隔，不要加編號。`;

      const response = await aiApi.chat(prompt, 'openai');
      const content = response.content || '';
      
      const newIdeasContent = content
        .split('\n')
        .map((line: string) => line.replace(/^[\d\.\-\*\•]+\s*/, '').trim())
        .filter((line: string) => line.length > 10);

      const newIdeas: BrainstormIdea[] = newIdeasContent.map((content: string) => ({
        id: generateId(),
        session_id: selectedSession.id,
        content,
        rating: 0,
        is_saved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const updatedIdeas = [...newIdeas, ...ideas];
      setIdeas(updatedIdeas);
      saveIdeas(updatedIdeas);

      const updatedSessions = sessions.map(s => 
        s.id === selectedSession.id 
          ? { ...s, ideas_count: updatedIdeas.filter(i => i.session_id === s.id).length, updated_at: new Date().toISOString() }
          : s
      );
      setSessions(updatedSessions);
      saveSessions(updatedSessions);

      toast({ title: t('brainstormingAssistant.ideasGenerated') });
    } catch (error) {
      console.error('Generate ideas failed:', error);
      toast({ 
        title: t('brainstormingAssistant.generateFailed'), 
        variant: 'destructive' 
      });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedSession, isGenerating, ideas, sessions, toast, t]);

  const handleRateIdea = useCallback((ideaId: string, rating: 'up' | 'down') => {
    const updatedIdeas = ideas.map(idea => {
      if (idea.id !== ideaId) return idea;
      const newRating = rating === 'up' 
        ? (idea.rating >= 0 ? idea.rating + 1 : 0)
        : (idea.rating <= 0 ? idea.rating - 1 : 0);
      return { ...idea, rating: newRating, updated_at: new Date().toISOString() };
    });
    setIdeas(updatedIdeas);
    saveIdeas(updatedIdeas);
  }, [ideas]);

  const handleSaveIdea = useCallback((ideaId: string) => {
    const updatedIdeas = ideas.map(idea => 
      idea.id === ideaId 
        ? { ...idea, is_saved: !idea.is_saved, updated_at: new Date().toISOString() }
        : idea
    );
    setIdeas(updatedIdeas);
    saveIdeas(updatedIdeas);
    
    const idea = updatedIdeas.find(i => i.id === ideaId);
    toast({ 
      title: idea?.is_saved 
        ? t('brainstormingAssistant.ideaSaved')
        : t('brainstormingAssistant.ideaUnsaved')
    });
  }, [ideas, toast, t]);

  const handleDeleteIdea = useCallback((ideaId: string) => {
    const updatedIdeas = ideas.filter(i => i.id !== ideaId);
    setIdeas(updatedIdeas);
    saveIdeas(updatedIdeas);

    if (selectedSessionId) {
      const updatedSessions = sessions.map(s => 
        s.id === selectedSessionId 
          ? { ...s, ideas_count: updatedIdeas.filter(i => i.session_id === s.id).length }
          : s
      );
      setSessions(updatedSessions);
      saveSessions(updatedSessions);
    }
  }, [ideas, selectedSessionId, sessions]);

  const handleCopyIdea = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: t('brainstormingAssistant.ideaCopied') });
  }, [toast, t]);

  const handleRefresh = useCallback(() => {
    setSessions(getStoredSessions());
    setIdeas(getStoredIdeas());
    toast({ title: t('common.refreshed') });
  }, [toast, t]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-col h-[calc(100vh-7rem)]">
        {/* Header */}
        <div className="px-1 pb-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-500" />
                {t('brainstormingAssistant.title')}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t('brainstormingAssistant.description')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-xs">
                <FolderOpen className="h-3 w-3" />
                {stats.totalSessions} {t('brainstormingAssistant.sessions')}
              </Badge>
              <Badge variant="outline" className="gap-1 text-xs">
                <Lightbulb className="h-3 w-3" />
                {stats.totalIdeas} {t('brainstormingAssistant.ideas')}
              </Badge>
              <Badge variant="outline" className="gap-1 text-xs">
                <Save className="h-3 w-3" />
                {stats.savedIdeas} {t('brainstormingAssistant.saved')}
              </Badge>
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                {t('brainstormingAssistant.newSession')}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 border rounded-lg overflow-hidden min-h-0">
          {/* Sessions Sidebar */}
          <div className="w-72 lg:w-80 border-r flex flex-col shrink-0 bg-muted/30">
            <div className="p-2 border-b shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('brainstormingAssistant.searchSessions')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-2">
                {filteredSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Brain className="h-10 w-10 mb-3 opacity-50" />
                    <p className="text-sm font-medium">{t('brainstormingAssistant.noSessions')}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setCreateDialogOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      {t('brainstormingAssistant.createSession')}
                    </Button>
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      isSelected={selectedSessionId === session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      onDelete={handleDeleteSession}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {selectedSession ? (
              <SessionDetailPanel
                session={selectedSession}
                ideas={sessionIdeas}
                onGenerateIdeas={handleGenerateIdeas}
                onRateIdea={handleRateIdea}
                onSaveIdea={handleSaveIdea}
                onDeleteIdea={handleDeleteIdea}
                onCopyIdea={handleCopyIdea}
                isGenerating={isGenerating}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Brain className="h-16 w-16 mb-4 opacity-50" />
                <h2 className="text-lg font-medium">{t('brainstormingAssistant.selectSession')}</h2>
                <p className="text-sm mt-1">{t('brainstormingAssistant.selectSessionDescription')}</p>
                <Button
                  className="mt-4"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('brainstormingAssistant.newSession')}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Create Dialog */}
        <CreateSessionDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreateSession}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('brainstormingAssistant.deleteSessionTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('brainstormingAssistant.deleteSessionDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('common.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageContainer>
  );
}
