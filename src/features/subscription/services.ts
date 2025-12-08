import { api } from '@/lib/api';

// Plan types matching backend
export type PlanType = 'free' | 'pro' | 'pro_plus';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due';

// Feature flags available in plans
export interface PlanFeatures {
  has_ai_assistant: boolean;
  has_advanced_analytics: boolean;
  has_custom_reports: boolean;
  has_api_access: boolean;
  has_priority_support: boolean;
  has_sso: boolean;
  has_audit_logs: boolean;
  has_data_export: boolean;
  has_multi_currency: boolean;
  has_custom_branding: boolean;
}

// Plan limits
export interface PlanLimits {
  max_users: number;
  max_companies: number;
  max_storage_gb: number;
  max_documents: number;
  max_invoices_monthly: number;
  max_employees: number;
  max_projects: number;
  ai_queries_monthly: number;
  rag_documents: number;
}

// Feature item for display
export interface FeatureItem {
  key: string;
  en: string;
  zh: string;
}

export interface SubscriptionPlan extends PlanFeatures, PlanLimits {
  id: string;
  plan_type: PlanType;
  name: string;
  name_en: string;
  name_zh: string;
  description: string;
  description_en: string;
  description_zh: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  features: FeatureItem[];
}

export interface UserSubscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  start_date: string;
  end_date: string | null;
  trial_end_date: string | null;
  next_billing_date: string | null;
  cancelled_at: string | null;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
}

export interface SubscriptionResponse {
  success: boolean;
  data: UserSubscription | null;
  message?: string;
}

export interface PlansResponse {
  success: boolean;
  data: SubscriptionPlan[];
}

export const subscriptionApi = {
  getPlans: () => api.get<PlansResponse>('/api/v1/subscription-plans/'),
  getMySubscription: () => api.get<SubscriptionResponse>('/api/v1/my-subscription/'),
  subscribe: (planId: string, billingCycle: BillingCycle) => 
    api.post<SubscriptionResponse>('/api/v1/my-subscription/subscribe/', { plan_id: planId, billing_cycle: billingCycle }),
  cancel: () => api.post<SubscriptionResponse>('/api/v1/my-subscription/cancel/'),
};

// Feature names for type safety
export type FeatureName = keyof PlanFeatures;
export type LimitName = keyof PlanLimits;

// Helper to check if a limit is unlimited (0 means unlimited in backend)
export const isUnlimited = (limit: number): boolean => limit === 0;

// Default free plan features for when no subscription exists
export const FREE_PLAN_FEATURES: PlanFeatures = {
  has_ai_assistant: false,
  has_advanced_analytics: false,
  has_custom_reports: false,
  has_api_access: false,
  has_priority_support: false,
  has_sso: false,
  has_audit_logs: false,
  has_data_export: true,
  has_multi_currency: false,
  has_custom_branding: false,
};

export const FREE_PLAN_LIMITS: PlanLimits = {
  max_users: 1,
  max_companies: 1,
  max_storage_gb: 1,
  max_documents: 50,
  max_invoices_monthly: 10,
  max_employees: 5,
  max_projects: 2,
  ai_queries_monthly: 0,
  rag_documents: 0,
};
