/**
 * Accounting Fake Data Seeder
 * Generates realistic accounting data for demo/testing purposes
 * Supports all regional formats: Canada, Hong Kong, China, India
 */

import {
  RegionCode,
  REGIONAL_CONFIGS,
  formatCurrency,
  formatDate,
} from './accounting-regional-formats';

// =================================================================
// Types
// =================================================================

export interface FakeClient {
  id: string;
  name: string;
  nameChinese?: string;
  industry: string;
  region: RegionCode;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT';
  annualRevenue: number;
  engagementType: 'AUDIT' | 'TAX' | 'ADVISORY' | 'BOOKKEEPING' | 'COMPILATION';
  assignedPartner: string;
  createdAt: string;
}

export interface FakeTransaction {
  id: string;
  clientId: string;
  date: string;
  description: string;
  descriptionChinese?: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  currency: string;
  exchangeRate: number;
  reference: string;
  category: string;
  taxCode?: string;
  taxAmount?: number;
  attachmentUrl?: string;
}

export interface FakeInvoice {
  id: string;
  clientId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  description: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    taxCode?: string;
  }[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  currency: string;
}

export interface FakeReceipt {
  id: string;
  clientId: string;
  vendorName: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  taxAmount: number;
  currency: string;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'CHEQUE';
  imageUrl: string;
  ocrExtracted: boolean;
  aiCategorized: boolean;
}

export interface FakePayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  grossSalary: number;
  deductions: {
    type: string;
    amount: number;
  }[];
  netPay: number;
  currency: string;
}

// =================================================================
// Name Generators by Region
// =================================================================

const COMPANY_NAMES = {
  CA: [
    'Maple Leaf Technologies Inc.',
    'Northern Lights Consulting Ltd.',
    'Pacific Coast Ventures',
    'Rocky Mountain Industries',
    'Great Lakes Manufacturing Co.',
    'Prairie Wind Energy Corp.',
    'Toronto Financial Services Inc.',
    'Vancouver Digital Solutions',
    'Montreal Creative Agency',
    'Calgary Oil & Gas Ltd.',
  ],
  HK: [
    'Golden Dragon Holdings Limited',
    'Pacific Pearl Trading Co.',
    'Victoria Harbour Investments',
    'Lion Rock Properties Limited',
    'Asia Pacific Trading Limited',
    'Central Star Enterprises',
    'Oriental Fortune Group',
    'Kowloon Bay Industries',
    'Hong Kong Finance Limited',
    'Tsim Sha Tsui Merchants',
  ],
  CN: [
    '东方科技有限公司',
    '华创投资集团',
    '中盛贸易有限公司',
    '龙腾实业股份有限公司',
    '金鹏科技发展有限公司',
    '深圳创新科技有限公司',
    '上海国际贸易有限公司',
    '北京智能科技有限公司',
    '广州电子商务有限公司',
    '杭州网络科技有限公司',
  ],
  IN: [
    'Ganges Software Solutions Pvt. Ltd.',
    'Mumbai Enterprise Services',
    'Delhi Digital Technologies',
    'Bangalore Tech Innovations',
    'Chennai Manufacturing Co.',
    'Kolkata Trading Corporation',
    'Hyderabad IT Services',
    'Pune Engineering Works',
    'Ahmedabad Textiles Ltd.',
    'Jaipur Export House Pvt. Ltd.',
  ],
};

const INDUSTRIES = [
  'Technology', 'Financial Services', 'Manufacturing', 'Retail',
  'Healthcare', 'Real Estate', 'Professional Services', 'Energy',
  'Transportation', 'Hospitality', 'Education', 'Agriculture',
];

const EXPENSE_CATEGORIES = {
  CA: [
    { code: '6000', name: 'Salaries and Wages', chinese: '薪金及工資' },
    { code: '6100', name: 'Employee Benefits', chinese: '員工福利' },
    { code: '6200', name: 'Rent Expense', chinese: '租金費用' },
    { code: '6210', name: 'Utilities', chinese: '水電費' },
    { code: '6300', name: 'Professional Fees', chinese: '專業費用' },
    { code: '6310', name: 'Legal Fees', chinese: '法律費用' },
    { code: '6320', name: 'Accounting Fees', chinese: '會計費用' },
    { code: '6400', name: 'Marketing & Advertising', chinese: '市場推廣及廣告' },
    { code: '6500', name: 'Travel & Entertainment', chinese: '差旅及招待' },
    { code: '6600', name: 'Office Supplies', chinese: '辦公用品' },
    { code: '6700', name: 'Insurance', chinese: '保險' },
    { code: '6800', name: 'Depreciation', chinese: '折舊' },
    { code: '6900', name: 'Miscellaneous', chinese: '雜項費用' },
  ],
  HK: [
    { code: '6000', name: 'Staff Costs', chinese: '員工成本' },
    { code: '6100', name: 'MPF Contributions', chinese: '強積金供款' },
    { code: '6200', name: 'Premises Costs', chinese: '物業費用' },
    { code: '6210', name: 'Rates', chinese: '差餉' },
    { code: '6220', name: 'Management Fees', chinese: '管理費' },
    { code: '6300', name: 'Professional Fees', chinese: '專業費用' },
    { code: '6310', name: 'Audit Fees', chinese: '審計費' },
    { code: '6400', name: 'Marketing', chinese: '市場推廣' },
    { code: '6500', name: 'Entertainment', chinese: '應酬費' },
    { code: '6600', name: 'Bank Charges', chinese: '銀行費用' },
    { code: '6700', name: 'Insurance', chinese: '保險' },
    { code: '6800', name: 'Depreciation', chinese: '折舊' },
  ],
  CN: [
    { code: '5401', name: '主营业务成本', chinese: '主营业务成本' },
    { code: '5501', name: '销售费用', chinese: '销售费用' },
    { code: '5502', name: '管理费用', chinese: '管理费用' },
    { code: '5503', name: '财务费用', chinese: '财务费用' },
    { code: '5601', name: '资产减值损失', chinese: '资产减值损失' },
    { code: '5701', name: '营业外支出', chinese: '营业外支出' },
    { code: '6001', name: '职工薪酬', chinese: '职工薪酬' },
    { code: '6002', name: '社会保险', chinese: '社会保险' },
    { code: '6003', name: '住房公积金', chinese: '住房公积金' },
    { code: '6100', name: '办公费', chinese: '办公费' },
    { code: '6200', name: '租赁费', chinese: '租赁费' },
    { code: '6300', name: '差旅费', chinese: '差旅费' },
  ],
  IN: [
    { code: '6000', name: 'Salaries & Wages', chinese: '薪金' },
    { code: '6100', name: 'Employee PF Contribution', chinese: '公積金供款' },
    { code: '6110', name: 'Employee ESI Contribution', chinese: 'ESI供款' },
    { code: '6200', name: 'Rent', chinese: '租金' },
    { code: '6210', name: 'Electricity', chinese: '電費' },
    { code: '6300', name: 'Professional Charges', chinese: '專業費用' },
    { code: '6310', name: 'Legal & Professional', chinese: '法律及專業' },
    { code: '6320', name: 'Audit Fees', chinese: '審計費' },
    { code: '6400', name: 'Advertisement', chinese: '廣告' },
    { code: '6500', name: 'Travelling & Conveyance', chinese: '差旅費' },
    { code: '6600', name: 'Printing & Stationery', chinese: '印刷及文具' },
    { code: '6700', name: 'Communication', chinese: '通訊費' },
    { code: '6800', name: 'Depreciation', chinese: '折舊' },
  ],
};

const VENDORS = {
  CA: [
    'Staples Canada', 'Bell Canada', 'Rogers Communications', 'CIBC',
    'Air Canada', 'Canadian Tire', 'Loblaws', 'Petro-Canada',
    'Shopify', 'TD Bank', 'RBC', 'Scotiabank',
  ],
  HK: [
    'HKT Limited', 'CLP Power', 'Towngas', 'MTR Corporation',
    'Cathay Pacific', 'HSBC', 'Bank of China', 'Hang Seng Bank',
    'Pacific Coffee', 'ParknShop', 'Wellcome', 'Watsons',
  ],
  CN: [
    '中国移动', '中国电信', '国家电网', '中石化',
    '京东商城', '阿里巴巴', '腾讯', '美团',
    '顺丰速运', '中国银行', '工商银行', '建设银行',
  ],
  IN: [
    'Reliance Industries', 'Tata Consultancy', 'Infosys', 'Wipro',
    'HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Airtel',
    'Amazon India', 'Flipkart', 'BigBasket', 'Zomato',
  ],
};

// =================================================================
// Data Generation Functions
// =================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(startDays: number = 365, endDays: number = 0): Date {
  const start = new Date();
  start.setDate(start.getDate() - startDays);
  const end = new Date();
  end.setDate(end.getDate() - endDays);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateTaxId(region: RegionCode): string {
  switch (region) {
    case 'CA':
      return `${randomNumber(100000000, 999999999)} RC0001`; // Business Number
    case 'HK':
      return `${randomNumber(10000000, 99999999)}`; // BR Number
    case 'CN':
      // Unified Social Credit Code (18 digits)
      return `91${randomNumber(1000, 9999)}00${randomNumber(10000000, 99999999)}X`;
    case 'IN':
      // GSTIN format: 2 state + 10 PAN + 1 entity + 1 check + 1 default
      return `${randomNumber(10, 35)}ABCDE${randomNumber(1000, 9999)}F${randomNumber(1, 9)}Z${randomNumber(1, 9)}`;
    default:
      return generateId();
  }
}

export function generateFakeClients(region: RegionCode, count: number = 10): FakeClient[] {
  const config = REGIONAL_CONFIGS[region];
  const clients: FakeClient[] = [];
  
  for (let i = 0; i < count; i++) {
    const companyName = COMPANY_NAMES[region][i % COMPANY_NAMES[region].length];
    const revenue = randomNumber(100000, 50000000);
    
    clients.push({
      id: generateId(),
      name: companyName,
      nameChinese: region === 'CN' ? companyName : undefined,
      industry: randomElement(INDUSTRIES),
      region,
      email: `info@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`.slice(0, 50),
      phone: region === 'CN' ? `+86 ${randomNumber(100, 999)} ${randomNumber(1000, 9999)} ${randomNumber(1000, 9999)}` :
             region === 'HK' ? `+852 ${randomNumber(2000, 9999)} ${randomNumber(1000, 9999)}` :
             region === 'IN' ? `+91 ${randomNumber(70000, 99999)} ${randomNumber(10000, 99999)}` :
             `+1 ${randomNumber(200, 999)} ${randomNumber(200, 999)} ${randomNumber(1000, 9999)}`,
      address: `${randomNumber(1, 999)} Business Street, ${config.name}`,
      taxId: generateTaxId(region),
      status: randomElement(['ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE', 'PROSPECT']),
      annualRevenue: revenue,
      engagementType: randomElement(['AUDIT', 'TAX', 'ADVISORY', 'BOOKKEEPING', 'COMPILATION']),
      assignedPartner: `Partner ${randomNumber(1, 5)}`,
      createdAt: randomDate(730, 30).toISOString(),
    });
  }
  
  return clients;
}

export function generateFakeTransactions(
  region: RegionCode, 
  clientId: string,
  count: number = 50
): FakeTransaction[] {
  const config = REGIONAL_CONFIGS[region];
  const categories = EXPENSE_CATEGORIES[region];
  const transactions: FakeTransaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const category = randomElement(categories);
    const isDebit = Math.random() > 0.3;
    const amount = randomNumber(100, 50000);
    const date = randomDate(365, 0);
    const taxRate = config.taxRates[0]?.rate || 0;
    const taxAmount = Math.round(amount * taxRate * 100) / 100;
    
    transactions.push({
      id: generateId(),
      clientId,
      date: date.toISOString(),
      description: `${category.name} - ${randomElement(VENDORS[region])}`,
      descriptionChinese: category.chinese,
      accountCode: category.code,
      accountName: category.name,
      debit: isDebit ? amount : 0,
      credit: isDebit ? 0 : amount,
      currency: config.currency.code,
      exchangeRate: 1,
      reference: `TXN-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}-${randomNumber(1000, 9999)}`,
      category: category.name,
      taxCode: config.taxRates[0]?.type,
      taxAmount: isDebit ? taxAmount : 0,
    });
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function generateFakeInvoices(
  region: RegionCode,
  clientId: string,
  count: number = 10
): FakeInvoice[] {
  const config = REGIONAL_CONFIGS[region];
  const invoices: FakeInvoice[] = [];
  
  for (let i = 0; i < count; i++) {
    const date = randomDate(180, 0);
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 30);
    
    const lineItemCount = randomNumber(1, 5);
    const lineItems: FakeInvoice['lineItems'] = [];
    let subtotal = 0;
    
    const services = [
      'Professional Services', 'Consulting', 'Audit Services', 'Tax Advisory',
      'Bookkeeping', 'Financial Reporting', 'Compliance Review', 'Due Diligence',
    ];
    
    for (let j = 0; j < lineItemCount; j++) {
      const quantity = randomNumber(1, 20);
      const unitPrice = randomNumber(500, 5000);
      const amount = quantity * unitPrice;
      subtotal += amount;
      
      lineItems.push({
        description: randomElement(services),
        quantity,
        unitPrice,
        amount,
        taxCode: config.taxRates[0]?.type,
      });
    }
    
    const taxRate = config.taxRates[0]?.rate || 0;
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    
    invoices.push({
      id: generateId(),
      clientId,
      invoiceNumber: `INV-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}-${String(i + 1).padStart(4, '0')}`,
      date: date.toISOString(),
      dueDate: dueDate.toISOString(),
      description: `Invoice for ${randomElement(services)}`,
      lineItems,
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
      status: randomElement(['DRAFT', 'SENT', 'SENT', 'PAID', 'PAID', 'PAID', 'OVERDUE']),
      currency: config.currency.code,
    });
  }
  
  return invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function generateFakeReceipts(
  region: RegionCode,
  clientId: string,
  count: number = 30
): FakeReceipt[] {
  const config = REGIONAL_CONFIGS[region];
  const categories = EXPENSE_CATEGORIES[region];
  const receipts: FakeReceipt[] = [];
  
  for (let i = 0; i < count; i++) {
    const category = randomElement(categories);
    const amount = randomNumber(50, 10000);
    const taxRate = config.taxRates[0]?.rate || 0;
    const taxAmount = Math.round(amount * taxRate * 100) / 100;
    
    receipts.push({
      id: generateId(),
      clientId,
      vendorName: randomElement(VENDORS[region]),
      date: randomDate(90, 0).toISOString(),
      description: category.name,
      category: category.name,
      amount,
      taxAmount,
      currency: config.currency.code,
      paymentMethod: randomElement(['CASH', 'CARD', 'TRANSFER', 'CHEQUE']),
      imageUrl: `/demo/receipts/${region.toLowerCase()}-receipt-${i + 1}.jpg`,
      ocrExtracted: Math.random() > 0.2,
      aiCategorized: Math.random() > 0.3,
    });
  }
  
  return receipts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function generateFakePayroll(
  region: RegionCode,
  count: number = 20
): FakePayrollRecord[] {
  const config = REGIONAL_CONFIGS[region];
  const payroll: FakePayrollRecord[] = [];
  
  const employeeNames = {
    CA: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson'],
    HK: ['陳大文', 'Wong Mei Ling', '李小明', 'Chan Ka Wai', 'Lam Kin Man'],
    CN: ['张伟', '李娜', '王芳', '刘洋', '陈明'],
    IN: ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Singh', 'Vikram Reddy'],
  };
  
  const currentDate = new Date();
  const periods: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - i);
    periods.push(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`);
  }
  
  for (let i = 0; i < count; i++) {
    const grossSalary = randomNumber(30000, 150000);
    const deductions: { type: string; amount: number }[] = [];
    let totalDeductions = 0;
    
    switch (region) {
      case 'CA':
        const cpp = Math.min(grossSalary * 0.0595, 3754.45);
        const ei = Math.min(grossSalary * 0.0163, 1049.12);
        const tax = grossSalary * randomNumber(15, 30) / 100;
        deductions.push({ type: 'CPP', amount: cpp });
        deductions.push({ type: 'EI', amount: ei });
        deductions.push({ type: 'Income Tax', amount: tax });
        totalDeductions = cpp + ei + tax;
        break;
      case 'HK':
        const mpf = Math.min(grossSalary * 0.05, 1500);
        const salaryTax = grossSalary * randomNumber(5, 15) / 100;
        deductions.push({ type: 'MPF', amount: mpf });
        deductions.push({ type: 'Salaries Tax', amount: salaryTax });
        totalDeductions = mpf + salaryTax;
        break;
      case 'CN':
        const pension = grossSalary * 0.08;
        const medical = grossSalary * 0.02;
        const unemployment = grossSalary * 0.005;
        const housingFund = grossSalary * 0.12;
        const iit = grossSalary * randomNumber(3, 25) / 100;
        deductions.push({ type: '养老保险', amount: pension });
        deductions.push({ type: '医疗保险', amount: medical });
        deductions.push({ type: '失业保险', amount: unemployment });
        deductions.push({ type: '住房公积金', amount: housingFund });
        deductions.push({ type: '个人所得税', amount: iit });
        totalDeductions = pension + medical + unemployment + housingFund + iit;
        break;
      case 'IN':
        const pf = grossSalary * 0.12;
        const esi = grossSalary < 21000 ? grossSalary * 0.0075 : 0;
        const incomeTax = grossSalary * randomNumber(5, 30) / 100;
        const professionalTax = Math.min(200, grossSalary * 0.02);
        deductions.push({ type: 'PF', amount: pf });
        if (esi > 0) deductions.push({ type: 'ESI', amount: esi });
        deductions.push({ type: 'Income Tax', amount: incomeTax });
        deductions.push({ type: 'Professional Tax', amount: professionalTax });
        totalDeductions = pf + esi + incomeTax + professionalTax;
        break;
    }
    
    payroll.push({
      id: generateId(),
      employeeId: `EMP-${String(randomNumber(1, 100)).padStart(4, '0')}`,
      employeeName: randomElement(employeeNames[region]),
      period: randomElement(periods),
      grossSalary,
      deductions,
      netPay: grossSalary - totalDeductions,
      currency: config.currency.code,
    });
  }
  
  return payroll;
}

// =================================================================
// Full Dataset Generator
// =================================================================

export interface FakeAccountingDataset {
  region: RegionCode;
  clients: FakeClient[];
  transactions: FakeTransaction[];
  invoices: FakeInvoice[];
  receipts: FakeReceipt[];
  payroll: FakePayrollRecord[];
  generatedAt: string;
  summary: {
    totalClients: number;
    totalTransactions: number;
    totalInvoices: number;
    totalReceipts: number;
    totalPayrollRecords: number;
    totalRevenue: number;
    totalExpenses: number;
    currency: string;
  };
}

export function generateFullDataset(region: RegionCode): FakeAccountingDataset {
  const config = REGIONAL_CONFIGS[region];
  const clients = generateFakeClients(region, 10);
  
  let allTransactions: FakeTransaction[] = [];
  let allInvoices: FakeInvoice[] = [];
  let allReceipts: FakeReceipt[] = [];
  
  // Generate data for each client
  clients.forEach(client => {
    allTransactions = allTransactions.concat(generateFakeTransactions(region, client.id, 30));
    allInvoices = allInvoices.concat(generateFakeInvoices(region, client.id, 5));
    allReceipts = allReceipts.concat(generateFakeReceipts(region, client.id, 15));
  });
  
  const payroll = generateFakePayroll(region, 20);
  
  // Calculate summary
  const totalRevenue = allInvoices.reduce((sum, inv) => 
    inv.status === 'PAID' ? sum + inv.total : sum, 0);
  const totalExpenses = allTransactions.reduce((sum, txn) => sum + txn.debit, 0);
  
  return {
    region,
    clients,
    transactions: allTransactions,
    invoices: allInvoices,
    receipts: allReceipts,
    payroll,
    generatedAt: new Date().toISOString(),
    summary: {
      totalClients: clients.length,
      totalTransactions: allTransactions.length,
      totalInvoices: allInvoices.length,
      totalReceipts: allReceipts.length,
      totalPayrollRecords: payroll.length,
      totalRevenue,
      totalExpenses,
      currency: config.currency.code,
    },
  };
}

// Generate datasets for all regions
export function generateAllRegionsData(): Record<RegionCode, FakeAccountingDataset> {
  return {
    CA: generateFullDataset('CA'),
    HK: generateFullDataset('HK'),
    CN: generateFullDataset('CN'),
    IN: generateFullDataset('IN'),
  };
}

// =================================================================
// Demo Data Store (Client-side storage)
// =================================================================

const STORAGE_KEY = 'wisematic-accounting-demo-data';

export function saveDemoData(data: Record<RegionCode, FakeAccountingDataset>): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export function loadDemoData(): Record<RegionCode, FakeAccountingDataset> | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function clearDemoData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getOrCreateDemoData(): Record<RegionCode, FakeAccountingDataset> {
  const existing = loadDemoData();
  if (existing) {
    return existing;
  }
  const newData = generateAllRegionsData();
  saveDemoData(newData);
  return newData;
}

export default {
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
};
