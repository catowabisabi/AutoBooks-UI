'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  IconArrowLeft,
  IconLoader2,
} from '@tabler/icons-react';
import { serviceRevenuesApi, companiesApi, ServiceRevenue, Company } from '@/features/business/services';
import { CompanySelect } from '@/components/business/company-select';

const SERVICE_TYPES = [
  { value: 'RETAINER', label: '常規服務費' },
  { value: 'PROJECT', label: '項目收費' },
  { value: 'ANNOUNCEMENT', label: '公告服務' },
  { value: 'IPO', label: 'IPO 顧問' },
  { value: 'IR', label: '投資者關係' },
  { value: 'MEDIA', label: '媒體關係' },
  { value: 'CRISIS', label: '危機公關' },
  { value: 'OTHER', label: '其他' },
];

const MONTHS = [
  { value: 1, label: '一月' },
  { value: 2, label: '二月' },
  { value: 3, label: '三月' },
  { value: 4, label: '四月' },
  { value: 5, label: '五月' },
  { value: 6, label: '六月' },
  { value: 7, label: '七月' },
  { value: 8, label: '八月' },
  { value: 9, label: '九月' },
  { value: 10, label: '十月' },
  { value: 11, label: '十一月' },
  { value: 12, label: '十二月' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

export default function ServiceRevenueEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === 'new';
  
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const [formData, setFormData] = useState<Partial<ServiceRevenue>>({
    company: '',
    service_type: 'RETAINER',
    period_year: currentYear,
    period_month: new Date().getMonth() + 1,
    amount: 0,
    billable_hours: undefined,
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companiesApi.list({ page_size: 1000 });
        setCompanies(response.results || []);
      } catch (error) {
        console.error('Failed to fetch companies:', error);
        // Mock companies for demo
        setCompanies([
          { id: 'demo-1', name: 'ABC Holdings Ltd.', is_active: true, created_at: '', updated_at: '' },
          { id: 'demo-2', name: 'XYZ International', is_active: true, created_at: '', updated_at: '' },
        ]);
      }
    };

    const fetchData = async () => {
      if (isNew) return;
      
      setIsLoading(true);
      try {
        const result = await serviceRevenuesApi.get(resolvedParams.id);
        setFormData({
          company: result.company,
          service_type: result.service_type,
          period_year: result.period_year,
          period_month: result.period_month,
          amount: result.amount,
          billable_hours: result.billable_hours,
          notes: result.notes,
          is_active: result.is_active,
        });
      } catch (error) {
        console.error('Failed to fetch service revenue:', error);
        toast.error('無法載入服務收入資料');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
    fetchData();
  }, [isNew, resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company) {
      toast.error('請選擇客戶公司');
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      toast.error('請輸入有效的金額');
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        await serviceRevenuesApi.create(formData);
        toast.success('服務收入記錄已創建');
      } else {
        await serviceRevenuesApi.update(resolvedParams.id, formData);
        toast.success('服務收入記錄已更新');
      }
      router.push('/dashboard/business/service-revenues');
    } catch (error) {
      toast.error(isNew ? '創建失敗' : '更新失敗');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompanyAdded = (company: Company) => {
    setCompanies((prev) => [...prev, company]);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className='space-y-4'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-96' />
          <Separator />
          <div className='grid gap-4 md:grid-cols-2'>
            <Skeleton className='h-48' />
            <Skeleton className='h-48' />
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <form onSubmit={handleSubmit} className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link
              href='/dashboard/business/service-revenues'
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            >
              <IconArrowLeft className='size-4' />
            </Link>
            <Heading
              title={isNew ? '新增服務收入' : '編輯服務收入'}
              description={isNew ? '創建新的服務收入記錄' : '修改服務收入記錄'}
            />
          </div>
          <div className='flex items-center gap-2'>
            <Link
              href='/dashboard/business/service-revenues'
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              取消
            </Link>
            <Button type='submit' disabled={isSaving}>
              {isSaving && <IconLoader2 className='mr-2 size-4 animate-spin' />}
              {isNew ? '創建' : '儲存'}
            </Button>
          </div>
        </div>
        <Separator />

        <div className='grid gap-4 md:grid-cols-2'>
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>基本資訊</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='company'>客戶公司 *</Label>
                <CompanySelect
                  value={formData.company || ''}
                  onChange={(value) => setFormData({ ...formData, company: value })}
                  companies={companies}
                  onCompanyAdded={handleCompanyAdded}
                  required
                />
              </div>
              
              <div className='space-y-2'>
                <Label htmlFor='service_type'>服務類型 *</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='選擇服務類型' />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='period_year'>年份 *</Label>
                  <Select
                    value={formData.period_year?.toString()}
                    onValueChange={(value) => setFormData({ ...formData, period_year: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='選擇年份' />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='period_month'>月份 *</Label>
                  <Select
                    value={formData.period_month?.toString()}
                    onValueChange={(value) => setFormData({ ...formData, period_month: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='選擇月份' />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Info */}
          <Card>
            <CardHeader>
              <CardTitle>財務資訊</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='amount'>金額 (HK$) *</Label>
                <Input
                  id='amount'
                  type='number'
                  min='0'
                  step='0.01'
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder='輸入金額'
                  required
                />
              </div>
              
              <div className='space-y-2'>
                <Label htmlFor='billable_hours'>計費小時</Label>
                <Input
                  id='billable_hours'
                  type='number'
                  min='0'
                  step='0.5'
                  value={formData.billable_hours || ''}
                  onChange={(e) => setFormData({ ...formData, billable_hours: parseFloat(e.target.value) || undefined })}
                  placeholder='輸入計費小時'
                />
              </div>

              {formData.amount && formData.billable_hours && (
                <div className='rounded-md bg-muted p-3'>
                  <p className='text-sm text-muted-foreground'>每小時費率</p>
                  <p className='text-lg font-semibold'>
                    HK${Math.round(formData.amount / formData.billable_hours).toLocaleString()}
                  </p>
                </div>
              )}

              <div className='flex items-center justify-between'>
                <Label htmlFor='is_active'>啟用狀態</Label>
                <Switch
                  id='is_active'
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle>備註</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder='輸入備註...'
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </PageContainer>
  );
}
