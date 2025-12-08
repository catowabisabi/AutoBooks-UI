'use client';

import { useState } from 'react';
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
import { Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { financialReportApi } from '@/features/accounting-workspace/services';
import type { FinancialReportTypeInfo, GenerateFinancialReportInput } from '@/features/accounting-workspace/types';

const formSchema = z.object({
  name: z.string().min(1, 'Report name is required').max(200),
  report_type: z.string().min(1, 'Report type is required'),
  period_start: z.string().min(1, 'Start date is required'),
  period_end: z.string().min(1, 'End date is required'),
  include_comparison: z.boolean().default(false),
  comparison_period_start: z.string().optional(),
  comparison_period_end: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => {
  if (data.include_comparison) {
    return data.comparison_period_start && data.comparison_period_end;
  }
  return true;
}, {
  message: 'Comparison dates are required when comparison is enabled',
  path: ['comparison_period_start'],
});

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
    },
  });

  const includeComparison = form.watch('include_comparison');

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
