/**
 * AI-Enhanced Finance Cards
 * 
 * Reusable components that add AI capabilities to the Finance dashboard:
 * - Cash Flow Analysis
 * - Anomaly Detection
 * - Payment Predictions
 * - Regulatory Compliance Alerts
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  DollarSign,
  FileText,
  Shield,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFinanceAI } from '@/hooks/use-accounting';
import { type RegionCode } from '@/config/accounting-regional-formats';

// =================================================================
// Cash Flow Analysis Card
// =================================================================

interface CashFlowAnalysisProps {
  transactions: { date: string; amount: number; type: 'IN' | 'OUT'; category: string }[];
  region?: RegionCode;
  className?: string;
}

export function AICashFlowAnalysis({ transactions, region = 'HK', className }: CashFlowAnalysisProps) {
  const { analyzeCashFlow, formatAmount } = useFinanceAI(region);
  const [analysis, setAnalysis] = useState<Awaited<ReturnType<typeof analyzeCashFlow>> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeCashFlow(transactions);
      setAnalysis(result);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (transactions.length > 0) {
      runAnalysis();
    }
  }, [transactions.length]);
  
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-500" />
            AI Cash Flow Analysis
          </CardTitle>
          <CardDescription>Intelligent insights from your transactions</CardDescription>
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
              {(analysis.rawData as { netCashFlow: number })?.netCashFlow >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm font-medium">{analysis.analysis}</span>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">Key Insights</p>
              <ul className="space-y-1">
                {analysis.insights.slice(0, 4).map((insight, i) => (
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
                  {analysis.recommendations.slice(0, 3).map((rec, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-1 text-green-500 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysis.riskFactors && analysis.riskFactors.length > 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Risk Factors</AlertTitle>
                <AlertDescription>
                  {analysis.riskFactors.join('; ')}
                </AlertDescription>
              </Alert>
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
// Anomaly Detection Card
// =================================================================

interface AnomalyDetectionProps {
  transactions: { id: string; date: string; amount: number; description: string; category: string }[];
  className?: string;
}

export function AIAnomalyDetection({ transactions, className }: AnomalyDetectionProps) {
  const { detectAnomalies } = useFinanceAI();
  const [anomalies, setAnomalies] = useState<Awaited<ReturnType<typeof detectAnomalies>>>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const runDetection = async () => {
    setIsLoading(true);
    try {
      const result = await detectAnomalies(transactions);
      setAnomalies(result);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (transactions.length > 0) {
      runDetection();
    }
  }, [transactions.length]);
  
  const severityColors = {
    LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };
  
  const typeIcons = {
    UNUSUAL_AMOUNT: DollarSign,
    PATTERN_BREAK: TrendingDown,
    DUPLICATE: FileText,
    MISSING_DATA: AlertTriangle,
    TIMING_ISSUE: Clock,
  };
  
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-500" />
            AI Anomaly Detection
          </CardTitle>
          <CardDescription>Automatically detect unusual transactions</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={runDetection} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : anomalies.length > 0 ? (
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {anomalies.map((anomaly) => {
                const TypeIcon = typeIcons[anomaly.type];
                return (
                  <div
                    key={anomaly.id}
                    className="p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <TypeIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{anomaly.description}</p>
                          <p className="text-xs text-muted-foreground">{anomaly.suggestedAction}</p>
                        </div>
                      </div>
                      <Badge className={severityColors[anomaly.severity]} variant="secondary">
                        {anomaly.severity}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm font-medium">No anomalies detected</p>
            <p className="text-xs text-muted-foreground">All transactions look normal</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        <span>{anomalies.length} anomalies found in {transactions.length} transactions</span>
      </CardFooter>
    </Card>
  );
}

// =================================================================
// Payment Prediction Card
// =================================================================

interface PaymentPredictionProps {
  invoices: {
    id: string;
    clientName: string;
    amount: number;
    dueDate: string;
    clientHistory?: { avgPaymentDays: number; latePayments: number };
  }[];
  region?: RegionCode;
  className?: string;
}

export function AIPaymentPrediction({ invoices, region = 'HK', className }: PaymentPredictionProps) {
  const { predictPayment, formatAmount } = useFinanceAI(region);
  const [predictions, setPredictions] = useState<Map<string, Awaited<ReturnType<typeof predictPayment>>>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  
  const runPredictions = async () => {
    setIsLoading(true);
    try {
      const results = new Map<string, Awaited<ReturnType<typeof predictPayment>>>();
      for (const invoice of invoices.slice(0, 10)) {
        const prediction = await predictPayment({
          amount: invoice.amount,
          dueDate: invoice.dueDate,
          clientHistory: invoice.clientHistory,
        });
        results.set(invoice.id, prediction);
      }
      setPredictions(results);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (invoices.length > 0) {
      runPredictions();
    }
  }, [invoices.length]);
  
  const getLikelihoodColor = (likelihood: number) => {
    if (likelihood >= 0.8) return 'text-green-500';
    if (likelihood >= 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-full" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            AI Payment Predictions
          </CardTitle>
          <CardDescription>Predict invoice payment likelihood</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={runPredictions} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {invoices.slice(0, 10).map((invoice) => {
                const prediction = predictions.get(invoice.id);
                const likelihood = prediction?.prediction as number || 0;
                
                return (
                  <div key={invoice.id} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <span className={cn("text-lg font-bold", getLikelihoodColor(likelihood))}>
                        {Math.round(likelihood * 100)}%
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{invoice.clientName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatAmount(invoice.amount)}</span>
                        <span>•</span>
                        <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                      </div>
                      <Progress value={likelihood * 100} className="h-1 mt-1" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        <span>Based on client payment history and invoice characteristics</span>
      </CardFooter>
    </Card>
  );
}

// =================================================================
// Compliance Alerts Card
// =================================================================

interface ComplianceAlertsProps {
  region?: RegionCode;
  className?: string;
}

export function AIComplianceAlerts({ region = 'HK', className }: ComplianceAlertsProps) {
  const { searchRegs } = useFinanceAI(region);
  const [alerts, setAlerts] = useState<ReturnType<typeof searchRegs>>([]);
  
  useEffect(() => {
    // Get relevant compliance items
    const complianceItems = searchRegs('deadline filing return', 'COMPLIANCE');
    setAlerts(complianceItems.slice(0, 5));
  }, [region]);
  
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
      
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-500" />
          Regulatory Compliance
        </CardTitle>
        <CardDescription>Upcoming deadlines and requirements for {region}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[180px]">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{alert.title}</p>
                    {alert.titleChinese && (
                      <p className="text-xs text-muted-foreground">{alert.titleChinese}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{alert.authority}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {alert.frequency}
                  </Badge>
                </div>
                <div className="mt-2">
                  <ul className="space-y-0.5">
                    {alert.keyPoints.slice(0, 2).map((point, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-primary">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          View All Requirements
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// =================================================================
// Export all components
// =================================================================

export const AIFinanceComponents = {
  CashFlowAnalysis: AICashFlowAnalysis,
  AnomalyDetection: AIAnomalyDetection,
  PaymentPrediction: AIPaymentPrediction,
  ComplianceAlerts: AIComplianceAlerts,
};

export default AIFinanceComponents;
