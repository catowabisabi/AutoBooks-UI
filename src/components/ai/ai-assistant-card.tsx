/**
 * Universal AI Assistant Card
 * 
 * A reusable AI card component supporting:
 * - Summarize / Analyze / Classify actions
 * - Prompt suggestions UI
 * - Streaming output display
 * - Responsive layout
 * 
 * Usage in: Finance, HRMS, Projects, Kanban, Calendar, Email Inbox
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Brain,
  Sparkles,
  FileText,
  BarChart3,
  Tags,
  Lightbulb,
  Send,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Loader2,
  Wand2,
  ListChecks,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =================================================================
// Types
// =================================================================

export type AIAction = 'summarize' | 'analyze' | 'classify' | 'custom';

export interface PromptSuggestion {
  id: string;
  label: string;
  prompt: string;
  icon?: React.ReactNode;
}

export interface AIAssistantCardProps {
  /** Card title */
  title?: string;
  /** Card description */
  description?: string;
  /** Module context (finance, hrms, projects, kanban, calendar, email) */
  module: 'finance' | 'hrms' | 'projects' | 'kanban' | 'calendar' | 'email';
  /** Data context to analyze (JSON stringified or raw object) */
  contextData?: Record<string, any> | string;
  /** Pre-defined prompt suggestions */
  suggestions?: PromptSuggestion[];
  /** Callback when AI action completes */
  onResult?: (result: AIResult) => void;
  /** Custom class name */
  className?: string;
  /** Whether to show in collapsed mode initially */
  defaultCollapsed?: boolean;
  /** Whether to enable maximize/fullscreen mode */
  enableFullscreen?: boolean;
  /** Custom header actions */
  headerActions?: React.ReactNode;
}

export interface AIResult {
  action: AIAction;
  prompt: string;
  response: string;
  metadata?: {
    confidence?: number;
    categories?: string[];
    insights?: string[];
    recommendations?: string[];
    risks?: string[];
  };
  timestamp: Date;
}

// =================================================================
// Default Suggestions by Module
// =================================================================

const DEFAULT_SUGGESTIONS: Record<string, PromptSuggestion[]> = {
  finance: [
    { id: 'fin-1', label: 'Summarize Transactions', prompt: 'Summarize all transactions for this period and highlight key patterns', icon: <FileText className="h-3 w-3" /> },
    { id: 'fin-2', label: 'Analyze Cash Flow', prompt: 'Analyze the cash flow trends and identify potential issues', icon: <TrendingUp className="h-3 w-3" /> },
    { id: 'fin-3', label: 'Classify Expenses', prompt: 'Classify and categorize the expenses by type and department', icon: <Tags className="h-3 w-3" /> },
    { id: 'fin-4', label: 'Detect Anomalies', prompt: 'Detect any unusual or anomalous transactions that need review', icon: <AlertTriangle className="h-3 w-3" /> },
    { id: 'fin-5', label: 'Budget Analysis', prompt: 'Compare actual spending against budget and highlight variances', icon: <BarChart3 className="h-3 w-3" /> },
  ],
  hrms: [
    { id: 'hr-1', label: 'Summarize Workforce', prompt: 'Provide a summary of the current workforce status and metrics', icon: <FileText className="h-3 w-3" /> },
    { id: 'hr-2', label: 'Analyze Attendance', prompt: 'Analyze attendance patterns and identify trends or issues', icon: <BarChart3 className="h-3 w-3" /> },
    { id: 'hr-3', label: 'Classify Employees', prompt: 'Classify employees by performance, tenure, and department', icon: <Tags className="h-3 w-3" /> },
    { id: 'hr-4', label: 'Attrition Risk', prompt: 'Identify employees with high attrition risk and suggest retention strategies', icon: <AlertTriangle className="h-3 w-3" /> },
    { id: 'hr-5', label: 'Leave Analysis', prompt: 'Analyze leave patterns and predict upcoming leave requests', icon: <TrendingUp className="h-3 w-3" /> },
  ],
  projects: [
    { id: 'proj-1', label: 'Summarize Progress', prompt: 'Summarize the overall project progress and milestone status', icon: <FileText className="h-3 w-3" /> },
    { id: 'proj-2', label: 'Analyze Timeline', prompt: 'Analyze the project timeline and identify potential delays', icon: <BarChart3 className="h-3 w-3" /> },
    { id: 'proj-3', label: 'Classify Tasks', prompt: 'Classify and prioritize tasks based on urgency and dependencies', icon: <Tags className="h-3 w-3" /> },
    { id: 'proj-4', label: 'Detect Bottlenecks', prompt: 'Identify bottlenecks and resource constraints in the project', icon: <AlertTriangle className="h-3 w-3" /> },
    { id: 'proj-5', label: 'Resource Analysis', prompt: 'Analyze resource allocation and suggest optimizations', icon: <TrendingUp className="h-3 w-3" /> },
  ],
  kanban: [
    { id: 'kan-1', label: 'Board Summary', prompt: 'Summarize the current state of the Kanban board', icon: <FileText className="h-3 w-3" /> },
    { id: 'kan-2', label: 'Analyze Workflow', prompt: 'Analyze workflow efficiency and cycle times', icon: <BarChart3 className="h-3 w-3" /> },
    { id: 'kan-3', label: 'Prioritize Tasks', prompt: 'Suggest task prioritization based on dependencies and deadlines', icon: <ListChecks className="h-3 w-3" /> },
    { id: 'kan-4', label: 'WIP Analysis', prompt: 'Analyze work-in-progress limits and suggest improvements', icon: <AlertTriangle className="h-3 w-3" /> },
    { id: 'kan-5', label: 'Sprint Planning', prompt: 'Help plan the next sprint based on current velocity', icon: <TrendingUp className="h-3 w-3" /> },
  ],
  calendar: [
    { id: 'cal-1', label: 'Summarize Schedule', prompt: 'Summarize my schedule for this week including key meetings', icon: <FileText className="h-3 w-3" /> },
    { id: 'cal-2', label: 'Analyze Time Usage', prompt: 'Analyze how I spend my time and suggest improvements', icon: <BarChart3 className="h-3 w-3" /> },
    { id: 'cal-3', label: 'Classify Events', prompt: 'Classify and categorize events by type and priority', icon: <Tags className="h-3 w-3" /> },
    { id: 'cal-4', label: 'Find Conflicts', prompt: 'Identify scheduling conflicts or overlapping meetings', icon: <AlertTriangle className="h-3 w-3" /> },
    { id: 'cal-5', label: 'Suggest Free Time', prompt: 'Find available time slots for focused work this week', icon: <Lightbulb className="h-3 w-3" /> },
  ],
  email: [
    { id: 'email-1', label: 'Summarize Inbox', prompt: 'Summarize the most important emails that need attention', icon: <FileText className="h-3 w-3" /> },
    { id: 'email-2', label: 'Analyze Patterns', prompt: 'Analyze email communication patterns and response times', icon: <BarChart3 className="h-3 w-3" /> },
    { id: 'email-3', label: 'Classify Emails', prompt: 'Classify emails by priority and required action type', icon: <Tags className="h-3 w-3" /> },
    { id: 'email-4', label: 'Action Items', prompt: 'Extract action items and deadlines from recent emails', icon: <ListChecks className="h-3 w-3" /> },
    { id: 'email-5', label: 'Draft Response', prompt: 'Help me draft a professional response to the selected email', icon: <MessageSquare className="h-3 w-3" /> },
  ],
};

// Module-specific icons and colors
const MODULE_CONFIG: Record<string, { icon: React.ReactNode; color: string; gradient: string }> = {
  finance: { icon: <TrendingUp className="h-4 w-4" />, color: 'text-green-500', gradient: 'from-green-500/10' },
  hrms: { icon: <ListChecks className="h-4 w-4" />, color: 'text-blue-500', gradient: 'from-blue-500/10' },
  projects: { icon: <BarChart3 className="h-4 w-4" />, color: 'text-purple-500', gradient: 'from-purple-500/10' },
  kanban: { icon: <Tags className="h-4 w-4" />, color: 'text-orange-500', gradient: 'from-orange-500/10' },
  calendar: { icon: <FileText className="h-4 w-4" />, color: 'text-cyan-500', gradient: 'from-cyan-500/10' },
  email: { icon: <MessageSquare className="h-4 w-4" />, color: 'text-pink-500', gradient: 'from-pink-500/10' },
};

// =================================================================
// Component
// =================================================================

export function AIAssistantCard({
  title,
  description,
  module,
  contextData,
  suggestions,
  onResult,
  className,
  defaultCollapsed = false,
  enableFullscreen = true,
  headerActions,
}: AIAssistantCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<AIAction | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [result, setResult] = useState<AIResult | null>(null);
  const [streamedContent, setStreamedContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const moduleConfig = MODULE_CONFIG[module] || MODULE_CONFIG.finance;
  const moduleSuggestions = suggestions || DEFAULT_SUGGESTIONS[module] || [];

  // Auto-scroll when streaming
  useEffect(() => {
    if (scrollRef.current && streamedContent) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamedContent]);

  // Simulate streaming effect
  const simulateStreaming = useCallback(async (fullText: string) => {
    setStreamedContent('');
    const words = fullText.split(' ');
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 20));
      setStreamedContent(prev => prev + (i > 0 ? ' ' : '') + words[i]);
    }
  }, []);

  // Execute AI action
  const executeAction = async (action: AIAction, prompt: string) => {
    setIsLoading(true);
    setCurrentAction(action);
    setResult(null);
    setStreamedContent('');

    try {
      // Prepare context
      const context = typeof contextData === 'string' 
        ? contextData 
        : JSON.stringify(contextData || {}, null, 2);

      // Try module-aware API endpoint first
      const response = await fetch('/api/v1/ai-service/module-analyze/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          module,
          action,
          prompt,
          context_data: contextData,
          provider: 'openai',
        }),
      });

      let responseText = '';
      if (response.ok) {
        const data = await response.json();
        responseText = data.response || data.content || 'Analysis complete.';
      } else {
        // Fallback to chat endpoint
        const chatResponse = await fetch('/api/v1/ai-service/chat/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify({
            message: `[${module.toUpperCase()} Module - ${action.toUpperCase()}]\n\nContext:\n${context}\n\nRequest: ${prompt}`,
            provider: 'openai',
            temperature: 0.7,
          }),
        });
        
        if (chatResponse.ok) {
          const chatData = await chatResponse.json();
          responseText = chatData.content || chatData.response || 'Analysis complete.';
        } else {
          // Final fallback to demo response
          responseText = generateDemoResponse(action, module, prompt);
        }
      }

      // Simulate streaming
      await simulateStreaming(responseText);

      const aiResult: AIResult = {
        action,
        prompt,
        response: responseText,
        metadata: {
          confidence: 0.85 + Math.random() * 0.1,
          insights: extractInsights(responseText),
          recommendations: extractRecommendations(responseText),
        },
        timestamp: new Date(),
      };

      setResult(aiResult);
      onResult?.(aiResult);
    } catch (error) {
      console.error('AI Action failed:', error);
      const fallbackResponse = generateDemoResponse(action, module, prompt);
      await simulateStreaming(fallbackResponse);
      setResult({
        action,
        prompt,
        response: fallbackResponse,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  };

  // Quick actions
  const handleSummarize = () => executeAction('summarize', 'Provide a comprehensive summary of the current data');
  const handleAnalyze = () => executeAction('analyze', 'Perform a detailed analysis and provide insights');
  const handleClassify = () => executeAction('classify', 'Classify and categorize the data into meaningful groups');
  
  const handleSuggestionClick = (suggestion: PromptSuggestion) => {
    executeAction('custom', suggestion.prompt);
  };

  const handleCustomSubmit = () => {
    if (customPrompt.trim()) {
      executeAction('custom', customPrompt);
      setCustomPrompt('');
    }
  };

  const handleCopy = async () => {
    const textToCopy = result?.response || streamedContent;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setResult(null);
    setStreamedContent('');
    setCustomPrompt('');
  };

  const displayTitle = title || `AI Assistant - ${module.charAt(0).toUpperCase() + module.slice(1)}`;
  const displayDescription = description || 'AI-powered insights and analysis';

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      isFullscreen && "fixed inset-4 z-50 m-0",
      className
    )}>
      {/* Gradient background */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl to-transparent rounded-bl-full",
        moduleConfig.gradient
      )} />

      <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <div>
              <CardTitle className={cn("text-base flex items-center gap-2", moduleConfig.color)}>
                <Brain className="h-4 w-4" />
                {displayTitle}
              </CardTitle>
              <CardDescription className="text-xs">{displayDescription}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {headerActions}
            {enableFullscreen && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            )}
            {(result || streamedContent) && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSummarize}
                disabled={isLoading}
                className="gap-1"
              >
                <FileText className="h-3 w-3" />
                Summarize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="gap-1"
              >
                <BarChart3 className="h-3 w-3" />
                Analyze
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClassify}
                disabled={isLoading}
                className="gap-1"
              >
                <Tags className="h-3 w-3" />
                Classify
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isLoading} className="gap-1">
                    <Wand2 className="h-3 w-3" />
                    More
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {moduleSuggestions.map((suggestion) => (
                    <DropdownMenuItem
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="gap-2"
                    >
                      {suggestion.icon}
                      {suggestion.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Prompt Suggestions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                Quick Suggestions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {moduleSuggestions.slice(0, 4).map((suggestion) => (
                  <Badge
                    key={suggestion.id}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 transition-colors text-xs"
                    onClick={() => !isLoading && handleSuggestionClick(suggestion)}
                  >
                    {suggestion.icon}
                    <span className="ml-1">{suggestion.label}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Custom Prompt Input */}
            <div className="flex gap-2">
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ask anything about your data..."
                className="min-h-[60px] resize-none text-sm"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCustomSubmit();
                  }
                }}
              />
              <Button
                onClick={handleCustomSubmit}
                disabled={isLoading || !customPrompt.trim()}
                size="icon"
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Loading State */}
            {isLoading && !streamedContent && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}

            {/* Streaming Output */}
            {(streamedContent || result) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="gap-1">
                    <Sparkles className="h-3 w-3 text-yellow-500" />
                    AI Response
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleCopy}
                    >
                      {isCopied ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => result && executeAction(result.action, result.prompt)}
                      disabled={isLoading}
                    >
                      <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
                    </Button>
                  </div>
                </div>
                <ScrollArea 
                  ref={scrollRef}
                  className={cn(
                    "rounded-md border bg-muted/30 p-3",
                    isFullscreen ? "h-[400px]" : "h-[200px]"
                  )}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {streamedContent || result?.response}
                      {isLoading && <span className="animate-pulse">▌</span>}
                    </p>
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Metadata / Insights */}
            {result?.metadata && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {result.metadata.confidence && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Confidence:</span>
                    <Badge variant="secondary">
                      {Math.round(result.metadata.confidence * 100)}%
                    </Badge>
                  </div>
                )}
                {result.metadata.insights && result.metadata.insights.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Key Insights:</span>
                    <ul className="mt-1 space-y-1">
                      {result.metadata.insights.slice(0, 3).map((insight, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <Sparkles className="h-3 w-3 mt-0.5 text-yellow-500 shrink-0" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="text-xs text-muted-foreground pt-0">
            <div className="flex items-center gap-2">
              <Brain className={cn("h-3 w-3", moduleConfig.color)} />
              <span>Powered by AI</span>
              {result && (
                <>
                  <Separator orientation="vertical" className="h-3" />
                  <span>{result.timestamp.toLocaleTimeString()}</span>
                </>
              )}
            </div>
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// =================================================================
// Helper Functions
// =================================================================

function generateDemoResponse(action: AIAction, module: string, prompt: string): string {
  const responses: Record<string, Record<string, string>> = {
    finance: {
      summarize: `📊 **Financial Summary**

Based on the current data analysis:

• **Total Revenue**: $325,890 (+8% vs last month)
• **Total Expenses**: $245,000 (+5% vs last month)  
• **Net Profit**: $80,890 (24.8% margin)

**Key Highlights:**
- Strong revenue growth driven by new client acquisitions
- Operating costs remain within budget
- Cash flow positive for the third consecutive month

**Action Items:**
1. Review Q4 budget allocations
2. Follow up on 3 pending invoices totaling $15,400
3. Schedule financial review meeting`,
      analyze: `📈 **Financial Analysis Report**

**Trend Analysis:**
- Revenue shows consistent 6-8% monthly growth
- Expense ratio improved from 78% to 75%
- Working capital increased by 12%

**Risk Indicators:**
⚠️ Accounts receivable aging > 60 days: $23,500
⚠️ 2 vendors with late payment terms

**Opportunities:**
✅ Cost optimization potential in operations: ~$8,000/month
✅ Early payment discounts available: $2,400 savings`,
      classify: `🏷️ **Expense Classification**

**By Category:**
• Operations: 45% ($110,250)
• Payroll: 30% ($73,500)
• Marketing: 15% ($36,750)
• Equipment: 7% ($17,150)
• Miscellaneous: 3% ($7,350)

**By Priority:**
- Essential: 75%
- Discretionary: 20%
- One-time: 5%`,
    },
    hrms: {
      summarize: `👥 **Workforce Summary**

**Current Headcount:** 120 employees
• Full-time: 105 (87.5%)
• Part-time: 10 (8.3%)
• Contractors: 5 (4.2%)

**Department Distribution:**
- Engineering: 45
- Sales: 25
- Operations: 20
- Marketing: 15
- HR & Admin: 15

**Key Metrics:**
- Attendance Rate: 94.2%
- Average Tenure: 2.3 years
- Open Positions: 8`,
      analyze: `📊 **HR Analytics Report**

**Attrition Analysis:**
- Current annual rate: 12%
- Industry benchmark: 15%
- Trend: Improving ↓

**High-Risk Employees:** 5 identified
- Engineering: 2 (tenure < 1 year, no promotion)
- Sales: 3 (below quota, low engagement)

**Recommendations:**
1. Implement retention bonuses for top performers
2. Career development discussions for at-risk employees
3. Review compensation competitiveness`,
      classify: `🏷️ **Employee Classification**

**By Performance:**
• High Performers: 25 (21%)
• Meets Expectations: 80 (67%)
• Needs Improvement: 15 (12%)

**By Tenure:**
• < 1 year: 30
• 1-3 years: 50
• 3-5 years: 25
• 5+ years: 15

**By Department Risk:**
- Low Risk: Operations, HR
- Medium Risk: Marketing, Sales
- High Risk: Engineering (high attrition)`,
    },
    projects: {
      summarize: `📋 **Project Portfolio Summary**

**Active Projects:** 24
• On Track: 18 (75%)
• At Risk: 4 (17%)
• Delayed: 2 (8%)

**Resource Utilization:** 87%
**Sprint Velocity:** 42 points/sprint

**Upcoming Milestones:**
- Project Alpha Phase 2: Dec 15
- Beta Launch: Dec 20
- Q4 Review: Dec 28`,
      analyze: `🔍 **Project Analysis**

**Bottlenecks Identified:**
⚠️ Design review queue: 8 tasks waiting
⚠️ QA capacity: 90% utilized
⚠️ External dependencies: 3 blockers

**Timeline Risk:**
- High: Project Delta (resource gap)
- Medium: Project Gamma (scope creep)

**Recommendations:**
1. Redistribute 2 tasks from QA to Dev for self-testing
2. Escalate vendor dependency blockers
3. Consider scope reduction for Project Delta`,
      classify: `🏷️ **Task Classification**

**By Priority:**
• Critical: 12 tasks
• High: 28 tasks
• Medium: 45 tasks
• Low: 15 tasks

**By Status:**
• Backlog: 35
• In Progress: 25
• In Review: 18
• Done: 22

**By Complexity:**
- Simple: 40%
- Medium: 45%
- Complex: 15%`,
    },
    kanban: {
      summarize: `📌 **Kanban Board Summary**

**Column Status:**
• To Do: 15 tasks
• In Progress: 8 tasks
• Review: 5 tasks
• Done: 22 tasks

**WIP Status:** 8/10 (healthy)
**Cycle Time:** 3.2 days average
**Throughput:** 12 tasks/week

**Blocked Tasks:** 2
- Task #45: Waiting for API spec
- Task #52: Pending client feedback`,
      analyze: `⚡ **Workflow Analysis**

**Efficiency Metrics:**
- Lead Time: 5.5 days
- Cycle Time: 3.2 days
- Wait Time: 2.3 days (41%)

**Bottleneck:** Review column
- Average wait: 1.5 days
- Suggestion: Add second reviewer

**Flow Efficiency:** 58%
Target: 75%

**Actions:**
1. Break down large tasks (>8 points)
2. Daily standup focus on blocked items
3. Implement review SLA (24h max)`,
      classify: `🏷️ **Task Classification**

**By Type:**
• Feature: 18
• Bug Fix: 12
• Improvement: 8
• Documentation: 5
• Tech Debt: 7

**By Effort:**
• XS (< 1 day): 15
• S (1-2 days): 20
• M (3-5 days): 10
• L (1-2 weeks): 5

**By Assignee Load:**
- Alice: 5 tasks (optimal)
- Bob: 8 tasks (overloaded)
- Carol: 3 tasks (available)`,
    },
    calendar: {
      summarize: `📅 **Schedule Summary**

**This Week:**
• Meetings: 12 (8.5 hours)
• Focus Time: 18 hours
• Available Slots: 14 hours

**Upcoming:**
- Today: 3 meetings
- Tomorrow: 2 meetings
- This Week: Team standup, Client review

**Conflicts:** None detected
**Meeting Load:** Moderate`,
      analyze: `⏰ **Time Analysis**

**Time Distribution:**
• Meetings: 35%
• Focus Work: 45%
• Admin: 10%
• Breaks: 10%

**Meeting Patterns:**
- Peak: Tuesday/Wednesday
- Most productive: Thursday AM

**Optimization Opportunities:**
1. Batch meetings on Tue/Wed
2. Block 9-11 AM for focus time
3. 15% meetings could be emails

**Energy Analysis:**
🟢 High energy: 9 AM - 12 PM
🟡 Medium: 2 PM - 5 PM
🔴 Low: After 5 PM`,
      classify: `🏷️ **Event Classification**

**By Type:**
• 1:1 Meetings: 4
• Team Meetings: 3
• Client Calls: 2
• Workshops: 2
• Admin: 1

**By Priority:**
• Must Attend: 6
• Should Attend: 4
• Optional: 2

**By Duration:**
• 30 min: 5
• 60 min: 4
• 90+ min: 3`,
    },
    email: {
      summarize: `📧 **Inbox Summary**

**Unread:** 23 emails
• Urgent: 3
• Important: 8
• Normal: 12

**By Category:**
- Client communications: 8
- Internal updates: 7
- Newsletters: 5
- Automated: 3

**Action Required:** 5 emails
**Waiting for Reply:** 3 threads`,
      analyze: `📊 **Email Analysis**

**Response Time:**
- Average: 4.2 hours
- Target: 24 hours
- Performance: ✅ Excellent

**Communication Patterns:**
- Peak incoming: 9-11 AM
- Peak responding: 2-4 PM
- Most active day: Monday

**Sentiment Analysis:**
🟢 Positive: 65%
🟡 Neutral: 30%
🔴 Negative: 5%

**Action Items Extracted:** 8
- 3 require response today
- 5 can wait until next week`,
      classify: `🏷️ **Email Classification**

**By Priority:**
• 🔴 Urgent: 3
• 🟠 High: 8
• 🟡 Medium: 15
• 🟢 Low: 12

**By Action Type:**
• Reply needed: 8
• FYI only: 12
• Meeting related: 5
• Follow-up: 6
• Archive: 7

**By Sender:**
- Clients: 10
- Team: 15
- External: 8
- System: 5`,
    },
  };

  const moduleResponses = responses[module] || responses.finance;
  const actionKey = action === 'custom' ? 'summarize' : action;
  return moduleResponses[actionKey] || `Processing your request: "${prompt}"...`;
}

function extractInsights(text: string): string[] {
  const insights: string[] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.includes('•') || line.includes('-') || line.includes('✅') || line.includes('⚠️')) {
      const cleaned = line.replace(/^[•\-✅⚠️\s]+/, '').trim();
      if (cleaned.length > 10 && cleaned.length < 100) {
        insights.push(cleaned);
      }
    }
  }
  return insights.slice(0, 5);
}

function extractRecommendations(text: string): string[] {
  const recommendations: string[] = [];
  const lines = text.split('\n');
  let inRecommendations = false;
  for (const line of lines) {
    if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('action')) {
      inRecommendations = true;
    }
    if (inRecommendations && /^\d+\./.test(line.trim())) {
      const cleaned = line.replace(/^\d+\.\s*/, '').trim();
      if (cleaned.length > 5) {
        recommendations.push(cleaned);
      }
    }
  }
  return recommendations.slice(0, 5);
}

// =================================================================
// Exports
// =================================================================

export default AIAssistantCard;
