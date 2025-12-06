/**
 * AI-Enhanced Dashboard Cards
 * 
 * Universal AI components for various dashboard tools:
 * - HRMS: Attrition Risk, Team Performance
 * - Projects: Task Prioritization, Bottleneck Detection
 * - Business: Revenue Analysis, Client Profitability
 * - Products: Description Generator, Inventory Prediction
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  ChevronRight,
  Users,
  Target,
  Zap,
  Copy,
  Package,
  BarChart3,
  AlertCircle,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHRMSAI, useProjectAI, useBusinessAI, useProductAI } from '@/hooks/use-accounting';
import { type RegionCode } from '@/config/accounting-regional-formats';

// =================================================================
// HRMS: Attrition Risk Card
// =================================================================

interface AttritionRiskProps {
  employees: {
    id: string;
    name: string;
    tenure: number;
    department: string;
    performanceScore: number;
    salaryCompetitiveness: number;
    recentPromotion: boolean;
    leaveBalance: number;
    overtimeHours: number;
  }[];
  className?: string;
}

export function AIAttritionRisk({ employees, className }: AttritionRiskProps) {
  const { predictAttrition } = useHRMSAI();
  const [predictions, setPredictions] = useState<Map<string, { risk: number; factors: string[] }>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  
  const runPredictions = async () => {
    setIsLoading(true);
    try {
      const results = new Map<string, { risk: number; factors: string[] }>();
      for (const emp of employees.slice(0, 10)) {
        const prediction = await predictAttrition(emp);
        results.set(emp.id, {
          risk: prediction.prediction as number,
          factors: prediction.factors,
        });
      }
      setPredictions(results);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (employees.length > 0) {
      runPredictions();
    }
  }, [employees.length]);
  
  const getRiskColor = (risk: number) => {
    if (risk >= 0.7) return 'text-red-500';
    if (risk >= 0.4) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  const getRiskLabel = (risk: number) => {
    if (risk >= 0.7) return 'High Risk';
    if (risk >= 0.4) return 'Medium Risk';
    return 'Low Risk';
  };
  
  // Sort by risk
  const sortedEmployees = [...employees].sort((a, b) => {
    const riskA = predictions.get(a.id)?.risk || 0;
    const riskB = predictions.get(b.id)?.risk || 0;
    return riskB - riskA;
  });
  
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-red-500" />
            AI Attrition Risk Analysis
          </CardTitle>
          <CardDescription>Predict employee flight risk</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={runPredictions} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <ScrollArea className="h-[250px]">
            <div className="space-y-3">
              {sortedEmployees.slice(0, 10).map((emp) => {
                const prediction = predictions.get(emp.id);
                const risk = prediction?.risk || 0;
                
                return (
                  <div key={emp.id} className="p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={cn("text-lg font-bold", getRiskColor(risk))}>
                          {Math.round(risk * 100)}%
                        </span>
                        <Badge className={cn("ml-2", getRiskColor(risk))} variant="outline">
                          {getRiskLabel(risk)}
                        </Badge>
                      </div>
                    </div>
                    {prediction && prediction.factors.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {prediction.factors.slice(0, 2).map((factor, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Analyzing {employees.length} employees
        </Badge>
      </CardFooter>
    </Card>
  );
}

// =================================================================
// Projects: Task Prioritization Card
// =================================================================

interface TaskPrioritizationProps {
  tasks: {
    id: string;
    title: string;
    dueDate?: string;
    priority: number;
    effort: 'LOW' | 'MEDIUM' | 'HIGH';
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    dependencies?: string[];
  }[];
  className?: string;
}

export function AITaskPrioritization({ tasks, className }: TaskPrioritizationProps) {
  const { prioritizeTasks } = useProjectAI();
  const [prioritization, setPrioritization] = useState<Awaited<ReturnType<typeof prioritizeTasks>>>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const runPrioritization = async () => {
    setIsLoading(true);
    try {
      const result = await prioritizeTasks(tasks);
      setPrioritization(result);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (tasks.length > 0) {
      runPrioritization();
    }
  }, [tasks.length]);
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-red-500';
    if (score >= 6) return 'text-orange-500';
    if (score >= 4) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            AI Task Prioritization
          </CardTitle>
          <CardDescription>Smart priority based on urgency, impact & effort</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={runPrioritization} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <ScrollArea className="h-[250px]">
            <div className="space-y-2">
              {prioritization.slice(0, 10).map((item, index) => {
                const task = tasks.find(t => t.id === item.taskId);
                if (!task) return null;
                
                return (
                  <div key={item.taskId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                      index < 3 ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{item.reasoning}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-lg font-bold", getScoreColor(item.aiPriority))}>
                        {item.aiPriority}
                      </span>
                      {item.aiPriority !== item.originalPriority && (
                        <Badge variant="secondary" className="text-xs">
                          was {item.originalPriority}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground justify-between">
        <span>Prioritized {tasks.length} tasks</span>
        <Badge variant="outline" className="gap-1">
          <Zap className="h-3 w-3" />
          Urgency × Impact × Effort
        </Badge>
      </CardFooter>
    </Card>
  );
}

// =================================================================
// Projects: Bottleneck Detection Card
// =================================================================

interface BottleneckDetectionProps {
  columns: { name: string; tasks: { id: string; assignee?: string; age: number }[] }[];
  className?: string;
}

export function AIBottleneckDetection({ columns, className }: BottleneckDetectionProps) {
  const { detectBottlenecks } = useProjectAI();
  const [bottlenecks, setBottlenecks] = useState<Awaited<ReturnType<typeof detectBottlenecks>>>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const runDetection = async () => {
    setIsLoading(true);
    try {
      const result = await detectBottlenecks(columns);
      setBottlenecks(result);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (columns.length > 0) {
      runDetection();
    }
  }, [columns.length]);
  
  const severityColors = {
    LOW: 'bg-blue-100 text-blue-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  };
  
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            AI Bottleneck Detection
          </CardTitle>
          <CardDescription>Identify workflow blockers</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={runDetection} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : bottlenecks.length > 0 ? (
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {bottlenecks.map((bottleneck) => (
                <div key={bottleneck.id} className="p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{bottleneck.description}</p>
                      <p className="text-xs text-muted-foreground">{bottleneck.suggestedAction}</p>
                    </div>
                    <Badge className={severityColors[bottleneck.severity]} variant="secondary">
                      {bottleneck.severity}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Affects {bottleneck.affectedItems.length} tasks
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm font-medium">No bottlenecks detected</p>
            <p className="text-xs text-muted-foreground">Workflow is running smoothly</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        <span>Analyzing {columns.length} columns with {columns.reduce((sum, c) => sum + c.tasks.length, 0)} tasks</span>
      </CardFooter>
    </Card>
  );
}

// =================================================================
// Business: Revenue Analysis Card
// =================================================================

interface RevenueAnalysisProps {
  data: { period: string; revenue: number; category?: string }[];
  className?: string;
}

export function AIRevenueAnalysis({ data, className }: RevenueAnalysisProps) {
  const { analyzeRevenue } = useBusinessAI();
  const [analysis, setAnalysis] = useState<Awaited<ReturnType<typeof analyzeRevenue>> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeRevenue(data);
      setAnalysis(result);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (data.length > 0) {
      runAnalysis();
    }
  }, [data.length]);
  
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            AI Revenue Analysis
          </CardTitle>
          <CardDescription>Trend analysis and forecasting</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={runAnalysis} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : analysis ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {(analysis.rawData as { avgGrowth: number })?.avgGrowth >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm font-medium">{analysis.analysis}</span>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">Key Metrics</p>
              <ul className="space-y-1">
                {analysis.insights.map((insight, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <Sparkles className="h-3 w-3 mt-1 text-yellow-500 shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
            
            {analysis.recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Recommendations</p>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-1 text-green-500 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No data to analyze</p>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          AI Confidence: {analysis ? `${Math.round(analysis.confidence * 100)}%` : '--'}
        </Badge>
      </CardFooter>
    </Card>
  );
}

// =================================================================
// Products: Description Generator Card
// =================================================================

interface DescriptionGeneratorProps {
  className?: string;
}

export function AIProductDescription({ className }: DescriptionGeneratorProps) {
  const { generateDescription } = useProductAI();
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [features, setFeatures] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'technical'>('professional');
  const [result, setResult] = useState<{ description: string; seoKeywords: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const generate = async () => {
    if (!productName || !category) return;
    
    setIsLoading(true);
    try {
      const featureList = features.split('\n').filter(f => f.trim());
      const generated = await generateDescription({
        name: productName,
        category,
        features: featureList.length > 0 ? featureList : ['Quality product', 'Great value'],
      }, tone);
      setResult(generated);
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.description);
    }
  };
  
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full" />
      
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="h-4 w-4 text-purple-500" />
          AI Product Description Generator
        </CardTitle>
        <CardDescription>Generate compelling product descriptions</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Product Name</label>
            <Input
              placeholder="e.g., Wireless Headphones"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Input
              placeholder="e.g., Electronics"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Key Features (one per line)</label>
          <Textarea
            placeholder="e.g., Noise cancellation&#10;30-hour battery life&#10;Premium sound quality"
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Tone</label>
            <Select value={tone} onValueChange={(v: typeof tone) => setTone(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generate} disabled={isLoading || !productName || !category} className="mt-6">
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate
          </Button>
        </div>
        
        {result && (
          <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm whitespace-pre-wrap">{result.description}</p>
              <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground">SEO Keywords:</span>
              {result.seoKeywords.map((kw, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =================================================================
// Export all components
// =================================================================

export const AIDashboardComponents = {
  // HRMS
  AttritionRisk: AIAttritionRisk,
  
  // Projects/Kanban
  TaskPrioritization: AITaskPrioritization,
  BottleneckDetection: AIBottleneckDetection,
  
  // Business
  RevenueAnalysis: AIRevenueAnalysis,
  
  // Products
  ProductDescription: AIProductDescription,
};

export default AIDashboardComponents;
