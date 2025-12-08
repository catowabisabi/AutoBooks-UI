"use client";

/**
 * Leave Application Form
 * ======================
 * Form for creating and editing leave applications.
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";
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
import { type LeaveApplication } from "@/features/hrms/services";
import { useQuery } from "@tanstack/react-query";
import { employeesApi } from "@/features/hrms/services";

// Leave types enum
const LEAVE_TYPES = [
  "SICK",
  "CASUAL",
  "EARNED",
  "MATERNITY",
  "PATERNITY",
  "UNPAID",
  "COMPASSIONATE",
  "STUDY",
] as const;

const LEAVE_STATUS = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;

// Form validation schema
const leaveFormSchema = z.object({
  employee: z.string().min(1, "Employee is required"),
  leave_type: z.enum(LEAVE_TYPES, { required_error: "Leave type is required" }),
  start_date: z.date({ required_error: "Start date is required" }),
  end_date: z.date({ required_error: "End date is required" }),
  total_days: z.coerce.number().min(0.5, "Minimum 0.5 days"),
  reason: z.string().optional(),
  status: z.enum(LEAVE_STATUS).optional(),
}).refine((data) => data.end_date >= data.start_date, {
  message: "End date must be after start date",
  path: ["end_date"],
});

type LeaveFormValues = z.infer<typeof leaveFormSchema>;

interface LeaveFormProps {
  initialData?: LeaveApplication | null;
  onSubmit: (data: Partial<LeaveApplication>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isManager?: boolean; // Show approval fields for managers
}

export function LeaveForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isManager = false,
}: LeaveFormProps) {
  const { t } = useTranslation();

  // Fetch employees for dropdown
  const { data: employeesData } = useQuery({
    queryKey: ["employees-list"],
    queryFn: () => employeesApi.list({ limit: 1000 }),
  });

  const employees = employeesData?.results || [];

  // Initialize form
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      employee: initialData?.employee || "",
      leave_type: initialData?.leave_type as typeof LEAVE_TYPES[number] || "CASUAL",
      start_date: initialData?.start_date ? new Date(initialData.start_date) : undefined,
      end_date: initialData?.end_date ? new Date(initialData.end_date) : undefined,
      total_days: initialData?.total_days || 1,
      reason: initialData?.reason || "",
      status: initialData?.status as typeof LEAVE_STATUS[number] || "PENDING",
    },
  });

  // Auto-calculate total days when dates change
  const startDate = form.watch("start_date");
  const endDate = form.watch("end_date");

  React.useEffect(() => {
    if (startDate && endDate) {
      const days = differenceInDays(endDate, startDate) + 1;
      if (days > 0) {
        form.setValue("total_days", days);
      }
    }
  }, [startDate, endDate, form]);

  // Handle form submission
  const handleSubmit = async (values: LeaveFormValues) => {
    await onSubmit({
      ...values,
      start_date: format(values.start_date, "yyyy-MM-dd"),
      end_date: format(values.end_date, "yyyy-MM-dd"),
    } as Partial<LeaveApplication>);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Employee */}
        <FormField
          control={form.control}
          name="employee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("hrms.leaves.employee")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!!initialData}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("hrms.employees.selectEmployee")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.user_full_name} ({emp.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Leave Type */}
        <FormField
          control={form.control}
          name="leave_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("hrms.leaves.type")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("hrms.leaves.selectType")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LEAVE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`hrms.leaves.types.${type.toLowerCase()}`)}
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
                <FormLabel>{t("hrms.leaves.startDate")}</FormLabel>
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
                <FormLabel>{t("hrms.leaves.endDate")}</FormLabel>
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
                      disabled={(date) =>
                        startDate ? date < startDate : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Total Days */}
        <FormField
          control={form.control}
          name="total_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("hrms.leaves.totalDays")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                {t("hrms.leaves.totalDaysHelp")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reason */}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("hrms.leaves.reason")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("hrms.leaves.reasonPlaceholder")}
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status (Manager only) */}
        {isManager && initialData && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("hrms.leaves.status")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("common.selectStatus")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LEAVE_STATUS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(`hrms.leaves.statuses.${status.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
              : t("hrms.leaves.submitApplication")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
