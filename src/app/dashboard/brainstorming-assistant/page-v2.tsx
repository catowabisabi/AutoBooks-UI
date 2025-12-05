'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Search,
  Plus,
  MoreHorizontal,
  Shield,
  TrendingUp,
  DollarSign,
  Scale,
  Users,
  MessageSquare,
  FileText,
  Brain,
  Lightbulb,
  Sparkles,
  Loader2,
  Send,
  ThumbsUp,
  ThumbsDown,
  Star,
  Clock,
  Zap,
  FolderOpen,
  ArrowRight,
  RefreshCw,
  Target,
  Briefcase,
  Megaphone,
  PieChart,
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
import { cn } from '@/lib/utils';
import { aiApi } from '@/lib/api';
import {
  useBrainstormSessions,
  useBrainstormSession,
  useBrainstormIdeas,
  useCreateBrainstormSession,
  useGenerateIdeas,
  useRateIdea,
  type BrainstormSession,
  type BrainstormSessionListItem,
  type BrainstormIdea,
  type SessionType,
} from '@/features/ai-assistants';
import { useToast } from '@/hooks/use-toast';

// Session Type Configuration
const SESSION_TYPES = {
  STRATEGY: { label: 'Strategy', icon: Target, color: 'bg-blue-500' },
  PITCH_WRITER: { label: 'Pitch Writer', icon: Briefcase, color: 'bg-purple-500' },
  MARKET_ANALYSIS: { label: 'Market Analysis', icon: PieChart, color: 'bg-green-500' },
  CAMPAIGN_BREAKDOWN: { label: 'Campaign', icon: Megaphone, color: 'bg-orange-500' },
  IDEA_GENERATOR: { label: 'Ideas', icon: Lightbulb, color: 'bg-yellow-500' },
  FINANCIAL_PLANNING: { label: 'Financial', icon: DollarSign, color: 'bg-emerald-500' },
  RISK_ASSESSMENT: { label: 'Risk', icon: Shield, color: 'bg-red-500' },
  PROCESS_OPTIMIZATION: { label: 'Process', icon: Zap, color: 'bg-cyan-500' },
};

// Session Card Component
function SessionCard({
  session,
  isSelected,
  onClick,
}: {
  session: BrainstormSessionListItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  const typeConfig = SESSION_TYPES[session.session_type as keyof typeof SESSION_TYPES] || SESSION_TYPES.STRATEGY;
  const TypeIcon = typeConfig.icon;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", typeConfig.color)}>
            <TypeIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{session.title}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {session.prompt?.substring(0, 80)}...
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            {session.ideas_count || 0} ideas
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(session.created_at).toLocaleDateString()}
          </div>
          <Badge variant="outline" className="text-xs">
            {typeConfig.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// Idea Card Component
function IdeaCard({
  idea,
  onRate,
}: {
  idea: BrainstormIdea;
  onRate: (rating: 'up' | 'down') => void;
}) {
  return (
    <Card className="transition-all">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-full shrink-0 bg-muted">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm">{idea.content}</p>
            
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onRate('up')}
                >
                  <ThumbsUp className={cn(
                    "h-3.5 w-3.5",
                    idea.rating && idea.rating > 0 && "fill-green-500 text-green-500"
                  )} />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {idea.rating || 0}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onRate('down')}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              {idea.category && (
                <Badge variant="outline" className="text-xs">
                  {idea.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Data type for creating session
interface CreateSessionData {
  title: string;
  session_type?: SessionType;
  prompt?: string;
  context?: string;
  target_outcome?: string;
}

// Create Session Dialog
function CreateSessionDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSessionData) => void;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>('STRATEGY');
  const [targetOutcome, setTargetOutcome] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !prompt.trim()) return;
    onSubmit({
      title,
      prompt,
      session_type: sessionType,
      target_outcome: targetOutcome,
    });
    // Reset
    setTitle('');
    setPrompt('');
    setSessionType('STRATEGY');
    setTargetOutcome('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            New Brainstorm Session
          </DialogTitle>
          <DialogDescription>
            Start a new brainstorming session. AI will help generate ideas based on your prompt.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              placeholder="e.g., Q3 Marketing Strategy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">Session Type</Label>
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
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prompt">Prompt & Background</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the problem, situation, or topic you want to brainstorm about..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="outcome">Target Outcome (Optional)</Label>
            <Input
              id="outcome"
              placeholder="What do you want to achieve?"
              value={targetOutcome}
              onChange={(e) => setTargetOutcome(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim() || !prompt.trim()}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Session Detail Panel
function SessionDetailPanel({
  session,
  ideas,
  isLoadingIdeas,
  onGenerateIdeas,
  onRateIdea,
  isGenerating,
}: {
  session: BrainstormSession;
  ideas: BrainstormIdea[];
  isLoadingIdeas: boolean;
  onGenerateIdeas: () => void;
  onRateIdea: (ideaId: string, rating: 'up' | 'down') => void;
  isGenerating: boolean;
}) {
  const typeConfig = SESSION_TYPES[session.session_type as keyof typeof SESSION_TYPES] || SESSION_TYPES.STRATEGY;
  const TypeIcon = typeConfig.icon;

  // Chat for the session
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const existingIdeas = ideas.map((i: BrainstormIdea) => `- ${i.content}`).join('\n');
      const systemPrompt = `You are a creative brainstorming assistant for WiseMatic ERP. The current session is: "${session.title}" with prompt: "${session.prompt}". Existing ideas:\n${existingIdeas}\n\nHelp the user expand on these ideas, suggest new ones, or provide feedback.`;

      const response = await aiApi.chatWithHistory(
        [...chatMessages.slice(-5), { role: 'user', content: userMsg }],
        'openai',
        { systemPrompt }
      );

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: response.content || "I can help you brainstorm more ideas. What aspect would you like to explore?"
      }]);
    } catch (error) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "Let me help you brainstorm! Consider thinking about different perspectives, combining existing ideas, or exploring edge cases."
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-start gap-3">
          <div className={cn("p-2.5 rounded-lg", typeConfig.color)}>
            <TypeIcon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{session.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{session.prompt}</p>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline">{typeConfig.label}</Badge>
              <span className="text-xs text-muted-foreground">
                {ideas.length} ideas
              </span>
              <span className="text-xs text-muted-foreground">
                Created {new Date(session.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Button
            onClick={onGenerateIdeas}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate Ideas
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Ideas List */}
        <div className="flex-1 border-r">
          <div className="p-3 border-b">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Ideas ({ideas.length})
            </h3>
          </div>
          <ScrollArea className="h-[calc(100%-45px)]">
            <div className="p-3 space-y-3">
              {isLoadingIdeas ? (
                [...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))
              ) : ideas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mb-2" />
                  <p className="text-sm">No ideas yet</p>
                  <p className="text-xs">Click "Generate Ideas" to get started</p>
                </div>
              ) : (
                ideas.map(idea => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onRate={(rating) => onRateIdea(idea.id, rating)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Panel */}
        <div className="w-80 flex flex-col">
          <div className="p-3 border-b">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              AI Discussion
            </h3>
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {chatMessages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">
                  Chat with AI to explore ideas deeper
                </p>
              )}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "max-w-[90%] rounded-lg p-2.5 text-sm",
                    msg.role === 'user'
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-muted"
                  )}
                >
                  {msg.content}
                </div>
              ))}
              {chatLoading && (
                <div className="mr-auto bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Discuss ideas..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                disabled={chatLoading}
                className="h-8 text-sm"
              />
              <Button size="sm" onClick={handleChat} disabled={chatLoading}>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Brainstorming Page
export default function BrainstormingAssistantPageV2() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { toast } = useToast();

  // API Hooks
  const { data: sessions = [], isLoading: sessionsLoading, refetch: refetchSessions } = useBrainstormSessions();
  const { data: selectedSession } = useBrainstormSession(selectedSessionId || '', { enabled: !!selectedSessionId });
  const { data: ideas = [], isLoading: ideasLoading, refetch: refetchIdeas } = useBrainstormIdeas(
    selectedSessionId || '',
    { enabled: !!selectedSessionId }
  );
  const createSessionMutation = useCreateBrainstormSession();
  const generateIdeasMutation = useGenerateIdeas();
  const rateIdeaMutation = useRateIdea();

  // Filter sessions
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const query = searchQuery.toLowerCase();
    return sessions.filter((s: BrainstormSessionListItem) =>
      s.title.toLowerCase().includes(query) ||
      s.prompt?.toLowerCase().includes(query)
    );
  }, [sessions, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    totalSessions: sessions.length,
    totalIdeas: sessions.reduce((acc: number, s: BrainstormSessionListItem) => acc + (s.ideas_count || 0), 0),
    selectedIdeas: ideas.length,
  }), [sessions, ideas]);

  // Handlers
  const handleCreateSession = async (data: CreateSessionData) => {
    try {
      const result = await createSessionMutation.mutateAsync(data);
      const newSession = result as BrainstormSession;
      setCreateDialogOpen(false);
      setSelectedSessionId(newSession.id);
      toast({ title: 'Session created!' });
    } catch (error) {
      toast({ title: 'Failed to create session', variant: 'destructive' });
    }
  };

  const handleGenerateIdeas = () => {
    if (!selectedSessionId) return;
    generateIdeasMutation.mutate(selectedSessionId, {
      onSuccess: () => {
        refetchIdeas();
        toast({ title: 'Ideas generated!' });
      },
    });
  };

  const handleRateIdea = (ideaId: string, rating: 'up' | 'down') => {
    rateIdeaMutation.mutate(
      { ideaId, rating: rating === 'up' ? 1 : -1 },
      { onSuccess: () => refetchIdeas() }
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-7 w-7 text-purple-500" />
              Brainstorming Assistant
            </h1>
            <p className="text-muted-foreground">
              AI-powered ideation and creative problem solving
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1">
                <FolderOpen className="h-3 w-3" />
                {stats.totalSessions} Sessions
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Lightbulb className="h-3 w-3" />
                {stats.totalIdeas} Ideas
              </Badge>
            </div>
            <Button variant="outline" size="icon" onClick={() => refetchSessions()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sessions Sidebar */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-3">
              {sessionsLoading ? (
                [...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))
              ) : filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <Brain className="h-12 w-12 mb-2" />
                  <p className="text-sm">No sessions yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Session
                  </Button>
                </div>
              ) : (
                filteredSessions.map((session: BrainstormSessionListItem) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isSelected={selectedSessionId === session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {selectedSession ? (
            <SessionDetailPanel
              session={selectedSession}
              ideas={ideas}
              isLoadingIdeas={ideasLoading}
              onGenerateIdeas={handleGenerateIdeas}
              onRateIdea={handleRateIdea}
              isGenerating={generateIdeasMutation.isPending}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Brain className="h-20 w-20 mb-4" />
              <h2 className="text-xl font-medium">Select a Session</h2>
              <p className="text-sm mt-1">Choose a session from the sidebar or create a new one</p>
              <Button
                className="mt-4"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Brainstorm Session
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
        isSubmitting={createSessionMutation.isPending}
      />
    </div>
  );
}
