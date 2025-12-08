"use client";

/**
 * Departments CRUD Page
 * =====================
 * Full CRUD functionality for department management with API integration.
 */

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { HRMSDataTable, StatusBadge } from "@/features/hrms/components/hrms-data-table";
import { DepartmentForm } from "@/features/hrms/components/department-form";
import { departmentsApi, type Department } from "@/features/hrms/services";
import { formatDistanceToNow } from "date-fns";

export default function DepartmentsCRUDPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = React.useState(false);
  const [selectedDepartment, setSelectedDepartment] = React.useState<Department | null>(null);

  // Fetch departments
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentsApi.list(),
  });

  const departments = data?.results || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Department>) => departmentsApi.create(data),
    onSuccess: () => {
      toast.success(t("hrms.departments.createSuccess"));
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setFormOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hrms.departments.createError"));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) =>
      departmentsApi.update(id, data),
    onSuccess: () => {
      toast.success(t("hrms.departments.updateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setFormOpen(false);
      setSelectedDepartment(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hrms.departments.updateError"));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: () => {
      toast.success(t("hrms.departments.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hrms.departments.deleteError"));
    },
  });

  // Handle form submit
  const handleSubmit = async (formData: Partial<Department>) => {
    if (selectedDepartment) {
      await updateMutation.mutateAsync({ id: selectedDepartment.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  // Handle edit
  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setFormOpen(true);
  };

  // Handle add
  const handleAdd = () => {
    setSelectedDepartment(null);
    setFormOpen(true);
  };

  // Handle view
  const handleView = (department: Department) => {
    router.push(`/dashboard/hrms/departments/${department.id}`);
  };

  // Handle delete
  const handleDelete = async (department: Department) => {
    await deleteMutation.mutateAsync(department.id);
  };

  // Table columns
  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("hrms.departments.name")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{row.getValue("name")}</p>
            {row.original.code && (
              <p className="text-xs text-muted-foreground">{row.original.code}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: t("hrms.departments.description"),
      cell: ({ row }) => (
        <p className="max-w-[200px] truncate text-sm text-muted-foreground">
          {row.getValue("description") || "-"}
        </p>
      ),
    },
    {
      accessorKey: "manager_name",
      header: t("hrms.departments.manager"),
      cell: ({ row }) => row.getValue("manager_name") || "-",
    },
    {
      accessorKey: "employees_count",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("hrms.departments.employees")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("employees_count") || 0}</Badge>
      ),
    },
    {
      accessorKey: "budget",
      header: t("hrms.departments.budget"),
      cell: ({ row }) => {
        const budget = row.getValue("budget") as number | undefined;
        return budget ? `$${budget.toLocaleString()}` : "-";
      },
    },
    {
      accessorKey: "is_active",
      header: t("common.status"),
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("is_active") ? "ACTIVE" : "INACTIVE"} />
      ),
      filterFn: (row, id, value) => {
        if (value === "active") return row.getValue(id) === true;
        if (value === "inactive") return row.getValue(id) === false;
        return true;
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
  ];

  // Filter options
  const filterOptions = [
    {
      column: "is_active",
      title: t("common.status"),
      options: [
        { label: t("common.active"), value: "active" },
        { label: t("common.inactive"), value: "inactive" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("hrms.departments.title")}</h1>
        <p className="text-muted-foreground">{t("hrms.departments.subtitle")}</p>
      </div>

      <HRMSDataTable
        columns={columns}
        data={departments}
        totalCount={data?.count}
        isLoading={isLoading}
        searchPlaceholder={t("hrms.departments.searchPlaceholder")}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onRefresh={() => refetch()}
      />

      <DepartmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        department={selectedDepartment}
        departments={departments}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
