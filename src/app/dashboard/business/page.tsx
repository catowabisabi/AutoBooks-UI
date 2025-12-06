'use client';

import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconClipboardCheck,
  IconReceipt,
  IconClock,
  IconCash,
  IconArrowRight,
  IconTrendingUp,
  IconBuilding,
  IconChartLine,
  IconSpeakerphone,
  IconNews,
} from '@tabler/icons-react';

const businessModules = [
  {
    title: '上市公司客戶',
    description: '管理財經公關上市公司客戶',
    href: '/dashboard/business/listed-clients',
    icon: IconBuilding,
    stats: '活躍客戶',
    color: 'bg-indigo-500/10 text-indigo-600',
  },
  {
    title: 'IPO 項目',
    description: '管理上市保薦及財務顧問項目',
    href: '/dashboard/business/ipo-mandates',
    icon: IconChartLine,
    stats: '進行中項目',
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    title: '公告管理',
    description: '管理上市公司公告、通函和新聞稿',
    href: '/dashboard/business/announcements',
    icon: IconSpeakerphone,
    stats: '本月公告',
    color: 'bg-amber-500/10 text-amber-600',
  },
  {
    title: '媒體報導',
    description: '管理媒體報導和新聞稿',
    href: '/dashboard/business/media-coverage',
    icon: IconNews,
    stats: '本月報導',
    color: 'bg-rose-500/10 text-rose-600',
  },
  {
    title: '審計專案',
    description: '管理審計專案、追蹤進度與狀態',
    href: '/dashboard/business/audits',
    icon: IconClipboardCheck,
    stats: '進行中專案',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: '稅務申報',
    description: '管理稅務申報案件、追蹤截止日期',
    href: '/dashboard/business/tax-returns',
    icon: IconReceipt,
    stats: '待處理案件',
    color: 'bg-green-500/10 text-green-600',
  },
  {
    title: '工時記錄',
    description: '管理計費工時、追蹤專案成本',
    href: '/dashboard/business/billable-hours',
    icon: IconClock,
    stats: '本月工時',
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    title: '收入管理',
    description: '管理收入記錄、追蹤應收帳款',
    href: '/dashboard/business/revenue',
    icon: IconCash,
    stats: '待收款項',
    color: 'bg-orange-500/10 text-orange-600',
  },
];

export default function BusinessPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>業務管理</h1>
          <p className='text-muted-foreground'>
            管理財經公關、IPO項目、審計、稅務與收入
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {businessModules.map((module) => (
            <Link key={module.href} href={module.href}>
              <Card className='transition-all hover:shadow-md hover:border-primary/50 cursor-pointer h-full'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <div className={`rounded-lg p-2.5 ${module.color}`}>
                    <module.icon className='size-6' />
                  </div>
                  <IconArrowRight className='size-5 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <CardTitle className='text-lg mb-2'>{module.title}</CardTitle>
                  <CardDescription className='text-sm line-clamp-2'>
                    {module.description}
                  </CardDescription>
                  <div className='mt-4 flex items-center gap-2'>
                    <Badge variant='secondary' className='text-xs'>
                      <IconTrendingUp className='mr-1 size-3' />
                      {module.stats}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>快速統計</CardTitle>
            <CardDescription>業務概覽數據</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-4 lg:grid-cols-8'>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>上市客戶</p>
                <p className='text-2xl font-bold'>-</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>IPO項目</p>
                <p className='text-2xl font-bold'>-</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>本月公告</p>
                <p className='text-2xl font-bold'>-</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>媒體報導</p>
                <p className='text-2xl font-bold'>-</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>進行中審計</p>
                <p className='text-2xl font-bold'>-</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>待處理稅務</p>
                <p className='text-2xl font-bold'>-</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>本月工時</p>
                <p className='text-2xl font-bold'>-</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>待收款項</p>
                <p className='text-2xl font-bold'>-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
