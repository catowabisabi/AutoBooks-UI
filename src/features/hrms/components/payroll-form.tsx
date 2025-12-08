"use client";

/**
 * Payroll Form
 * ============
 * Form for creating and editing payroll records with earnings/deductions breakdown.
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, DollarSign, Calculator } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { type Payroll } from "@/features/hrms/services";
import { useQuery } from "@tanstack/react-query";
import { employeesApi, payrollPeriodsApi } from "@/features/hrms/services";

// Payroll status enum
const PAYROLL_STATUSES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "PROCESSING",
  "PAID",
  "CANCELLED",
] as const;

// Form validation schema
const payrollFormSchema = z.object({
  employee: z.string().min(1, "Employee is required"),
  period: z.string().min(1, "Period is required"),
  status: z.enum(PAYROLL_STATUSES),
  
  // Earnings
  basic_salary: z.coerce.number().min(0),
  overtime_pay: z.coerce.number().min(0),
  allowances: z.coerce.number().min(0),
  bonus: z.coerce.number().min(0),
  commission: z.coerce.number().min(0),
  other_earnings: z.coerce.number().min(0),
  
  // Deductions
  tax_deduction: z.coerce.number().min(0),
  mpf_employee: z.coerce.number().min(0),
  mpf_employer: z.coerce.number().min(0),
  insurance_deduction: z.coerce.number().min(0),
  loan_deduction: z.coerce.number().min(0),
  other_deductions: z.coerce.number().min(0),
  
  // Working info
  working_days: z.coerce.number().min(0).int(),
  absent_days: z.coerce.number().min(0),
  overtime_hours: z.coerce.number().min(0),
  
  // Payment
  payment_date: z.date().optional().nullable(),
  payment_reference: z.string().optional(),
  notes: z.string().optional(),
});

type PayrollFormValues = z.infer<typeof payrollFormSchema>;

interface PayrollFormProps {
  initialData?: Payroll | null;
  onSubmit: (data: Partial<Payroll>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// Currency input helper
function CurrencyInput({
  value,
  onChange,
  placeholder = "0.00",
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="number"
        min="0"
        step="0.01"
        className="pl-10"
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </div>
  );
}

export function PayrollForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: PayrollFormProps) {
  const { t } = useTranslation();

  // Fetch employees for dropdown
  const { data: employeesData } = useQuery({
    queryKey: ["employees-list"],
    queryFn: () => employeesApi.list({ limit: 1000 }),
  });

  // Fetch payroll periods
  const { data: periodsData } = useQuery({
    queryKey: ["payroll-periods-list"],
    queryFn: () => payrollPeriodsApi.list({ limit: 100 }),
  });

  const employees = employeesData?.results || [];
  const periods = periodsData?.results || [];

  // Initialize form
  const form = useForm<PayrollFormValues>({
    resolver: zodResolver(payrollFormSchema),
    defaultValues: {
      employee: initialData?.employee || "",
      period: initialData?.period || "",
      status: (initialData?.status as typeof PAYROLL_STATUSES[number]) || "DRAFT",
      basic_salary: initialData?.basic_salary || 0,
      overtime_pay: initialData?.overtime_pay || 0,
      allowances: initialData?.allowances || 0,
      bonus: initialData?.bonus || 0,
      commission: initialData?.commission || 0,
      other_earnings: initialData?.other_earnings || 0,
      tax_deduction: initialData?.tax_deduction || 0,
      mpf_employee: initialData?.mpf_employee || 0,
      mpf_employer: initialData?.mpf_employer || 0,
      insurance_deduction: initialData?.insurance_deduction || 0,
      loan_deduction: initialData?.loan_deduction || 0,
      other_deductions: initialData?.other_deductions || 0,
      working_days: initialData?.working_days || 0,
      absent_days: initialData?.absent_days || 0,
      overtime_hours: initialData?.overtime_hours || 0,
      payment_date: initialData?.payment_date ? new Date(initialData.payment_date) : null,
      payment_reference: initialData?.payment_reference || "",
      notes: initialData?.notes || "",
    },
  });

  // Calculate totals
  const watchedValues = form.watch();
  
  const grossPay = React.useMemo(() => {
    return (
      (watchedValues.basic_salary || 0) +
      (watchedValues.overtime_pay || 0) +
      (watchedValues.allowances || 0) +
      (watchedValues.bonus || 0) +
      (watchedValues.commission || 0) +
      (watchedValues.other_earnings || 0)
    );
  }, [watchedValues]);

  const totalDeductions = React.useMemo(() => {
    return (
      (watchedValues.tax_deduction || 0) +
      (watchedValues.mpf_employee || 0) +
      (watchedValues.insurance_deduction || 0) +
      (watchedValues.loan_deduction || 0) +
      (watchedValues.other_deductions || 0)
    );
  }, [watchedValues]);

  const netPay = grossPay - totalDeductions;

  // Auto-fill basic salary when employee is selected
  const selectedEmployeeId = form.watch("employee");
  React.useEffect(() => {
    if (selectedEmployeeId && !initialData) {
      const employee = employees.find((e) => e.id === selectedEmployeeId);
      if (employee?.base_salary) {
        form.setValue("basic_salary", parseFloat(employee.base_salary.toString()));
      }
    }
  }, [selectedEmployeeId, employees, form, initialData]);

  // Handle form submission
  const handleSubmit = async (values: PayrollFormValues) => {
    await onSubmit({
      ...values,
      payment_date: values.payment_date ? format(values.payment_date, "yyyy-MM-dd") : null,
    } as Partial<Payroll>);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Employee */}
          <FormField
            control={form.control}
            name="employee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("hrms.payroll.employee")}</FormLabel>
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

          {/* Period */}
          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("hrms.payroll.period")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("hrms.payroll.selectPeriod")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("hrms.payroll.status")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("common.selectStatus")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PAYROLL_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(`hrms.payroll.statuses.${status.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Earnings Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-600">
              {t("hrms.payroll.earnings")}
            </CardTitle>
            <CardDescription>
              {t("hrms.payroll.earningsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="basic_salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.payroll.basicSalary")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="overtime_pay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.payroll.overtimePay")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowances"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.payroll.allowances")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bonus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.payroll.bonus")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.payroll.commission")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="other_earnings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.payroll.otherEarnings")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Deductions Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-600">
              {t("hrms.payroll.deductions")}
            </CardTitle>
            <CardDescription>
              {t("hrms.payroll.deductionsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="tax_deduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.payroll.taxDeduction")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mpf_employee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.payroll.mpfEmployee")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mpf_employer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.payroll.mpfEmployer")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("hrms.payroll.mpfEmployerNote")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="insurance_deduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.payroll.insuranceDeduction")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loan_deduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.payroll.loanDeduction")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="other_deductions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.payroll.otherDeductions")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5" />
              {t("hrms.payroll.summary")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("hrms.payroll.grossPay")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                ${grossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("hrms.payroll.totalDeductions")}
              </p>
              <p className="text-2xl font-bold text-red-600">
                -${totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("hrms.payroll.netPay")}
              </p>
              <p className="text-2xl font-bold text-primary">
                ${netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Working Info */}
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="working_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("hrms.payroll.workingDays")}</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="absent_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("hrms.payroll.absentDays")}</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="overtime_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("hrms.payroll.overtimeHours")}</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Payment Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="payment_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("hrms.payroll.paymentDate")}</FormLabel>
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

          <FormField
            control={form.control}
            name="payment_reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("hrms.payroll.paymentReference")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("hrms.payroll.paymentReferencePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("hrms.payroll.notes")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("hrms.payroll.notesPlaceholder")}
                  className="resize-none"
                  rows={2}
                  {...field}
                />
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
              : t("hrms.payroll.createPayroll")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
