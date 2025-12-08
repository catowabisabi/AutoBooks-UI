'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Receipt,
  BookOpen,
  Link2,
  Unlink,
  Upload,
  FolderOpen,
  Clock,
  Building,
  User,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { IconLoader2 } from '@tabler/icons-react';
import { useTranslation } from '@/lib/i18n/provider';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  getProjectSummary,
  updateProject,
  deleteProject,
  linkDocumentsToProject,
  unlinkDocumentsFromProject,
  getExpenses,
  getInvoices,
  getJournalEntries,
  ProjectSummary,
  Project,
  ProjectStatus,
  Expense,
  Invoice,
  JournalEntry,
} from '../../../services';

interface ProjectDetailProps {
  projectId: string;
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  ON_HOLD: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  ARCHIVED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled',
  ARCHIVED: 'Archived',
};

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  
  // Link dialog state
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkDocumentType, setLinkDocumentType] = useState<'expense' | 'invoice' | 'journal_entry'>('expense');
  const [availableDocuments, setAvailableDocuments] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [linking, setLinking] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const loadProjectSummary = async () => {
    setLoading(true);
    try {
      const data = await getProjectSummary(projectId);
      setSummary(data);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectSummary();
  }, [projectId]);

  const loadAvailableDocuments = async (type: 'expense' | 'invoice' | 'journal_entry') => {
    setLoadingDocs(true);
    try {
      let docs: Array<{ id: string; label: string }> = [];
      
      if (type === 'expense') {
        const response = await getExpenses({});
        docs = response.results
          .filter(e => !summary?.expenses.find(se => se.id === e.id))
          .map(e => ({
            id: e.id,
            label: `${e.expense_number} - ${e.description?.substring(0, 50) || 'No description'} ($${e.amount || e.total})`,
          }));
      } else if (type === 'invoice') {
        const response = await getInvoices({});
        docs = response.results
          .filter(i => !summary?.invoices.find(si => si.id === i.id))
          .map(i => ({
            id: i.id,
            label: `${i.invoice_number} - ${i.contact_name || 'Unknown'} ($${i.total || 0})`,
          }));
      } else if (type === 'journal_entry') {
        const response = await getJournalEntries({});
        docs = response.results
          .filter(j => !summary?.journal_entries.find(sj => sj.id === j.id))
          .map(j => ({
            id: j.id,
            label: `${j.entry_number} - ${j.description?.substring(0, 50) || 'No description'}`,
          }));
      }
      
      setAvailableDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Failed to load available documents');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleOpenLinkDialog = (type: 'expense' | 'invoice' | 'journal_entry') => {
    setLinkDocumentType(type);
    setSelectedDocuments([]);
    setLinkDialogOpen(true);
    loadAvailableDocuments(type);
  };

  const handleLinkDocuments = async () => {
    if (selectedDocuments.length === 0) {
      toast.error('Please select at least one document');
      return;
    }

    setLinking(true);
    try {
      await linkDocumentsToProject(projectId, linkDocumentType, selectedDocuments);
      toast.success(`Successfully linked ${selectedDocuments.length} document(s)`);
      setLinkDialogOpen(false);
      loadProjectSummary();
    } catch (error) {
      toast.error('Failed to link documents');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkDocument = async (type: 'expense' | 'invoice' | 'journal_entry', docId: string) => {
    if (!confirm('Are you sure you want to unlink this document from the project?')) {
      return;
    }

    try {
      await unlinkDocumentsFromProject(projectId, type, [docId]);
      toast.success('Document unlinked successfully');
      loadProjectSummary();
    } catch (error) {
      toast.error('Failed to unlink document');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProject(projectId);
      toast.success('Project deleted successfully');
      router.push('/dashboard/finance/projects');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className='flex h-[400px] items-center justify-center'>
        <IconLoader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className='flex h-[400px] flex-col items-center justify-center'>
        <p className='text-muted-foreground mb-4'>Project not found</p>
        <Button variant='outline' onClick={() => router.push('/dashboard/finance/projects')}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Projects
        </Button>
      </div>
    );
  }

  const { project, expenses, invoices, journal_entries, documents, totals } = summary;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex items-start gap-4'>
          <Button variant='ghost' size='icon' onClick={() => router.push('/dashboard/finance/projects')}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <div className='flex items-center gap-3'>
              <h1 className='text-2xl font-bold'>{project.name}</h1>
              <Badge className={STATUS_COLORS[project.status]}>
                {STATUS_LABELS[project.status]}
              </Badge>
            </div>
            <p className='text-muted-foreground mt-1 font-mono text-sm'>{project.code}</p>
            {project.description && (
              <p className='text-muted-foreground mt-2 max-w-2xl text-sm'>{project.description}</p>
            )}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='icon' onClick={loadProjectSummary}>
            <RefreshCw className='h-4 w-4' />
          </Button>
          <Button variant='outline' onClick={() => router.push(`/dashboard/finance/projects/${projectId}/edit`)}>
            <Edit className='mr-2 h-4 w-4' />
            Edit
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            <Trash2 className='mr-2 h-4 w-4' />
            Delete
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Budget</CardTitle>
            <DollarSign className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(project.budget_amount, project.currency_code)}
            </div>
            <div className='mt-2'>
              <div className='mb-1 flex items-center justify-between text-xs'>
                <span className='text-muted-foreground'>Utilization</span>
                <span>{totals.budget_utilization.toFixed(1)}%</span>
              </div>
              <Progress value={totals.budget_utilization} className='h-2' />
            </div>
            <p className='text-muted-foreground mt-2 text-xs'>
              {formatCurrency(totals.budget_remaining, project.currency_code)} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Expenses</CardTitle>
            <Receipt className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(totals.total_expenses, project.currency_code)}
            </div>
            <p className='text-muted-foreground text-xs'>
              {totals.expense_count} expense(s) linked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Invoiced</CardTitle>
            <FileText className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(totals.total_invoiced, project.currency_code)}
            </div>
            <p className='text-muted-foreground text-xs'>
              {totals.invoice_count} invoice(s) linked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Documents</CardTitle>
            <FolderOpen className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totals.document_count}</div>
            <p className='text-muted-foreground text-xs'>
              {totals.journal_entry_count} journal entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Info */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Project Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-3'>
              <Calendar className='text-muted-foreground h-4 w-4' />
              <div>
                <p className='text-sm font-medium'>Duration</p>
                <p className='text-muted-foreground text-sm'>
                  {formatDate(project.start_date)} - {formatDate(project.end_date)}
                </p>
              </div>
            </div>
            {project.client_name && (
              <div className='flex items-center gap-3'>
                <Building className='text-muted-foreground h-4 w-4' />
                <div>
                  <p className='text-sm font-medium'>Client</p>
                  <p className='text-muted-foreground text-sm'>{project.client_name}</p>
                </div>
              </div>
            )}
            {project.manager_name && (
              <div className='flex items-center gap-3'>
                <User className='text-muted-foreground h-4 w-4' />
                <div>
                  <p className='text-sm font-medium'>Manager</p>
                  <p className='text-muted-foreground text-sm'>{project.manager_name}</p>
                </div>
              </div>
            )}
            {project.category && (
              <div className='flex items-center gap-3'>
                <FolderOpen className='text-muted-foreground h-4 w-4' />
                <div>
                  <p className='text-sm font-medium'>Category</p>
                  <Badge variant='outline'>{project.category}</Badge>
                </div>
              </div>
            )}
            <div className='flex items-center gap-3'>
              <Clock className='text-muted-foreground h-4 w-4' />
              <div>
                <p className='text-sm font-medium'>Created</p>
                <p className='text-muted-foreground text-sm'>
                  {formatDate(project.created_at)} by {project.created_by_name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {project.notes && (
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-sm whitespace-pre-wrap'>{project.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Linked Documents Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Linked Documents</CardTitle>
          <CardDescription>
            View and manage expenses, invoices, and journal entries linked to this project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='expenses' className='w-full'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='expenses'>
                <Receipt className='mr-2 h-4 w-4' />
                Expenses ({expenses.length})
              </TabsTrigger>
              <TabsTrigger value='invoices'>
                <FileText className='mr-2 h-4 w-4' />
                Invoices ({invoices.length})
              </TabsTrigger>
              <TabsTrigger value='journal_entries'>
                <BookOpen className='mr-2 h-4 w-4' />
                Journal Entries ({journal_entries.length})
              </TabsTrigger>
            </TabsList>

            {/* Expenses Tab */}
            <TabsContent value='expenses' className='mt-4'>
              <div className='mb-4 flex justify-end'>
                <Button size='sm' onClick={() => handleOpenLinkDialog('expense')}>
                  <Link2 className='mr-2 h-4 w-4' />
                  Link Expenses
                </Button>
              </div>
              {expenses.length === 0 ? (
                <p className='text-muted-foreground py-8 text-center text-sm'>
                  No expenses linked to this project yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className='text-right'>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='w-[50px]'></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className='font-mono text-sm'>
                          <Link href={`/dashboard/finance/expenses/${expense.id}`} className='hover:underline'>
                            {expense.expense_number}
                          </Link>
                        </TableCell>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell className='max-w-[200px] truncate'>{expense.description}</TableCell>
                        <TableCell className='text-right font-medium'>
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline'>{expense.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleUnlinkDocument('expense', expense.id)}
                            title='Unlink from project'
                          >
                            <Unlink className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value='invoices' className='mt-4'>
              <div className='mb-4 flex justify-end'>
                <Button size='sm' onClick={() => handleOpenLinkDialog('invoice')}>
                  <Link2 className='mr-2 h-4 w-4' />
                  Link Invoices
                </Button>
              </div>
              {invoices.length === 0 ? (
                <p className='text-muted-foreground py-8 text-center text-sm'>
                  No invoices linked to this project yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className='text-right'>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='w-[50px]'></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className='font-mono text-sm'>
                          <Link href={`/dashboard/finance/invoices/${invoice.id}`} className='hover:underline'>
                            {invoice.invoice_number}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant={invoice.invoice_type === 'SALES' ? 'default' : 'secondary'}>
                            {invoice.invoice_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                        <TableCell className='text-right font-medium'>
                          {formatCurrency(invoice.total)}
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline'>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleUnlinkDocument('invoice', invoice.id)}
                            title='Unlink from project'
                          >
                            <Unlink className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Journal Entries Tab */}
            <TabsContent value='journal_entries' className='mt-4'>
              <div className='mb-4 flex justify-end'>
                <Button size='sm' onClick={() => handleOpenLinkDialog('journal_entry')}>
                  <Link2 className='mr-2 h-4 w-4' />
                  Link Journal Entries
                </Button>
              </div>
              {journal_entries.length === 0 ? (
                <p className='text-muted-foreground py-8 text-center text-sm'>
                  No journal entries linked to this project yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entry Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className='text-right'>Debit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='w-[50px]'></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journal_entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className='font-mono text-sm'>
                          <Link href={`/dashboard/finance/journal/${entry.id}`} className='hover:underline'>
                            {entry.entry_number}
                          </Link>
                        </TableCell>
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell className='max-w-[200px] truncate'>{entry.description}</TableCell>
                        <TableCell className='text-right font-medium'>
                          {formatCurrency(entry.total_debit)}
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline'>{entry.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleUnlinkDocument('journal_entry', entry.id)}
                            title='Unlink from project'
                          >
                            <Unlink className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Link Documents Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>
              Link {linkDocumentType === 'journal_entry' ? 'Journal Entries' : `${linkDocumentType.charAt(0).toUpperCase() + linkDocumentType.slice(1)}s`}
            </DialogTitle>
            <DialogDescription>
              Select documents to link to this project. These documents will be associated with the project for tracking purposes.
            </DialogDescription>
          </DialogHeader>
          <div className='max-h-[400px] overflow-y-auto py-4'>
            {loadingDocs ? (
              <div className='flex items-center justify-center py-8'>
                <IconLoader2 className='h-6 w-6 animate-spin' />
              </div>
            ) : availableDocuments.length === 0 ? (
              <p className='text-muted-foreground py-8 text-center text-sm'>
                No available documents to link.
              </p>
            ) : (
              <div className='space-y-2'>
                {availableDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className='flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50'
                  >
                    <Checkbox
                      id={doc.id}
                      checked={selectedDocuments.includes(doc.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDocuments([...selectedDocuments, doc.id]);
                        } else {
                          setSelectedDocuments(selectedDocuments.filter((id) => id !== doc.id));
                        }
                      }}
                    />
                    <label
                      htmlFor={doc.id}
                      className='flex-1 cursor-pointer text-sm'
                    >
                      {doc.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <div className='flex w-full items-center justify-between'>
              <span className='text-muted-foreground text-sm'>
                {selectedDocuments.length} selected
              </span>
              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => setLinkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleLinkDocuments} disabled={linking || selectedDocuments.length === 0}>
                  {linking ? (
                    <>
                      <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                      Linking...
                    </>
                  ) : (
                    <>
                      <Link2 className='mr-2 h-4 w-4' />
                      Link Selected
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
