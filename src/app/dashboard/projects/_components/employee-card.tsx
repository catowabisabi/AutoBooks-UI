'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  IconArrowRight,
  IconBriefcase,
  IconCalendar,
  IconMail,
  IconPhone,
  IconUser
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export interface EmployeeCardProps {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  joinDate: string;
  imageUrl?: string;
}

export function EmployeeCard({
  id,
  name,
  role,
  department,
  email,
  phone,
  status,
  joinDate,
  imageUrl
}: EmployeeCardProps) {
  const href = `/dashboard/hrms/employees/${id}`;
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className='from-card to-card/80 rounded-xl border-none bg-gradient-to-br p-1 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
      <div className='bg-card flex h-full flex-col rounded-lg p-4'>
        <CardHeader className='relative pb-2'>
          <div className='absolute -top-2 -right-2'>
            <Badge className={getStatusColor(status)}>{status}</Badge>
          </div>
          <div className='flex items-center gap-3'>
            <Avatar className='h-12 w-12'>
              {imageUrl ? (
                <AvatarImage src={imageUrl} alt={name} />
              ) : (
                <AvatarFallback className='bg-primary/10 text-primary'>
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className='text-primary text-xl font-bold'>
                {name}
              </CardTitle>
              <CardDescription className='text-sm'>{role}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className='flex-grow space-y-4 text-sm'>
          <div className='text-muted-foreground flex items-center gap-2'>
            <IconBriefcase className='text-primary/70 h-4 w-4' />
            <span className='font-medium'>{department}</span>
          </div>

          <div className='mt-2 flex flex-col gap-1.5'>
            <div className='text-muted-foreground flex items-center gap-2 text-xs'>
              <IconMail className='h-3.5 w-3.5' />
              <span>{email}</span>
            </div>
            <div className='text-muted-foreground flex items-center gap-2 text-xs'>
              <IconPhone className='h-3.5 w-3.5' />
              <span>{phone}</span>
            </div>
            <div className='text-muted-foreground flex items-center gap-2 text-xs'>
              <IconCalendar className='h-3.5 w-3.5' />
              <span>Joined {formatDistanceToNow(new Date(joinDate))} ago</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className='flex items-center justify-between pt-4'>
          <Button asChild variant='default' size='sm' className='gap-1'>
            <Link href={href}>View Profile</Link>
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='text-muted-foreground hover:text-foreground'
          >
            Contact
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
