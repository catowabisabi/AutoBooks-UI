/**
 * useAccounting Hook
 * 
 * Provides unified access to all accounting features:
 * - Regional configuration
 * - AI services
 * - Seed data
 * - Regulatory information
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  type RegionCode,
  getRegionalConfig,
  formatCurrency,
  formatDate,
  getTaxRates,
  getChartOfAccounts,
  getComplianceRequirements,
  getUpcomingDeadlines,
  getAIDocumentTypes,
} from '@/config/accounting-regional-formats';
import {
  type FakeAccountingDataset,
  getOrCreateDemoData,
  generateFullDataset,
  clearDemoData,
} from '@/config/accounting-seed-data';
import {
  searchRegulations,
  getRegulationById,
  buildRAGContext,
} from '@/config/accounting-rag-regulations';
import {
  financeAI,
  hrmsAI,
  projectAI,
  businessAI,
  productAI,
  nlpAI,
} from '@/lib/ai-services';

export interface UseAccountingOptions {
  defaultRegion?: RegionCode;
  enableDemoData?: boolean;
}

export function useAccounting(options: UseAccountingOptions = {}) {
  const { defaultRegion = 'HK', enableDemoData = true } = options;
  
  // State
  const [currentRegion, setCurrentRegion] = useState<RegionCode>(defaultRegion);
  const [demoData, setDemoData] = useState<Record<RegionCode, FakeAccountingDataset> | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Regional configuration
  const config = useMemo(() => getRegionalConfig(currentRegion), [currentRegion]);
  
  // Currency formatting
  const formatAmount = useCallback((amount: number) => {
    return formatCurrency(amount, currentRegion);
  }, [currentRegion]);
  
  // Date formatting
  const formatDateLocal = useCallback((date: Date | string, format: 'short' | 'long' | 'fiscal' = 'short') => {
    return formatDate(date, currentRegion, format);
  }, [currentRegion]);
  
  // Tax rates
  const taxRates = useMemo(() => getTaxRates(currentRegion), [currentRegion]);
  
  // Chart of accounts
  const chartOfAccounts = useMemo(() => getChartOfAccounts(currentRegion), [currentRegion]);
  
  // Compliance requirements
  const complianceRequirements = useMemo(() => getComplianceRequirements(currentRegion), [currentRegion]);
  
  // Upcoming deadlines
  const upcomingDeadlines = useMemo(() => getUpcomingDeadlines(currentRegion, 30), [currentRegion]);
  
  // AI document types
  const aiDocumentTypes = useMemo(() => getAIDocumentTypes(currentRegion), [currentRegion]);
  
  // Load demo data
  const loadDemoData = useCallback(async () => {
    if (!enableDemoData) return null;
    
    setIsLoadingData(true);
    try {
      // Simulate async loading
      await new Promise(resolve => setTimeout(resolve, 100));
      const data = getOrCreateDemoData();
      setDemoData(data);
      return data;
    } finally {
      setIsLoadingData(false);
    }
  }, [enableDemoData]);
  
  // Regenerate demo data
  const regenerateDemoData = useCallback(async (region?: RegionCode) => {
    setIsLoadingData(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const targetRegion = region || currentRegion;
      const newData = generateFullDataset(targetRegion);
      
      setDemoData(prev => ({
        ...prev,
        [targetRegion]: newData,
      } as Record<RegionCode, FakeAccountingDataset>));
      
      return newData;
    } finally {
      setIsLoadingData(false);
    }
  }, [currentRegion]);
  
  // Clear demo data
  const resetDemoData = useCallback(() => {
    clearDemoData();
    setDemoData(null);
  }, []);
  
  // Get demo data for current region
  const currentDemoData = useMemo(() => {
    return demoData?.[currentRegion] || null;
  }, [demoData, currentRegion]);
  
  // Search regulations
  const searchRegs = useCallback((query: string, category?: 'TAX' | 'ACCOUNTING' | 'COMPLIANCE' | 'AUDIT' | 'PAYROLL' | 'CORPORATE') => {
    return searchRegulations(query, currentRegion, category);
  }, [currentRegion]);
  
  // Get regulation by ID
  const getRegulation = useCallback((id: string) => {
    return getRegulationById(id);
  }, []);
  
  // Build RAG context for AI
  const getAIContext = useCallback((query: string) => {
    return buildRAGContext(query, currentRegion);
  }, [currentRegion]);
  
  // Switch region
  const switchRegion = useCallback((region: RegionCode) => {
    setCurrentRegion(region);
  }, []);
  
  // Return all features
  return {
    // Current state
    currentRegion,
    config,
    isLoadingData,
    
    // Region management
    switchRegion,
    
    // Formatting functions
    formatAmount,
    formatDateLocal,
    
    // Configuration data
    taxRates,
    chartOfAccounts,
    complianceRequirements,
    upcomingDeadlines,
    aiDocumentTypes,
    
    // Demo data
    demoData,
    currentDemoData,
    loadDemoData,
    regenerateDemoData,
    resetDemoData,
    
    // Regulations/RAG
    searchRegs,
    getRegulation,
    getAIContext,
    
    // AI Services (direct access)
    ai: {
      finance: financeAI,
      hrms: hrmsAI,
      project: projectAI,
      business: businessAI,
      product: productAI,
      nlp: nlpAI,
    },
  };
}

// =================================================================
// Specialized Hooks
// =================================================================

/**
 * Hook for finance-specific AI features
 */
export function useFinanceAI(region: RegionCode = 'HK') {
  const { formatAmount, ai, getAIContext, searchRegs } = useAccounting({ defaultRegion: region });
  
  return {
    analyzeCashFlow: (transactions: Parameters<typeof ai.finance.analyzeCashFlow>[0]) => 
      ai.finance.analyzeCashFlow(transactions, region),
    detectAnomalies: ai.finance.detectAnomalies,
    predictPayment: ai.finance.predictPaymentLikelihood,
    generateReport: (data: Parameters<typeof ai.finance.generateReportSummary>[0]) =>
      ai.finance.generateReportSummary(data, region),
    formatAmount,
    getContext: getAIContext,
    searchRegs,
  };
}

/**
 * Hook for HR-specific AI features
 */
export function useHRMSAI(region: RegionCode = 'HK') {
  const { ai, formatAmount, config } = useAccounting({ defaultRegion: region });
  
  return {
    predictAttrition: ai.hrms.predictAttritionRisk,
    analyzeTeam: ai.hrms.analyzeTeamPerformance,
    suggestSalary: (role: string, experience: number) =>
      ai.hrms.suggestSalary(role, experience, region),
    currency: config.currency,
    formatAmount,
  };
}

/**
 * Hook for project/kanban AI features
 */
export function useProjectAI() {
  const { ai } = useAccounting();
  
  return {
    prioritizeTasks: ai.project.prioritizeTasks,
    detectBottlenecks: ai.project.detectBottlenecks,
    estimateCompletion: ai.project.estimateCompletion,
  };
}

/**
 * Hook for business intelligence AI
 */
export function useBusinessAI() {
  const { ai } = useAccounting();
  
  return {
    analyzeRevenue: ai.business.analyzeRevenueTrends,
    analyzeClientProfitability: ai.business.analyzeClientProfitability,
  };
}

/**
 * Hook for product AI features
 */
export function useProductAI() {
  const { ai } = useAccounting();
  
  return {
    generateDescription: ai.product.generateDescription,
    predictInventory: ai.product.predictInventoryNeeds,
  };
}

/**
 * Hook for NLP features
 */
export function useNLPAI() {
  const { ai } = useAccounting();
  
  return {
    extractActionItems: ai.nlp.extractActionItems,
    classifyText: ai.nlp.classifyText,
    summarize: ai.nlp.summarize,
  };
}

// =================================================================
// Context Provider (for app-wide state)
// =================================================================

import { createContext, useContext, ReactNode } from 'react';

interface AccountingContextValue extends ReturnType<typeof useAccounting> {}

const AccountingContext = createContext<AccountingContextValue | null>(null);

export function AccountingProvider({
  children,
  defaultRegion = 'HK',
}: {
  children: ReactNode;
  defaultRegion?: RegionCode;
}) {
  const accounting = useAccounting({ defaultRegion });
  
  return (
    <AccountingContext.Provider value={accounting}>
      {children}
    </AccountingContext.Provider>
  );
}

export function useAccountingContext() {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccountingContext must be used within AccountingProvider');
  }
  return context;
}

export default useAccounting;
