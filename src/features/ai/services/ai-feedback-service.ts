/**
 * AI Feedback Service
 * ====================
 * API calls for AI feedback, results logging, and explainability features.
 */

import { api } from "@/lib/api";

// Types
export interface AIFeedbackType {
  CORRECT: "CORRECT";
  INCORRECT: "INCORRECT";
  PARTIAL: "PARTIAL";
  UNSURE: "UNSURE";
}

export interface AIFeedback {
  id: string;
  result_id: string;
  result_type: string;
  feedback_type: keyof AIFeedbackType;
  feedback_type_display: string;
  field_name?: string;
  original_value?: string;
  corrected_value?: string;
  comment?: string;
  rating?: number;
  user_email: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AIFeedbackCreate {
  result_id?: string;
  result_type?: string;
  feedback_type: keyof AIFeedbackType;
  field_name?: string;
  original_value?: string;
  corrected_value?: string;
  comment?: string;
  rating?: number;
  metadata?: Record<string, unknown>;
}

export interface ExtractionField {
  field_name: string;
  value: string;
  confidence: number;
  source_location?: {
    page?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
  alternatives?: string[];
}

export interface AIResultLog {
  id: string;
  result_id: string;
  result_type: string;
  user_email: string;
  source_content?: string;
  extracted_fields: ExtractionField[];
  overall_confidence: number;
  has_low_confidence: boolean;
  reasoning: Record<string, unknown>;
  classification_factors: Array<{
    factor: string;
    weight: number;
    description?: string;
  }>;
  alternatives_considered: Record<string, unknown>;
  model_version?: string;
  processing_time_ms?: number;
  feedback_count: number;
  positive_feedback_count: number;
  negative_feedback_count: number;
  created_at: string;
}

export interface AIResultLogCreate {
  result_id?: string;
  result_type: string;
  source_content?: string;
  extracted_fields?: ExtractionField[];
  overall_confidence?: number;
  reasoning?: Record<string, unknown>;
  classification_factors?: Array<{
    factor: string;
    weight: number;
    description?: string;
  }>;
  alternatives_considered?: Record<string, unknown>;
  model_version?: string;
  processing_time_ms?: number;
}

export interface AIExplanation {
  result_id: string;
  summary: string;
  reasoning_steps: string[];
  classification_factors: Array<{
    factor: string;
    weight: number;
    description?: string;
  }>;
  confidence_breakdown: Record<string, number>;
  alternatives?: Array<{
    value: string;
    confidence: number;
    reason?: string;
  }>;
}

export interface FeedbackStats {
  total: number;
  by_type: Array<{ feedback_type: string; count: number }>;
  by_result_type: Array<{ result_type: string; count: number }>;
  recent_count: number;
  recent_by_type: Array<{ feedback_type: string; count: number }>;
}

export interface AccuracyReport {
  total_results: number;
  results_with_feedback: number;
  results_with_positive_feedback: number;
  results_with_negative_feedback: number;
  average_confidence: number;
  by_result_type: Array<{
    result_type: string;
    count: number;
    avg_confidence: number;
    feedback_count: number;
  }>;
}

// API Functions

/**
 * Submit AI feedback
 */
export async function submitAIFeedback(data: AIFeedbackCreate): Promise<AIFeedback> {
  const response = await api.post<AIFeedback>("/api/ai/ai-feedback/", data);
  return response.data;
}

/**
 * Submit multiple feedbacks at once
 */
export async function submitBulkFeedback(
  feedbacks: AIFeedbackCreate[]
): Promise<{ created: number; errors: Array<{ index: number; errors: unknown }>; feedbacks: AIFeedback[] }> {
  const response = await api.post("/api/ai/ai-feedback/bulk_submit/", { feedbacks });
  return response.data;
}

/**
 * Get user's feedback history
 */
export async function getMyFeedback(params?: {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}): Promise<{ results: AIFeedback[]; count: number }> {
  const response = await api.get("/api/ai/ai-feedback/", { params });
  return response.data;
}

/**
 * Get feedback statistics
 */
export async function getFeedbackStats(): Promise<FeedbackStats> {
  const response = await api.get<FeedbackStats>("/api/ai/ai-feedback/stats/");
  return response.data;
}

/**
 * Log an AI result with full context
 */
export async function logAIResult(data: AIResultLogCreate): Promise<AIResultLog> {
  const response = await api.post<AIResultLog>("/api/ai/ai-results/", data);
  return response.data;
}

/**
 * Get AI result logs
 */
export async function getAIResults(params?: {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}): Promise<{ results: AIResultLog[]; count: number }> {
  const response = await api.get("/api/ai/ai-results/", { params });
  return response.data;
}

/**
 * Get a specific AI result
 */
export async function getAIResult(resultId: string): Promise<AIResultLog> {
  const response = await api.get<AIResultLog>(`/api/ai/ai-results/${resultId}/`);
  return response.data;
}

/**
 * Get feedbacks for a specific result
 */
export async function getResultFeedbacks(resultId: string): Promise<AIFeedback[]> {
  const response = await api.get<AIFeedback[]>(`/api/ai/ai-results/${resultId}/feedbacks/`);
  return response.data;
}

/**
 * Get accuracy report
 */
export async function getAccuracyReport(): Promise<AccuracyReport> {
  const response = await api.get<AccuracyReport>("/api/ai/ai-results/accuracy_report/");
  return response.data;
}

/**
 * Add reasoning to an existing result
 */
export async function addResultReasoning(
  resultId: string,
  data: {
    reasoning?: Record<string, unknown>;
    classification_factors?: Array<{ factor: string; weight: number; description?: string }>;
    alternatives_considered?: Record<string, unknown>;
  }
): Promise<AIResultLog> {
  const response = await api.post<AIResultLog>(`/api/ai/ai-results/${resultId}/add_reasoning/`, data);
  return response.data;
}

// Helper functions

/**
 * Calculate accuracy percentage from feedback stats
 */
export function calculateAccuracyPercentage(stats: FeedbackStats): number {
  const correct = stats.by_type.find((t) => t.feedback_type === "CORRECT")?.count || 0;
  const total = stats.total;
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Get feedback type color
 */
export function getFeedbackTypeColor(type: keyof AIFeedbackType): string {
  const colors: Record<keyof AIFeedbackType, string> = {
    CORRECT: "text-green-600 bg-green-100",
    INCORRECT: "text-red-600 bg-red-100",
    PARTIAL: "text-yellow-600 bg-yellow-100",
    UNSURE: "text-gray-600 bg-gray-100",
  };
  return colors[type] || colors.UNSURE;
}

/**
 * Format confidence as percentage
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Check if confidence is low (below threshold)
 */
export function isLowConfidence(confidence: number, threshold = 0.7): boolean {
  return confidence < threshold;
}


// =================================================================
// RAG Observability Types & APIs
// =================================================================

export type AIRequestType = 
  | 'CHAT' 
  | 'EMBEDDING' 
  | 'RAG' 
  | 'EXTRACTION' 
  | 'CLASSIFICATION' 
  | 'SUMMARIZATION' 
  | 'TRANSLATION'
  | 'CODE_GEN';

export type AIRequestStatus = 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'RATE_LIMITED' | 'CACHED';

export interface AIRequestLog {
  id: string;
  request_id: string;
  trace_id?: string;
  user_email?: string;
  tenant_id?: string;
  request_type: AIRequestType;
  request_type_display: string;
  status: AIRequestStatus;
  status_display: string;
  provider: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost_cents: number;
  cost_usd: number;
  latency_ms: number;
  ttfb_ms?: number;
  prompt_preview?: string;
  response_preview?: string;
  endpoint?: string;
  assistant_type?: string;
  error_type?: string;
  error_message?: string;
  retry_count: number;
  cache_hit: boolean;
  created_at: string;
}

export interface VectorSearchLog {
  id: string;
  request_log?: string;
  user_email?: string;
  tenant_id?: string;
  query_text: string;
  collection_name: string;
  namespace?: string;
  top_k: number;
  similarity_threshold: number;
  filters_applied?: Record<string, unknown>;
  results_count: number;
  avg_similarity_score?: number;
  max_similarity_score?: number;
  min_similarity_score?: number;
  above_threshold_count: number;
  below_threshold_count: number;
  search_latency_ms: number;
  embedding_latency_ms: number;
  total_latency_ms: number;
  rerank_applied: boolean;
  rerank_model?: string;
  rerank_latency_ms: number;
  quality_indicator: 'GOOD' | 'FAIR' | 'POOR' | 'EMPTY' | 'UNKNOWN';
  is_empty_result: boolean;
  is_low_quality: boolean;
  created_at: string;
}

export type KnowledgeGapType = 
  | 'NO_RESULTS' 
  | 'LOW_SIMILARITY' 
  | 'IRRELEVANT' 
  | 'INCOMPLETE' 
  | 'OUTDATED' 
  | 'USER_FLAGGED';

export type GapPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface KnowledgeGapLog {
  id: string;
  vector_search: string;
  user_email?: string;
  tenant_id?: string;
  query_text: string;
  gap_type: KnowledgeGapType;
  gap_type_display: string;
  expected_topic?: string;
  actual_topics?: string[];
  similarity_scores?: number[];
  user_feedback?: string;
  feedback_rating?: number;
  is_resolved: boolean;
  resolution_notes?: string;
  resolved_by_email?: string;
  resolved_at?: string;
  priority: GapPriority;
  priority_display: string;
  occurrence_count: number;
  created_at: string;
}

export interface AIUsageSummary {
  id: string;
  date: string;
  period_type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  tenant_id: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  success_rate: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  total_cost_cents: number;
  cost_usd: number;
  usage_by_provider: Record<string, { tokens: number; cost: number; requests: number }>;
  usage_by_model: Record<string, { tokens: number; cost: number; requests: number }>;
  usage_by_type: Record<string, { tokens: number; cost: number; requests: number }>;
  avg_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  total_vector_searches: number;
  avg_results_per_search: number;
  avg_similarity_score: number;
  knowledge_gaps_detected: number;
  created_at: string;
}

export interface RAGObservabilityDashboard {
  total_requests: number;
  total_tokens: number;
  total_cost_usd: number;
  avg_latency_ms: number;
  success_rate: number;
  total_vector_searches: number;
  avg_similarity_score: number;
  knowledge_gaps_count: number;
  unresolved_gaps_count: number;
  requests_trend: Array<{ date: string; value: number }>;
  tokens_trend: Array<{ date: string; value: number }>;
  latency_trend: Array<{ date: string; value: number }>;
  cost_trend: Array<{ date: string; value: number }>;
  top_failing_queries: Array<{ query_text: string; count: number; avg_sim: number }>;
  top_knowledge_gaps: Array<{ query_text: string; gap_type: string; occurrence_count: number }>;
  usage_by_model: Record<string, number>;
  usage_by_assistant: Record<string, number>;
}

export interface RequestStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  success_rate: number;
  total_tokens: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_cost_cents: number;
  total_cost_usd: number;
  avg_latency: number;
  avg_tokens: number;
}

export interface CostBreakdown {
  by_provider: Array<{
    provider: string;
    request_count: number;
    total_tokens: number;
    total_cost_cents: number;
  }>;
  by_model: Array<{
    provider: string;
    model: string;
    request_count: number;
    total_tokens: number;
    total_cost_cents: number;
    avg_latency: number;
  }>;
  by_type: Array<{
    request_type: string;
    request_count: number;
    total_tokens: number;
    total_cost_cents: number;
  }>;
}

export interface VectorSearchQualityStats {
  total_searches: number;
  empty_searches: number;
  empty_rate: number;
  avg_results: number;
  avg_similarity: number;
  avg_latency: number;
  good_quality: number;
  good_rate: number;
  fair_quality: number;
  fair_rate: number;
  poor_quality: number;
  poor_rate: number;
}

export interface KnowledgeGapSummary {
  total: number;
  unresolved: number;
  by_type: Array<{ gap_type: string; count: number; total_occurrences: number }>;
  by_priority: Array<{ priority: string; count: number }>;
  top_gaps: Array<{
    id: string;
    query_text: string;
    gap_type: string;
    priority: string;
    occurrence_count: number;
  }>;
}

// RAG Observability API Functions

/**
 * Get RAG Observability Dashboard data
 */
export async function getRAGDashboard(days = 7): Promise<RAGObservabilityDashboard> {
  const response = await api.get<RAGObservabilityDashboard>("/api/ai/rag-dashboard/index/", {
    params: { days },
  });
  return response.data;
}

/**
 * Get AI Request logs with filters
 */
export async function getAIRequestLogs(params?: {
  provider?: string;
  model?: string;
  request_type?: AIRequestType;
  status?: AIRequestStatus;
  assistant_type?: string;
  days?: number;
  page?: number;
  page_size?: number;
}): Promise<{ results: AIRequestLog[]; count: number }> {
  const response = await api.get("/api/ai/ai-requests/", { params });
  return response.data;
}

/**
 * Get AI Request statistics
 */
export async function getAIRequestStats(params?: {
  provider?: string;
  model?: string;
  days?: number;
}): Promise<RequestStats> {
  const response = await api.get<RequestStats>("/api/ai/ai-requests/stats/", { params });
  return response.data;
}

/**
 * Get cost breakdown by provider/model
 */
export async function getCostBreakdown(params?: {
  days?: number;
}): Promise<CostBreakdown> {
  const response = await api.get<CostBreakdown>("/api/ai/ai-requests/cost_breakdown/", { params });
  return response.data;
}

/**
 * Get request trends over time
 */
export async function getRequestTrends(params?: {
  days?: number;
}): Promise<Array<{ date: string; requests: number; tokens: number; cost_cents: number; avg_latency: number }>> {
  const response = await api.get("/api/ai/ai-requests/trends/", { params });
  return response.data;
}

/**
 * Get vector search logs
 */
export async function getVectorSearchLogs(params?: {
  collection?: string;
  min_similarity?: number;
  max_similarity?: number;
  empty_only?: boolean;
  days?: number;
  page?: number;
  page_size?: number;
}): Promise<{ results: VectorSearchLog[]; count: number }> {
  const response = await api.get("/api/ai/vector-searches/", { params });
  return response.data;
}

/**
 * Get vector search quality statistics
 */
export async function getVectorSearchQualityStats(params?: {
  collection?: string;
  days?: number;
}): Promise<VectorSearchQualityStats> {
  const response = await api.get<VectorSearchQualityStats>("/api/ai/vector-searches/quality_stats/", { params });
  return response.data;
}

/**
 * Get failing queries (low similarity or no results)
 */
export async function getFailingQueries(params?: {
  days?: number;
}): Promise<Array<{ query_text: string; failure_count: number; avg_similarity: number; last_occurred: string }>> {
  const response = await api.get("/api/ai/vector-searches/failing_queries/", { params });
  return response.data;
}

/**
 * Get stats by collection
 */
export async function getCollectionStats(params?: {
  days?: number;
}): Promise<Array<{
  collection_name: string;
  search_count: number;
  avg_results: number;
  avg_similarity: number;
  avg_latency: number;
  empty_count: number;
}>> {
  const response = await api.get("/api/ai/vector-searches/collection_stats/", { params });
  return response.data;
}

/**
 * Get knowledge gaps
 */
export async function getKnowledgeGaps(params?: {
  gap_type?: KnowledgeGapType;
  priority?: GapPriority;
  is_resolved?: boolean;
  page?: number;
  page_size?: number;
}): Promise<{ results: KnowledgeGapLog[]; count: number }> {
  const response = await api.get("/api/ai/knowledge-gaps/", { params });
  return response.data;
}

/**
 * Resolve a knowledge gap
 */
export async function resolveKnowledgeGap(
  gapId: string,
  data: { resolution_notes: string; is_resolved?: boolean }
): Promise<KnowledgeGapLog> {
  const response = await api.post<KnowledgeGapLog>(`/api/ai/knowledge-gaps/${gapId}/resolve/`, data);
  return response.data;
}

/**
 * Get knowledge gap summary
 */
export async function getKnowledgeGapSummary(): Promise<KnowledgeGapSummary> {
  const response = await api.get<KnowledgeGapSummary>("/api/ai/knowledge-gaps/summary/");
  return response.data;
}

/**
 * Get usage summaries
 */
export async function getUsageSummaries(params?: {
  period_type?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  start_date?: string;
  end_date?: string;
}): Promise<{ results: AIUsageSummary[]; count: number }> {
  const response = await api.get("/api/ai/usage-summary/", { params });
  return response.data;
}

// Helper functions for RAG Observability

/**
 * Get quality indicator color
 */
export function getQualityIndicatorColor(quality: string): string {
  const colors: Record<string, string> = {
    GOOD: "text-green-600 bg-green-100",
    FAIR: "text-yellow-600 bg-yellow-100",
    POOR: "text-red-600 bg-red-100",
    EMPTY: "text-gray-600 bg-gray-100",
    UNKNOWN: "text-gray-400 bg-gray-50",
  };
  return colors[quality] || colors.UNKNOWN;
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: GapPriority): string {
  const colors: Record<GapPriority, string> = {
    LOW: "text-blue-600 bg-blue-100",
    MEDIUM: "text-yellow-600 bg-yellow-100",
    HIGH: "text-orange-600 bg-orange-100",
    CRITICAL: "text-red-600 bg-red-100",
  };
  return colors[priority] || colors.MEDIUM;
}

/**
 * Format cost in USD
 */
export function formatCostUSD(cents: number): string {
  return `$${(cents / 100).toFixed(4)}`;
}

/**
 * Format latency
 */
export function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Format token count
 */
export function formatTokenCount(tokens: number): string {
  if (tokens < 1000) return String(tokens);
  if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
  return `${(tokens / 1000000).toFixed(2)}M`;
}
