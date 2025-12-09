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
import { listedClientsApi, companiesApi, ListedClient, Company } from '@/features/business/services';
import { CompanySelect } from '@/components/business/company-select';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '活躍' },
  { value: 'INACTIVE', label: '非活躍' },
  { value: 'PROSPECT', label: '潛在客戶' },
  { value: 'CHURNED', label: '已流失' },
];

const EXCHANGE_OPTIONS = [
  { value: 'HKEX', label: '香港交易所 (HKEX)' },
  { value: 'NYSE', label: '紐約證券交易所 (NYSE)' },
  { value: 'NASDAQ', label: '納斯達克 (NASDAQ)' },
  { value: 'SSE', label: '上海證券交易所 (SSE)' },
  { value: 'SZSE', label: '深圳證券交易所 (SZSE)' },
  { value: 'LSE', label: '倫敦證券交易所 (LSE)' },
  { value: 'SGX', label: '新加坡交易所 (SGX)' },
];

const SECTOR_OPTIONS = [
  { value: 'Technology', label: '科技' },
  { value: 'Finance', label: '金融' },
  { value: 'Healthcare', label: '醫療保健' },
  { value: 'Real Estate', label: '房地產' },
  { value: 'Consumer', label: '消費品' },
  { value: 'Industrial', label: '工業' },
  { value: 'Energy', label: '能源' },
  { value: 'Materials', label: '原材料' },
  { value: 'Utilities', label: '公用事業' },
  { value: 'Telecom', label: '電信' },
];

export default function ListedClientEditPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = (params?.id as string) || 'new';
  const isNew = !params?.id || clientId === 'new';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState<Partial<ListedClient>>({
    company: '',
    stock_code: '',
    exchange: 'HKEX',
    sector: '',
    market_cap: undefined,
    status: 'PROSPECT',
    contract_start_date: '',
    contract_end_date: '',
    annual_retainer: undefined,
    primary_contact: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch companies list
        const companiesRes = await companiesApi.list();
        setCompanies(companiesRes.results || []);

        // Fetch existing data if editing
        if (!isNew) {
          if (clientId.startsWith('demo-')) {
            toast.error('這是示範資料，無法編輯。請使用真實資料。');
            router.push('/dashboard/business/listed-clients');
            return;
          }
          
          setIsLoading(true);
          const client = await listedClientsApi.get(clientId);
          setFormData({
            company: client.company,
            stock_code: client.stock_code,
            exchange: client.exchange,
            sector: client.sector || '',
            market_cap: client.market_cap,
            status: client.status,
            contract_start_date: client.contract_start_date || '',
            contract_end_date: client.contract_end_date || '',
            annual_retainer: client.annual_retainer,
            primary_contact: client.primary_contact || '',
            contact_email: client.contact_email || '',
            contact_phone: client.contact_phone || '',
            notes: client.notes || '',
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch data:', error);
        toast.error('載入資料失敗');
        if (!isNew) {
          router.push('/dashboard/business/listed-clients');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [clientId, isNew, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company) {
      toast.error('請選擇公司');
      return;
    }
    if (!formData.stock_code) {
      toast.error('請輸入股票代碼');
      return;
    }
    
    setIsSaving(true);

    try {
      if (isNew) {
        await listedClientsApi.create(formData);
        toast.success('上市公司客戶已建立');
      } else {
        await listedClientsApi.update(clientId, formData);
        toast.success('上市公司客戶已更新');
      }
      router.push('/dashboard/business/listed-clients');
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
    field: keyof ListedClient,
    value: string | number | undefined
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
          <Link href='/dashboard/business/listed-clients'>
            <Button variant='ghost' size='icon'>
              <IconArrowLeft className='size-5' />
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>
              {isNew ? '新增上市公司客戶' : '編輯上市公司客戶'}
            </h1>
            <p className='text-muted-foreground'>
              {isNew ? '建立新的上市公司客戶' : '更新上市公司客戶資訊'}
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
                <CardDescription>上市公司的基本資料</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='company'>公司 *</Label>
                  <CompanySelect
                    value={formData.company || ''}
                    onChange={(value) => handleChange('company', value)}
                    companies={companies}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='stock_code'>股票代碼 *</Label>
                    <Input
                      id='stock_code'
                      value={formData.stock_code}
                      onChange={(e) => handleChange('stock_code', e.target.value)}
                      placeholder='例如: 1234'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='exchange'>交易所 *</Label>
                    <Select
                      value={formData.exchange}
                      onValueChange={(value) => handleChange('exchange', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='選擇交易所' />
                      </SelectTrigger>
                      <SelectContent>
                        {EXCHANGE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='sector'>行業</Label>
                    <Select
                      value={formData.sector || ''}
                      onValueChange={(value) => handleChange('sector', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='選擇行業' />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTOR_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='market_cap'>市值 (HKD)</Label>
                    <Input
                      id='market_cap'
                      type='number'
                      value={formData.market_cap || ''}
                      onChange={(e) => handleChange('market_cap', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder='例如: 2500000000'
                    />
                  </div>
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
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Contract Info */}
            <Card>
              <CardHeader>
                <CardTitle>合約資訊</CardTitle>
                <CardDescription>服務合約相關資料</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='contract_start_date'>合約開始日期</Label>
                    <Input
                      id='contract_start_date'
                      type='date'
                      value={formData.contract_start_date}
                      onChange={(e) => handleChange('contract_start_date', e.target.value)}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='contract_end_date'>合約結束日期</Label>
                    <Input
                      id='contract_end_date'
                      type='date'
                      value={formData.contract_end_date}
                      onChange={(e) => handleChange('contract_end_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='annual_retainer'>年度服務費 (HKD)</Label>
                  <Input
                    id='annual_retainer'
                    type='number'
                    value={formData.annual_retainer || ''}
                    onChange={(e) => handleChange('annual_retainer', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder='例如: 500000'
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>聯繫資訊</CardTitle>
                <CardDescription>主要聯繫人資料</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='primary_contact'>主要聯繫人</Label>
                  <Input
                    id='primary_contact'
                    value={formData.primary_contact}
                    onChange={(e) => handleChange('primary_contact', e.target.value)}
                    placeholder='聯繫人姓名'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='contact_email'>電子郵件</Label>
                  <Input
                    id='contact_email'
                    type='email'
                    value={formData.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    placeholder='email@example.com'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='contact_phone'>電話</Label>
                  <Input
                    id='contact_phone'
                    value={formData.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    placeholder='+852 1234 5678'
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

          {/* Actions */}
          <div className='mt-6 flex justify-end gap-4'>
            <Link href='/dashboard/business/listed-clients'>
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
