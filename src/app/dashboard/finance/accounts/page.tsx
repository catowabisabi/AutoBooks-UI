'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/provider';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  IconPlus,
  IconEdit,
  IconChevronRight,
  IconChevronDown,
  IconRefresh,
  IconLoader2,
  IconSearch,
  IconFilter,
  IconWallet,
  IconCreditCard,
  IconBuildingBank,
  IconReceipt,
  IconReportMoney,
} from '@tabler/icons-react';
import { getAccounts, getChartOfAccounts, createAccount, updateAccount, Account } from '../services';

// Account type icon and color configurations (labels added in component with i18n)
const accountTypeConfigs = [
  { value: 'ASSET', icon: IconWallet, color: 'bg-blue-500' },
  { value: 'LIABILITY', icon: IconCreditCard, color: 'bg-red-500' },
  { value: 'EQUITY', icon: IconBuildingBank, color: 'bg-purple-500' },
  { value: 'REVENUE', icon: IconReportMoney, color: 'bg-green-500' },
  { value: 'EXPENSE', icon: IconReceipt, color: 'bg-orange-500' },
];

// Helper to get account type label key
const getAccountTypeLabelKey = (value: string): string => {
  const keyMap: Record<string, string> = {
    'ASSET': 'chartOfAccounts.types.asset',
    'LIABILITY': 'chartOfAccounts.types.liability',
    'EQUITY': 'chartOfAccounts.types.equity',
    'REVENUE': 'chartOfAccounts.types.revenue',
    'EXPENSE': 'chartOfAccounts.types.expense',
  };
  return keyMap[value] || value;
};

interface AccountTreeItemProps {
  account: Account;
  level: number;
  onEdit: (account: Account) => void;
  accountTypes: Array<{ value: string; label: string; icon: any; color: string }>;
  t: (key: string) => string;
}

function AccountTreeItem({ account, level, onEdit, accountTypes, t }: AccountTreeItemProps) {
  const [isOpen, setIsOpen] = useState(level < 2);
  const hasChildren = account.children && account.children.length > 0;
  const typeConfig = accountTypes.find(type => type.value === account.account_type);
  const Icon = typeConfig?.icon || IconWallet;

  return (
    <div>
      <div
        className={`flex items-center py-2 px-4 hover:bg-muted/50 cursor-pointer border-b ${
          level > 0 ? 'ml-' + (level * 6) : ''
        }`}
        style={{ paddingLeft: `${level * 24 + 16}px` }}
      >
        {hasChildren ? (
          <button onClick={() => setIsOpen(!isOpen)} className="mr-2">
            {isOpen ? (
              <IconChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <IconChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-6" />
        )}
        
        <Icon className={`h-4 w-4 mr-2 ${typeConfig?.color.replace('bg-', 'text-')}`} />
        
        <span className="font-mono text-sm mr-3">{account.code}</span>
        <span className="flex-1">{account.name}</span>
        
        <Badge variant="outline" className="mr-2">
          {typeConfig?.label.split(' / ')[0]}
        </Badge>
        
        <span className={`font-mono text-sm ${account.current_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ${account.current_balance?.toLocaleString() || '0.00'}
        </span>
        
        <Button variant="ghost" size="sm" className="ml-2" onClick={() => onEdit(account)}>
          <IconEdit className="h-4 w-4" />
        </Button>
      </div>
      
      {hasChildren && isOpen && (
        <div>
          {account.children!.map((child) => (
            <AccountTreeItem
              key={child.id}
              account={child}
              level={level + 1}
              onEdit={onEdit}
              accountTypes={accountTypes}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AccountsPage() {
  const { t } = useTranslation();
  
  // Account types with i18n labels
  const accountTypes = accountTypeConfigs.map(config => ({
    ...config,
    label: t(getAccountTypeLabelKey(config.value)),
  }));
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    name_zh: '',
    account_type: 'ASSET',
    parent: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [accountsData, chartData] = await Promise.all([
        getAccounts(),
        getChartOfAccounts(),
      ]);
      setAccounts(accountsData.results || []);
      setChartOfAccounts(chartData || []);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      // Use demo data
      setChartOfAccounts(getDemoChartOfAccounts());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await createAccount(formData);
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
      name_zh: account.name_zh || '',
      account_type: account.account_type,
      parent: account.parent || '',
      description: account.description || '',
      is_active: account.is_active,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!editingAccount) return;
    setIsSubmitting(true);
    try {
      await updateAccount(editingAccount.id, formData);
      setShowEditDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to update account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      name_zh: '',
      account_type: 'ASSET',
      parent: '',
      description: '',
      is_active: true,
    });
    setEditingAccount(null);
  };

  // Filter chart of accounts
  const filteredChart = chartOfAccounts.filter(account => {
    if (filterType !== 'all' && account.account_type !== filterType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return account.code.toLowerCase().includes(query) ||
             account.name.toLowerCase().includes(query);
    }
    return true;
  });

  // Calculate totals by type
  const totalsByType = accountTypes.map(type => {
    const total = accounts
      .filter(a => a.account_type === type.value)
      .reduce((sum, a) => sum + (a.current_balance || 0), 0);
    return { ...type, total };
  });

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
              {t('common.refresh')}
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              {t('chartOfAccounts.addAccount')}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {totalsByType.map((type) => {
            const Icon = type.icon;
            return (
              <Card key={type.value} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setFilterType(filterType === type.value ? 'all' : type.value)}>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${type.color.replace('bg-', 'text-')}`} />
                    {type.label}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${type.total >= 0 ? 'text-foreground' : 'text-red-500'}`}>
                    ${type.total.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <IconFilter className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t('chartOfAccounts.filterByType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('chartOfAccounts.allTypes')}</SelectItem>
              {accountTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'tree' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('tree')}
            >
              {t('chartOfAccounts.treeView')}
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              {t('chartOfAccounts.listView')}
            </Button>
          </div>
        </div>

        {/* Accounts Display */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filterType === 'all' ? t('chartOfAccounts.allAccounts') : accountTypes.find(type => type.value === filterType)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : viewMode === 'tree' ? (
              <div className="divide-y">
                {filteredChart.map((account) => (
                  <AccountTreeItem
                    key={account.id}
                    account={account}
                    level={0}
                    onEdit={handleEdit}
                    accountTypes={accountTypes}
                    t={t}
                  />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('chartOfAccounts.accountCode')}</TableHead>
                    <TableHead>{t('chartOfAccounts.accountName')}</TableHead>
                    <TableHead>{t('chartOfAccounts.accountType')}</TableHead>
                    <TableHead className="text-right">{t('chartOfAccounts.currentBalance')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts
                    .filter(a => filterType === 'all' || a.account_type === filterType)
                    .filter(a => !searchQuery || 
                      a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      a.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono">{account.code}</TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {accountTypes.find(t => t.value === account.account_type)?.label.split(' / ')[0]}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-mono ${account.current_balance >= 0 ? '' : 'text-red-500'}`}>
                        ${account.current_balance?.toLocaleString() || '0.00'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.is_active ? 'default' : 'secondary'}>
                          {account.is_active ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                          <IconEdit className="h-4 w-4" />
                        </Button>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('chartOfAccounts.addAccount')}</DialogTitle>
              <DialogDescription>
                {t('chartOfAccounts.addAccountDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{t('chartOfAccounts.accountCode')}</Label>
                <Input
                  className="col-span-3"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., 1100"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{t('chartOfAccounts.accountName')}</Label>
                <Input
                  className="col-span-3"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Cash"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{t('chartOfAccounts.accountNameZh')}</Label>
                <Input
                  className="col-span-3"
                  value={formData.name_zh}
                  onChange={(e) => setFormData({ ...formData, name_zh: e.target.value })}
                  placeholder="e.g., 現金"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{t('chartOfAccounts.accountType')}</Label>
                <Select
                  value={formData.account_type}
                  onValueChange={(v) => setFormData({ ...formData, account_type: v })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{t('common.description')}</Label>
                <Input
                  className="col-span-3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('chartOfAccounts.optionalDescription')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleCreate} disabled={isSubmitting || !formData.code || !formData.name}>
                {isSubmitting ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t('common.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('chartOfAccounts.editAccount')}</DialogTitle>
              <DialogDescription>
                {t('chartOfAccounts.editAccountDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{t('chartOfAccounts.accountCode')}</Label>
                <Input
                  className="col-span-3"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{t('chartOfAccounts.accountName')}</Label>
                <Input
                  className="col-span-3"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{t('chartOfAccounts.accountNameZh')}</Label>
                <Input
                  className="col-span-3"
                  value={formData.name_zh}
                  onChange={(e) => setFormData({ ...formData, name_zh: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{t('chartOfAccounts.accountType')}</Label>
                <Select
                  value={formData.account_type}
                  onValueChange={(v) => setFormData({ ...formData, account_type: v })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleUpdate} disabled={isSubmitting}>
                {isSubmitting ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t('common.update')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

// Demo data
function getDemoChartOfAccounts(): Account[] {
  return [
    {
      id: '1',
      code: '1000',
      name: 'Assets',
      account_type: 'ASSET',
      is_active: true,
      is_debit_positive: true,
      current_balance: 250000,
      created_at: '',
      updated_at: '',
      children: [
        {
          id: '1-1',
          code: '1100',
          name: 'Cash and Cash Equivalents',
          account_type: 'ASSET',
          is_active: true,
          is_debit_positive: true,
          current_balance: 128500,
          created_at: '',
          updated_at: '',
          children: [
            { id: '1-1-1', code: '1110', name: 'Petty Cash / 零用金', account_type: 'ASSET', is_active: true, is_debit_positive: true, current_balance: 5000, created_at: '', updated_at: '' },
            { id: '1-1-2', code: '1120', name: 'Bank Account / 銀行存款', account_type: 'ASSET', is_active: true, is_debit_positive: true, current_balance: 123500, created_at: '', updated_at: '' },
          ]
        },
        {
          id: '1-2',
          code: '1200',
          name: 'Accounts Receivable / 應收帳款',
          account_type: 'ASSET',
          is_active: true,
          is_debit_positive: true,
          current_balance: 45200,
          created_at: '',
          updated_at: '',
        },
        {
          id: '1-3',
          code: '1500',
          name: 'Fixed Assets / 固定資產',
          account_type: 'ASSET',
          is_active: true,
          is_debit_positive: true,
          current_balance: 76300,
          created_at: '',
          updated_at: '',
        },
      ]
    },
    {
      id: '2',
      code: '2000',
      name: 'Liabilities',
      account_type: 'LIABILITY',
      is_active: true,
      is_debit_positive: false,
      current_balance: 82100,
      created_at: '',
      updated_at: '',
      children: [
        { id: '2-1', code: '2100', name: 'Accounts Payable / 應付帳款', account_type: 'LIABILITY', is_active: true, is_debit_positive: false, current_balance: 32100, created_at: '', updated_at: '' },
        { id: '2-2', code: '2200', name: 'Taxes Payable / 應付稅款', account_type: 'LIABILITY', is_active: true, is_debit_positive: false, current_balance: 15000, created_at: '', updated_at: '' },
        { id: '2-3', code: '2300', name: 'Loans Payable / 應付貸款', account_type: 'LIABILITY', is_active: true, is_debit_positive: false, current_balance: 35000, created_at: '', updated_at: '' },
      ]
    },
    {
      id: '3',
      code: '3000',
      name: 'Equity',
      account_type: 'EQUITY',
      is_active: true,
      is_debit_positive: false,
      current_balance: 167900,
      created_at: '',
      updated_at: '',
      children: [
        { id: '3-1', code: '3100', name: 'Capital / 資本', account_type: 'EQUITY', is_active: true, is_debit_positive: false, current_balance: 100000, created_at: '', updated_at: '' },
        { id: '3-2', code: '3200', name: 'Retained Earnings / 保留盈餘', account_type: 'EQUITY', is_active: true, is_debit_positive: false, current_balance: 67900, created_at: '', updated_at: '' },
      ]
    },
    {
      id: '4',
      code: '4000',
      name: 'Revenue',
      account_type: 'REVENUE',
      is_active: true,
      is_debit_positive: false,
      current_balance: 325890,
      created_at: '',
      updated_at: '',
      children: [
        { id: '4-1', code: '4100', name: 'Sales Revenue / 銷售收入', account_type: 'REVENUE', is_active: true, is_debit_positive: false, current_balance: 298000, created_at: '', updated_at: '' },
        { id: '4-2', code: '4200', name: 'Service Revenue / 服務收入', account_type: 'REVENUE', is_active: true, is_debit_positive: false, current_balance: 27890, created_at: '', updated_at: '' },
      ]
    },
    {
      id: '5',
      code: '5000',
      name: 'Expenses',
      account_type: 'EXPENSE',
      is_active: true,
      is_debit_positive: true,
      current_balance: 271000,
      created_at: '',
      updated_at: '',
      children: [
        { id: '5-1', code: '5100', name: 'Cost of Goods Sold / 銷貨成本', account_type: 'EXPENSE', is_active: true, is_debit_positive: true, current_balance: 150000, created_at: '', updated_at: '' },
        { id: '5-2', code: '5200', name: 'Salaries Expense / 薪資費用', account_type: 'EXPENSE', is_active: true, is_debit_positive: true, current_balance: 85000, created_at: '', updated_at: '' },
        { id: '5-3', code: '5300', name: 'Rent Expense / 租金費用', account_type: 'EXPENSE', is_active: true, is_debit_positive: true, current_balance: 18000, created_at: '', updated_at: '' },
        { id: '5-4', code: '5400', name: 'Utilities Expense / 水電費', account_type: 'EXPENSE', is_active: true, is_debit_positive: true, current_balance: 8000, created_at: '', updated_at: '' },
        { id: '5-5', code: '5500', name: 'Marketing Expense / 行銷費用', account_type: 'EXPENSE', is_active: true, is_debit_positive: true, current_balance: 10000, created_at: '', updated_at: '' },
      ]
    },
  ];
}
