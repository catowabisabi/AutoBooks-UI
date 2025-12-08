"use client";

/**
 * Employee Form
 * ==============
 * Form component for creating/editing employees.
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Briefcase, CreditCard, UserCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { type Employee, type Department, type Designation } from "@/features/hrms/services";

const employeeSchema = z.object({
  // Basic info
  employee_id: z.string().min(1, "Employee ID is required"),
  department: z.string().optional(),
  designation: z.string().optional(),
  manager: z.string().optional(),
  employment_status: z.enum(["ACTIVE", "ON_LEAVE", "SUSPENDED", "RESIGNED", "TERMINATED"]),
  employment_type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "PROBATION"]),
  hire_date: z.string().optional(),
  probation_end_date: z.string().optional(),
  
  // Personal info
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  id_number: z.string().optional(),
  phone: z.string().optional(),
  personal_email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  
  // Financial info
  base_salary: z.coerce.number().optional(),
  payment_frequency: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account: z.string().optional(),
  
  is_active: z.boolean().default(true),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Employee>) => Promise<void>;
  employee?: Employee | null;
  departments?: Department[];
  designations?: Designation[];
  employees?: Employee[];
  isLoading?: boolean;
}

export function EmployeeForm({
  open,
  onOpenChange,
  onSubmit,
  employee,
  departments = [],
  designations = [],
  employees = [],
  isLoading = false,
}: EmployeeFormProps) {
  const { t } = useTranslation();
  const isEdit = !!employee;

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employee_id: "",
      employment_status: "ACTIVE",
      employment_type: "FULL_TIME",
      is_active: true,
    },
  });

  // Reset form when employee changes
  React.useEffect(() => {
    if (employee) {
      form.reset({
        employee_id: employee.employee_id || "",
        department: employee.department || "",
        designation: employee.designation || "",
        manager: employee.manager || "",
        employment_status: employee.employment_status || "ACTIVE",
        employment_type: employee.employment_type || "FULL_TIME",
        hire_date: employee.hire_date || "",
        probation_end_date: employee.probation_end_date || "",
        date_of_birth: employee.date_of_birth || "",
        gender: employee.gender || "",
        nationality: employee.nationality || "",
        id_number: employee.id_number || "",
        phone: employee.phone || "",
        personal_email: employee.personal_email || "",
        address: employee.address || "",
        emergency_contact_name: employee.emergency_contact_name || "",
        emergency_contact_phone: employee.emergency_contact_phone || "",
        base_salary: employee.base_salary || undefined,
        payment_frequency: employee.payment_frequency || "",
        bank_name: employee.bank_name || "",
        bank_account: employee.bank_account || "",
        is_active: employee.is_active ?? true,
      });
    } else {
      form.reset({
        employee_id: "",
        employment_status: "ACTIVE",
        employment_type: "FULL_TIME",
        is_active: true,
      });
    }
  }, [employee, form]);

  const handleSubmit = async (data: EmployeeFormValues) => {
    await onSubmit({
      ...data,
      department: data.department || undefined,
      designation: data.designation || undefined,
      manager: data.manager || undefined,
      personal_email: data.personal_email || undefined,
    });
    form.reset();
  };

  // Filter out current employee from manager options
  const managerOptions = employees.filter((e) => e.id !== employee?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("hrms.employees.edit") : t("hrms.employees.create")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("hrms.employees.editDescription")
              : t("hrms.employees.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {t("hrms.employees.basicInfo")}
                </TabsTrigger>
                <TabsTrigger value="personal">
                  <User className="h-4 w-4 mr-2" />
                  {t("hrms.employees.personalInfo")}
                </TabsTrigger>
                <TabsTrigger value="contact">
                  <UserCircle className="h-4 w-4 mr-2" />
                  {t("hrms.employees.contactInfo")}
                </TabsTrigger>
                <TabsTrigger value="financial">
                  <CreditCard className="h-4 w-4 mr-2" />
                  {t("hrms.employees.financialInfo")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employee_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.employeeId")}</FormLabel>
                        <FormControl>
                          <Input placeholder="EMP001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.department")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("hrms.employees.selectDepartment")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((dept) => (
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
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.designation")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("hrms.employees.selectDesignation")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {designations.map((des) => (
                              <SelectItem key={des.id} value={des.id}>
                                {des.name}
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
                    name="manager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.manager")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("hrms.employees.selectManager")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">{t("common.none")}</SelectItem>
                            {managerOptions.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.user_full_name || emp.employee_id}
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
                    name="employment_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.employmentStatus")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                            <SelectItem value="RESIGNED">Resigned</SelectItem>
                            <SelectItem value="TERMINATED">Terminated</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.employmentType")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FULL_TIME">Full Time</SelectItem>
                            <SelectItem value="PART_TIME">Part Time</SelectItem>
                            <SelectItem value="CONTRACT">Contract</SelectItem>
                            <SelectItem value="INTERN">Intern</SelectItem>
                            <SelectItem value="PROBATION">Probation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hire_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.hireDate")}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="probation_end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.probationEndDate")}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="personal" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.dateOfBirth")}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.gender")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("hrms.employees.selectGender")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.nationality")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="id_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.idNumber")}</FormLabel>
                        <FormControl>
                          <Input placeholder="ID/Passport Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.phone")}</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="personal_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.personalEmail")}</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("hrms.employees.address")}</FormLabel>
                      <FormControl>
                        <Textarea className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergency_contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.emergencyContactName")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergency_contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.emergencyContactPhone")}</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="base_salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.baseSalary")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
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
                    name="payment_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.paymentFrequency")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.bankName")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bank_account"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hrms.employees.bankAccount")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>{t("common.active")}</FormLabel>
                        <FormDescription>
                          {t("hrms.employees.activeDescription")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
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
