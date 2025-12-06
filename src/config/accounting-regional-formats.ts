/**
 * Regional Accounting Formats Configuration
 * Supports: Canada (CA), Hong Kong (HK), China (CN), India (IN)
 *
 * This configuration controls:
 * - Currency formats
 * - Date formats
 * - Tax rates and rules
 * - Chart of Accounts structure
 * - Financial reporting standards
 * - Compliance requirements
 */

// =================================================================
// Types
// =================================================================

export type RegionCode = 'CA' | 'HK' | 'CN' | 'IN';
export type AccountingStandard = 'ASPE' | 'IFRS' | 'CAS' | 'IndAS';
export type TaxType = 'GST' | 'HST' | 'PST' | 'PROFITS_TAX' | 'VAT' | 'CGST' | 'SGST' | 'IGST' | 'TDS';
export type FiscalYearEnd = 'CALENDAR' | 'MARCH' | 'CUSTOM';

export interface CurrencyFormat {
  code: string;
  symbol: string;
  name: string;
  nameChinese?: string;
  decimals: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  symbolPosition: 'before' | 'after';
  symbolSpacing: boolean;
}

export interface DateFormat {
  short: string;          // e.g., "MM/DD/YYYY"
  long: string;           // e.g., "MMMM D, YYYY"
  fiscal: string;         // e.g., "YYYY-MM-DD"
  displayOrder: 'MDY' | 'DMY' | 'YMD';
}

export interface TaxRate {
  type: TaxType;
  name: string;
  nameChinese?: string;
  rate: number;           // Percentage as decimal (e.g., 0.05 for 5%)
  registrationThreshold?: number;
  filingFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  applicableTo: ('GOODS' | 'SERVICES' | 'BOTH')[];
  notes?: string;
}

export interface AccountCategory {
  code: string;
  range: [number, number];
  name: string;
  nameChinese?: string;
  subcategories?: AccountCategory[];
}

export interface ChartOfAccounts {
  standard: AccountingStandard;
  categories: AccountCategory[];
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  nameChinese?: string;
  authority: string;
  deadline?: string;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'EVENT_BASED';
  penaltyInfo?: string;
  aiRagDocuments?: string[];  // Document IDs for RAG lookup
}

export interface FinancialReport {
  id: string;
  name: string;
  nameChinese?: string;
  required: boolean;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  template?: string;
}

export interface RegionalConfig {
  region: RegionCode;
  name: string;
  nameChinese: string;
  language: string[];
  timezone: string;
  currency: CurrencyFormat;
  dateFormat: DateFormat;
  fiscalYear: {
    default: FiscalYearEnd;
    customizable: boolean;
  };
  accountingStandard: {
    primary: AccountingStandard;
    alternatives?: AccountingStandard[];
  };
  taxRates: TaxRate[];
  chartOfAccounts: ChartOfAccounts;
  compliance: ComplianceRequirement[];
  financialReports: FinancialReport[];
  aiFeatures: {
    documentRecognition: string[];  // Document types AI can recognize
    taxOptimization: boolean;
    regulatoryAlerts: boolean;
    crossBorderSupport: RegionCode[];
  };
}

// =================================================================
// Canada (CA) Configuration
// =================================================================

export const CANADA_CONFIG: RegionalConfig = {
  region: 'CA',
  name: 'Canada',
  nameChinese: '加拿大',
  language: ['en', 'fr'],
  timezone: 'America/Toronto',
  currency: {
    code: 'CAD',
    symbol: '$',
    name: 'Canadian Dollar',
    nameChinese: '加拿大元',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    symbolSpacing: false,
  },
  dateFormat: {
    short: 'YYYY-MM-DD',      // ISO format standard in Canada
    long: 'MMMM D, YYYY',
    fiscal: 'YYYY-MM-DD',
    displayOrder: 'YMD',
  },
  fiscalYear: {
    default: 'CALENDAR',
    customizable: true,
  },
  accountingStandard: {
    primary: 'ASPE',           // Accounting Standards for Private Enterprises
    alternatives: ['IFRS'],    // For publicly listed companies
  },
  taxRates: [
    {
      type: 'GST',
      name: 'Goods and Services Tax',
      nameChinese: '商品及服務稅',
      rate: 0.05,
      registrationThreshold: 30000,
      filingFrequency: 'QUARTERLY',
      applicableTo: ['BOTH'],
      notes: 'Federal tax applicable across Canada',
    },
    {
      type: 'HST',
      name: 'Harmonized Sales Tax (Ontario)',
      nameChinese: '統一銷售稅 (安大略省)',
      rate: 0.13,
      registrationThreshold: 30000,
      filingFrequency: 'QUARTERLY',
      applicableTo: ['BOTH'],
      notes: 'Combined federal/provincial tax in ON, NB, NL, NS, PE',
    },
    {
      type: 'PST',
      name: 'Provincial Sales Tax (BC)',
      nameChinese: '省銷售稅 (卑詩省)',
      rate: 0.07,
      registrationThreshold: 10000,
      filingFrequency: 'MONTHLY',
      applicableTo: ['GOODS'],
      notes: 'BC, SK, MB have separate PST',
    },
  ],
  chartOfAccounts: {
    standard: 'ASPE',
    categories: [
      { code: '1', range: [1000, 1999], name: 'Assets', nameChinese: '資產',
        subcategories: [
          { code: '1.1', range: [1000, 1099], name: 'Cash & Equivalents', nameChinese: '現金及等價物' },
          { code: '1.2', range: [1100, 1199], name: 'Accounts Receivable', nameChinese: '應收賬款' },
          { code: '1.3', range: [1200, 1299], name: 'Inventory', nameChinese: '存貨' },
          { code: '1.4', range: [1300, 1499], name: 'Prepaid Expenses', nameChinese: '預付費用' },
          { code: '1.5', range: [1500, 1799], name: 'Fixed Assets', nameChinese: '固定資產' },
          { code: '1.6', range: [1800, 1999], name: 'Intangible Assets', nameChinese: '無形資產' },
        ],
      },
      { code: '2', range: [2000, 2999], name: 'Liabilities', nameChinese: '負債',
        subcategories: [
          { code: '2.1', range: [2000, 2099], name: 'Accounts Payable', nameChinese: '應付賬款' },
          { code: '2.2', range: [2100, 2199], name: 'Accrued Liabilities', nameChinese: '應計負債' },
          { code: '2.3', range: [2200, 2299], name: 'Tax Payable', nameChinese: '應付稅款' },
          { code: '2.4', range: [2300, 2499], name: 'Current Loans', nameChinese: '流動貸款' },
          { code: '2.5', range: [2500, 2999], name: 'Long-term Debt', nameChinese: '長期債務' },
        ],
      },
      { code: '3', range: [3000, 3999], name: 'Equity', nameChinese: '權益',
        subcategories: [
          { code: '3.1', range: [3000, 3099], name: 'Share Capital', nameChinese: '股本' },
          { code: '3.2', range: [3100, 3199], name: 'Retained Earnings', nameChinese: '留存收益' },
          { code: '3.3', range: [3200, 3999], name: 'Other Equity', nameChinese: '其他權益' },
        ],
      },
      { code: '4', range: [4000, 4999], name: 'Revenue', nameChinese: '收入',
        subcategories: [
          { code: '4.1', range: [4000, 4099], name: 'Sales Revenue', nameChinese: '銷售收入' },
          { code: '4.2', range: [4100, 4199], name: 'Service Revenue', nameChinese: '服務收入' },
          { code: '4.3', range: [4200, 4999], name: 'Other Income', nameChinese: '其他收入' },
        ],
      },
      { code: '5', range: [5000, 5999], name: 'Cost of Goods Sold', nameChinese: '銷貨成本' },
      { code: '6', range: [6000, 6999], name: 'Operating Expenses', nameChinese: '營業費用',
        subcategories: [
          { code: '6.1', range: [6000, 6199], name: 'Salaries & Wages', nameChinese: '薪金及工資' },
          { code: '6.2', range: [6200, 6299], name: 'Rent & Utilities', nameChinese: '租金及水電' },
          { code: '6.3', range: [6300, 6399], name: 'Professional Fees', nameChinese: '專業費用' },
          { code: '6.4', range: [6400, 6499], name: 'Marketing', nameChinese: '市場推廣' },
          { code: '6.5', range: [6500, 6999], name: 'Other Expenses', nameChinese: '其他費用' },
        ],
      },
    ],
  },
  compliance: [
    {
      id: 'ca-gst-return',
      name: 'GST/HST Return',
      nameChinese: 'GST/HST報稅表',
      authority: 'Canada Revenue Agency (CRA)',
      frequency: 'QUARTERLY',
      deadline: '1 month after quarter end',
      aiRagDocuments: ['gst-hst-filing-guide', 'input-tax-credits'],
    },
    {
      id: 'ca-t2-corp-tax',
      name: 'T2 Corporate Tax Return',
      nameChinese: 'T2公司稅報表',
      authority: 'Canada Revenue Agency (CRA)',
      frequency: 'ANNUAL',
      deadline: '6 months after fiscal year end',
      penaltyInfo: '5% of unpaid tax + 1% per month',
      aiRagDocuments: ['t2-guide', 'corporate-tax-rates'],
    },
    {
      id: 'ca-payroll-remit',
      name: 'Payroll Remittance',
      nameChinese: '工資代扣款項匯繳',
      authority: 'Canada Revenue Agency (CRA)',
      frequency: 'MONTHLY',
      deadline: '15th of following month',
    },
  ],
  financialReports: [
    { id: 'balance-sheet', name: 'Balance Sheet', nameChinese: '資產負債表', required: true, frequency: 'ANNUAL' },
    { id: 'income-statement', name: 'Income Statement', nameChinese: '損益表', required: true, frequency: 'ANNUAL' },
    { id: 'cash-flow', name: 'Cash Flow Statement', nameChinese: '現金流量表', required: true, frequency: 'ANNUAL' },
    { id: 'notes', name: 'Notes to Financial Statements', nameChinese: '財務報表附註', required: true, frequency: 'ANNUAL' },
  ],
  aiFeatures: {
    documentRecognition: ['T4', 'T4A', 'T5', 'Receipt', 'Invoice', 'Bank Statement', 'GST Return'],
    taxOptimization: true,
    regulatoryAlerts: true,
    crossBorderSupport: ['HK', 'CN'],
  },
};

// =================================================================
// Hong Kong (HK) Configuration
// =================================================================

export const HONG_KONG_CONFIG: RegionalConfig = {
  region: 'HK',
  name: 'Hong Kong',
  nameChinese: '香港',
  language: ['zh-HK', 'en'],
  timezone: 'Asia/Hong_Kong',
  currency: {
    code: 'HKD',
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    nameChinese: '港元',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    symbolSpacing: false,
  },
  dateFormat: {
    short: 'DD/MM/YYYY',
    long: 'D MMMM YYYY',
    fiscal: 'DD-MM-YYYY',
    displayOrder: 'DMY',
  },
  fiscalYear: {
    default: 'MARCH',        // April 1 to March 31 is common
    customizable: true,
  },
  accountingStandard: {
    primary: 'IFRS',         // Hong Kong Financial Reporting Standards (HKFRS) based on IFRS
  },
  taxRates: [
    {
      type: 'PROFITS_TAX',
      name: 'Profits Tax (Standard)',
      nameChinese: '利得稅 (標準稅率)',
      rate: 0.165,
      filingFrequency: 'ANNUAL',
      applicableTo: ['BOTH'],
      notes: '16.5% for corporations; 15% for unincorporated businesses',
    },
    {
      type: 'PROFITS_TAX',
      name: 'Profits Tax (Two-tiered - First $2M)',
      nameChinese: '利得稅 (兩級制 - 首200萬)',
      rate: 0.0825,
      filingFrequency: 'ANNUAL',
      applicableTo: ['BOTH'],
      notes: '8.25% on first HKD 2 million assessable profits',
    },
  ],
  chartOfAccounts: {
    standard: 'IFRS',
    categories: [
      { code: '1', range: [1000, 1999], name: 'Assets', nameChinese: '資產',
        subcategories: [
          { code: '1.1', range: [1000, 1099], name: 'Cash & Bank', nameChinese: '現金及銀行存款' },
          { code: '1.2', range: [1100, 1199], name: 'Trade Receivables', nameChinese: '應收貿易賬款' },
          { code: '1.3', range: [1200, 1299], name: 'Inventory', nameChinese: '存貨' },
          { code: '1.4', range: [1300, 1499], name: 'Other Current Assets', nameChinese: '其他流動資產' },
          { code: '1.5', range: [1500, 1699], name: 'Property, Plant & Equipment', nameChinese: '物業、廠房及設備' },
          { code: '1.6', range: [1700, 1799], name: 'Investment Properties', nameChinese: '投資物業' },
          { code: '1.7', range: [1800, 1999], name: 'Intangible Assets', nameChinese: '無形資產' },
        ],
      },
      { code: '2', range: [2000, 2999], name: 'Liabilities', nameChinese: '負債',
        subcategories: [
          { code: '2.1', range: [2000, 2099], name: 'Trade Payables', nameChinese: '應付貿易賬款' },
          { code: '2.2', range: [2100, 2199], name: 'Accruals', nameChinese: '應計費用' },
          { code: '2.3', range: [2200, 2299], name: 'Tax Payable', nameChinese: '應付稅款' },
          { code: '2.4', range: [2300, 2499], name: 'Bank Borrowings', nameChinese: '銀行借款' },
          { code: '2.5', range: [2500, 2999], name: 'Other Liabilities', nameChinese: '其他負債' },
        ],
      },
      { code: '3', range: [3000, 3999], name: 'Equity', nameChinese: '權益' },
      { code: '4', range: [4000, 4999], name: 'Revenue', nameChinese: '收入' },
      { code: '5', range: [5000, 5999], name: 'Cost of Sales', nameChinese: '銷售成本' },
      { code: '6', range: [6000, 6999], name: 'Operating Expenses', nameChinese: '營業費用' },
      { code: '7', range: [7000, 7999], name: 'Other Income/Expenses', nameChinese: '其他收入/支出' },
    ],
  },
  compliance: [
    {
      id: 'hk-profits-tax-return',
      name: 'Profits Tax Return',
      nameChinese: '利得稅報稅表',
      authority: 'Inland Revenue Department (IRD)',
      frequency: 'ANNUAL',
      deadline: '1 month from issue date (extension available)',
      aiRagDocuments: ['hk-profits-tax-guide', 'hk-deductible-expenses'],
    },
    {
      id: 'hk-employer-return',
      name: 'Employer\'s Return (IR56B)',
      nameChinese: '僱主報稅表 (IR56B)',
      authority: 'Inland Revenue Department (IRD)',
      frequency: 'ANNUAL',
      deadline: '1 month from issue date',
    },
    {
      id: 'hk-annual-return',
      name: 'Annual Return (NAR1)',
      nameChinese: '周年申報表 (NAR1)',
      authority: 'Companies Registry',
      frequency: 'ANNUAL',
      deadline: '42 days from anniversary of incorporation',
    },
    {
      id: 'hk-audit',
      name: 'Statutory Audit',
      nameChinese: '法定審計',
      authority: 'Companies Ordinance',
      frequency: 'ANNUAL',
      notes: 'Required for all HK incorporated companies',
      aiRagDocuments: ['hk-audit-requirements', 'hk-companies-ordinance'],
    },
  ],
  financialReports: [
    { id: 'balance-sheet', name: 'Statement of Financial Position', nameChinese: '財務狀況表', required: true, frequency: 'ANNUAL' },
    { id: 'income-statement', name: 'Statement of Profit or Loss', nameChinese: '損益表', required: true, frequency: 'ANNUAL' },
    { id: 'cash-flow', name: 'Statement of Cash Flows', nameChinese: '現金流量表', required: true, frequency: 'ANNUAL' },
    { id: 'equity-changes', name: 'Statement of Changes in Equity', nameChinese: '權益變動表', required: true, frequency: 'ANNUAL' },
    { id: 'notes', name: 'Notes to Financial Statements', nameChinese: '財務報表附註', required: true, frequency: 'ANNUAL' },
    { id: 'tax-comp', name: 'Tax Computation', nameChinese: '稅務計算表', required: true, frequency: 'ANNUAL' },
  ],
  aiFeatures: {
    documentRecognition: ['Bank Statement', 'Invoice', 'Receipt', 'MPF Statement', 'Tax Return', 'Audit Report'],
    taxOptimization: true,
    regulatoryAlerts: true,
    crossBorderSupport: ['CN', 'CA'],
  },
};

// =================================================================
// China (CN) Configuration
// =================================================================

export const CHINA_CONFIG: RegionalConfig = {
  region: 'CN',
  name: 'China (Mainland)',
  nameChinese: '中国大陆',
  language: ['zh-CN'],
  timezone: 'Asia/Shanghai',
  currency: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan Renminbi',
    nameChinese: '人民币',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    symbolSpacing: false,
  },
  dateFormat: {
    short: 'YYYY-MM-DD',
    long: 'YYYY年M月D日',
    fiscal: 'YYYY-MM-DD',
    displayOrder: 'YMD',
  },
  fiscalYear: {
    default: 'CALENDAR',     // Mandatory calendar year in China
    customizable: false,
  },
  accountingStandard: {
    primary: 'CAS',          // Chinese Accounting Standards
  },
  taxRates: [
    {
      type: 'VAT',
      name: 'Value Added Tax (General)',
      nameChinese: '增值税 (一般纳税人)',
      rate: 0.13,
      filingFrequency: 'MONTHLY',
      applicableTo: ['GOODS'],
      notes: '13% for goods; 9% for specific items; 6% for services',
    },
    {
      type: 'VAT',
      name: 'VAT (Services)',
      nameChinese: '增值税 (服务)',
      rate: 0.06,
      filingFrequency: 'MONTHLY',
      applicableTo: ['SERVICES'],
    },
    {
      type: 'VAT',
      name: 'VAT (Small-scale Taxpayer)',
      nameChinese: '增值税 (小规模纳税人)',
      rate: 0.03,
      registrationThreshold: 5000000, // Annual revenue threshold
      filingFrequency: 'QUARTERLY',
      applicableTo: ['BOTH'],
    },
  ],
  chartOfAccounts: {
    standard: 'CAS',
    categories: [
      { code: '1', range: [1001, 1999], name: 'Assets', nameChinese: '资产',
        subcategories: [
          { code: '1001', range: [1001, 1001], name: 'Cash on Hand', nameChinese: '库存现金' },
          { code: '1002', range: [1002, 1002], name: 'Bank Deposits', nameChinese: '银行存款' },
          { code: '1012', range: [1012, 1012], name: 'Other Monetary Funds', nameChinese: '其他货币资金' },
          { code: '1101', range: [1101, 1101], name: 'Trading Financial Assets', nameChinese: '交易性金融资产' },
          { code: '1121', range: [1121, 1121], name: 'Notes Receivable', nameChinese: '应收票据' },
          { code: '1122', range: [1122, 1122], name: 'Accounts Receivable', nameChinese: '应收账款' },
          { code: '1123', range: [1123, 1123], name: 'Prepayments', nameChinese: '预付账款' },
          { code: '1131', range: [1131, 1131], name: 'Dividends Receivable', nameChinese: '应收股利' },
          { code: '1132', range: [1132, 1132], name: 'Interest Receivable', nameChinese: '应收利息' },
          { code: '1221', range: [1221, 1221], name: 'Other Receivables', nameChinese: '其他应收款' },
          { code: '1401', range: [1401, 1401], name: 'Materials', nameChinese: '材料采购' },
          { code: '1403', range: [1403, 1403], name: 'Raw Materials', nameChinese: '原材料' },
          { code: '1601', range: [1601, 1601], name: 'Fixed Assets', nameChinese: '固定资产' },
        ],
      },
      { code: '2', range: [2001, 2999], name: 'Liabilities', nameChinese: '负债',
        subcategories: [
          { code: '2001', range: [2001, 2001], name: 'Short-term Borrowings', nameChinese: '短期借款' },
          { code: '2201', range: [2201, 2201], name: 'Notes Payable', nameChinese: '应付票据' },
          { code: '2202', range: [2202, 2202], name: 'Accounts Payable', nameChinese: '应付账款' },
          { code: '2203', range: [2203, 2203], name: 'Advance from Customers', nameChinese: '预收账款' },
          { code: '2211', range: [2211, 2211], name: 'Employee Compensation Payable', nameChinese: '应付职工薪酬' },
          { code: '2221', range: [2221, 2221], name: 'Taxes Payable', nameChinese: '应交税费' },
        ],
      },
      { code: '3', range: [3001, 3999], name: 'Equity', nameChinese: '所有者权益' },
      { code: '4', range: [4001, 4999], name: 'Cost', nameChinese: '成本' },
      { code: '5', range: [5001, 5999], name: 'Profit and Loss', nameChinese: '损益',
        subcategories: [
          { code: '5001', range: [5001, 5001], name: 'Main Business Revenue', nameChinese: '主营业务收入' },
          { code: '5051', range: [5051, 5051], name: 'Other Business Revenue', nameChinese: '其他业务收入' },
          { code: '5101', range: [5101, 5101], name: 'Investment Income', nameChinese: '投资收益' },
          { code: '5301', range: [5301, 5301], name: 'Non-operating Income', nameChinese: '营业外收入' },
          { code: '5401', range: [5401, 5401], name: 'Main Business Cost', nameChinese: '主营业务成本' },
          { code: '5402', range: [5402, 5402], name: 'Other Business Cost', nameChinese: '其他业务成本' },
          { code: '5403', range: [5403, 5403], name: 'Business Tax and Surcharges', nameChinese: '税金及附加' },
        ],
      },
    ],
  },
  compliance: [
    {
      id: 'cn-vat-return',
      name: 'VAT Return',
      nameChinese: '增值税申报',
      authority: 'State Taxation Administration',
      frequency: 'MONTHLY',
      deadline: '15th of following month',
      aiRagDocuments: ['cn-vat-regulations', 'cn-invoice-management'],
    },
    {
      id: 'cn-cit-prepay',
      name: 'Corporate Income Tax Prepayment',
      nameChinese: '企业所得税预缴',
      authority: 'State Taxation Administration',
      frequency: 'QUARTERLY',
      deadline: '15th of month following quarter end',
    },
    {
      id: 'cn-cit-annual',
      name: 'Annual CIT Settlement',
      nameChinese: '企业所得税汇算清缴',
      authority: 'State Taxation Administration',
      frequency: 'ANNUAL',
      deadline: 'May 31 of following year',
      penaltyInfo: 'Late fee 0.05% per day',
      aiRagDocuments: ['cn-cit-deductions', 'cn-transfer-pricing'],
    },
    {
      id: 'cn-annual-audit',
      name: 'Annual Audit Report',
      nameChinese: '年度审计报告',
      authority: 'State Administration for Market Regulation',
      frequency: 'ANNUAL',
      deadline: 'June 30 of following year',
    },
    {
      id: 'cn-golden-tax',
      name: 'Golden Tax System Filing',
      nameChinese: '金税系统申报',
      authority: 'State Taxation Administration',
      frequency: 'MONTHLY',
      notes: 'Required for all VAT invoices',
      aiRagDocuments: ['cn-golden-tax-guide', 'cn-fapiao-rules'],
    },
  ],
  financialReports: [
    { id: 'balance-sheet', name: 'Balance Sheet', nameChinese: '资产负债表', required: true, frequency: 'MONTHLY' },
    { id: 'income-statement', name: 'Income Statement', nameChinese: '利润表', required: true, frequency: 'MONTHLY' },
    { id: 'cash-flow', name: 'Cash Flow Statement', nameChinese: '现金流量表', required: true, frequency: 'ANNUAL' },
    { id: 'equity-changes', name: 'Statement of Changes in Equity', nameChinese: '所有者权益变动表', required: true, frequency: 'ANNUAL' },
    { id: 'notes', name: 'Notes', nameChinese: '财务报表附注', required: true, frequency: 'ANNUAL' },
  ],
  aiFeatures: {
    documentRecognition: ['发票 (Fapiao)', 'Bank Statement', 'VAT Invoice', 'Receipt', 'Contract'],
    taxOptimization: true,
    regulatoryAlerts: true,
    crossBorderSupport: ['HK'],
  },
};

// =================================================================
// India (IN) Configuration
// =================================================================

export const INDIA_CONFIG: RegionalConfig = {
  region: 'IN',
  name: 'India',
  nameChinese: '印度',
  language: ['en', 'hi'],
  timezone: 'Asia/Kolkata',
  currency: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    nameChinese: '印度盧比',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    symbolSpacing: false,
  },
  dateFormat: {
    short: 'DD/MM/YYYY',
    long: 'D MMMM YYYY',
    fiscal: 'DD-MM-YYYY',
    displayOrder: 'DMY',
  },
  fiscalYear: {
    default: 'MARCH',        // April 1 to March 31 mandatory
    customizable: false,
  },
  accountingStandard: {
    primary: 'IndAS',        // Indian Accounting Standards (IFRS converged)
  },
  taxRates: [
    {
      type: 'CGST',
      name: 'Central GST',
      nameChinese: '中央商品及服務稅',
      rate: 0.09,            // Most common rate (18% total split 9+9)
      registrationThreshold: 4000000,
      filingFrequency: 'MONTHLY',
      applicableTo: ['BOTH'],
      notes: 'Intra-state: CGST + SGST = 18%',
    },
    {
      type: 'SGST',
      name: 'State GST',
      nameChinese: '邦商品及服務稅',
      rate: 0.09,
      registrationThreshold: 4000000,
      filingFrequency: 'MONTHLY',
      applicableTo: ['BOTH'],
    },
    {
      type: 'IGST',
      name: 'Integrated GST',
      nameChinese: '綜合商品及服務稅',
      rate: 0.18,
      filingFrequency: 'MONTHLY',
      applicableTo: ['BOTH'],
      notes: 'Inter-state transactions: IGST = 18%',
    },
    {
      type: 'TDS',
      name: 'Tax Deducted at Source',
      nameChinese: '源頭扣稅',
      rate: 0.10,            // Varies by category
      filingFrequency: 'MONTHLY',
      applicableTo: ['SERVICES'],
      notes: 'Rates vary: 1% to 30% depending on nature of payment',
    },
  ],
  chartOfAccounts: {
    standard: 'IndAS',
    categories: [
      { code: '1', range: [1000, 1999], name: 'Assets', nameChinese: '資產',
        subcategories: [
          { code: '1.1', range: [1000, 1099], name: 'Cash & Bank Balances', nameChinese: '現金及銀行結餘' },
          { code: '1.2', range: [1100, 1199], name: 'Trade Receivables', nameChinese: '應收貿易賬款' },
          { code: '1.3', range: [1200, 1299], name: 'Inventories', nameChinese: '存貨' },
          { code: '1.4', range: [1300, 1399], name: 'Loans & Advances', nameChinese: '貸款及預付款' },
          { code: '1.5', range: [1400, 1499], name: 'GST Input Credit', nameChinese: 'GST進項稅抵扣' },
          { code: '1.6', range: [1500, 1699], name: 'Property, Plant & Equipment', nameChinese: '物業、廠房及設備' },
          { code: '1.7', range: [1700, 1799], name: 'Right of Use Assets', nameChinese: '使用權資產' },
          { code: '1.8', range: [1800, 1999], name: 'Intangible Assets', nameChinese: '無形資產' },
        ],
      },
      { code: '2', range: [2000, 2999], name: 'Liabilities', nameChinese: '負債',
        subcategories: [
          { code: '2.1', range: [2000, 2099], name: 'Trade Payables', nameChinese: '應付貿易賬款' },
          { code: '2.2', range: [2100, 2199], name: 'Other Current Liabilities', nameChinese: '其他流動負債' },
          { code: '2.3', range: [2200, 2299], name: 'GST Payable', nameChinese: '應付GST' },
          { code: '2.4', range: [2300, 2399], name: 'TDS Payable', nameChinese: '應付TDS' },
          { code: '2.5', range: [2400, 2499], name: 'Employee Dues', nameChinese: '應付員工款項' },
          { code: '2.6', range: [2500, 2999], name: 'Borrowings', nameChinese: '借款' },
        ],
      },
      { code: '3', range: [3000, 3999], name: 'Equity', nameChinese: '權益' },
      { code: '4', range: [4000, 4999], name: 'Revenue', nameChinese: '收入' },
      { code: '5', range: [5000, 5999], name: 'Cost of Revenue', nameChinese: '收入成本' },
      { code: '6', range: [6000, 6999], name: 'Operating Expenses', nameChinese: '營業費用' },
      { code: '7', range: [7000, 7999], name: 'Other Income/Expenses', nameChinese: '其他收入/支出' },
    ],
  },
  compliance: [
    {
      id: 'in-gstr1',
      name: 'GSTR-1 (Outward Supplies)',
      nameChinese: 'GSTR-1 (銷項)',
      authority: 'Central Board of Indirect Taxes & Customs (CBIC)',
      frequency: 'MONTHLY',
      deadline: '11th of following month',
      aiRagDocuments: ['in-gst-rules', 'in-gstr1-guide'],
    },
    {
      id: 'in-gstr3b',
      name: 'GSTR-3B (Summary Return)',
      nameChinese: 'GSTR-3B (匯總申報)',
      authority: 'CBIC',
      frequency: 'MONTHLY',
      deadline: '20th of following month',
      aiRagDocuments: ['in-gst-itc-rules'],
    },
    {
      id: 'in-tds-return',
      name: 'TDS Quarterly Return',
      nameChinese: 'TDS季度申報',
      authority: 'Income Tax Department',
      frequency: 'QUARTERLY',
      deadline: '31st of month following quarter',
      aiRagDocuments: ['in-tds-rates', 'in-tds-exemptions'],
    },
    {
      id: 'in-advance-tax',
      name: 'Advance Tax Payment',
      nameChinese: '預繳稅款',
      authority: 'Income Tax Department',
      frequency: 'QUARTERLY',
      deadline: '15th June/Sept/Dec/March',
    },
    {
      id: 'in-itr-corp',
      name: 'Corporate Income Tax Return',
      nameChinese: '公司所得稅報表',
      authority: 'Income Tax Department',
      frequency: 'ANNUAL',
      deadline: 'October 31 (audit required)',
      penaltyInfo: '₹5,000 if filed before Dec 31, ₹10,000 after',
      aiRagDocuments: ['in-itr-guide', 'in-corporate-tax-rates'],
    },
    {
      id: 'in-roc-annual',
      name: 'ROC Annual Returns',
      nameChinese: 'ROC周年申報',
      authority: 'Ministry of Corporate Affairs',
      frequency: 'ANNUAL',
      deadline: '30 days from AGM',
    },
  ],
  financialReports: [
    { id: 'balance-sheet', name: 'Balance Sheet', nameChinese: '資產負債表', required: true, frequency: 'ANNUAL' },
    { id: 'pnl', name: 'Statement of Profit & Loss', nameChinese: '損益表', required: true, frequency: 'ANNUAL' },
    { id: 'cash-flow', name: 'Cash Flow Statement', nameChinese: '現金流量表', required: true, frequency: 'ANNUAL' },
    { id: 'equity-changes', name: 'Statement of Changes in Equity', nameChinese: '權益變動表', required: true, frequency: 'ANNUAL' },
    { id: 'notes', name: 'Notes to Financial Statements', nameChinese: '財務報表附註', required: true, frequency: 'ANNUAL' },
    { id: 'schedule-iii', name: 'Schedule III Format', nameChinese: '附表III格式', required: true, frequency: 'ANNUAL' },
  ],
  aiFeatures: {
    documentRecognition: ['GST Invoice', 'E-Way Bill', 'TDS Certificate', 'Bank Statement', 'Receipt', 'PAN Card'],
    taxOptimization: true,
    regulatoryAlerts: true,
    crossBorderSupport: ['HK', 'CN'],
  },
};

// =================================================================
// Master Configuration Map
// =================================================================

export const REGIONAL_CONFIGS: Record<RegionCode, RegionalConfig> = {
  CA: CANADA_CONFIG,
  HK: HONG_KONG_CONFIG,
  CN: CHINA_CONFIG,
  IN: INDIA_CONFIG,
};

// =================================================================
// Helper Functions
// =================================================================

export function getRegionalConfig(region: RegionCode): RegionalConfig {
  return REGIONAL_CONFIGS[region];
}

export function formatCurrency(amount: number, region: RegionCode): string {
  const config = REGIONAL_CONFIGS[region];
  const { currency } = config;
  
  const formatted = amount
    .toFixed(currency.decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator);
  
  if (currency.symbolPosition === 'before') {
    return currency.symbolSpacing ? `${currency.symbol} ${formatted}` : `${currency.symbol}${formatted}`;
  }
  return currency.symbolSpacing ? `${formatted} ${currency.symbol}` : `${formatted}${currency.symbol}`;
}

export function formatDate(date: Date | string, region: RegionCode, format: 'short' | 'long' | 'fiscal' = 'short'): string {
  const config = REGIONAL_CONFIGS[region];
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const template = config.dateFormat[format];
  
  return template
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('M', (d.getMonth() + 1).toString())
    .replace('DD', day)
    .replace('D', d.getDate().toString())
    .replace('MMMM', monthNames[d.getMonth()]);
}

export function getTaxRates(region: RegionCode): TaxRate[] {
  return REGIONAL_CONFIGS[region].taxRates;
}

export function getChartOfAccounts(region: RegionCode): ChartOfAccounts {
  return REGIONAL_CONFIGS[region].chartOfAccounts;
}

export function getComplianceRequirements(region: RegionCode): ComplianceRequirement[] {
  return REGIONAL_CONFIGS[region].compliance;
}

export function getUpcomingDeadlines(region: RegionCode, days: number = 30): ComplianceRequirement[] {
  // This would be enhanced with actual date calculations
  return REGIONAL_CONFIGS[region].compliance.filter(c => 
    c.frequency === 'MONTHLY' || c.frequency === 'QUARTERLY'
  );
}

export function getAIDocumentTypes(region: RegionCode): string[] {
  return REGIONAL_CONFIGS[region].aiFeatures.documentRecognition;
}

export function getSupportedCrossBorderRegions(region: RegionCode): RegionCode[] {
  return REGIONAL_CONFIGS[region].aiFeatures.crossBorderSupport;
}

// Default export
export default REGIONAL_CONFIGS;
