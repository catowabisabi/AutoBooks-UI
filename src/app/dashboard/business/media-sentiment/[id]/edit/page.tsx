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
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconMoodSmile,
  IconMoodNeutral,
  IconMoodSad,
} from '@tabler/icons-react';
import { mediaSentimentApi, MediaSentimentRecord } from '@/features/business/services';

export default function MediaSentimentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === 'new';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<MediaSentimentRecord>>({
    period_date: new Date().toISOString().split('T')[0],
    positive_count: 0,
    neutral_count: 0,
    negative_count: 0,
    total_reach: 0,
    total_engagement: 0,
    sentiment_score: 0,
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    if (isNew) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await mediaSentimentApi.get(resolvedParams.id);
        setFormData(result);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch media sentiment:', error);
        toast.error('無法載入媒體情緒資料');
        // Use mock data for demo
        setFormData({
          id: resolvedParams.id,
          period_date: '2024-12-01',
          positive_count: 45,
          neutral_count: 30,
          negative_count: 5,
          total_reach: 2500000,
          total_engagement: 125000,
          sentiment_score: 0.65,
          notes: '本月媒體報導整體正面',
          is_active: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isNew) {
        await mediaSentimentApi.create(formData);
        toast.success('媒體情緒記錄已創建');
      } else {
        await mediaSentimentApi.update(resolvedParams.id, formData);
        toast.success('媒體情緒記錄已更新');
      }
      router.push('/dashboard/business/media-sentiment');
    } catch (error) {
      toast.error(isNew ? '創建失敗' : '更新失敗');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof MediaSentimentRecord, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Get sentiment label based on score
  const getSentimentLabel = (score: number) => {
    if (score >= 0.5) return { label: '正面', icon: IconMoodSmile, color: 'text-green-600' };
    if (score >= -0.5) return { label: '中性', icon: IconMoodNeutral, color: 'text-gray-500' };
    return { label: '負面', icon: IconMoodSad, color: 'text-red-600' };
  };

  const sentiment = getSentimentLabel(formData.sentiment_score || 0);
  const SentimentIcon = sentiment.icon;

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

  return (
    <PageContainer>
      <form onSubmit={handleSubmit} className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link
              href='/dashboard/business/media-sentiment'
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            >
              <IconArrowLeft className='size-4' />
            </Link>
            <Heading
              title={isNew ? '新增媒體情緒記錄' : '編輯媒體情緒記錄'}
              description={isNew ? '創建新的媒體情緒追蹤記錄' : '修改媒體情緒資料'}
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
                <Label htmlFor='period_date'>記錄日期 *</Label>
                <Input
                  id='period_date'
                  type='date'
                  value={formData.period_date || ''}
                  onChange={(e) => handleChange('period_date', e.target.value)}
                  required
                />
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

          {/* Sentiment Score */}
          <Card>
            <CardHeader>
              <CardTitle>情緒評分</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <Label>評分：{formData.sentiment_score?.toFixed(2)}</Label>
                  <div className={cn('flex items-center gap-2', sentiment.color)}>
                    <SentimentIcon className='size-5' />
                    <span className='font-medium'>{sentiment.label}</span>
                  </div>
                </div>
                <Slider
                  value={[(formData.sentiment_score || 0) * 100]}
                  onValueChange={(value) => handleChange('sentiment_score', value[0] / 100)}
                  min={-100}
                  max={100}
                  step={1}
                  className='py-4'
                />
                <p className='text-sm text-muted-foreground'>
                  從 -1.00 (非常負面) 到 +1.00 (非常正面)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Report Counts */}
          <Card>
            <CardHeader>
              <CardTitle>報導統計</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='positive_count' className='flex items-center gap-2'>
                    <IconMoodSmile className='size-4 text-green-600' />
                    正面
                  </Label>
                  <Input
                    id='positive_count'
                    type='number'
                    min={0}
                    value={formData.positive_count || 0}
                    onChange={(e) => handleChange('positive_count', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='neutral_count' className='flex items-center gap-2'>
                    <IconMoodNeutral className='size-4 text-gray-500' />
                    中性
                  </Label>
                  <Input
                    id='neutral_count'
                    type='number'
                    min={0}
                    value={formData.neutral_count || 0}
                    onChange={(e) => handleChange('neutral_count', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='negative_count' className='flex items-center gap-2'>
                    <IconMoodSad className='size-4 text-red-600' />
                    負面
                  </Label>
                  <Input
                    id='negative_count'
                    type='number'
                    min={0}
                    value={formData.negative_count || 0}
                    onChange={(e) => handleChange('negative_count', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className='pt-2 text-sm text-muted-foreground'>
                總報導數：{
                  (formData.positive_count || 0) +
                  (formData.neutral_count || 0) +
                  (formData.negative_count || 0)
                }
              </div>
            </CardContent>
          </Card>

          {/* Reach & Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>觸及與互動</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='total_reach'>總觸及人數</Label>
                <Input
                  id='total_reach'
                  type='number'
                  min={0}
                  value={formData.total_reach || 0}
                  onChange={(e) => handleChange('total_reach', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='total_engagement'>總互動數</Label>
                <Input
                  id='total_engagement'
                  type='number'
                  min={0}
                  value={formData.total_engagement || 0}
                  onChange={(e) => handleChange('total_engagement', parseInt(e.target.value) || 0)}
                />
              </div>

              {formData.total_reach && formData.total_reach > 0 && formData.total_engagement && (
                <div className='pt-2 text-sm text-muted-foreground'>
                  互動率：{((formData.total_engagement / formData.total_reach) * 100).toFixed(2)}%
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
