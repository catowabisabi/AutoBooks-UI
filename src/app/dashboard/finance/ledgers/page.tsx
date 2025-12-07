'use client';

import { useEffect, useState, useCallback } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
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
  IconRefresh,
  IconSearch,
  IconChevronDown,
  IconChevronRight,
  IconFolder,
  IconFileText,
  IconTrendingUp,
  IconTrendingDown,
  IconFilter,
  IconBook,
  IconReceipt,
} from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/export-utils';
import {
  getAccounts,
  getChartOfAccounts,
  getJournalEntries,
  type Account,
  type JournalEntry,
} from '../services';

// Account type display config
const ACCOUNT_TYPES = {
  ASSET: { label: '資產 Asset', color: 'bg-blue-100 text-blue-800' },
  LIABILITY: { label: '負債 Liability', color: 'bg-red-100 text-red-800' },
  EQUITY: { label: '權益 Equity', color: 'bg-green-100 text-green-800' },
  REVENUE: { label: '收入 Revenue', color: 'bg-emerald-100 text-emerald-800' },
  EXPENSE: { label: '費用 Expense', color: 'bg-orange-100 text-orange-800' },
};

// Account tree component
function AccountTree({ 
  accounts, 
  level = 0, 
  onSelect 
}: { 
  accounts: Account[]; 
  level?: number; 
  onSelect: (account: Account) => void;
}) {
  return (
    <>
      {accounts.map((account) => (
        <AccountTreeItem 
          key={account.id} 
          account={account} 
          level={level} 
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

function AccountTreeItem({ 
  account, 
  level, 
  onSelect 
}: { 
  account: Account; 
  level: number; 
  onSelect: (account: Account) => void;
}) {
  const [isOpen, setIsOpen] = useState(level < 1);
  const hasChildren = account.children && account.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center justify-between p-2 hover:bg-muted/50 rounded cursor-pointer',
          level > 0 && 'border-l-2 border-muted ml-4'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(account)}
      >
        <div className='flex items-center gap-2'>
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className='p-0.5 hover:bg-muted rounded'
            >
              {isOpen ? (
                <IconChevronDown className='h-4 w-4' />
              ) : (
                <IconChevronRight className='h-4 w-4' />
              )}
            </button>
          ) : (
            <div className='w-5' />
          )}
          {hasChildren ? (
            <IconFolder className='h-4 w-4 text-muted-foreground' />
          ) : (
            <IconFileText className='h-4 w-4 text-muted-foreground' />
          )}
          <span className='font-mono text-sm text-muted-foreground'>{account.code}</span>
          <span className='font-medium'>{account.name}</span>
          {account.name_zh && (
            <span className='text-muted-foreground text-sm'>({account.name_zh})</span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className={ACCOUNT_TYPES[account.account_type]?.color}>
            {ACCOUNT_TYPES[account.account_type]?.label || account.account_type}
          </Badge>
          <span className={cn(
            'font-mono font-medium',
            account.current_balance >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {formatCurrency(Math.abs(account.current_balance))}
          </span>
        </div>
      </div>
      {hasChildren && isOpen && (
        <AccountTree 
          accounts={account.children!} 
          level={level + 1} 
          onSelect={onSelect}
        />
      )}
    </div>
  );
}

export default function LedgersPage() {
  const [loading, setLoading] = useState(true);
  const [chartOfAccounts, setChartOfAccounts] = useState<Account[]>([]);
  const [flatAccounts, setFlatAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [coa, accounts, entries] = await Promise.all([
        getChartOfAccounts(),
        getAccounts(),
        getJournalEntries(),
      ]);
      
      setChartOfAccounts(coa);
      setFlatAccounts(accounts.results);
      setJournalEntries(entries.results);
      toast.success('帳本資料載入完成');
    } catch (error) {
      console.error('Failed to load ledger data:', error);
      toast.warning('使用示範資料顯示');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter accounts
  const filteredAccounts = flatAccounts.filter(account => {
    const matchesSearch = 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.code.includes(searchTerm) ||
      (account.name_zh && account.name_zh.includes(searchTerm));
    const matchesType = typeFilter === 'all' || account.account_type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate totals by type
  const accountSummary = flatAccounts.reduce((acc, account) => {
    if (!acc[account.account_type]) {
      acc[account.account_type] = { count: 0, balance: 0 };
    }
    acc[account.account_type].count += 1;
    acc[account.account_type].balance += account.current_balance;
    return acc;
  }, {} as Record<string, { count: number; balance: number }>);

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title='總帳管理 / General Ledger'
          description='查看會計科目表、追蹤交易紀錄和管理財務帳目。View chart of accounts, track transactions, and manage financial ledgers.'
        />
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={loadData} disabled={loading}>
            <IconRefresh className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Link
            href='/dashboard/finance/ledgers/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> 新增科目
          </Link>
        </div>
      </div>
      <Separator />

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-5'>
        {Object.entries(ACCOUNT_TYPES).map(([type, config]) => (
          <Card key={type}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-medium'>{config.label}</CardTitle>
              {type === 'ASSET' || type === 'EXPENSE' ? (
                <IconTrendingUp className='h-4 w-4 text-muted-foreground' />
              ) : (
                <IconTrendingDown className='h-4 w-4 text-muted-foreground' />
              )}
            </CardHeader>
            <CardContent>
              <div className='text-lg font-bold'>
                {loading ? (
                  <Skeleton className='h-6 w-20' />
                ) : (
                  formatCurrency(accountSummary[type]?.balance || 0)
                )}
              </div>
              <p className='text-xs text-muted-foreground'>
                {accountSummary[type]?.count || 0} 個科目
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue='chart' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='chart' className='gap-2'>
            <IconFolder className='h-4 w-4' />
            會計科目表
          </TabsTrigger>
          <TabsTrigger value='list' className='gap-2'>
            <IconBook className='h-4 w-4' />
            科目清單
          </TabsTrigger>
          <TabsTrigger value='journal' className='gap-2'>
            <IconReceipt className='h-4 w-4' />
            日記帳
          </TabsTrigger>
        </TabsList>

        {/* Chart of Accounts Tab */}
        <TabsContent value='chart'>
          <Card>
            <CardHeader>
              <CardTitle>會計科目表 Chart of Accounts</CardTitle>
              <CardDescription>階層式顯示所有會計科目</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='space-y-2'>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className='h-10 w-full' />
                  ))}
                </div>
              ) : chartOfAccounts.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <IconFolder className='mx-auto h-12 w-12 mb-4' />
                  <p>尚無會計科目資料</p>
                </div>
              ) : (
                <div className='border rounded-lg'>
                  <AccountTree 
                    accounts={chartOfAccounts} 
                    onSelect={setSelectedAccount}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account List Tab */}
        <TabsContent value='list'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>科目清單 Account List</CardTitle>
                  <CardDescription>所有會計科目的平面列表</CardDescription>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='relative'>
                    <IconSearch className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='搜尋科目...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='pl-8 w-[200px]'
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className='w-[150px]'>
                      <IconFilter className='mr-2 h-4 w-4' />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>全部類型</SelectItem>
                      {Object.entries(ACCOUNT_TYPES).map(([type, config]) => (
                        <SelectItem key={type} value={type}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='space-y-2'>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className='h-12 w-full' />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>科目代碼</TableHead>
                      <TableHead>科目名稱</TableHead>
                      <TableHead>中文名稱</TableHead>
                      <TableHead>類型</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead className='text-right'>餘額</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className='text-center py-8 text-muted-foreground'>
                          沒有符合條件的科目
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAccounts.map((account) => (
                        <TableRow 
                          key={account.id} 
                          className='cursor-pointer hover:bg-muted/50'
                          onClick={() => setSelectedAccount(account)}
                        >
                          <TableCell className='font-mono'>{account.code}</TableCell>
                          <TableCell className='font-medium'>{account.name}</TableCell>
                          <TableCell className='text-muted-foreground'>{account.name_zh || '-'}</TableCell>
                          <TableCell>
                            <Badge variant='outline' className={ACCOUNT_TYPES[account.account_type]?.color}>
                              {ACCOUNT_TYPES[account.account_type]?.label || account.account_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={account.is_active ? 'default' : 'secondary'}>
                              {account.is_active ? '啟用' : '停用'}
                            </Badge>
                          </TableCell>
                          <TableCell className={cn(
                            'text-right font-mono font-medium',
                            account.current_balance >= 0 ? 'text-green-600' : 'text-red-600'
                          )}>
                            {formatCurrency(Math.abs(account.current_balance))}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journal Entries Tab */}
        <TabsContent value='journal'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>日記帳 Journal Entries</CardTitle>
                  <CardDescription>所有會計分錄紀錄</CardDescription>
                </div>
                <Link
                  href='/dashboard/finance/ledgers/journal/new'
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  <IconPlus className='mr-2 h-4 w-4' /> 新增分錄
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='space-y-2'>
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className='h-16 w-full' />
                  ))}
                </div>
              ) : journalEntries.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <IconReceipt className='mx-auto h-12 w-12 mb-4' />
                  <p>尚無日記帳紀錄</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>分錄編號</TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>說明</TableHead>
                      <TableHead>參考</TableHead>
                      <TableHead className='text-right'>借方</TableHead>
                      <TableHead className='text-right'>貸方</TableHead>
                      <TableHead>狀態</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className='font-mono font-medium'>{entry.entry_number}</TableCell>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell className='max-w-[200px] truncate'>{entry.description}</TableCell>
                        <TableCell className='text-muted-foreground'>{entry.reference || '-'}</TableCell>
                        <TableCell className='text-right font-mono'>{formatCurrency(entry.total_debit)}</TableCell>
                        <TableCell className='text-right font-mono'>{formatCurrency(entry.total_credit)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            entry.status === 'POSTED' ? 'default' : 
                            entry.status === 'VOIDED' ? 'destructive' : 'secondary'
                          }>
                            {entry.status === 'POSTED' ? '已過帳' : 
                             entry.status === 'VOIDED' ? '已作廢' : '草稿'}
                          </Badge>
                          {!entry.is_balanced && (
                            <Badge variant='destructive' className='ml-1'>不平衡</Badge>
                          )}
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

      {/* Selected Account Detail (could be a sheet/dialog) */}
      {selectedAccount && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>
                  {selectedAccount.code} - {selectedAccount.name}
                  {selectedAccount.name_zh && ` (${selectedAccount.name_zh})`}
                </CardTitle>
                <CardDescription>科目詳細資訊</CardDescription>
              </div>
              <Button variant='ghost' size='sm' onClick={() => setSelectedAccount(null)}>
                關閉
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div>
                <label className='text-sm text-muted-foreground'>科目類型</label>
                <p className='font-medium'>
                  <Badge variant='outline' className={ACCOUNT_TYPES[selectedAccount.account_type]?.color}>
                    {ACCOUNT_TYPES[selectedAccount.account_type]?.label}
                  </Badge>
                </p>
              </div>
              <div>
                <label className='text-sm text-muted-foreground'>狀態</label>
                <p className='font-medium'>
                  <Badge variant={selectedAccount.is_active ? 'default' : 'secondary'}>
                    {selectedAccount.is_active ? '啟用中' : '已停用'}
                  </Badge>
                </p>
              </div>
              <div>
                <label className='text-sm text-muted-foreground'>借方正數</label>
                <p className='font-medium'>{selectedAccount.is_debit_positive ? '是' : '否'}</p>
              </div>
              <div>
                <label className='text-sm text-muted-foreground'>目前餘額</label>
                <p className={cn(
                  'text-xl font-bold font-mono',
                  selectedAccount.current_balance >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {formatCurrency(Math.abs(selectedAccount.current_balance))}
                </p>
              </div>
            </div>
            {selectedAccount.description && (
              <div className='mt-4'>
                <label className='text-sm text-muted-foreground'>說明</label>
                <p className='mt-1'>{selectedAccount.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
