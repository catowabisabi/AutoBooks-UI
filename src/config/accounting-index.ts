/**
 * Accounting Configuration Module
 * 
 * Exports all accounting-related configurations:
 * - Regional formats (Canada, Hong Kong, China, India)
 * - Seed data generators
 * - RAG regulations for AI
 */

// Regional Formats
export {
  type RegionCode,
  type AccountingStandard,
  type TaxType,
  type FiscalYearEnd,
  type CurrencyFormat,
  type DateFormat,
  type TaxRate,
  type AccountCategory,
  type ChartOfAccounts,
  type ComplianceRequirement,
  type FinancialReport,
  type RegionalConfig,
  CANADA_CONFIG,
  HONG_KONG_CONFIG,
  CHINA_CONFIG,
  INDIA_CONFIG,
  REGIONAL_CONFIGS,
  getRegionalConfig,
  formatCurrency,
  formatDate,
  getTaxRates,
  getChartOfAccounts,
  getComplianceRequirements,
  getUpcomingDeadlines,
  getAIDocumentTypes,
  getSupportedCrossBorderRegions,
} from './accounting-regional-formats';

// Seed Data
export {
  type FakeClient,
  type FakeTransaction,
  type FakeInvoice,
  type FakeReceipt,
  type FakePayrollRecord,
  type FakeAccountingDataset,
  generateFakeClients,
  generateFakeTransactions,
  generateFakeInvoices,
  generateFakeReceipts,
  generateFakePayroll,
  generateFullDataset,
  generateAllRegionsData,
  getOrCreateDemoData,
  saveDemoData,
  loadDemoData,
  clearDemoData,
} from './accounting-seed-data';

// RAG Regulations
export {
  type RagDocument,
  ALL_REGULATIONS,
  REGULATIONS_BY_REGION,
  CANADA_REGULATIONS,
  HONG_KONG_REGULATIONS,
  CHINA_REGULATIONS,
  INDIA_REGULATIONS,
  searchRegulations,
  getRegulationById,
  getRegulationsByCategory,
  getKeyPointsForRegion,
  buildRAGContext,
} from './accounting-rag-regulations';

// Re-export AI services for convenience
export {
  universalAI,
  financeAI,
  hrmsAI,
  projectAI,
  businessAI,
  productAI,
  nlpAI,
} from '@/lib/ai-services';

// =================================================================
// Combined Accounting AI Context Builder
// =================================================================

import { buildRAGContext, type RagDocument } from './accounting-rag-regulations';
import { getRegionalConfig, type RegionCode } from './accounting-regional-formats';

/**
 * Build comprehensive AI context for accounting queries
 * Combines regional config with relevant regulations
 */
export function buildAccountingAIContext(
  query: string,
  region: RegionCode,
  additionalContext?: string
): string {
  const regionConfig = getRegionalConfig(region);
  const ragContext = buildRAGContext(query, region);
  
  return `
## Regional Context: ${regionConfig.name} (${regionConfig.nameChinese})

### Accounting Standard
${regionConfig.accountingStandard.primary}

### Tax System
${regionConfig.taxRates.map(t => `- ${t.name}: ${(t.rate * 100).toFixed(2)}%`).join('\n')}

### Currency
${regionConfig.currency.name} (${regionConfig.currency.code}) - Symbol: ${regionConfig.currency.symbol}

### Fiscal Year
Default: ${regionConfig.fiscalYear.default}
${regionConfig.fiscalYear.customizable ? 'Customizable' : 'Fixed (not customizable)'}

---

## Relevant Regulations

${ragContext}

${additionalContext ? `---\n\n## Additional Context\n${additionalContext}` : ''}
`;
}

/**
 * Get AI prompt with accounting context
 */
export function getAccountingAIPrompt(
  userQuery: string,
  region: RegionCode,
  taskType: 'analysis' | 'compliance' | 'tax' | 'general' = 'general'
): string {
  const context = buildAccountingAIContext(userQuery, region);
  
  const systemPrompts: Record<string, string> = {
    analysis: `You are an expert financial analyst specializing in ${region} accounting standards. Analyze the data and provide insights based on local regulations and best practices.`,
    compliance: `You are a compliance expert for ${region}. Provide guidance on regulatory requirements, deadlines, and best practices for maintaining compliance.`,
    tax: `You are a tax advisor specializing in ${region} taxation. Provide accurate tax advice based on current regulations and help optimize tax positions within legal boundaries.`,
    general: `You are an accounting assistant with expertise in ${region} regulations. Provide helpful, accurate information based on local standards.`,
  };
  
  return `${systemPrompts[taskType]}

${context}

User Query: ${userQuery}

Please provide a comprehensive response considering the regional context and regulations.`;
}

// =================================================================
// Quick Access Functions
// =================================================================

/**
 * Get all supported regions
 */
export function getSupportedRegions(): { code: RegionCode; name: string; nameChinese: string }[] {
  return [
    { code: 'CA', name: 'Canada', nameChinese: '加拿大' },
    { code: 'HK', name: 'Hong Kong', nameChinese: '香港' },
    { code: 'CN', name: 'China', nameChinese: '中国大陆' },
    { code: 'IN', name: 'India', nameChinese: '印度' },
  ];
}

/**
 * Check if a region is supported
 */
export function isRegionSupported(region: string): region is RegionCode {
  return ['CA', 'HK', 'CN', 'IN'].includes(region);
}

/**
 * Get default region based on locale
 */
export function getDefaultRegion(locale: string): RegionCode {
  const localeMap: Record<string, RegionCode> = {
    'en-CA': 'CA',
    'en-HK': 'HK',
    'zh-HK': 'HK',
    'zh-CN': 'CN',
    'zh-TW': 'HK',
    'en-IN': 'IN',
    'hi-IN': 'IN',
  };
  
  return localeMap[locale] || 'HK';
}
