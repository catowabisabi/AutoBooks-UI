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
import { mediaCoverageApi, listedClientsApi, companiesApi, MediaCoverage, ListedClient, Company } from '@/features/business/services';

const SENTIMENT_OPTIONS = [
  { value: 'POSITIVE', label: '正面' },
  { value: 'NEUTRAL', label: '中立' },
  { value: 'NEGATIVE', label: '負面' },
];

export default function MediaCoverageEditPage() {
  const params = useParams();
  const router = useRouter();
  const coverageId = (params?.id as string) || 'new';
  const isNew = !params?.id || coverageId === 'new';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [listedClients, setListedClients] = useState<ListedClient[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState<Partial<MediaCoverage>>({
    listed_client: '',
    company: '',
    title: '',
    media_outlet: '',
    publish_date: '',
    url: '',
    sentiment: 'NEUTRAL',
    reach: undefined,
    engagement: undefined,
    is_press_release: false,
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, companiesRes] = await Promise.all([
          listedClientsApi.list({ status: 'ACTIVE' }),
          companiesApi.list(),
        ]);
        setListedClients(clientsRes.results || []);
        setCompanies(companiesRes.results || []);

        if (!isNew) {
          if (coverageId.startsWith('demo-')) {
            toast.error('這是示範資料，無法編輯。請使用真實資料。');
            router.push('/dashboard/business/media-coverage');
            return;
          }
          
          setIsLoading(true);
          const coverage = await mediaCoverageApi.get(coverageId);
          setFormData({
            listed_client: coverage.listed_client || '',
            company: coverage.company || '',
            title: coverage.title,
            media_outlet: coverage.media_outlet,
            publish_date: coverage.publish_date || '',
            url: coverage.url || '',
            sentiment: coverage.sentiment,
            reach: coverage.reach,
            engagement: coverage.engagement,
            is_press_release: coverage.is_press_release,
            notes: coverage.notes || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('載入資料失敗');
        if (!isNew) {
          router.push('/dashboard/business/media-coverage');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [coverageId, isNew, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('請輸入標題');
      return;
    }
    if (!formData.media_outlet) {
      toast.error('請輸入媒體名稱');
      return;
    }
    
    setIsSaving(true);

    try {
      if (isNew) {
        await mediaCoverageApi.create(formData);
        toast.success('媒體報導已建立');
      } else {
        await mediaCoverageApi.update(coverageId, formData);
        toast.success('媒體報導已更新');
      }
      router.push('/dashboard/business/media-coverage');
    } catch (error: any) {
      console.error('Save error:', error);
      const message = error?.response?.data?.detail || error?.message || (isNew ? '建立失敗' : '更新失敗');
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    field: keyof MediaCoverage,
    value: string | number | boolean | undefined
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
        <div className='flex items-center gap-4'>
          <Link href='/dashboard/business/media-coverage'>
            <Button variant='ghost' size='icon'>
              <IconArrowLeft className='size-5' />
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>
              {isNew ? '新增媒體報導' : '編輯媒體報導'}
            </h1>
            <p className='text-muted-foreground'>
              {isNew ? '建立新的媒體報導' : '更新媒體報導資訊'}
            </p>
          </div>
        </div>

        <Separator />

        <form onSubmit={handleSubmit}>
          <div className='grid gap-6 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>基本資訊</CardTitle>
                <CardDescription>媒體報導的基本資料</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='title'>標題 *</Label>
                  <Input
                    id='title'
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder='輸入報導標題'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='media_outlet'>媒體名稱 *</Label>
                  <Input
                    id='media_outlet'
                    value={formData.media_outlet}
                    onChange={(e) => handleChange('media_outlet', e.target.value)}
                    placeholder='例如: 經濟日報、明報'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='publish_date'>發布日期</Label>
                  <Input
                    id='publish_date'
                    type='date'
                    value={formData.publish_date}
                    onChange={(e) => handleChange('publish_date', e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='url'>報導連結</Label>
                  <Input
                    id='url'
                    type='url'
                    value={formData.url}
                    onChange={(e) => handleChange('url', e.target.value)}
                    placeholder='https://...'
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>關聯與分類</CardTitle>
                <CardDescription>關聯客戶和情緒分類</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='listed_client'>上市公司客戶</Label>
                  <Select
                    value={formData.listed_client || ''}
                    onValueChange={(value) => handleChange('listed_client', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='選擇上市公司' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>無</SelectItem>
                      {listedClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name} ({client.stock_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='company'>一般公司</Label>
                  <Select
                    value={formData.company || ''}
                    onValueChange={(value) => handleChange('company', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='選擇公司' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>無</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='sentiment'>情緒分類</Label>
                  <Select
                    value={formData.sentiment}
                    onValueChange={(value) => handleChange('sentiment', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='選擇情緒' />
                    </SelectTrigger>
                    <SelectContent>
                      {SENTIMENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-center space-x-2'>
                  <Switch
                    id='is_press_release'
                    checked={formData.is_press_release}
                    onCheckedChange={(checked) => handleChange('is_press_release', checked)}
                  />
                  <Label htmlFor='is_press_release'>這是新聞稿</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>數據指標</CardTitle>
                <CardDescription>觸及和互動數據</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='reach'>觸及人數</Label>
                    <Input
                      id='reach'
                      type='number'
                      value={formData.reach || ''}
                      onChange={(e) => handleChange('reach', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder='例如: 500000'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='engagement'>互動數</Label>
                    <Input
                      id='engagement'
                      type='number'
                      value={formData.engagement || ''}
                      onChange={(e) => handleChange('engagement', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder='例如: 15000'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>備註</CardTitle>
                <CardDescription>其他備註資訊</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id='notes'
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder='輸入備註...'
                  rows={6}
                />
              </CardContent>
            </Card>
          </div>

          <div className='mt-6 flex justify-end gap-4'>
            <Link href='/dashboard/business/media-coverage'>
              <Button variant='outline' type='button'>
                取消
              </Button>
            </Link>
            <Button type='submit' disabled={isSaving}>
              {isSaving && <IconLoader2 className='mr-2 size-4 animate-spin' />}
              {isNew ? '建立' : '儲存'}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
