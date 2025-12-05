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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  IconPlus,
  IconRefresh,
  IconLoader2,
  IconEdit,
  IconReceipt2,
  IconPercentage,
} from '@tabler/icons-react';
import { getTaxRates, createTaxRate, updateTaxRate, TaxRate } from '@/app/dashboard/finance/services';

// Tax type config
const taxTypeConfig: Record<string, { label: string; labelZh: string }> = {
  SALES: { label: 'Sales Tax', labelZh: '銷售稅' },
  PURCHASE: { label: 'Purchase Tax', labelZh: '進項稅' },
  BOTH: { label: 'Both', labelZh: '銷售/進項' },
};

export default function TaxRatesPage() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    rate: 5,
    tax_type: 'BOTH' as 'SALES' | 'PURCHASE' | 'BOTH',
    description: '',
    is_compound: false,
    is_recoverable: true,
    is_default: false,
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getTaxRates();
      setTaxRates(data.results || getDemoTaxRates());
    } catch (error) {
      console.error('Failed to load tax rates:', error);
      setTaxRates(getDemoTaxRates());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) {
      alert('Name is required / 名稱為必填');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createTaxRate(formData);
      setShowCreateDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to create tax rate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (taxRate: TaxRate) => {
    setEditingTaxRate(taxRate);
    setFormData({
      name: taxRate.name,
      rate: taxRate.rate || 5,
      tax_type: taxRate.tax_type || 'BOTH',
      description: taxRate.description || '',
      is_compound: taxRate.is_compound || false,
      is_recoverable: taxRate.is_recoverable !== false,
      is_default: taxRate.is_default || false,
      is_active: taxRate.is_active,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!editingTaxRate) return;
    
    setIsSubmitting(true);
    try {
      await updateTaxRate(editingTaxRate.id, formData);
      setShowEditDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to update tax rate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      rate: 5,
      tax_type: 'BOTH',
      description: '',
      is_compound: false,
      is_recoverable: true,
      is_default: false,
      is_active: true,
    });
    setEditingTaxRate(null);
  };

  const TaxRateForm = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Name / 名稱 *</Label>
        <Input
          className="col-span-3"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="VAT 5%, Sales Tax..."
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Rate (%) / 稅率 *</Label>
        <div className="col-span-3 relative">
          <Input
            type="number"
            step="0.01"
            min={0}
            max={100}
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
          />
          <IconPercentage className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Type / 類型</Label>
        <Select
          value={formData.tax_type}
          onValueChange={(v) => setFormData({ ...formData, tax_type: v as any })}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SALES">Sales Tax / 銷售稅</SelectItem>
            <SelectItem value="PURCHASE">Purchase Tax / 進項稅</SelectItem>
            <SelectItem value="BOTH">Both / 兩者皆可</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Description / 說明</Label>
        <Input
          className="col-span-3"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Compound / 複合稅</Label>
        <div className="col-span-3 flex items-center gap-2">
          <Switch
            checked={formData.is_compound}
            onCheckedChange={(checked) => setFormData({ ...formData, is_compound: checked })}
          />
          <span className="text-sm text-muted-foreground">
            Calculate on top of other taxes / 基於其他稅額計算
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Recoverable / 可扣抵</Label>
        <div className="col-span-3 flex items-center gap-2">
          <Switch
            checked={formData.is_recoverable}
            onCheckedChange={(checked) => setFormData({ ...formData, is_recoverable: checked })}
          />
          <span className="text-sm text-muted-foreground">
            Tax can be recovered/refunded / 稅額可申報扣抵
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Default / 預設</Label>
        <div className="col-span-3 flex items-center gap-2">
          <Switch
            checked={formData.is_default}
            onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
          />
          <span className="text-sm text-muted-foreground">
            Use as default tax rate / 設為預設稅率
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

  const defaultTaxRate = taxRates.find(t => t.is_default && t.is_active);

  return (
    <PageContainer scrollable>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Tax Rates / 稅率管理
            </h1>
            <p className="text-muted-foreground">
              Configure tax rates for invoices and expenses
              <br />
              設定發票和費用的稅率
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <IconRefresh className="mr-2 h-4 w-4" />
              Refresh / 重新整理
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Add Tax Rate / 新增稅率
            </Button>
          </div>
        </div>

        {/* Default Tax Info */}
        {defaultTaxRate && (
          <Card className="bg-primary/5">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <IconReceipt2 className="h-4 w-4" />
                Default Tax Rate / 預設稅率
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">
                  {defaultTaxRate.rate}%
                </div>
                <div>
                  <div className="font-medium">{defaultTaxRate.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Applied to new transactions by default
                    <br />
                    預設套用於新交易
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tax Rates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Rates / 稅率列表</CardTitle>
            <CardDescription>
              Manage available tax rates for transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : taxRates.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <IconReceipt2 className="mx-auto h-12 w-12 mb-4" />
                <p>No tax rates configured</p>
                <p className="text-sm">尚未設定稅率</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name / 名稱</TableHead>
                    <TableHead className="text-right">Rate / 稅率</TableHead>
                    <TableHead>Type / 類型</TableHead>
                    <TableHead className="text-center">Compound / 複合</TableHead>
                    <TableHead className="text-center">Recoverable / 可扣抵</TableHead>
                    <TableHead>Status / 狀態</TableHead>
                    <TableHead>Actions / 操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxRates.map((taxRate) => (
                    <TableRow key={taxRate.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {taxRate.is_default && (
                            <Badge variant="outline" className="text-xs">Default</Badge>
                          )}
                          {taxRate.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {taxRate.rate}%
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {taxTypeConfig[taxRate.tax_type || 'BOTH']?.labelZh || taxRate.tax_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {taxRate.is_compound ? '✓' : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {taxRate.is_recoverable !== false ? '✓' : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={taxRate.is_active ? 'default' : 'secondary'}>
                          {taxRate.is_active ? '啟用' : '停用'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(taxRate)}>
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
              <DialogTitle>Add Tax Rate / 新增稅率</DialogTitle>
              <DialogDescription>
                Configure a new tax rate for transactions
              </DialogDescription>
            </DialogHeader>
            <TaxRateForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                Cancel / 取消
              </Button>
              <Button onClick={handleCreate} disabled={isSubmitting || !formData.name}>
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
              <DialogTitle>Edit Tax Rate / 編輯稅率</DialogTitle>
              <DialogDescription>
                Update tax rate configuration
              </DialogDescription>
            </DialogHeader>
            <TaxRateForm />
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
function getDemoTaxRates(): TaxRate[] {
  return [
    {
      id: '1',
      name: 'Standard VAT / 標準營業稅',
      rate: 5,
      tax_type: 'BOTH',
      description: 'Taiwan standard VAT rate',
      is_compound: false,
      is_recoverable: true,
      is_default: true,
      is_active: true,
    },
    {
      id: '2',
      name: 'Zero Rate / 零稅率',
      rate: 0,
      tax_type: 'BOTH',
      description: 'For exports and certain exempt goods',
      is_compound: false,
      is_recoverable: true,
      is_default: false,
      is_active: true,
    },
    {
      id: '3',
      name: 'Entertainment Tax / 娛樂稅',
      rate: 15,
      tax_type: 'SALES',
      description: 'Special entertainment services',
      is_compound: false,
      is_recoverable: false,
      is_default: false,
      is_active: true,
    },
    {
      id: '4',
      name: 'Non-Deductible / 不可扣抵',
      rate: 5,
      tax_type: 'PURCHASE',
      description: 'Purchases where tax cannot be recovered',
      is_compound: false,
      is_recoverable: false,
      is_default: false,
      is_active: true,
    },
  ];
}
