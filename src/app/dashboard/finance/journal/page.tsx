'use client';

import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconPlus,
  IconRefresh,
  IconLoader2,
  IconSearch,
  IconFilter,
  IconEye,
  IconCheck,
  IconX,
  IconTrash,
  IconFileText,
  IconCalendar,
} from '@tabler/icons-react';
import {
  getJournalEntries,
  getJournalEntry,
  createJournalEntry,
  postJournalEntry,
  voidJournalEntry,
  getAccounts,
  JournalEntry,
  JournalEntryLine,
  Account,
} from '../services';

// Status config
const statusConfig: Record<string, { color: string; label: string; labelZh: string }> = {
  DRAFT: { color: 'secondary', label: 'Draft', labelZh: '草稿' },
  POSTED: { color: 'default', label: 'Posted', labelZh: '已過帳' },
  VOIDED: { color: 'destructive', label: 'Voided', labelZh: '已作廢' },
};

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    lines: [
      { account: '', description: '', debit: 0, credit: 0 },
      { account: '', description: '', debit: 0, credit: 0 },
    ] as { account: string; description: string; debit: number; credit: number }[],
  });

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [entriesData, accountsData] = await Promise.all([
        getJournalEntries({ status: filterStatus === 'all' ? undefined : filterStatus }),
        getAccounts(),
      ]);
      setEntries(entriesData.results || getDemoEntries());
      setAccounts(accountsData.results || getDemoAccounts());
    } catch (error) {
      console.error('Failed to load data:', error);
      setEntries(getDemoEntries());
      setAccounts(getDemoAccounts());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    // Validate
    const totalDebit = formData.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = formData.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    
    if (totalDebit !== totalCredit) {
      alert('Debits must equal credits / 借方必須等於貸方');
      return;
    }
    
    if (formData.lines.filter(l => l.account && (l.debit || l.credit)).length < 2) {
      alert('At least 2 lines are required / 至少需要2行');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createJournalEntry({
        date: formData.date,
        description: formData.description,
        reference: formData.reference,
        lines: formData.lines.filter(l => l.account && (l.debit || l.credit)),
      });
      setShowCreateDialog(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Failed to create journal entry:', error);
      alert(error.message || 'Failed to create journal entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePost = async (id: string) => {
    if (!confirm('Post this journal entry? This action cannot be undone. / 確定要過帳此分錄嗎？此操作無法復原。')) {
      return;
    }
    try {
      await postJournalEntry(id);
      loadData();
      setShowViewDialog(false);
    } catch (error: any) {
      console.error('Failed to post:', error);
      alert(error.message || 'Failed to post journal entry');
    }
  };

  const handleVoid = async (id: string) => {
    if (!confirm('Void this journal entry? This will reverse all account balances. / 確定要作廢此分錄嗎？這將會沖銷所有帳戶餘額。')) {
      return;
    }
    try {
      await voidJournalEntry(id);
      loadData();
      setShowViewDialog(false);
    } catch (error: any) {
      console.error('Failed to void:', error);
      alert(error.message || 'Failed to void journal entry');
    }
  };

  const handleViewEntry = async (entry: JournalEntry) => {
    try {
      const detail = await getJournalEntry(entry.id);
      setSelectedEntry(detail);
    } catch {
      setSelectedEntry(entry);
    }
    setShowViewDialog(true);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      reference: '',
      lines: [
        { account: '', description: '', debit: 0, credit: 0 },
        { account: '', description: '', debit: 0, credit: 0 },
      ],
    });
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { account: '', description: '', debit: 0, credit: 0 }],
    });
  };

  const removeLine = (index: number) => {
    if (formData.lines.length <= 2) return;
    setFormData({
      ...formData,
      lines: formData.lines.filter((_, i) => i !== index),
    });
  };

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // If debit is entered, clear credit and vice versa
    if (field === 'debit' && value > 0) {
      newLines[index].credit = 0;
    } else if (field === 'credit' && value > 0) {
      newLines[index].debit = 0;
    }
    
    setFormData({ ...formData, lines: newLines });
  };

  // Calculate totals
  const totalDebit = formData.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = formData.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return entry.entry_number?.toLowerCase().includes(query) ||
             entry.description?.toLowerCase().includes(query) ||
             entry.reference?.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <PageContainer scrollable>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Journal Entries / 日記帳分錄
            </h1>
            <p className="text-muted-foreground">
              Manage journal entries and accounting transactions
              <br />
              管理日記帳分錄和會計交易
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <IconRefresh className="mr-2 h-4 w-4" />
              Refresh / 重新整理
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              New Entry / 新增分錄
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Entries / 總分錄數</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entries.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Draft Entries / 草稿</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {entries.filter(e => e.status === 'DRAFT').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Posted Entries / 已過帳</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {entries.filter(e => e.status === 'POSTED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries... / 搜尋分錄..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <IconFilter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status / 所有狀態</SelectItem>
              <SelectItem value="DRAFT">Draft / 草稿</SelectItem>
              <SelectItem value="POSTED">Posted / 已過帳</SelectItem>
              <SelectItem value="VOIDED">Voided / 已作廢</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Entries Table */}
        <Card>
          <CardHeader>
            <CardTitle>Journal Entries / 日記帳分錄</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <IconFileText className="mx-auto h-12 w-12 mb-4" />
                <p>No journal entries found</p>
                <p className="text-sm">尚無日記帳分錄</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entry No. / 分錄號</TableHead>
                    <TableHead>Date / 日期</TableHead>
                    <TableHead>Description / 說明</TableHead>
                    <TableHead>Reference / 參考</TableHead>
                    <TableHead className="text-right">Debit / 借方</TableHead>
                    <TableHead className="text-right">Credit / 貸方</TableHead>
                    <TableHead>Status / 狀態</TableHead>
                    <TableHead>Actions / 操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono">{entry.entry_number}</TableCell>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{entry.description}</TableCell>
                      <TableCell>{entry.reference || '-'}</TableCell>
                      <TableCell className="text-right font-mono">
                        ${entry.total_debit?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${entry.total_credit?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[entry.status]?.color as any || 'secondary'}>
                          {statusConfig[entry.status]?.labelZh || entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleViewEntry(entry)}>
                            <IconEye className="h-4 w-4" />
                          </Button>
                          {entry.status === 'DRAFT' && (
                            <Button variant="ghost" size="sm" onClick={() => handlePost(entry.id)}>
                              <IconCheck className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Journal Entry / 新增日記帳分錄</DialogTitle>
              <DialogDescription>
                Create a new double-entry journal entry
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Date / 日期</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description / 說明</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Entry description"
                  />
                </div>
              </div>
              
              <div>
                <Label>Reference / 參考編號</Label>
                <Input
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="Optional reference number"
                />
              </div>

              {/* Lines */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <Label>Entry Lines / 分錄行</Label>
                  <Button variant="outline" size="sm" onClick={addLine}>
                    <IconPlus className="mr-1 h-3 w-3" />
                    Add Line / 新增行
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Account / 科目</TableHead>
                      <TableHead>Description / 說明</TableHead>
                      <TableHead className="w-[120px] text-right">Debit / 借方</TableHead>
                      <TableHead className="w-[120px] text-right">Credit / 貸方</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.lines.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            value={line.account}
                            onValueChange={(v) => updateLine(index, 'account', v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map((acc) => (
                                <SelectItem key={acc.id} value={acc.id}>
                                  {acc.code} - {acc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line.description}
                            onChange={(e) => updateLine(index, 'description', e.target.value)}
                            placeholder="Line description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.debit || ''}
                            onChange={(e) => updateLine(index, 'debit', parseFloat(e.target.value) || 0)}
                            className="text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.credit || ''}
                            onChange={(e) => updateLine(index, 'credit', parseFloat(e.target.value) || 0)}
                            className="text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLine(index)}
                            disabled={formData.lines.length <= 2}
                          >
                            <IconTrash className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={2} className="text-right font-medium">
                        Total / 合計:
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        ${totalDebit.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        ${totalCredit.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {isBalanced ? (
                          <IconCheck className="h-5 w-5 text-green-500" />
                        ) : (
                          <IconX className="h-5 w-5 text-red-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                {!isBalanced && totalDebit !== totalCredit && (
                  <p className="text-red-500 text-sm mt-2">
                    Entry is not balanced. Difference: ${Math.abs(totalDebit - totalCredit).toLocaleString()}
                    <br />
                    分錄未平衡。差額：${Math.abs(totalDebit - totalCredit).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                Cancel / 取消
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isSubmitting || !isBalanced || !formData.description}
              >
                {isSubmitting ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create / 建立
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Journal Entry Details / 分錄詳情</DialogTitle>
            </DialogHeader>
            
            {selectedEntry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Entry Number / 分錄號</Label>
                    <p className="font-mono">{selectedEntry.entry_number}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date / 日期</Label>
                    <p>{selectedEntry.date}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Description / 說明</Label>
                    <p>{selectedEntry.description}</p>
                  </div>
                  {selectedEntry.reference && (
                    <div>
                      <Label className="text-muted-foreground">Reference / 參考</Label>
                      <p>{selectedEntry.reference}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Status / 狀態</Label>
                    <Badge variant={statusConfig[selectedEntry.status]?.color as any || 'secondary'}>
                      {statusConfig[selectedEntry.status]?.labelZh || selectedEntry.status}
                    </Badge>
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account / 科目</TableHead>
                      <TableHead>Description / 說明</TableHead>
                      <TableHead className="text-right">Debit / 借方</TableHead>
                      <TableHead className="text-right">Credit / 貸方</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEntry.lines?.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">
                          {line.account_code} - {line.account_name}
                        </TableCell>
                        <TableCell>{line.description || '-'}</TableCell>
                        <TableCell className="text-right font-mono">
                          {line.debit > 0 ? `$${line.debit.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {line.credit > 0 ? `$${line.credit.toLocaleString()}` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={2} className="text-right">Total / 合計:</TableCell>
                      <TableCell className="text-right font-mono">${selectedEntry.total_debit?.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">${selectedEntry.total_credit?.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
            
            <DialogFooter>
              {selectedEntry?.status === 'DRAFT' && (
                <Button variant="default" onClick={() => handlePost(selectedEntry.id)}>
                  <IconCheck className="mr-2 h-4 w-4" />
                  Post Entry / 過帳
                </Button>
              )}
              {selectedEntry?.status === 'POSTED' && (
                <Button variant="destructive" onClick={() => handleVoid(selectedEntry.id)}>
                  <IconX className="mr-2 h-4 w-4" />
                  Void Entry / 作廢
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                Close / 關閉
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

// Demo data
function getDemoEntries(): JournalEntry[] {
  return [
    {
      id: '1',
      entry_number: 'JE-2025-001',
      date: '2025-12-01',
      description: 'Sales Revenue - Customer ABC / 銷售收入 - 客戶ABC',
      reference: 'INV-001',
      status: 'POSTED',
      total_debit: 10000,
      total_credit: 10000,
      is_balanced: true,
      posted_at: '2025-12-01',
      created_at: '2025-12-01',
      updated_at: '2025-12-01',
      lines: [
        { id: '1-1', account: '1', account_code: '1120', account_name: 'Bank Account', debit: 10000, credit: 0 },
        { id: '1-2', account: '2', account_code: '4100', account_name: 'Sales Revenue', debit: 0, credit: 10000 },
      ],
    },
    {
      id: '2',
      entry_number: 'JE-2025-002',
      date: '2025-12-02',
      description: 'Office Supplies Purchase / 辦公用品採購',
      reference: 'PO-002',
      status: 'POSTED',
      total_debit: 500,
      total_credit: 500,
      is_balanced: true,
      posted_at: '2025-12-02',
      created_at: '2025-12-02',
      updated_at: '2025-12-02',
      lines: [
        { id: '2-1', account: '1', account_code: '5400', account_name: 'Office Supplies Expense', debit: 500, credit: 0 },
        { id: '2-2', account: '2', account_code: '1120', account_name: 'Bank Account', debit: 0, credit: 500 },
      ],
    },
    {
      id: '3',
      entry_number: 'JE-2025-003',
      date: '2025-12-03',
      description: 'Salary Payment / 薪資支付',
      status: 'DRAFT',
      total_debit: 25000,
      total_credit: 25000,
      is_balanced: true,
      created_at: '2025-12-03',
      updated_at: '2025-12-03',
      lines: [
        { id: '3-1', account: '1', account_code: '5200', account_name: 'Salaries Expense', debit: 25000, credit: 0 },
        { id: '3-2', account: '2', account_code: '1120', account_name: 'Bank Account', debit: 0, credit: 25000 },
      ],
    },
    {
      id: '4',
      entry_number: 'JE-2025-004',
      date: '2025-12-04',
      description: 'Rent Payment / 租金支付',
      reference: 'RENT-DEC',
      status: 'POSTED',
      total_debit: 3000,
      total_credit: 3000,
      is_balanced: true,
      posted_at: '2025-12-04',
      created_at: '2025-12-04',
      updated_at: '2025-12-04',
      lines: [
        { id: '4-1', account: '1', account_code: '5300', account_name: 'Rent Expense', debit: 3000, credit: 0 },
        { id: '4-2', account: '2', account_code: '1120', account_name: 'Bank Account', debit: 0, credit: 3000 },
      ],
    },
  ];
}

function getDemoAccounts(): Account[] {
  return [
    { id: '1', code: '1110', name: 'Petty Cash / 零用金', account_type: 'ASSET', is_active: true, is_debit_positive: true, current_balance: 5000, created_at: '', updated_at: '' },
    { id: '2', code: '1120', name: 'Bank Account / 銀行存款', account_type: 'ASSET', is_active: true, is_debit_positive: true, current_balance: 123500, created_at: '', updated_at: '' },
    { id: '3', code: '1200', name: 'Accounts Receivable / 應收帳款', account_type: 'ASSET', is_active: true, is_debit_positive: true, current_balance: 45200, created_at: '', updated_at: '' },
    { id: '4', code: '2100', name: 'Accounts Payable / 應付帳款', account_type: 'LIABILITY', is_active: true, is_debit_positive: false, current_balance: 32100, created_at: '', updated_at: '' },
    { id: '5', code: '4100', name: 'Sales Revenue / 銷售收入', account_type: 'REVENUE', is_active: true, is_debit_positive: false, current_balance: 298000, created_at: '', updated_at: '' },
    { id: '6', code: '5100', name: 'Cost of Goods Sold / 銷貨成本', account_type: 'EXPENSE', is_active: true, is_debit_positive: true, current_balance: 150000, created_at: '', updated_at: '' },
    { id: '7', code: '5200', name: 'Salaries Expense / 薪資費用', account_type: 'EXPENSE', is_active: true, is_debit_positive: true, current_balance: 85000, created_at: '', updated_at: '' },
    { id: '8', code: '5300', name: 'Rent Expense / 租金費用', account_type: 'EXPENSE', is_active: true, is_debit_positive: true, current_balance: 18000, created_at: '', updated_at: '' },
    { id: '9', code: '5400', name: 'Office Supplies / 辦公用品', account_type: 'EXPENSE', is_active: true, is_debit_positive: true, current_balance: 3000, created_at: '', updated_at: '' },
  ];
}
