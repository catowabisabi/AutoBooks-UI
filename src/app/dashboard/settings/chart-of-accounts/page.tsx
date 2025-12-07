'use client';

import { useState, useEffect, useMemo } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  IconPlus,
  IconRefresh,
  IconLoader2,
  IconEdit,
  IconTrash,
  IconList,
  IconHierarchy,
  IconDotsVertical,
  IconChevronRight,
  IconChevronDown,
  IconFolder,
  IconFile,
} from '@tabler/icons-react';
import { accountingApi } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/provider';

// Type definitions
interface Account {
  id: number;
  code: string;
  name: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  account_subtype?: string;
  parent?: number | null;
  description?: string;
  is_active: boolean;
  is_system?: boolean;
  opening_balance?: number;
  current_balance?: number;
  children?: Account[];
}

// Demo data
const getDemoAccounts = (): Account[] => [
  { id: 1, code: '1000', name: 'Assets', account_type: 'ASSET', parent: null, is_active: true, is_system: true, current_balance: 0 },
  { id: 2, code: '1100', name: 'Cash and Bank', account_type: 'ASSET', parent: 1, is_active: true, current_balance: 125000 },
  { id: 3, code: '1110', name: 'Petty Cash', account_type: 'ASSET', parent: 2, is_active: true, current_balance: 5000 },
  { id: 4, code: '1120', name: 'Bank Account - Main', account_type: 'ASSET', parent: 2, is_active: true, current_balance: 120000 },
  { id: 5, code: '1200', name: 'Accounts Receivable', account_type: 'ASSET', parent: 1, is_active: true, current_balance: 45000 },
  { id: 6, code: '1300', name: 'Inventory', account_type: 'ASSET', parent: 1, is_active: true, current_balance: 85000 },
  { id: 7, code: '1400', name: 'Prepaid Expenses', account_type: 'ASSET', parent: 1, is_active: true, current_balance: 12000 },
  { id: 8, code: '1500', name: 'Fixed Assets', account_type: 'ASSET', parent: 1, is_active: true, current_balance: 250000 },
  
  { id: 10, code: '2000', name: 'Liabilities', account_type: 'LIABILITY', parent: null, is_active: true, is_system: true, current_balance: 0 },
  { id: 11, code: '2100', name: 'Accounts Payable', account_type: 'LIABILITY', parent: 10, is_active: true, current_balance: 35000 },
  { id: 12, code: '2200', name: 'Accrued Liabilities', account_type: 'LIABILITY', parent: 10, is_active: true, current_balance: 15000 },
  { id: 13, code: '2300', name: 'Tax Payable', account_type: 'LIABILITY', parent: 10, is_active: true, current_balance: 8000 },
  { id: 14, code: '2400', name: 'Long-term Loans', account_type: 'LIABILITY', parent: 10, is_active: true, current_balance: 100000 },
  
  { id: 20, code: '3000', name: 'Equity', account_type: 'EQUITY', parent: null, is_active: true, is_system: true, current_balance: 0 },
  { id: 21, code: '3100', name: 'Share Capital', account_type: 'EQUITY', parent: 20, is_active: true, current_balance: 300000 },
  { id: 22, code: '3200', name: 'Retained Earnings', account_type: 'EQUITY', parent: 20, is_active: true, current_balance: 59000 },
  
  { id: 30, code: '4000', name: 'Revenue', account_type: 'REVENUE', parent: null, is_active: true, is_system: true, current_balance: 0 },
  { id: 31, code: '4100', name: 'Sales Revenue', account_type: 'REVENUE', parent: 30, is_active: true, current_balance: 450000 },
  { id: 32, code: '4200', name: 'Service Revenue', account_type: 'REVENUE', parent: 30, is_active: true, current_balance: 125000 },
  { id: 33, code: '4300', name: 'Other Income', account_type: 'REVENUE', parent: 30, is_active: true, current_balance: 5000 },
  
  { id: 40, code: '5000', name: 'Expenses', account_type: 'EXPENSE', parent: null, is_active: true, is_system: true, current_balance: 0 },
  { id: 41, code: '5100', name: 'Cost of Goods Sold', account_type: 'EXPENSE', parent: 40, is_active: true, current_balance: 280000 },
  { id: 42, code: '5200', name: 'Salaries & Wages', account_type: 'EXPENSE', parent: 40, is_active: true, current_balance: 150000 },
  { id: 43, code: '5300', name: 'Rent Expense', account_type: 'EXPENSE', parent: 40, is_active: true, current_balance: 36000 },
  { id: 44, code: '5400', name: 'Utilities', account_type: 'EXPENSE', parent: 40, is_active: true, current_balance: 12000 },
  { id: 45, code: '5500', name: 'Marketing', account_type: 'EXPENSE', parent: 40, is_active: true, current_balance: 25000 },
  { id: 46, code: '5600', name: 'Depreciation', account_type: 'EXPENSE', parent: 40, is_active: true, current_balance: 18000 },
];

export default function ChartOfAccountsPage() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tree view expanded state
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    account_type: 'ASSET' as Account['account_type'],
    parent: null as number | null,
    description: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await accountingApi.getAccounts() as { data?: { results?: Account[] } | Account[] };
      const data = response?.data 
        ? (Array.isArray(response.data) ? response.data : response.data.results || [])
        : [];
      setAccounts(data.length > 0 ? data : getDemoAccounts());
    } catch (error) {
      console.error('Failed to load accounts:', error);
      setAccounts(getDemoAccounts());
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const matchesType = filterType === 'all' || account.account_type === filterType;
      const matchesSearch = !searchTerm || 
        account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [accounts, filterType, searchTerm]);

  // Build tree structure
  const accountTree = useMemo(() => {
    const buildTree = (parentId: number | null): Account[] => {
      return filteredAccounts
        .filter(a => a.parent === parentId)
        .map(account => ({
          ...account,
          children: buildTree(account.id),
        }))
        .sort((a, b) => a.code.localeCompare(b.code));
    };
    return buildTree(null);
  }, [filteredAccounts]);

  // Get parent accounts for select
  const parentAccounts = useMemo(() => {
    return accounts.filter(a => !a.parent); // Only top-level accounts
  }, [accounts]);

  const handleCreate = async () => {
    if (!formData.code || !formData.name) {
      alert('Code and Name are required / 代碼和名稱為必填');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await accountingApi.createAccount(formData);
      setShowCreateDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to create account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      code: account.code,
      name: account.name,
      account_type: account.account_type,
      parent: account.parent || null,
      description: account.description || '',
      is_active: account.is_active,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!editingAccount) return;
    
    setIsSubmitting(true);
    try {
      await accountingApi.updateAccount(editingAccount.id, formData);
      setShowEditDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to update account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (account: Account) => {
    setDeletingAccount(account);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;
    
    setIsSubmitting(true);
    try {
      await accountingApi.deleteAccount(deletingAccount.id);
      setShowDeleteDialog(false);
      setDeletingAccount(null);
      loadData();
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      account_type: 'ASSET',
      parent: null,
      description: '',
      is_active: true,
    });
    setEditingAccount(null);
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allIds = accounts.filter(a => !a.parent).map(a => a.id);
    setExpandedNodes(new Set(allIds));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const getTypeColor = (type: Account['account_type']) => {
    switch (type) {
      case 'ASSET': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'LIABILITY': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'EQUITY': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'REVENUE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'EXPENSE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: Account['account_type']) => {
    switch (type) {
      case 'ASSET': return t('chartOfAccounts.types.asset');
      case 'LIABILITY': return t('chartOfAccounts.types.liability');
      case 'EQUITY': return t('chartOfAccounts.types.equity');
      case 'REVENUE': return t('chartOfAccounts.types.revenue');
      case 'EXPENSE': return t('chartOfAccounts.types.expense');
      default: return type;
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Account Form Component
  const AccountForm = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">{t('chartOfAccounts.accountCode')} *</Label>
        <Input
          className="col-span-3"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="1000, 1100..."
          maxLength={20}
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">{t('chartOfAccounts.accountName')} *</Label>
        <Input
          className="col-span-3"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Account name..."
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">{t('chartOfAccounts.accountType')} *</Label>
        <Select
          value={formData.account_type}
          onValueChange={(value) => setFormData({ ...formData, account_type: value as Account['account_type'] })}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ASSET">{t('chartOfAccounts.types.asset')}</SelectItem>
            <SelectItem value="LIABILITY">{t('chartOfAccounts.types.liability')}</SelectItem>
            <SelectItem value="EQUITY">{t('chartOfAccounts.types.equity')}</SelectItem>
            <SelectItem value="REVENUE">{t('chartOfAccounts.types.revenue')}</SelectItem>
            <SelectItem value="EXPENSE">{t('chartOfAccounts.types.expense')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">{t('chartOfAccounts.parentAccount')}</Label>
        <Select
          value={formData.parent?.toString() || 'none'}
          onValueChange={(value) => setFormData({ ...formData, parent: value === 'none' ? null : parseInt(value) })}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select parent..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— None —</SelectItem>
            {accounts.map(account => (
              <SelectItem key={account.id} value={account.id.toString()}>
                {account.code} - {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right pt-2">{t('chartOfAccounts.optionalDescription')}</Label>
        <Textarea
          className="col-span-3"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description..."
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">{t('chartOfAccounts.isActive')}</Label>
        <div className="col-span-3 flex items-center gap-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <span className="text-sm text-muted-foreground">
            {formData.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );

  // Tree View Row Component
  const TreeRow = ({ account, level = 0 }: { account: Account; level?: number }) => {
    const hasChildren = account.children && account.children.length > 0;
    const isExpanded = expandedNodes.has(account.id);

    return (
      <>
        <TableRow className="hover:bg-muted/50">
          <TableCell>
            <div className="flex items-center gap-1" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleExpand(account.id)}
                >
                  {isExpanded ? (
                    <IconChevronDown className="h-4 w-4" />
                  ) : (
                    <IconChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <span className="w-6" />
              )}
              {hasChildren ? (
                <IconFolder className="h-4 w-4 text-yellow-500" />
              ) : (
                <IconFile className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-mono text-sm">{account.code}</span>
            </div>
          </TableCell>
          <TableCell className="font-medium">{account.name}</TableCell>
          <TableCell>
            <Badge className={getTypeColor(account.account_type)} variant="secondary">
              {getTypeLabel(account.account_type)}
            </Badge>
          </TableCell>
          <TableCell className="text-right font-mono">
            {formatCurrency(account.current_balance)}
          </TableCell>
          <TableCell className="text-center">
            <Badge variant={account.is_active ? 'default' : 'secondary'}>
              {account.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <IconDotsVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(account)}>
                  <IconEdit className="mr-2 h-4 w-4" />
                  {t('chartOfAccounts.editAccount')}
                </DropdownMenuItem>
                {!account.is_system && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDeleteClick(account)}
                  >
                    <IconTrash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {isExpanded && account.children?.map((child) => (
          <TreeRow key={child.id} account={child} level={level + 1} />
        ))}
      </>
    );
  };

  return (
    <PageContainer scrollable>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('chartOfAccounts.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('chartOfAccounts.description')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <IconRefresh className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              {t('chartOfAccounts.addAccount')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search by code or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Type Filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('chartOfAccounts.filterByType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('chartOfAccounts.allTypes')}</SelectItem>
                  <SelectItem value="ASSET">{t('chartOfAccounts.types.asset')}</SelectItem>
                  <SelectItem value="LIABILITY">{t('chartOfAccounts.types.liability')}</SelectItem>
                  <SelectItem value="EQUITY">{t('chartOfAccounts.types.equity')}</SelectItem>
                  <SelectItem value="REVENUE">{t('chartOfAccounts.types.revenue')}</SelectItem>
                  <SelectItem value="EXPENSE">{t('chartOfAccounts.types.expense')}</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-r-none"
                >
                  <IconList className="h-4 w-4 mr-1" />
                  {t('chartOfAccounts.listView')}
                </Button>
                <Button
                  variant={viewMode === 'tree' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('tree')}
                  className="rounded-l-none"
                >
                  <IconHierarchy className="h-4 w-4 mr-1" />
                  {t('chartOfAccounts.treeView')}
                </Button>
              </div>
              
              {viewMode === 'tree' && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={expandAll}>
                    Expand All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={collapseAll}>
                    Collapse All
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('chartOfAccounts.allAccounts')}</CardTitle>
            <CardDescription>
              {filteredAccounts.length} {filteredAccounts.length === 1 ? 'account' : 'accounts'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <IconHierarchy className="mx-auto h-12 w-12 mb-4" />
                <p>{t('chartOfAccounts.noAccounts')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">{t('chartOfAccounts.accountCode')}</TableHead>
                    <TableHead>{t('chartOfAccounts.accountName')}</TableHead>
                    <TableHead className="w-[120px]">{t('chartOfAccounts.accountType')}</TableHead>
                    <TableHead className="text-right w-[150px]">{t('chartOfAccounts.currentBalance')}</TableHead>
                    <TableHead className="text-center w-[100px]">{t('chartOfAccounts.isActive')}</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewMode === 'tree' ? (
                    accountTree.map((account) => (
                      <TreeRow key={account.id} account={account} />
                    ))
                  ) : (
                    filteredAccounts
                      .sort((a, b) => a.code.localeCompare(b.code))
                      .map((account) => (
                        <TableRow key={account.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono">{account.code}</TableCell>
                          <TableCell className="font-medium">{account.name}</TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(account.account_type)} variant="secondary">
                              {getTypeLabel(account.account_type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(account.current_balance)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={account.is_active ? 'default' : 'secondary'}>
                              {account.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <IconDotsVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(account)}>
                                  <IconEdit className="mr-2 h-4 w-4" />
                                  {t('chartOfAccounts.editAccount')}
                                </DropdownMenuItem>
                                {!account.is_system && (
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeleteClick(account)}
                                  >
                                    <IconTrash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('chartOfAccounts.addAccount')}</DialogTitle>
              <DialogDescription>
                {t('chartOfAccounts.addAccountDescription')}
              </DialogDescription>
            </DialogHeader>
            <AccountForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isSubmitting}>
                {isSubmitting && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('chartOfAccounts.editAccount')}</DialogTitle>
              <DialogDescription>
                {t('chartOfAccounts.editAccountDescription')}
              </DialogDescription>
            </DialogHeader>
            <AccountForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isSubmitting}>
                {isSubmitting && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{deletingAccount?.code} - {deletingAccount?.name}&quot;? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                {isSubmitting && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
