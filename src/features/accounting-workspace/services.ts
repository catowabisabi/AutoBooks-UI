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
} from './types';

const API_BASE = '/accounting-workspace';

// =================================================================
// Project API
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
  }) => apiClient.get<PaginatedResponse<AccountingProject>>(`${API_BASE}/projects/`, { params }),

  // Get single project
  getProject: (projectId: string) =>
    apiClient.get<AccountingProject>(`${API_BASE}/projects/${projectId}/`),

  // Create project
  createProject: (data: CreateProjectInput) =>
    apiClient.post<AccountingProject>(`${API_BASE}/projects/`, data),

  // Update project
  updateProject: (projectId: string, data: UpdateProjectInput) =>
    apiClient.patch<AccountingProject>(`${API_BASE}/projects/${projectId}/`, data),

  // Delete project
  deleteProject: (projectId: string) =>
    apiClient.delete(`${API_BASE}/projects/${projectId}/`),

  // Get project statistics
  getProjectStats: (projectId: string) =>
    apiClient.get<{
      documents_count: number;
      entries_count: number;
      pending_documents: number;
      approved_entries: number;
      total_debit: number;
      total_credit: number;
    }>(`${API_BASE}/projects/${projectId}/stats/`),
};

// =================================================================
// Document API
// =================================================================

export const documentApi = {
  // Get documents for a project
  getDocuments: (projectId: string, params?: {
    page?: number;
    page_size?: number;
    status?: string;
    document_type?: string;
  }) => apiClient.get<PaginatedResponse<AccountingDocument>>(
    `${API_BASE}/projects/${projectId}/documents/`,
    { params }
  ),

  // Get single document
  getDocument: (projectId: string, documentId: string) =>
    apiClient.get<AccountingDocument>(
      `${API_BASE}/projects/${projectId}/documents/${documentId}/`
    ),

  // Upload document(s) - uses FormData
  uploadDocuments: async (projectId: string, files: File[]): Promise<UploadDocumentResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/api/v1${API_BASE}/projects/${projectId}/documents/upload/`,
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
    apiClient.delete(`${API_BASE}/projects/${projectId}/documents/${documentId}/`),

  // Update document type manually
  updateDocumentType: (projectId: string, documentId: string, documentType: DocumentType) =>
    apiClient.patch<AccountingDocument>(
      `${API_BASE}/projects/${projectId}/documents/${documentId}/`,
      { llm_detected_type: documentType }
    ),

  // Rename document
  renameDocument: (projectId: string, documentId: string, newName: string) =>
    apiClient.patch<AccountingDocument>(
      `${API_BASE}/projects/${projectId}/documents/${documentId}/`,
      { file_name: newName }
    ),
};

// =================================================================
// Journal Entry API
// =================================================================

export const entryApi = {
  // Get entries for a project
  getEntries: (projectId: string, params?: {
    page?: number;
    page_size?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) => apiClient.get<PaginatedResponse<ProposedEntry>>(
    `${API_BASE}/projects/${projectId}/entries/`,
    { params }
  ),

  // Get single entry
  getEntry: (projectId: string, entryId: string) =>
    apiClient.get<ProposedEntry>(
      `${API_BASE}/projects/${projectId}/entries/${entryId}/`
    ),

  // Create entry manually
  createEntry: (projectId: string, data: CreateEntryInput) =>
    apiClient.post<ProposedEntry>(`${API_BASE}/projects/${projectId}/entries/`, data),

  // Update entry
  updateEntry: (projectId: string, entryId: string, data: UpdateEntryInput) =>
    apiClient.patch<ProposedEntry>(
      `${API_BASE}/projects/${projectId}/entries/${entryId}/`,
      data
    ),

  // Delete entry
  deleteEntry: (projectId: string, entryId: string) =>
    apiClient.delete(`${API_BASE}/projects/${projectId}/entries/${entryId}/`),

  // Approve entry
  approveEntry: (projectId: string, entryId: string) =>
    apiClient.post<ProposedEntry>(
      `${API_BASE}/projects/${projectId}/entries/${entryId}/approve/`
    ),

  // Reject entry
  rejectEntry: (projectId: string, entryId: string, reason?: string) =>
    apiClient.post<ProposedEntry>(
      `${API_BASE}/projects/${projectId}/entries/${entryId}/reject/`,
      { reason }
    ),

  // Bulk approve entries
  bulkApprove: (projectId: string, entryIds: string[]) =>
    apiClient.post<{ approved: number; failed: number }>(
      `${API_BASE}/projects/${projectId}/entries/bulk-approve/`,
      { entry_ids: entryIds }
    ),
};

// =================================================================
// Report API
// =================================================================

export const reportApi = {
  // Get generated reports
  getReports: (projectId: string) =>
    apiClient.get<GeneratedReport[]>(`${API_BASE}/projects/${projectId}/reports/`),

  // Generate report
  generateReport: (projectId: string, config: ReportConfig, format: ExportFormat) =>
    apiClient.post<GeneratedReport>(
      `${API_BASE}/projects/${projectId}/reports/generate/`,
      { ...config, format }
    ),

  // Download report
  downloadReport: async (projectId: string, reportId: string): Promise<Blob> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/api/v1${API_BASE}/projects/${projectId}/reports/${reportId}/download/`,
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
    apiClient.delete(`${API_BASE}/projects/${projectId}/reports/${reportId}/`),
};

// =================================================================
// AI Processing API
// =================================================================

export const aiProcessingApi = {
  // Classify document using LLM
  classifyDocument: (projectId: string, documentId: string) =>
    apiClient.post<ClassifyDocumentResponse>(
      `${API_BASE}/projects/${projectId}/documents/${documentId}/classify/`
    ),

  // Bulk classify documents
  bulkClassify: (projectId: string, documentIds: string[]) =>
    apiClient.post<{
      results: ClassifyDocumentResponse[];
      errors: Array<{ document_id: string; error: string }>;
    }>(
      `${API_BASE}/projects/${projectId}/documents/bulk-classify/`,
      { document_ids: documentIds }
    ),

  // Extract data from document using OCR + LLM
  extractData: (projectId: string, documentId: string) =>
    apiClient.post<ExtractDataResponse>(
      `${API_BASE}/projects/${projectId}/documents/${documentId}/extract/`
    ),

  // Bulk extract data
  bulkExtract: (projectId: string, documentIds: string[]) =>
    apiClient.post<{
      results: ExtractDataResponse[];
      errors: Array<{ document_id: string; error: string }>;
    }>(
      `${API_BASE}/projects/${projectId}/documents/bulk-extract/`,
      { document_ids: documentIds }
    ),

  // Generate journal entries from documents
  generateEntries: (projectId: string, documentIds: string[]) =>
    apiClient.post<GenerateEntriesResponse>(
      `${API_BASE}/projects/${projectId}/entries/generate/`,
      { document_ids: documentIds }
    ),

  // Validate entries
  validateEntries: (projectId: string, entryIds: string[]) =>
    apiClient.post<ValidateEntriesResponse>(
      `${API_BASE}/projects/${projectId}/entries/validate/`,
      { entry_ids: entryIds }
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
// Chart of Accounts API
// =================================================================

export const accountsApi = {
  // Get chart of accounts
  getAccounts: (params?: { account_type?: string; is_active?: boolean }) =>
    apiClient.get<Account[]>(`${API_BASE}/accounts/`, { params }),

  // Get account by code
  getAccountByCode: (code: string) =>
    apiClient.get<Account>(`${API_BASE}/accounts/${code}/`),

  // Search accounts
  searchAccounts: (query: string) =>
    apiClient.get<Account[]>(`${API_BASE}/accounts/search/`, {
      params: { q: query },
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
};

export default accountingWorkspaceApi;
