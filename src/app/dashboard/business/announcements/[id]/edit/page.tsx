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
import { announcementsApi, listedClientsApi, Announcement, ListedClient } from '@/features/business/services';
import { employeesApi, Employee } from '@/features/hrms/services';
import { EmployeeSelect } from '@/components/business/employee-select';

const TYPE_OPTIONS = [
  { value: 'RESULTS', label: '業績公告' },
  { value: 'CIRCULAR', label: '通函' },
  { value: 'ANNOUNCEMENT', label: '公告' },
  { value: 'PRESS_RELEASE', label: '新聞稿' },
  { value: 'REGULATORY', label: '監管公告' },
  { value: 'OTHER', label: '其他' },
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'IN_PROGRESS', label: '進行中' },
  { value: 'REVIEW', label: '審核中' },
  { value: 'APPROVED', label: '已批准' },
  { value: 'PUBLISHED', label: '已發布' },
];

export default function AnnouncementEditPage() {
  const params = useParams();
  const router = useRouter();
  const announcementId = (params?.id as string) || 'new';
  const isNew = !params?.id || announcementId === 'new';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [listedClients, setListedClients] = useState<ListedClient[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<Partial<Announcement>>({
    listed_client: '',
    announcement_type: 'ANNOUNCEMENT',
    title: '',
    publish_date: '',
    deadline: '',
    status: 'DRAFT',
    handler: '',
    word_count: undefined,
    languages: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, employeesRes] = await Promise.all([
          listedClientsApi.list({ status: 'ACTIVE' }),
          employeesApi.list({ is_active: true }).catch(() => ({ results: [] })),
        ]);
        setListedClients(clientsRes.results || []);
        setEmployees(employeesRes.results || []);

        if (!isNew) {
          if (announcementId.startsWith('demo-')) {
            toast.error('這是示範資料，無法編輯。請使用真實資料。');
            router.push('/dashboard/business/announcements');
            return;
          }
          
          setIsLoading(true);
          const announcement = await announcementsApi.get(announcementId);
          setFormData({
            listed_client: announcement.listed_client,
            announcement_type: announcement.announcement_type,
            title: announcement.title,
            publish_date: announcement.publish_date || '',
            deadline: announcement.deadline || '',
            status: announcement.status,
            handler: announcement.handler || '',
            word_count: announcement.word_count,
            languages: announcement.languages || '',
            notes: announcement.notes || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('載入資料失敗');
        if (!isNew) {
          router.push('/dashboard/business/announcements');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [announcementId, isNew, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.listed_client) {
      toast.error('請選擇上市公司');
      return;
    }
    if (!formData.title) {
      toast.error('請輸入標題');
      return;
    }
    
    setIsSaving(true);

    try {
      if (isNew) {
        await announcementsApi.create(formData);
        toast.success('公告已建立');
      } else {
        await announcementsApi.update(announcementId, formData);
        toast.success('公告已更新');
      }
      router.push('/dashboard/business/announcements');
    } catch (error: any) {
      console.error('Save error:', error);
      const message = error?.response?.data?.detail || error?.message || (isNew ? '建立失敗' : '更新失敗');
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    field: keyof Announcement,
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
        <div className='flex items-center gap-4'>
          <Link href='/dashboard/business/announcements'>
            <Button variant='ghost' size='icon'>
              <IconArrowLeft className='size-5' />
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>
              {isNew ? '新增公告' : '編輯公告'}
            </h1>
            <p className='text-muted-foreground'>
              {isNew ? '建立新的公告' : '更新公告資訊'}
            </p>
          </div>
        </div>

        <Separator />

        <form onSubmit={handleSubmit}>
          <div className='grid gap-6 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>基本資訊</CardTitle>
                <CardDescription>公告的基本資料</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='listed_client'>上市公司 *</Label>
                  <Select
                    value={formData.listed_client || ''}
                    onValueChange={(value) => handleChange('listed_client', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='選擇上市公司' />
                    </SelectTrigger>
                    <SelectContent>
                      {listedClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name} ({client.stock_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='title'>標題 *</Label>
                  <Input
                    id='title'
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder='輸入公告標題'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='announcement_type'>類型</Label>
                    <Select
                      value={formData.announcement_type}
                      onValueChange={(value) => handleChange('announcement_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='選擇類型' />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_OPTIONS.map((option) => (
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
                        {STATUS_OPTIONS.map((option) => (
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
                <CardTitle>時間與負責人</CardTitle>
                <CardDescription>發布日期和負責人資訊</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
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
                    <Label htmlFor='deadline'>截止日期</Label>
                    <Input
                      id='deadline'
                      type='date'
                      value={formData.deadline}
                      onChange={(e) => handleChange('deadline', e.target.value)}
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='handler'>負責人</Label>
                  <EmployeeSelect
                    value={formData.handler || ''}
                    onChange={(value) => handleChange('handler', value)}
                    employees={employees}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='word_count'>字數</Label>
                    <Input
                      id='word_count'
                      type='number'
                      value={formData.word_count || ''}
                      onChange={(e) => handleChange('word_count', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder='例如: 5000'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='languages'>語言</Label>
                    <Input
                      id='languages'
                      value={formData.languages}
                      onChange={(e) => handleChange('languages', e.target.value)}
                      placeholder='例如: 中英文'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='md:col-span-2'>
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
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          <div className='mt-6 flex justify-end gap-4'>
            <Link href='/dashboard/business/announcements'>
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
