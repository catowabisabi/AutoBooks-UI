"use client";

/**
 * Projects CRUD Page
 * ==================
 * Full CRUD functionality for project management with progress tracking.
 */

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  FolderKanban,
  Calendar,
  Users,
  DollarSign,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { HRMSDataTable, StatusBadge } from "@/features/hrms/components/hrms-data-table";
import { ProjectForm } from "@/features/hrms/components/project-form";
import { projectsApi, type Project } from "@/features/hrms/services";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

// Project Status Badge Component
function ProjectStatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    CREATED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    ON_HOLD: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <Badge className={statusColors[status] || statusColors.CREATED} variant="outline">
      {status.replace("_", " ")}
    </Badge>
  );
}

// Progress indicator with color
function ProjectProgress({ progress }: { progress: number }) {
  let colorClass = "bg-gray-500";
  if (progress >= 75) colorClass = "bg-green-500";
  else if (progress >= 50) colorClass = "bg-blue-500";
  else if (progress >= 25) colorClass = "bg-yellow-500";
  else if (progress > 0) colorClass = "bg-orange-500";

  return (
    <div className="flex items-center gap-2">
      <Progress value={progress} className="h-2 w-20" />
      <span className="text-sm font-medium">{progress}%</span>
    </div>
  );
}

export default function ProjectsCRUDPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);

  // Fetch projects
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.list(),
  });

  const projects = data?.results || [];

  // Summary stats
  const stats = React.useMemo(() => {
    const now = new Date();
    return {
      total: projects.length,
      inProgress: projects.filter((p) => p.status === "IN_PROGRESS").length,
      completed: projects.filter((p) => p.status === "COMPLETED").length,
      overdue: projects.filter((p) => {
        if (p.end_date && p.status !== "COMPLETED" && p.status !== "CANCELLED") {
          return differenceInDays(new Date(p.end_date), now) < 0;
        }
        return false;
      }).length,
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    };
  }, [projects]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Project>) => projectsApi.create(data),
    onSuccess: () => {
      toast.success(t("hrms.projects.createSuccess"));
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setFormOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hrms.projects.createError"));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      projectsApi.update(id, data),
    onSuccess: () => {
      toast.success(t("hrms.projects.updateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setFormOpen(false);
      setSelectedProject(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hrms.projects.updateError"));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      toast.success(t("hrms.projects.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hrms.projects.deleteError"));
    },
  });

  // Handle form submit
  const handleSubmit = async (formData: Partial<Project>) => {
    if (selectedProject) {
      await updateMutation.mutateAsync({ id: selectedProject.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  // Handle edit
  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormOpen(true);
  };

  // Handle add
  const handleAdd = () => {
    setSelectedProject(null);
    setFormOpen(true);
  };

  // Handle view
  const handleView = (project: Project) => {
    router.push(`/dashboard/hrms/projects/${project.id}`);
  };

  // Handle delete
  const handleDelete = async (project: Project) => {
    await deleteMutation.mutateAsync(project.id);
  };

  // Table columns
  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("hrms.projects.name")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{row.getValue("name")}</p>
            <p className="max-w-[200px] truncate text-xs text-muted-foreground">
              {row.original.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "owner_name",
      header: t("hrms.projects.owner"),
      cell: ({ row }) => row.getValue("owner_name") || "-",
    },
    {
      accessorKey: "status",
      header: t("hrms.projects.status"),
      cell: ({ row }) => <ProjectStatusBadge status={row.getValue("status")} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "progress",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("hrms.projects.progress")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <ProjectProgress progress={row.getValue("progress")} />,
    },
    {
      accessorKey: "tasks_count",
      header: t("hrms.projects.tasks"),
      cell: ({ row }) => (
        <Badge variant="secondary">
          <ListTodo className="mr-1 h-3 w-3" />
          {row.getValue("tasks_count") || 0}
        </Badge>
      ),
    },
    {
      accessorKey: "end_date",
      header: t("hrms.projects.deadline"),
      cell: ({ row }) => {
        const endDate = row.getValue("end_date") as string | null;
        if (!endDate) return "-";
        
        const date = new Date(endDate);
        const now = new Date();
        const daysRemaining = differenceInDays(date, now);
        const isOverdue = daysRemaining < 0 && row.original.status !== "COMPLETED";
        
        return (
          <div className={isOverdue ? "text-red-600" : ""}>
            <p>{format(date, "MMM d, yyyy")}</p>
            <p className="text-xs text-muted-foreground">
              {daysRemaining >= 0
                ? `${daysRemaining} days remaining`
                : `${Math.abs(daysRemaining)} days overdue`}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "budget",
      header: t("hrms.projects.budget"),
      cell: ({ row }) => {
        const budget = row.getValue("budget") as number | null;
        return budget ? `$${budget.toLocaleString()}` : "-";
      },
    },
  ];

  // Filter options
  const filterOptions = [
    {
      column: "status",
      title: t("hrms.projects.status"),
      options: [
        { label: t("hrms.projects.statuses.created"), value: "CREATED" },
        { label: t("hrms.projects.statuses.in_progress"), value: "IN_PROGRESS" },
        { label: t("hrms.projects.statuses.on_hold"), value: "ON_HOLD" },
        { label: t("hrms.projects.statuses.completed"), value: "COMPLETED" },
        { label: t("hrms.projects.statuses.cancelled"), value: "CANCELLED" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("hrms.projects.totalProjects")}
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("hrms.projects.inProgress")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("hrms.projects.completed")}
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("hrms.projects.overdue")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("hrms.projects.totalBudget")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <HRMSDataTable
        columns={columns}
        data={projects}
        isLoading={isLoading}
        searchPlaceholder={t("hrms.projects.searchPlaceholder")}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onRefresh={refetch}
        addButtonLabel={t("hrms.projects.addProject")}
      />

      {/* Project Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProject
                ? t("hrms.projects.editProject")
                : t("hrms.projects.newProject")}
            </DialogTitle>
            <DialogDescription>
              {selectedProject
                ? t("hrms.projects.editDescription")
                : t("hrms.projects.newDescription")}
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            initialData={selectedProject}
            onSubmit={handleSubmit}
            onCancel={() => {
              setFormOpen(false);
              setSelectedProject(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
