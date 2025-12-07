'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Filter, Search, SortAsc, SortDesc, X, Plus, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from './expense-card';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/provider';
import { toast } from 'sonner';
import {
  getExpenses,
  deleteExpense,
  approveExpense,
  rejectExpense,
  Expense as ApiExpense,
} from '../../services';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IconDotsVertical, IconEye, IconTrash, IconLoader2 } from '@tabler/icons-react';

type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

interface Expense {
  id: string;
  merchantName: string;
  invoiceNo: string;
  expenseDate: string;
  currency: string;
  claimedAmount: string;
  category: string;
  description: string;
  status: ExpenseStatus;
}

function mapApiExpense(expense: ApiExpense): Expense {
  return {
    id: expense.id,
    merchantName: expense.vendor_name || expense.vendor || 'Unknown',
    invoiceNo: expense.expense_number,
    expenseDate: expense.date,
    currency: 'USD',
    claimedAmount: String(expense.total || expense.amount || 0),
    category: expense.category || 'General',
    description: expense.description || '',
    status: expense.status as ExpenseStatus,
  };
}

type SortField = 'merchantName' | 'claimedAmount' | 'status';
type SortOrder = 'asc' | 'desc';

export default function ExpenseList() {
  const { t } = useTranslation();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('merchantName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const params: { status?: string } = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await getExpenses(params);
      setExpenses(response.results.map(mapApiExpense));
    } catch (error) {
      console.error('Failed to load expenses:', error);
      toast.error(t('expenses.loadError') || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortField, sortOrder]);

  const filteredExpenses = useMemo(() => {
    let data = [...expenses];

    if (search) {
      const term = search.toLowerCase();
      data = data.filter(
        (e) =>
          e.merchantName.toLowerCase().includes(term) ||
          e.invoiceNo.toLowerCase().includes(term) ||
          e.description.toLowerCase().includes(term)
      );
    }

    data.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (sortField === 'claimedAmount') {
        return sortOrder === 'asc'
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      return sortOrder === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return data;
  }, [expenses, search, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginated = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleCreateExpense = () => {
    router.push('/dashboard/finance/expenses/new');
  };

  const handleApprove = async (expense: Expense) => {
    try {
      await approveExpense(expense.id);
      toast.success(t('expenses.approved') || 'Expense approved');
      loadExpenses();
    } catch {
      toast.error(t('expenses.approveError') || 'Failed to approve expense');
    }
  };

  const handleReject = async (expense: Expense) => {
    try {
      await rejectExpense(expense.id);
      toast.success(t('expenses.rejected') || 'Expense rejected');
      loadExpenses();
    } catch {
      toast.error(t('expenses.rejectError') || 'Failed to reject expense');
    }
  };

  const handleDelete = async (expense: Expense) => {
    if (!confirm(t('expenses.confirmDelete') || `Are you sure you want to delete ${expense.invoiceNo}?`)) {
      return;
    }
    try {
      await deleteExpense(expense.id);
      toast.success(t('expenses.deleted') || 'Expense deleted');
      loadExpenses();
    } catch {
      toast.error(t('expenses.deleteError') || 'Failed to delete expense');
    }
  };

  const getStatusDisplayColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PAID':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  return (
    <div className='flex min-h-[80vh] flex-col'>
      <div className='mb-6 space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold'>{t('expenses.title')}</h2>

          <div className='flex items-center gap-2'>
            {/* Refresh Button */}
            <Button
              onClick={loadExpenses}
              variant='outline'
              size='icon'
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            
            {/* Create New Expense Button */}
            <Button
              onClick={handleCreateExpense}
              className='gap-2'
              variant='default'
            >
              <Plus className='h-4 w-4' />
              {t('expenses.addExpense')}
            </Button>
          </div>
        </div>

        <div className='flex flex-wrap gap-3'>
          <div className='relative w-full sm:w-64'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder={t('expenses.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-9'
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(val: string) =>
              setStatusFilter(val as ExpenseStatus | 'all')
            }
          >
            <SelectTrigger className='w-[150px]'>
              <Filter className='mr-2 h-4 w-4' />
              <SelectValue>{statusFilter === 'all' ? t('expenses.all') : statusFilter}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('expenses.all')}</SelectItem>
              <SelectItem value='PENDING'>{t('expenses.pending')}</SelectItem>
              <SelectItem value='APPROVED'>{t('expenses.approved')}</SelectItem>
              <SelectItem value='REJECTED'>{t('expenses.rejected')}</SelectItem>
              <SelectItem value='PAID'>{t('expenses.paid') || 'Paid'}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortField}
            onValueChange={(val: string) => setSortField(val as SortField)}
          >
            <SelectTrigger className='w-[150px]'>
              {sortOrder === 'asc' ? (
                <SortAsc className='mr-2 h-4 w-4' />
              ) : (
                <SortDesc className='mr-2 h-4 w-4' />
              )}
              <SelectValue>{sortField}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='merchantName'>{t('expenses.merchant')}</SelectItem>
              <SelectItem value='claimedAmount'>{t('common.amount')}</SelectItem>
              <SelectItem value='status'>{t('common.status')}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant='outline' size='icon' onClick={toggleSortOrder}>
            {sortOrder === 'asc' ? (
              <SortAsc className='h-4 w-4' />
            ) : (
              <SortDesc className='h-4 w-4' />
            )}
          </Button>

          {(search ||
            statusFilter !== 'all' ||
            sortField !== 'merchantName') && (
            <Button
              variant='outline'
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setSortField('merchantName');
                setSortOrder('asc');
              }}
            >
              <X className='mr-2 h-4 w-4' />
              {t('expenses.clear')}
            </Button>
          )}
        </div>

        {filteredExpenses.length > 0 ? (
          <div className='text-muted-foreground text-sm'>
            {t('expenses.showing', { count: paginated.length, total: filteredExpenses.length })}
            {search && (
              <Badge
                variant='outline'
                className='bg-primary/5 text-primary ml-2'
              >
                Search: {search}
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge
                variant='outline'
                className='bg-primary/5 text-primary ml-2'
              >
                Filter: {statusFilter}
              </Badge>
            )}
          </div>
        ) : (
          <div className='py-8 text-center'>
            <p className='text-muted-foreground'>
              {t('expenses.noExpensesFound')}
            </p>
            <Button
              variant='link'
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setSortField('merchantName');
                setSortOrder('asc');
              }}
              className='mt-2'
            >
              {t('expenses.clearFilters')}
            </Button>
          </div>
        )}
      </div>

      {/* Middle Section: Expense List (with flex-grow to push pagination to bottom) */}
      <div className='flex-grow'>
        {filteredExpenses.length > 0 && (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('expenses.merchant')}</TableHead>
                  <TableHead>{t('expenses.invoiceNo')}</TableHead>
                  <TableHead>{t('common.amount')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('expenses.description')}</TableHead>
                  <TableHead>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.merchantName}</TableCell>
                    <TableCell>{expense.invoiceNo}</TableCell>
                    <TableCell>
                      {expense.claimedAmount} {expense.currency}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(expense.status)}>
                        {t(`expenses.${expense.status.toLowerCase()}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Button asChild variant='default' size='sm'>
                          <Link
                            href={`/dashboard/finance/expenses/${expense.id}`}
                          >
                            {t('common.view')}
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Bottom Section: Pagination (always at the bottom) */}
      <div className='mt-auto pt-8'>
        {filteredExpenses.length > 0 && (
          <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground text-sm'>
                {t('common.itemsPerPage')}:
              </span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(val) => {
                  setItemsPerPage(Number(val));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
              >
                <SelectTrigger className='w-[80px]'>
                  <SelectValue placeholder='10' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='5'>5</SelectItem>
                  <SelectItem value='10'>10</SelectItem>
                  <SelectItem value='15'>15</SelectItem>
                  <SelectItem value='20'>20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredExpenses.length > itemsPerPage && (
              <div className='flex justify-center'>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        className={
                          currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : ''
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? 'pointer-events-none opacity-50'
                            : ''
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            <div className='text-muted-foreground text-sm'>
              {t('common.showingRange', { 
                start: (currentPage - 1) * itemsPerPage + 1, 
                end: Math.min(currentPage * itemsPerPage, filteredExpenses.length), 
                total: filteredExpenses.length 
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
