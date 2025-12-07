/**
 * Accounting Workspace Types
 * Updated to match backend AccountingProject and Receipt models
 */

// =================================================================
// Project Types - Matching backend ProjectType and ProjectStatus
// =================================================================

export type ProjectType = 'bookkeeping' | 'audit_prep' | 'tax_filing' | 'custom';
export type ProjectStatus = 'draft' | 'in_progress' | 'review_pending' | 'completed' | 'archived';
export type QuarterChoice = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'ANNUAL';

export interface AccountingProject {
  id: string;
  code: string;
  name: string;
  description?: string;
  company: string;  // Company UUID
  company_name: string;
  project_type: ProjectType;
  status: ProjectStatus;
  fiscal_year: number;
  quarter?: QuarterChoice;
  start_date?: string;
  end_date?: string;
  deadline?: string;
  owner?: string;  // User UUID
  owner_name?: string;
  team_members?: string[];  // User UUIDs
  progress: number;
  budget_hours?: number;
  actual_hours?: number;
  notes?: string;
  is_active: boolean;
  is_overdue: boolean;
  receipt_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  code: string;
  name: string;
  description?: string;
  company?: string;  // Optional: Company UUID
  company_name?: string;  // Optional: Auto-create company with this name
  project_type: ProjectType;
  fiscal_year: number;
  quarter?: QuarterChoice;
  start_date?: string;
  end_date?: string;
  deadline?: string;
  team_members?: string[];
  budget_hours?: number;
  notes?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
  deadline?: string;
  team_members?: string[];
  progress?: number;
  budget_hours?: number;
  actual_hours?: number;
  notes?: string;
}

// =================================================================
// Document Types - Matching backend Receipt model
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
  | 'OFFICE_SUPPLIES'
  | 'TRANSPORTATION'
  | 'MEALS'
  | 'ACCOMMODATION'
  | 'UTILITIES'
  | 'PROFESSIONAL_SERVICES'
  | 'EQUIPMENT'
  | 'SOFTWARE'
  | 'MARKETING'
  | 'OTHER'
  | 'unknown';

export type DocumentStatus = 
  | 'UPLOADED'
  | 'PROCESSING' 
  | 'CATEGORIZED'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED'
  | 'UNRECOGNIZED'
  | 'NEEDS_MANUAL_CLASSIFICATION'
  | 'error';

export interface ExtractedDocumentData {
  date?: string;
  amount?: number;
  currency?: string;
  vendor?: string;
  vendor_name?: string;
  vendor_address?: string;
  vendor_phone?: string;
  vendor_tax_id?: string;
  receipt_number?: string;
  invoice_no?: string;
  description?: string;
  line_items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
    tax_included?: boolean;
  }>;
  subtotal?: number;
  tax_amount?: number;
  tax_rate?: number;
  discount_amount?: number;
  total_amount?: number;
  payment_method?: string;
  raw_text?: string;
}

export interface AccountingDocument {
  id: string;
  project?: string;  // Project UUID
  project_name?: string;
  file_name: string;
  original_filename: string;
  file_type?: string;
  file_size?: number;
  image?: string;  // URL
  uploaded_by?: string;
  uploaded_by_name?: string;
  status: DocumentStatus;
  unrecognized_reason?: string;
  is_unrecognized?: boolean;
  needs_review?: boolean;
  
  // Extracted data
  vendor_name?: string;
  vendor_address?: string;
  vendor_phone?: string;
  vendor_tax_id?: string;
  receipt_number?: string;
  receipt_date?: string;
  receipt_time?: string;
  currency?: string;
  subtotal?: number;
  tax_amount?: number;
  tax_rate?: number;
  discount_amount?: number;
  total_amount?: number;
  payment_method?: string;
  category?: DocumentType;
  description?: string;
  items?: ExtractedDocumentData['line_items'];
  
  // AI analysis
  ai_confidence_score?: number;
  ai_suggestions?: Record<string, unknown>;
  ai_warnings?: string[];
  detected_language?: string;
  
  // Journal entry
  journal_entry_data?: Record<string, unknown>;
  journal_entry?: string;
  expense?: string;
  
  // Review
  notes?: string;
  reviewed_by?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  
  created_at: string;
  updated_at: string;
}

export interface UploadDocumentResponse {
  id: string;
  file_name: string;
  status: DocumentStatus;
  message?: string;
  ai_confidence_score?: number;
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

// =================================================================
// Field Extraction Types - For OCR field-level data
// =================================================================

export interface FieldExtraction {
  id: string;
  receipt: string;  // Receipt UUID
  field_name: string;
  extracted_value: string;
  corrected_value?: string;
  final_value: string;  // Returns corrected_value if set, else extracted_value
  confidence: number;
  bounding_box?: number[];  // [x, y, width, height] for highlighting
  is_verified: boolean;
  verified_by?: string;
  verified_by_name?: string;
  verified_at?: string;
  needs_review: boolean;  // True if confidence < 0.8 and not verified
  created_at: string;
  updated_at: string;
}

export interface FieldCorrectionInput {
  field_id: string;
  corrected_value: string;
  mark_verified?: boolean;
}

export interface BulkFieldCorrectionInput {
  corrections: FieldCorrectionInput[];
}

// =================================================================
// Unrecognized Receipt Types
// =================================================================

export interface UnrecognizedReceipt extends AccountingDocument {
  unrecognized_reason: string;
}

export interface ManualClassificationInput {
  receipt_id: string;
  vendor_name?: string;
  receipt_date?: string;
  total_amount?: number;
  category?: DocumentType;
  new_status?: DocumentStatus;
}

export interface BulkStatusUpdateInput {
  receipt_ids: string[];
  new_status: DocumentStatus;
  notes?: string;
}

// =================================================================
// Project Stats Types
// =================================================================

export interface ProjectStats {
  receipt_count: number;
  status_breakdown: Record<DocumentStatus, number>;
  total_amount: number;
  avg_confidence: number;
  unrecognized_count: number;
  needs_review_count: number;
}

export interface ProjectTimeline {
  events: Array<{
    id: string;
    type: 'created' | 'uploaded' | 'approved' | 'rejected' | 'completed';
    description: string;
    user?: string;
    timestamp: string;
  }>;
}
