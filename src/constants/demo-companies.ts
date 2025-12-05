// Demo company data for different industry types
// This file contains mock data for three types of demo companies:
// 1. Accounting & Audit Firm (會計及審計事務所)
// 2. Financial PR Company (財經公關公司)
// 3. IPO Advisory Company (IPO顧問公司)

export type CompanyType = 'accounting' | 'financial-pr' | 'ipo-advisory';

export interface DemoCompany {
  id: string;
  name: string;
  nameZh: string;
  type: CompanyType;
  description: string;
  descriptionZh: string;
  logo?: string;
  currency: string;
  stats: CompanyStats;
  engagements: Engagement[];
  recentTransactions: Transaction[];
  chartData: ChartDataPoint[];
  serviceBreakdown: ServiceRevenue[];
}

// Stats interface with industry-specific labels
export interface CompanyStats {
  // Universal stats
  outstandingInvoices: string;
  activeEngagements: number;
  complianceScore: string;
  revenueYTD: string;
  pendingTasks: number;
  clientCount: number;
  // Industry-specific stats
  primaryMetric: { label: string; value: string; trend: string };
  secondaryMetric: { label: string; value: string; trend: string };
  tertiaryMetric: { label: string; value: string; trend: string };
  quaternaryMetric: { label: string; value: string; trend: string };
}

export interface Engagement {
  id: string;
  company: string;
  type: string;
  status: 'In Progress' | 'Due Review' | 'Completed' | 'Pending';
  fee: string;
  avatar?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  type: 'income' | 'expense';
}

export interface ChartDataPoint {
  date: string;
  invoices: number;
  payments: number;
}

export interface ServiceRevenue {
  service: string;
  revenue: number;
  label: string;
}

// ============================================
// ACCOUNTING & AUDIT FIRM - 會計及審計事務所
// ============================================
export const accountingFirm: DemoCompany = {
  id: 'accounting-firm',
  name: 'ZL CPA',
  nameZh: 'ZL 會計師事務所',
  type: 'accounting',
  description: 'Full-service accounting and audit firm specializing in statutory audits, tax compliance and business advisory',
  descriptionZh: '提供法定審計、稅務合規及商業顧問服務的綜合會計師事務所',
  currency: 'HKD',
  stats: {
    outstandingInvoices: 'HK$3,850,000',
    activeEngagements: 45,
    complianceScore: '98.5%',
    revenueYTD: 'HK$12.8M',
    pendingTasks: 128,
    clientCount: 286,
    // Industry-specific: Audit & Tax focused
    primaryMetric: { 
      label: 'Audits In Progress', 
      value: '32', 
      trend: '+8 vs last month' 
    },
    secondaryMetric: { 
      label: 'Tax Returns Pending', 
      value: '156', 
      trend: 'Peak season - Due Apr 30' 
    },
    tertiaryMetric: { 
      label: 'Billable Hours (MTD)', 
      value: '2,847 hrs', 
      trend: '+12.5% utilization' 
    },
    quaternaryMetric: { 
      label: 'Avg. Collection Days', 
      value: '38 days', 
      trend: '-5 days vs industry avg' 
    }
  },
  engagements: [
    { id: '1', company: 'Pacific Trading Ltd.', type: 'Statutory Audit (FY2024)', status: 'In Progress', fee: 'HK$285,000' },
    { id: '2', company: 'Golden Dragon Holdings', type: 'Profits Tax Filing', status: 'Due Review', fee: 'HK$45,000' },
    { id: '3', company: 'Asia Tech Solutions', type: 'Group Consolidation Audit', status: 'In Progress', fee: 'HK$520,000' },
    { id: '4', company: 'Sunshine Property Management', type: 'MPF & Payroll Audit', status: 'Completed', fee: 'HK$38,000' },
    { id: '5', company: 'Eastern Import Export Co.', type: 'Transfer Pricing Review', status: 'Pending', fee: 'HK$180,000' },
    { id: '6', company: 'Fortune Investment Ltd.', type: 'Due Diligence (Acquisition)', status: 'In Progress', fee: 'HK$350,000' }
  ],
  recentTransactions: [
    { id: '1', date: '2024-12-03', description: 'Audit fee received - Asia Tech Group', amount: 'HK$260,000', type: 'income' },
    { id: '2', date: '2024-12-02', description: 'Staff salary & MPF - December', amount: 'HK$680,000', type: 'expense' },
    { id: '3', date: '2024-12-01', description: 'Tax advisory fee - Golden Dragon', amount: 'HK$45,000', type: 'income' },
    { id: '4', date: '2024-11-30', description: 'HKICPA subscription & CPD fees', amount: 'HK$28,500', type: 'expense' },
    { id: '5', date: '2024-11-29', description: 'Office rent - Admiralty Centre', amount: 'HK$185,000', type: 'expense' }
  ],
  chartData: generateMonthlyData('accounting'),
  serviceBreakdown: [
    { service: 'statutory-audit', revenue: 5200, label: 'Statutory Audit' },
    { service: 'tax-compliance', revenue: 2800, label: 'Tax Compliance' },
    { service: 'bookkeeping', revenue: 1800, label: 'Bookkeeping Services' },
    { service: 'advisory', revenue: 1500, label: 'Business Advisory' },
    { service: 'company-secretarial', revenue: 1000, label: 'Company Secretarial' },
    { service: 'other', revenue: 500, label: 'Other Services' }
  ]
};

// ============================================
// FINANCIAL PR COMPANY - 財經公關公司
// ============================================
export const financialPRCompany: DemoCompany = {
  id: 'financial-pr',
  name: 'BMI Innovation (PR)',
  nameZh: 'BMI 創新公關',
  type: 'financial-pr',
  description: 'Premier financial PR and investor relations firm serving listed companies in Hong Kong and Greater China',
  descriptionZh: '服務香港及大中華區上市公司的頂級財經公關及投資者關係顧問',
  currency: 'HKD',
  stats: {
    outstandingInvoices: 'HK$2,180,000',
    activeEngagements: 38,
    complianceScore: '96.8%',
    revenueYTD: 'HK$18.5M',
    pendingTasks: 67,
    clientCount: 52,
    // Industry-specific: PR & IR focused
    primaryMetric: { 
      label: 'Listed Company Clients', 
      value: '52', 
      trend: '+6 new mandates YTD' 
    },
    secondaryMetric: { 
      label: 'Announcements This Month', 
      value: '28', 
      trend: 'Results season peak' 
    },
    tertiaryMetric: { 
      label: 'Media Coverage Score', 
      value: '94.2%', 
      trend: '+15% positive sentiment' 
    },
    quaternaryMetric: { 
      label: 'Investor Meetings Arranged', 
      value: '156', 
      trend: '+42 vs last quarter' 
    }
  },
  engagements: [
    { id: '1', company: 'China Biotech Holdings (2389.HK)', type: 'Annual Results Announcement', status: 'In Progress', fee: 'HK$280,000' },
    { id: '2', company: 'Pacific Real Estate (1688.HK)', type: 'IR Retainer (Annual)', status: 'In Progress', fee: 'HK$480,000' },
    { id: '3', company: 'Dragon FinTech Ltd. (Pre-IPO)', type: 'Pre-IPO Media Strategy', status: 'Due Review', fee: 'HK$650,000' },
    { id: '4', company: 'Golden Mining Resources (0888.HK)', type: 'Crisis Communication', status: 'Completed', fee: 'HK$180,000' },
    { id: '5', company: 'Asia Green Energy (6128.HK)', type: 'ESG Report & Comms', status: 'In Progress', fee: 'HK$220,000' },
    { id: '6', company: 'New Century Healthcare (1518.HK)', type: 'Investor Day Event', status: 'Pending', fee: 'HK$350,000' }
  ],
  recentTransactions: [
    { id: '1', date: '2024-12-03', description: 'IR retainer - Pacific Real Estate Q4', amount: 'HK$120,000', type: 'income' },
    { id: '2', date: '2024-12-02', description: 'Media monitoring subscription (annual)', amount: 'HK$68,000', type: 'expense' },
    { id: '3', date: '2024-12-01', description: 'Results announcement fee - China Biotech', amount: 'HK$140,000', type: 'income' },
    { id: '4', date: '2024-11-30', description: 'Venue rental - Analyst briefing', amount: 'HK$45,000', type: 'expense' },
    { id: '5', date: '2024-11-29', description: 'Design agency - Annual report production', amount: 'HK$85,000', type: 'expense' }
  ],
  chartData: generateMonthlyData('financial-pr'),
  serviceBreakdown: [
    { service: 'ir-retainer', revenue: 6500, label: 'IR Retainer Services' },
    { service: 'ipo-pr', revenue: 4200, label: 'IPO PR Campaigns' },
    { service: 'results-announcement', revenue: 3100, label: 'Results Announcements' },
    { service: 'annual-report', revenue: 2400, label: 'Annual Report Design' },
    { service: 'crisis-comms', revenue: 1500, label: 'Crisis Communications' },
    { service: 'other', revenue: 800, label: 'Other Services' }
  ]
};

// ============================================
// IPO ADVISORY COMPANY - IPO顧問公司
// ============================================
export const ipoAdvisoryCompany: DemoCompany = {
  id: 'ipo-advisory',
  name: 'BMI (IPO)',
  nameZh: 'BMI IPO 顧問',
  type: 'ipo-advisory',
  description: 'Leading IPO sponsor and corporate finance advisory firm for Main Board and GEM listings',
  descriptionZh: '專業IPO保薦人及企業融資顧問，服務主板及GEM上市',
  currency: 'HKD',
  stats: {
    outstandingInvoices: 'HK$8,500,000',
    activeEngagements: 12,
    complianceScore: '99.2%',
    revenueYTD: 'HK$45.8M',
    pendingTasks: 86,
    clientCount: 28,
    // Industry-specific: IPO & Corporate Finance focused
    primaryMetric: { 
      label: 'Active IPO Mandates', 
      value: '8', 
      trend: '3 targeting Q1 2025 listing' 
    },
    secondaryMetric: { 
      label: 'Total Deal Value (Pipeline)', 
      value: 'HK$12.8B', 
      trend: 'Largest: $4.2B Main Board' 
    },
    tertiaryMetric: { 
      label: 'SFC Approval Rate', 
      value: '100%', 
      trend: '15 consecutive approvals' 
    },
    quaternaryMetric: { 
      label: 'Avg. Time to Listing', 
      value: '8.2 months', 
      trend: '-1.8 mo vs market avg' 
    }
  },
  engagements: [
    { id: '1', company: 'TechVenture Holdings Ltd.', type: 'Main Board IPO Sponsor', status: 'In Progress', fee: 'HK$6,500,000' },
    { id: '2', company: 'BioPharm Innovation Inc.', type: 'Chapter 18A Listing', status: 'In Progress', fee: 'HK$5,200,000' },
    { id: '3', company: 'Smart Manufacturing Group', type: 'GEM to Main Board Transfer', status: 'Due Review', fee: 'HK$2,800,000' },
    { id: '4', company: 'Green Mobility Technologies', type: 'Pre-IPO Restructuring', status: 'In Progress', fee: 'HK$1,500,000' },
    { id: '5', company: 'Asia Digital Finance', type: 'GEM Listing Sponsor', status: 'Completed', fee: 'HK$3,200,000' },
    { id: '6', company: 'Pacific Logistics Holdings', type: 'Rights Issue Underwriting', status: 'Pending', fee: 'HK$1,800,000' }
  ],
  recentTransactions: [
    { id: '1', date: '2024-12-03', description: 'IPO success fee - Asia Digital Finance', amount: 'HK$2,800,000', type: 'income' },
    { id: '2', date: '2024-12-02', description: 'Legal counsel retainer - Clifford Chance', amount: 'HK$450,000', type: 'expense' },
    { id: '3', date: '2024-12-01', description: 'Sponsor retainer - TechVenture Q4', amount: 'HK$650,000', type: 'income' },
    { id: '4', date: '2024-11-30', description: 'SFC filing fees - BioPharm', amount: 'HK$125,000', type: 'expense' },
    { id: '5', date: '2024-11-29', description: 'Due diligence - site visits (travel)', amount: 'HK$180,000', type: 'expense' }
  ],
  chartData: generateMonthlyData('ipo-advisory'),
  serviceBreakdown: [
    { service: 'main-board-ipo', revenue: 22000, label: 'Main Board IPO' },
    { service: 'gem-listing', revenue: 9500, label: 'GEM Listing' },
    { service: 'pre-ipo', revenue: 6200, label: 'Pre-IPO Advisory' },
    { service: 'corporate-finance', revenue: 5100, label: 'Corporate Finance' },
    { service: 'compliance-advisory', revenue: 2200, label: 'Compliance Advisory' },
    { service: 'other', revenue: 800, label: 'Other Services' }
  ]
};

// Helper function to generate monthly chart data
function generateMonthlyData(type: CompanyType): ChartDataPoint[] {
  const baseMultiplier = type === 'accounting' ? 1 : type === 'financial-pr' ? 1.5 : 3;
  const data: ChartDataPoint[] = [];
  
  for (let month = 4; month <= 6; month++) {
    for (let day = 1; day <= 30; day++) {
      const dateStr = `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      data.push({
        date: dateStr,
        invoices: Math.floor((100 + Math.random() * 300) * baseMultiplier),
        payments: Math.floor((80 + Math.random() * 280) * baseMultiplier)
      });
    }
  }
  
  return data;
}

// Get company by type
export function getDemoCompany(type: CompanyType): DemoCompany {
  switch (type) {
    case 'accounting':
      return accountingFirm;
    case 'financial-pr':
      return financialPRCompany;
    case 'ipo-advisory':
      return ipoAdvisoryCompany;
    default:
      return accountingFirm;
  }
}

// Get all demo companies
export function getAllDemoCompanies(): DemoCompany[] {
  return [accountingFirm, financialPRCompany, ipoAdvisoryCompany];
}
