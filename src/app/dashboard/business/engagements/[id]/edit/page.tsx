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
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  IconArrowLeft,
  IconLoader2,
} from '@tabler/icons-react';
import { engagementsApi, companiesApi, ActiveEngagement, Company } from '@/features/business/services';
import { CompanySelect } from '@/components/business/company-select';

const ENGAGEMENT_TYPES = [
  { value: 'RETAINER', label: '長期合約' },
  { value: 'PROJECT', label: '項目' },
  { value: 'AD_HOC', label: '臨時委託' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '進行中' },
  { value: 'PAUSED', label: '暫停' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
];

export default function EngagementEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === 'new';
  
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const [formData, setFormData] = useState<Partial<ActiveEngagement>>({
    company: '',
    title: '',
    engagement_type: 'PROJECT',
    status: 'ACTIVE',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    value: undefined,
    progress: 0,
    lead: '',
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companiesApi.list({ page_size: 1000 });
        setCompanies(response.results || []);
      } catch (error) {
        // eslint-disable-next-line no-console
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
        const result = await engagementsApi.get(resolvedParams.id);
        setFormData({
          company: result.company,
          title: result.title,
          engagement_type: result.engagement_type,
          status: result.status,
          start_date: result.start_date,
          end_date: result.end_date || '',
          value: result.value,
          progress: result.progress || 0,
          lead: result.lead || '',
          notes: result.notes || '',
          is_active: result.is_active,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch engagement:', error);
        toast.error('無法載入項目委託資料');
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
    if (!formData.title?.trim()) {
      toast.error('請輸入項目名稱');
      return;
    }

    setIsSaving(true);
    try {
      const submitData = {
        ...formData,
        end_date: formData.end_date || null,
        lead: formData.lead || null,
      };

      if (isNew) {
        await engagementsApi.create(submitData);
        toast.success('項目委託已創建');
      } else {
        await engagementsApi.update(resolvedParams.id, submitData);
        toast.success('項目委託已更新');
      }
      router.push('/dashboard/business/engagements');
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
              href='/dashboard/business/engagements'
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            >
              <IconArrowLeft className='size-4' />
            </Link>
            <Heading
              title={isNew ? '新增項目委託' : '編輯項目委託'}
              description={isNew ? '創建新的項目委託' : '修改項目委託資料'}
            />
          </div>
          <div className='flex items-center gap-2'>
            <Link
              href='/dashboard/business/engagements'
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
                <Label htmlFor='title'>項目名稱 *</Label>
                <Input
                  id='title'
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder='輸入項目名稱'
                  required
                />
              </div>

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
                <Label htmlFor='engagement_type'>委託類型 *</Label>
                <Select
                  value={formData.engagement_type}
                  onValueChange={(value) => setFormData({ ...formData, engagement_type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='選擇委託類型' />
                  </SelectTrigger>
                  <SelectContent>
                    {ENGAGEMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='status'>狀態 *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='選擇狀態' />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Timeline & Value */}
          <Card>
            <CardHeader>
              <CardTitle>時間與價值</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='start_date'>開始日期 *</Label>
                  <Input
                    id='start_date'
                    type='date'
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='end_date'>結束日期</Label>
                  <Input
                    id='end_date'
                    type='date'
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='value'>項目價值 (HK$)</Label>
                <Input
                  id='value'
                  type='number'
                  min='0'
                  step='1000'
                  value={formData.value || ''}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || undefined })}
                  placeholder='輸入項目價值'
                />
              </div>

              <div className='space-y-2'>
                <Label>進度: {formData.progress || 0}%</Label>
                <Slider
                  value={[formData.progress || 0]}
                  onValueChange={(value) => setFormData({ ...formData, progress: value[0] })}
                  max={100}
                  step={5}
                />
              </div>

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
