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
import { ipoMandatesApi, companiesApi, IPOMandate, Company } from '@/features/business/services';
import { employeesApi, Employee } from '@/features/hrms/services';
import { CompanySelect } from '@/components/business/company-select';
import { EmployeeSelect } from '@/components/business/employee-select';

const STAGE_OPTIONS = [
  { value: 'PITCH', label: '提案階段' },
  { value: 'MANDATE', label: '獲得委託' },
  { value: 'PREPARATION', label: '準備階段' },
  { value: 'FILING', label: '遞交申請' },
  { value: 'LISTING', label: '上市階段' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'WITHDRAWN', label: '已撤回' },
];

const EXCHANGE_OPTIONS = [
  { value: 'HKEX', label: '香港交易所 (HKEX)' },
  { value: 'NYSE', label: '紐約證券交易所 (NYSE)' },
  { value: 'NASDAQ', label: '納斯達克 (NASDAQ)' },
  { value: 'SSE', label: '上海證券交易所 (SSE)' },
  { value: 'SZSE', label: '深圳證券交易所 (SZSE)' },
];

const BOARD_OPTIONS = [
  { value: 'Main Board', label: '主板' },
  { value: 'GEM', label: '創業板 (GEM)' },
  { value: 'STAR', label: '科創板' },
  { value: 'ChiNext', label: '創業板' },
];

const DEAL_SIZE_OPTIONS = [
  { value: 'SMALL', label: '小型 (<$500M)' },
  { value: 'MEDIUM', label: '中型 ($500M-$1B)' },
  { value: 'LARGE', label: '大型 ($1B-$5B)' },
  { value: 'MEGA', label: '超大型 (>$5B)' },
];

export default function IPOMandateEditPage() {
  const params = useParams();
  const router = useRouter();
  const mandateId = (params?.id as string) || 'new';
  const isNew = !params?.id || mandateId === 'new';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<Partial<IPOMandate>>({
    project_name: '',
    company: '',
    stage: 'PITCH',
    target_exchange: 'HKEX',
    target_board: 'Main Board',
    deal_size: undefined,
    deal_size_category: 'MEDIUM',
    fee_percentage: undefined,
    estimated_fee: undefined,
    probability: 50,
    pitch_date: '',
    mandate_date: '',
    target_listing_date: '',
    actual_listing_date: '',
    lead_partner: '',
    sfc_application_date: '',
    sfc_approval_date: '',
    is_sfc_approved: false,
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesRes, employeesRes] = await Promise.all([
          companiesApi.list(),
          employeesApi.list({ is_active: true }).catch(() => ({ results: [] })),
        ]);
        setCompanies(companiesRes.results || []);
        setEmployees(employeesRes.results || []);

        if (!isNew) {
          if (mandateId.startsWith('demo-')) {
            toast.error('這是示範資料，無法編輯。請使用真實資料。');
            router.push('/dashboard/business/ipo-mandates');
            return;
          }
          
          setIsLoading(true);
          const mandate = await ipoMandatesApi.get(mandateId);
          setFormData({
            project_name: mandate.project_name,
            company: mandate.company,
            stage: mandate.stage,
            target_exchange: mandate.target_exchange,
            target_board: mandate.target_board,
            deal_size: mandate.deal_size,
            deal_size_category: mandate.deal_size_category,
            fee_percentage: mandate.fee_percentage,
            estimated_fee: mandate.estimated_fee,
            probability: mandate.probability,
            pitch_date: mandate.pitch_date || '',
            mandate_date: mandate.mandate_date || '',
            target_listing_date: mandate.target_listing_date || '',
            actual_listing_date: mandate.actual_listing_date || '',
            lead_partner: mandate.lead_partner || '',
            sfc_application_date: mandate.sfc_application_date || '',
            sfc_approval_date: mandate.sfc_approval_date || '',
            is_sfc_approved: mandate.is_sfc_approved,
            notes: mandate.notes || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('載入資料失敗');
        if (!isNew) {
          router.push('/dashboard/business/ipo-mandates');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [mandateId, isNew, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.project_name) {
      toast.error('請輸入項目名稱');
      return;
    }
    if (!formData.company) {
      toast.error('請選擇公司');
      return;
    }
    
    setIsSaving(true);

    try {
      if (isNew) {
        await ipoMandatesApi.create(formData);
        toast.success('IPO項目已建立');
      } else {
        await ipoMandatesApi.update(mandateId, formData);
        toast.success('IPO項目已更新');
      }
      router.push('/dashboard/business/ipo-mandates');
    } catch (error: any) {
      console.error('Save error:', error);
      const message = error?.response?.data?.detail || error?.message || (isNew ? '建立失敗' : '更新失敗');
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    field: keyof IPOMandate,
    value: string | number | boolean | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate estimated fee when deal_size or fee_percentage changes
  useEffect(() => {
    if (formData.deal_size && formData.fee_percentage) {
      const estimated = (formData.deal_size * formData.fee_percentage) / 100;
      setFormData(prev => ({ ...prev, estimated_fee: estimated }));
    }
  }, [formData.deal_size, formData.fee_percentage]);

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
          <Link href='/dashboard/business/ipo-mandates'>
            <Button variant='ghost' size='icon'>
              <IconArrowLeft className='size-5' />
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>
              {isNew ? '新增IPO項目' : '編輯IPO項目'}
            </h1>
            <p className='text-muted-foreground'>
              {isNew ? '建立新的IPO項目' : '更新IPO項目資訊'}
            </p>
          </div>
        </div>

        <Separator />

        <form onSubmit={handleSubmit}>
          <div className='grid gap-6 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>基本資訊</CardTitle>
                <CardDescription>IPO項目的基本資料</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='project_name'>項目名稱 *</Label>
                  <Input
                    id='project_name'
                    value={formData.project_name}
                    onChange={(e) => handleChange('project_name', e.target.value)}
                    placeholder='輸入項目名稱'
                  />
                </div>

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
                    <Label htmlFor='stage'>階段</Label>
                    <Select
                      value={formData.stage}
                      onValueChange={(value) => handleChange('stage', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='選擇階段' />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='probability'>成功率 (%)</Label>
                    <Input
                      id='probability'
                      type='number'
                      min='0'
                      max='100'
                      value={formData.probability || ''}
                      onChange={(e) => handleChange('probability', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='target_exchange'>目標交易所</Label>
                    <Select
                      value={formData.target_exchange}
                      onValueChange={(value) => handleChange('target_exchange', value)}
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

                  <div className='space-y-2'>
                    <Label htmlFor='target_board'>目標板塊</Label>
                    <Select
                      value={formData.target_board}
                      onValueChange={(value) => handleChange('target_board', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='選擇板塊' />
                      </SelectTrigger>
                      <SelectContent>
                        {BOARD_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>交易資訊</CardTitle>
                <CardDescription>交易規模和費用</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='deal_size'>交易規模 (HKD)</Label>
                    <Input
                      id='deal_size'
                      type='number'
                      value={formData.deal_size || ''}
                      onChange={(e) => handleChange('deal_size', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder='例如: 500000000'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='deal_size_category'>規模類別</Label>
                    <Select
                      value={formData.deal_size_category}
                      onValueChange={(value) => handleChange('deal_size_category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='選擇類別' />
                      </SelectTrigger>
                      <SelectContent>
                        {DEAL_SIZE_OPTIONS.map((option) => (
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
                    <Label htmlFor='fee_percentage'>費用比例 (%)</Label>
                    <Input
                      id='fee_percentage'
                      type='number'
                      step='0.1'
                      value={formData.fee_percentage || ''}
                      onChange={(e) => handleChange('fee_percentage', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder='例如: 3.5'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='estimated_fee'>預計費用 (HKD)</Label>
                    <Input
                      id='estimated_fee'
                      type='number'
                      value={formData.estimated_fee || ''}
                      onChange={(e) => handleChange('estimated_fee', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder='自動計算'
                      disabled
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='lead_partner'>負責合夥人</Label>
                  <EmployeeSelect
                    value={formData.lead_partner || ''}
                    onChange={(value) => handleChange('lead_partner', value)}
                    employees={employees}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>時間線</CardTitle>
                <CardDescription>重要日期</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='pitch_date'>提案日期</Label>
                    <Input
                      id='pitch_date'
                      type='date'
                      value={formData.pitch_date}
                      onChange={(e) => handleChange('pitch_date', e.target.value)}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='mandate_date'>委託日期</Label>
                    <Input
                      id='mandate_date'
                      type='date'
                      value={formData.mandate_date}
                      onChange={(e) => handleChange('mandate_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='target_listing_date'>目標上市日期</Label>
                    <Input
                      id='target_listing_date'
                      type='date'
                      value={formData.target_listing_date}
                      onChange={(e) => handleChange('target_listing_date', e.target.value)}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='actual_listing_date'>實際上市日期</Label>
                    <Input
                      id='actual_listing_date'
                      type='date'
                      value={formData.actual_listing_date}
                      onChange={(e) => handleChange('actual_listing_date', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>監管審批</CardTitle>
                <CardDescription>證監會審批資訊</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='sfc_application_date'>申請日期</Label>
                    <Input
                      id='sfc_application_date'
                      type='date'
                      value={formData.sfc_application_date}
                      onChange={(e) => handleChange('sfc_application_date', e.target.value)}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='sfc_approval_date'>批准日期</Label>
                    <Input
                      id='sfc_approval_date'
                      type='date'
                      value={formData.sfc_approval_date}
                      onChange={(e) => handleChange('sfc_approval_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  <Switch
                    id='is_sfc_approved'
                    checked={formData.is_sfc_approved}
                    onCheckedChange={(checked) => handleChange('is_sfc_approved', checked)}
                  />
                  <Label htmlFor='is_sfc_approved'>已獲證監會批准</Label>
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

          <div className='mt-6 flex justify-end gap-4'>
            <Link href='/dashboard/business/ipo-mandates'>
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
