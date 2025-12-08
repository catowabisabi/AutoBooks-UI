"use client";

/**
 * Payroll CRUD Page
 * =================
 * Full CRUD functionality for payroll management with period selection.
 */

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Wallet,
  DollarSign,
  Users,
  Calendar,
  FileSpreadsheet,
  Download,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { HRMSDataTable, StatusBadge } from "@/features/hrms/components/hrms-data-table";
import { PayrollForm } from "@/features/hrms/components/payroll-form";
import { payrollsApi, payrollPeriodsApi, type Payroll, type PayrollPeriod } from "@/features/hrms/services";
import { format, formatDistanceToNow } from "date-fns";

// Payroll Status Badge Component
function PayrollStatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    PENDING_APPROVAL: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    APPROVED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    PROCESSING: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <Badge className={statusColors[status] || statusColors.DRAFT} variant="outline">
      {status.replace("_", " ")}
    </Badge>
  );
}

export default function PayrollCRUDPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // State
  const [formOpen, setFormOpen] = React.useState(false);
  const [selectedPayroll, setSelectedPayroll] = React.useState<Payroll | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = React.useState<string | null>(null);

  // Fetch payroll periods
  const { data: periodsData } = useQuery({
    queryKey: ["payroll-periods"],
    queryFn: () => payrollPeriodsApi.list({ limit: 100 }),
  });

  const periods = periodsData?.results || [];

  // Fetch payrolls for selected period
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["payrolls", selectedPeriodId],
    queryFn: () => payrollsApi.list({ period: selectedPeriodId || undefined }),
  });

  const payrolls = data?.results || [];

  // Calculate summary stats
  const stats = React.useMemo(() => {
    return {
      totalEmployees: payrolls.length,
      totalGross: payrolls.reduce((sum, p) => sum + (p.gross_pay || 0), 0),
      totalDeductions: payrolls.reduce((sum, p) => sum + (p.total_deductions || 0), 0),
      totalNet: payrolls.reduce((sum, p) => sum + (p.net_pay || 0), 0),
      draft: payrolls.filter((p) => p.status === "DRAFT").length,
      paid: payrolls.filter((p) => p.status === "PAID").length,
    };
  }, [payrolls]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Payroll>) => payrollsApi.create(data),
    onSuccess: () => {
      toast.success(t("hrms.payroll.createSuccess"));
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      setFormOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hrms.payroll.createError"));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Payroll> }) =>
      payrollsApi.update(id, data),
    onSuccess: () => {
      toast.success(t("hrms.payroll.updateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      setFormOpen(false);
      setSelectedPayroll(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hrms.payroll.updateError"));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => payrollsApi.delete(id),
    onSuccess: () => {
      toast.success(t("hrms.payroll.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hrms.payroll.deleteError"));
    },
  });

  // Handle form submit
  const handleSubmit = async (formData: Partial<Payroll>) => {
    if (selectedPayroll) {
      await updateMutation.mutateAsync({ id: selectedPayroll.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  // Handle edit
  const handleEdit = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setFormOpen(true);
  };

  // Handle add
  const handleAdd = () => {
    setSelectedPayroll(null);
    setFormOpen(true);
  };

  // Handle view
  const handleView = (payroll: Payroll) => {
    router.push(`/dashboard/hrms/payroll/${payroll.id}`);
  };

  // Handle delete
  const handleDelete = async (payroll: Payroll) => {
    await deleteMutation.mutateAsync(payroll.id);
  };

  // Get current period
  const currentPeriod = periods.find((p) => p.id === selectedPeriodId);

  // Table columns
  const columns: ColumnDef<Payroll>[] = [
    {
      accessorKey: "employee_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("hrms.payroll.employee")}
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
      accessorKey: "basic_salary",
      header: t("hrms.payroll.basicSalary"),
      cell: ({ row }) => {
        const salary = row.getValue("basic_salary") as number;
        return `$${salary.toLocaleString()}`;
      },
    },
    {
      accessorKey: "gross_pay",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("hrms.payroll.grossPay")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const gross = row.getValue("gross_pay") as number;
        return (
          <span className="font-medium text-green-600">
            ${gross?.toLocaleString() || 0}
          </span>
        );
      },
    },
    {
      accessorKey: "total_deductions",
      header: t("hrms.payroll.deductions"),
      cell: ({ row }) => {
        const deductions = row.getValue("total_deductions") as number;
        return (
          <span className="text-red-600">
            -${deductions?.toLocaleString() || 0}
          </span>
        );
      },
    },
    {
      accessorKey: "net_pay",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("hrms.payroll.netPay")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const net = row.getValue("net_pay") as number;
        return (
          <span className="font-bold text-primary">
            ${net?.toLocaleString() || 0}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("hrms.payroll.status"),
      cell: ({ row }) => <PayrollStatusBadge status={row.getValue("status")} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "payment_date",
      header: t("hrms.payroll.paymentDate"),
      cell: ({ row }) => {
        const date = row.getValue("payment_date") as string | null;
        return date ? format(new Date(date), "MMM d, yyyy") : "-";
      },
    },
  ];

  // Filter options
  const filterOptions = [
    {
      column: "status",
      title: t("hrms.payroll.status"),
      options: [
        { label: t("hrms.payroll.statuses.draft"), value: "DRAFT" },
        { label: t("hrms.payroll.statuses.pending_approval"), value: "PENDING_APPROVAL" },
        { label: t("hrms.payroll.statuses.approved"), value: "APPROVED" },
        { label: t("hrms.payroll.statuses.processing"), value: "PROCESSING" },
        { label: t("hrms.payroll.statuses.paid"), value: "PAID" },
        { label: t("hrms.payroll.statuses.cancelled"), value: "CANCELLED" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>{t("hrms.payroll.selectPeriod")}</CardTitle>
            {currentPeriod && (
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(currentPeriod.start_date), "MMM d")} - {format(new Date(currentPeriod.end_date), "MMM d, yyyy")}
              </p>
            )}
          </div>
          <Select
            value={selectedPeriodId || ""}
            onValueChange={(value) => setSelectedPeriodId(value)}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder={t("hrms.payroll.choosePeriod")} />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {period.name}
                    <Badge variant="outline" className="ml-2">
                      {period.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      {selectedPeriodId && (
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("hrms.payroll.totalEmployees")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("hrms.payroll.totalGross")}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${stats.totalGross.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("hrms.payroll.totalDeductions")}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                -${stats.totalDeductions.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("hrms.payroll.totalNet")}
              </CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${stats.totalNet.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("hrms.payroll.draftRecords")}
              </CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("hrms.payroll.paidRecords")}
              </CardTitle>
              <Wallet className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Table or Empty State */}
      {selectedPeriodId ? (
        <HRMSDataTable
          columns={columns}
          data={payrolls}
          isLoading={isLoading}
          searchPlaceholder={t("hrms.payroll.searchPlaceholder")}
          filterOptions={filterOptions}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onRefresh={refetch}
          addButtonLabel={t("hrms.payroll.addPayroll")}
          additionalActions={
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              {t("hrms.payroll.exportPayroll")}
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("hrms.payroll.noPeriodSelected")}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {t("hrms.payroll.noPeriodSelectedDescription")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payroll Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPayroll
                ? t("hrms.payroll.editPayroll")
                : t("hrms.payroll.newPayroll")}
            </DialogTitle>
            <DialogDescription>
              {selectedPayroll
                ? t("hrms.payroll.editDescription")
                : t("hrms.payroll.newDescription")}
            </DialogDescription>
          </DialogHeader>
          <PayrollForm
            initialData={selectedPayroll}
            onSubmit={handleSubmit}
            onCancel={() => {
              setFormOpen(false);
              setSelectedPayroll(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
