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
import { clientPerformanceApi, companiesApi, ClientPerformance, Company } from '@/features/business/services';
import { CompanySelect } from '@/components/business/company-select';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
const QUARTERS = [
  { value: 1, label: 'Q1 (一月至三月)' },
  { value: 2, label: 'Q2 (四月至六月)' },
  { value: 3, label: 'Q3 (七月至九月)' },
  { value: 4, label: 'Q4 (十月至十二月)' },
];

export default function ClientPerformanceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === 'new';
  
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  
  const [formData, setFormData] = useState<Partial<ClientPerformance>>({
    company: '',
    period_year: currentYear,
    period_quarter: currentQuarter,
    revenue_generated: undefined,
    satisfaction_score: undefined,
    projects_completed: undefined,
    referrals_made: undefined,
    response_time_hours: undefined,
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
        const result = await clientPerformanceApi.get(resolvedParams.id);
        setFormData({
          company: result.company,
          period_year: result.period_year,
          period_quarter: result.period_quarter,
          revenue_generated: result.revenue_generated,
          satisfaction_score: result.satisfaction_score,
          projects_completed: result.projects_completed,
          referrals_made: result.referrals_made,
          response_time_hours: result.response_time_hours,
          notes: result.notes || '',
          is_active: result.is_active,
        });
      } catch (error) {
        console.error('Failed to fetch client performance:', error);
        toast.error('無法載入客戶績效資料');
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

    setIsSaving(true);
    try {
      if (isNew) {
        await clientPerformanceApi.create(formData);
        toast.success('客戶績效記錄已創建');
      } else {
        await clientPerformanceApi.update(resolvedParams.id, formData);
        toast.success('客戶績效記錄已更新');
      }
      router.push('/dashboard/business/client-performance');
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
              href='/dashboard/business/client-performance'
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            >
              <IconArrowLeft className='size-4' />
            </Link>
            <Heading
              title={isNew ? '新增客戶績效' : '編輯客戶績效'}
              description={isNew ? '創建新的客戶績效記錄' : '修改客戶績效記錄'}
            />
          </div>
          <div className='flex items-center gap-2'>
            <Link
              href='/dashboard/business/client-performance'
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
                  <Label htmlFor='period_quarter'>季度 *</Label>
                  <Select
                    value={formData.period_quarter?.toString()}
                    onValueChange={(value) => setFormData({ ...formData, period_quarter: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='選擇季度' />
                    </SelectTrigger>
                    <SelectContent>
                      {QUARTERS.map((quarter) => (
                        <SelectItem key={quarter.value} value={quarter.value.toString()}>
                          {quarter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>績效指標</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='revenue_generated'>產生收入 (HK$)</Label>
                <Input
                  id='revenue_generated'
                  type='number'
                  min='0'
                  step='1000'
                  value={formData.revenue_generated || ''}
                  onChange={(e) => setFormData({ ...formData, revenue_generated: parseFloat(e.target.value) || undefined })}
                  placeholder='輸入產生收入'
                />
              </div>
              
              <div className='space-y-2'>
                <Label htmlFor='satisfaction_score'>滿意度評分 (1-5)</Label>
                <Input
                  id='satisfaction_score'
                  type='number'
                  min='1'
                  max='5'
                  step='0.1'
                  value={formData.satisfaction_score || ''}
                  onChange={(e) => setFormData({ ...formData, satisfaction_score: parseFloat(e.target.value) || undefined })}
                  placeholder='輸入滿意度 (1-5)'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='projects_completed'>完成項目數</Label>
                  <Input
                    id='projects_completed'
                    type='number'
                    min='0'
                    value={formData.projects_completed || ''}
                    onChange={(e) => setFormData({ ...formData, projects_completed: parseInt(e.target.value) || undefined })}
                    placeholder='0'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='referrals_made'>推薦數</Label>
                  <Input
                    id='referrals_made'
                    type='number'
                    min='0'
                    value={formData.referrals_made || ''}
                    onChange={(e) => setFormData({ ...formData, referrals_made: parseInt(e.target.value) || undefined })}
                    placeholder='0'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='response_time_hours'>平均響應時間 (小時)</Label>
                <Input
                  id='response_time_hours'
                  type='number'
                  min='0'
                  step='0.5'
                  value={formData.response_time_hours || ''}
                  onChange={(e) => setFormData({ ...formData, response_time_hours: parseFloat(e.target.value) || undefined })}
                  placeholder='輸入平均響應時間'
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
