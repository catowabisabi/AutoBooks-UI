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
import { useTranslation } from '@/lib/i18n/provider';

export default function TaxRatesPage() {
  const { t } = useTranslation();
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
      alert(t('taxRates.nameRequired'));
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
        <Label className="text-right">{t('taxRates.name')} *</Label>
        <Input
          className="col-span-3"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="VAT 5%, Sales Tax..."
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">{t('taxRates.ratePercent')} *</Label>
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
        <Label className="text-right">{t('taxRates.type')}</Label>
        <Select
          value={formData.tax_type}
          onValueChange={(v) => setFormData({ ...formData, tax_type: v as any })}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SALES">{t('taxRates.salesTax')}</SelectItem>
            <SelectItem value="PURCHASE">{t('taxRates.purchaseTax')}</SelectItem>
            <SelectItem value="BOTH">{t('taxRates.both')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">{t('taxRates.description_label')}</Label>
        <Input
          className="col-span-3"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={t('taxRates.descriptionPlaceholder')}
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">{t('taxRates.compound')}</Label>
        <div className="col-span-3 flex items-center gap-2">
          <Switch
            checked={formData.is_compound}
            onCheckedChange={(checked) => setFormData({ ...formData, is_compound: checked })}
          />
          <span className="text-sm text-muted-foreground">
            {t('taxRates.compoundHint')}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">{t('taxRates.recoverable')}</Label>
        <div className="col-span-3 flex items-center gap-2">
          <Switch
            checked={formData.is_recoverable}
            onCheckedChange={(checked) => setFormData({ ...formData, is_recoverable: checked })}
          />
          <span className="text-sm text-muted-foreground">
            {t('taxRates.recoverableHint')}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">{t('taxRates.default')}</Label>
        <div className="col-span-3 flex items-center gap-2">
          <Switch
            checked={formData.is_default}
            onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
          />
          <span className="text-sm text-muted-foreground">
            {t('taxRates.defaultHint')}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">{t('taxRates.active')}</Label>
        <div className="col-span-3 flex items-center gap-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <span className="text-sm text-muted-foreground">
            {formData.is_active ? t('taxRates.active') : t('taxRates.inactive')}
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
              {t('taxRates.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('taxRates.description')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <IconRefresh className="mr-2 h-4 w-4" />
              {t('taxRates.refresh')}
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              {t('taxRates.addTaxRate')}
            </Button>
          </div>
        </div>

        {/* Default Tax Info */}
        {defaultTaxRate && (
          <Card className="bg-primary/5">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <IconReceipt2 className="h-4 w-4" />
                {t('taxRates.defaultTaxRate')}
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
                    {t('taxRates.defaultNote')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tax Rates Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('taxRates.list')}</CardTitle>
            <CardDescription>
              {t('taxRates.manageDescription')}
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
                <p>{t('taxRates.noTaxRates')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('taxRates.name')}</TableHead>
                    <TableHead className="text-right">{t('taxRates.rate')}</TableHead>
                    <TableHead>{t('taxRates.type')}</TableHead>
                    <TableHead className="text-center">{t('taxRates.compound')}</TableHead>
                    <TableHead className="text-center">{t('taxRates.recoverable')}</TableHead>
                    <TableHead>{t('taxRates.status')}</TableHead>
                    <TableHead>{t('taxRates.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxRates.map((taxRate) => (
                    <TableRow key={taxRate.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {taxRate.is_default && (
                            <Badge variant="outline" className="text-xs">{t('taxRates.default')}</Badge>
                          )}
                          {taxRate.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {taxRate.rate}%
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {taxRate.tax_type === 'SALES' ? t('taxRates.salesTax') : 
                           taxRate.tax_type === 'PURCHASE' ? t('taxRates.purchaseTax') : 
                           t('taxRates.both')}
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
                          {taxRate.is_active ? t('taxRates.active') : t('taxRates.inactive')}
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
              <DialogTitle>{t('taxRates.addTaxRate')}</DialogTitle>
              <DialogDescription>
                {t('taxRates.createDescription')}
              </DialogDescription>
            </DialogHeader>
            <TaxRateForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                {t('taxRates.cancel')}
              </Button>
              <Button onClick={handleCreate} disabled={isSubmitting || !formData.name}>
                {isSubmitting ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t('taxRates.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('taxRates.editTaxRate')}</DialogTitle>
              <DialogDescription>
                {t('taxRates.editDescription')}
              </DialogDescription>
            </DialogHeader>
            <TaxRateForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
                {t('taxRates.cancel')}
              </Button>
              <Button onClick={handleUpdate} disabled={isSubmitting}>
                {isSubmitting ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t('taxRates.update')}
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
