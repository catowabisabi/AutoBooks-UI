'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles,
  Download,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  FileText,
  Globe,
  Target,
  Shield,
  Lightbulb,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { ragApi } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/provider';

interface AnalysisReport {
  id: string;
  generatedAt: string;
  company: {
    name: string;
    type: string;
    industry: string;
  };
  summary: {
    en: string;
    zh: string;
  };
  keyMetrics: {
    metric: string;
    value: string;
    status: 'good' | 'warning' | 'critical';
    insight: string;
  }[];
  industryComparison: {
    metric: string;
    yourValue: number;
    industryAvg: number;
    percentile: number;
    analysis: string;
  }[];
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    title: { en: string; zh: string };
    description: { en: string; zh: string };
    impact: { en: string; zh: string };
  }[];
  riskAssessment: {
    category: { en: string; zh: string };
    level: 'low' | 'medium' | 'high';
    description: { en: string; zh: string };
  }[];
  forecast: {
    metric: { en: string; zh: string };
    current: string;
    projected: string;
    confidence: number;
  }[];
}

interface CompanyData {
  name: string;
  type: string;
  stats: Record<string, unknown>;
  engagements: unknown[];
  serviceBreakdown: unknown[];
  currency: string;
}

interface AnalysisDialogProps {
  companyData: CompanyData;
  chartData?: Record<string, unknown>;
}

// Cache interface for storing analysis reports
interface CachedReport {
  report: AnalysisReport;
  cachedAt: string; // ISO date string
  companyId: string;
}

// Get today's date as YYYY-MM-DD string
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Generate cache key for a company
function getCacheKey(companyName: string): string {
  return `analysis-report-${companyName.toLowerCase().replace(/\s+/g, '-')}`;
}

// Check if cache is from today
function isCacheValid(cachedAt: string): boolean {
  const cachedDate = cachedAt.split('T')[0];
  const today = getTodayDateString();
  return cachedDate === today;
}

// Save report to localStorage
function saveReportToCache(companyName: string, report: AnalysisReport): void {
  try {
    const cacheKey = getCacheKey(companyName);
    const cacheData: CachedReport = {
      report,
      cachedAt: new Date().toISOString(),
      companyId: companyName,
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (e) {
    console.warn('Failed to cache report:', e);
  }
}

// Load report from localStorage
function loadReportFromCache(companyName: string): AnalysisReport | null {
  try {
    const cacheKey = getCacheKey(companyName);
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const cacheData: CachedReport = JSON.parse(cached);
    if (!isCacheValid(cacheData.cachedAt)) {
      // Cache expired, remove it
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return cacheData.report;
  } catch (e) {
    console.warn('Failed to load cached report:', e);
    return null;
  }
}

// Get cache timestamp for display
function getCacheTimestamp(companyName: string): string | null {
  try {
    const cacheKey = getCacheKey(companyName);
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const cacheData: CachedReport = JSON.parse(cached);
    return cacheData.cachedAt;
  } catch {
    return null;
  }
}

// Helper function to get industry name
function getIndustryName(type: string): string {
  const names: Record<string, string> = {
    accounting: 'Accounting & Audit',
    'financial-pr': 'Financial PR & Communications',
    'ipo-advisory': 'IPO Advisory Services'
  };
  return names[type] || type;
}

// Generate mock report for demo or fallback
function generateMockReport(companyData: CompanyData, aiAnalysis?: Partial<AnalysisReport> | null): AnalysisReport {
  const type = companyData.type;
  
  // Helper to ensure summary has correct bilingual format
  const ensureBilingualSummary = (summary: any): { en: string; zh: string } => {
    if (summary && typeof summary === 'object' && summary.en && summary.zh) {
      return summary;
    }
    if (typeof summary === 'string') {
      // If it's a raw string, use it for both languages
      return { en: summary, zh: summary };
    }
    // Fallback to default
    return {
      en: `${companyData.name} demonstrates strong performance in the ${getIndustryName(companyData.type)} sector.`,
      zh: `${companyData.name} 在${getIndustryName(companyData.type)}行業展現強勁表現。`
    };
  };
  
  // If we have a full AI response object with proper structure, use it
  if (aiAnalysis && typeof aiAnalysis === 'object' && aiAnalysis.summary) {
    const processedSummary = ensureBilingualSummary(aiAnalysis.summary);
    
    return {
      id: `RPT-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      company: {
        name: companyData.name,
        type: companyData.type,
        industry: getIndustryName(companyData.type)
      },
      summary: processedSummary,
      keyMetrics: aiAnalysis.keyMetrics || [],
      industryComparison: aiAnalysis.industryComparison || [],
      recommendations: aiAnalysis.recommendations || [],
      riskAssessment: aiAnalysis.riskAssessment || [],
      forecast: aiAnalysis.forecast || []
    } as AnalysisReport;
  }

  const mockReports: Record<string, Partial<AnalysisReport>> = {
    accounting: {
      summary: {
        en: `${companyData.name} demonstrates strong performance in the accounting and audit sector. The firm has maintained a healthy client portfolio with consistent revenue growth. Key strengths include high audit quality standards and expanding tax advisory services.\n\nThe billable hours utilization rate of 78% exceeds industry average, indicating efficient resource allocation. Client retention remains strong at 92%, suggesting high satisfaction levels. However, the advisory services segment shows potential for growth, currently contributing only 15% to total revenue.\n\nLooking ahead, the firm is well-positioned to capitalize on increased regulatory requirements and growing demand for ESG reporting services.`,
        zh: `${companyData.name} 在會計審計行業展現強勁表現。公司維持健康的客戶組合，收入持續增長。主要優勢包括高審計質量標準和不斷擴展的稅務諮詢服務。\n\n可收費工時使用率達78%，超越行業平均水平，顯示資源配置效率良好。客戶保留率維持在92%的高水平，反映客戶滿意度高。然而，諮詢服務部門顯示增長潛力，目前僅佔總收入15%。\n\n展望未來，公司處於有利位置，可把握監管要求增加及ESG報告服務需求增長的機遇。`
      },
      keyMetrics: [
        { metric: 'Utilization Rate', value: '78%', status: 'good', insight: 'Above industry average of 75%' },
        { metric: 'Client Retention', value: '92%', status: 'good', insight: 'Strong client loyalty' },
        { metric: 'Revenue Growth', value: '+12.5%', status: 'good', insight: 'Healthy growth trajectory' },
        { metric: 'Advisory Revenue Share', value: '15%', status: 'warning', insight: 'Below target of 25%' }
      ],
      industryComparison: [
        { metric: 'Utilization Rate', yourValue: 78, industryAvg: 75, percentile: 65, analysis: 'Performing above average' },
        { metric: 'Client Retention', yourValue: 92, industryAvg: 85, percentile: 82, analysis: 'Top quartile performance' },
        { metric: 'Revenue per Partner', yourValue: 850, industryAvg: 720, percentile: 75, analysis: 'Strong partner productivity' },
        { metric: 'Staff Turnover', yourValue: 12, industryAvg: 18, percentile: 78, analysis: 'Better retention than peers' }
      ],
      recommendations: [
        { 
          priority: 'high', 
          title: { en: 'Expand Advisory Services', zh: '擴展諮詢服務' },
          description: { en: 'Increase focus on consulting and advisory to diversify revenue streams', zh: '加強諮詢和顧問服務，以多元化收入來源' },
          impact: { en: 'Could increase margins by 5-8%', zh: '可能提高利潤率 5-8%' }
        },
        { 
          priority: 'medium', 
          title: { en: 'Digital Transformation', zh: '數位轉型' },
          description: { en: 'Invest in automation tools for routine audit tasks', zh: '投資自動化工具以處理常規審計任務' },
          impact: { en: 'Improve efficiency by 20%', zh: '提高效率 20%' }
        },
        { 
          priority: 'low', 
          title: { en: 'ESG Reporting Services', zh: 'ESG 報告服務' },
          description: { en: 'Develop ESG audit and reporting capabilities', zh: '發展 ESG 審計和報告能力' },
          impact: { en: 'New revenue stream potential', zh: '新收入來源潛力' }
        }
      ],
      riskAssessment: [
        { 
          category: { en: 'Client Concentration', zh: '客戶集中度' },
          level: 'medium', 
          description: { en: 'Top 5 clients represent 35% of revenue', zh: '前 5 大客戶佔收入的 35%' }
        },
        { 
          category: { en: 'Regulatory Changes', zh: '監管變更' },
          level: 'low', 
          description: { en: 'Well-prepared for new audit standards', zh: '已為新審計標準做好充分準備' }
        },
        { 
          category: { en: 'Talent Retention', zh: '人才保留' },
          level: 'low', 
          description: { en: 'Strong culture and competitive compensation', zh: '強大的企業文化和具競爭力的薪酬' }
        }
      ],
      forecast: [
        { metric: { en: 'Revenue', zh: '收入' }, current: 'HK$9.48M', projected: 'HK$10.2M', confidence: 85 },
        { metric: { en: 'Client Count', zh: '客戶數量' }, current: '48', projected: '52', confidence: 78 },
        { metric: { en: 'Utilization', zh: '使用率' }, current: '78%', projected: '80%', confidence: 72 }
      ]
    },
    'financial-pr': {
      summary: {
        en: `${companyData.name} has established a strong market position in financial PR and communications. The firm excels in investor relations and corporate announcements, with an impressive 85% positive media sentiment across client campaigns.\n\nClient engagement metrics show robust performance with 62 investor meetings facilitated monthly. The technology sector represents the largest client segment at 35%, providing stable recurring revenue. Social media reach has grown 80% year-over-year.\n\nThe firm should focus on expanding healthcare sector clients and developing crisis management capabilities to capture emerging market opportunities.`,
        zh: `${companyData.name} 在財經公關和傳訊領域建立了穩固的市場地位。公司在投資者關係和企業公告方面表現出色，客戶活動的正面媒體情緒達到85%的高水平。\n\n客戶互動指標表現強勁，每月促成62次投資者會議。科技行業佔最大客戶群體，達35%，提供穩定的經常性收入。社交媒體覆蓋率按年增長80%。\n\n公司應專注於擴展醫療保健行業客戶，並發展危機管理能力，以把握新興市場機遇。`
      },
      keyMetrics: [
        { metric: 'Positive Sentiment', value: '85%', status: 'good', insight: 'Excellent media coverage quality' },
        { metric: 'Client Reach', value: '225K', status: 'good', insight: 'Strong social presence' },
        { metric: 'Monthly Events', value: '4', status: 'good', insight: 'Active engagement calendar' },
        { metric: 'Response Time', value: '2.5hrs', status: 'warning', insight: 'Target is under 2 hours' }
      ],
      industryComparison: [
        { metric: 'Media Hit Rate', yourValue: 78, industryAvg: 65, percentile: 82, analysis: 'Excellent media relationships' },
        { metric: 'Social Engagement', yourValue: 5.2, industryAvg: 4.5, percentile: 71, analysis: 'Above average engagement' },
        { metric: 'Client Retention', yourValue: 88, industryAvg: 78, percentile: 85, analysis: 'Strong client loyalty' },
        { metric: 'Campaign ROI', yourValue: 380, industryAvg: 320, percentile: 74, analysis: 'Good value delivery' }
      ],
      recommendations: [
        { 
          priority: 'high', 
          title: { en: 'Crisis Management Service', zh: '危機管理服務' },
          description: { en: 'Develop 24/7 crisis response team', zh: '建立 24/7 危機應對團隊' },
          impact: { en: 'New premium service offering', zh: '新的高端服務產品' }
        },
        { 
          priority: 'high', 
          title: { en: 'Healthcare Sector Expansion', zh: '醫療保健行業擴展' },
          description: { en: 'Target healthcare IPO candidates', zh: '鎖定醫療保健 IPO 候選人' },
          impact: { en: 'Diversify client base by 20%', zh: '客戶群多元化 20%' }
        },
        { 
          priority: 'medium', 
          title: { en: 'AI Content Tools', zh: 'AI 內容工具' },
          description: { en: 'Implement AI for content generation and monitoring', zh: '實施 AI 進行內容生成和監控' },
          impact: { en: 'Reduce turnaround time by 40%', zh: '縮短周轉時間 40%' }
        }
      ],
      riskAssessment: [
        { 
          category: { en: 'Sector Concentration', zh: '行業集中度' },
          level: 'medium', 
          description: { en: 'Heavy reliance on tech sector clients', zh: '過度依賴科技行業客戶' }
        },
        { 
          category: { en: 'Media Relations', zh: '媒體關係' },
          level: 'low', 
          description: { en: 'Strong journalist relationships', zh: '強大的記者關係' }
        },
        { 
          category: { en: 'Competitive Pressure', zh: '競爭壓力' },
          level: 'medium', 
          description: { en: 'New entrants in digital PR space', zh: '數位公關領域的新進入者' }
        }
      ],
      forecast: [
        { metric: { en: 'Client Base', zh: '客戶群' }, current: '80', projected: '88', confidence: 82 },
        { metric: { en: 'Media Reach', zh: '媒體覆蓋' }, current: '225K', projected: '280K', confidence: 78 },
        { metric: { en: 'Revenue', zh: '收入' }, current: 'HK$6.8M', projected: 'HK$7.5M', confidence: 75 }
      ]
    },
    'ipo-advisory': {
      summary: {
        en: `${companyData.name} maintains a strong position in the IPO advisory market with a robust deal pipeline valued at $9.12B. The firm has demonstrated consistent success with an 11% lead-to-listing conversion rate, outperforming market averages.\n\nThe current pipeline shows healthy distribution across deal sizes, with mega deals (>$1B) contributing significantly to potential fee income. Due diligence processes are 92% complete on average, indicating strong operational execution.\n\nKey focus areas should include accelerating the marketing phase timeline and strengthening relationships with institutional investors to improve deal conversion rates.`,
        zh: `${companyData.name} 在IPO顧問市場保持強勢地位，交易管道價值達91.2億美元。公司展現持續成功，潛在客戶到上市的轉換率達11%，優於市場平均水平。\n\n目前交易管道在各規模類別分佈健康，大型交易（>10億美元）對潛在費用收入貢獻顯著。盡職調查流程平均完成度達92%，顯示運營執行力強。\n\n主要關注領域應包括加快營銷階段時間線，以及加強與機構投資者的關係，以提高交易轉換率。`
      },
      keyMetrics: [
        { metric: 'Pipeline Value', value: '$9.12B', status: 'good', insight: 'Strong deal flow' },
        { metric: 'Conversion Rate', value: '11%', status: 'good', insight: 'Above market average of 8%' },
        { metric: 'Due Diligence', value: '92%', status: 'good', insight: 'Near completion on key deals' },
        { metric: 'Marketing Phase', value: '65%', status: 'warning', insight: 'Needs acceleration' }
      ],
      industryComparison: [
        { metric: 'Success Rate', yourValue: 89, industryAvg: 85, percentile: 72, analysis: 'Strong track record' },
        { metric: 'Time to Listing', yourValue: 14, industryAvg: 18, percentile: 85, analysis: 'Faster than average' },
        { metric: 'Deal Conversion', yourValue: 11, industryAvg: 8, percentile: 78, analysis: 'Efficient pipeline' },
        { metric: 'Client Satisfaction', yourValue: 4.7, industryAvg: 4.5, percentile: 68, analysis: 'High satisfaction' }
      ],
      recommendations: [
        { 
          priority: 'high', 
          title: { en: 'Accelerate Marketing Phase', zh: '加速營銷階段' },
          description: { en: 'Streamline investor roadshow preparation process', zh: '簡化投資者路演準備流程' },
          impact: { en: 'Reduce time-to-market by 3 weeks', zh: '縮短上市時間 3 週' }
        },
        { 
          priority: 'high', 
          title: { en: 'Institutional Investor Network', zh: '機構投資者網絡' },
          description: { en: 'Expand relationships with top 50 institutional investors', zh: '擴大與前 50 大機構投資者的關係' },
          impact: { en: 'Improve subscription rates by 15%', zh: '提高認購率 15%' }
        },
        { 
          priority: 'medium', 
          title: { en: 'ESG Integration', zh: 'ESG 整合' },
          description: { en: 'Add ESG assessment to standard due diligence', zh: '將 ESG 評估加入標準盡職調查' },
          impact: { en: 'Attract ESG-focused investors', zh: '吸引關注 ESG 的投資者' }
        }
      ],
      riskAssessment: [
        { 
          category: { en: 'Market Conditions', zh: '市場狀況' },
          level: 'medium', 
          description: { en: 'IPO market volatility may affect timing', zh: 'IPO 市場波動可能影響時機' }
        },
        { 
          category: { en: 'Regulatory Changes', zh: '監管變更' },
          level: 'low', 
          description: { en: 'Strong compliance framework in place', zh: '已建立強大的合規框架' }
        },
        { 
          category: { en: 'Deal Concentration', zh: '交易集中度' },
          level: 'medium', 
          description: { en: 'Mega deals represent 35% of pipeline value', zh: '大型交易佔管道價值的 35%' }
        }
      ],
      forecast: [
        { metric: { en: 'Listings', zh: '上市數量' }, current: '5', projected: '8', confidence: 72 },
        { metric: { en: 'Pipeline Value', zh: '管道價值' }, current: '$9.12B', projected: '$11.5B', confidence: 68 },
        { metric: { en: 'Revenue', zh: '收入' }, current: '$12.5M', projected: '$15.2M', confidence: 70 }
      ]
    }
  };

  return {
    id: `RPT-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    company: {
      name: companyData.name,
      type: companyData.type,
      industry: getIndustryName(companyData.type)
    },
    ...(mockReports[type] || mockReports.accounting)
  } as AnalysisReport;
}

// 解析 AI 回應中的 JSON
function parseAIResponse(response: string): Partial<AnalysisReport> | null {
  try {
    // 嘗試找到 JSON 塊
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || 
                      response.match(/\{[\s\S]*"summary"[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      // Clean up any potential markdown or invalid characters before parsing
      const cleanJsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJsonStr);
    }
    // Try parsing the whole response if no code blocks found
    return JSON.parse(response);
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    return null;
  }
}

export function AnalysisDialog({ companyData }: AnalysisDialogProps) {
  const { t, locale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [language, setLanguage] = useState<'en' | 'zh'>('zh');
  const [progress, setProgress] = useState(0);
  const [cacheTime, setCacheTime] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // Sync language with app locale
  useEffect(() => {
    setLanguage(locale === 'zh-TW' ? 'zh' : 'en');
  }, [locale]);

  // Load cached report on mount
  useEffect(() => {
    const cached = loadReportFromCache(companyData.name);
    if (cached) {
      setReport(cached);
      setIsFromCache(true);
      setCacheTime(getCacheTimestamp(companyData.name));
    }
  }, [companyData.name]);

  const generateAnalysis = useCallback(async (forceRegenerate = false) => {
    // Check cache first unless force regenerate
    if (!forceRegenerate) {
      const cached = loadReportFromCache(companyData.name);
      if (cached) {
        setReport(cached);
        setIsFromCache(true);
        setCacheTime(getCacheTimestamp(companyData.name));
        return;
      }
    }

    setIsLoading(true);
    setIsFromCache(false);
    setProgress(10);
    
    try {
      // Bilingual analysis prompt - generate both EN and ZH in one request
      const analysisQuery = `
As a professional business analyst, analyze the following company data and generate a detailed bilingual analysis report.

IMPORTANT: Generate BOTH English AND Traditional Chinese content for ALL sections.

Company Information:
- Name: ${companyData.name}
- Industry Type: ${companyData.type === 'accounting' ? 'Accounting & Audit / 會計審計' : companyData.type === 'financial-pr' ? 'Financial PR / 財經公關' : 'IPO Advisory / IPO顧問'}
- Currency: ${companyData.currency}

Company Statistics:
${JSON.stringify(companyData.stats, null, 2)}

Service Breakdown:
${JSON.stringify(companyData.serviceBreakdown, null, 2)}

Please provide the following analysis in BOTH English and Traditional Chinese.
The output MUST be a valid JSON object with the following structure:

{
  "summary": {
    "en": "English executive summary...",
    "zh": "中文執行摘要..."
  },
  "keyMetrics": [
    { "metric": "Metric Name", "value": "Value", "status": "good/warning/critical", "insight": "Insight" }
  ],
  "industryComparison": [
    { "metric": "Metric Name", "yourValue": 0, "industryAvg": 0, "percentile": 0, "analysis": "Analysis" }
  ],
  "recommendations": [
    {
      "priority": "high/medium/low",
      "title": { "en": "English Title", "zh": "中文標題" },
      "description": { "en": "English Description", "zh": "中文描述" },
      "impact": { "en": "English Impact", "zh": "中文影響" }
    }
  ],
  "riskAssessment": [
    {
      "category": { "en": "English Category", "zh": "中文類別" },
      "level": "low/medium/high",
      "description": { "en": "English Description", "zh": "中文描述" }
    }
  ],
  "forecast": [
    {
      "metric": { "en": "English Metric Name", "zh": "中文指標名稱" },
      "current": "Current Value",
      "projected": "Projected Value",
      "confidence": 0-100
    }
  ]
}

Ensure all text fields (titles, descriptions, impacts, categories) have both 'en' and 'zh' versions.
`;

      setProgress(30);
      
      // Use backend RAG chat API
      const response = await ragApi.chat(analysisQuery, {
        category: 'business-analysis',
        provider: 'openai',
      });

      setProgress(70);

      // Try to parse AI response - the response.response is a string that may contain JSON
      const aiResponseText = response.response;
      
      // Parse the AI response to extract the structured JSON
      const parsedAiAnalysis = parseAIResponse(aiResponseText);
      
      // Generate report structure, integrating parsed AI analysis
      const generatedReport = generateMockReport(companyData, parsedAiAnalysis);
      
      setProgress(100);
      setReport(generatedReport);
      
      // Save to cache
      saveReportToCache(companyData.name, generatedReport);
      setCacheTime(new Date().toISOString());
      
    } catch (err) {
      console.error('Analysis error:', err);
      // If API fails, use locally generated mock report
      const mockReport = generateMockReport(companyData);
      setReport(mockReport);
      // Still cache the mock report
      saveReportToCache(companyData.name, mockReport);
      setCacheTime(new Date().toISOString());
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, [companyData]);

  const handleRegenerate = useCallback(() => {
    generateAnalysis(true); // Force regenerate
  }, [generateAnalysis]);

  const downloadPDF = useCallback(async () => {
    if (!report) return;
    
    const htmlContent = generatePDFHTML(report, language);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  }, [report, language]);

  const getStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
    }
  };

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => {
            setIsOpen(true);
            if (!report) {
              generateAnalysis();
            }
          }}
        >
          <Sparkles className="h-4 w-4" />
          {language === 'zh' ? 'AI 分析' : 'AI Analysis'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {language === 'zh' ? 'AI 智能分析報告' : 'AI Analysis Report'}
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>{companyData.name} - {report?.company.industry || (language === 'zh' ? '生成中...' : 'Generating...')}</span>
            {cacheTime && isFromCache && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {language === 'zh' ? '快取於' : 'Cached at'} {new Date(cacheTime).toLocaleTimeString()}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
            <div className="text-center">
              <p className="text-lg font-medium">
                {progress < 30 
                  ? (language === 'zh' ? '正在收集公司數據...' : 'Collecting company data...') 
                  : progress < 70 
                  ? (language === 'zh' ? 'AI 正在分析數據...' : 'AI analyzing data...') 
                  : (language === 'zh' ? '正在生成報告...' : 'Generating report...')}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' 
                  ? '使用 AI 智能引擎分析您的業務表現' 
                  : 'Using AI engine to analyze your business performance'}
              </p>
            </div>
            <Progress value={progress || 20} className="w-64" />
            <p className="text-xs text-muted-foreground">{progress}%</p>
          </div>
        )}

        {report && !isLoading && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={language === 'zh' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('zh')}
                >
                  中文
                </Button>
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('en')}
                >
                  English
                </Button>
                {isFromCache && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Calendar className="h-3 w-3" />
                    {language === 'zh' ? '今日快取' : 'Cached Today'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {report.id}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRegenerate}
                  title={language === 'zh' ? '重新生成報告' : 'Regenerate Report'}
                  className="gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  {language === 'zh' ? '重新生成' : 'Regenerate'}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  {language === 'zh' ? '下載 PDF' : 'Download PDF'}
                </Button>
              </div>
            </div>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="summary" className="gap-1">
                  <FileText className="h-3 w-3" />
                  {language === 'zh' ? '摘要' : 'Summary'}
                </TabsTrigger>
                <TabsTrigger value="metrics" className="gap-1">
                  <BarChart3 className="h-3 w-3" />
                  {language === 'zh' ? '指標' : 'Metrics'}
                </TabsTrigger>
                <TabsTrigger value="comparison" className="gap-1">
                  <Globe className="h-3 w-3" />
                  {language === 'zh' ? '對比' : 'Compare'}
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="gap-1">
                  <Lightbulb className="h-3 w-3" />
                  {language === 'zh' ? '建議' : 'Advice'}
                </TabsTrigger>
                <TabsTrigger value="risk" className="gap-1">
                  <Shield className="h-3 w-3" />
                  {language === 'zh' ? '風險' : 'Risk'}
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[50vh] mt-4 pr-4">
                <TabsContent value="summary" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {language === 'zh' ? '執行摘要' : 'Executive Summary'}
                      </CardTitle>
                      <CardDescription>
                        {language === 'zh' ? '公司表現綜合分析' : 'Comprehensive Performance Analysis'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none">
                        {(() => {
                          // Safely get summary text
                          const summaryText = typeof report.summary === 'object' && report.summary[language]
                            ? report.summary[language]
                            : typeof report.summary === 'string'
                            ? report.summary
                            : '';
                          
                          return summaryText.split('\n').map((paragraph: string, idx: number) => (
                            <p key={idx} className="mb-4 text-sm leading-relaxed">
                              {paragraph}
                            </p>
                          ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {language === 'zh' ? '業績預測' : 'Performance Forecast'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {report.forecast.map((item, idx) => (
                          <div key={idx} className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">
                              {typeof item.metric === 'object' ? item.metric[language] : item.metric}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-lg font-semibold">{item.current}</span>
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span className="text-lg font-semibold text-green-500">{item.projected}</span>
                            </div>
                            <div className="mt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span>{language === 'zh' ? '信心度' : 'Confidence'}</span>
                                <span>{item.confidence}%</span>
                              </div>
                              <Progress value={item.confidence} className="h-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.keyMetrics.map((metric, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">{metric.metric}</p>
                              <p className="text-2xl font-bold mt-1">{metric.value}</p>
                              <p className="text-xs text-muted-foreground mt-2">{metric.insight}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusIcon(metric.status)}
                              <Badge className={getStatusColor(metric.status)}>
                                {metric.status === 'good' ? '良好' : metric.status === 'warning' ? '注意' : '警告'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="comparison" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        {language === 'zh' ? '行業對比分析' : 'Industry Benchmark Analysis'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {report.industryComparison.map((item, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{item.metric}</span>
                            <Badge variant="outline">
                              第 {item.percentile} 百分位
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">您的公司</span>
                                <span className="font-semibold">{item.yourValue}</span>
                              </div>
                              <Progress value={Math.min(100, (item.yourValue / Math.max(item.yourValue, item.industryAvg)) * 100)} className="h-2 bg-purple-100" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">行業平均</span>
                                <span className="font-semibold">{item.industryAvg}</span>
                              </div>
                              <Progress value={Math.min(100, (item.industryAvg / Math.max(item.yourValue, item.industryAvg)) * 100)} className="h-2 bg-gray-200 dark:bg-gray-700" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {item.yourValue > item.industryAvg ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span>{item.analysis}</span>
                          </div>
                          {idx < report.industryComparison.length - 1 && <Separator className="mt-4" />}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  {report.recommendations.map((rec, idx) => {
                    // Safely get bilingual values
                    const title = typeof rec.title === 'object' ? rec.title[language] : rec.title;
                    const description = typeof rec.description === 'object' ? rec.description[language] : rec.description;
                    const impact = typeof rec.impact === 'object' ? rec.impact[language] : rec.impact;
                    
                    return (
                      <Card key={idx}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-2 h-full min-h-[60px] rounded-full ${getPriorityColor(rec.priority)}`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {rec.priority === 'high' 
                                    ? (language === 'zh' ? '高優先級' : 'High Priority')
                                    : rec.priority === 'medium' 
                                    ? (language === 'zh' ? '中優先級' : 'Medium Priority')
                                    : (language === 'zh' ? '低優先級' : 'Low Priority')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{description}</p>
                              <div className="flex items-center gap-2 text-sm">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-green-600 dark:text-green-400">{impact}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </TabsContent>

                <TabsContent value="risk" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {language === 'zh' ? '風險評估' : 'Risk Assessment'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {report.riskAssessment.map((risk, idx) => {
                        // Safely get bilingual values
                        const category = typeof risk.category === 'object' ? risk.category[language] : risk.category;
                        const description = typeof risk.description === 'object' ? risk.description[language] : risk.description;
                        
                        return (
                          <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                            <AlertTriangle className={`h-5 w-5 mt-0.5 ${getRiskColor(risk.level)}`} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium">{category}</h4>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    risk.level === 'low' 
                                      ? 'border-green-500 text-green-500' 
                                      : risk.level === 'medium' 
                                      ? 'border-yellow-500 text-yellow-500'
                                      : 'border-red-500 text-red-500'
                                  }
                                >
                                  {risk.level === 'low' 
                                    ? (language === 'zh' ? '低風險' : 'Low Risk')
                                    : risk.level === 'medium' 
                                    ? (language === 'zh' ? '中風險' : 'Medium Risk')
                                    : (language === 'zh' ? '高風險' : 'High Risk')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function generatePDFHTML(report: AnalysisReport, language: 'en' | 'zh'): string {
  const title = language === 'zh' ? 'AI 智能分析報告' : 'AI Analysis Report';
  const generatedDate = new Date(report.generatedAt).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title} - ${report.company.name}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft JhengHei', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      font-size: 14px;
    }
    .header { 
      text-align: center; 
      margin-bottom: 40px; 
      border-bottom: 3px solid #8b5cf6; 
      padding-bottom: 20px;
      page-break-after: avoid;
    }
    .header h1 { 
      color: #8b5cf6; 
      margin: 0 0 10px 0; 
      font-size: 28px;
    }
    .header .company { font-size: 24px; font-weight: bold; margin: 10px 0; }
    .header .industry { color: #666; font-size: 16px; }
    .header .meta { font-size: 12px; color: #999; margin-top: 15px; }
    .section { 
      margin-bottom: 30px; 
      page-break-inside: avoid;
    }
    .section h2 { 
      color: #8b5cf6; 
      border-bottom: 2px solid #e5e7eb; 
      padding-bottom: 8px; 
      font-size: 18px;
      margin-bottom: 15px;
    }
    .summary { 
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); 
      padding: 20px; 
      border-radius: 12px; 
      border-left: 4px solid #8b5cf6;
    }
    .summary p { margin: 10px 0; text-align: justify; }
    .metrics-grid { 
      display: grid; 
      grid-template-columns: repeat(2, 1fr); 
      gap: 16px; 
    }
    .metric-card { 
      border: 1px solid #e5e7eb; 
      padding: 16px; 
      border-radius: 12px; 
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .metric-card .label { font-size: 12px; color: #666; margin-bottom: 4px; }
    .metric-card .value { font-size: 24px; font-weight: bold; }
    .metric-card .insight { font-size: 11px; color: #888; margin-top: 8px; }
    .status-good { color: #22c55e; }
    .status-warning { color: #eab308; }
    .status-critical { color: #ef4444; }
    .recommendation { 
      border-left: 4px solid; 
      padding: 16px 20px; 
      margin-bottom: 16px; 
      background: #f9fafb; 
      border-radius: 0 12px 12px 0;
    }
    .recommendation h4 { margin: 0 0 8px 0; font-size: 16px; }
    .recommendation p { margin: 8px 0; color: #555; }
    .recommendation .impact { 
      color: #22c55e; 
      font-size: 13px; 
      font-weight: 500;
      margin-top: 10px;
    }
    .priority-high { border-color: #ef4444; }
    .priority-medium { border-color: #eab308; }
    .priority-low { border-color: #22c55e; }
    .priority-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      margin-left: 8px;
    }
    .priority-high .priority-badge { background: #fef2f2; color: #ef4444; }
    .priority-medium .priority-badge { background: #fefce8; color: #eab308; }
    .priority-low .priority-badge { background: #f0fdf4; color: #22c55e; }
    .comparison-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .comparison-table th, .comparison-table td { 
      padding: 12px; 
      text-align: left; 
      border-bottom: 1px solid #e5e7eb; 
    }
    .comparison-table th { 
      background: #f9fafb; 
      font-weight: 600;
      color: #374151;
    }
    .comparison-table tr:hover { background: #f9fafb; }
    .risk-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .risk-icon { font-size: 20px; }
    .risk-level {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }
    .risk-low { background: #f0fdf4; color: #22c55e; }
    .risk-medium { background: #fefce8; color: #eab308; }
    .risk-high { background: #fef2f2; color: #ef4444; }
    .forecast-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .forecast-card {
      padding: 16px;
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
      border-radius: 12px;
      text-align: center;
    }
    .forecast-card .metric { font-size: 12px; color: #666; }
    .forecast-card .values { margin: 10px 0; }
    .forecast-card .current { font-size: 18px; color: #666; }
    .forecast-card .arrow { color: #22c55e; margin: 0 8px; }
    .forecast-card .projected { font-size: 18px; font-weight: bold; color: #22c55e; }
    .forecast-card .confidence { font-size: 11px; color: #888; }
    .footer { 
      text-align: center; 
      margin-top: 40px; 
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px; 
      color: #666; 
    }
    .footer .logo { color: #8b5cf6; font-weight: bold; }
    @media print {
      body { padding: 0; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 ${title}</h1>
    <div class="company">${report.company.name}</div>
    <div class="industry">${report.company.industry}</div>
    <div class="meta">
      ${language === 'zh' ? '報告編號' : 'Report ID'}: ${report.id} | 
      ${language === 'zh' ? '生成時間' : 'Generated'}: ${generatedDate}
    </div>
  </div>

  <div class="section">
    <h2>📋 ${language === 'zh' ? '執行摘要' : 'Executive Summary'}</h2>
    <div class="summary">
      ${(() => {
        const summaryText = typeof report.summary === 'object' && report.summary[language]
          ? report.summary[language]
          : typeof report.summary === 'string'
          ? report.summary
          : '';
        return summaryText.split('\n').filter((p: string) => p.trim()).map((p: string) => `<p>${p}</p>`).join('');
      })()}
    </div>
  </div>

  <div class="section">
    <h2>📊 ${language === 'zh' ? '關鍵指標' : 'Key Metrics'}</h2>
    <div class="metrics-grid">
      ${report.keyMetrics.map(m => `
        <div class="metric-card">
          <div class="label">${m.metric}</div>
          <div class="value status-${m.status}">${m.value}</div>
          <div class="insight">${m.insight}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <div class="section">
    <h2>🌐 ${language === 'zh' ? '行業對比' : 'Industry Comparison'}</h2>
    <table class="comparison-table">
      <thead>
        <tr>
          <th>${language === 'zh' ? '指標' : 'Metric'}</th>
          <th>${language === 'zh' ? '您的數值' : 'Your Value'}</th>
          <th>${language === 'zh' ? '行業平均' : 'Industry Avg'}</th>
          <th>${language === 'zh' ? '百分位' : 'Percentile'}</th>
        </tr>
      </thead>
      <tbody>
        ${report.industryComparison.map(c => `
          <tr>
            <td>${c.metric}</td>
            <td><strong>${c.yourValue}</strong></td>
            <td>${c.industryAvg}</td>
            <td>${c.percentile}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>📈 ${language === 'zh' ? '業績預測' : 'Performance Forecast'}</h2>
    <div class="forecast-grid">
      ${report.forecast.map(f => {
        const metricName = typeof f.metric === 'object' ? f.metric[language] : f.metric;
        return `
        <div class="forecast-card">
          <div class="metric">${metricName}</div>
          <div class="values">
            <span class="current">${f.current}</span>
            <span class="arrow">→</span>
            <span class="projected">${f.projected}</span>
          </div>
          <div class="confidence">${language === 'zh' ? '信心度' : 'Confidence'}: ${f.confidence}%</div>
        </div>
      `}).join('')}
    </div>
  </div>

  <div class="section">
    <h2>💡 ${language === 'zh' ? '戰略建議' : 'Strategic Recommendations'}</h2>
    ${report.recommendations.map(r => {
      const title = typeof r.title === 'object' ? r.title[language] : r.title;
      const description = typeof r.description === 'object' ? r.description[language] : r.description;
      const impact = typeof r.impact === 'object' ? r.impact[language] : r.impact;
      return `
      <div class="recommendation priority-${r.priority}">
        <h4>
          ${title}
          <span class="priority-badge">
            ${r.priority === 'high' ? (language === 'zh' ? '高優先級' : 'High') : 
              r.priority === 'medium' ? (language === 'zh' ? '中優先級' : 'Medium') : 
              (language === 'zh' ? '低優先級' : 'Low')}
          </span>
        </h4>
        <p>${description}</p>
        <div class="impact">📈 ${language === 'zh' ? '預期影響' : 'Expected Impact'}: ${impact}</div>
      </div>
    `}).join('')}
  </div>

  <div class="section">
    <h2>⚠️ ${language === 'zh' ? '風險評估' : 'Risk Assessment'}</h2>
    ${report.riskAssessment.map(r => {
      const category = typeof r.category === 'object' ? r.category[language] : r.category;
      const description = typeof r.description === 'object' ? r.description[language] : r.description;
      return `
      <div class="risk-item">
        <span class="risk-icon">${r.level === 'low' ? '🟢' : r.level === 'medium' ? '🟡' : '🔴'}</span>
        <div>
          <strong>${category}</strong>
          <span class="risk-level risk-${r.level}">
            ${r.level === 'low' ? (language === 'zh' ? '低風險' : 'Low') : 
              r.level === 'medium' ? (language === 'zh' ? '中風險' : 'Medium') : 
              (language === 'zh' ? '高風險' : 'High')}
          </span>
          <p style="margin: 8px 0 0 0; color: #555; font-size: 13px;">${description}</p>
        </div>
      </div>
    `}).join('')}
  </div>

  <div class="footer">
    <p class="logo">AutoBooks ERP</p>
    <p>${language === 'zh' ? '本報告由 AI 智能分析引擎自動生成' : 'This report was automatically generated by the AI Analysis Engine'}</p>
    <p>© ${new Date().getFullYear()} AutoBooks. All rights reserved.</p>
  </div>
</body>
</html>`;
}
