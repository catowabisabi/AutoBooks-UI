'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { IconArrowLeft, IconLoader2, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/lib/i18n/provider';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceFormData {
  invoiceNumber: string;
  client: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  status: string;
  items: InvoiceItem[];
  notes: string;
  taxRate: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    client: '',
    clientEmail: '',
    clientAddress: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Pending',
    items: [
      { id: '1', description: '', quantity: 1, unitPrice: 0, amount: 0 }
    ],
    notes: '',
    taxRate: 0,
  });

  const handleChange = (field: keyof InvoiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate amount
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: String(prev.items.length + 1), description: '', quantity: 1, unitPrice: 0, amount: 0 }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) {
      toast.error(t('invoices.atLeastOneItem'));
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (formData.taxRate / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client.trim()) {
      toast.error(t('invoices.clientRequired'));
      return;
    }
    
    if (formData.items.some(item => !item.description.trim())) {
      toast.error(t('invoices.itemDescriptionRequired'));
      return;
    }
    
    setIsSaving(true);
    
    try {
      // TODO: Implement API call to create invoice
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(t('invoices.created'));
      router.push('/dashboard/finance/invoices');
    } catch (error) {
      console.error('Create invoice error:', error);
      toast.error(t('invoices.createFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <Link href='/dashboard/finance/invoices'>
            <Button variant='ghost' size='icon'>
              <IconArrowLeft className='size-5' />
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>{t('invoices.newInvoice')}</h1>
            <p className='text-muted-foreground'>{t('invoices.newInvoiceDescription')}</p>
          </div>
        </div>

        <Separator />

        <form onSubmit={handleSubmit}>
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Invoice Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('invoices.invoiceInfo')}</CardTitle>
                <CardDescription>{t('invoices.invoiceInfoDescription')}</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='invoiceNumber'>{t('invoices.invoiceNumber')}</Label>
                  <Input
                    id='invoiceNumber'
                    value={formData.invoiceNumber}
                    onChange={(e) => handleChange('invoiceNumber', e.target.value)}
                    placeholder='INV-2024-001'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='issueDate'>{t('invoices.issueDate')}</Label>
                  <Input
                    id='issueDate'
                    type='date'
                    value={formData.issueDate}
                    onChange={(e) => handleChange('issueDate', e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='dueDate'>{t('invoices.dueDate')}</Label>
                  <Input
                    id='dueDate'
                    type='date'
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='status'>{t('invoices.status')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Pending'>{t('invoices.statusPending')}</SelectItem>
                      <SelectItem value='Paid'>{t('invoices.statusPaid')}</SelectItem>
                      <SelectItem value='Overdue'>{t('invoices.statusOverdue')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('invoices.clientInfo')}</CardTitle>
                <CardDescription>{t('invoices.clientInfoDescription')}</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='client'>{t('invoices.client')} *</Label>
                  <Input
                    id='client'
                    value={formData.client}
                    onChange={(e) => handleChange('client', e.target.value)}
                    placeholder={t('invoices.clientPlaceholder')}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='clientEmail'>{t('invoices.clientEmail')}</Label>
                  <Input
                    id='clientEmail'
                    type='email'
                    value={formData.clientEmail}
                    onChange={(e) => handleChange('clientEmail', e.target.value)}
                    placeholder='client@example.com'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='clientAddress'>{t('invoices.clientAddress')}</Label>
                  <Textarea
                    id='clientAddress'
                    value={formData.clientAddress}
                    onChange={(e) => handleChange('clientAddress', e.target.value)}
                    placeholder={t('invoices.clientAddressPlaceholder')}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Items */}
          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>{t('invoices.invoiceItems')}</CardTitle>
              <CardDescription>{t('invoices.invoiceItemsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {formData.items.map((item, index) => (
                  <div key={item.id} className='flex gap-4 items-end'>
                    <div className='flex-1 space-y-2'>
                      <Label>{t('invoices.itemDescription')}</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder={t('invoices.itemDescriptionPlaceholder')}
                      />
                    </div>
                    <div className='w-24 space-y-2'>
                      <Label>{t('invoices.quantity')}</Label>
                      <Input
                        type='number'
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className='w-32 space-y-2'>
                      <Label>{t('invoices.unitPrice')}</Label>
                      <Input
                        type='number'
                        min={0}
                        step='0.01'
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className='w-32 space-y-2'>
                      <Label>{t('invoices.amount')}</Label>
                      <Input
                        value={item.amount.toFixed(2)}
                        disabled
                        className='bg-muted'
                      />
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => removeItem(index)}
                      className='text-destructive hover:text-destructive'
                    >
                      <IconTrash className='size-4' />
                    </Button>
                  </div>
                ))}
                
                <Button type='button' variant='outline' onClick={addItem}>
                  <IconPlus className='mr-2 size-4' />
                  {t('invoices.addItem')}
                </Button>
              </div>

              <Separator className='my-6' />

              {/* Totals */}
              <div className='flex justify-end'>
                <div className='w-64 space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>{t('invoices.subtotal')}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-muted-foreground'>{t('invoices.tax')}</span>
                    <div className='flex items-center gap-2'>
                      <Input
                        type='number'
                        min={0}
                        max={100}
                        value={formData.taxRate}
                        onChange={(e) => handleChange('taxRate', parseFloat(e.target.value) || 0)}
                        className='w-16 text-right'
                      />
                      <span>%</span>
                    </div>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className='flex justify-between text-lg font-bold'>
                    <span>{t('invoices.total')}</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>{t('invoices.notes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={t('invoices.notesPlaceholder')}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className='mt-6 flex justify-end gap-4'>
            <Link href='/dashboard/finance/invoices'>
              <Button type='button' variant='outline'>
                {t('common.cancel')}
              </Button>
            </Link>
            <Button type='submit' disabled={isSaving}>
              {isSaving && <IconLoader2 className='mr-2 size-4 animate-spin' />}
              {t('invoices.createInvoice')}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
