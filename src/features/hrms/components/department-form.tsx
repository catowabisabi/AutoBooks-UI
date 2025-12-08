"use client";

/**
 * Department Form
 * ===============
 * Form component for creating/editing departments.
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { type Department } from "@/features/hrms/services";

const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  code: z.string().optional(),
  parent: z.string().optional(),
  manager: z.string().optional(),
  budget: z.coerce.number().optional(),
  is_active: z.boolean().default(true),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Department>) => Promise<void>;
  department?: Department | null;
  departments?: Department[];
  isLoading?: boolean;
}

export function DepartmentForm({
  open,
  onOpenChange,
  onSubmit,
  department,
  departments = [],
  isLoading = false,
}: DepartmentFormProps) {
  const { t } = useTranslation();
  const isEdit = !!department;

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
      parent: "",
      manager: "",
      budget: undefined,
      is_active: true,
    },
  });

  // Reset form when department changes
  React.useEffect(() => {
    if (department) {
      form.reset({
        name: department.name || "",
        description: department.description || "",
        code: department.code || "",
        parent: department.parent || "",
        manager: department.manager || "",
        budget: department.budget || undefined,
        is_active: department.is_active ?? true,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        code: "",
        parent: "",
        manager: "",
        budget: undefined,
        is_active: true,
      });
    }
  }, [department, form]);

  const handleSubmit = async (data: DepartmentFormValues) => {
    await onSubmit({
      ...data,
      parent: data.parent || undefined,
      manager: data.manager || undefined,
    });
    form.reset();
  };

  // Filter out current department from parent options
  const parentOptions = departments.filter((d) => d.id !== department?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("hrms.departments.edit") : t("hrms.departments.create")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("hrms.departments.editDescription")
              : t("hrms.departments.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.departments.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("hrms.departments.namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.departments.code")}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ENG, HR, FIN" {...field} />
                  </FormControl>
                  <FormDescription>
                    {t("hrms.departments.codeDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.departments.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("hrms.departments.descriptionPlaceholder")}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.departments.parent")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("hrms.departments.selectParent")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">{t("common.none")}</SelectItem>
                      {parentOptions.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hrms.departments.budget")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{t("common.active")}</FormLabel>
                    <FormDescription>
                      {t("hrms.departments.activeDescription")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? t("common.save") : t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
