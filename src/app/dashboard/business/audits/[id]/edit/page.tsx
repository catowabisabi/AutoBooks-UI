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
import { auditsApi, companiesApi, AuditProject, Company } from '@/features/business/services';

const AUDIT_STATUS_OPTIONS = [
  { value: 'NOT_STARTED', label: '未開始' },
  { value: 'PLANNING', label: '規劃中' },
  { value: 'FIELDWORK', label: '現場工作' },
  { value: 'REVIEW', label: '審閱中' },
  { value: 'REPORTING', label: '報告編製' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'ON_HOLD', label: '暫停' },
];

const AUDIT_TYPE_OPTIONS = [
  { value: 'Annual Audit', label: '年度審計' },
  { value: 'Tax Audit', label: '稅務審計' },
  { value: 'Special Audit', label: '專項審計' },
  { value: 'Internal Audit', label: '內部審計' },
  { value: 'Compliance Audit', label: '合規審計' },
];

export default function AuditEditPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params.id as string;
  const isNew = auditId === 'new';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState<Partial<AuditProject>>({
    company: '',
    fiscal_year: new Date().getFullYear().toString(),
    audit_type: 'Annual Audit',
    status: 'NOT_STARTED',
    progress: 0,
    start_date: '',
    deadline: '',
    budget_hours: 0,
    actual_hours: 0,
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch companies list
        const companiesRes = await companiesApi.list();
        setCompanies(companiesRes.results || []);

        // Fetch existing audit data if editing
        if (!isNew) {
          setIsLoading(true);
          const audit = await auditsApi.get(auditId);
          setFormData({
            company: audit.company,
            fiscal_year: audit.fiscal_year,
            audit_type: audit.audit_type,
            status: audit.status,
            progress: audit.progress,
            start_date: audit.start_date || '',
            deadline: audit.deadline || '',
            budget_hours: audit.budget_hours || 0,
            actual_hours: audit.actual_hours || 0,
            notes: audit.notes || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Demo companies fallback
        setCompanies([
          { id: 'demo-1', name: 'ABC 有限公司', is_active: true, created_at: '', updated_at: '' },
          { id: 'demo-2', name: 'XYZ 科技股份有限公司', is_active: true, created_at: '', updated_at: '' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [auditId, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isNew) {
        await auditsApi.create(formData);
        toast.success('審計專案已建立');
      } else {
        await auditsApi.update(auditId, formData);
        toast.success('審計專案已更新');
      }
      router.push('/dashboard/business/audits');
    } catch (error) {
      toast.error(isNew ? '建立失敗' : '更新失敗');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    field: keyof AuditProject,
    value: string | number
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
          <Link href='/dashboard/business/audits'>
            <Button variant='ghost' size='icon'>
              <IconArrowLeft className='size-5' />
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>
              {isNew ? '新增審計專案' : '編輯審計專案'}
            </h1>
            <p className='text-muted-foreground'>
              {isNew ? '建立新的審計專案' : '更新審計專案資訊'}
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
                <CardDescription>設定審計專案的基本資訊</CardDescription>
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
                  <Label htmlFor='fiscal_year'>會計年度 *</Label>
                  <Input
                    id='fiscal_year'
                    value={formData.fiscal_year}
                    onChange={(e) => handleChange('fiscal_year', e.target.value)}
                    placeholder='例如：2024, 2024-Q1'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='audit_type'>審計類型 *</Label>
                  <Select
                    value={formData.audit_type}
                    onValueChange={(value) => handleChange('audit_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='選擇審計類型' />
                    </SelectTrigger>
                    <SelectContent>
                      {AUDIT_TYPE_OPTIONS.map((option) => (
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
                      {AUDIT_STATUS_OPTIONS.map((option) => (
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

            {/* Timeline & Hours */}
            <Card>
              <CardHeader>
                <CardTitle>時間與工時</CardTitle>
                <CardDescription>設定專案時間軸與工時預算</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='start_date'>開始日期</Label>
                  <Input
                    id='start_date'
                    type='date'
                    value={formData.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                  />
                </div>

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
                  <Label htmlFor='budget_hours'>預算工時</Label>
                  <Input
                    id='budget_hours'
                    type='number'
                    min={0}
                    value={formData.budget_hours}
                    onChange={(e) => handleChange('budget_hours', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='actual_hours'>實際工時</Label>
                  <Input
                    id='actual_hours'
                    type='number'
                    min={0}
                    value={formData.actual_hours}
                    onChange={(e) => handleChange('actual_hours', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='notes'>備註</Label>
                  <Textarea
                    id='notes'
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder='輸入專案備註...'
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className='mt-6 flex justify-end gap-4'>
            <Link href='/dashboard/business/audits'>
              <Button type='button' variant='outline'>
                取消
              </Button>
            </Link>
            <Button type='submit' disabled={isSaving}>
              {isSaving && <IconLoader2 className='mr-2 size-4 animate-spin' />}
              {isNew ? '建立專案' : '儲存變更'}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
