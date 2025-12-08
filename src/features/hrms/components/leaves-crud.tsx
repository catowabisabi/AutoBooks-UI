"use client";

/**
 * Leaves CRUD Page
 * ================
 * Full CRUD functionality for leave application management.
 * Includes leave balance display and approval workflow.
 */

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Calendar,
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { HRMSDataTable, StatusBadge } from "@/features/hrms/components/hrms-data-table";
import { LeaveForm } from "@/features/hrms/components/leave-form";
import { leavesApi, type LeaveApplication } from "@/features/hrms/services";
import { format, formatDistanceToNow } from "date-fns";

// Leave Status Badge Component
function LeaveStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    PENDING: {
      variant: "secondary",
      icon: <Clock className="mr-1 h-3 w-3" />,
    },
    APPROVED: {
      variant: "default",
      icon: <CheckCircle className="mr-1 h-3 w-3" />,
    },
    REJECTED: {
      variant: "destructive",
      icon: <XCircle className="mr-1 h-3 w-3" />,
    },
    CANCELLED: {
      variant: "outline",
      icon: <AlertCircle className="mr-1 h-3 w-3" />,
    },
  };

  const config = statusMap[status] || statusMap.PENDING;

  return (
    <Badge variant={config.variant} className="flex w-fit items-center">
      {config.icon}
      {status}
    </Badge>
  );
}

// Leave Type Badge Component
function LeaveTypeBadge({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    SICK: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    CASUAL: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    EARNED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    MATERNITY: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    PATERNITY: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    UNPAID: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    COMPASSIONATE: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    STUDY: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  };

  return (
    <Badge className={colorMap[type] || colorMap.CASUAL} variant="outline">
      {type}
    </Badge>
  );
}

// Leave Balance Card Component
function LeaveBalanceCard({
  title,
  used,
  total,
  icon: Icon,
}: {
  title: string;
  used: number;
  total: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const remaining = total - used;
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{remaining}</div>
        <p className="text-xs text-muted-foreground">
          {used} used / {total} total
        </p>
        <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function LeavesCRUDPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // State
  const [formOpen, setFormOpen] = React.useState(false);
  const [selectedLeave, setSelectedLeave] = React.useState<LeaveApplication | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [actionType, setActionType] = React.useState<"approve" | "reject">("approve");

  // Fetch leaves
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["leaves"],
    queryFn: () => leavesApi.list(),
  });

  const leaves = data?.results || [];

  // Summary stats
  const stats = React.useMemo(() => {
    return {
      pending: leaves.filter((l) => l.status === "PENDING").length,
      approved: leaves.filter((l) => l.status === "APPROVED").length,
      rejected: leaves.filter((l) => l.status === "REJECTED").length,
      total: leaves.length,
    };
  }, [leaves]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<LeaveApplication>) => leavesApi.create(data),
    onSuccess: () => {
      toast.success(t("hrms.leaves.createSuccess"));
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      setFormOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hrms.leaves.createError"));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeaveApplication> }) =>
      leavesApi.update(id, data),
    onSuccess: () => {
      toast.success(t("hrms.leaves.updateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      setFormOpen(false);
      setSelectedLeave(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hrms.leaves.updateError"));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => leavesApi.delete(id),
    onSuccess: () => {
      toast.success(t("hrms.leaves.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hrms.leaves.deleteError"));
    },
  });

  // Approve/Reject mutation
  const approvalMutation = useMutation({
    mutationFn: ({ id, status, rejection_reason }: { id: string; status: string; rejection_reason?: string }) =>
      leavesApi.update(id, { status, rejection_reason }),
    onSuccess: () => {
      const message = actionType === "approve" 
        ? t("hrms.leaves.approveSuccess") 
        : t("hrms.leaves.rejectSuccess");
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      setApprovalDialogOpen(false);
      setSelectedLeave(null);
      setRejectionReason("");
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hrms.leaves.approvalError"));
    },
  });

  // Handle form submit
  const handleSubmit = async (formData: Partial<LeaveApplication>) => {
    if (selectedLeave) {
      await updateMutation.mutateAsync({ id: selectedLeave.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  // Handle edit
  const handleEdit = (leave: LeaveApplication) => {
    setSelectedLeave(leave);
    setFormOpen(true);
  };

  // Handle add
  const handleAdd = () => {
    setSelectedLeave(null);
    setFormOpen(true);
  };

  // Handle view
  const handleView = (leave: LeaveApplication) => {
    router.push(`/dashboard/hrms/leaves/${leave.id}`);
  };

  // Handle delete
  const handleDelete = async (leave: LeaveApplication) => {
    await deleteMutation.mutateAsync(leave.id);
  };

  // Handle approve
  const handleApprove = (leave: LeaveApplication) => {
    setSelectedLeave(leave);
    setActionType("approve");
    setApprovalDialogOpen(true);
  };

  // Handle reject
  const handleReject = (leave: LeaveApplication) => {
    setSelectedLeave(leave);
    setActionType("reject");
    setApprovalDialogOpen(true);
  };

  // Confirm approval/rejection
  const confirmApproval = async () => {
    if (!selectedLeave) return;
    
    await approvalMutation.mutateAsync({
      id: selectedLeave.id,
      status: actionType === "approve" ? "APPROVED" : "REJECTED",
      rejection_reason: actionType === "reject" ? rejectionReason : undefined,
    });
  };

  // Table columns
  const columns: ColumnDef<LeaveApplication>[] = [
    {
      accessorKey: "employee_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("hrms.leaves.employee")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.getValue("employee_name")}</p>
          <p className="text-xs text-muted-foreground">{row.original.employee_id_code}</p>
        </div>
      ),
    },
    {
      accessorKey: "leave_type",
      header: t("hrms.leaves.type"),
      cell: ({ row }) => <LeaveTypeBadge type={row.getValue("leave_type")} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "date_range",
      header: t("hrms.leaves.dateRange"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">
            <p>{format(new Date(row.original.start_date), "MMM d, yyyy")}</p>
            <p className="text-muted-foreground">
              to {format(new Date(row.original.end_date), "MMM d, yyyy")}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "total_days",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("hrms.leaves.days")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("total_days")} days</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: t("hrms.leaves.status"),
      cell: ({ row }) => <LeaveStatusBadge status={row.getValue("status")} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "created_at",
      header: t("common.createdAt"),
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : "-";
      },
    },
    {
      id: "actions_quick",
      header: t("hrms.leaves.quickActions"),
      cell: ({ row }) => {
        const leave = row.original;
        if (leave.status !== "PENDING") return null;
        
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(leave);
              }}
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleReject(leave);
              }}
            >
              <XCircle className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Filter options
  const filterOptions = [
    {
      column: "status",
      title: t("hrms.leaves.status"),
      options: [
        { label: t("hrms.leaves.statuses.pending"), value: "PENDING" },
        { label: t("hrms.leaves.statuses.approved"), value: "APPROVED" },
        { label: t("hrms.leaves.statuses.rejected"), value: "REJECTED" },
        { label: t("hrms.leaves.statuses.cancelled"), value: "CANCELLED" },
      ],
    },
    {
      column: "leave_type",
      title: t("hrms.leaves.type"),
      options: [
        { label: t("hrms.leaves.types.sick"), value: "SICK" },
        { label: t("hrms.leaves.types.casual"), value: "CASUAL" },
        { label: t("hrms.leaves.types.earned"), value: "EARNED" },
        { label: t("hrms.leaves.types.maternity"), value: "MATERNITY" },
        { label: t("hrms.leaves.types.paternity"), value: "PATERNITY" },
        { label: t("hrms.leaves.types.unpaid"), value: "UNPAID" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("hrms.leaves.pendingApprovals")}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {t("hrms.leaves.awaitingReview")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("hrms.leaves.approvedThisMonth")}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("hrms.leaves.rejected")}
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("hrms.leaves.totalApplications")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <HRMSDataTable
        columns={columns}
        data={leaves}
        isLoading={isLoading}
        searchPlaceholder={t("hrms.leaves.searchPlaceholder")}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onRefresh={refetch}
        addButtonLabel={t("hrms.leaves.addApplication")}
      />

      {/* Leave Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedLeave
                ? t("hrms.leaves.editApplication")
                : t("hrms.leaves.newApplication")}
            </DialogTitle>
            <DialogDescription>
              {selectedLeave
                ? t("hrms.leaves.editDescription")
                : t("hrms.leaves.newDescription")}
            </DialogDescription>
          </DialogHeader>
          <LeaveForm
            initialData={selectedLeave}
            onSubmit={handleSubmit}
            onCancel={() => {
              setFormOpen(false);
              setSelectedLeave(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <AlertDialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve"
                ? t("hrms.leaves.confirmApprove")
                : t("hrms.leaves.confirmReject")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve"
                ? t("hrms.leaves.approveDescription")
                : t("hrms.leaves.rejectDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Show leave details */}
          {selectedLeave && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p>
                <span className="font-medium">{t("hrms.leaves.employee")}:</span>{" "}
                {selectedLeave.employee_name}
              </p>
              <p>
                <span className="font-medium">{t("hrms.leaves.type")}:</span>{" "}
                {selectedLeave.leave_type}
              </p>
              <p>
                <span className="font-medium">{t("hrms.leaves.dateRange")}:</span>{" "}
                {format(new Date(selectedLeave.start_date), "MMM d")} -{" "}
                {format(new Date(selectedLeave.end_date), "MMM d, yyyy")}
              </p>
              <p>
                <span className="font-medium">{t("hrms.leaves.days")}:</span>{" "}
                {selectedLeave.total_days}
              </p>
            </div>
          )}

          {/* Rejection reason input */}
          {actionType === "reject" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("hrms.leaves.rejectionReason")}
              </label>
              <Textarea
                placeholder={t("hrms.leaves.rejectionReasonPlaceholder")}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setRejectionReason("");
              setSelectedLeave(null);
            }}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApproval}
              className={actionType === "reject" ? "bg-destructive text-destructive-foreground" : ""}
              disabled={approvalMutation.isPending}
            >
              {approvalMutation.isPending
                ? t("common.processing")
                : actionType === "approve"
                ? t("hrms.leaves.approve")
                : t("hrms.leaves.reject")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
