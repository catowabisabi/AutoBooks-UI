/**
 * Accounting Workspace Types
 */

// =================================================================
// Project Types
// =================================================================

export type ProjectType = 'bookkeeping' | 'audit_prep' | 'tax_filing' | 'custom';
export type ProjectStatus = 'in_progress' | 'completed' | 'review_pending' | 'archived';

export interface AccountingProject {
  id: string;
  company_name: string;
  fiscal_year: number;
  fiscal_period: string;
  project_type: ProjectType;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  documents_count: number;
  entries_count: number;
  owner_id?: string;
}

export interface CreateProjectInput {
  company_name: string;
  fiscal_year: number;
  fiscal_period: string;
  project_type: ProjectType;
}

export interface UpdateProjectInput {
  company_name?: string;
  fiscal_year?: number;
  fiscal_period?: string;
  project_type?: ProjectType;
  status?: ProjectStatus;
}

// =================================================================
// Document Types
// =================================================================

export type DocumentType = 
  | 'sales_invoice' 
  | 'purchase_invoice' 
  | 'receipt' 
  | 'bank_statement' 
  | 'expense_claim' 
  | 'contract' 
  | 'payroll'
  | 'tax_document'
  | 'unknown';

export type DocumentStatus = 
  | 'pending' 
  | 'processing' 
  | 'classified'
  | 'extracted'
  | 'in_review' 
  | 'processed' 
  | 'error' 
  | 'unclassified';

export interface ExtractedDocumentData {
  date?: string;
  amount?: number;
  currency?: string;
  vendor?: string;
  customer?: string;
  invoice_no?: string;
  description?: string;
  line_items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
  tax_amount?: number;
  total_amount?: number;
  raw_text?: string;
}

export interface AccountingDocument {
  id: string;
  project_id: string;
  file_name: string;
  original_file_name: string;
  suggested_file_name?: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_at: string;
  llm_detected_type: DocumentType;
  llm_confidence: number;
  status: DocumentStatus;
  extracted_data?: ExtractedDocumentData;
  processing_error?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadDocumentResponse {
  id: string;
  file_name: string;
  status: DocumentStatus;
  message: string;
}

// =================================================================
// Journal Entry Types
// =================================================================

export type EntryStatus = 'proposed' | 'approved' | 'rejected' | 'corrected';
export type ValidationStatus = 'valid' | 'warning' | 'error';

export interface JournalEntryLine {
  id: string;
  account_code: string;
  account_name: string;
  debit_amount: number;
  credit_amount: number;
  description?: string;
}

export interface ProposedEntry {
  id: string;
  project_id: string;
  document_id: string;
  document_name: string;
  date: string;
  description: string;
  lines: JournalEntryLine[];
  total_debit: number;
  total_credit: number;
  status: EntryStatus;
  validation_status: ValidationStatus;
  anomaly_flags?: string[];
  ai_confidence: number;
  ai_reasoning?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEntryInput {
  document_id: string;
  date: string;
  description: string;
  lines: Omit<JournalEntryLine, 'id'>[];
}

export interface UpdateEntryInput {
  date?: string;
  description?: string;
  lines?: Omit<JournalEntryLine, 'id'>[];
  status?: EntryStatus;
}

// =================================================================
// Report Types
// =================================================================

export type ReportType = 
  | 'trial_balance'
  | 'income_statement'
  | 'balance_sheet'
  | 'cash_flow'
  | 'general_ledger'
  | 'accounts_receivable'
  | 'accounts_payable';

export type ExportFormat = 'excel' | 'word' | 'pdf';

export interface ReportConfig {
  type: ReportType;
  start_date: string;
  end_date: string;
  include_details?: boolean;
  comparison_period?: string;
}

export interface GeneratedReport {
  id: string;
  project_id: string;
  report_type: ReportType;
  title: string;
  generated_at: string;
  download_url: string;
  format: ExportFormat;
  file_size: number;
}

// =================================================================
// AI Processing Types
// =================================================================

export interface ClassifyDocumentRequest {
  document_id: string;
}

export interface ClassifyDocumentResponse {
  document_id: string;
  detected_type: DocumentType;
  confidence: number;
  suggested_name: string;
  reasoning: string;
}

export interface ExtractDataRequest {
  document_id: string;
  document_type?: DocumentType;
}

export interface ExtractDataResponse {
  document_id: string;
  extracted_data: ExtractedDocumentData;
  confidence: number;
  raw_ocr_text?: string;
}

export interface GenerateEntriesRequest {
  document_ids: string[];
}

export interface GenerateEntriesResponse {
  entries: ProposedEntry[];
  total_generated: number;
  errors?: Array<{
    document_id: string;
    error: string;
  }>;
}

export interface ValidateEntriesRequest {
  entry_ids: string[];
}

export interface ValidateEntriesResponse {
  results: Array<{
    entry_id: string;
    validation_status: ValidationStatus;
    issues: string[];
  }>;
}

// =================================================================
// Chart of Accounts Types
// =================================================================

export interface Account {
  id: string;
  code: string;
  name: string;
  name_zh?: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_id?: string;
  is_active: boolean;
}

// =================================================================
// API Response Types
// =================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}
