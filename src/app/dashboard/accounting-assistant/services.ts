/**
 * Accounting Assistant Services
 * 會計助手服務
 */

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/api/v1`;

// Types
export interface Receipt {
  id: string;
  status: string;
  uploaded_by: string;
  uploaded_by_name?: string;
  image?: string;
  original_filename?: string;
  vendor_name?: string;
  vendor_address?: string;
  vendor_phone?: string;
  vendor_tax_id?: string;
  receipt_number?: string;
  receipt_date?: string;
  receipt_time?: string;
  currency: string;
  subtotal?: number;
  tax_amount?: number;
  tax_rate?: number;
  discount_amount?: number;
  total_amount?: number;
  payment_method?: string;
  category?: string;
  description?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
  ai_confidence_score?: number;
  ai_suggestions?: Array<any>;
  ai_warnings?: string[];
  detected_language?: string;
  journal_entry_data?: any;
  notes?: string;
  reviewed_by?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProcessingResult {
  receipt_id: string;
  status: string;
  receipt?: Receipt;
  processing_result?: {
    status: string;
    steps: string[];
    receipt_data?: any;
    categorization?: any;
    journal_entry?: any;
    ai_suggestions?: any;
    error?: string;
  };
  error?: string;
}

export interface ReceiptComparison {
  id: string;
  created_by: string;
  created_by_name?: string;
  excel_file?: string;
  excel_filename?: string;
  total_excel_records: number;
  total_db_records: number;
  matched_count: number;
  missing_in_db_count: number;
  missing_in_excel_count: number;
  amount_mismatch_count: number;
  comparison_details?: any;
  ai_analysis?: any;
  status: string;
  health_score: number;
  created_at: string;
}

export interface ComparisonResult {
  comparison_id: string;
  summary: {
    total_excel_records: number;
    total_db_records: number;
    matched_count: number;
    missing_in_db_count: number;
    missing_in_excel_count: number;
    amount_mismatch_count: number;
    differences?: any;
  };
  ai_analysis?: any;
  comparison?: ReceiptComparison;
}

export interface ExpenseReport {
  id: string;
  report_number: string;
  title: string;
  created_by: string;
  created_by_name?: string;
  period_start: string;
  period_end: string;
  total_amount: number;
  total_tax: number;
  total_count: number;
  receipt_count?: number;
  excel_file?: string;
  pdf_file?: string;
  status: string;
  submitted_at?: string;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  approval_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  total_receipts: number;
  total_amount: number;
  status_breakdown: Record<string, number>;
  category_breakdown: Record<string, number>;
  recent_30_days: number;
  pending_approval: number;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

/**
 * Upload and analyze a receipt
 * 上傳並分析收據
 */
export async function uploadReceipt(
  file: File,
  language: string = 'auto',
  autoCategorize: boolean = true,
  autoJournal: boolean = false
): Promise<ProcessingResult> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('language', language);
  formData.append('auto_categorize', String(autoCategorize));
  formData.append('auto_journal', String(autoJournal));

  const response = await fetch(`${API_BASE_URL}/accounting-assistant/upload/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}

/**
 * Batch upload multiple receipts
 * 批量上傳多張收據
 */
export interface BatchUploadResult {
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    filename: string;
    status: 'success' | 'error';
    receipt_id?: string;
    error?: string;
  }>;
}

export async function uploadReceiptsBatch(
  files: File[],
  language: string = 'auto',
  autoCategorize: boolean = true,
  autoJournal: boolean = false,
  onProgress?: (completed: number, total: number, currentFile: string) => void
): Promise<BatchUploadResult> {
  const results: BatchUploadResult = {
    total: files.length,
    successful: 0,
    failed: 0,
    results: [],
  };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i, files.length, file.name);

    try {
      const result = await uploadReceipt(file, language, autoCategorize, autoJournal);
      results.successful++;
      results.results.push({
        filename: file.name,
        status: 'success',
        receipt_id: result.receipt_id,
      });
    } catch (error: any) {
      results.failed++;
      results.results.push({
        filename: file.name,
        status: 'error',
        error: error.message || 'Upload failed',
      });
    }
  }

  onProgress?.(files.length, files.length, 'Complete');
  return results;
}

/**
 * Get all receipts
 * 獲取所有收據
 */
export async function getReceipts(filters?: {
  status?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
}): Promise<{ count: number; results: Receipt[] }> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);

  const url = `${API_BASE_URL}/accounting-assistant/receipts/${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch receipts');
  }

  return response.json();
}

/**
 * Get receipt detail
 * 獲取收據詳情
 */
export async function getReceiptDetail(receiptId: string): Promise<Receipt> {
  const response = await fetch(`${API_BASE_URL}/accounting-assistant/receipts/${receiptId}/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch receipt detail');
  }

  return response.json();
}

/**
 * Update receipt
 * 更新收據
 */
export async function updateReceipt(receiptId: string, data: Partial<Receipt>): Promise<Receipt> {
  const response = await fetch(`${API_BASE_URL}/accounting-assistant/receipts/${receiptId}/`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update receipt');
  }

  return response.json();
}

/**
 * Approve receipt
 * 核准收據
 */
export async function approveReceipt(receiptId: string, notes?: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/accounting-assistant/receipts/${receiptId}/approve/`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notes }),
  });

  if (!response.ok) {
    throw new Error('Failed to approve receipt');
  }

  return response.json();
}

/**
 * Create journal entry from receipt
 * 從收據建立會計分錄
 */
export async function createJournalEntry(receiptId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/accounting-assistant/receipts/${receiptId}/create-journal/`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create journal entry');
  }

  return response.json();
}

/**
 * Get AI review for receipt
 * 獲取收據的AI審核
 */
export async function getAiReview(receiptId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/accounting-assistant/receipts/${receiptId}/ai-review/`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get AI review');
  }

  return response.json();
}

/**
 * Compare Excel with database
 * 比對 Excel 和資料庫
 */
export async function compareExcel(
  file: File,
  dateFrom?: string,
  dateTo?: string
): Promise<ComparisonResult> {
  const formData = new FormData();
  formData.append('excel_file', file);
  if (dateFrom) formData.append('date_from', dateFrom);
  if (dateTo) formData.append('date_to', dateTo);

  const response = await fetch(`${API_BASE_URL}/accounting-assistant/compare/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Comparison failed');
  }

  return response.json();
}

/**
 * Get comparison history
 * 獲取比對歷史
 */
export async function getComparisons(): Promise<{ count: number; results: ReceiptComparison[] }> {
  const response = await fetch(`${API_BASE_URL}/accounting-assistant/comparisons/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch comparisons');
  }

  return response.json();
}

/**
 * Create expense report
 * 建立費用報表
 */
export async function createReport(
  title: string,
  periodStart: string,
  periodEnd: string,
  includeAll: boolean = true,
  receiptIds?: string[]
): Promise<{ report: ExpenseReport; receipts_included: number }> {
  const response = await fetch(`${API_BASE_URL}/accounting-assistant/reports/create/`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      period_start: periodStart,
      period_end: periodEnd,
      include_all: includeAll,
      receipt_ids: receiptIds,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Report creation failed');
  }

  return response.json();
}

/**
 * Get all reports
 * 獲取所有報表
 */
export async function getReports(): Promise<{ count: number; results: ExpenseReport[] }> {
  const response = await fetch(`${API_BASE_URL}/accounting-assistant/reports/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }

  return response.json();
}

/**
 * Download report Excel
 * 下載報表 Excel
 */
export async function downloadReport(reportId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/accounting-assistant/reports/${reportId}/download/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to download report');
  }

  return response.blob();
}

/**
 * Approve expense report
 * 核准費用報表
 */
export async function approveReport(reportId: string, notes?: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/accounting-assistant/reports/${reportId}/approve/`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notes }),
  });

  if (!response.ok) {
    throw new Error('Failed to approve report');
  }

  return response.json();
}

/**
 * AI query about accounting
 * AI 會計查詢
 */
export async function aiQuery(
  query: string,
  receiptId?: string
): Promise<{
  answer: { en: string; zh: string } | string;
  advice?: { en: string; zh: string };
  suggestions?: Array<{ title: string; description: string }>;
}> {
  const response = await fetch(`${API_BASE_URL}/accounting-assistant/ai-query/`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      receipt_id: receiptId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'AI query failed');
  }

  return response.json();
}

/**
 * Get accounting statistics
 * 獲取會計統計數據
 */
export async function getStats(): Promise<Stats> {
  const response = await fetch(`${API_BASE_URL}/accounting-assistant/stats/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }

  return response.json();
}
