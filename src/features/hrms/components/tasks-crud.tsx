"use client";

/**
 * Tasks CRUD Page
 * ===============
 * Full CRUD functionality for task management with Kanban-style status display.
 */

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  ListTodo,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Timer,
  User,
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { HRMSDataTable, PriorityBadge } from "@/features/hrms/components/hrms-data-table";
import { TaskForm } from "@/features/hrms/components/task-form";
import { tasksApi, type Task } from "@/features/hrms/services";
import { format, formatDistanceToNow, differenceInDays, isPast } from "date-fns";

// Task Status Badge with icon
function TaskStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { icon: React.ReactNode; className: string }> = {
    TODO: {
      icon: <Circle className="mr-1 h-3 w-3" />,
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    },
    IN_PROGRESS: {
      icon: <Clock className="mr-1 h-3 w-3" />,
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    REVIEW: {
      icon: <AlertTriangle className="mr-1 h-3 w-3" />,
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    DONE: {
      icon: <CheckCircle2 className="mr-1 h-3 w-3" />,
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    BLOCKED: {
      icon: <AlertTriangle className="mr-1 h-3 w-3" />,
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
  };

  const config = statusConfig[status] || statusConfig.TODO;

  return (
    <Badge className={`flex w-fit items-center ${config.className}`} variant="outline">
      {config.icon}
      {status.replace("_", " ")}
    </Badge>
  );
}

// Kanban Card for status overview
function KanbanCard({
  title,
  count,
  icon: Icon,
  colorClass,
}: {
  title: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>{count}</div>
      </CardContent>
    </Card>
  );
}

export default function TasksCRUDPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  // Fetch tasks
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.list(),
  });

  const tasks = data?.results || [];

  // Summary stats by status
  const stats = React.useMemo(() => {
    const now = new Date();
    return {
      todo: tasks.filter((t) => t.status === "TODO").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      review: tasks.filter((t) => t.status === "REVIEW").length,
      done: tasks.filter((t) => t.status === "DONE").length,
      blocked: tasks.filter((t) => t.status === "BLOCKED").length,
      overdue: tasks.filter((t) => {
        if (t.due_date && t.status !== "DONE") {
          return isPast(new Date(t.due_date));
        }
        return false;
      }).length,
      urgent: tasks.filter((t) => t.priority === "URGENT" && t.status !== "DONE").length,
    };
  }, [tasks]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Task>) => tasksApi.create(data),
    onSuccess: () => {
      toast.success(t("hrms.tasks.createSuccess"));
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setFormOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hrms.tasks.createError"));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      tasksApi.update(id, data),
    onSuccess: () => {
      toast.success(t("hrms.tasks.updateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setFormOpen(false);
      setSelectedTask(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hrms.tasks.updateError"));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      toast.success(t("hrms.tasks.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hrms.tasks.deleteError"));
    },
  });

  // Quick status update
  const quickStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      tasksApi.update(id, { status }),
    onSuccess: () => {
      toast.success(t("hrms.tasks.statusUpdated"));
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Handle form submit
  const handleSubmit = async (formData: Partial<Task>) => {
    if (selectedTask) {
      await updateMutation.mutateAsync({ id: selectedTask.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  // Handle edit
  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setFormOpen(true);
  };

  // Handle add
  const handleAdd = () => {
    setSelectedTask(null);
    setFormOpen(true);
  };

  // Handle view
  const handleView = (task: Task) => {
    router.push(`/dashboard/hrms/tasks/${task.id}`);
  };

  // Handle delete
  const handleDelete = async (task: Task) => {
    await deleteMutation.mutateAsync(task.id);
  };

  // Table columns
  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("hrms.tasks.title")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <p className="font-medium">{row.getValue("title")}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.description}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "project_name",
      header: t("hrms.tasks.project"),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue("project_name")}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: t("hrms.tasks.status"),
      cell: ({ row }) => <TaskStatusBadge status={row.getValue("status")} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("hrms.tasks.priority")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <PriorityBadge priority={row.getValue("priority")} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "assigned_to_name",
      header: t("hrms.tasks.assignedTo"),
      cell: ({ row }) => {
        const name = row.getValue("assigned_to_name") as string | null;
        return name ? (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "due_date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("hrms.tasks.dueDate")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const dueDate = row.getValue("due_date") as string | null;
        if (!dueDate) return "-";
        
        const date = new Date(dueDate);
        const isOverdue = isPast(date) && row.original.status !== "DONE";
        
        return (
          <div className={isOverdue ? "text-red-600" : ""}>
            <p>{format(date, "MMM d, yyyy")}</p>
            {isOverdue && (
              <p className="text-xs font-medium">Overdue</p>
            )}
          </div>
        );
      },
    },
    {
      id: "time_tracking",
      header: t("hrms.tasks.timeTracking"),
      cell: ({ row }) => {
        const estimated = row.original.estimated_hours || 0;
        const actual = row.original.actual_hours || 0;
        const overBudget = actual > estimated && estimated > 0;
        
        return (
          <div className="flex items-center gap-2 text-sm">
            <Timer className="h-3 w-3 text-muted-foreground" />
            <span className={overBudget ? "text-red-600" : ""}>
              {actual}h / {estimated}h
            </span>
          </div>
        );
      },
    },
  ];

  // Filter options
  const filterOptions = [
    {
      column: "status",
      title: t("hrms.tasks.status"),
      options: [
        { label: t("hrms.tasks.statuses.todo"), value: "TODO" },
        { label: t("hrms.tasks.statuses.in_progress"), value: "IN_PROGRESS" },
        { label: t("hrms.tasks.statuses.review"), value: "REVIEW" },
        { label: t("hrms.tasks.statuses.done"), value: "DONE" },
        { label: t("hrms.tasks.statuses.blocked"), value: "BLOCKED" },
      ],
    },
    {
      column: "priority",
      title: t("hrms.tasks.priority"),
      options: [
        { label: t("hrms.tasks.priorities.low"), value: "LOW" },
        { label: t("hrms.tasks.priorities.medium"), value: "MEDIUM" },
        { label: t("hrms.tasks.priorities.high"), value: "HIGH" },
        { label: t("hrms.tasks.priorities.urgent"), value: "URGENT" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Kanban Overview */}
      <div className="grid gap-4 md:grid-cols-6">
        <KanbanCard
          title={t("hrms.tasks.statuses.todo")}
          count={stats.todo}
          icon={Circle}
          colorClass="text-gray-600"
        />
        <KanbanCard
          title={t("hrms.tasks.statuses.in_progress")}
          count={stats.inProgress}
          icon={Clock}
          colorClass="text-blue-600"
        />
        <KanbanCard
          title={t("hrms.tasks.statuses.review")}
          count={stats.review}
          icon={AlertTriangle}
          colorClass="text-yellow-600"
        />
        <KanbanCard
          title={t("hrms.tasks.statuses.done")}
          count={stats.done}
          icon={CheckCircle2}
          colorClass="text-green-600"
        />
        <KanbanCard
          title={t("hrms.tasks.statuses.blocked")}
          count={stats.blocked}
          icon={AlertTriangle}
          colorClass="text-red-600"
        />
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("hrms.tasks.overdue")}
            </CardTitle>
            <Timer className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Tasks Alert */}
      {stats.urgent > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                {t("hrms.tasks.urgentAlert")}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {t("hrms.tasks.urgentAlertDescription", { count: stats.urgent })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <HRMSDataTable
        columns={columns}
        data={tasks}
        isLoading={isLoading}
        searchPlaceholder={t("hrms.tasks.searchPlaceholder")}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onRefresh={refetch}
        addButtonLabel={t("hrms.tasks.addTask")}
      />

      {/* Task Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTask
                ? t("hrms.tasks.editTask")
                : t("hrms.tasks.newTask")}
            </DialogTitle>
            <DialogDescription>
              {selectedTask
                ? t("hrms.tasks.editDescription")
                : t("hrms.tasks.newDescription")}
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            initialData={selectedTask}
            onSubmit={handleSubmit}
            onCancel={() => {
              setFormOpen(false);
              setSelectedTask(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
