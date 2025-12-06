'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi, SubscriptionPlan } from '@/features/subscription/services';
import { toast } from 'sonner';
import { Loader2, Check, CreditCard, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const queryClient = useQueryClient();

  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const res = await subscriptionApi.getPlans();
      return Array.isArray(res) ? res : [];
    },
  });

  const { data: mySubscription, isLoading: isLoadingSub } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: subscriptionApi.getMySubscription,
  });

  const subscribeMutation = useMutation({
    mutationFn: (planId: string) => subscriptionApi.subscribe(planId, billingCycle),
    onSuccess: () => {
      toast.success('Subscription updated successfully');
      queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
    },
    onError: () => {
      toast.error('Failed to update subscription');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: subscriptionApi.cancel,
    onSuccess: () => {
      toast.success('Subscription cancelled');
      queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
    },
  });

  const isLoading = isLoadingPlans || isLoadingSub;

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  const currentPlanId = mySubscription?.plan?.id;

  return (
    <PageContainer>
      <div className="space-y-6">
        <Heading
          title="Subscription & Billing"
          description="Manage your plan and billing details."
        />
        <Separator />

        {/* Current Subscription */}
        {mySubscription && mySubscription.status === 'ACTIVE' && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Current Plan: {mySubscription.plan.name}
              </CardTitle>
              <CardDescription>
                Your subscription is active and will renew on {new Date(mySubscription.end_date).toLocaleDateString()}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-background">Status: {mySubscription.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Started: {new Date(mySubscription.start_date).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cancel Subscription
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Plans */}
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant={billingCycle === 'monthly' ? 'default' : 'outline'}
              onClick={() => setBillingCycle('monthly')}
              className="w-32"
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === 'yearly' ? 'default' : 'outline'}
              onClick={() => setBillingCycle('yearly')}
              className="w-32"
            >
              Yearly
              <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800 hover:bg-green-100">
                Save 20%
              </Badge>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3 w-full">
            {plans?.map((plan) => {
              const isCurrent = currentPlanId === plan.id;
              const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
              
              return (
                <Card 
                  key={plan.id} 
                  className={cn(
                    "flex flex-col relative",
                    isCurrent && "border-primary shadow-md"
                  )}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge>Current Plan</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">${price}</span>
                      <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={isCurrent ? "outline" : "default"}
                      disabled={isCurrent || subscribeMutation.isPending}
                      onClick={() => subscribeMutation.mutate(plan.id)}
                    >
                      {subscribeMutation.isPending && !isCurrent ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {isCurrent ? 'Current Plan' : 'Subscribe'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
