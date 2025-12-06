import { api } from '@/lib/api';

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user: string;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export const subscriptionApi = {
  getPlans: () => api.get<SubscriptionPlan[]>('/api/v1/subscription-plans/'),
  getMySubscription: () => api.get<UserSubscription>('/api/v1/my-subscription/'),
  subscribe: (planId: string, billingCycle: 'monthly' | 'yearly') => 
    api.post<UserSubscription>('/api/v1/my-subscription/subscribe/', { plan_id: planId, billing_cycle: billingCycle }),
  cancel: () => api.post('/api/v1/my-subscription/cancel/'),
};
