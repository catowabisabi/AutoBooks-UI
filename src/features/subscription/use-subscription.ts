'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  subscriptionApi, 
  UserSubscription, 
  SubscriptionPlan,
  FeatureName,
  LimitName,
  FREE_PLAN_FEATURES,
  FREE_PLAN_LIMITS,
  isUnlimited,
  BillingCycle,
} from './services';

// Query keys for caching
export const subscriptionKeys = {
  all: ['subscription'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  mySubscription: () => [...subscriptionKeys.all, 'my-subscription'] as const,
};

/**
 * Hook to get all available subscription plans
 */
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: async () => {
      const response = await subscriptionApi.getPlans();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get current user's subscription
 */
export function useMySubscription() {
  return useQuery({
    queryKey: subscriptionKeys.mySubscription(),
    queryFn: async () => {
      const response = await subscriptionApi.getMySubscription();
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to subscribe to a plan
 */
export function useSubscribe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ planId, billingCycle }: { planId: string; billingCycle: BillingCycle }) => 
      subscriptionApi.subscribe(planId, billingCycle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.mySubscription() });
    },
  });
}

/**
 * Hook to cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: subscriptionApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.mySubscription() });
    },
  });
}

/**
 * Main hook for subscription features and limits
 * Provides easy access to feature checks and limit validation
 */
export function useSubscription() {
  const { data: subscription, isLoading, error } = useMySubscription();
  const plan = subscription?.plan;
  
  /**
   * Check if user has access to a feature
   */
  const hasFeature = (feature: FeatureName): boolean => {
    if (!plan) return FREE_PLAN_FEATURES[feature];
    return plan[feature];
  };
  
  /**
   * Get a specific limit value
   * Returns 0 for unlimited
   */
  const getLimit = (limit: LimitName): number => {
    if (!plan) return FREE_PLAN_LIMITS[limit];
    return plan[limit];
  };
  
  /**
   * Check if a limit is unlimited
   */
  const isLimitUnlimited = (limit: LimitName): boolean => {
    return isUnlimited(getLimit(limit));
  };
  
  /**
   * Check if user is within a specific limit
   */
  const isWithinLimit = (limit: LimitName, currentCount: number): boolean => {
    const maxLimit = getLimit(limit);
    if (maxLimit === 0) return true; // Unlimited
    return currentCount < maxLimit;
  };
  
  /**
   * Get plan type (free, pro, pro_plus)
   */
  const planType = plan?.plan_type || 'free';
  
  /**
   * Check if user is on free plan
   */
  const isFreePlan = planType === 'free';
  
  /**
   * Check if user is on pro plan or higher
   */
  const isProOrHigher = planType === 'pro' || planType === 'pro_plus';
  
  /**
   * Check if user is on pro+ plan
   */
  const isProPlus = planType === 'pro_plus';
  
  /**
   * Check if subscription is active
   */
  const isActive = subscription?.status === 'active' || subscription?.status === 'trial';
  
  /**
   * Check if subscription is in trial
   */
  const isTrial = subscription?.status === 'trial';
  
  /**
   * Get days remaining in trial
   */
  const trialDaysRemaining = (): number | null => {
    if (!subscription?.trial_end_date) return null;
    const trialEnd = new Date(subscription.trial_end_date);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };
  
  return {
    // Data
    subscription,
    plan,
    planType,
    isLoading,
    error,
    
    // Status checks
    isActive,
    isTrial,
    isFreePlan,
    isProOrHigher,
    isProPlus,
    
    // Feature checks
    hasFeature,
    
    // Limit checks
    getLimit,
    isLimitUnlimited,
    isWithinLimit,
    
    // Helpers
    trialDaysRemaining,
  };
}

export type UseSubscriptionReturn = ReturnType<typeof useSubscription>;
