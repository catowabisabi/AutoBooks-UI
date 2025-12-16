/**
 * Accounting Workspace React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  projectApi,
  documentApi,
  entryApi,
  reportApi,
  aiProcessingApi,
  accountsApi,
  unrecognizedApi,
  fieldExtractionApi,
} from './services';
import {
  AccountingProject,
  CreateProjectInput,
  UpdateProjectInput,
  AccountingDocument,
  ProposedEntry,
  CreateEntryInput,
  UpdateEntryInput,
  ReportConfig,
  DocumentType,
  ExportFormat,
} from './types';

// =================================================================
// Query Keys
// =================================================================

export const accountingKeys = {
  all: ['accounting'] as const,
  projects: () => [...accountingKeys.all, 'projects'] as const,
  projectList: (filters?: Record<string, any>) =>
    [...accountingKeys.projects(), 'list', filters] as const,
  project: (id: string) => [...accountingKeys.projects(), id] as const,
  projectStats: (id: string) => [...accountingKeys.project(id), 'stats'] as const,
  documents: (projectId: string) =>
    [...accountingKeys.project(projectId), 'documents'] as const,
  documentList: (projectId: string, filters?: Record<string, any>) =>
    [...accountingKeys.documents(projectId), 'list', filters] as const,
  document: (projectId: string, documentId: string) =>
    [...accountingKeys.documents(projectId), documentId] as const,
  entries: (projectId: string) =>
    [...accountingKeys.project(projectId), 'entries'] as const,
  entryList: (projectId: string, filters?: Record<string, any>) =>
    [...accountingKeys.entries(projectId), 'list', filters] as const,
  entry: (projectId: string, entryId: string) =>
    [...accountingKeys.entries(projectId), entryId] as const,
  reports: (projectId: string) =>
    [...accountingKeys.project(projectId), 'reports'] as const,
  accounts: () => [...accountingKeys.all, 'accounts'] as const,
};

// Cache time constants
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_GC_TIME = 15 * 60 * 1000; // 15 minutes

// =================================================================
// Project Hooks
// =================================================================

export function useProjects(filters?: {
  page?: number;
  page_size?: number;
  status?: string;
  project_type?: string;
  fiscal_year?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: accountingKeys.projectList(filters),
    queryFn: () => projectApi.getProjects(filters),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: accountingKeys.project(projectId),
    queryFn: () => projectApi.getProject(projectId),
    enabled: !!projectId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

export function useProjectStats(projectId: string) {
  return useQuery({
    queryKey: accountingKeys.projectStats(projectId),
    queryFn: () => projectApi.getProjectStats(projectId),
    enabled: !!projectId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectInput) => projectApi.createProject(data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.projects() });
      toast.success('Project created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: UpdateProjectInput;
    }) => projectApi.updateProject(projectId, data),
    onSuccess: (updatedProject, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.project(projectId) });
      queryClient.invalidateQueries({ queryKey: accountingKeys.projects() });
      toast.success('Project updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update project: ${error.message}`);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectApi.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.projects() });
      toast.success('Project deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });
}

// =================================================================
// Document Hooks
// =================================================================

export function useDocuments(
  projectId: string,
  filters?: {
    page?: number;
    page_size?: number;
    status?: string;
    document_type?: string;
  }
) {
  return useQuery({
    queryKey: accountingKeys.documentList(projectId, filters),
    queryFn: () => documentApi.getDocuments(projectId, filters),
    enabled: !!projectId,
  });
}

export function useDocument(projectId: string, documentId: string) {
  return useQuery({
    queryKey: accountingKeys.document(projectId, documentId),
    queryFn: () => documentApi.getDocument(projectId, documentId),
    enabled: !!projectId && !!documentId,
  });
}

export function useUploadDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, files }: { projectId: string; files: File[] }) =>
      documentApi.uploadDocuments(projectId, files),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: accountingKeys.documents(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: accountingKeys.projectStats(projectId),
      });
      toast.success('Documents uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload documents: ${error.message}`);
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      documentId,
    }: {
      projectId: string;
      documentId: string;
    }) => documentApi.deleteDocument(projectId, documentId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: accountingKeys.documents(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: accountingKeys.projectStats(projectId),
      });
      toast.success('Document deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });
}

export function useUpdateDocumentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      documentId,
      documentType,
    }: {
      projectId: string;
      documentId: string;
      documentType: DocumentType;
    }) => documentApi.updateDocumentType(projectId, documentId, documentType),
    onSuccess: (_, { projectId, documentId }) => {
      queryClient.invalidateQueries({
        queryKey: accountingKeys.document(projectId, documentId),
      });
      queryClient.invalidateQueries({
        queryKey: accountingKeys.documents(projectId),
      });
      toast.success('Document type updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update document type: ${error.message}`);
    },
  });
}

// =================================================================
// Entry Hooks
// =================================================================

export function useEntries(
  projectId: string,
  filters?: {
    page?: number;
    page_size?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }
) {
  return useQuery({
    queryKey: accountingKeys.entryList(projectId, filters),
    queryFn: () => entryApi.getEntries(projectId, filters),
    enabled: !!projectId,
  });
}

export function useEntry(projectId: string, entryId: string) {
  return useQuery({
    queryKey: accountingKeys.entry(projectId, entryId),
    queryFn: () => entryApi.getEntry(projectId, entryId),
    enabled: !!projectId && !!entryId,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: CreateEntryInput;
    }) => entryApi.createEntry(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: accountingKeys.entries(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: accountingKeys.projectStats(projectId),
      });
      toast.success('Entry created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create entry: ${error.message}`);
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      entryId,
      data,
    }: {
      projectId: string;
      entryId: string;
      data: UpdateEntryInput;
    }) => entryApi.updateEntry(projectId, entryId, data),
    onSuccess: (_, { projectId, entryId }) => {
      queryClient.invalidateQueries({
        queryKey: accountingKeys.entry(projectId, entryId),
      });
      queryClient.invalidateQueries({
        queryKey: accountingKeys.entries(projectId),
      });
      toast.success('Entry updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update entry: ${error.message}`);
    },
  });
}

export function useApproveEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      entryId,
    }: {
      projectId: string;
      entryId: string;
    }) => entryApi.approveEntry(projectId, entryId),
    onSuccess: (_, { projectId, entryId }) => {
      queryClient.invalidateQueries({
        queryKey: accountingKeys.entry(projectId, entryId),
      });
      queryClient.invalidateQueries({
        queryKey: accountingKeys.entries(projectId),
      });
      toast.success('Entry approved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve entry: ${error.message}`);
    },
  });
}

export function useRejectEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      entryId,
      reason,
    }: {
      projectId: string;
      entryId: string;
      reason?: string;
    }) => entryApi.rejectEntry(projectId, entryId, reason),
    onSuccess: (_, { projectId, entryId }) => {
      queryClient.invalidateQueries({
        queryKey: accountingKeys.entry(projectId, entryId),
      });
      queryClient.invalidateQueries({
        queryKey: accountingKeys.entries(projectId),
      });
      toast.success('Entry rejected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject entry: ${error.message}`);
    },
  });
}

export function useBulkApproveEntries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      entryIds,
    }: {
      projectId: string;
      entryIds: string[];
    }) => entryApi.bulkApprove(projectId, entryIds),
    onSuccess: (result, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: accountingKeys.entries(projectId),
      });
      toast.success(`${result.approved} entries approved`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve entries: ${error.message}`);
    },
  });
}

// =================================================================
// AI Processing Hooks
// =================================================================

export function useClassifyDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      documentId,
    }: {
      projectId: string;
      documentId: string;
    }) => aiProcessingApi.classifyDocument(projectId, documentId),
    onSuccess: (result, { projectId, documentId }) => {
      queryClient.invalidateQueries({
        queryKey: accountingKeys.document(projectId, documentId),
      });
      queryClient.invalidateQueries({
        queryKey: accountingKeys.documents(projectId),
      });
      toast.success(`Document classified as: ${result.detected_type}`);
    },
    onError: (error: Error) => {
      toast.error(`Classification failed: ${error.message}`);
    },
  });
}

export function useBulkClassifyDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      documentIds,
    }: {
      projectId: string;
      documentIds: string[];
    }) => aiProcessingApi.bulkClassify(projectId, documentIds),
    onSuccess: (result, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: accountingKeys.documents(projectId),
      });
      toast.success(`${result.results.length} documents classified`);
    },
    onError: (error: Error) => {
      toast.error(`Bulk classification failed: ${error.message}`);
    },
  });
}

export function useExtractDocumentData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      documentId,
    }: {
      projectId: string;
      documentId: string;
    }) => aiProcessingApi.extractData(projectId, documentId),
    onSuccess: (result, { projectId, documentId }) => {
      queryClient.invalidateQueries({
        queryKey: accountingKeys.document(projectId, documentId),
      });
      queryClient.invalidateQueries({
        queryKey: accountingKeys.documents(projectId),
      });
      toast.success('Data extracted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Data extraction failed: ${error.message}`);
    },
  });
}

export function useBulkExtractData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      documentIds,
    }: {
      projectId: string;
      documentIds: string[];
    }) => aiProcessingApi.bulkExtract(projectId, documentIds),
    onSuccess: (result, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: accountingKeys.documents(projectId),
      });
      toast.success(`Data extracted from ${result.results.length} documents`);
    },
    onError: (error: Error) => {
      toast.error(`Bulk extraction failed: ${error.message}`);
    },
  });
}

export function useGenerateEntries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      documentIds,
    }: {
      projectId: string;
      documentIds: string[];
    }) => aiProcessingApi.generateEntries(projectId, documentIds),
    onSuccess: (result, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: accountingKeys.entries(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: accountingKeys.projectStats(projectId),
      });
      toast.success(`${result.total_generated} entries generated`);
    },
    onError: (error: Error) => {
      toast.error(`Entry generation failed: ${error.message}`);
    },
  });
}

export function useValidateEntries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      entryIds,
    }: {
      projectId: string;
      entryIds: string[];
    }) => aiProcessingApi.validateEntries(projectId, entryIds),
    onSuccess: (result, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: accountingKeys.entries(projectId),
      });
      const validCount = result.results.filter(
        (r) => r.validation_status === 'valid'
      ).length;
      toast.success(`${validCount}/${result.results.length} entries valid`);
    },
    onError: (error: Error) => {
      toast.error(`Validation failed: ${error.message}`);
    },
  });
}

// =================================================================
// Report Hooks
// =================================================================

export function useReports(projectId: string) {
  return useQuery({
    queryKey: accountingKeys.reports(projectId),
    queryFn: () => reportApi.getReports(projectId),
    enabled: !!projectId,
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      config,
      format,
    }: {
      projectId: string;
      config: ReportConfig;
      format: ExportFormat;
    }) => reportApi.generateReport(projectId, config, format),
    onSuccess: (result, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: accountingKeys.reports(projectId),
      });
      toast.success(`Report generated: ${result.title}`);
    },
    onError: (error: Error) => {
      toast.error(`Report generation failed: ${error.message}`);
    },
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: ({
      projectId,
      reportId,
      fileName,
    }: {
      projectId: string;
      reportId: string;
      fileName: string;
    }) =>
      reportApi.downloadReport(projectId, reportId).then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }),
    onSuccess: () => {
      toast.success('Download started');
    },
    onError: (error: Error) => {
      toast.error(`Download failed: ${error.message}`);
    },
  });
}

// =================================================================
// Accounts Hooks
// =================================================================

export function useAccounts(filters?: {
  account_type?: string;
  is_active?: boolean;
}) {
  return useQuery({
    queryKey: [...accountingKeys.accounts(), filters],
    queryFn: () => accountsApi.getAccounts(filters),
  });
}

export function useSearchAccounts(query: string) {
  return useQuery({
    queryKey: [...accountingKeys.accounts(), 'search', query],
    queryFn: () => accountsApi.searchAccounts(query),
    enabled: query.length >= 2,
  });
}

// =================================================================
// Unrecognized Receipts Hooks
// =================================================================

export const unrecognizedKeys = {
  all: ['unrecognized'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...unrecognizedKeys.all, 'list', filters] as const,
  item: (id: string) => [...unrecognizedKeys.all, id] as const,
};

export function useUnrecognizedReceipts(params?: {
  page?: number;
  page_size?: number;
  reason?: string;
  min_confidence?: number;
}) {
  return useQuery({
    queryKey: unrecognizedKeys.list(params),
    queryFn: () => unrecognizedApi.getUnrecognized(params),
  });
}

export function useReclassifyReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      receiptId,
      data,
    }: {
      receiptId: string;
      data: {
        vendor_name?: string;
        receipt_date?: string;
        total_amount?: number;
        category?: string;
        new_status?: string;
      };
    }) => unrecognizedApi.reclassify(receiptId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unrecognizedKeys.all });
      toast.success('Receipt reclassified successfully / 收據已重新分類');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reclassify receipt: ${error.message}`);
    },
  });
}

export function useBatchReclassify() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      receiptIds,
      newStatus,
      notes,
    }: {
      receiptIds: string[];
      newStatus: string;
      notes?: string;
    }) => unrecognizedApi.batchReclassify(receiptIds, newStatus, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: unrecognizedKeys.all });
      toast.success(`${variables.receiptIds.length} receipts reclassified / 已重新分類 ${variables.receiptIds.length} 張收據`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to batch reclassify: ${error.message}`);
    },
  });
}

// =================================================================
// Field Extraction Hooks
// =================================================================

export const fieldExtractionKeys = {
  all: ['field-extractions'] as const,
  byReceipt: (receiptId: string) =>
    [...fieldExtractionKeys.all, 'receipt', receiptId] as const,
};

export function useFieldExtractions(receiptId: string) {
  return useQuery({
    queryKey: fieldExtractionKeys.byReceipt(receiptId),
    queryFn: () => fieldExtractionApi.getByReceipt(receiptId),
    enabled: !!receiptId,
  });
}

export function useCorrectField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      receiptId,
      fieldName,
      correctedValue,
      notes,
    }: {
      receiptId: string;
      fieldName: string;
      correctedValue: string;
      notes?: string;
    }) =>
      fieldExtractionApi.correctField({
        receipt_id: receiptId,
        field_name: fieldName,
        corrected_value: correctedValue,
        notes,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: fieldExtractionKeys.byReceipt(variables.receiptId),
      });
      toast.success('Field corrected successfully / 欄位已修正');
    },
    onError: (error: Error) => {
      toast.error(`Failed to correct field: ${error.message}`);
    },
  });
}

// =================================================================
// AI Accounting Assistant Hooks (New)
// =================================================================
import { assistantsApi } from '@/lib/api';

export const aiAccountingKeys = {
  all: ['ai-accounting'] as const,
  receipts: () => [...aiAccountingKeys.all, 'receipts'] as const,
  receiptList: (filters?: Record<string, any>) =>
    [...aiAccountingKeys.receipts(), 'list', filters] as const,
  receipt: (id: string) => [...aiAccountingKeys.receipts(), id] as const,
  anomalies: (id: string) => [...aiAccountingKeys.receipt(id), 'anomalies'] as const,
  anomalySummary: (days?: number) => [...aiAccountingKeys.all, 'anomaly-summary', days] as const,
  recurring: (months?: number) => [...aiAccountingKeys.all, 'recurring', months] as const,
  recurringSummary: (months?: number) => [...aiAccountingKeys.all, 'recurring-summary', months] as const,
  predictions: (months?: number) => [...aiAccountingKeys.all, 'predictions', months] as const,
  recurringAnalysis: (months?: number) => [...aiAccountingKeys.all, 'recurring-analysis', months] as const,
};

// Upload receipt with AI analysis
export function useUploadReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => assistantsApi.uploadReceipt(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiAccountingKeys.receipts() });
      toast.success('Receipt uploaded and analyzed / 收據已上傳並分析');
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload receipt: ${error.message}`);
    },
  });
}

// Get receipts list
export function useAIReceipts(filters?: { status?: string; category?: string; date_from?: string; date_to?: string }) {
  return useQuery({
    queryKey: aiAccountingKeys.receiptList(filters),
    queryFn: () => assistantsApi.getReceipts(filters),
  });
}

// Approve receipt with auto journal creation
export function useApproveReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      receiptId,
      options,
    }: {
      receiptId: string;
      options?: { auto_journal?: boolean; auto_post?: boolean; notes?: string };
    }) => assistantsApi.approveReceipt(receiptId, options),
    onSuccess: (result, { receiptId }) => {
      queryClient.invalidateQueries({ queryKey: aiAccountingKeys.receipt(receiptId) });
      queryClient.invalidateQueries({ queryKey: aiAccountingKeys.receipts() });
      
      if (result.journal_created) {
        toast.success(`Approved & Journal Entry Created: ${result.journal_entry?.entry_number} / 已核准並建立分錄`);
      } else {
        toast.success('Receipt approved / 收據已核准');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });
}

// Create journal entry from receipt
export function useCreateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      receiptId,
      options,
    }: {
      receiptId: string;
      options?: { auto_post?: boolean };
    }) => assistantsApi.createJournalEntry(receiptId, options),
    onSuccess: (result, { receiptId }) => {
      queryClient.invalidateQueries({ queryKey: aiAccountingKeys.receipt(receiptId) });
      toast.success(`Journal Entry Created: ${result.journal_entry.entry_number} / 分錄已建立`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create journal entry: ${error.message}`);
    },
  });
}

// Post journal entry
export function usePostJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receiptId: string) => assistantsApi.postJournal(receiptId),
    onSuccess: (result, receiptId) => {
      queryClient.invalidateQueries({ queryKey: aiAccountingKeys.receipt(receiptId) });
      toast.success('Journal entry posted / 分錄已過帳');
    },
    onError: (error: Error) => {
      toast.error(`Failed to post journal: ${error.message}`);
    },
  });
}

// Void journal entry
export function useVoidJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ receiptId, reason }: { receiptId: string; reason?: string }) =>
      assistantsApi.voidJournal(receiptId, reason),
    onSuccess: (_, { receiptId }) => {
      queryClient.invalidateQueries({ queryKey: aiAccountingKeys.receipt(receiptId) });
      toast.success('Journal entry voided / 分錄已作廢');
    },
    onError: (error: Error) => {
      toast.error(`Failed to void journal: ${error.message}`);
    },
  });
}

// Batch create journals
export function useBatchCreateJournals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      receiptIds,
      options,
    }: {
      receiptIds: string[];
      options?: { auto_post?: boolean };
    }) => assistantsApi.batchCreateJournals(receiptIds, options),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: aiAccountingKeys.receipts() });
      toast.success(
        `Created ${result.results.success_count} journal entries (${result.results.failed_count} failed) / 已建立 ${result.results.success_count} 筆分錄`
      );
    },
    onError: (error: Error) => {
      toast.error(`Batch creation failed: ${error.message}`);
    },
  });
}

// Batch approve
export function useBatchApprove() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      receiptIds,
      options,
    }: {
      receiptIds: string[];
      options?: { auto_journal?: boolean; auto_post?: boolean };
    }) => assistantsApi.batchApprove(receiptIds, options),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: aiAccountingKeys.receipts() });
      toast.success(
        `Approved ${result.results.success_count} receipts / 已核准 ${result.results.success_count} 張收據`
      );
    },
    onError: (error: Error) => {
      toast.error(`Batch approval failed: ${error.message}`);
    },
  });
}

// AI Review
export function useAIReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receiptId: string) => assistantsApi.aiReviewReceipt(receiptId),
    onSuccess: (result, receiptId) => {
      queryClient.invalidateQueries({ queryKey: aiAccountingKeys.receipt(receiptId) });
      toast.success('AI review complete / AI審核完成');
    },
    onError: (error: Error) => {
      toast.error(`AI review failed: ${error.message}`);
    },
  });
}

// Detect anomalies
export function useDetectAnomalies(receiptId: string, includeAi?: boolean) {
  return useQuery({
    queryKey: aiAccountingKeys.anomalies(receiptId),
    queryFn: () => assistantsApi.detectAnomalies(receiptId, includeAi),
    enabled: !!receiptId,
  });
}

// Anomaly summary
export function useAnomalySummary(days?: number) {
  return useQuery({
    queryKey: aiAccountingKeys.anomalySummary(days),
    queryFn: () => assistantsApi.getAnomalySummary(days),
  });
}

// Process vendor
export function useProcessVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receiptId: string) => assistantsApi.processVendor(receiptId),
    onSuccess: (result, receiptId) => {
      queryClient.invalidateQueries({ queryKey: aiAccountingKeys.receipt(receiptId) });
      if (result.vendor_result.contact_created) {
        toast.success('New vendor contact created / 已建立新供應商');
      } else if (result.vendor_result.contact) {
        toast.info('Vendor matched to existing contact / 已配對現有供應商');
      }
    },
    onError: (error: Error) => {
      toast.error(`Vendor processing failed: ${error.message}`);
    },
  });
}

// Suggest category
export function useSuggestCategory(vendorName: string) {
  return useQuery({
    queryKey: [...aiAccountingKeys.all, 'suggest-category', vendorName],
    queryFn: () => assistantsApi.suggestCategory(vendorName),
    enabled: !!vendorName,
  });
}

// Recurring expenses
export function useRecurringExpenses(months?: number) {
  return useQuery({
    queryKey: aiAccountingKeys.recurring(months),
    queryFn: () => assistantsApi.getRecurringExpenses(months),
  });
}

// Recurring summary
export function useRecurringSummary(months?: number) {
  return useQuery({
    queryKey: aiAccountingKeys.recurringSummary(months),
    queryFn: () => assistantsApi.getRecurringSummary(months),
  });
}

// Predict expenses
export function usePredictExpenses(monthsAhead?: number) {
  return useQuery({
    queryKey: aiAccountingKeys.predictions(monthsAhead),
    queryFn: () => assistantsApi.predictExpenses(monthsAhead),
  });
}

// Recurring analysis
export function useRecurringAnalysis(months?: number) {
  return useQuery({
    queryKey: aiAccountingKeys.recurringAnalysis(months),
    queryFn: () => assistantsApi.getRecurringAnalysis(months),
  });
}
