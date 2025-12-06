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
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: accountingKeys.project(projectId),
    queryFn: () => projectApi.getProject(projectId),
    enabled: !!projectId,
  });
}

export function useProjectStats(projectId: string) {
  return useQuery({
    queryKey: accountingKeys.projectStats(projectId),
    queryFn: () => projectApi.getProjectStats(projectId),
    enabled: !!projectId,
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
