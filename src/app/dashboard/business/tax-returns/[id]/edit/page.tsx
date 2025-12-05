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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react';
import { taxReturnsApi, companiesApi, TaxReturnCase, Company } from '@/features/business/services';

const TAX_STATUS_OPTIONS = [
  { value: 'PENDING', label: '待處理' },
  { value: 'IN_PROGRESS', label: '處理中' },
  { value: 'UNDER_REVIEW', label: '審核中' },
  { value: 'SUBMITTED', label: '已提交' },
  { value: 'ACCEPTED', label: '已接受' },
  { value: 'REJECTED', label: '已退回' },
  { value: 'AMENDED', label: '已修正' },
];

const TAX_TYPE_OPTIONS = [
  { value: 'Profits Tax', label: '利得稅' },
  { value: 'Salaries Tax', label: '薪俸稅' },
  { value: 'Property Tax', label: '物業稅' },
  { value: 'Personal Assessment', label: '個人入息課稅' },
  { value: 'Stamp Duty', label: '印花稅' },
  { value: 'Other', label: '其他' },
];

export default function TaxReturnEditPage() {
  const params = useParams();
  const router = useRouter();
  const taxReturnId = params.id as string;
  const isNew = taxReturnId === 'new';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState<Partial<TaxReturnCase>>({
    company: '',
    tax_year: '2023/24',
    tax_type: 'Profits Tax',
    status: 'PENDING',
    progress: 0,
    deadline: '',
    tax_amount: 0,
    documents_received: false,
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companiesRes = await companiesApi.list();
        setCompanies(companiesRes.results || []);

        if (!isNew) {
          setIsLoading(true);
          const taxReturn = await taxReturnsApi.get(taxReturnId);
          setFormData({
            company: taxReturn.company,
            tax_year: taxReturn.tax_year,
            tax_type: taxReturn.tax_type,
            status: taxReturn.status,
            progress: taxReturn.progress,
            deadline: taxReturn.deadline || '',
            tax_amount: taxReturn.tax_amount || 0,
            documents_received: taxReturn.documents_received,
            notes: taxReturn.notes || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setCompanies([
          { id: 'demo-1', name: 'ABC 有限公司', is_active: true, created_at: '', updated_at: '' },
          { id: 'demo-2', name: 'XYZ 科技股份有限公司', is_active: true, created_at: '', updated_at: '' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [taxReturnId, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isNew) {
        await taxReturnsApi.create(formData);
        toast.success('稅務申報案件已建立');
      } else {
        await taxReturnsApi.update(taxReturnId, formData);
        toast.success('稅務申報案件已更新');
      }
      router.push('/dashboard/business/tax-returns');
    } catch (error) {
      toast.error(isNew ? '建立失敗' : '更新失敗');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    field: keyof TaxReturnCase,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
          <Link href='/dashboard/business/tax-returns'>
            <Button variant='ghost' size='icon'>
              <IconArrowLeft className='size-5' />
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>
              {isNew ? '新增稅務申報' : '編輯稅務申報'}
            </h1>
            <p className='text-muted-foreground'>
              {isNew ? '建立新的稅務申報案件' : '更新稅務申報資訊'}
            </p>
          </div>
        </div>

        <Separator />

        <form onSubmit={handleSubmit}>
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>基本資訊</CardTitle>
                <CardDescription>設定稅務申報的基本資訊</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='company'>客戶公司 *</Label>
                  <Select
                    value={formData.company}
                    onValueChange={(value) => handleChange('company', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='選擇客戶公司' />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='tax_year'>課稅年度 *</Label>
                  <Input
                    id='tax_year'
                    value={formData.tax_year}
                    onChange={(e) => handleChange('tax_year', e.target.value)}
                    placeholder='例如：2023/24'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='tax_type'>稅種 *</Label>
                  <Select
                    value={formData.tax_type}
                    onValueChange={(value) => handleChange('tax_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='選擇稅種' />
                    </SelectTrigger>
                    <SelectContent>
                      {TAX_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      {TAX_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='progress'>進度 (%)</Label>
                  <Input
                    id='progress'
                    type='number'
                    min={0}
                    max={100}
                    value={formData.progress}
                    onChange={(e) => handleChange('progress', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tax Info & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>稅務與時間</CardTitle>
                <CardDescription>設定稅額與截止日期</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='deadline'>截止日期</Label>
                  <Input
                    id='deadline'
                    type='date'
                    value={formData.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='tax_amount'>應繳稅額 (HK$)</Label>
                  <Input
                    id='tax_amount'
                    type='number'
                    min={0}
                    value={formData.tax_amount}
                    onChange={(e) => handleChange('tax_amount', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='documents_received'>文件已收齊</Label>
                    <p className='text-sm text-muted-foreground'>
                      客戶是否已提供所有必要文件
                    </p>
                  </div>
                  <Switch
                    id='documents_received'
                    checked={formData.documents_received}
                    onCheckedChange={(checked) => handleChange('documents_received', checked)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='notes'>備註</Label>
                  <Textarea
                    id='notes'
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder='輸入備註...'
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className='mt-6 flex justify-end gap-4'>
            <Link href='/dashboard/business/tax-returns'>
              <Button type='button' variant='outline'>
                取消
              </Button>
            </Link>
            <Button type='submit' disabled={isSaving}>
              {isSaving && <IconLoader2 className='mr-2 size-4 animate-spin' />}
              {isNew ? '建立案件' : '儲存變更'}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
