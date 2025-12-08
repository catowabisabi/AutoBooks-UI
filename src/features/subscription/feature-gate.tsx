'use client';

import React from 'react';
import { useSubscription } from './use-subscription';
import { FeatureName, LimitName, PlanType } from './services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FeatureGateProps {
  /** The feature required to access the content */
  feature?: FeatureName;
  /** Minimum plan type required (free, pro, pro_plus) */
  minPlan?: PlanType;
  /** Limit to check against */
  limit?: {
    type: LimitName;
    currentCount: number;
  };
  /** Content to render when feature is available */
  children: React.ReactNode;
  /** Custom fallback content */
  fallback?: React.ReactNode;
  /** Whether to show the default upgrade prompt */
  showUpgradePrompt?: boolean;
  /** Custom title for upgrade prompt */
  upgradeTitle?: string;
  /** Custom description for upgrade prompt */
  upgradeDescription?: string;
}

/**
 * Component to gate features based on subscription plan
 * 
 * @example
 * // Gate by feature
 * <FeatureGate feature="has_ai_assistant">
 *   <AIAssistant />
 * </FeatureGate>
 * 
 * @example
 * // Gate by minimum plan
 * <FeatureGate minPlan="pro">
 *   <AdvancedFeature />
 * </FeatureGate>
 * 
 * @example
 * // Gate by limit
 * <FeatureGate limit={{ type: 'max_projects', currentCount: projects.length }}>
 *   <CreateProjectButton />
 * </FeatureGate>
 */
export function FeatureGate({
  feature,
  minPlan,
  limit,
  children,
  fallback,
  showUpgradePrompt = true,
  upgradeTitle,
  upgradeDescription,
}: FeatureGateProps) {
  const router = useRouter();
  const { hasFeature, isWithinLimit, planType, isLoading } = useSubscription();
  
  // Show loading state or children while loading
  if (isLoading) {
    return <>{children}</>;
  }
  
  // Check feature access
  const hasFeatureAccess = !feature || hasFeature(feature);
  
  // Check minimum plan
  const planHierarchy: PlanType[] = ['free', 'pro', 'pro_plus'];
  const hasPlanAccess = !minPlan || 
    planHierarchy.indexOf(planType as PlanType) >= planHierarchy.indexOf(minPlan);
  
  // Check limit
  const isWithinLimitAccess = !limit || isWithinLimit(limit.type, limit.currentCount);
  
  // If all checks pass, render children
  if (hasFeatureAccess && hasPlanAccess && isWithinLimitAccess) {
    return <>{children}</>;
  }
  
  // Custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Default upgrade prompt
  if (!showUpgradePrompt) {
    return null;
  }
  
  const getUpgradeMessage = () => {
    if (feature) {
      const featureNames: Record<FeatureName, string> = {
        has_ai_assistant: 'AI Assistant',
        has_advanced_analytics: 'Advanced Analytics',
        has_custom_reports: 'Custom Reports',
        has_api_access: 'API Access',
        has_priority_support: 'Priority Support',
        has_sso: 'Single Sign-On',
        has_audit_logs: 'Audit Logs',
        has_data_export: 'Data Export',
        has_multi_currency: 'Multi-Currency',
        has_custom_branding: 'Custom Branding',
      };
      return `Unlock ${featureNames[feature]}`;
    }
    if (minPlan) {
      const planNames: Record<PlanType, string> = {
        free: 'Free',
        pro: 'Pro',
        pro_plus: 'Pro+ Enterprise',
      };
      return `Requires ${planNames[minPlan]} plan`;
    }
    if (limit) {
      const limitNames: Record<LimitName, string> = {
        max_users: 'users',
        max_companies: 'companies',
        max_storage_gb: 'storage',
        max_documents: 'documents',
        max_invoices_monthly: 'invoices',
        max_employees: 'employees',
        max_projects: 'projects',
        ai_queries_monthly: 'AI queries',
        rag_documents: 'knowledge documents',
      };
      return `You've reached your ${limitNames[limit.type]} limit`;
    }
    return 'Upgrade Required';
  };
  
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">
          {upgradeTitle || getUpgradeMessage()}
        </CardTitle>
        <CardDescription>
          {upgradeDescription || 'Upgrade your plan to access this feature.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button onClick={() => router.push('/dashboard/settings/subscription')}>
          <Sparkles className="mr-2 h-4 w-4" />
          Upgrade Now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

interface FeatureBadgeProps {
  feature: FeatureName;
  children: React.ReactNode;
}

/**
 * Badge component that shows a lock icon if feature is not available
 */
export function FeatureBadge({ feature, children }: FeatureBadgeProps) {
  const { hasFeature, isLoading } = useSubscription();
  
  if (isLoading || hasFeature(feature)) {
    return <>{children}</>;
  }
  
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      {children}
      <Lock className="h-3 w-3" />
    </span>
  );
}

interface UpgradeButtonProps {
  feature?: FeatureName;
  minPlan?: PlanType;
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Button that navigates to subscription page
 * Only shows if user doesn't have access to the feature/plan
 */
export function UpgradeButton({
  feature,
  minPlan,
  children = 'Upgrade',
  variant = 'default',
  size = 'sm',
  className,
}: UpgradeButtonProps) {
  const router = useRouter();
  const { hasFeature, planType } = useSubscription();
  
  // Check if upgrade is needed
  const planHierarchy: PlanType[] = ['free', 'pro', 'pro_plus'];
  const needsUpgrade = 
    (feature && !hasFeature(feature)) ||
    (minPlan && planHierarchy.indexOf(planType as PlanType) < planHierarchy.indexOf(minPlan));
  
  if (!needsUpgrade) {
    return null;
  }
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => router.push('/dashboard/settings/subscription')}
    >
      <Sparkles className="mr-1 h-3 w-3" />
      {children}
    </Button>
  );
}

interface LimitProgressProps {
  limit: LimitName;
  currentCount: number;
  showUpgrade?: boolean;
  className?: string;
}

/**
 * Component to show usage progress for a limit
 */
export function LimitProgress({ limit, currentCount, showUpgrade = true, className }: LimitProgressProps) {
  const { getLimit, isLimitUnlimited } = useSubscription();
  const maxLimit = getLimit(limit);
  const isUnlimited = isLimitUnlimited(limit);
  
  const percentage = isUnlimited ? 0 : Math.min(100, (currentCount / maxLimit) * 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-muted-foreground">
          {currentCount} {isUnlimited ? '' : `/ ${maxLimit}`}
        </span>
        {isUnlimited && <span className="text-xs text-green-600">Unlimited</span>}
        {!isUnlimited && isNearLimit && showUpgrade && (
          <UpgradeButton size="sm" variant="link" className="h-auto p-0 text-xs">
            Upgrade for more
          </UpgradeButton>
        )}
      </div>
      {!isUnlimited && (
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isAtLimit ? 'bg-destructive' : isNearLimit ? 'bg-yellow-500' : 'bg-primary'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
