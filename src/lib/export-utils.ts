/**
 * PDF 和 Excel 生成工具
 * 用於發票、報表等文件的匯出功能
 */

// ========================================
// 類型定義
// ========================================

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  client: string;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  amount: number;
  tax?: number;
  discount?: number;
  issueDate: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
  items?: InvoiceItem[];
  notes?: string;
  companyName?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  currency?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface ReportData {
  title: string;
  subtitle?: string;
  date: string;
  columns: string[];
  rows: (string | number)[][];
  summary?: { label: string; value: string | number }[];
}

// ========================================
// 格式化工具
// ========================================

export function formatCurrency(amount: number, currency: string = 'TWD'): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string, locale: string = 'zh-TW'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ========================================
// CSV/Excel 匯出
// ========================================

/**
 * 將資料匯出為 CSV 檔案
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
): void {
  if (data.length === 0) {
    // eslint-disable-next-line no-console
    console.warn('No data to export');
    return;
  }

  // 確定欄位
  const headers = columns 
    ? columns.map(c => c.header)
    : Object.keys(data[0]);
  
  const keys = columns 
    ? columns.map(c => c.key)
    : Object.keys(data[0]) as (keyof T)[];

  // 建立 CSV 內容
  const csvContent = [
    // BOM for UTF-8
    '\uFEFF',
    // 標題列
    headers.join(','),
    // 資料列
    ...data.map(row => 
      keys.map(key => {
        const value = row[key];
        // 處理包含逗號或換行的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // 下載檔案
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8');
}

/**
 * 將發票列表匯出為 Excel (CSV 格式)
 */
export function exportInvoicesToExcel(invoices: InvoiceData[], filename: string = 'invoices'): void {
  const columns: { key: keyof InvoiceData; header: string }[] = [
    { key: 'invoiceNumber', header: '發票編號' },
    { key: 'client', header: '客戶名稱' },
    { key: 'clientEmail', header: '客戶Email' },
    { key: 'amount', header: '金額' },
    { key: 'tax', header: '稅額' },
    { key: 'issueDate', header: '開立日期' },
    { key: 'dueDate', header: '到期日期' },
    { key: 'status', header: '狀態' },
    { key: 'notes', header: '備註' },
  ];

  exportToCSV(invoices, filename, columns);
}

/**
 * 將報表資料匯出為 Excel (CSV 格式)
 */
export function exportReportToExcel(report: ReportData, filename: string): void {
  const csvContent = [
    '\uFEFF',
    // 標題
    report.title,
    report.subtitle || '',
    `日期: ${report.date}`,
    '',
    // 欄位標題
    report.columns.join(','),
    // 資料列
    ...report.rows.map(row => row.join(',')),
    '',
    // 摘要
    ...(report.summary || []).map(s => `${s.label},${s.value}`),
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8');
}

// ========================================
// PDF 生成 (使用瀏覽器列印)
// ========================================

/**
 * 生成發票 PDF HTML 內容
 */
export function generateInvoiceHTML(invoice: InvoiceData): string {
  const subtotal = invoice.items?.reduce((sum, item) => sum + item.amount, 0) || invoice.amount;
  const tax = invoice.tax || 0;
  const discount = invoice.discount || 0;
  const total = subtotal + tax - discount;
  const currency = invoice.currency || 'TWD';

  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>發票 ${invoice.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Microsoft JhengHei', 'Noto Sans TC', sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      background: #fff;
      padding: 40px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    .company-info h1 {
      font-size: 24px;
      color: #2563eb;
      margin-bottom: 8px;
    }
    .company-info p {
      color: #666;
      font-size: 11px;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h2 {
      font-size: 32px;
      color: #2563eb;
      margin-bottom: 8px;
    }
    .invoice-title .invoice-number {
      font-size: 14px;
      color: #666;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: bold;
      margin-top: 8px;
    }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-pending { background: #fef9c3; color: #854d0e; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    .status-draft { background: #f3f4f6; color: #374151; }
    
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .info-box {
      width: 48%;
    }
    .info-box h3 {
      font-size: 11px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }
    .info-box p {
      font-size: 13px;
      margin-bottom: 4px;
    }
    .info-box .name {
      font-weight: bold;
      font-size: 14px;
      color: #111;
    }
    
    .dates-section {
      display: flex;
      gap: 40px;
      margin-bottom: 30px;
      padding: 15px 20px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .date-item label {
      font-size: 10px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .date-item p {
      font-size: 14px;
      font-weight: 600;
      color: #111;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background: #2563eb;
      color: white;
      padding: 12px 16px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    th:last-child, td:last-child {
      text-align: right;
    }
    td {
      padding: 14px 16px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:nth-child(even) {
      background: #f9fafb;
    }
    
    .totals {
      margin-left: auto;
      width: 300px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .totals-row.grand-total {
      border-bottom: none;
      border-top: 2px solid #2563eb;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 16px;
      font-weight: bold;
      color: #2563eb;
    }
    
    .notes {
      margin-top: 40px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    .notes h4 {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }
    .notes p {
      font-size: 12px;
      color: #333;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 10px;
    }
    
    @media print {
      body { padding: 20px; }
      .invoice-container { max-width: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="company-info">
        <h1>${invoice.companyName || 'Wisematic ERP'}</h1>
        <p>${invoice.companyAddress || '台北市信義區信義路五段7號'}</p>
        <p>電話: ${invoice.companyPhone || '+886-2-1234-5678'}</p>
        <p>Email: ${invoice.companyEmail || 'contact@wisematic.ca'}</p>
      </div>
      <div class="invoice-title">
        <h2>發票</h2>
        <p class="invoice-number">${invoice.invoiceNumber}</p>
        <span class="status-badge status-${invoice.status.toLowerCase()}">${getStatusLabel(invoice.status)}</span>
      </div>
    </div>
    
    <div class="info-section">
      <div class="info-box">
        <h3>客戶資訊</h3>
        <p class="name">${invoice.client}</p>
        ${invoice.clientAddress ? `<p>${invoice.clientAddress}</p>` : ''}
        ${invoice.clientPhone ? `<p>電話: ${invoice.clientPhone}</p>` : ''}
        ${invoice.clientEmail ? `<p>Email: ${invoice.clientEmail}</p>` : ''}
      </div>
      <div class="info-box">
        <h3>付款資訊</h3>
        <p>銀行: 台灣銀行</p>
        <p>帳號: 1234-5678-9012-3456</p>
        <p>戶名: Wisematic Ltd.</p>
      </div>
    </div>
    
    <div class="dates-section">
      <div class="date-item">
        <label>開立日期</label>
        <p>${formatDate(invoice.issueDate)}</p>
      </div>
      <div class="date-item">
        <label>到期日期</label>
        <p>${formatDate(invoice.dueDate)}</p>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>項目說明</th>
          <th>數量</th>
          <th>單價</th>
          <th>金額</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items && invoice.items.length > 0 
          ? invoice.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.unitPrice, currency)}</td>
              <td>${formatCurrency(item.amount, currency)}</td>
            </tr>
          `).join('')
          : `
            <tr>
              <td>專業服務費用</td>
              <td>1</td>
              <td>${formatCurrency(invoice.amount, currency)}</td>
              <td>${formatCurrency(invoice.amount, currency)}</td>
            </tr>
          `
        }
      </tbody>
    </table>
    
    <div class="totals">
      <div class="totals-row">
        <span>小計</span>
        <span>${formatCurrency(subtotal, currency)}</span>
      </div>
      ${tax > 0 ? `
        <div class="totals-row">
          <span>稅額 (5%)</span>
          <span>${formatCurrency(tax, currency)}</span>
        </div>
      ` : ''}
      ${discount > 0 ? `
        <div class="totals-row">
          <span>折扣</span>
          <span>-${formatCurrency(discount, currency)}</span>
        </div>
      ` : ''}
      <div class="totals-row grand-total">
        <span>總計</span>
        <span>${formatCurrency(total, currency)}</span>
      </div>
    </div>
    
    ${invoice.notes ? `
      <div class="notes">
        <h4>備註</h4>
        <p>${invoice.notes}</p>
      </div>
    ` : ''}
    
    <div class="footer">
      <p>感謝您的惠顧！如有任何問題，請與我們聯繫。</p>
      <p>此發票由 Wisematic ERP 系統自動生成</p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * 生成報表 PDF HTML 內容
 */
export function generateReportHTML(report: ReportData): string {
  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Microsoft JhengHei', 'Noto Sans TC', sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      background: #fff;
      padding: 40px;
    }
    .report-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    .header h1 {
      font-size: 28px;
      color: #2563eb;
      margin-bottom: 8px;
    }
    .header h2 {
      font-size: 16px;
      color: #666;
      font-weight: normal;
    }
    .header .date {
      margin-top: 12px;
      font-size: 12px;
      color: #888;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background: #2563eb;
      color: white;
      padding: 12px 16px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
    }
    td {
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:nth-child(even) {
      background: #f9fafb;
    }
    
    .summary {
      margin-top: 30px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .summary h3 {
      font-size: 14px;
      color: #333;
      margin-bottom: 16px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .summary-row:last-child {
      border-bottom: none;
      font-weight: bold;
      color: #2563eb;
    }
    
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #888;
      font-size: 10px;
    }
    
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <h1>${report.title}</h1>
      ${report.subtitle ? `<h2>${report.subtitle}</h2>` : ''}
      <p class="date">報表日期: ${report.date}</p>
    </div>
    
    <table>
      <thead>
        <tr>
          ${report.columns.map(col => `<th>${col}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${report.rows.map(row => `
          <tr>
            ${row.map(cell => `<td>${cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    ${report.summary && report.summary.length > 0 ? `
      <div class="summary">
        <h3>摘要</h3>
        ${report.summary.map(item => `
          <div class="summary-row">
            <span>${item.label}</span>
            <span>${item.value}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    <div class="footer">
      <p>此報表由 Wisematic ERP 系統自動生成 - ${new Date().toLocaleString('zh-TW')}</p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * 列印/下載 PDF (使用瀏覽器列印功能)
 */
export function printToPDF(htmlContent: string, title: string = 'Document'): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // eslint-disable-next-line no-console
    console.error('無法開啟列印視窗，請檢查彈出視窗阻擋設定');
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.document.title = title;
  
  // 等待內容載入後列印
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

/**
 * 下載發票 PDF
 */
export function downloadInvoicePDF(invoice: InvoiceData): void {
  const html = generateInvoiceHTML(invoice);
  printToPDF(html, `Invoice_${invoice.invoiceNumber}`);
}

/**
 * 下載報表 PDF
 */
export function downloadReportPDF(report: ReportData): void {
  const html = generateReportHTML(report);
  printToPDF(html, report.title);
}

// ========================================
// 輔助函數
// ========================================

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    Paid: '已付款',
    Pending: '待付款',
    Overdue: '逾期',
    Draft: '草稿',
  };
  return labels[status] || status;
}
