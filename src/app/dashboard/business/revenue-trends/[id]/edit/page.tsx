'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  IconArrowLeft,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { revenueTrendsApi, RevenueTrend } from '@/features/business/services';

// Generate period options
const generatePeriodOptions = () => {
  const options = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= currentYear - 5; year--) {
    for (let q = 4; q >= 1; q--) {
      options.push(`${year}-Q${q}`);
    }
    for (let m = 12; m >= 1; m--) {
      options.push(`${year}-${String(m).padStart(2, '0')}`);
    }
  }
  return options;
};

export default function RevenueTrendEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === 'new';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<RevenueTrend>>({
    period: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
    total_revenue: 0,
    recurring_revenue: 0,
    project_revenue: 0,
    client_count: 0,
    avg_revenue_per_client: 0,
    growth_rate: 0,
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    if (isNew) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await revenueTrendsApi.get(resolvedParams.id);
        setFormData(result);
      } catch (error) {
        console.error('Failed to fetch revenue trend:', error);
        toast.error('無法載入收入趨勢資料');
        // Use mock data for demo
        setFormData({
          id: resolvedParams.id,
          period: '2024-Q4',
          total_revenue: 5800000,
          recurring_revenue: 3200000,
          project_revenue: 2600000,
          client_count: 45,
          avg_revenue_per_client: 128889,
          growth_rate: 15.5,
          notes: '本季度收入創新高',
          is_active: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, isNew]);

  // Auto-calculate avg_revenue_per_client
  useEffect(() => {
    if (formData.total_revenue && formData.client_count && formData.client_count > 0) {
      const avg = Math.round(formData.total_revenue / formData.client_count);
      if (avg !== formData.avg_revenue_per_client) {
        setFormData((prev) => ({ ...prev, avg_revenue_per_client: avg }));
      }
    }
  }, [formData.total_revenue, formData.client_count]);

  // Auto-calculate total_revenue from components
  useEffect(() => {
    const total = (formData.recurring_revenue || 0) + (formData.project_revenue || 0);
    if (total > 0 && total !== formData.total_revenue) {
      setFormData((prev) => ({ ...prev, total_revenue: total }));
    }
  }, [formData.recurring_revenue, formData.project_revenue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isNew) {
        await revenueTrendsApi.create(formData);
        toast.success('收入趨勢記錄已創建');
      } else {
        await revenueTrendsApi.update(resolvedParams.id, formData);
        toast.success('收入趨勢記錄已更新');
      }
      router.push('/dashboard/business/revenue-trends');
    } catch (error) {
      toast.error(isNew ? '創建失敗' : '更新失敗');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof RevenueTrend, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Format number for display
  const formatCurrency = (value?: number) => {
    if (!value) return 'HK$0';
    return new Intl.NumberFormat('zh-HK', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className='space-y-4'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-96' />
          <Separator />
          <Skeleton className='h-96' />
        </div>
      </PageContainer>
    );
  }

  const periodOptions = generatePeriodOptions();

  return (
    <PageContainer>
      <form onSubmit={handleSubmit} className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link
              href='/dashboard/business/revenue-trends'
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            >
              <IconArrowLeft className='size-4' />
            </Link>
            <Heading
              title={isNew ? '新增收入趨勢記錄' : '編輯收入趨勢記錄'}
              description={isNew ? '創建新的收入趨勢追蹤記錄' : '修改收入趨勢資料'}
            />
          </div>
          <Button type='submit' disabled={isSaving}>
            <IconDeviceFloppy className='mr-2 size-4' />
            {isSaving ? '儲存中...' : '儲存'}
          </Button>
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
                <Label htmlFor='period'>期間 *</Label>
                <Select
                  value={formData.period || ''}
                  onValueChange={(value) => handleChange('period', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='選擇期間' />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='growth_rate'>增長率 (%)</Label>
                <Input
                  id='growth_rate'
                  type='number'
                  step='0.1'
                  value={formData.growth_rate || 0}
                  onChange={(e) => handleChange('growth_rate', parseFloat(e.target.value) || 0)}
                />
                <p className='text-sm text-muted-foreground'>
                  與上期比較之增長率，可為負數
                </p>
              </div>

              <div className='flex items-center justify-between'>
                <Label htmlFor='is_active'>啟用狀態</Label>
                <Switch
                  id='is_active'
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleChange('is_active', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Client Stats */}
          <Card>
            <CardHeader>
              <CardTitle>客戶統計</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='client_count'>客戶數量</Label>
                <Input
                  id='client_count'
                  type='number'
                  min={0}
                  value={formData.client_count || 0}
                  onChange={(e) => handleChange('client_count', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className='space-y-2'>
                <Label>平均客戶收入 (自動計算)</Label>
                <div className='rounded-md border bg-muted px-3 py-2'>
                  <span className='font-mono'>
                    {formatCurrency(formData.avg_revenue_per_client)}
                  </span>
                </div>
                <p className='text-sm text-muted-foreground'>
                  總收入 ÷ 客戶數量
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Components */}
          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle>收入構成</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                  <Label htmlFor='recurring_revenue'>經常性收入</Label>
                  <Input
                    id='recurring_revenue'
                    type='number'
                    min={0}
                    value={formData.recurring_revenue || 0}
                    onChange={(e) => handleChange('recurring_revenue', parseInt(e.target.value) || 0)}
                  />
                  <p className='text-sm text-muted-foreground'>
                    月費、年費等定期收入
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='project_revenue'>項目收入</Label>
                  <Input
                    id='project_revenue'
                    type='number'
                    min={0}
                    value={formData.project_revenue || 0}
                    onChange={(e) => handleChange('project_revenue', parseInt(e.target.value) || 0)}
                  />
                  <p className='text-sm text-muted-foreground'>
                    一次性項目收入
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label>總收入 (自動計算)</Label>
                  <div className='rounded-md border bg-muted px-3 py-2'>
                    <span className='font-mono text-lg font-bold'>
                      {formatCurrency(formData.total_revenue)}
                    </span>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    經常性收入 + 項目收入
                  </p>
                </div>
              </div>

              {/* Revenue breakdown visualization */}
              {(formData.total_revenue || 0) > 0 && (
                <div className='mt-4 space-y-2'>
                  <Label>收入佔比</Label>
                  <div className='flex h-4 rounded-full overflow-hidden'>
                    <div
                      className='bg-blue-600'
                      style={{
                        width: `${((formData.recurring_revenue || 0) / (formData.total_revenue || 1)) * 100}%`,
                      }}
                      title='經常性收入'
                    />
                    <div
                      className='bg-green-600'
                      style={{
                        width: `${((formData.project_revenue || 0) / (formData.total_revenue || 1)) * 100}%`,
                      }}
                      title='項目收入'
                    />
                  </div>
                  <div className='flex justify-between text-sm text-muted-foreground'>
                    <span className='flex items-center gap-1'>
                      <span className='size-3 rounded bg-blue-600' />
                      經常性: {((formData.recurring_revenue || 0) / (formData.total_revenue || 1) * 100).toFixed(1)}%
                    </span>
                    <span className='flex items-center gap-1'>
                      <span className='size-3 rounded bg-green-600' />
                      項目: {((formData.project_revenue || 0) / (formData.total_revenue || 1) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle>備註</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder='輸入備註...'
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </PageContainer>
  );
}
