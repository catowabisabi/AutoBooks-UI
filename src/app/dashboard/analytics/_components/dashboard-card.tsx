'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { IconDatabase, IconRefresh, IconCalendar } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export interface DashboardCardProps {
  id: string;
  title: string;
  createdBy: string;
  createdByName: string;
  createdByEmail: string;
  dataSources: number;
  createdOn: string;
  lastRefreshed: string;
}

export function DashboardCard({
  id,
  title,
  createdByName,
  createdByEmail,
  dataSources,
  createdOn,
  lastRefreshed
}: DashboardCardProps) {
  const href = `/dashboard/analytics/${id}`;
  const initials = createdByName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className='from-card to-card/80 rounded-xl border-none bg-gradient-to-br p-1 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
      <div className='bg-card flex h-full flex-col rounded-lg p-4'>
        <CardHeader className='relative pb-2'>
          <div className='absolute -top-2 -right-2'></div>
          <CardTitle className='text-primary text-xl font-bold'>
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className='flex-grow space-y-4 text-sm'>
          <div className='mt-2 flex items-center gap-2'>
            <Avatar className='mr-1 h-6 w-6'>
              <AvatarFallback className='bg-primary/10 text-primary text-xs'>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <span className='text-xs font-medium'>{createdByName}</span>
              <span className='text-muted-foreground text-xs'>
                {createdByEmail}
              </span>
            </div>
          </div>

          <div className='text-muted-foreground flex items-center gap-2'>
            <IconDatabase className='text-primary/70 h-4 w-4' />
            <span className='font-medium'>{dataSources} data sources</span>
          </div>

          <div className='mt-2 flex flex-col gap-1.5'>
            <div className='text-muted-foreground flex items-center gap-2 text-xs'>
              <IconRefresh className='h-3.5 w-3.5' />
              <span>
                Updated {formatDistanceToNow(new Date(lastRefreshed))} ago
              </span>
            </div>
            <div className='text-muted-foreground flex items-center gap-2 text-xs'>
              <IconCalendar className='h-3.5 w-3.5' />
              <span>Created on {new Date(createdOn).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className='flex items-center justify-between pt-4'>
          <Button asChild variant='default' size='sm' className='gap-1'>
            <Link href={href}>View</Link>
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='text-muted-foreground hover:text-foreground'
          >
            Share
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
