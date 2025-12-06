/**
 * RAG (Retrieval Augmented Generation) Regulations Knowledge Base
 * 
 * This file contains structured regulatory information for AI assistants
 * to reference when providing accounting, tax, and compliance guidance.
 * 
 * Regions: Canada (CA), Hong Kong (HK), China (CN), India (IN)
 */

import { RegionCode } from './accounting-regional-formats';

// =================================================================
// Types
// =================================================================

export interface RagDocument {
  id: string;
  title: string;
  titleChinese?: string;
  region: RegionCode | 'GLOBAL';
  category: 'TAX' | 'ACCOUNTING' | 'COMPLIANCE' | 'AUDIT' | 'PAYROLL' | 'CORPORATE';
  subcategory?: string;
  authority: string;
  effectiveDate?: string;
  lastUpdated: string;
  summary: string;
  summaryChinese?: string;
  content: string;
  contentChinese?: string;
  keyPoints: string[];
  keyPointsChinese?: string[];
  relatedDocuments?: string[];
  externalLinks?: { title: string; url: string }[];
  searchKeywords: string[];
}

// =================================================================
// Canada Regulations
// =================================================================

export const CANADA_REGULATIONS: RagDocument[] = [
  {
    id: 'ca-gst-hst-guide',
    title: 'GST/HST Registration and Filing Guide',
    titleChinese: 'GST/HST註冊及申報指南',
    region: 'CA',
    category: 'TAX',
    subcategory: 'Indirect Tax',
    authority: 'Canada Revenue Agency (CRA)',
    effectiveDate: '2024-01-01',
    lastUpdated: '2024-06-01',
    summary: 'Complete guide to GST/HST registration requirements, filing deadlines, and input tax credit claims for Canadian businesses.',
    summaryChinese: '加拿大企業GST/HST註冊要求、申報截止日期及進項稅抵扣的完整指南。',
    content: `
# GST/HST Registration Requirements

## Who Must Register
- Businesses with worldwide taxable supplies over $30,000 in any single calendar quarter or in four consecutive calendar quarters
- Taxi and limousine operators regardless of revenue
- Non-resident businesses making taxable supplies in Canada (certain exceptions apply)

## Voluntary Registration
- Small suppliers under $30,000 threshold may voluntarily register to claim Input Tax Credits (ITCs)
- Beneficial for businesses with significant business-to-business sales

## Registration Process
1. Register online through CRA My Business Account
2. Register by phone at 1-800-959-5525
3. Complete Form RC1 and mail to CRA

## Filing Frequencies
- Annual: Total taxable supplies ≤ $1.5 million
- Quarterly: Total taxable supplies $1.5M - $6M
- Monthly: Total taxable supplies > $6 million or by election

## GST/HST Rates by Province (2024)
- Alberta, BC (no HST), Saskatchewan, Manitoba, Yukon, NWT, Nunavut: 5% GST only
- Ontario: 13% HST
- New Brunswick, Newfoundland, Nova Scotia, PEI: 15% HST
- Quebec: 5% GST + 9.975% QST (filed separately)
- British Columbia: 5% GST + 7% PST (filed separately)

## Input Tax Credits (ITCs)
To claim ITCs, you must:
- Be a GST/HST registrant
- Have obtained the goods/services for commercial activity
- Have supporting documentation (invoices with supplier GST/HST number)

### Documentation Requirements
- Under $30: Description of goods/services, date, total amount
- $30 - $149.99: Above plus supplier name and GST/HST number
- $150+: All above plus buyer name, terms of payment, GST/HST separately stated

## Quick Method of Accounting
Available for eligible businesses with taxable supplies (including zero-rated) ≤ $400,000:
- Simplified method for calculating net tax
- Reduced remittance rates vary by province and type of business

## Filing Deadlines
- Annual filers: 3 months after fiscal year end
- Quarterly filers: 1 month after reporting period
- Monthly filers: 1 month after reporting period

## Penalties for Late Filing
- 1% of amount owing
- Plus 0.25% of amount owing for each complete month return is late (max 12 months)
- Total maximum: 4% of amount owing
`,
    keyPoints: [
      'Registration threshold: $30,000 in taxable supplies',
      'HST rates: 13% (ON), 15% (Atlantic provinces)',
      'ITCs require valid documentation with supplier GST/HST number',
      'Filing frequency based on taxable supplies volume',
      'Late filing penalty: 1% + 0.25%/month (max 4%)',
    ],
    keyPointsChinese: [
      '註冊門檻：應稅供應$30,000',
      'HST稅率：13%（安省）、15%（大西洋省份）',
      '進項稅抵扣需有供應商GST/HST號碼的有效文件',
      '申報頻率取決於應稅供應量',
      '逾期申報罰款：1% + 每月0.25%（最高4%）',
    ],
    relatedDocuments: ['ca-input-tax-credits', 'ca-corporate-tax-rates'],
    externalLinks: [
      { title: 'CRA GST/HST Guide', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses.html' },
    ],
    searchKeywords: ['GST', 'HST', 'registration', 'input tax credit', 'ITC', 'Canada tax', 'indirect tax', 'sales tax'],
  },
  {
    id: 'ca-corporate-tax-rates',
    title: 'Canadian Corporate Income Tax Rates 2024',
    titleChinese: '2024年加拿大公司所得稅率',
    region: 'CA',
    category: 'TAX',
    subcategory: 'Corporate Income Tax',
    authority: 'Canada Revenue Agency (CRA)',
    effectiveDate: '2024-01-01',
    lastUpdated: '2024-01-01',
    summary: 'Federal and provincial corporate income tax rates for Canadian corporations, including small business deduction eligibility.',
    summaryChinese: '加拿大公司的聯邦及省級公司所得稅率，包括小型企業扣除資格。',
    content: `
# Canadian Corporate Income Tax Rates 2024

## Federal Rates
- General rate: 15%
- Small business rate: 9% (on first $500,000 of active business income)
- Manufacturing and processing: 15%

## Combined Federal-Provincial Rates (General / Small Business)

| Province | General Rate | Small Business Rate |
|----------|-------------|-------------------|
| Alberta | 23% | 11% |
| British Columbia | 27% | 11% |
| Manitoba | 27% | 9% |
| New Brunswick | 29% | 11.5% |
| Newfoundland | 30% | 12% |
| Nova Scotia | 29% | 11.5% |
| Ontario | 26.5% | 12.2% |
| PEI | 31% | 11% |
| Quebec | 26.5% | 12.2% |
| Saskatchewan | 27% | 11% |

## Small Business Deduction (SBD) Eligibility
- Canadian-controlled private corporation (CCPC)
- Active business income
- Business limit: $500,000 (shared among associated corporations)
- Passive income grind: Business limit reduced when passive income > $50,000

## Important Deadlines
- T2 Return: 6 months after fiscal year end
- Balance Due: 2 months after year end (3 months for certain CCPCs)
- Instalments: Monthly (large corps) or quarterly

## Key Deductions
1. Capital Cost Allowance (CCA)
2. Scientific Research & Experimental Development (SR&ED) credits
3. Business meals & entertainment (50% deductible)
4. Home office expenses (proportional)
5. Bad debt reserves
`,
    keyPoints: [
      'Federal general rate: 15%, small business rate: 9%',
      'Small business deduction on first $500,000 active income',
      'Must be CCPC to qualify for small business rate',
      'T2 due 6 months after year end',
      'Passive income over $50,000 reduces business limit',
    ],
    relatedDocuments: ['ca-gst-hst-guide', 'ca-t2-filing'],
    searchKeywords: ['corporate tax', 'T2', 'small business deduction', 'SBD', 'CCPC', 'federal tax', 'provincial tax'],
  },
  {
    id: 'ca-payroll-deductions',
    title: 'Canadian Payroll Deductions Guide',
    titleChinese: '加拿大工資扣除指南',
    region: 'CA',
    category: 'PAYROLL',
    authority: 'Canada Revenue Agency (CRA)',
    effectiveDate: '2024-01-01',
    lastUpdated: '2024-01-01',
    summary: 'Guide to mandatory payroll deductions including CPP, EI, and income tax withholding for Canadian employers.',
    content: `
# Canadian Payroll Deductions 2024

## Canada Pension Plan (CPP)
- Employee contribution rate: 5.95%
- Maximum pensionable earnings: $68,500
- Basic exemption: $3,500
- Maximum employee contribution: $3,867.50
- Second CPP (CPP2) for earnings between $68,500 and $73,200: 4%

## Employment Insurance (EI)
- Employee rate: 1.63%
- Maximum insurable earnings: $63,200
- Maximum employee premium: $1,049.12
- Employer rate: 2.282% (1.4x employee rate)

## Income Tax Withholding
- Progressive rates based on province and income
- Federal rates: 15%, 20.5%, 26%, 29%, 33%
- Use CRA payroll deduction tables or PDOC calculator

## Remittance Deadlines
- Regular remitter (AMWA < $25,000): 15th of following month
- Quarterly remitter (AMWA < $3,000 and perfect compliance): 15th following quarter
- Threshold 1 (AMWA $25,000-$99,999): 25th of following month
- Threshold 2 (AMWA ≥ $100,000): Multiple payments per month

## Year-End Obligations
- T4 slips: Due by last day of February
- T4 Summary: Due by last day of February
- File electronically if >5 slips

AMWA = Average monthly withholding amount (2 years prior)
`,
    keyPoints: [
      'CPP rate: 5.95% (employee), max $3,867.50',
      'EI rate: 1.63% (employee), max $1,049.12',
      'Remittance deadline varies by AMWA',
      'T4 slips due by end of February',
      'New CPP2 contribution for earnings above $68,500',
    ],
    searchKeywords: ['payroll', 'CPP', 'EI', 'income tax', 'withholding', 'T4', 'remittance', 'deductions'],
  },
];

// =================================================================
// Hong Kong Regulations
// =================================================================

export const HONG_KONG_REGULATIONS: RagDocument[] = [
  {
    id: 'hk-profits-tax-guide',
    title: 'Hong Kong Profits Tax Guide',
    titleChinese: '香港利得稅指南',
    region: 'HK',
    category: 'TAX',
    subcategory: 'Profits Tax',
    authority: 'Inland Revenue Department (IRD)',
    effectiveDate: '2024-04-01',
    lastUpdated: '2024-04-01',
    summary: 'Comprehensive guide to Hong Kong profits tax, including two-tiered rates, deductions, and filing requirements.',
    summaryChinese: '香港利得稅全面指南，包括兩級稅率、扣除項目及申報要求。',
    content: `
# Hong Kong Profits Tax Guide 2024/25

## Tax Rates
### Corporations
- Two-tiered rates (applies to one entity per group):
  - First HKD 2,000,000: 8.25%
  - Above HKD 2,000,000: 16.5%
- Standard rate: 16.5%

### Unincorporated Businesses
- Two-tiered rates:
  - First HKD 2,000,000: 7.5%
  - Above HKD 2,000,000: 15%
- Standard rate: 15%

## Territorial Principle
Hong Kong operates on a territorial basis:
- Only profits arising in or derived from Hong Kong are taxable
- Source of profits determined by operations test
- Offshore claims require supporting documentation

## Key Deductions
1. **Depreciation Allowances**
   - Industrial buildings: 4% reducing balance
   - Commercial buildings: 4% reducing balance
   - Plant & machinery: 10-30% reducing balance
   - Computer hardware/software: 100% in first year

2. **Business Expenses**
   - Must be incurred in production of assessable profits
   - Revenue nature (not capital)
   - Wholly, exclusively and necessarily

3. **R&D Expenditure**
   - Type A (outsourced): 100%
   - Type B (in-house): 300% on first HKD 2M, 200% thereafter

## Non-Deductible Items
- Private or domestic expenses
- Capital expenditure (except allowances)
- Tax paid
- Provisions not based on legal obligation

## Filing Requirements
- Profits Tax Return: Usually issued April 1
- Filing deadline: 1 month from issue (extension available via tax representative)
- N Code returns: Extended to mid-November
- D Code returns: Extended to April of following year
- M Code returns: Extended to mid-January

## Provisional Profits Tax
- 75% of final tax for the year
- Payable in advance
- Can apply for holdover if profits expected to be lower

## Loss Relief
- Losses carried forward indefinitely
- No group relief available
- No loss carry-back
`,
    keyPoints: [
      'Two-tiered rate: 8.25% on first HKD 2M profits',
      'Standard rate: 16.5% for corporations',
      'Territorial principle: only HK-sourced profits taxable',
      'Losses can be carried forward indefinitely',
      'R&D deduction: 300% on first HKD 2M',
    ],
    keyPointsChinese: [
      '兩級稅率：首200萬利潤徵8.25%',
      '標準稅率：公司16.5%',
      '地域原則：只對香港來源利潤徵稅',
      '虧損可無限期結轉',
      '研發扣除：首200萬可扣300%',
    ],
    relatedDocuments: ['hk-audit-requirements', 'hk-deductible-expenses'],
    externalLinks: [
      { title: 'IRD Profits Tax Guide', url: 'https://www.ird.gov.hk/eng/pdf/pam44e.pdf' },
    ],
    searchKeywords: ['profits tax', 'Hong Kong tax', 'IRD', 'two-tiered', 'offshore', 'territorial'],
  },
  {
    id: 'hk-audit-requirements',
    title: 'Hong Kong Statutory Audit Requirements',
    titleChinese: '香港法定審計要求',
    region: 'HK',
    category: 'AUDIT',
    authority: 'Companies Registry / HKICPA',
    effectiveDate: '2023-01-01',
    lastUpdated: '2024-01-01',
    summary: 'Requirements for statutory audits of Hong Kong incorporated companies under the Companies Ordinance.',
    summaryChinese: '根據《公司條例》對香港註冊公司法定審計的要求。',
    content: `
# Hong Kong Statutory Audit Requirements

## Who Needs Audit
All Hong Kong incorporated companies must have annual audited financial statements, with limited exceptions:
- Dormant companies (specific criteria)
- Companies limited by guarantee (with conditions)

## Audit Exemptions
### Small Private Company Exemption
A private company qualifies as "small" if it meets 2 of 3 criteria:
- Revenue ≤ HKD 100 million
- Total assets ≤ HKD 100 million
- Employees ≤ 100

Small companies may prepare simplified reporting with:
- Directors' report exemption
- Simplified financial statements

Note: Tax audit/supporting schedules still required for IRD purposes.

## Auditor Requirements
- Must be a Certified Public Accountant (CPA)
- Registered with HKICPA
- Independent (not employee, director, or partner of director)

## Financial Statement Requirements
### Full Accounts (Cap. 622)
1. Statement of Financial Position
2. Statement of Profit or Loss and Other Comprehensive Income
3. Statement of Changes in Equity
4. Statement of Cash Flows
5. Notes to Financial Statements
6. Directors' Report

### Accounting Standards
- Hong Kong Financial Reporting Standards (HKFRS)
- HKFRS for Private Entities (SME option)
- Small and Medium-sized Entity Financial Reporting Framework (SME-FRF)

## Filing Deadlines
- First AGM: Within 18 months of incorporation
- Subsequent AGM: Within 9 months of financial year end
- Annual Return (NAR1): Within 42 days of anniversary

## Penalties
- Late filing: HKD 870 - HKD 8,700
- Non-compliance prosecution: Fine + potential disqualification
`,
    keyPoints: [
      'All HK companies require annual audit (limited exceptions)',
      'Small company threshold: Revenue or assets ≤ HKD 100M',
      'Auditor must be HKICPA registered CPA',
      'AGM within 9 months of year end',
      'NAR1 due within 42 days of anniversary',
    ],
    keyPointsChinese: [
      '所有香港公司需要年度審計（有限例外）',
      '小型公司門檻：收入或資產≤1億港元',
      '審計師必須是香港會計師公會註冊會計師',
      '周年大會需在年結後9個月內舉行',
      'NAR1需在周年日後42天內提交',
    ],
    relatedDocuments: ['hk-profits-tax-guide', 'hk-companies-ordinance'],
    searchKeywords: ['audit', 'statutory audit', 'HKICPA', 'Companies Ordinance', 'Cap 622', 'NAR1', 'AGM'],
  },
  {
    id: 'hk-mpf-guide',
    title: 'Mandatory Provident Fund (MPF) Employer Guide',
    titleChinese: '強制性公積金（強積金）僱主指南',
    region: 'HK',
    category: 'PAYROLL',
    authority: 'Mandatory Provident Fund Schemes Authority (MPFA)',
    effectiveDate: '2024-01-01',
    lastUpdated: '2024-01-01',
    summary: 'Employer obligations for MPF enrollment, contributions, and compliance in Hong Kong.',
    content: `
# MPF Employer Guide 2024

## Enrollment Requirements
- All employees aged 18-64 must be enrolled within 60 days of employment
- Exceptions: Domestic employees, self-employed, overseas persons

## Contribution Rates
- Employee: 5% of relevant income
- Employer: 5% of relevant income
- Minimum relevant income: HKD 7,100/month (no employee contribution below this)
- Maximum relevant income: HKD 30,000/month

## Monthly Contribution Caps
- Maximum contribution: HKD 1,500 each (employee and employer)
- Minimum employer contribution: HKD 355 (if income ≥ HKD 7,100)

## Contribution Day
- 10th day of following month
- If falls on public holiday/Saturday, next working day

## Record Keeping
- Keep enrollment and contribution records for 7 years
- Provide pay records showing MPF deductions

## Penalties
- Late enrollment: HKD 5,000 fine + HKD 500/day
- Late contribution: 5% surcharge on outstanding amount
- Non-compliance prosecution: Up to HKD 450,000 fine and 4 years imprisonment

## Offsetting Mechanism (2025 Changes)
- From 1 May 2025, new offsetting arrangement limits use of employer's MPF contributions for severance/long service payments
`,
    keyPoints: [
      'Both employer and employee contribute 5%',
      'Maximum monthly contribution: HKD 1,500 each',
      'Contribution deadline: 10th of following month',
      'Records must be kept for 7 years',
      'Major offsetting changes from May 2025',
    ],
    searchKeywords: ['MPF', 'provident fund', 'pension', 'employer contribution', 'payroll Hong Kong'],
  },
];

// =================================================================
// China Regulations
// =================================================================

export const CHINA_REGULATIONS: RagDocument[] = [
  {
    id: 'cn-vat-regulations',
    title: 'China VAT Regulations and Fapiao Requirements',
    titleChinese: '中国增值税法规及发票要求',
    region: 'CN',
    category: 'TAX',
    subcategory: 'VAT',
    authority: 'State Taxation Administration (STA)',
    effectiveDate: '2024-01-01',
    lastUpdated: '2024-06-01',
    summary: 'Comprehensive guide to China\'s VAT system, including rates, fapiao management, and input tax credit rules.',
    summaryChinese: '中国增值税体系全面指南，包括税率、发票管理及进项税抵扣规则。',
    content: `
# 中国增值税法规 2024

## 增值税税率
### 一般纳税人
- 13%：销售货物、提供加工修理修配劳务、进口货物
- 9%：交通运输、邮政、基础电信、建筑、不动产租赁、销售不动产、转让土地使用权、农产品等
- 6%：金融服务、现代服务、生活服务、增值电信服务、销售无形资产
- 0%：出口货物、境外提供服务

### 小规模纳税人
- 3%：一般应税行为（2024年暂减按1%）
- 5%：出租不动产

## 纳税人身份
### 一般纳税人
- 年应税销售额超过500万元
- 可自愿登记
- 可开具增值税专用发票
- 可抵扣进项税额

### 小规模纳税人
- 年应税销售额≤500万元
- 简易计税方法
- 通常开具普通发票

## 发票管理
### 发票类型
1. 增值税专用发票（专票）
   - 可抵扣进项税
   - 仅一般纳税人可开具
   
2. 增值税普通发票（普票）
   - 不可抵扣进项税
   - 一般和小规模纳税人均可开具

3. 电子发票
   - 全电发票逐步推广
   - 与纸质发票具有同等法律效力

### 发票开具要求
- 必须如实开具
- 项目齐全，与实际交易相符
- 字迹清楚，不得涂改
- 按规定时限开具

### 进项税抵扣
- 取得合规增值税专用发票
- 360天内完成认证（电子发票自动认证）
- 用于应税项目
- 不得抵扣：个人消费、免税项目、集体福利等

## 申报纳税
### 申报期限
- 一般纳税人：次月15日前
- 小规模纳税人：按季申报，季后15日内

### 所需资料
1. 增值税纳税申报表
2. 进项税额明细表
3. 销项税额明细表
4. 附表资料

## 优惠政策
- 小规模纳税人月销售额10万元以下免税
- 小微企业应纳税所得额优惠
- 高新技术企业优惠
- 研发费用加计扣除
`,
    keyPoints: [
      '一般纳税人标准税率：13%、9%、6%',
      '小规模纳税人税率：3%（暂减1%）',
      '年销售额超500万须登记为一般纳税人',
      '进项税抵扣需增值税专用发票',
      '申报期限：次月/季15日前',
    ],
    keyPointsChinese: [
      '一般纳税人标准税率：13%、9%、6%',
      '小规模纳税人税率：3%（暂减1%）',
      '年销售额超500万须登记为一般纳税人',
      '进项税抵扣需增值税专用发票',
      '申报期限：次月/季15日前',
    ],
    relatedDocuments: ['cn-golden-tax-guide', 'cn-cit-deductions'],
    searchKeywords: ['增值税', 'VAT', '发票', 'fapiao', '进项税', '销项税', '一般纳税人', '小规模纳税人'],
  },
  {
    id: 'cn-cit-deductions',
    title: 'China Corporate Income Tax Deductions',
    titleChinese: '中国企业所得税扣除项目',
    region: 'CN',
    category: 'TAX',
    subcategory: 'Corporate Income Tax',
    authority: 'State Taxation Administration (STA)',
    effectiveDate: '2024-01-01',
    lastUpdated: '2024-01-01',
    summary: 'Guide to allowable deductions and limits for China corporate income tax purposes.',
    content: `
# 中国企业所得税扣除项目

## 税率
- 标准税率：25%
- 小型微利企业：5%（应纳税所得额≤300万）
- 高新技术企业：15%
- 西部大开发：15%

## 准予扣除项目

### 工资薪金
- 实际支付的合理工资薪金全额扣除
- 需有完整的员工名册、劳动合同等

### 职工福利费
- 不超过工资薪金总额14%
- 包括：职工食堂、医疗补助、困难补助等

### 工会经费
- 不超过工资薪金总额2%
- 需取得工会经费收入专用收据

### 职工教育经费
- 不超过工资薪金总额8%
- 超支部分可结转以后年度扣除

### 业务招待费
- 发生额的60%准予扣除
- 但最高不超过当年销售收入的5‰

### 广告费和业务宣传费
- 不超过当年销售收入15%
- 化妆品、医药、饮料行业30%
- 超支部分可结转扣除

### 公益性捐赠
- 年度利润总额12%以内
- 扶贫捐赠全额扣除

### 研发费用加计扣除
- 一般企业：100%加计扣除
- 科技型中小企业：100%加计扣除
- 形成无形资产：按200%摊销

## 不得扣除项目
1. 向投资者支付的股息、红利
2. 企业所得税税款
3. 税收滞纳金
4. 罚金、罚款和被没收财物的损失
5. 赞助支出（非公益性）
6. 未经核定的准备金支出
7. 与取得收入无关的其他支出
`,
    keyPoints: [
      '标准税率25%，小微企业5%，高新企业15%',
      '福利费上限：工资14%',
      '业务招待费：发生额60%且不超销售收入5‰',
      '广告费上限：销售收入15%',
      '研发费用可100%加计扣除',
    ],
    searchKeywords: ['企业所得税', 'CIT', '税前扣除', '研发费用', '加计扣除', '小微企业'],
  },
  {
    id: 'cn-social-insurance',
    title: 'China Social Insurance Contribution Requirements',
    titleChinese: '中国社会保险缴费要求',
    region: 'CN',
    category: 'PAYROLL',
    authority: 'Ministry of Human Resources and Social Security',
    effectiveDate: '2024-01-01',
    lastUpdated: '2024-01-01',
    summary: 'Employer and employee social insurance contribution rates and requirements in China.',
    content: `
# 中国社会保险缴费（五险一金）

## 养老保险
- 单位缴费：16%
- 个人缴费：8%
- 缴费基数：当地社平工资60%-300%

## 医疗保险
- 单位缴费：8-10%（各地不同）
- 个人缴费：2%
- 大病医疗另计

## 失业保险
- 单位缴费：0.5-1%（各地不同）
- 个人缴费：0.3-0.5%

## 工伤保险
- 单位缴费：0.2-1.9%（按行业风险）
- 个人不缴费

## 生育保险
- 单位缴费：0.5-1%（已并入医疗保险）
- 个人不缴费

## 住房公积金
- 单位缴费：5-12%
- 个人缴费：5-12%
- 缴存比例单位与个人一致

## 缴费基数
- 下限：当地社平工资60%
- 上限：当地社平工资300%
- 按员工上年度月平均工资确定

## 申报期限
- 社保：每月申报
- 公积金：每月缴存
`,
    keyPoints: [
      '五险：养老16%+8%、医疗10%+2%、失业1%+0.5%、工伤0.2-1.9%、生育0.5-1%',
      '公积金：单位和个人各5-12%',
      '缴费基数：社平工资60%-300%',
      '每月申报缴纳',
    ],
    searchKeywords: ['社保', '五险一金', '养老保险', '医疗保险', '住房公积金', '社会保险'],
  },
];

// =================================================================
// India Regulations
// =================================================================

export const INDIA_REGULATIONS: RagDocument[] = [
  {
    id: 'in-gst-rules',
    title: 'India GST Rules and Compliance',
    titleChinese: '印度GST法規及合規要求',
    region: 'IN',
    category: 'TAX',
    subcategory: 'GST',
    authority: 'Central Board of Indirect Taxes and Customs (CBIC)',
    effectiveDate: '2024-04-01',
    lastUpdated: '2024-04-01',
    summary: 'Comprehensive guide to India\'s GST system, including registration, rates, and filing requirements.',
    content: `
# India GST Compliance Guide 2024-25

## GST Rate Structure
- 0%: Essential items, exports
- 5%: Common use items, basic necessities
- 12%: Standard goods
- 18%: Most services and goods (default rate)
- 28%: Luxury items, sin goods (plus compensation cess)

## GST Components
- CGST: Central Goods and Services Tax
- SGST: State Goods and Services Tax
- IGST: Integrated GST (inter-state)
- UTGST: Union Territory GST

### Application
- Intra-state: CGST + SGST (e.g., 9% + 9% = 18%)
- Inter-state: IGST (e.g., 18%)

## Registration Threshold
- General: ₹40 lakhs (₹20 lakhs for services/special category states)
- Voluntary registration allowed below threshold
- Mandatory for: E-commerce, inter-state supplies, casual taxable persons

## Key Returns
### GSTR-1 (Outward Supplies)
- Monthly: 11th of following month
- Quarterly (QRMP): 13th of month following quarter

### GSTR-3B (Summary Return)
- Monthly: 20th of following month
- Quarterly: 22nd/24th of month following quarter

### GSTR-9 (Annual Return)
- Due: 31st December of following FY
- Mandatory for turnover > ₹2 crores

### GSTR-9C (Reconciliation Statement)
- Due with GSTR-9
- Mandatory for turnover > ₹5 crores (must be certified by CA)

## Input Tax Credit (ITC)
### Conditions
1. Possession of tax invoice or debit note
2. Receipt of goods/services
3. Tax actually paid to government by supplier
4. Supplier has filed return and it appears in GSTR-2B
5. Return filed by recipient

### Blocked Credits
- Motor vehicles (except specified)
- Food and beverages, outdoor catering
- Membership of club, health and fitness
- Personal consumption
- Goods lost, stolen, destroyed, written off

## E-invoicing
- Mandatory for turnover > ₹5 crores
- Generate Invoice Reference Number (IRN) from IRP
- 24-hour deadline for reporting

## E-way Bill
- Required for movement of goods > ₹50,000
- Valid for varying distances
- Cancel within 24 hours if goods not moved
`,
    keyPoints: [
      'GST rates: 0%, 5%, 12%, 18%, 28%',
      'Registration threshold: ₹40 lakhs goods, ₹20 lakhs services',
      'GSTR-3B due: 20th of following month',
      'ITC requires invoice to appear in GSTR-2B',
      'E-invoicing mandatory for turnover > ₹5 crores',
    ],
    relatedDocuments: ['in-tds-rates', 'in-itr-guide'],
    searchKeywords: ['GST', 'India tax', 'GSTR', 'input tax credit', 'ITC', 'e-invoice', 'e-way bill'],
  },
  {
    id: 'in-tds-rates',
    title: 'India TDS Rates and Compliance',
    titleChinese: '印度TDS稅率及合規',
    region: 'IN',
    category: 'TAX',
    subcategory: 'TDS',
    authority: 'Income Tax Department',
    effectiveDate: '2024-04-01',
    lastUpdated: '2024-04-01',
    summary: 'Tax Deducted at Source (TDS) rates and compliance requirements for Indian businesses.',
    content: `
# India TDS Compliance Guide 2024-25

## Key TDS Rates

| Section | Nature of Payment | Threshold | Rate |
|---------|------------------|-----------|------|
| 192 | Salary | As per slab | Slab rates |
| 194A | Interest (banks) | ₹40,000 | 10% |
| 194A | Interest (others) | ₹5,000 | 10% |
| 194C | Contractors (individual) | ₹30,000/₹1L | 1% |
| 194C | Contractors (others) | ₹30,000/₹1L | 2% |
| 194H | Commission/Brokerage | ₹15,000 | 5% |
| 194I | Rent - Land/Building | ₹2.4L p.a. | 10% |
| 194I | Rent - P&M | ₹2.4L p.a. | 2% |
| 194J | Professional fees | ₹30,000 | 10% |
| 194J | Technical services | ₹30,000 | 2% |
| 194Q | Purchase of goods | ₹50L | 0.1% |

## Higher Rate without PAN
- 20% or prescribed rate, whichever is higher
- Verify PAN through Income Tax portal

## TDS Deposit Due Dates
- Government deductors: Same day
- Non-government: 7th of following month
- March: 30th April

## TDS Return Filing

| Form | Particulars | Due Date |
|------|-------------|----------|
| 24Q | Salary | Quarterly (31st of following month) |
| 26Q | Non-salary | Quarterly (31st of following month) |
| 27Q | Non-resident | Quarterly (31st of following month) |
| 27EQ | TCS | Quarterly (15th of following month) |

## TDS Certificates
- Form 16: Salary (by 15th June)
- Form 16A: Non-salary (within 15 days from return due)

## Penalties
- Late filing: ₹200/day (max: TDS amount)
- Late deposit: 1.5% per month
- Short deduction: Disallowance of expense + penalty
`,
    keyPoints: [
      'Professional fees TDS: 10%, Contractors: 1-2%',
      'TDS deposit due: 7th of following month',
      'Quarterly returns: 24Q (salary), 26Q (non-salary)',
      'Form 16 due: 15th June',
      'Higher TDS rate without PAN: 20%',
    ],
    searchKeywords: ['TDS', 'tax deducted at source', 'withholding tax', 'Form 16', '26Q', '24Q', 'PAN'],
  },
  {
    id: 'in-corporate-tax-rates',
    title: 'India Corporate Tax Rates 2024-25',
    titleChinese: '印度公司稅率 2024-25',
    region: 'IN',
    category: 'TAX',
    subcategory: 'Corporate Tax',
    authority: 'Income Tax Department',
    effectiveDate: '2024-04-01',
    lastUpdated: '2024-04-01',
    summary: 'Corporate income tax rates and special provisions for Indian companies.',
    content: `
# India Corporate Tax Rates FY 2024-25

## Domestic Companies

### Standard Rates
- Normal rate: 30% + surcharge + cess
- Turnover ≤ ₹400 crores (in FY 2020-21): 25% + surcharge + cess

### Section 115BAA (New Tax Regime)
- Tax rate: 22%
- Effective rate: ~25.17% (including surcharge and cess)
- Must forego: Deductions under Chapter VI-A, additional depreciation, etc.

### Section 115BAB (Manufacturing Companies)
- For new manufacturing companies incorporated after October 1, 2019
- Tax rate: 15%
- Effective rate: ~17.16%
- Must commence manufacturing by March 31, 2024

## Surcharge Rates
| Income Range | Rate |
|--------------|------|
| > ₹1 crore | 7% |
| > ₹10 crores | 12% |
| Section 115BAA/BAB | 10% |

## Health and Education Cess
- 4% on tax + surcharge

## Minimum Alternate Tax (MAT)
- Rate: 15% on book profits
- Not applicable if opting for 115BAA/115BAB
- MAT credit can be carried forward 15 years

## Key Deadlines
- Advance tax: 15th June/Sept/Dec/March
- ITR filing: 31st October (audit cases)
- ITR filing: 30th November (transfer pricing)
- Tax audit report: 30th September

## Advance Tax Schedule
| Due Date | Minimum % |
|----------|-----------|
| 15 June | 15% |
| 15 September | 45% |
| 15 December | 75% |
| 15 March | 100% |
`,
    keyPoints: [
      'Standard rate: 30% (25% if turnover ≤ ₹400 crores)',
      'Section 115BAA option: 22% (effective ~25.17%)',
      'New manufacturing (115BAB): 15% (effective ~17.16%)',
      'Health & Education Cess: 4%',
      'MAT rate: 15% on book profits',
    ],
    searchKeywords: ['corporate tax', 'income tax', 'Section 115BAA', 'Section 115BAB', 'MAT', 'advance tax'],
  },
];

// =================================================================
// Export All Regulations
// =================================================================

export const ALL_REGULATIONS: RagDocument[] = [
  ...CANADA_REGULATIONS,
  ...HONG_KONG_REGULATIONS,
  ...CHINA_REGULATIONS,
  ...INDIA_REGULATIONS,
];

export const REGULATIONS_BY_REGION: Record<RegionCode, RagDocument[]> = {
  CA: CANADA_REGULATIONS,
  HK: HONG_KONG_REGULATIONS,
  CN: CHINA_REGULATIONS,
  IN: INDIA_REGULATIONS,
};

// =================================================================
// RAG Helper Functions
// =================================================================

export function searchRegulations(
  query: string,
  region?: RegionCode,
  category?: RagDocument['category']
): RagDocument[] {
  const searchLower = query.toLowerCase();
  
  let docs = ALL_REGULATIONS;
  
  if (region) {
    docs = docs.filter(d => d.region === region || d.region === 'GLOBAL');
  }
  
  if (category) {
    docs = docs.filter(d => d.category === category);
  }
  
  return docs.filter(doc => 
    doc.searchKeywords.some(kw => kw.toLowerCase().includes(searchLower)) ||
    doc.title.toLowerCase().includes(searchLower) ||
    doc.summary.toLowerCase().includes(searchLower) ||
    doc.content.toLowerCase().includes(searchLower) ||
    (doc.titleChinese?.includes(query)) ||
    (doc.summaryChinese?.includes(query))
  );
}

export function getRegulationById(id: string): RagDocument | undefined {
  return ALL_REGULATIONS.find(doc => doc.id === id);
}

export function getRegulationsByCategory(category: RagDocument['category']): RagDocument[] {
  return ALL_REGULATIONS.filter(doc => doc.category === category);
}

export function getKeyPointsForRegion(region: RegionCode): string[] {
  const docs = REGULATIONS_BY_REGION[region];
  return docs.flatMap(doc => doc.keyPoints);
}

export function buildRAGContext(query: string, region?: RegionCode): string {
  const relevantDocs = searchRegulations(query, region);
  
  if (relevantDocs.length === 0) {
    return 'No relevant regulatory information found.';
  }
  
  const context = relevantDocs.slice(0, 3).map(doc => `
## ${doc.title}
${doc.titleChinese ? `(${doc.titleChinese})` : ''}

**Authority:** ${doc.authority}
**Last Updated:** ${doc.lastUpdated}

### Summary
${doc.summary}

### Key Points
${doc.keyPoints.map(p => `- ${p}`).join('\n')}

### Details
${doc.content.slice(0, 2000)}...
`).join('\n---\n');
  
  return context;
}

export default {
  ALL_REGULATIONS,
  REGULATIONS_BY_REGION,
  searchRegulations,
  getRegulationById,
  getRegulationsByCategory,
  getKeyPointsForRegion,
  buildRAGContext,
};
