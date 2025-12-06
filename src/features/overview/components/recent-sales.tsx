'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { useApp } from '@/contexts/app-context';
import { useRouter } from 'next/navigation';
import { IconExternalLink } from '@tabler/icons-react';
import { useTranslation } from '@/lib/i18n/provider';

export function RecentSales() {
  const { t } = useTranslation();
  const { currentCompany } = useApp();
  const engagements = currentCompany.engagements;
  const router = useRouter();

  const handleClick = () => {
    router.push('/dashboard/business/partners');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600';
      case 'In Progress': return 'text-blue-600';
      case 'Due Review': return 'text-yellow-600';
      case 'Pending': return 'text-gray-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Completed': return t('common.status.completed', '已完成');
      case 'In Progress': return t('common.status.inProgress', '進行中');
      case 'Due Review': return t('common.status.dueReview', '待審核');
      case 'Pending': return t('common.status.pending', '待處理');
      default: return status;
    }
  };

  return (
    <div 
      onClick={handleClick} 
      className='cursor-pointer group transition-all duration-200 hover:scale-[1.01] h-full'
    >
      <Card className='h-full relative'>
        <div className='absolute top-4 right-4 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 px-2 py-1 rounded z-10'>
          <IconExternalLink className='size-3' />
          {t('common.viewDetails', '查看詳情')}
        </div>
        <CardHeader>
          <CardTitle>{t('overview.recentSales.title', '進行中的委託')}</CardTitle>
          <CardDescription>{t('overview.recentSales.description', '本季度 {count} 個進行中的客戶委託。', { count: String(engagements.length) })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-8'>
            {engagements.map((engagement, index) => (
              <div key={engagement.id} className='flex items-center'>
                <Avatar className='h-9 w-9'>
                  <AvatarImage src={`https://api.slingacademy.com/public/sample-users/${index + 1}.png`} alt='Avatar' />
                  <AvatarFallback>{engagement.company.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm leading-none font-medium'>{engagement.company}</p>
                  <p className='text-muted-foreground text-sm'>
                    {engagement.type} • <span className={getStatusColor(engagement.status)}>{getStatusText(engagement.status)}</span>
                  </p>
                </div>
                <div className='ml-auto font-medium'>{engagement.fee}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
