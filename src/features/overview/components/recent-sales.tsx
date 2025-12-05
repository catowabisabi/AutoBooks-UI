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

export function RecentSales() {
  const { currentCompany } = useApp();
  const engagements = currentCompany.engagements;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600';
      case 'In Progress': return 'text-blue-600';
      case 'Due Review': return 'text-yellow-600';
      case 'Pending': return 'text-gray-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Active Engagements</CardTitle>
        <CardDescription>{engagements.length} active client engagements this quarter.</CardDescription>
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
                  {engagement.type} • <span className={getStatusColor(engagement.status)}>{engagement.status}</span>
                </p>
              </div>
              <div className='ml-auto font-medium'>{engagement.fee}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
