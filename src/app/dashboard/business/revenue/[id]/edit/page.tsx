'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react';
import { revenueApi, companiesApi, Revenue, Company } from '@/features/business/services';
import { CompanySelect } from '@/components/business/company-select';

const REVENUE_STATUS_OPTIONS = [
  { value: 'PENDING', label: '待收款' },
  { value: 'PARTIAL', label: '部分收款' },
  { value: 'RECEIVED', label: '已收款' },
  { value: 'OVERDUE', label: '逾期' },
  { value: 'WRITTEN_OFF', label: '已核銷' },
];

export default function RevenueEditPage() {
  const params = useParams();
  const router = useRouter();
  const revenueId = (params?.id as string) || 'new';
  const isNew = !params?.id || revenueId === 'new';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState<Partial<Revenue>>({
    company: '',
    invoice_number: '',
    description: '',
    total_amount: 0,
    received_amount: 0,
    status: 'PENDING',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companiesRes = await companiesApi.list();
        setCompanies(companiesRes.results || []);

        if (!isNew) {
          // Check if it's a demo ID
          if (revenueId.startsWith('demo-')) {
            toast.error('這是示範資料，無法編輯。請使用真實資料。');
            router.push('/dashboard/business/revenue');
            return;
          }
          
          setIsLoading(true);
          const revenue = await revenueApi.get(revenueId);
          setFormData({
            company: revenue.company,
            invoice_number: revenue.invoice_number || '',
            description: revenue.description || '',
            total_amount: revenue.total_amount,
            received_amount: revenue.received_amount,
            status: revenue.status,
            invoice_date: revenue.invoice_date || '',
            due_date: revenue.due_date || '',
            contact_name: revenue.contact_name || '',
            contact_email: revenue.contact_email || '',
            contact_phone: revenue.contact_phone || '',
            notes: revenue.notes || '',
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch data:', error);
        toast.error('找不到該收入記錄');
        setCompanies([
          { id: 'demo-1', name: 'ABC 有限公司', is_active: true, created_at: '', updated_at: '' },
          { id: 'demo-2', name: 'XYZ 科技股份有限公司', is_active: true, created_at: '', updated_at: '' },
        ]);
        if (!isNew) {
          router.push('/dashboard/business/revenue');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [revenueId, isNew, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.company) {
      toast.error('請選擇客戶公司');
      return;
    }
    if (!formData.total_amount || formData.total_amount <= 0) {
      toast.error('請輸入有效的金額');
      return;
    }
    
    setIsSaving(true);

    try {
      if (isNew) {
        await revenueApi.create(formData);
        toast.success('收入記錄已建立');
      } else {
        await revenueApi.update(revenueId, formData);
        toast.success('收入記錄已更新');
      }
      router.push('/dashboard/business/revenue');
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Save error:', error);
      const message = error?.response?.data?.detail || error?.message || (isNew ? '建立失敗' : '更新失敗');
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    field: keyof Revenue,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate pending amount
  const pendingAmount = (formData.total_amount || 0) - (formData.received_amount || 0);

  if (isLoading) {
    return (
      <PageContainer>
        <div className='space-y-6'>
          <Skeleton className='h-10 w-64' />
          <Skeleton className='h-[600px]' />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <Link href='/dashboard/business/revenue'>
            <Button variant='ghost' size='icon'>
              <IconArrowLeft className='size-5' />
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>
              {isNew ? '新增收入記錄' : '編輯收入記錄'}
            </h1>
            <p className='text-muted-foreground'>
              {isNew ? '建立新的收入/應收帳款記錄' : '更新收入記錄資訊'}
            </p>
          </div>
        </div>

        <Separator />

        <form onSubmit={handleSubmit}>
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Invoice Info */}
            <Card>
              <CardHeader>
                <CardTitle>發票資訊</CardTitle>
                <CardDescription>設定發票的基本資訊</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='company'>客戶公司 *</Label>
                  <CompanySelect
                    value={formData.company || ''}
                    onChange={(value) => handleChange('company', value)}
                    companies={companies}
                    onCompanyAdded={(company) => setCompanies((prev) => [...prev, company])}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='invoice_number'>發票編號</Label>
                  <Input
                    id='invoice_number'
                    value={formData.invoice_number}
                    onChange={(e) => handleChange('invoice_number', e.target.value)}
                    placeholder='例如：INV-2024-001'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>描述</Label>
                  <Textarea
                    id='description'
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder='描述服務內容...'
                    rows={3}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='status'>狀態</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='選擇狀態' />
                    </SelectTrigger>
                    <SelectContent>
                      {REVENUE_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Amount & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>金額與時間</CardTitle>
                <CardDescription>設定金額與日期資訊</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='total_amount'>總金額 (HK$) *</Label>
                  <Input
                    id='total_amount'
                    type='number'
                    min={0}
                    value={formData.total_amount}
                    onChange={(e) => handleChange('total_amount', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='received_amount'>已收金額 (HK$)</Label>
                  <Input
                    id='received_amount'
                    type='number'
                    min={0}
                    max={formData.total_amount}
                    value={formData.received_amount}
                    onChange={(e) => handleChange('received_amount', parseFloat(e.target.value) || 0)}
                  />
                </div>

                {/* Calculated pending amount */}
                <div className='rounded-lg border bg-muted/50 p-4'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>待收金額</span>
                    <span className='font-bold text-primary'>
                      HK${pendingAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='invoice_date'>開票日期</Label>
                  <Input
                    id='invoice_date'
                    type='date'
                    value={formData.invoice_date}
                    onChange={(e) => handleChange('invoice_date', e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='due_date'>到期日</Label>
                  <Input
                    id='due_date'
                    type='date'
                    value={formData.due_date}
                    onChange={(e) => handleChange('due_date', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>聯絡資訊</CardTitle>
                <CardDescription>客戶聯絡人資訊（選填）</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='contact_name'>聯絡人姓名</Label>
                  <Input
                    id='contact_name'
                    value={formData.contact_name}
                    onChange={(e) => handleChange('contact_name', e.target.value)}
                    placeholder='輸入聯絡人姓名'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='contact_email'>電子郵件</Label>
                  <Input
                    id='contact_email'
                    type='email'
                    value={formData.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    placeholder='example@company.com'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='contact_phone'>電話</Label>
                  <Input
                    id='contact_phone'
                    value={formData.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    placeholder='2123-4567'
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>備註</CardTitle>
                <CardDescription>其他備註資訊</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <Label htmlFor='notes'>備註</Label>
                  <Textarea
                    id='notes'
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder='輸入備註...'
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className='mt-6 flex justify-end gap-4'>
            <Link href='/dashboard/business/revenue'>
              <Button type='button' variant='outline'>
                取消
              </Button>
            </Link>
            <Button type='submit' disabled={isSaving}>
              {isSaving && <IconLoader2 className='mr-2 size-4 animate-spin' />}
              {isNew ? '建立記錄' : '儲存變更'}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
