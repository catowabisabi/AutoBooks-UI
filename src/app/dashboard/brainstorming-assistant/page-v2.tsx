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
  Users,
  UserPlus,
  Mail,
  AtSign,
  Building2,
  X,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <CardContent className="p-2">
        <div className="flex gap-1.5">
          <div className="p-0.5 rounded-full shrink-0 bg-muted h-fit">
            <Lightbulb className={cn(
              "h-3 w-3",
              idea.is_saved ? "text-green-600" : "text-muted-foreground"
            )} />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs whitespace-pre-wrap leading-relaxed">{idea.content}</p>
            
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t">
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => onRate('up')}
                >
                  <ThumbsUp className={cn(
                    "h-2.5 w-2.5",
                    idea.rating > 0 && "fill-green-500 text-green-500"
                  )} />
                </Button>
                <span className="text-[10px] text-muted-foreground min-w-[16px] text-center">
                  {idea.rating}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => onRate('down')}
                >
                  <ThumbsDown className={cn(
                    "h-2.5 w-2.5",
                    idea.rating < 0 && "fill-red-500 text-red-500"
                  )} />
                </Button>
              </div>
              
              <div className="flex items-center gap-0.5">
                {idea.category && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 mr-0.5">
                    {idea.category}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-2.5 w-2.5 text-green-500" />
                  ) : (
                    <Copy className="h-2.5 w-2.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-5 w-5", idea.is_saved && "text-green-600")}
                  onClick={onSave}
                >
                  <Save className={cn("h-2.5 w-2.5", idea.is_saved && "fill-current")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-destructive opacity-0 group-hover:opacity-100"
                  onClick={onDelete}
                >
                  <Trash2 className="h-2.5 w-2.5" />
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
// Team Member Type
// =========================================

interface TeamMember {
  id: string;
  type: 'email' | 'userId' | 'nickname' | 'department';
  value: string;
  status: 'pending' | 'found' | 'not_found';
  name?: string;
}

// =========================================
// Invite Team Dialog
// =========================================

function InviteTeamDialog({
  open,
  onOpenChange,
  sessionTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionTitle: string;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'email' | 'userId' | 'nickname' | 'department'>('email');
  const [inputValue, setInputValue] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleAddMember = async () => {
    if (!inputValue.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API search - in real app, this would call backend
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Demo: random success/failure for demonstration
    const found = Math.random() > 0.3;
    
    const newMember: TeamMember = {
      id: generateId(),
      type: activeTab,
      value: inputValue.trim(),
      status: found ? 'found' : 'not_found',
      name: found ? `User ${inputValue.substring(0, 2).toUpperCase()}` : undefined,
    };
    
    setMembers(prev => [...prev, newMember]);
    setInputValue('');
    setIsSearching(false);

    if (!found) {
      toast({
        title: t('brainstormingAssistant.invite.notFound'),
        description: t('brainstormingAssistant.invite.notFoundDescription', { value: inputValue }),
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleSendInvites = () => {
    const validMembers = members.filter(m => m.status === 'found');
    if (validMembers.length === 0) {
      toast({
        title: t('brainstormingAssistant.invite.noValidMembers'),
        variant: 'destructive',
      });
      return;
    }
    
    // In real app, this would call backend API
    toast({
      title: t('brainstormingAssistant.invite.sent'),
      description: t('brainstormingAssistant.invite.sentDescription', { count: validMembers.length }),
    });
    
    setMembers([]);
    onOpenChange(false);
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'email': return t('brainstormingAssistant.invite.emailPlaceholder');
      case 'userId': return t('brainstormingAssistant.invite.userIdPlaceholder');
      case 'nickname': return t('brainstormingAssistant.invite.nicknamePlaceholder');
      case 'department': return t('brainstormingAssistant.invite.departmentPlaceholder');
    }
  };

  const getIcon = () => {
    switch (activeTab) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'userId': return <AtSign className="h-4 w-4" />;
      case 'nickname': return <Users className="h-4 w-4" />;
      case 'department': return <Building2 className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-purple-500" />
            {t('brainstormingAssistant.invite.title')}
          </DialogTitle>
          <DialogDescription>
            {t('brainstormingAssistant.invite.description', { session: sessionTitle })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="email" className="text-xs">
                <Mail className="h-3 w-3 mr-1" />
                {t('brainstormingAssistant.invite.byEmail')}
              </TabsTrigger>
              <TabsTrigger value="userId" className="text-xs">
                <AtSign className="h-3 w-3 mr-1" />
                {t('brainstormingAssistant.invite.byUserId')}
              </TabsTrigger>
              <TabsTrigger value="nickname" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {t('brainstormingAssistant.invite.byNickname')}
              </TabsTrigger>
              <TabsTrigger value="department" className="text-xs">
                <Building2 className="h-3 w-3 mr-1" />
                {t('brainstormingAssistant.invite.byDepartment')}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {getIcon()}
              </div>
              <Input
                placeholder={getPlaceholder()}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                className="pl-10"
                disabled={isSearching}
              />
            </div>
            <Button onClick={handleAddMember} disabled={!inputValue.trim() || isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>

          {/* Members List */}
          {members.length > 0 && (
            <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      member.status === 'found' ? "bg-green-500/10" : "bg-red-500/10"
                    )}>
                      {member.type === 'email' && <Mail className={cn("h-4 w-4", member.status === 'found' ? "text-green-500" : "text-red-500")} />}
                      {member.type === 'userId' && <AtSign className={cn("h-4 w-4", member.status === 'found' ? "text-green-500" : "text-red-500")} />}
                      {member.type === 'nickname' && <Users className={cn("h-4 w-4", member.status === 'found' ? "text-green-500" : "text-red-500")} />}
                      {member.type === 'department' && <Building2 className={cn("h-4 w-4", member.status === 'found' ? "text-green-500" : "text-red-500")} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.value}</p>
                      <p className={cn("text-xs", member.status === 'found' ? "text-green-600" : "text-red-500")}>
                        {member.status === 'found' 
                          ? (member.name || t('brainstormingAssistant.invite.userFound'))
                          : t('brainstormingAssistant.invite.userNotFound')
                        }
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveMember(member.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSendInvites} 
            disabled={members.filter(m => m.status === 'found').length === 0}
          >
            <Send className="h-4 w-4 mr-1" />
            {t('brainstormingAssistant.invite.sendInvites')} ({members.filter(m => m.status === 'found').length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =========================================
// AI Chat Message Type
// =========================================

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: {
    title?: string;
    prompt?: string;
    targetOutcome?: string;
    sessionType?: SessionType;
  };
}

// =========================================
// Create Session Dialog with AI Assistant
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
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>('STRATEGY');
  const [targetOutcome, setTargetOutcome] = useState('');
  
  // AI Assistant states
  const [showAiAssistant, setShowAiAssistant] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Initial greeting when dialog opens
  useEffect(() => {
    if (open && chatMessages.length === 0) {
      setChatMessages([{
        id: '1',
        role: 'assistant',
        content: t('brainstormingAssistant.aiAssistant.greeting'),
        timestamp: new Date(),
      }]);
    }
  }, [open, t]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setChatMessages([]);
      setChatInput('');
      setTitle('');
      setPrompt('');
      setSessionType('STRATEGY');
      setTargetOutcome('');
    }
  }, [open]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiThinking) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAiThinking(true);

    try {
      // Detect if user input contains Chinese characters
      const hasChinese = /[\u4e00-\u9fff]/.test(userMessage.content);
      const responseLanguage = hasChinese ? '繁體中文' : 'English';
      
      const aiPrompt = `You are a professional brainstorming session planning assistant. The user wants to create a new brainstorming session.

User says: "${userMessage.content}"

Based on the user's description, please help generate appropriate session settings. Reply in JSON format with the following fields:
- title: Suggested session title (concise and impactful, 10-30 characters)
- prompt: Detailed topic prompt (describing the problem or direction to explore, 50-150 characters)
- targetOutcome: Expected outcome (specific and measurable goals, 30-80 characters)
- sessionType: Session type, must be one of: STRATEGY, PITCH_WRITER, MARKET_ANALYSIS, CAMPAIGN_BREAKDOWN, IDEA_GENERATOR, FINANCIAL_PLANNING, RISK_ASSESSMENT, PROCESS_OPTIMIZATION
- explanation: Explanation for the user (explain your suggestions in a friendly tone)

Available session types:
- STRATEGY: Strategy Planning - business strategy, company direction
- PITCH_WRITER: Pitch Writer - product presentations, investment proposals
- MARKET_ANALYSIS: Market Analysis - market research, competitive analysis
- CAMPAIGN_BREAKDOWN: Marketing Campaign - promotional activities, advertising plans
- IDEA_GENERATOR: Idea Generation - innovative ideas, new product concepts
- FINANCIAL_PLANNING: Financial Planning - budgets, financial strategies
- RISK_ASSESSMENT: Risk Assessment - risk identification, response strategies
- PROCESS_OPTIMIZATION: Process Optimization - efficiency improvement, workflow optimization

IMPORTANT: Reply in ${responseLanguage}. Output JSON only, no other text.`;

      const response = await aiApi.chat(aiPrompt, 'openai');
      const content = response.content || '';
      
      // Parse JSON from response
      let suggestions: ChatMessage['suggestions'] = {};
      let explanation = '';
      
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          suggestions = {
            title: parsed.title,
            prompt: parsed.prompt,
            targetOutcome: parsed.targetOutcome,
            sessionType: parsed.sessionType as SessionType,
          };
          explanation = parsed.explanation || t('brainstormingAssistant.aiAssistant.suggestionReady');
        } else {
          explanation = content;
        }
      } catch {
        explanation = content || t('brainstormingAssistant.aiAssistant.parseError');
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: explanation,
        timestamp: new Date(),
        suggestions: Object.keys(suggestions).length > 0 ? suggestions : undefined,
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('brainstormingAssistant.aiAssistant.error'),
        timestamp: new Date(),
      }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const applySuggestions = (suggestions: ChatMessage['suggestions']) => {
    if (!suggestions) return;
    if (suggestions.title) setTitle(suggestions.title);
    if (suggestions.prompt) setPrompt(suggestions.prompt);
    if (suggestions.targetOutcome) setTargetOutcome(suggestions.targetOutcome);
    if (suggestions.sessionType) setSessionType(suggestions.sessionType);
    toast({
      title: t('brainstormingAssistant.aiAssistant.applied'),
      description: t('brainstormingAssistant.aiAssistant.appliedDescription'),
    });
  };

  const handleSubmit = () => {
    if (!title.trim() || !prompt.trim()) return;
    onSubmit({
      title: title.trim(),
      prompt: prompt.trim(),
      session_type: sessionType,
      target_outcome: targetOutcome.trim() || undefined,
    });
    onOpenChange(false);
  };

  const selectedType = SESSION_TYPES[sessionType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] w-[95vw] max-h-[90vh] overflow-hidden p-0">
        <div className="flex h-[85vh] min-h-[600px]">
          {/* Left: AI Assistant Chat */}
          {showAiAssistant && (
            <div className="w-[450px] min-w-[400px] border-r flex flex-col bg-muted/30">
              <div className="p-4 border-b bg-gradient-to-r from-purple-500/10 to-blue-500/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t('brainstormingAssistant.aiAssistant.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('brainstormingAssistant.aiAssistant.subtitle')}</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages - Fixed height with overflow */}
              <div className="flex-1 overflow-y-auto p-4" ref={chatScrollRef}>
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === 'assistant' && (
                        <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 h-fit shrink-0">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[85%] rounded-xl px-4 py-3",
                          msg.role === 'user'
                            ? "bg-primary text-primary-foreground"
                            : "bg-background border shadow-sm"
                        )}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                        
                        {/* Suggestions Card */}
                        {msg.suggestions && (
                          <div className="mt-3 p-3 bg-muted rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground">
                                {t('brainstormingAssistant.aiAssistant.suggestions')}
                              </span>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 text-xs"
                                onClick={() => applySuggestions(msg.suggestions)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                {t('brainstormingAssistant.aiAssistant.apply')}
                              </Button>
                            </div>
                            {msg.suggestions.title && (
                              <div>
                                <span className="text-xs text-muted-foreground">{t('brainstormingAssistant.sessionTitle')}</span>
                                <p className="text-sm font-medium">{msg.suggestions.title}</p>
                              </div>
                            )}
                            {msg.suggestions.sessionType && (
                              <div>
                                <span className="text-xs text-muted-foreground">{t('brainstormingAssistant.sessionType')}</span>
                                <p className="text-sm font-medium">{t(SESSION_TYPES[msg.suggestions.sessionType].labelKey)}</p>
                              </div>
                            )}
                            {msg.suggestions.prompt && (
                              <div>
                                <span className="text-xs text-muted-foreground">{t('brainstormingAssistant.prompt')}</span>
                                <p className="text-sm line-clamp-3">{msg.suggestions.prompt}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="p-2 rounded-full bg-primary h-fit shrink-0">
                          <MessageSquare className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isAiThinking && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 h-fit">
                        <Sparkles className="h-4 w-4 text-white animate-pulse" />
                      </div>
                      <div className="bg-background border rounded-xl px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('brainstormingAssistant.aiAssistant.thinking')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t bg-background shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    ref={inputRef}
                    placeholder={t('brainstormingAssistant.aiAssistant.inputPlaceholder')}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isAiThinking}
                    className="flex-1 h-10"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-10 w-10"
                    disabled={!chatInput.trim() || isAiThinking}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {t('brainstormingAssistant.aiAssistant.hint')}
                </p>
              </div>
            </div>
          )}

          {/* Right: Form */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-[400px]">
            <DialogHeader className="p-5 border-b shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-500" />
                  <DialogTitle className="text-lg">{t('brainstormingAssistant.newSession')}</DialogTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAiAssistant(!showAiAssistant)}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {showAiAssistant ? t('brainstormingAssistant.aiAssistant.hide') : t('brainstormingAssistant.aiAssistant.show')}
                </Button>
              </div>
              <DialogDescription className="text-sm">
                {t('brainstormingAssistant.newSessionDescription')}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-sm font-medium">{t('brainstormingAssistant.sessionTitle')}</Label>
                  <Input
                    id="title"
                    placeholder={t('brainstormingAssistant.sessionTitlePlaceholder')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type" className="text-sm font-medium">{t('brainstormingAssistant.sessionType')}</Label>
                  <Select value={sessionType} onValueChange={(v) => setSessionType(v as SessionType)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SESSION_TYPES).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div className={cn("p-1.5 rounded", config.color)}>
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                              <span>{t(config.labelKey)}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedType && (
                    <p className="text-sm text-muted-foreground">{selectedType.description}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="prompt" className="text-sm font-medium">{t('brainstormingAssistant.prompt')}</Label>
                  <Textarea
                    id="prompt"
                    placeholder={t('brainstormingAssistant.promptPlaceholder')}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                    className="resize-none text-sm"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="outcome" className="text-sm font-medium">{t('brainstormingAssistant.targetOutcome')}</Label>
                  <Input
                    id="outcome"
                    placeholder={t('brainstormingAssistant.targetOutcomePlaceholder')}
                    value={targetOutcome}
                    onChange={(e) => setTargetOutcome(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="p-5 border-t shrink-0">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={!title.trim() || !prompt.trim()}>
                {t('brainstormingAssistant.createSession')}
              </Button>
            </DialogFooter>
          </div>
        </div>
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
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const typeConfig = SESSION_TYPES[session.session_type] || SESSION_TYPES.STRATEGY;
  const TypeIcon = typeConfig.icon;

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const savedIdeasCount = ideas.filter(i => i.is_saved).length;
  const isEnglish = locale === 'en';

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
      const systemPrompt = isEnglish 
        ? `You are an AI brainstorming assistant for AutoBooks ERP.
Current session: "${session.title}"
Session type: ${t(typeConfig.labelKey)}
Topic prompt: "${session.prompt}"
${session.target_outcome ? `Target outcome: ${session.target_outcome}` : ''}
${existingIdeas ? `\nExisting ideas:\n${existingIdeas}` : ''}

Help the user expand these ideas, provide new suggestions, or give feedback. Reply in English.`
        : `你是 AutoBooks ERP 的 AI 腦力激盪助手。
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

      const defaultResponse = isEnglish 
        ? "I can help you think further about this. What angle would you like to explore?"
        : "我可以幫你進一步思考這個問題。你想從哪個角度來探討？";

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.content || defaultResponse,
        timestamp: new Date(),
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorContent = isEnglish 
        ? "Let me help you brainstorm! Consider thinking from different angles, combining existing ideas, or exploring edge cases."
        : "讓我幫你腦力激盪！可以考慮從不同角度思考、結合現有點子，或探索邊緣案例。";
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: errorContent,
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
    
    const dateLocale = isEnglish ? 'en-US' : 'zh-TW';
    const content = isEnglish 
      ? `# ${session.title}\n\n` +
        `**Type:** ${t(typeConfig.labelKey)}\n` +
        `**Prompt:** ${session.prompt}\n` +
        `${session.target_outcome ? `**Target:** ${session.target_outcome}\n` : ''}` +
        `**Created:** ${new Date(session.created_at).toLocaleDateString(dateLocale)}\n\n` +
        `## Ideas (${toExport.length})\n\n` +
        toExport.map((idea, idx) => 
          `${idx + 1}. ${idea.content}${idea.category ? ` [${idea.category}]` : ''} ${idea.is_saved ? '⭐' : ''}`
        ).join('\n\n')
      : `# ${session.title}\n\n` +
        `**類型:** ${t(typeConfig.labelKey)}\n` +
        `**提示:** ${session.prompt}\n` +
        `${session.target_outcome ? `**目標:** ${session.target_outcome}\n` : ''}` +
        `**建立日期:** ${new Date(session.created_at).toLocaleDateString(dateLocale)}\n\n` +
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
                {new Date(session.created_at).toLocaleDateString(isEnglish ? 'en-US' : 'zh-TW')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="h-3.5 w-3.5 mr-1" />
              {t('brainstormingAssistant.invite.button')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportIdeas}>
              <Download className="h-3.5 w-3.5 mr-1" />
              {t('brainstormingAssistant.export')}
            </Button>
          </div>
        </div>
      </div>

      {/* Invite Team Dialog */}
      <InviteTeamDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        sessionTitle={session.title}
      />

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
        <div className="w-64 lg:w-72 flex flex-col shrink-0">
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
  const { t, locale } = useTranslation();
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
      const isEnglish = locale === 'en';
      const langInstructions = isEnglish 
        ? 'Reply in English. Separate each idea with a new line. Do not add numbers.'
        : '用繁體中文回覆，每個點子用換行分隔，不要加編號。';
      
      const prompt = isEnglish 
        ? `You are a professional ${t(typeConfig.labelKey)} expert.

Task: ${selectedSession.prompt}
${customPrompt ? `Additional requirements: ${customPrompt}` : ''}
${selectedSession.target_outcome ? `Expected outcome: ${selectedSession.target_outcome}` : ''}

Please generate 5 innovative and practical ideas. Each idea should be specific, actionable, and provide unique insights.
${langInstructions}`
        : `你是一個專業的 ${t(typeConfig.labelKey)} 專家。
      
任務: ${selectedSession.prompt}
${customPrompt ? `額外要求: ${customPrompt}` : ''}
${selectedSession.target_outcome ? `期望成果: ${selectedSession.target_outcome}` : ''}

請生成 5 個創新且實用的點子。每個點子要具體、可執行、並帶有獨特見解。
${langInstructions}`;

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
  }, [selectedSession, isGenerating, ideas, sessions, toast, t, locale]);

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
              <div className="h-full flex flex-col">
                {/* Welcome Section */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="max-w-4xl mx-auto">
                    {/* Hero Card */}
                    <Card className="mb-4 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 border-none">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-md">
                            <Brain className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h2 className="text-lg font-bold mb-1">{t('brainstormingAssistant.welcome.title')}</h2>
                            <p className="text-sm text-muted-foreground mb-3">{t('brainstormingAssistant.welcome.description')}</p>
                            <Button size="sm" onClick={() => setCreateDialogOpen(true)} className="gap-2">
                              <Sparkles className="h-4 w-4" />
                              {t('brainstormingAssistant.newSession')}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <Card>
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <FolderOpen className="h-5 w-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-xl font-bold">{stats.totalSessions}</p>
                            <p className="text-xs text-muted-foreground">{t('brainstormingAssistant.sessions')}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-amber-500/10">
                            <Lightbulb className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-xl font-bold">{stats.totalIdeas}</p>
                            <p className="text-xs text-muted-foreground">{t('brainstormingAssistant.ideas')}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            <Save className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <p className="text-xl font-bold">{stats.savedIdeas}</p>
                            <p className="text-xs text-muted-foreground">{t('brainstormingAssistant.saved')}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Session Types Grid */}
                    <h3 className="text-sm font-semibold mb-3">{t('brainstormingAssistant.welcome.sessionTypes')}</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                      {Object.entries(SESSION_TYPES).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <Card 
                            key={key} 
                            className="cursor-pointer hover:shadow-md transition-all hover:border-purple-500/50"
                            onClick={() => setCreateDialogOpen(true)}
                          >
                            <CardContent className="p-3 flex flex-col items-center text-center">
                              <div className={cn("p-2 rounded-lg mb-2", config.color)}>
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <p className="font-medium text-xs">{t(config.labelKey)}</p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Recent Sessions */}
                    {sessions.length > 0 && (
                      <>
                        <h3 className="text-sm font-semibold mb-3">{t('brainstormingAssistant.welcome.recentSessions')}</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                          {sessions.slice(0, 4).map((session) => {
                            const typeConfig = SESSION_TYPES[session.session_type] || SESSION_TYPES.STRATEGY;
                            const Icon = typeConfig.icon;
                            return (
                              <Card 
                                key={session.id} 
                                className="cursor-pointer hover:shadow-md transition-all hover:border-purple-500/50"
                                onClick={() => setSelectedSessionId(session.id)}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-2">
                                    <div className={cn("p-1.5 rounded-lg shrink-0", typeConfig.color)}>
                                      <Icon className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-sm truncate">{session.title}</h4>
                                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{session.prompt}</p>
                                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                                        <span className="flex items-center gap-0.5">
                                          <Lightbulb className="h-2.5 w-2.5" />
                                          {session.ideas_count} {t('brainstormingAssistant.ideas')}
                                        </span>
                                        <span className="flex items-center gap-0.5">
                                          <Clock className="h-2.5 w-2.5" />
                                          {new Date(session.created_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* Tips Section */}
                    {sessions.length === 0 && (
                      <Card className="bg-muted/50 mt-4">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            {t('brainstormingAssistant.welcome.tips')}
                          </h3>
                          <ul className="space-y-1.5 text-xs text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <span className="text-purple-500">•</span>
                              {t('brainstormingAssistant.welcome.tip1')}
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-500">•</span>
                              {t('brainstormingAssistant.welcome.tip2')}
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-500">•</span>
                              {t('brainstormingAssistant.welcome.tip3')}
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
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
