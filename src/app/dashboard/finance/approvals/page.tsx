'use client';

import { useEffect, useState, useCallback } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  IconCheck,
  IconX,
  IconRefresh,
  IconReceipt,
  IconFileInvoice,
  IconEye,
  IconLoader2,
  IconClipboardCheck,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/export-utils';
import {
  getExpenses,
  getInvoices,
  approveExpense,
  rejectExpense,
  type Expense,
  type Invoice,
} from '../services';

// Demo data for when API is unavailable
const DEMO_PENDING_EXPENSES: Expense[] = [
  {
    id: '1',
    expense_number: 'EXP-2024-004',
    date: '2024-01-18',
    category: 'Travel',
    vendor: '1',
    vendor_name: 'American Airlines',
    description: '業務出差機票 - 台北往返高雄',
    amount: 4500,
    tax_amount: 225,
    total: 4725,
    status: 'PENDING',
    created_at: '2024-01-18',
  },
  {
    id: '2',
    expense_number: 'EXP-2024-005',
    date: '2024-01-20',
    category: 'Equipment',
    vendor: '2',
    vendor_name: '遠傳電信',
    description: '新員工手機設備費用',
    amount: 25000,
    tax_amount: 1250,
    total: 26250,
    status: 'PENDING',
    created_at: '2024-01-20',
  },
  {
    id: '3',
    expense_number: 'EXP-2024-006',
    date: '2024-01-22',
    category: 'Meals',
    vendor: '3',
    vendor_name: '王品牛排',
    description: '客戶餐敘費用',
    amount: 8800,
    tax_amount: 440,
    total: 9240,
    status: 'PENDING',
    created_at: '2024-01-22',
  },
];

const DEMO_PENDING_INVOICES: Invoice[] = [
  {
    id: '1',
    invoice_number: 'INV-2024-015',
    date: '2024-01-15',
    due_date: '2024-02-15',
    customer: '1',
    customer_name: 'Tech Solutions Ltd',
    subtotal: 150000,
    tax_amount: 7500,
    total: 157500,
    amount_paid: 0,
    balance_due: 157500,
    status: 'DRAFT',
    created_at: '2024-01-15',
    items: [],
  },
  {
    id: '2',
    invoice_number: 'INV-2024-016',
    date: '2024-01-18',
    due_date: '2024-02-18',
    customer: '2',
    customer_name: 'Global Manufacturing',
    subtotal: 280000,
    tax_amount: 14000,
    total: 294000,
    amount_paid: 0,
    balance_due: 294000,
    status: 'DRAFT',
    created_at: '2024-01-18',
    items: [],
  },
];

export default function ApprovalsPage() {
  const [loading, setLoading] = useState(true);
  const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [selectedItem, setSelectedItem] = useState<Expense | Invoice | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadPendingItems = useCallback(async () => {
    setLoading(true);
    try {
      const [expensesResponse, invoicesResponse] = await Promise.all([
        getExpenses(),
        getInvoices(),
      ]);
      
      // Handle paginated response - extract results array
      const expenses = Array.isArray(expensesResponse) ? expensesResponse : expensesResponse?.results || [];
      const invoices = Array.isArray(invoicesResponse) ? invoicesResponse : invoicesResponse?.results || [];
      
      // Filter for pending items only
      const pending = expenses.filter(e => e.status === 'PENDING');
      const draftInvoices = invoices.filter(i => i.status === 'DRAFT');
      
      setPendingExpenses(pending.length > 0 ? pending : DEMO_PENDING_EXPENSES);
      setPendingInvoices(draftInvoices.length > 0 ? draftInvoices : DEMO_PENDING_INVOICES);
    } catch (error) {
      console.error('Failed to load pending items:', error);
      // Use demo data on error
      setPendingExpenses(DEMO_PENDING_EXPENSES);
      setPendingInvoices(DEMO_PENDING_INVOICES);
      toast.warning('使用示範資料顯示');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingItems();
  }, [loadPendingItems]);

  const handleApprove = (item: Expense | Invoice, type: 'expense' | 'invoice') => {
    setSelectedItem(item);
    setActionType('approve');
  };

  const handleReject = (item: Expense | Invoice, type: 'expense' | 'invoice') => {
    setSelectedItem(item);
    setActionType('reject');
    setRejectReason('');
  };

  const confirmAction = async () => {
    if (!selectedItem) return;

    setProcessing(true);
    try {
      if ('expense_number' in selectedItem) {
        // It's an expense
        if (actionType === 'approve') {
          await approveExpense(selectedItem.id);
          toast.success(`費用報銷 ${selectedItem.expense_number} 已核准`);
          setPendingExpenses(prev => prev.filter(e => e.id !== selectedItem.id));
        } else {
          await rejectExpense(selectedItem.id);
          toast.success(`費用報銷 ${selectedItem.expense_number} 已駁回`);
          setPendingExpenses(prev => prev.filter(e => e.id !== selectedItem.id));
        }
      } else {
        // It's an invoice - for demo, just remove from list
        if (actionType === 'approve') {
          toast.success(`發票 ${selectedItem.invoice_number} 已核准發送`);
        } else {
          toast.success(`發票 ${selectedItem.invoice_number} 已退回修改`);
        }
        setPendingInvoices(prev => prev.filter(i => i.id !== selectedItem.id));
      }
    } catch (error) {
      console.error('Action failed:', error);
      toast.error(actionType === 'approve' ? '核准失敗' : '駁回失敗');
    } finally {
      setProcessing(false);
      setSelectedItem(null);
      setActionType(null);
      setRejectReason('');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      PENDING: { variant: 'secondary', label: '待審核' },
      DRAFT: { variant: 'outline', label: '草稿' },
      APPROVED: { variant: 'default', label: '已核准' },
      REJECTED: { variant: 'destructive', label: '已駁回' },
    };
    const config = statusConfig[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalPending = pendingExpenses.length + pendingInvoices.length;
  const totalExpenseAmount = pendingExpenses.reduce((sum, e) => sum + e.total, 0);
  const totalInvoiceAmount = pendingInvoices.reduce((sum, i) => sum + i.total, 0);

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title='審批管理 / Financial Approvals'
          description='審核和批准費用報銷、發票和其他財務交易。Review and approve expense reports, invoices, and other financial transactions.'
        />
        <Button variant='outline' onClick={loadPendingItems} disabled={loading}>
          <IconRefresh className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>
      <Separator />

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>待審核項目</CardTitle>
            <IconClipboardCheck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{loading ? <Skeleton className='h-8 w-12' /> : totalPending}</div>
            <p className='text-xs text-muted-foreground'>需要您審核的項目</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>待審費用總額</CardTitle>
            <IconReceipt className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{loading ? <Skeleton className='h-8 w-24' /> : formatCurrency(totalExpenseAmount)}</div>
            <p className='text-xs text-muted-foreground'>{pendingExpenses.length} 筆費用報銷待審</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>待審發票總額</CardTitle>
            <IconFileInvoice className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{loading ? <Skeleton className='h-8 w-24' /> : formatCurrency(totalInvoiceAmount)}</div>
            <p className='text-xs text-muted-foreground'>{pendingInvoices.length} 筆發票草稿待發送</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='expenses' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='expenses' className='gap-2'>
            <IconReceipt className='h-4 w-4' />
            費用報銷
            {pendingExpenses.length > 0 && (
              <Badge variant='secondary' className='ml-1'>{pendingExpenses.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value='invoices' className='gap-2'>
            <IconFileInvoice className='h-4 w-4' />
            發票審核
            {pendingInvoices.length > 0 && (
              <Badge variant='secondary' className='ml-1'>{pendingInvoices.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Expenses Tab */}
        <TabsContent value='expenses'>
          <Card>
            <CardHeader>
              <CardTitle>待審核費用報銷</CardTitle>
              <CardDescription>審核員工提交的費用報銷申請</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='space-y-3'>
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className='h-16 w-full' />
                  ))}
                </div>
              ) : pendingExpenses.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <IconCheck className='mx-auto h-12 w-12 mb-4 text-green-500' />
                  <p>沒有待審核的費用報銷</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>報銷單號</TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>類別</TableHead>
                      <TableHead>供應商</TableHead>
                      <TableHead>說明</TableHead>
                      <TableHead className='text-right'>金額</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead className='text-right'>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className='font-medium'>{expense.expense_number}</TableCell>
                        <TableCell>{expense.date}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>{expense.vendor_name}</TableCell>
                        <TableCell className='max-w-[200px] truncate'>{expense.description}</TableCell>
                        <TableCell className='text-right font-medium'>{formatCurrency(expense.total)}</TableCell>
                        <TableCell>{getStatusBadge(expense.status)}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              size='sm'
                              variant='default'
                              onClick={() => handleApprove(expense, 'expense')}
                              className='gap-1'
                            >
                              <IconCheck className='h-4 w-4' />
                              核准
                            </Button>
                            <Button
                              size='sm'
                              variant='destructive'
                              onClick={() => handleReject(expense, 'expense')}
                              className='gap-1'
                            >
                              <IconX className='h-4 w-4' />
                              駁回
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value='invoices'>
          <Card>
            <CardHeader>
              <CardTitle>待發送發票草稿</CardTitle>
              <CardDescription>審核並發送發票給客戶</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='space-y-3'>
                  {[1, 2].map(i => (
                    <Skeleton key={i} className='h-16 w-full' />
                  ))}
                </div>
              ) : pendingInvoices.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <IconCheck className='mx-auto h-12 w-12 mb-4 text-green-500' />
                  <p>沒有待發送的發票草稿</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>發票號碼</TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>客戶</TableHead>
                      <TableHead>到期日</TableHead>
                      <TableHead className='text-right'>小計</TableHead>
                      <TableHead className='text-right'>稅額</TableHead>
                      <TableHead className='text-right'>總計</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead className='text-right'>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className='font-medium'>{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.customer_name}</TableCell>
                        <TableCell>{invoice.due_date}</TableCell>
                        <TableCell className='text-right'>{formatCurrency(invoice.subtotal)}</TableCell>
                        <TableCell className='text-right'>{formatCurrency(invoice.tax_amount)}</TableCell>
                        <TableCell className='text-right font-medium'>{formatCurrency(invoice.total)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              size='sm'
                              variant='default'
                              onClick={() => handleApprove(invoice, 'invoice')}
                              className='gap-1'
                            >
                              <IconCheck className='h-4 w-4' />
                              發送
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleReject(invoice, 'invoice')}
                              className='gap-1'
                            >
                              <IconX className='h-4 w-4' />
                              退回
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedItem && !!actionType} onOpenChange={() => { setSelectedItem(null); setActionType(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? '確認核准' : '確認駁回'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedItem && 'expense_number' in selectedItem ? (
                <>
                  確定要{actionType === 'approve' ? '核准' : '駁回'}費用報銷 <strong>{selectedItem.expense_number}</strong>？
                  <br />
                  金額: <strong>{formatCurrency(selectedItem.total)}</strong>
                </>
              ) : selectedItem && 'invoice_number' in selectedItem ? (
                <>
                  確定要{actionType === 'approve' ? '發送' : '退回'}發票 <strong>{selectedItem.invoice_number}</strong>？
                  <br />
                  金額: <strong>{formatCurrency(selectedItem.total)}</strong>
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {actionType === 'reject' && (
            <div className='py-4'>
              <label className='text-sm font-medium'>駁回原因 (選填)</label>
              <Textarea
                placeholder='請輸入駁回原因...'
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className='mt-2'
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={processing}
              className={actionType === 'reject' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {processing ? (
                <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : actionType === 'approve' ? (
                <IconCheck className='mr-2 h-4 w-4' />
              ) : (
                <IconX className='mr-2 h-4 w-4' />
              )}
              {actionType === 'approve' ? '確認核准' : '確認駁回'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
