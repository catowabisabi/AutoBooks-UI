'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Loader2, MoreHorizontal, Users, Crown, TrendingUp, Search, RefreshCw, Plus } from 'lucide-react';
import { adminSubscriptionApi, AdminUserSubscription, SubscriptionStats } from '@/features/subscription/admin-services';
import { subscriptionApi, SubscriptionPlan, SubscriptionStatus } from '@/features/subscription/services';
import { cn } from '@/lib/utils';

const statusColors: Record<SubscriptionStatus, string> = {
  active: 'bg-green-100 text-green-800',
  trial: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-800',
  expired: 'bg-red-100 text-red-800',
  past_due: 'bg-yellow-100 text-yellow-800',
};

const statusLabels: Record<SubscriptionStatus, string> = {
  active: 'Active',
  trial: 'Trial',
  cancelled: 'Cancelled',
  expired: 'Expired',
  past_due: 'Past Due',
};

export default function AdminSubscriptionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  
  // Modal states
  const [selectedSubscription, setSelectedSubscription] = useState<AdminUserSubscription | null>(null);
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  const [changeStatusDialogOpen, setChangeStatusDialogOpen] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [extendDays, setExtendDays] = useState('30');
  const [newPlanId, setNewPlanId] = useState('');
  const [newStatus, setNewStatus] = useState<SubscriptionStatus>('active');

  // Fetch data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-subscription-stats'],
    queryFn: async () => {
      const response = await adminSubscriptionApi.getStats();
      return response.data;
    },
  });

  const { data: subscriptions, isLoading: subscriptionsLoading, refetch } = useQuery({
    queryKey: ['admin-subscriptions', statusFilter, planFilter, search],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (planFilter && planFilter !== 'all') params.plan_type = planFilter;
      if (search) params.search = search;
      const response = await adminSubscriptionApi.list(params);
      return response.data || [];
    },
  });

  const { data: plans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const response = await subscriptionApi.getPlans();
      return response.data || [];
    },
  });

  // Mutations
  const changePlanMutation = useMutation({
    mutationFn: ({ subscriptionId, planId }: { subscriptionId: string; planId: string }) =>
      adminSubscriptionApi.changePlan(subscriptionId, planId),
    onSuccess: () => {
      toast.success('Plan changed successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-stats'] });
      setChangePlanDialogOpen(false);
    },
    onError: () => toast.error('Failed to change plan'),
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ subscriptionId, status }: { subscriptionId: string; status: SubscriptionStatus }) =>
      adminSubscriptionApi.changeStatus(subscriptionId, status),
    onSuccess: () => {
      toast.success('Status changed successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-stats'] });
      setChangeStatusDialogOpen(false);
    },
    onError: () => toast.error('Failed to change status'),
  });

  const extendMutation = useMutation({
    mutationFn: ({ subscriptionId, days }: { subscriptionId: string; days: number }) =>
      adminSubscriptionApi.extend(subscriptionId, days),
    onSuccess: () => {
      toast.success('Subscription extended successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      setExtendDialogOpen(false);
    },
    onError: () => toast.error('Failed to extend subscription'),
  });

  const isLoading = statsLoading || subscriptionsLoading;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Subscription Management"
            description="Manage user subscriptions and billing."
          />
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        <Separator />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.by_status?.active || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trial</CardTitle>
              <Crown className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.by_status?.trial || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats?.by_status?.cancelled || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Distribution */}
        {stats?.by_plan && Object.keys(stats.by_plan).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Subscriptions by Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {Object.entries(stats.by_plan).map(([plan, count]) => (
                  <div key={plan} className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{plan.replace('_', ' ')}</Badge>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="past_due">Past Due</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="pro_plus">Pro+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subscriptions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
            <CardDescription>
              Manage user subscriptions, change plans, and extend trials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No subscriptions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions?.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{subscription.user?.full_name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{subscription.user?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {subscription.plan?.name || subscription.plan?.plan_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('capitalize', statusColors[subscription.status])}>
                            {statusLabels[subscription.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{subscription.billing_cycle}</TableCell>
                        <TableCell>
                          {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {subscription.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setSelectedSubscription(subscription);
                                setNewPlanId(subscription.plan?.id || '');
                                setChangePlanDialogOpen(true);
                              }}>
                                Change Plan
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedSubscription(subscription);
                                setNewStatus(subscription.status);
                                setChangeStatusDialogOpen(true);
                              }}>
                                Change Status
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedSubscription(subscription);
                                setExtendDays('30');
                                setExtendDialogOpen(true);
                              }}>
                                Extend Subscription
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Change Plan Dialog */}
        <Dialog open={changePlanDialogOpen} onOpenChange={setChangePlanDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Subscription Plan</DialogTitle>
              <DialogDescription>
                Change the plan for {selectedSubscription?.user?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>Select New Plan</Label>
              <Select value={newPlanId} onValueChange={setNewPlanId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans?.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - ${plan.price_monthly}/mo
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setChangePlanDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedSubscription && newPlanId) {
                    changePlanMutation.mutate({
                      subscriptionId: selectedSubscription.id,
                      planId: newPlanId,
                    });
                  }
                }}
                disabled={changePlanMutation.isPending || !newPlanId}
              >
                {changePlanMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Status Dialog */}
        <Dialog open={changeStatusDialogOpen} onOpenChange={setChangeStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Subscription Status</DialogTitle>
              <DialogDescription>
                Change the status for {selectedSubscription?.user?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>Select New Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as SubscriptionStatus)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setChangeStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedSubscription) {
                    changeStatusMutation.mutate({
                      subscriptionId: selectedSubscription.id,
                      status: newStatus,
                    });
                  }
                }}
                disabled={changeStatusMutation.isPending}
              >
                {changeStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Extend Dialog */}
        <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Extend Subscription</DialogTitle>
              <DialogDescription>
                Extend the subscription for {selectedSubscription?.user?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>Number of Days</Label>
              <Input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
                min={1}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExtendDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedSubscription) {
                    extendMutation.mutate({
                      subscriptionId: selectedSubscription.id,
                      days: parseInt(extendDays),
                    });
                  }
                }}
                disabled={extendMutation.isPending || !extendDays}
              >
                {extendMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Extend
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
