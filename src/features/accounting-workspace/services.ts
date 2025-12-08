/**
 * Accounting Workspace API Services
 */

import { apiClient, PaginatedResponse } from '@/lib/api-client';
import { ragApi } from '@/lib/api';
import {
  AccountingProject,
  CreateProjectInput,
  UpdateProjectInput,
  AccountingDocument,
  UploadDocumentResponse,
  ProposedEntry,
  CreateEntryInput,
  UpdateEntryInput,
  GeneratedReport,
  ReportConfig,
  ClassifyDocumentResponse,
  ExtractDataResponse,
  GenerateEntriesResponse,
  ValidateEntriesResponse,
  Account,
  DocumentType,
  ExportFormat,
  // Field extraction types
  ExtractedField,
  ExtractedFieldType,
  ReceiptCorrectInput,
  ReceiptFieldsResponse,
  ReceiptCorrectResponse,
  ReceiptCorrectionHistoryResponse,
  BulkCreateFieldsInput,
} from './types';

// API base paths - using new accounting-projects endpoints
const PROJECT_API_BASE = '/accounting-projects';
const ASSISTANT_API_BASE = '/accounting-assistant';

// =================================================================
// Project API - Updated to use new accounting-projects endpoints
// =================================================================

export const projectApi = {
  // Get all projects with pagination
  getProjects: (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    project_type?: string;
    fiscal_year?: number;
    search?: string;
  }) => apiClient.get<PaginatedResponse<AccountingProject>>(`${PROJECT_API_BASE}/`, { params }),

  // Get single project
  getProject: (projectId: string) =>
    apiClient.get<AccountingProject>(`${PROJECT_API_BASE}/${projectId}/`),

  // Create project
  createProject: (data: CreateProjectInput) =>
    apiClient.post<AccountingProject>(`${PROJECT_API_BASE}/`, data),

  // Update project
  updateProject: (projectId: string, data: UpdateProjectInput) =>
    apiClient.patch<AccountingProject>(`${PROJECT_API_BASE}/${projectId}/`, data),

  // Delete project
  deleteProject: (projectId: string) =>
    apiClient.delete(`${PROJECT_API_BASE}/${projectId}/`),

  // Get project statistics
  getProjectStats: (projectId: string) =>
    apiClient.get<{
      documents_count: number;
      entries_count: number;
      pending_documents: number;
      approved_entries: number;
      total_debit: number;
      total_credit: number;
    }>(`${PROJECT_API_BASE}/${projectId}/stats/`),
    
  // Get project receipts
  getProjectReceipts: (projectId: string, params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }) => apiClient.get<PaginatedResponse<AccountingDocument>>(`${PROJECT_API_BASE}/${projectId}/receipts/`, { params }),
    
  // Toggle project active status
  toggleActive: (projectId: string) =>
    apiClient.post<AccountingProject>(`${PROJECT_API_BASE}/${projectId}/toggle-active/`),
    
  // Get project timeline
  getTimeline: (projectId: string) =>
    apiClient.get(`${PROJECT_API_BASE}/${projectId}/timeline/`),
};

// =================================================================
// Document API - Using accounting-assistant endpoints for receipts
// =================================================================

export const documentApi = {
  // Get documents for a project
  getDocuments: (projectId: string, params?: {
    page?: number;
    page_size?: number;
    status?: string;
    document_type?: string;
  }) => apiClient.get<PaginatedResponse<AccountingDocument>>(
    `${PROJECT_API_BASE}/${projectId}/receipts/`,
    { params }
  ),

  // Get single document (receipt)
  getDocument: (projectId: string, documentId: string) =>
    apiClient.get<AccountingDocument>(
      `${ASSISTANT_API_BASE}/receipts/${documentId}/`
    ),

  // Upload document(s) - uses FormData
  uploadDocuments: async (projectId: string, files: File[]): Promise<UploadDocumentResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('project_id', projectId);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/api/v1${PROJECT_API_BASE}/${projectId}/bulk-upload/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token')}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  // Delete document
  deleteDocument: (projectId: string, documentId: string) =>
    apiClient.delete(`${ASSISTANT_API_BASE}/receipts/${documentId}/`),

  // Update document type manually
  updateDocumentType: (projectId: string, documentId: string, documentType: DocumentType) =>
    apiClient.patch<AccountingDocument>(
      `${ASSISTANT_API_BASE}/receipts/${documentId}/`,
      { category: documentType }
    ),

  // Rename document
  renameDocument: (projectId: string, documentId: string, newName: string) =>
    apiClient.patch<AccountingDocument>(
      `${ASSISTANT_API_BASE}/receipts/${documentId}/`,
      { original_filename: newName }
    ),
};

// =================================================================
// Journal Entry API - Using accounting-assistant
// =================================================================

export const entryApi = {
  // Get entries for a project - will use accounting module
  getEntries: (projectId: string, params?: {
    page?: number;
    page_size?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) => apiClient.get<PaginatedResponse<ProposedEntry>>(
    `${ASSISTANT_API_BASE}/receipts/`,
    { params: { ...params, project: projectId } }
  ),

  // Get single entry
  getEntry: (projectId: string, entryId: string) =>
    apiClient.get<ProposedEntry>(
      `${ASSISTANT_API_BASE}/receipts/${entryId}/`
    ),

  // Create entry manually
  createEntry: (projectId: string, data: CreateEntryInput) =>
    apiClient.post<ProposedEntry>(`${ASSISTANT_API_BASE}/receipts/${data.document_id}/create-journal/`, data),

  // Update entry
  updateEntry: (projectId: string, entryId: string, data: UpdateEntryInput) =>
    apiClient.patch<ProposedEntry>(
      `${ASSISTANT_API_BASE}/receipts/${entryId}/`,
      data
    ),

  // Delete entry
  deleteEntry: (projectId: string, entryId: string) =>
    apiClient.delete(`${ASSISTANT_API_BASE}/receipts/${entryId}/`),

  // Approve entry (receipt)
  approveEntry: (projectId: string, entryId: string) =>
    apiClient.post<ProposedEntry>(
      `${ASSISTANT_API_BASE}/receipts/${entryId}/approve/`
    ),

  // Reject entry
  rejectEntry: (projectId: string, entryId: string, reason?: string) =>
    apiClient.patch<ProposedEntry>(
      `${ASSISTANT_API_BASE}/receipts/${entryId}/`,
      { status: 'REJECTED', notes: reason }
    ),

  // Bulk approve entries - using bulk status update
  bulkApprove: (projectId: string, entryIds: string[]) =>
    apiClient.post<{ approved: number; failed: number }>(
      `${PROJECT_API_BASE}/${projectId}/bulk-status-update/`,
      { receipt_ids: entryIds, new_status: 'APPROVED' }
    ),
};

// =================================================================
// Report API - Using accounting-assistant reports
// =================================================================

export const reportApi = {
  // Get generated reports
  getReports: (projectId: string) =>
    apiClient.get<GeneratedReport[]>(`${ASSISTANT_API_BASE}/reports/`),

  // Generate report
  generateReport: (projectId: string, config: ReportConfig, format: ExportFormat) =>
    apiClient.post<GeneratedReport>(
      `${ASSISTANT_API_BASE}/reports/create/`,
      { ...config, format }
    ),

  // Download report
  downloadReport: async (projectId: string, reportId: string): Promise<Blob> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/api/v1${ASSISTANT_API_BASE}/reports/${reportId}/download/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  },

  // Delete report
  deleteReport: (projectId: string, reportId: string) =>
    apiClient.delete(`${ASSISTANT_API_BASE}/reports/${reportId}/`),
};

// =================================================================
// AI Processing API - Using accounting-assistant AI features
// =================================================================

export const aiProcessingApi = {
  // AI review receipt using LLM
  classifyDocument: (projectId: string, documentId: string) =>
    apiClient.post<ClassifyDocumentResponse>(
      `${ASSISTANT_API_BASE}/receipts/${documentId}/ai-review/`
    ),

  // Bulk classify documents - using unrecognized reclassify
  bulkClassify: (projectId: string, documentIds: string[]) =>
    apiClient.post<{
      results: ClassifyDocumentResponse[];
      errors: Array<{ document_id: string; error: string }>;
    }>(
      `${ASSISTANT_API_BASE}/unrecognized/batch-reclassify/`,
      { receipt_ids: documentIds, new_status: 'CATEGORIZED' }
    ),

  // Extract data from document using OCR + LLM
  extractData: (projectId: string, documentId: string) =>
    apiClient.post<ExtractDataResponse>(
      `${ASSISTANT_API_BASE}/receipts/${documentId}/ai-review/`
    ),

  // Bulk extract data
  bulkExtract: (projectId: string, documentIds: string[]) =>
    apiClient.post<{
      results: ExtractDataResponse[];
      errors: Array<{ document_id: string; error: string }>;
    }>(
      `${PROJECT_API_BASE}/${projectId}/bulk-upload/`,
      { receipt_ids: documentIds, auto_categorize: true }
    ),

  // Generate journal entries from documents
  generateEntries: (projectId: string, documentIds: string[]) =>
    apiClient.post<GenerateEntriesResponse>(
      `${ASSISTANT_API_BASE}/receipts/${documentIds[0]}/create-journal/`,
      { receipt_ids: documentIds }
    ),

  // Validate entries
  validateEntries: (projectId: string, entryIds: string[]) =>
    apiClient.post<ValidateEntriesResponse>(
      `${ASSISTANT_API_BASE}/ai-query/`,
      { query: `Validate entries: ${entryIds.join(', ')}`, include_suggestions: true }
    ),

  // Ask AI about accounting questions
  askAI: async (question: string, context?: {
    projectId?: string;
    documentIds?: string[];
    entryIds?: string[];
  }) => {
    const contextInfo = context
      ? `\n\nContext: Project ID: ${context.projectId}, Document IDs: ${context.documentIds?.join(', ')}, Entry IDs: ${context.entryIds?.join(', ')}`
      : '';

    return ragApi.chat(question + contextInfo, {
      category: 'accounting',
      provider: 'openai',
    });
  },
};

// =================================================================
// Unrecognized Receipts API - New endpoint
// =================================================================

export const unrecognizedApi = {
  // Get unrecognized receipts
  getUnrecognized: (params?: {
    page?: number;
    page_size?: number;
    project?: string;
    reason?: string;
  }) => apiClient.get<PaginatedResponse<AccountingDocument>>(`${ASSISTANT_API_BASE}/unrecognized/`, { params }),
  
  // Reclassify single receipt
  reclassify: (receiptId: string, data: {
    vendor_name?: string;
    receipt_date?: string;
    total_amount?: number;
    category?: string;
    new_status?: string;
  }) => apiClient.post(`${ASSISTANT_API_BASE}/unrecognized/${receiptId}/reclassify/`, data),
  
  // Batch reclassify
  batchReclassify: (receiptIds: string[], newStatus: string, notes?: string) =>
    apiClient.post(`${ASSISTANT_API_BASE}/unrecognized/batch-reclassify/`, {
      receipt_ids: receiptIds,
      new_status: newStatus,
      notes,
    }),
};

// =================================================================
// Field Extraction API - For field-level data with bounding boxes
// =================================================================

const RECEIPTS_API_BASE = '/receipts';

export const fieldExtractionApi = {
  /**
   * Get all extracted fields for a receipt with bounding boxes
   * Returns fields grouped by type for easy UI consumption
   */
  getFields: (receiptId: string) =>
    apiClient.get<ReceiptFieldsResponse>(`${RECEIPTS_API_BASE}/${receiptId}/fields/`),

  /**
   * Correct extracted fields with optional bounding box overrides
   * Creates version history for audit trail
   */
  correctFields: (receiptId: string, data: ReceiptCorrectInput) =>
    apiClient.put<ReceiptCorrectResponse>(`${RECEIPTS_API_BASE}/${receiptId}/correct/`, data),

  /**
   * Get correction history for a receipt's fields
   * Supports filtering by field_id and date range
   */
  getCorrectionHistory: (receiptId: string, params?: {
    field_id?: string;
    date_from?: string;
    date_to?: string;
  }) => apiClient.get<ReceiptCorrectionHistoryResponse>(
    `${RECEIPTS_API_BASE}/${receiptId}/correction_history/`,
    { params }
  ),

  /**
   * Bulk create extracted fields from OCR processing
   * Used by OCR integration to populate fields after processing
   */
  bulkCreateFields: (receiptId: string, data: BulkCreateFieldsInput) =>
    apiClient.post<{
      message: string;
      receipt_id: string;
      fields: ExtractedField[];
    }>(`${RECEIPTS_API_BASE}/${receiptId}/fields/bulk-create/`, data),

  /**
   * Correct a single field value (convenience method)
   */
  correctSingleField: (receiptId: string, fieldId: string, value: string, reason?: string) =>
    apiClient.put<ReceiptCorrectResponse>(`${RECEIPTS_API_BASE}/${receiptId}/correct/`, {
      fields: [{
        field_id: fieldId,
        value,
        correction_reason: reason,
      }],
      correction_source: 'UI',
    }),

  /**
   * Create a new manual field entry
   */
  createField: (
    receiptId: string,
    fieldType: ExtractedFieldType,
    value: string,
    boundingBox?: { x1: number; y1: number; x2: number; y2: number },
    pageNumber?: number
  ) =>
    apiClient.put<ReceiptCorrectResponse>(`${RECEIPTS_API_BASE}/${receiptId}/correct/`, {
      fields: [{
        field_type: fieldType,
        value,
        bounding_box: boundingBox,
        page_number: pageNumber || 1,
      }],
      correction_source: 'UI',
    }),

  // Legacy methods for backwards compatibility
  getByReceipt: (receiptId: string) =>
    apiClient.get<ReceiptFieldsResponse>(`${RECEIPTS_API_BASE}/${receiptId}/fields/`),
    
  correctField: (data: {
    field_id: string;
    corrected_value: string;
    mark_verified?: boolean;
  }) => {
    // Extract receipt ID from field_id or use a default endpoint
    // This is a legacy method - prefer using correctFields with receipt ID
    console.warn('Legacy correctField method - consider using correctFields with receipt ID');
    return apiClient.post(`/field-extractions/correct/`, data);
  },
    
  bulkCorrect: (corrections: Array<{
    field_id: string;
    corrected_value: string;
    mark_verified?: boolean;
  }>) => apiClient.post(`/field-extractions/bulk-correct/`, { corrections }),
    
  verifyAll: (receiptId: string) =>
    apiClient.post(`/field-extractions/verify-all/${receiptId}/`),
};

// =================================================================
// Chart of Accounts API - Using accounting module
// =================================================================

export const accountsApi = {
  // Get chart of accounts
  getAccounts: (params?: { account_type?: string; is_active?: boolean }) =>
    apiClient.get<Account[]>(`/accounting/accounts/`, { params }),

  // Get account by code
  getAccountByCode: (code: string) =>
    apiClient.get<Account>(`/accounting/accounts/${code}/`),

  // Search accounts
  searchAccounts: (query: string) =>
    apiClient.get<Account[]>(`/accounting/accounts/`, {
      params: { search: query },
    }),
};

// =================================================================
// Export all services
// =================================================================

export const accountingWorkspaceApi = {
  projects: projectApi,
  documents: documentApi,
  entries: entryApi,
  reports: reportApi,
  ai: aiProcessingApi,
  accounts: accountsApi,
  unrecognized: unrecognizedApi,
  fieldExtractions: fieldExtractionApi,
};

export default accountingWorkspaceApi;
