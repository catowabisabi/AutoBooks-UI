"use client";

/**
 * Project Form
 * ============
 * Form for creating and editing HR projects.
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, DollarSign, Percent } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
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
import { type Project } from "@/features/hrms/services";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/features/hrms/services";

// Project status enum
const PROJECT_STATUSES = [
  "CREATED",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
] as const;

// Form validation schema
const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required").max(255),
  description: z.string().optional(),
  start_date: z.date({ required_error: "Start date is required" }),
  end_date: z.date().optional().nullable(),
  status: z.enum(PROJECT_STATUSES),
  owner: z.string().min(1, "Project owner is required"),
  budget: z.coerce.number().min(0, "Budget must be positive").optional(),
  progress: z.coerce.number().min(0).max(100),
}).refine((data) => {
  if (data.end_date && data.start_date) {
    return data.end_date >= data.start_date;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["end_date"],
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  initialData?: Project | null;
  onSubmit: (data: Partial<Project>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProjectFormProps) {
  const { t } = useTranslation();

  // Fetch users for owner dropdown
  const { data: usersData } = useQuery({
    queryKey: ["users-list"],
    queryFn: () => usersApi.list({ limit: 1000 }),
  });

  const users = usersData?.results || [];

  // Initialize form
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      start_date: initialData?.start_date ? new Date(initialData.start_date) : new Date(),
      end_date: initialData?.end_date ? new Date(initialData.end_date) : null,
      status: (initialData?.status as typeof PROJECT_STATUSES[number]) || "CREATED",
      owner: initialData?.owner || "",
      budget: initialData?.budget || 0,
      progress: initialData?.progress || 0,
    },
  });

  // Handle form submission
  const handleSubmit = async (values: ProjectFormValues) => {
    await onSubmit({
      ...values,
      start_date: format(values.start_date, "yyyy-MM-dd"),
      end_date: values.end_date ? format(values.end_date, "yyyy-MM-dd") : null,
    } as Partial<Project>);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Project Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("hrms.projects.name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("hrms.projects.namePlaceholder")} {...field} />
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
              <FormLabel>{t("hrms.projects.description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("hrms.projects.descriptionPlaceholder")}
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Owner */}
        <FormField
          control={form.control}
          name="owner"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("hrms.projects.owner")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("hrms.projects.selectOwner")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Range */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Start Date */}
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("hrms.projects.startDate")}</FormLabel>
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
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Date */}
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("hrms.projects.endDate")}</FormLabel>
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
                <FormDescription>{t("hrms.projects.endDateHelp")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("hrms.projects.status")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.selectStatus")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROJECT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`hrms.projects.statuses.${status.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Budget */}
        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("hrms.projects.budget")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    className="pl-10"
                    placeholder="0.00"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Progress */}
        <FormField
          control={form.control}
          name="progress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                {t("hrms.projects.progress")}
                <span className="text-sm font-normal text-muted-foreground">
                  {field.value}%
                </span>
              </FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[field.value]}
                    onValueChange={(values) => field.onChange(values[0])}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <div className="flex w-16 items-center">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      className="h-8 text-center"
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                    <Percent className="ml-1 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              : t("hrms.projects.createProject")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
