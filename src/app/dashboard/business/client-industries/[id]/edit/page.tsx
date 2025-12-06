'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { clientIndustriesApi, ClientIndustry } from '@/features/business/services';

const PRESET_COLORS = [
  { name: '藍色', value: '#3B82F6' },
  { name: '綠色', value: '#10B981' },
  { name: '黃色', value: '#F59E0B' },
  { name: '紅色', value: '#EF4444' },
  { name: '紫色', value: '#8B5CF6' },
  { name: '粉色', value: '#EC4899' },
  { name: '青色', value: '#06B6D4' },
  { name: '灰色', value: '#6B7280' },
];

export default function ClientIndustryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === 'new';
  
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<ClientIndustry>>({
    name: '',
    code: '',
    description: '',
    color: '#3B82F6',
    is_active: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (isNew) return;
      
      setIsLoading(true);
      try {
        const result = await clientIndustriesApi.get(resolvedParams.id);
        setFormData({
          name: result.name,
          code: result.code,
          description: result.description || '',
          color: result.color || '#3B82F6',
          is_active: result.is_active,
        });
      } catch (error) {
        console.error('Failed to fetch client industry:', error);
        toast.error('無法載入客戶行業資料');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isNew, resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast.error('請輸入行業名稱');
      return;
    }
    if (!formData.code?.trim()) {
      toast.error('請輸入行業代碼');
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        await clientIndustriesApi.create(formData);
        toast.success('客戶行業已創建');
      } else {
        await clientIndustriesApi.update(resolvedParams.id, formData);
        toast.success('客戶行業已更新');
      }
      router.push('/dashboard/business/client-industries');
    } catch (error) {
      toast.error(isNew ? '創建失敗' : '更新失敗');
    } finally {
      setIsSaving(false);
    }
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
              href='/dashboard/business/client-industries'
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            >
              <IconArrowLeft className='size-4' />
            </Link>
            <Heading
              title={isNew ? '新增客戶行業' : '編輯客戶行業'}
              description={isNew ? '創建新的客戶行業分類' : '修改客戶行業分類'}
            />
          </div>
          <div className='flex items-center gap-2'>
            <Link
              href='/dashboard/business/client-industries'
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
                <Label htmlFor='name'>行業名稱 *</Label>
                <Input
                  id='name'
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder='例如：科技'
                  required
                />
              </div>
              
              <div className='space-y-2'>
                <Label htmlFor='code'>行業代碼 *</Label>
                <Input
                  id='code'
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder='例如：TECH'
                  className='font-mono'
                  maxLength={10}
                  required
                />
                <p className='text-xs text-muted-foreground'>
                  建議使用簡短的英文縮寫，最多 10 個字符
                </p>
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

          {/* Color Selection */}
          <Card>
            <CardHeader>
              <CardTitle>顏色設定</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label>預設顏色</Label>
                <div className='grid grid-cols-4 gap-2'>
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type='button'
                      className={cn(
                        'size-10 rounded-lg border-2 transition-all',
                        formData.color === color.value
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-transparent hover:border-muted-foreground'
                      )}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='color'>自定義顏色</Label>
                <div className='flex gap-2'>
                  <Input
                    id='color'
                    type='color'
                    value={formData.color || '#3B82F6'}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className='w-16 cursor-pointer p-1'
                  />
                  <Input
                    value={formData.color || '#3B82F6'}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder='#3B82F6'
                    className='flex-1 font-mono'
                    maxLength={7}
                  />
                </div>
              </div>

              <div className='mt-4 rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>預覽</p>
                <div className='mt-2 flex items-center gap-3'>
                  <div
                    className='size-8 rounded-full'
                    style={{ backgroundColor: formData.color || '#3B82F6' }}
                  />
                  <span className='font-medium'>{formData.name || '行業名稱'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle>描述</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder='輸入行業描述...'
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </PageContainer>
  );
}
