'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Loader2, Calendar, ChevronDown, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { financialReportApi, projectApi, accountsApi } from '@/features/accounting-workspace/services';
import type { FinancialReportTypeInfo, GenerateFinancialReportInput, AccountingProject, Account } from '@/features/accounting-workspace/types';
import api from '@/lib/api';

const formSchema = z.object({
  name: z.string().min(1, 'Report name is required').max(200),
  report_type: z.string().min(1, 'Report type is required'),
  period_start: z.string().min(1, 'Start date is required'),
  period_end: z.string().min(1, 'End date is required'),
  include_comparison: z.boolean().default(false),
  comparison_period_start: z.string().optional(),
  comparison_period_end: z.string().optional(),
  notes: z.string().optional(),
  // Filter fields
  project_ids: z.array(z.string()).optional(),
  vendor_ids: z.array(z.string()).optional(),
  account_ids: z.array(z.string()).optional(),
  account_types: z.array(z.string()).optional(),
  include_zero_balances: z.boolean().default(false),
}).refine(data => {
  if (data.include_comparison) {
    return data.comparison_period_start && data.comparison_period_end;
  }
  return true;
}, {
  message: 'Comparison dates are required when comparison is enabled',
  path: ['comparison_period_start'],
});

// Vendor/Contact interface
interface Contact {
  id: string;
  company_name?: string;
  first_name?: string;
  last_name?: string;
  contact_type: string;
}

interface GenerateReportModalProps {
  open: boolean;
  onClose: () => void;
  reportTypes: FinancialReportTypeInfo[];
  onSuccess: () => void;
}

export function GenerateReportModal({
  open,
  onClose,
  reportTypes,
  onSuccess,
}: GenerateReportModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Filter data states
  const [projects, setProjects] = useState<AccountingProject[]>([]);
  const [vendors, setVendors] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      report_type: '',
      period_start: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
      period_end: format(new Date(), 'yyyy-MM-dd'),
      include_comparison: false,
      comparison_period_start: '',
      comparison_period_end: '',
      notes: '',
      project_ids: [],
      vendor_ids: [],
      account_ids: [],
      account_types: [],
      include_zero_balances: false,
    },
  });

  const includeComparison = form.watch('include_comparison');
  const selectedProjectIds = form.watch('project_ids') || [];
  const selectedVendorIds = form.watch('vendor_ids') || [];
  const selectedAccountIds = form.watch('account_ids') || [];
  const selectedAccountTypes = form.watch('account_types') || [];

  // Fetch filter data when modal opens
  useEffect(() => {
    if (open) {
      fetchFilterData();
    }
  }, [open]);

  const fetchFilterData = async () => {
    setLoadingFilters(true);
    try {
      const [projectsRes, vendorsRes, accountsRes] = await Promise.all([
        projectApi.getProjects({ page_size: 100 }).catch(() => ({ results: [] })),
        api.getContacts({ contact_type: 'VENDOR', page_size: 100 }).catch(() => ({ results: [] })),
        accountsApi.getAccounts({ is_active: true }).catch(() => []),
      ]);
      
      setProjects(projectsRes.results || []);
      setVendors(vendorsRes.results || []);
      setAccounts(Array.isArray(accountsRes) ? accountsRes : []);
    } catch (err) {
      console.error('Error fetching filter data:', err);
    } finally {
      setLoadingFilters(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const reportData: GenerateFinancialReportInput = {
        name: values.name,
        report_type: values.report_type as any,
        period_start: values.period_start,
        period_end: values.period_end,
        include_comparison: values.include_comparison,
        notes: values.notes,
      };

      if (values.include_comparison && values.comparison_period_start && values.comparison_period_end) {
        reportData.comparison_period_start = values.comparison_period_start;
        reportData.comparison_period_end = values.comparison_period_end;
      }

      // Add filters if any are selected
      const hasFilters = 
        (values.project_ids && values.project_ids.length > 0) ||
        (values.vendor_ids && values.vendor_ids.length > 0) ||
        (values.account_ids && values.account_ids.length > 0) ||
        (values.account_types && values.account_types.length > 0) ||
        values.include_zero_balances;

      if (hasFilters) {
        reportData.filters = {};
        if (values.project_ids && values.project_ids.length > 0) {
          reportData.filters.project_ids = values.project_ids;
        }
        if (values.vendor_ids && values.vendor_ids.length > 0) {
          reportData.filters.vendor_ids = values.vendor_ids;
        }
        if (values.account_ids && values.account_ids.length > 0) {
          reportData.filters.account_ids = values.account_ids;
        }
        if (values.account_types && values.account_types.length > 0) {
          reportData.filters.account_types = values.account_types as any;
        }
      }

      // Add display config
      if (values.include_zero_balances) {
        reportData.display_config = {
          show_zero_balances: values.include_zero_balances,
        };
      }

      await financialReportApi.generateReport(reportData);
      form.reset();
      onSuccess();
    } catch (err: any) {
      console.error('Error generating report:', err);
      setError(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setError(null);
    setFiltersOpen(false);
    onClose();
  };

  // Set default name when report type changes
  const handleReportTypeChange = (value: string) => {
    form.setValue('report_type', value);
    const typeInfo = reportTypes.find(t => t.value === value);
    if (typeInfo && !form.getValues('name')) {
      const today = format(new Date(), 'MMM yyyy');
      form.setValue('name', `${typeInfo.label} - ${today}`);
    }
  };

  // Toggle selection helpers
  const toggleProject = (projectId: string) => {
    const current = form.getValues('project_ids') || [];
    if (current.includes(projectId)) {
      form.setValue('project_ids', current.filter(id => id !== projectId));
    } else {
      form.setValue('project_ids', [...current, projectId]);
    }
  };

  const toggleVendor = (vendorId: string) => {
    const current = form.getValues('vendor_ids') || [];
    if (current.includes(vendorId)) {
      form.setValue('vendor_ids', current.filter(id => id !== vendorId));
    } else {
      form.setValue('vendor_ids', [...current, vendorId]);
    }
  };

  const toggleAccount = (accountId: string) => {
    const current = form.getValues('account_ids') || [];
    if (current.includes(accountId)) {
      form.setValue('account_ids', current.filter(id => id !== accountId));
    } else {
      form.setValue('account_ids', [...current, accountId]);
    }
  };

  const toggleAccountType = (accountType: string) => {
    const current = form.getValues('account_types') || [];
    if (current.includes(accountType)) {
      form.setValue('account_types', current.filter(t => t !== accountType));
    } else {
      form.setValue('account_types', [...current, accountType]);
    }
  };

  const clearAllFilters = () => {
    form.setValue('project_ids', []);
    form.setValue('vendor_ids', []);
    form.setValue('account_ids', []);
    form.setValue('account_types', []);
    form.setValue('include_zero_balances', false);
  };

  const activeFiltersCount = 
    selectedProjectIds.length + 
    selectedVendorIds.length + 
    selectedAccountIds.length + 
    selectedAccountTypes.length;

  const accountTypes = [
    { value: 'ASSET', label: 'Assets' },
    { value: 'LIABILITY', label: 'Liabilities' },
    { value: 'EQUITY', label: 'Equity' },
    { value: 'REVENUE', label: 'Revenue' },
    { value: 'EXPENSE', label: 'Expenses' },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Financial Report</DialogTitle>
          <DialogDescription>
            Create a new financial report with customizable parameters
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="report_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={handleReportTypeChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex flex-col">
                            <span>{type.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {type.description}
                            </span>
                          </div>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter report name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="period_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period Start</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="date" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="period_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period End</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="date" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="include_comparison"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Include Comparison Period</FormLabel>
                    <FormDescription>
                      Compare with a previous period (e.g., prior year)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {includeComparison && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="comparison_period_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comparison Start</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comparison_period_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comparison End</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Advanced Filters Section */}
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Advanced Filters</span>
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeFiltersCount} active
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                {loadingFilters ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading filters...</span>
                  </div>
                ) : (
                  <>
                    {/* Projects Filter */}
                    {projects.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Projects</Label>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border rounded-md">
                          {projects.map((project) => (
                            <Badge
                              key={project.id}
                              variant={selectedProjectIds.includes(project.id) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleProject(project.id)}
                            >
                              {project.name}
                              {selectedProjectIds.includes(project.id) && (
                                <X className="ml-1 h-3 w-3" />
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Vendors Filter */}
                    {vendors.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Vendors</Label>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border rounded-md">
                          {vendors.map((vendor) => (
                            <Badge
                              key={vendor.id}
                              variant={selectedVendorIds.includes(vendor.id) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleVendor(vendor.id)}
                            >
                              {vendor.company_name || `${vendor.first_name} ${vendor.last_name}`}
                              {selectedVendorIds.includes(vendor.id) && (
                                <X className="ml-1 h-3 w-3" />
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Account Types Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Account Types</Label>
                      <div className="flex flex-wrap gap-2">
                        {accountTypes.map((type) => (
                          <Badge
                            key={type.value}
                            variant={selectedAccountTypes.includes(type.value) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleAccountType(type.value)}
                          >
                            {type.label}
                            {selectedAccountTypes.includes(type.value) && (
                              <X className="ml-1 h-3 w-3" />
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Specific Accounts Filter */}
                    {accounts.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Specific Accounts</Label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                          {accounts.slice(0, 20).map((account) => (
                            <Badge
                              key={account.id}
                              variant={selectedAccountIds.includes(account.id) ? "default" : "outline"}
                              className="cursor-pointer text-xs"
                              onClick={() => toggleAccount(account.id)}
                            >
                              {account.code} - {account.name}
                              {selectedAccountIds.includes(account.id) && (
                                <X className="ml-1 h-3 w-3" />
                              )}
                            </Badge>
                          ))}
                          {accounts.length > 20 && (
                            <span className="text-xs text-muted-foreground">
                              +{accounts.length - 20} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Include Zero Balances */}
                    <FormField
                      control={form.control}
                      name="include_zero_balances"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Include Zero Balance Accounts</FormLabel>
                            <FormDescription>
                              Show accounts with zero balance in the report
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Clear Filters Button */}
                    {activeFiltersCount > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="w-full"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear All Filters
                      </Button>
                    )}
                  </>
                )}
              </CollapsibleContent>
            </Collapsible>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this report..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Report'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
