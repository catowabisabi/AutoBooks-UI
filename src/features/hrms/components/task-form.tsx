"use client";

/**
 * Task Form
 * =========
 * Form for creating and editing project tasks.
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Clock, Timer } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { type Task } from "@/features/hrms/services";
import { useQuery } from "@tanstack/react-query";
import { projectsApi, usersApi } from "@/features/hrms/services";

// Task status enum
const TASK_STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
  "BLOCKED",
] as const;

// Task priority enum
const TASK_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const;

// Form validation schema
const taskFormSchema = z.object({
  project: z.string().min(1, "Project is required"),
  title: z.string().min(1, "Task title is required").max(255),
  description: z.string().optional(),
  due_date: z.date().optional().nullable(),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  assigned_to: z.string().optional().nullable(),
  estimated_hours: z.coerce.number().min(0).optional(),
  actual_hours: z.coerce.number().min(0).optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  initialData?: Task | null;
  projectId?: string; // Pre-selected project
  onSubmit: (data: Partial<Task>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TaskForm({
  initialData,
  projectId,
  onSubmit,
  onCancel,
  isLoading = false,
}: TaskFormProps) {
  const { t } = useTranslation();

  // Fetch projects for dropdown
  const { data: projectsData } = useQuery({
    queryKey: ["projects-list"],
    queryFn: () => projectsApi.list({ limit: 1000 }),
  });

  // Fetch users for assignee dropdown
  const { data: usersData } = useQuery({
    queryKey: ["users-list"],
    queryFn: () => usersApi.list({ limit: 1000 }),
  });

  const projects = projectsData?.results || [];
  const users = usersData?.results || [];

  // Initialize form
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      project: initialData?.project || projectId || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      due_date: initialData?.due_date ? new Date(initialData.due_date) : null,
      status: (initialData?.status as typeof TASK_STATUSES[number]) || "TODO",
      priority: (initialData?.priority as typeof TASK_PRIORITIES[number]) || "MEDIUM",
      assigned_to: initialData?.assigned_to || null,
      estimated_hours: initialData?.estimated_hours || 0,
      actual_hours: initialData?.actual_hours || 0,
    },
  });

  // Handle form submission
  const handleSubmit = async (values: TaskFormValues) => {
    await onSubmit({
      ...values,
      due_date: values.due_date ? format(values.due_date, "yyyy-MM-dd") : null,
    } as Partial<Task>);
  };

  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: "text-gray-500",
      MEDIUM: "text-blue-500",
      HIGH: "text-orange-500",
      URGENT: "text-red-500",
    };
    return colors[priority] || colors.MEDIUM;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Project */}
        <FormField
          control={form.control}
          name="project"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("hrms.tasks.project")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!!projectId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("hrms.tasks.selectProject")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Task Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("hrms.tasks.title")}</FormLabel>
              <FormControl>
                <Input placeholder={t("hrms.tasks.titlePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("hrms.tasks.description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("hrms.tasks.descriptionPlaceholder")}
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status and Priority */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("hrms.tasks.status")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("common.selectStatus")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TASK_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(`hrms.tasks.statuses.${status.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Priority */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("hrms.tasks.priority")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("hrms.tasks.selectPriority")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TASK_PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        <span className={getPriorityColor(priority)}>
                          {t(`hrms.tasks.priorities.${priority.toLowerCase()}`)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Assigned To */}
        <FormField
          control={form.control}
          name="assigned_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("hrms.tasks.assignedTo")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("hrms.tasks.selectAssignee")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">
                    {t("hrms.tasks.unassigned")}
                  </SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>{t("hrms.tasks.assignedToHelp")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Due Date */}
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("hrms.tasks.dueDate")}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>{t("common.pickDate")}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Time Tracking */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Estimated Hours */}
          <FormField
            control={form.control}
            name="estimated_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("hrms.tasks.estimatedHours")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Timer className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      className="pl-10"
                      placeholder="0"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actual Hours */}
          <FormField
            control={form.control}
            name="actual_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("hrms.tasks.actualHours")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      className="pl-10"
                      placeholder="0"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? t("common.saving")
              : initialData
              ? t("common.saveChanges")
              : t("hrms.tasks.createTask")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
