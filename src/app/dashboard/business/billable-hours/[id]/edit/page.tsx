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
import { billableHoursApi, companiesApi, BillableHour, Company } from '@/features/business/services';
import { employeesApi, Employee } from '@/features/hrms/services';
import { CompanySelect } from '@/components/business/company-select';
import { EmployeeSelect } from '@/components/business/employee-select';

const ROLE_OPTIONS = [
  { value: 'CLERK', label: '文員', multiplier: 1 },
  { value: 'ACCOUNTANT', label: '會計師', multiplier: 5 },
  { value: 'MANAGER', label: '經理', multiplier: 3 },
  { value: 'DIRECTOR', label: '總監', multiplier: 10 },
  { value: 'PARTNER', label: '合夥人', multiplier: 15 },
];

export default function BillableHourEditPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = (params?.id as string) || 'new';
  const isNew = !params?.id || recordId === 'new';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<Partial<BillableHour>>({
    employee: '',
    company: '',
    project_reference: '',
    role: 'ACCOUNTANT',
    base_hourly_rate: 200,
    hourly_rate_multiplier: 5,
    date: new Date().toISOString().split('T')[0],
    actual_hours: 0,
    description: '',
    is_billable: true,
    is_invoiced: false,
  });

  // Calculate effective rate and total cost
  const effectiveRate = (formData.base_hourly_rate || 0) * (formData.hourly_rate_multiplier || 1);
  const totalCost = effectiveRate * (formData.actual_hours || 0);

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
          // Check if it's a demo ID
          if (recordId.startsWith('demo-')) {
            toast.error('這是示範資料，無法編輯。請使用真實資料。');
            router.push('/dashboard/business/billable-hours');
            return;
          }
          
          setIsLoading(true);
          const record = await billableHoursApi.get(recordId);
          setFormData({
            employee: record.employee,
            company: record.company || '',
            project_reference: record.project_reference || '',
            role: record.role,
            base_hourly_rate: record.base_hourly_rate,
            hourly_rate_multiplier: record.hourly_rate_multiplier,
            date: record.date,
            actual_hours: record.actual_hours,
            description: record.description || '',
            is_billable: record.is_billable,
            is_invoiced: record.is_invoiced,
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('找不到該工時記錄');
        setCompanies([
          { id: 'demo-1', name: 'ABC 有限公司', is_active: true, created_at: '', updated_at: '' },
          { id: 'demo-2', name: 'XYZ 科技股份有限公司', is_active: true, created_at: '', updated_at: '' },
        ]);
        if (!isNew) {
          router.push('/dashboard/business/billable-hours');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [recordId, isNew, router]);

  const handleRoleChange = (role: string) => {
    const roleOption = ROLE_OPTIONS.find((r) => r.value === role);
    setFormData((prev) => ({
      ...prev,
      role: role as BillableHour['role'],
      hourly_rate_multiplier: roleOption?.multiplier || 1,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.employee) {
      toast.error('請選擇員工');
      return;
    }
    if (!formData.date) {
      toast.error('請選擇日期');
      return;
    }
    
    setIsSaving(true);

    try {
      if (isNew) {
        await billableHoursApi.create(formData);
        toast.success('工時記錄已建立');
      } else {
        await billableHoursApi.update(recordId, formData);
        toast.success('工時記錄已更新');
      }
      router.push('/dashboard/business/billable-hours');
    } catch (error: any) {
      console.error('Save error:', error);
      const message = error?.response?.data?.detail || error?.message || (isNew ? '建立失敗' : '更新失敗');
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    field: keyof BillableHour,
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
          <Link href='/dashboard/business/billable-hours'>
            <Button variant='ghost' size='icon'>
              <IconArrowLeft className='size-5' />
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>
              {isNew ? '新增工時記錄' : '編輯工時記錄'}
            </h1>
            <p className='text-muted-foreground'>
              {isNew ? '建立新的計費工時記錄' : '更新工時記錄資訊'}
            </p>
          </div>
        </div>

        <Separator />

        <form onSubmit={handleSubmit}>
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Employee & Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>員工與專案</CardTitle>
                <CardDescription>設定員工與專案資訊</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='employee'>員工 *</Label>
                  <EmployeeSelect
                    value={formData.employee || ''}
                    onChange={(value) => handleChange('employee', value)}
                    employees={employees}
                    placeholder='搜尋並選擇員工'
                    allowClear={false}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='role'>職級 *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='選擇職級' />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} ({option.multiplier}x)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='company'>客戶公司</Label>
                  <CompanySelect
                    value={formData.company || ''}
                    onChange={(value) => handleChange('company', value)}
                    companies={companies}
                    onCompanyAdded={(company) => setCompanies((prev) => [...prev, company])}
                    placeholder='選擇客戶公司（可選）'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='project_reference'>專案編號</Label>
                  <Input
                    id='project_reference'
                    value={formData.project_reference}
                    onChange={(e) => handleChange('project_reference', e.target.value)}
                    placeholder='例如：AUDIT-2024-001'
                  />
                </div>
              </CardContent>
            </Card>

            {/* Time & Cost */}
            <Card>
              <CardHeader>
                <CardTitle>工時與費用</CardTitle>
                <CardDescription>設定工時與計費資訊</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='date'>日期 *</Label>
                  <Input
                    id='date'
                    type='date'
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='actual_hours'>實際工時 *</Label>
                  <Input
                    id='actual_hours'
                    type='number'
                    min={0}
                    step={0.5}
                    value={formData.actual_hours}
                    onChange={(e) => handleChange('actual_hours', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='base_hourly_rate'>基本時薪 (HK$)</Label>
                  <Input
                    id='base_hourly_rate'
                    type='number'
                    min={0}
                    value={formData.base_hourly_rate}
                    onChange={(e) => handleChange('base_hourly_rate', parseFloat(e.target.value) || 0)}
                  />
                </div>

                {/* Calculated fields (read-only) */}
                <div className='rounded-lg border bg-muted/50 p-4 space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>倍率</span>
                    <span className='font-medium'>{formData.hourly_rate_multiplier}x</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>有效時薪</span>
                    <span className='font-medium'>HK${effectiveRate.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className='flex justify-between'>
                    <span className='font-medium'>總費用</span>
                    <span className='text-lg font-bold text-primary'>
                      HK${totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status & Description */}
            <Card className='md:col-span-2'>
              <CardHeader>
                <CardTitle>狀態與描述</CardTitle>
                <CardDescription>設定收費狀態與工作描述</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex gap-8'>
                  <div className='flex items-center justify-between rounded-lg border p-4 flex-1'>
                    <div className='space-y-0.5'>
                      <Label htmlFor='is_billable'>可收費</Label>
                      <p className='text-sm text-muted-foreground'>
                        此工時是否可向客戶收費
                      </p>
                    </div>
                    <Switch
                      id='is_billable'
                      checked={formData.is_billable}
                      onCheckedChange={(checked) => handleChange('is_billable', checked)}
                    />
                  </div>

                  <div className='flex items-center justify-between rounded-lg border p-4 flex-1'>
                    <div className='space-y-0.5'>
                      <Label htmlFor='is_invoiced'>已開票</Label>
                      <p className='text-sm text-muted-foreground'>
                        此工時是否已開立發票
                      </p>
                    </div>
                    <Switch
                      id='is_invoiced'
                      checked={formData.is_invoiced}
                      onCheckedChange={(checked) => handleChange('is_invoiced', checked)}
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>工作描述</Label>
                  <Textarea
                    id='description'
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder='描述此時段進行的工作內容...'
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className='mt-6 flex justify-end gap-4'>
            <Link href='/dashboard/business/billable-hours'>
              <Button type='button' variant='outline'>
                取消
              </Button>
            </Link>
            <Button type='submit' disabled={isSaving}>
              {isSaving && <IconLoader2 className='mr-2 size-4 animate-spin' />}
              {isNew ? '建立記錄' : '儲存變更'}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
