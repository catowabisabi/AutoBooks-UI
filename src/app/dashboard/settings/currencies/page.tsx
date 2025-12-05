'use client';

import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  IconPlus,
  IconRefresh,
  IconLoader2,
  IconEdit,
  IconCurrencyDollar,
  IconStar,
  IconStarFilled,
} from '@tabler/icons-react';
import { getCurrencies, createCurrency, updateCurrency, Currency } from '@/app/dashboard/finance/services';

export default function CurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    symbol: '',
    exchange_rate: 1,
    decimal_places: 2,
    is_base: false,
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getCurrencies();
      setCurrencies(data.results || getDemoCurrencies());
    } catch (error) {
      console.error('Failed to load currencies:', error);
      setCurrencies(getDemoCurrencies());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.code || !formData.name) {
      alert('Code and Name are required / 代碼和名稱為必填');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createCurrency(formData);
      setShowCreateDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to create currency:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setFormData({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol || '',
      exchange_rate: currency.exchange_rate || 1,
      decimal_places: currency.decimal_places || 2,
      is_base: currency.is_base || false,
      is_active: currency.is_active,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!editingCurrency) return;
    
    setIsSubmitting(true);
    try {
      await updateCurrency(editingCurrency.id, formData);
      setShowEditDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to update currency:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      symbol: '',
      exchange_rate: 1,
      decimal_places: 2,
      is_base: false,
      is_active: true,
    });
    setEditingCurrency(null);
  };

  const CurrencyForm = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Code / 代碼 *</Label>
        <Input
          className="col-span-3"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          placeholder="USD, TWD, EUR..."
          maxLength={3}
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Name / 名稱 *</Label>
        <Input
          className="col-span-3"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="US Dollar, New Taiwan Dollar..."
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Symbol / 符號</Label>
        <Input
          className="col-span-3"
          value={formData.symbol}
          onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
          placeholder="$, NT$, €..."
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Exchange Rate / 匯率</Label>
        <Input
          type="number"
          step="0.0001"
          className="col-span-3"
          value={formData.exchange_rate}
          onChange={(e) => setFormData({ ...formData, exchange_rate: parseFloat(e.target.value) || 1 })}
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Decimal Places / 小數位</Label>
        <Input
          type="number"
          min={0}
          max={6}
          className="col-span-3"
          value={formData.decimal_places}
          onChange={(e) => setFormData({ ...formData, decimal_places: parseInt(e.target.value) || 2 })}
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Base Currency / 基準貨幣</Label>
        <div className="col-span-3 flex items-center gap-2">
          <Switch
            checked={formData.is_base}
            onCheckedChange={(checked) => setFormData({ ...formData, is_base: checked })}
          />
          <span className="text-sm text-muted-foreground">
            {formData.is_base ? 'Yes / 是' : 'No / 否'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Active / 啟用</Label>
        <div className="col-span-3 flex items-center gap-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <span className="text-sm text-muted-foreground">
            {formData.is_active ? 'Active / 啟用' : 'Inactive / 停用'}
          </span>
        </div>
      </div>
    </div>
  );

  const baseCurrency = currencies.find(c => c.is_base);

  return (
    <PageContainer scrollable>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Currencies / 貨幣管理
            </h1>
            <p className="text-muted-foreground">
              Manage currencies and exchange rates
              <br />
              管理貨幣和匯率
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <IconRefresh className="mr-2 h-4 w-4" />
              Refresh / 重新整理
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Add Currency / 新增貨幣
            </Button>
          </div>
        </div>

        {/* Base Currency Info */}
        {baseCurrency && (
          <Card className="bg-primary/5">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <IconStarFilled className="h-4 w-4 text-yellow-500" />
                Base Currency / 基準貨幣
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">
                  {baseCurrency.code}
                </div>
                <div>
                  <div className="font-medium">{baseCurrency.name}</div>
                  <div className="text-sm text-muted-foreground">
                    All exchange rates are relative to this currency
                    <br />
                    所有匯率都相對於此貨幣
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Currencies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Currencies / 貨幣列表</CardTitle>
            <CardDescription>
              Manage available currencies for transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : currencies.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <IconCurrencyDollar className="mx-auto h-12 w-12 mb-4" />
                <p>No currencies configured</p>
                <p className="text-sm">尚未設定貨幣</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code / 代碼</TableHead>
                    <TableHead>Name / 名稱</TableHead>
                    <TableHead>Symbol / 符號</TableHead>
                    <TableHead className="text-right">Exchange Rate / 匯率</TableHead>
                    <TableHead className="text-center">Decimals / 小數</TableHead>
                    <TableHead>Status / 狀態</TableHead>
                    <TableHead>Actions / 操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencies.map((currency) => (
                    <TableRow key={currency.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {currency.is_base && (
                            <IconStarFilled className="h-4 w-4 text-yellow-500" />
                          )}
                          {currency.code}
                        </div>
                      </TableCell>
                      <TableCell>{currency.name}</TableCell>
                      <TableCell>{currency.symbol || '-'}</TableCell>
                      <TableCell className="text-right font-mono">
                        {currency.is_base ? '1.0000 (base)' : currency.exchange_rate?.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-center">
                        {currency.decimal_places}
                      </TableCell>
                      <TableCell>
                        <Badge variant={currency.is_active ? 'default' : 'secondary'}>
                          {currency.is_active ? '啟用' : '停用'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(currency)}>
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Currency / 新增貨幣</DialogTitle>
              <DialogDescription>
                Add a new currency for transactions
              </DialogDescription>
            </DialogHeader>
            <CurrencyForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                Cancel / 取消
              </Button>
              <Button onClick={handleCreate} disabled={isSubmitting || !formData.code || !formData.name}>
                {isSubmitting ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create / 建立
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Currency / 編輯貨幣</DialogTitle>
              <DialogDescription>
                Update currency settings
              </DialogDescription>
            </DialogHeader>
            <CurrencyForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
                Cancel / 取消
              </Button>
              <Button onClick={handleUpdate} disabled={isSubmitting}>
                {isSubmitting ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update / 更新
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

// Demo data
function getDemoCurrencies(): Currency[] {
  return [
    {
      id: '1',
      code: 'TWD',
      name: 'New Taiwan Dollar',
      symbol: 'NT$',
      exchange_rate: 1,
      decimal_places: 0,
      is_base: true,
      is_active: true,
    },
    {
      id: '2',
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      exchange_rate: 32.15,
      decimal_places: 2,
      is_base: false,
      is_active: true,
    },
    {
      id: '3',
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      exchange_rate: 34.82,
      decimal_places: 2,
      is_base: false,
      is_active: true,
    },
    {
      id: '4',
      code: 'JPY',
      name: 'Japanese Yen',
      symbol: '¥',
      exchange_rate: 0.2145,
      decimal_places: 0,
      is_base: false,
      is_active: true,
    },
    {
      id: '5',
      code: 'CNY',
      name: 'Chinese Yuan',
      symbol: '¥',
      exchange_rate: 4.42,
      decimal_places: 2,
      is_base: false,
      is_active: true,
    },
  ];
}
