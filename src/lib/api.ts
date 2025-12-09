/**
 * API Service - 統一的後端 API 調用服務
 * 連接 Django 後端
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
  params?: Record<string, any>;
}

class ApiService {
  private _baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl;
    // 從 localStorage 恢復 tokens (支援兩種 key 名稱)
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('token') || localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  // 獲取 base URL
  get baseUrl(): string {
    return this._baseUrl;
  }

  // 設置認證 tokens
  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', access);
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  // 清除認證 tokens
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  // 檢查是否已登入
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // 獲取當前 access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // 刷新 access token
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      // eslint-disable-next-line no-console
      console.warn('[API] No refresh token available');
      return false;
    }

    try {
      // eslint-disable-next-line no-console
      console.log('[API] Attempting to refresh token...');
      const response = await fetch(`${this.baseUrl}/api/v1/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access;
        if (typeof window !== 'undefined') {
          // 同步更新所有 token key
          localStorage.setItem('token', data.access);
          localStorage.setItem('access_token', data.access);
        }
        // eslint-disable-next-line no-console
        console.log('[API] Token refreshed successfully');
        return true;
      }
      
      // Refresh token 也過期了，清除所有 token
      // eslint-disable-next-line no-console
      console.warn('[API] Refresh token expired or invalid');
      this.clearTokens();
      return false;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[API] Token refresh error:', error);
      return false;
    }
  }

  // 通用請求方法
  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { skipAuth = false, params, ...fetchOptions } = options;
    
    // 每次請求時重新讀取 token (確保獲取最新的)
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('token') || localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    // 添加認證 header
    if (!skipAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    // Build URL with query parameters
    let url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    
    let response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // 如果 401，嘗試刷新 token
    if (response.status === 401 && !skipAuth) {
      if (this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          response = await fetch(url, {
            ...fetchOptions,
            headers,
          });
        } else {
          // Refresh 失敗，拋出認證錯誤
          throw new Error('Authentication expired. Please log in again.');
        }
      } else {
        // 沒有 refresh token
        throw new Error('Authentication required. Please log in.');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || error.message || 'API request failed');
    }

    return response.json();
  }

  // GET 請求
  async get<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  // POST 請求
  async post<T>(endpoint: string, data?: unknown, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT 請求
  async put<T>(endpoint: string, data?: unknown, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH 請求
  async patch<T>(endpoint: string, data?: unknown, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE 請求
  async delete<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // 上傳文件
  async upload<T>(endpoint: string, formData: FormData, options?: ApiOptions): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options || {};
    
    const headers: Record<string, string> = {};
    
    if (!skipAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  }
}

// 創建單例
export const api = new ApiService(API_BASE_URL);

// =================================================================
// 認證 API
// =================================================================
export const authApi = {
  // 登入
  login: async (email: string, password: string) => {
    const response = await api.post<{ access: string; refresh: string }>(
      '/api/v1/auth/token/',
      { email, password },
      { skipAuth: true }
    );
    api.setTokens(response.access, response.refresh);
    return response;
  },

  // 登出
  logout: () => {
    api.clearTokens();
  },

  // 註冊
  register: async (data: { email: string; password: string; full_name: string }) => {
    return api.post('/api/v1/users/register/', data, { skipAuth: true });
  },

  // Google OAuth URL
  getGoogleAuthUrl: async () => {
    return api.get<{ auth_url: string }>('/api/v1/auth/google/url/', { skipAuth: true });
  },

  // Google OAuth 回調處理
  googleCallback: async (code: string, state?: string) => {
    const response = await api.post<{ access: string; refresh: string }>(
      '/api/v1/auth/google/callback/',
      { code, state },
      { skipAuth: true }
    );
    api.setTokens(response.access, response.refresh);
    return response;
  },

  // 獲取當前用戶
  getCurrentUser: async () => {
    return api.get('/api/v1/users/me/');
  },

  // 檢查是否登入
  isAuthenticated: () => api.isAuthenticated(),
};

// =================================================================
// AI 服務 API
// =================================================================
export const aiApi = {
  // 聊天 (使用 RAG chat 端點) - 需要認證
  chat: async (message: string, provider: string = 'openai', options?: {
    model?: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    category?: string;
  }) => {
    // 優先使用 RAG chat 端點
    return api.post<{ response: string; sources: string[]; provider: string }>(
      '/api/v1/rag/chat/',
      {
        query: message,
        provider,
        category: options?.category,
      }
    ).then(res => ({
      content: res.response,
      provider: res.provider,
      model: provider,
      sources: res.sources,
    }));
  },

  // 帶歷史的聊天 (使用 RAG chat 端點) - 需要認證
  chatWithHistory: async (
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    provider: string = 'openai',
    options?: {
      model?: string;
      systemPrompt?: string;
      category?: string;
    }
  ) => {
    // 取得最後一條用戶消息作為查詢
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const query = lastUserMessage?.content || '';
    
    // 將歷史記錄合併為上下文
    const historyContext = messages
      .slice(0, -1) // 排除最後一條消息
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');
    
    const fullQuery = historyContext 
      ? `Previous conversation:\n${historyContext}\n\nCurrent question: ${query}`
      : query;

    return api.post<{ response: string; sources: string[]; provider: string }>(
      '/api/v1/rag/chat/',
      {
        query: fullQuery,
        provider,
        category: options?.category,
        system_prompt: options?.systemPrompt,
      }
    ).then(res => ({
      content: res.response,
      provider: res.provider,
      model: provider,
      sources: res.sources,
    }));
  },

  // 簡單查詢 RAG 知識庫 (不需要登入)
  queryKnowledge: async (query: string, category?: string) => {
    return api.post<{
      results: Array<{ id: string; title: string; content: string; category: string }>;
      context?: string;
    }>('/api/v1/rag/query/', {
      query,
      category,
      include_context: true,
    }, { skipAuth: true });
  },

  // 圖片分析
  analyzeImage: async (imageBase64: string, prompt: string, provider: string = 'gemini') => {
    return api.post<{ content: string }>(
      '/api/v1/ai-service/analyze-image/',
      { image: imageBase64, prompt, provider }
    );
  },

  // 獲取可用供應商
  getProviders: async () => {
    return api.get<{ providers: Array<{ name: string; display_name: string; is_configured: boolean; default_model: string }> }>(
      '/api/v1/ai-service/providers/'
    );
  },

  // 獲取模型列表
  getModels: async (provider: string) => {
    return api.get<{ models: Array<{ name: string; description: string }> }>(
      `/api/v1/ai-service/models/?provider=${provider}`
    );
  },
};

// =================================================================
// 會計 API
// =================================================================
export const accountingApi = {
  // 科目表
  getAccounts: () => api.get('/api/v1/accounting/accounts/'),
  getChartOfAccounts: () => api.get('/api/v1/accounting/accounts/chart_of_accounts/'),
  createAccount: (data: object) => api.post('/api/v1/accounting/accounts/', data),
  updateAccount: (id: number, data: object) => api.patch(`/api/v1/accounting/accounts/${id}/`, data),
  deleteAccount: (id: number) => api.delete(`/api/v1/accounting/accounts/${id}/`),
  
  // 日記帳
  getJournalEntries: () => api.get('/api/v1/accounting/journal-entries/'),
  createJournalEntry: (data: object) => api.post('/api/v1/accounting/journal-entries/', data),
  postJournalEntry: (id: number) => api.post(`/api/v1/accounting/journal-entries/${id}/post/`),
  voidJournalEntry: (id: number) => api.post(`/api/v1/accounting/journal-entries/${id}/void/`),
  
  // 發票
  getInvoices: () => api.get('/api/v1/accounting/invoices/'),
  createInvoice: (data: object) => api.post('/api/v1/accounting/invoices/', data),
  sendInvoice: (id: number) => api.post(`/api/v1/accounting/invoices/${id}/send/`),
  
  // 付款
  getPayments: () => api.get('/api/v1/accounting/payments/'),
  createPayment: (data: object) => api.post('/api/v1/accounting/payments/', data),
  
  // 費用
  getExpenses: () => api.get('/api/v1/accounting/expenses/'),
  createExpense: (data: object) => api.post('/api/v1/accounting/expenses/', data),
  approveExpense: (id: number) => api.post(`/api/v1/accounting/expenses/${id}/approve/`),
  
  // 報表
  getTrialBalance: () => api.get('/api/v1/accounting/reports/trial_balance/'),
  getBalanceSheet: (date?: string) => api.get(`/api/v1/accounting/reports/balance_sheet/${date ? `?date=${date}` : ''}`),
  getIncomeStatement: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return api.get(`/api/v1/accounting/reports/income_statement/?${params}`);
  },
  getARAgingReport: () => api.get('/api/v1/accounting/reports/accounts_receivable_aging/'),
  
  // 幣別
  getCurrencies: () => api.get('/api/v1/accounting/currencies/'),
  
  // 稅率
  getTaxRates: () => api.get('/api/v1/accounting/tax-rates/'),
  
  // 會計期間
  getFiscalYears: () => api.get('/api/v1/accounting/fiscal-years/'),
  getAccountingPeriods: () => api.get('/api/v1/accounting/accounting-periods/'),
  
  // 聯絡人 (客戶/供應商)
  getContacts: () => api.get('/api/v1/accounting/contacts/'),
  createContact: (data: object) => api.post('/api/v1/accounting/contacts/', data),
};

// =================================================================
// 人資 API
// =================================================================
export const hrmsApi = {
  getEmployees: () => api.get('/api/v1/hrms/employees/'),
  getDepartments: () => api.get('/api/v1/hrms/departments/'),
  getDesignations: () => api.get('/api/v1/hrms/designations/'),
  getLeaveApplications: () => api.get('/api/v1/hrms/leaves/'),
};

// =================================================================
// 文件 API
// =================================================================
export const documentsApi = {
  getDocuments: () => api.get('/api/v1/documents/'),
  uploadDocument: (formData: FormData) => api.upload('/api/v1/documents/', formData),
  getDocument: (id: string) => api.get(`/api/v1/documents/${id}/`),
  deleteDocument: (id: string) => api.delete(`/api/v1/documents/${id}/`),
};

// =================================================================
// AI 助手 API
// =================================================================
export const assistantsApi = {
  // 分析師助手
  analystQuery: (query: string) => api.post('/api/v1/analyst-assistant/query/', { query }),
  analystLoadData: () => api.post('/api/v1/analyst-assistant/start/'),
  
  // 規劃師助手
  plannerQuery: (query: string) => api.post('/api/v1/planner-assistant/query/', { query }),
  plannerLoadData: () => api.post('/api/v1/planner-assistant/start/'),
  
  // 文件助手
  documentProcess: (formData: FormData) => api.upload('/api/v1/document-assistant/process/', formData),
  documentQuery: (documentId: string, query: string) => 
    api.post('/api/v1/document-assistant/query/', { document_id: documentId, query }),
  documentList: (params?: { search?: string; document_type?: string; page?: number; page_size?: number }) => 
    api.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: Array<{
        id: string;
        title: string;
        original_filename: string;
        document_type: string;
        file_size: number;
        mime_type: string;
        is_ocr_processed: boolean;
        ai_summary?: string;
        created_at: string;
      }>;
    }>('/api/v1/document-assistant/documents/', { params }),
  documentDelete: (documentId: string) => api.delete(`/api/v1/document-assistant/documents/${documentId}/`),
  documentStats: () => api.get<{
    total: number;
    ocr_processed: number;
    by_type: Record<string, number>;
  }>('/api/v1/document-assistant/documents/stats/'),
  
  // 財務助手
  analyzeReceipt: (formData: FormData) => api.upload('/api/v1/finance-assistant/analyze/', formData),

  // =========================================================================
  // Accounting Assistant API / 會計助手 API
  // =========================================================================
  
  // Receipt Upload and Analysis
  uploadReceipt: (formData: FormData) => 
    api.upload<{
      receipt_id: string;
      status: string;
      receipt: any;
      processing_result: any;
    }>('/api/v1/accounting-assistant/upload/', formData),
  
  // Receipt CRUD
  getReceipts: (params?: { status?: string; category?: string; date_from?: string; date_to?: string }) =>
    api.get<{ count: number; results: any[] }>('/api/v1/accounting-assistant/receipts/', { params }),
  
  getReceipt: (receiptId: string) =>
    api.get<any>(`/api/v1/accounting-assistant/${receiptId}/receipt/`),
  
  updateReceipt: (receiptId: string, data: any) =>
    api.patch(`/api/v1/accounting-assistant/${receiptId}/update-receipt/`, data),
  
  // Approval and Journal Entry
  approveReceipt: (receiptId: string, options?: { auto_journal?: boolean; auto_post?: boolean; notes?: string }) =>
    api.post<{
      status: string;
      journal_created: boolean;
      journal_entry?: {
        id: string;
        entry_number: string;
        date: string;
        total_debit: number;
        total_credit: number;
        status: string;
      };
      receipt: any;
    }>(`/api/v1/accounting-assistant/${receiptId}/approve/`, options || {}),
  
  createJournalEntry: (receiptId: string, options?: { auto_post?: boolean }) =>
    api.post<{
      status: string;
      journal_entry: {
        id: string;
        entry_number: string;
        date: string;
        description: string;
        total_debit: number;
        total_credit: number;
        status: string;
        lines: Array<{
          account_code: string;
          account_name: string;
          debit: number;
          credit: number;
        }>;
      };
      receipt: any;
    }>(`/api/v1/accounting-assistant/${receiptId}/create-journal/`, options || {}),
  
  postJournal: (receiptId: string) =>
    api.post<{
      status: string;
      journal_entry: { id: string; entry_number: string; status: string };
      receipt: any;
    }>(`/api/v1/accounting-assistant/${receiptId}/post-journal/`),
  
  voidJournal: (receiptId: string, reason?: string) =>
    api.post<{ status: string; receipt: any }>(`/api/v1/accounting-assistant/${receiptId}/void-journal/`, { reason }),
  
  // Batch Operations
  batchCreateJournals: (receiptIds: string[], options?: { auto_post?: boolean }) =>
    api.post<{
      status: string;
      results: {
        success: Array<{ receipt_id: string; journal_entry_id: string; entry_number: string }>;
        failed: Array<{ receipt_id: string; error: string }>;
        total: number;
        success_count: number;
        failed_count: number;
      };
    }>('/api/v1/accounting-assistant/batch-create-journals/', {
      receipt_ids: receiptIds,
      ...options
    }),
  
  batchApprove: (receiptIds: string[], options?: { auto_journal?: boolean; auto_post?: boolean }) =>
    api.post<{
      status: string;
      results: {
        success: Array<{ receipt_id: string; journal_entry_id?: string; entry_number?: string }>;
        failed: Array<{ receipt_id: string; error: string }>;
        total: number;
        success_count: number;
        failed_count: number;
      };
    }>('/api/v1/accounting-assistant/batch-approve/', {
      receipt_ids: receiptIds,
      ...options
    }),
  
  // AI Review
  aiReviewReceipt: (receiptId: string) =>
    api.post<{
      ai_review: {
        validation_status: string;
        validation_issues: string[];
        categorization_review: { is_correct: boolean; suggested_category?: string; reason?: string };
        tax_compliance: { status: string; notes: string[] };
        suggestions: Array<{ type: string; title: string; description: string; priority: string }>;
        anomalies: string[];
        overall_score: number;
        summary: string;
      };
      receipt: any;
    }>(`/api/v1/accounting-assistant/${receiptId}/ai-review/`),
  
  // Anomaly Detection
  detectAnomalies: (receiptId: string, includeAi?: boolean) =>
    api.get<{
      receipt_id: string;
      anomalies_count: number;
      anomalies: Array<{
        type: string;
        severity: string;
        title: string;
        description: string;
        details: any;
        recommendation: string;
      }>;
      ai_analysis?: {
        risk_score: number;
        risk_level: string;
        summary: string;
        analysis: string;
        recommendations: string[];
        should_flag_for_review: boolean;
      };
    }>(`/api/v1/accounting-assistant/${receiptId}/detect-anomalies/`, { 
      params: { include_ai: includeAi ? 'true' : 'false' } 
    }),
  
  getAnomalySummary: (days?: number) =>
    api.get<{
      total_receipts: number;
      anomalies_found: number;
      by_type: Record<string, number>;
      by_severity: Record<string, number>;
      period_days: number;
      recommendations: string[];
    }>('/api/v1/accounting-assistant/anomaly-summary/', { params: { days } }),
  
  // Vendor Recognition
  processVendor: (receiptId: string) =>
    api.post<{
      receipt_id: string;
      vendor_result: {
        vendor_name: string;
        contact: { id: string; company_name: string; is_existing: boolean } | null;
        contact_created: boolean;
        suggested_category: string | null;
        vendor_stats: { total_transactions: number; total_amount: number; most_common_category: string | null };
      };
    }>(`/api/v1/accounting-assistant/${receiptId}/process-vendor/`),
  
  findVendor: (vendorName: string, taxId?: string) =>
    api.post<{
      found: boolean;
      contact?: { id: string; company_name: string; contact_name: string; tax_number: string; contact_type: string };
      suggestions?: Array<{ contact_id: string; company_name: string; contact_name: string; similarity_score: number }>;
    }>('/api/v1/accounting-assistant/find-vendor/', { vendor_name: vendorName, tax_id: taxId }),
  
  suggestCategory: (vendorName: string) =>
    api.get<{
      vendor_name: string;
      suggested_category: string | null;
      vendor_stats: { total_transactions: number; total_amount: number; category_breakdown: any[] };
    }>('/api/v1/accounting-assistant/suggest-category/', { params: { vendor_name: vendorName } }),
  
  // Recurring Expenses
  getRecurringExpenses: (months?: number) =>
    api.get<{
      recurring_count: number;
      recurring_expenses: Array<{
        vendor_name: string;
        pattern_type: string;
        average_interval_days: number;
        average_amount: number;
        amount_variance: number;
        total_occurrences: number;
        first_occurrence: string;
        last_occurrence: string;
        most_common_category: string;
        confidence: number;
        estimated_monthly_cost: number;
        estimated_annual_cost: number;
        next_expected_date: string;
        receipt_ids: string[];
      }>;
      analysis_period_months: number;
    }>('/api/v1/accounting-assistant/recurring-expenses/', { params: { months } }),
  
  getRecurringSummary: (months?: number) =>
    api.get<{
      total_recurring_items: number;
      total_estimated_monthly: number;
      total_estimated_annual: number;
      by_category: Record<string, { count: number; monthly_cost: number }>;
      by_pattern: Record<string, number>;
      top_recurring: any[];
      analysis_period_months: number;
    }>('/api/v1/accounting-assistant/recurring-summary/', { params: { months } }),
  
  predictExpenses: (monthsAhead?: number) =>
    api.get<{
      prediction_period: string;
      total_predicted: number;
      predictions: Array<{
        vendor_name: string;
        category: string;
        pattern_type: string;
        expected_amount: number;
        expected_dates: string[];
        expected_count: number;
        expected_total: number;
        confidence: number;
      }>;
      monthly_breakdown: Record<string, number>;
      recurring_vendors_count: number;
    }>('/api/v1/accounting-assistant/predict-expenses/', { params: { months: monthsAhead } }),
  
  getRecurringAnalysis: (months?: number) =>
    api.get<{
      summary: string;
      insights: string[];
      cost_optimization: string[];
      risks: string[];
      recommendations: Array<{ type: string; suggestion: string }>;
      predicted_trend: string;
      raw_summary: any;
    }>('/api/v1/accounting-assistant/recurring-analysis/', { params: { months } }),
  
  // Excel Comparison
  compareExcel: (formData: FormData) =>
    api.upload<{
      comparison_id: string;
      total_excel_records: number;
      total_db_records: number;
      matched_count: number;
      missing_in_db_count: number;
      missing_in_excel_count: number;
      amount_mismatch_count: number;
      health_score: number;
      ai_analysis: any;
    }>('/api/v1/accounting-assistant/compare/', formData),
  
  // Reports
  createReport: (data: { title: string; period_start: string; period_end: string; receipt_ids: string[] }) =>
    api.post<{
      report: any;
      excel_url?: string;
    }>('/api/v1/accounting-assistant/reports/', data),
  
  getReports: (params?: { page?: number; page_size?: number }) =>
    api.get<{ count: number; results: any[] }>('/api/v1/accounting-assistant/reports/', { params }),
  
  downloadReport: (reportId: string, format: 'excel' | 'pdf') =>
    api.get<Blob>(`/api/v1/accounting-assistant/reports/${reportId}/download/?format=${format}`, {
      headers: { Accept: format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf' }
    }),
};

// =================================================================
// RAG 知識庫 API
// =================================================================
export const ragApi = {
  // 查詢知識庫
  query: (query: string, options?: { category?: string; includeContext?: boolean }) =>
    api.post<{
      results: Array<{ id: string; title: string; content: string; category: string }>;
      context?: string;
    }>('/api/v1/rag/query/', {
      query,
      category: options?.category,
      include_context: options?.includeContext ?? true,
    }, { skipAuth: true }),

  // RAG 增強聊天 - 需要認證
  chat: (query: string, options?: { category?: string; provider?: string }) =>
    api.post<{
      response: string;
      sources: string[];
      provider: string;
    }>('/api/v1/rag/chat/', {
      query,
      category: options?.category,
      provider: options?.provider ?? 'openai',
    }),

  // 獲取知識庫列表
  getKnowledge: (category?: string) =>
    api.get<{
      items: Array<{ id: string; title: string; category: string }>;
      categories: Record<string, Array<{ id: string; title: string }>>;
      total: number;
    }>(`/api/v1/rag/knowledge/${category ? `?category=${category}` : ''}`, { skipAuth: true }),
};

// =================================================================
// 設定 API (API Keys)
// =================================================================
export const settingsApi = {
  // 獲取 API Key 設定狀態
  getApiKeyStatus: () => api.get<{ 
    openai: boolean; 
    gemini: boolean; 
    deepseek: boolean;
  }>('/api/v1/settings/api-keys/status/'),
  
  // 更新 API Key
  updateApiKey: (provider: string, apiKey: string) => 
    api.post(`/api/v1/settings/api-keys/${provider}/`, { api_key: apiKey }),
  
  // 刪除 API Key
  deleteApiKey: (provider: string) =>
    api.delete(`/api/v1/settings/api-keys/${provider}/`),
  
  // 測試 API Key
  testApiKey: (provider: string) => 
    api.post<{ valid: boolean; error?: string }>(`/api/v1/settings/api-keys/${provider}/test/`),
};

export default api;
