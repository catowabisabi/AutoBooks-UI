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
  ArrowRight,
  Calendar,
  MapPin,
  Receipt,
  DollarSign,
  BadgeCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Link from 'next/link';

export interface ExpenseCardProps {
  id: string;
  merchantName: string;
  invoiceNo: string;
  expenseDate: string;
  claimedAmount: string;
  currency: string;
  city: string;
  country: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function ExpenseCard({
  id,
  merchantName,
  invoiceNo,
  expenseDate,
  claimedAmount,
  currency,
  city,
  country,
  description,
  status
}: ExpenseCardProps) {
  const href = `/dashboard/finance/expenses/${id}`;
  const formattedDate = format(new Date(expenseDate), 'dd MMM yyyy');

  return (
    <Card className='from-card to-card/80 rounded-xl border-none bg-gradient-to-br p-1 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
      <div className='bg-card flex h-full flex-col rounded-lg p-4'>
        <CardHeader className='relative pb-2'>
          <div className='absolute -top-2 -right-2'>
            <Badge className={getStatusColor(status)}>{status}</Badge>
          </div>
          <div className='space-y-1'>
            <CardTitle className='text-primary text-lg font-bold'>
              {merchantName}
            </CardTitle>
            <CardDescription className='text-sm'>
              <Receipt className='mr-1 inline-block h-4 w-4' />
              Invoice: {invoiceNo}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='text-muted-foreground flex-grow space-y-3 text-sm'>
          <div className='flex items-center gap-2'>
            <DollarSign className='text-primary/70 h-4 w-4' />
            <span>
              {claimedAmount} {currency}
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <Calendar className='text-primary/70 h-4 w-4' />
            <span>{formattedDate}</span>
          </div>

          <div className='flex items-center gap-2'>
            <MapPin className='text-primary/70 h-4 w-4' />
            <span>
              {city}, {country}
            </span>
          </div>

          <div className='text-foreground mt-2 font-medium'>{description}</div>
        </CardContent>

        <CardFooter className='flex items-center justify-between pt-4'>
          <Button asChild variant='default' size='sm'>
            <Link href={href}>View Details</Link>
          </Button>
          <Button variant='outline' size='sm'>
            <BadgeCheck className='mr-2 h-4 w-4' />
            Submit
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
