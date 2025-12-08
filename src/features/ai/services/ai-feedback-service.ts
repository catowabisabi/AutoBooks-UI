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
