import { api } from '@/lib/api';
import { UserSubscription, SubscriptionPlan, SubscriptionStatus } from './services';

// Admin-specific types
export interface AdminUserSubscription extends UserSubscription {
  user: {
    id: string;
    email: string;
    full_name: string;
  };
}

export interface SubscriptionStats {
  total: number;
  by_status: {
    active: number;
    trial: number;
    cancelled: number;
    expired: number;
  };
  by_plan: Record<string, number>;
}

export interface AdminSubscriptionListParams {
  status?: SubscriptionStatus;
  plan_type?: string;
  search?: string;
}

export interface AdminSubscriptionListResponse {
  success: boolean;
  data: AdminUserSubscription[];
  count: number;
}

export interface AdminSubscriptionResponse {
  success: boolean;
  data: AdminUserSubscription;
  message?: string;
}

export interface StatsResponse {
  success: boolean;
  data: SubscriptionStats;
}

export const adminSubscriptionApi = {
  // List all subscriptions with filters
  list: (params?: AdminSubscriptionListParams) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    if (params?.plan_type) queryParams.set('plan_type', params.plan_type);
    if (params?.search) queryParams.set('search', params.search);
    const query = queryParams.toString();
    return api.get<AdminSubscriptionListResponse>(`/api/v1/admin/subscriptions/${query ? `?${query}` : ''}`);
  },

  // Get single subscription
  get: (id: string) => 
    api.get<AdminSubscriptionResponse>(`/api/v1/admin/subscriptions/${id}/`),

  // Change user's plan
  changePlan: (subscriptionId: string, planId: string) =>
    api.post<AdminSubscriptionResponse>(`/api/v1/admin/subscriptions/${subscriptionId}/change-plan/`, { plan_id: planId }),

  // Change subscription status
  changeStatus: (subscriptionId: string, status: SubscriptionStatus) =>
    api.post<AdminSubscriptionResponse>(`/api/v1/admin/subscriptions/${subscriptionId}/change-status/`, { status }),

  // Extend subscription
  extend: (subscriptionId: string, days: number) =>
    api.post<AdminSubscriptionResponse>(`/api/v1/admin/subscriptions/${subscriptionId}/extend/`, { days }),

  // Create subscription for user
  createForUser: (userId: string, planId: string, billingCycle: 'monthly' | 'yearly', status?: SubscriptionStatus) =>
    api.post<AdminSubscriptionResponse>('/api/v1/admin/subscriptions/create-for-user/', {
      user_id: userId,
      plan_id: planId,
      billing_cycle: billingCycle,
      status: status || 'active',
    }),

  // Get subscription statistics
  getStats: () => 
    api.get<StatsResponse>('/api/v1/admin/subscriptions/stats/'),
};
