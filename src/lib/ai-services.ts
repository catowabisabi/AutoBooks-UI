/**
 * Universal AI Services for All Dashboard Tools
 * 
 * Provides AI capabilities that can be integrated into any tool:
 * - Finance, HRMS, Business, Kanban, Projects, Products
 * 
 * Features:
 * - Intelligent analysis and predictions
 * - Natural language processing
 * - Anomaly detection
 * - Smart recommendations
 * - Report generation
 */

import { aiApi } from '@/lib/api';
import { buildRAGContext } from '@/config/accounting-rag-regulations';
import { RegionCode, getRegionalConfig, formatCurrency } from '@/config/accounting-regional-formats';

// =================================================================
// Types
// =================================================================

export interface AIAnalysisResult {
  success: boolean;
  analysis: string;
  insights: string[];
  recommendations: string[];
  riskFactors?: string[];
  confidence: number;
  rawData?: unknown;
}

export interface AIPrediction {
  success: boolean;
  prediction: number | string;
  confidence: number;
  reasoning: string;
  factors: string[];
  historicalAccuracy?: number;
}

export interface AIAnomaly {
  id: string;
  type: 'UNUSUAL_AMOUNT' | 'PATTERN_BREAK' | 'DUPLICATE' | 'MISSING_DATA' | 'TIMING_ISSUE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  affectedItems: string[];
  suggestedAction: string;
  detectedAt: string;
}

export interface AIClassification {
  category: string;
  subcategory?: string;
  confidence: number;
  alternatives?: { category: string; confidence: number }[];
}

export interface AITaskPrioritization {
  taskId: string;
  originalPriority: number;
  aiPriority: number;
  reasoning: string;
  urgencyScore: number;
  impactScore: number;
  effortScore: number;
}

export interface AIReportSection {
  title: string;
  titleChinese?: string;
  content: string;
  contentChinese?: string;
  highlights: string[];
  charts?: { type: string; data: unknown }[];
}

// =================================================================
// Finance AI Services
// =================================================================

export const financeAI = {
  /**
   * Analyze cash flow patterns and predict future trends
   */
  async analyzeCashFlow(
    transactions: { date: string; amount: number; type: 'IN' | 'OUT'; category: string }[],
    region: RegionCode = 'HK'
  ): Promise<AIAnalysisResult> {
    const totalIn = transactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.amount, 0);
    const totalOut = transactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.amount, 0);
    const netCashFlow = totalIn - totalOut;
    const config = getRegionalConfig(region);
    
    // Group by category
    const byCategory = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const topExpenses = Object.entries(byCategory)
      .filter(([_, amount]) => amount < 0 || transactions.find(t => t.category === _ && t.type === 'OUT'))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const insights: string[] = [];
    const recommendations: string[] = [];
    const riskFactors: string[] = [];
    
    // Basic analysis
    if (netCashFlow < 0) {
      insights.push(`Negative cash flow of ${formatCurrency(Math.abs(netCashFlow), region)} detected`);
      riskFactors.push('Cash flow deficit may impact operations');
      recommendations.push('Review expense categories for potential cost reduction');
    } else {
      insights.push(`Positive cash flow of ${formatCurrency(netCashFlow, region)}`);
      recommendations.push('Consider investing surplus for better returns');
    }
    
    // Category insights
    topExpenses.forEach(([category, amount]) => {
      insights.push(`${category}: ${formatCurrency(amount, region)}`);
    });
    
    // AI-enhanced analysis (would call actual AI endpoint in production)
    try {
      const ragContext = buildRAGContext('cash flow management', region);
      // In production, this would call the AI API with the context
      recommendations.push('Based on regional regulations, ensure adequate reserves for tax payments');
    } catch {
      // Continue with basic analysis
    }
    
    return {
      success: true,
      analysis: `Cash flow analysis for period: Net ${netCashFlow >= 0 ? 'positive' : 'negative'} ${formatCurrency(Math.abs(netCashFlow), region)}`,
      insights,
      recommendations,
      riskFactors,
      confidence: 0.85,
      rawData: { totalIn, totalOut, netCashFlow, byCategory },
    };
  },
  
  /**
   * Detect anomalies in financial transactions
   */
  async detectAnomalies(
    transactions: { id: string; date: string; amount: number; description: string; category: string }[]
  ): Promise<AIAnomaly[]> {
    const anomalies: AIAnomaly[] = [];
    
    // Calculate statistics
    const amounts = transactions.map(t => Math.abs(t.amount));
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / amounts.length);
    
    // Detect unusual amounts (>2 standard deviations)
    transactions.forEach(t => {
      if (Math.abs(t.amount) > mean + 2 * stdDev) {
        anomalies.push({
          id: `anomaly-${t.id}`,
          type: 'UNUSUAL_AMOUNT',
          severity: Math.abs(t.amount) > mean + 3 * stdDev ? 'HIGH' : 'MEDIUM',
          description: `Transaction amount ${t.amount} is significantly higher than average`,
          affectedItems: [t.id],
          suggestedAction: 'Review transaction for accuracy and authorization',
          detectedAt: new Date().toISOString(),
        });
      }
    });
    
    // Detect potential duplicates
    const descGroups = transactions.reduce((acc, t) => {
      const key = `${t.amount}-${t.description}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    }, {} as Record<string, typeof transactions>);
    
    Object.entries(descGroups).forEach(([_, group]) => {
      if (group.length > 1) {
        anomalies.push({
          id: `anomaly-dup-${group[0].id}`,
          type: 'DUPLICATE',
          severity: 'MEDIUM',
          description: `Potential duplicate transactions detected: ${group.length} transactions with same amount and description`,
          affectedItems: group.map(t => t.id),
          suggestedAction: 'Verify if these are legitimate separate transactions',
          detectedAt: new Date().toISOString(),
        });
      }
    });
    
    return anomalies;
  },
  
  /**
   * Predict invoice payment likelihood
   */
  async predictPaymentLikelihood(
    invoice: { amount: number; dueDate: string; clientHistory?: { avgPaymentDays: number; latePayments: number } }
  ): Promise<AIPrediction> {
    const daysUntilDue = Math.floor((new Date(invoice.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    let baseScore = 0.7; // Default 70% likelihood
    const factors: string[] = [];
    
    if (invoice.clientHistory) {
      if (invoice.clientHistory.avgPaymentDays <= 30) {
        baseScore += 0.15;
        factors.push('Client typically pays on time');
      } else if (invoice.clientHistory.avgPaymentDays > 45) {
        baseScore -= 0.2;
        factors.push('Client has history of late payments');
      }
      
      if (invoice.clientHistory.latePayments > 3) {
        baseScore -= 0.1;
        factors.push(`${invoice.clientHistory.latePayments} late payments on record`);
      }
    }
    
    if (invoice.amount > 50000) {
      baseScore -= 0.05;
      factors.push('Large invoice amount may delay payment');
    }
    
    if (daysUntilDue < 0) {
      baseScore -= 0.3;
      factors.push('Invoice is overdue');
    }
    
    return {
      success: true,
      prediction: Math.min(0.95, Math.max(0.1, baseScore)),
      confidence: 0.75,
      reasoning: `Based on client history and invoice characteristics`,
      factors,
    };
  },
  
  /**
   * Generate financial report summary
   */
  async generateReportSummary(
    data: {
      revenue: number;
      expenses: number;
      profit: number;
      period: string;
      previousPeriod?: { revenue: number; expenses: number; profit: number };
    },
    region: RegionCode = 'HK'
  ): Promise<AIReportSection[]> {
    const sections: AIReportSection[] = [];
    
    const profitMargin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
    const revenueGrowth = data.previousPeriod
      ? ((data.revenue - data.previousPeriod.revenue) / data.previousPeriod.revenue) * 100
      : 0;
    
    sections.push({
      title: 'Executive Summary',
      titleChinese: '執行摘要',
      content: `Financial performance for ${data.period}: Revenue of ${formatCurrency(data.revenue, region)} with net profit of ${formatCurrency(data.profit, region)} (${profitMargin.toFixed(1)}% margin).`,
      contentChinese: `${data.period}財務表現：收入${formatCurrency(data.revenue, region)}，淨利潤${formatCurrency(data.profit, region)}（利潤率${profitMargin.toFixed(1)}%）。`,
      highlights: [
        `Total Revenue: ${formatCurrency(data.revenue, region)}`,
        `Total Expenses: ${formatCurrency(data.expenses, region)}`,
        `Net Profit: ${formatCurrency(data.profit, region)}`,
        `Profit Margin: ${profitMargin.toFixed(1)}%`,
        ...(data.previousPeriod ? [`Revenue Growth: ${revenueGrowth.toFixed(1)}%`] : []),
      ],
    });
    
    sections.push({
      title: 'Key Insights',
      titleChinese: '主要見解',
      content: profitMargin > 20
        ? 'Strong profit margins indicate healthy business performance.'
        : profitMargin > 10
        ? 'Adequate profit margins with room for improvement.'
        : 'Low profit margins require attention to cost management.',
      highlights: [
        profitMargin > 15 ? '✓ Healthy profit margins' : '⚠ Review cost structure',
        revenueGrowth > 0 ? '✓ Positive revenue growth' : '⚠ Revenue decline detected',
      ],
    });
    
    return sections;
  },
};

// =================================================================
// HRMS AI Services
// =================================================================

export const hrmsAI = {
  /**
   * Predict employee attrition risk
   */
  async predictAttritionRisk(
    employee: {
      tenure: number;
      department: string;
      performanceScore: number;
      salaryCompetitiveness: number;
      recentPromotion: boolean;
      leaveBalance: number;
      overtimeHours: number;
    }
  ): Promise<AIPrediction> {
    let riskScore = 0.2; // Base risk
    const factors: string[] = [];
    
    // Tenure analysis
    if (employee.tenure < 1) {
      riskScore += 0.15;
      factors.push('New employee (<1 year tenure)');
    } else if (employee.tenure > 5) {
      riskScore -= 0.1;
      factors.push('Long-term employee (>5 years)');
    }
    
    // Performance impact
    if (employee.performanceScore < 3) {
      riskScore += 0.1;
      factors.push('Below average performance');
    } else if (employee.performanceScore >= 4) {
      riskScore += 0.05; // High performers also flight risk
      factors.push('High performer - may have external opportunities');
    }
    
    // Salary competitiveness
    if (employee.salaryCompetitiveness < 0.9) {
      riskScore += 0.2;
      factors.push('Below market salary');
    } else if (employee.salaryCompetitiveness > 1.1) {
      riskScore -= 0.1;
      factors.push('Above market compensation');
    }
    
    // Recent promotion
    if (employee.recentPromotion) {
      riskScore -= 0.1;
      factors.push('Recently promoted');
    }
    
    // Overtime
    if (employee.overtimeHours > 20) {
      riskScore += 0.1;
      factors.push('High overtime hours - potential burnout');
    }
    
    return {
      success: true,
      prediction: Math.min(0.95, Math.max(0.05, riskScore)),
      confidence: 0.7,
      reasoning: 'Based on tenure, performance, compensation, and workload factors',
      factors,
    };
  },
  
  /**
   * Analyze team performance
   */
  async analyzeTeamPerformance(
    team: {
      members: { name: string; role: string; performance: number; projects: number }[];
      department: string;
    }
  ): Promise<AIAnalysisResult> {
    const avgPerformance = team.members.reduce((sum, m) => sum + m.performance, 0) / team.members.length;
    const avgProjects = team.members.reduce((sum, m) => sum + m.projects, 0) / team.members.length;
    
    const topPerformers = team.members.filter(m => m.performance >= 4);
    const underPerformers = team.members.filter(m => m.performance < 3);
    
    const insights: string[] = [
      `Team average performance: ${avgPerformance.toFixed(1)}/5`,
      `Average projects per member: ${avgProjects.toFixed(1)}`,
      `Top performers: ${topPerformers.length} (${((topPerformers.length / team.members.length) * 100).toFixed(0)}%)`,
      `Team size: ${team.members.length} members`,
    ];
    
    const recommendations: string[] = [];
    
    if (avgPerformance < 3.5) {
      recommendations.push('Consider team training or coaching programs');
    }
    if (underPerformers.length > team.members.length * 0.3) {
      recommendations.push('High percentage of underperformers - review team composition');
    }
    if (topPerformers.length > 0) {
      recommendations.push('Leverage top performers for mentoring opportunities');
    }
    
    return {
      success: true,
      analysis: `${team.department} team analysis: ${team.members.length} members with ${avgPerformance.toFixed(1)} average performance rating`,
      insights,
      recommendations,
      confidence: 0.8,
    };
  },
  
  /**
   * Suggest optimal salary based on market data
   */
  async suggestSalary(
    role: string,
    experience: number,
    region: RegionCode
  ): Promise<{ min: number; median: number; max: number; factors: string[] }> {
    // Mock salary bands (in production, would pull from market data API)
    const baseSalaries: Record<string, number> = {
      'Software Engineer': 600000,
      'Accountant': 420000,
      'Manager': 800000,
      'Director': 1200000,
      'Analyst': 360000,
      default: 400000,
    };
    
    const regionMultipliers: Record<RegionCode, number> = {
      CA: 1.2,
      HK: 1.0,
      CN: 0.6,
      IN: 0.4,
    };
    
    const base = (baseSalaries[role] || baseSalaries.default) * regionMultipliers[region];
    const expMultiplier = 1 + (experience * 0.05);
    
    const median = Math.round(base * expMultiplier);
    
    return {
      min: Math.round(median * 0.8),
      median,
      max: Math.round(median * 1.25),
      factors: [
        `Base salary for ${role}`,
        `${experience} years of experience adjustment`,
        `${region} regional adjustment`,
      ],
    };
  },
};

// =================================================================
// Kanban/Project AI Services
// =================================================================

export const projectAI = {
  /**
   * Smart task prioritization
   */
  async prioritizeTasks(
    tasks: {
      id: string;
      title: string;
      dueDate?: string;
      priority: number;
      effort: 'LOW' | 'MEDIUM' | 'HIGH';
      impact: 'LOW' | 'MEDIUM' | 'HIGH';
      dependencies?: string[];
    }[]
  ): Promise<AITaskPrioritization[]> {
    const now = Date.now();
    
    return tasks.map(task => {
      let urgencyScore = 50;
      let impactScore = 50;
      let effortScore = 50;
      
      // Urgency based on due date
      if (task.dueDate) {
        const daysUntilDue = Math.floor((new Date(task.dueDate).getTime() - now) / (1000 * 60 * 60 * 24));
        if (daysUntilDue < 0) urgencyScore = 100;
        else if (daysUntilDue < 2) urgencyScore = 90;
        else if (daysUntilDue < 7) urgencyScore = 70;
        else if (daysUntilDue < 14) urgencyScore = 50;
        else urgencyScore = 30;
      }
      
      // Impact score
      impactScore = task.impact === 'HIGH' ? 90 : task.impact === 'MEDIUM' ? 60 : 30;
      
      // Effort score (inverse - lower effort = easier to complete)
      effortScore = task.effort === 'LOW' ? 80 : task.effort === 'MEDIUM' ? 50 : 20;
      
      // Has dependencies reduces priority
      if (task.dependencies && task.dependencies.length > 0) {
        urgencyScore *= 0.8;
      }
      
      const aiPriority = Math.round((urgencyScore * 0.4 + impactScore * 0.4 + effortScore * 0.2) / 10);
      
      return {
        taskId: task.id,
        originalPriority: task.priority,
        aiPriority,
        reasoning: `Urgency: ${urgencyScore}/100, Impact: ${impactScore}/100, Effort efficiency: ${effortScore}/100`,
        urgencyScore,
        impactScore,
        effortScore,
      };
    }).sort((a, b) => b.aiPriority - a.aiPriority);
  },
  
  /**
   * Detect project bottlenecks
   */
  async detectBottlenecks(
    columns: { name: string; tasks: { id: string; assignee?: string; age: number }[] }[]
  ): Promise<AIAnomaly[]> {
    const anomalies: AIAnomaly[] = [];
    
    columns.forEach(col => {
      // Too many tasks in one column
      if (col.tasks.length > 10) {
        anomalies.push({
          id: `bottleneck-${col.name}`,
          type: 'PATTERN_BREAK',
          severity: col.tasks.length > 20 ? 'HIGH' : 'MEDIUM',
          description: `Column "${col.name}" has ${col.tasks.length} tasks - potential bottleneck`,
          affectedItems: col.tasks.map(t => t.id),
          suggestedAction: 'Review tasks and consider redistributing workload',
          detectedAt: new Date().toISOString(),
        });
      }
      
      // Old tasks
      const oldTasks = col.tasks.filter(t => t.age > 14);
      if (oldTasks.length > 0) {
        anomalies.push({
          id: `stale-${col.name}`,
          type: 'TIMING_ISSUE',
          severity: oldTasks.some(t => t.age > 30) ? 'HIGH' : 'MEDIUM',
          description: `${oldTasks.length} tasks have been in "${col.name}" for over 2 weeks`,
          affectedItems: oldTasks.map(t => t.id),
          suggestedAction: 'Review stale tasks - may be blocked or need reassignment',
          detectedAt: new Date().toISOString(),
        });
      }
    });
    
    return anomalies;
  },
  
  /**
   * Estimate project completion
   */
  async estimateCompletion(
    project: {
      totalTasks: number;
      completedTasks: number;
      averageCompletionDays: number;
      teamSize: number;
    }
  ): Promise<AIPrediction> {
    const remainingTasks = project.totalTasks - project.completedTasks;
    const tasksPerDay = project.teamSize * (1 / project.averageCompletionDays);
    const estimatedDays = Math.ceil(remainingTasks / tasksPerDay);
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + estimatedDays);
    
    return {
      success: true,
      prediction: completionDate.toISOString().split('T')[0],
      confidence: 0.65,
      reasoning: `Based on ${project.averageCompletionDays} day average per task with ${project.teamSize} team members`,
      factors: [
        `${remainingTasks} tasks remaining`,
        `Historical average: ${project.averageCompletionDays} days per task`,
        `Team capacity: ~${tasksPerDay.toFixed(1)} tasks/day`,
      ],
    };
  },
};

// =================================================================
// Business Intelligence AI Services
// =================================================================

export const businessAI = {
  /**
   * Analyze revenue trends
   */
  async analyzeRevenueTrends(
    data: { period: string; revenue: number; category?: string }[]
  ): Promise<AIAnalysisResult> {
    const sortedData = [...data].sort((a, b) => a.period.localeCompare(b.period));
    const revenues = sortedData.map(d => d.revenue);
    
    // Calculate growth rates
    const growthRates = revenues.slice(1).map((r, i) => ((r - revenues[i]) / revenues[i]) * 100);
    const avgGrowth = growthRates.length > 0 ? growthRates.reduce((a, b) => a + b, 0) / growthRates.length : 0;
    
    // Calculate volatility
    const mean = revenues.reduce((a, b) => a + b, 0) / revenues.length;
    const volatility = Math.sqrt(revenues.map(r => Math.pow(r - mean, 2)).reduce((a, b) => a + b) / revenues.length) / mean;
    
    const insights: string[] = [
      `Average period-over-period growth: ${avgGrowth.toFixed(1)}%`,
      `Revenue volatility: ${(volatility * 100).toFixed(1)}%`,
      `Peak revenue: ${Math.max(...revenues).toLocaleString()}`,
      `Lowest revenue: ${Math.min(...revenues).toLocaleString()}`,
    ];
    
    const recommendations: string[] = [];
    
    if (avgGrowth < 0) {
      recommendations.push('Declining revenue trend - investigate root causes');
      recommendations.push('Consider diversifying revenue streams');
    } else if (avgGrowth > 20) {
      recommendations.push('Strong growth - ensure infrastructure can scale');
    }
    
    if (volatility > 0.3) {
      recommendations.push('High revenue volatility - consider stabilization strategies');
    }
    
    return {
      success: true,
      analysis: `Revenue trend analysis over ${data.length} periods`,
      insights,
      recommendations,
      confidence: 0.75,
      rawData: { avgGrowth, volatility, growthRates },
    };
  },
  
  /**
   * Client profitability analysis
   */
  async analyzeClientProfitability(
    clients: {
      id: string;
      name: string;
      revenue: number;
      costs: number;
      hoursSpent: number;
    }[]
  ): Promise<AIAnalysisResult> {
    const analyzed = clients.map(c => ({
      ...c,
      profit: c.revenue - c.costs,
      margin: ((c.revenue - c.costs) / c.revenue) * 100,
      hourlyRate: c.revenue / c.hoursSpent,
      profitPerHour: (c.revenue - c.costs) / c.hoursSpent,
    }));
    
    const sortedByProfit = [...analyzed].sort((a, b) => b.profitPerHour - a.profitPerHour);
    const topClients = sortedByProfit.slice(0, 5);
    const bottomClients = sortedByProfit.slice(-3);
    
    const insights: string[] = [
      `Total clients analyzed: ${clients.length}`,
      `Total revenue: ${clients.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}`,
      `Average profit margin: ${(analyzed.reduce((sum, c) => sum + c.margin, 0) / analyzed.length).toFixed(1)}%`,
      `Top performer: ${topClients[0]?.name} (${topClients[0]?.profitPerHour.toFixed(0)}/hour)`,
    ];
    
    const recommendations: string[] = [];
    
    bottomClients.forEach(c => {
      if (c.margin < 10) {
        recommendations.push(`Review engagement with ${c.name} - low ${c.margin.toFixed(1)}% margin`);
      }
    });
    
    if (bottomClients.some(c => c.margin < 0)) {
      recommendations.push('Some clients are unprofitable - consider rate adjustments or scope changes');
    }
    
    return {
      success: true,
      analysis: `Client profitability analysis across ${clients.length} clients`,
      insights,
      recommendations,
      confidence: 0.85,
      rawData: { topClients, bottomClients, analyzed },
    };
  },
};

// =================================================================
// Product AI Services
// =================================================================

export const productAI = {
  /**
   * Generate product description
   */
  async generateDescription(
    product: {
      name: string;
      category: string;
      features: string[];
      targetAudience?: string;
    },
    tone: 'professional' | 'casual' | 'technical' = 'professional'
  ): Promise<{ description: string; seoKeywords: string[] }> {
    const featureList = product.features.map(f => `• ${f}`).join('\n');
    
    let description = '';
    
    switch (tone) {
      case 'professional':
        description = `Introducing ${product.name}, a premium ${product.category} solution designed for ${product.targetAudience || 'discerning customers'}. \n\nKey Features:\n${featureList}\n\nExperience excellence with ${product.name}.`;
        break;
      case 'casual':
        description = `Meet ${product.name}! This amazing ${product.category} is perfect for ${product.targetAudience || 'everyone'}. \n\nWhat you'll love:\n${featureList}\n\nGet yours today!`;
        break;
      case 'technical':
        description = `${product.name} - ${product.category}\n\nSpecifications:\n${featureList}\n\nOptimized for performance and reliability.`;
        break;
    }
    
    const seoKeywords = [
      product.name.toLowerCase(),
      product.category.toLowerCase(),
      ...product.features.map(f => f.toLowerCase().split(' ').slice(0, 2).join(' ')),
    ];
    
    return { description, seoKeywords };
  },
  
  /**
   * Predict inventory needs
   */
  async predictInventoryNeeds(
    product: {
      id: string;
      name: string;
      currentStock: number;
      avgMonthlySales: number;
      leadTimeDays: number;
    }
  ): Promise<AIPrediction> {
    const daysOfStock = product.currentStock / (product.avgMonthlySales / 30);
    const reorderPoint = Math.ceil((product.avgMonthlySales / 30) * product.leadTimeDays * 1.2); // 20% safety margin
    
    const needsReorder = product.currentStock <= reorderPoint;
    const suggestedQuantity = Math.ceil(product.avgMonthlySales * 2); // 2 months stock
    
    return {
      success: true,
      prediction: needsReorder ? `Reorder ${suggestedQuantity} units` : 'Stock adequate',
      confidence: 0.7,
      reasoning: `Current stock covers ${daysOfStock.toFixed(0)} days. Reorder point: ${reorderPoint} units.`,
      factors: [
        `Current stock: ${product.currentStock} units`,
        `Average daily sales: ${(product.avgMonthlySales / 30).toFixed(1)} units`,
        `Lead time: ${product.leadTimeDays} days`,
        `Days of stock remaining: ${daysOfStock.toFixed(0)}`,
      ],
    };
  },
};

// =================================================================
// Natural Language Processing
// =================================================================

export const nlpAI = {
  /**
   * Extract action items from text
   */
  extractActionItems(text: string): { action: string; assignee?: string; deadline?: string }[] {
    const items: { action: string; assignee?: string; deadline?: string }[] = [];
    
    // Simple pattern matching (in production, would use NLP model)
    const patterns = [
      /(?:please|need to|should|must|will)\s+(.+?)(?:\.|,|$)/gi,
      /(?:action:|todo:|task:)\s*(.+?)(?:\.|,|$)/gi,
      /(?:@\w+)\s+(.+?)(?:\.|,|$)/gi,
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        items.push({
          action: match[1].trim(),
        });
      }
    });
    
    return items;
  },
  
  /**
   * Classify text category
   */
  classifyText(text: string): AIClassification {
    const lowerText = text.toLowerCase();
    
    const categories: { name: string; keywords: string[] }[] = [
      { name: 'Financial', keywords: ['invoice', 'payment', 'budget', 'expense', 'revenue', 'tax', 'audit'] },
      { name: 'HR', keywords: ['employee', 'hire', 'leave', 'salary', 'payroll', 'attendance'] },
      { name: 'Project', keywords: ['project', 'task', 'deadline', 'milestone', 'deliverable'] },
      { name: 'Sales', keywords: ['client', 'customer', 'deal', 'proposal', 'contract'] },
      { name: 'Support', keywords: ['issue', 'problem', 'help', 'support', 'ticket'] },
    ];
    
    const scores = categories.map(cat => ({
      name: cat.name,
      score: cat.keywords.filter(kw => lowerText.includes(kw)).length,
    }));
    
    const sortedScores = scores.sort((a, b) => b.score - a.score);
    const topScore = sortedScores[0];
    
    return {
      category: topScore.score > 0 ? topScore.name : 'General',
      confidence: Math.min(0.9, topScore.score * 0.2 + 0.3),
      alternatives: sortedScores.slice(1, 3).map(s => ({
        category: s.name,
        confidence: Math.min(0.7, s.score * 0.15 + 0.2),
      })),
    };
  },
  
  /**
   * Summarize text
   */
  summarize(text: string, maxLength: number = 200): string {
    // Simple extractive summary (in production, would use AI model)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 2) {
      return text.slice(0, maxLength);
    }
    
    // Take first and last sentences for context
    const summary = `${sentences[0].trim()}. ${sentences[sentences.length - 1].trim()}.`;
    
    return summary.length > maxLength ? summary.slice(0, maxLength) + '...' : summary;
  },
};

// =================================================================
// Export all AI services
// =================================================================

export const universalAI = {
  finance: financeAI,
  hrms: hrmsAI,
  project: projectAI,
  business: businessAI,
  product: productAI,
  nlp: nlpAI,
};

export default universalAI;
