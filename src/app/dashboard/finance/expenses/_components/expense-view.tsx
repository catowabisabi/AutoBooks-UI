'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Receipt,
  FileText,
  Clock,
  User
} from 'lucide-react';

interface Expense {
  id: string;
  merchantName: string;
  invoiceNo: string;
  expenseDate: string;
  currency: string;
  claimedAmount: string;
  city: string;
  country: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

// Mock expenses (should match your list page)
const EXPENSES: Expense[] = [
  {
    id: 'EXP-001',
    merchantName: 'Amazon',
    invoiceNo: 'INV-1001',
    expenseDate: '2023-06-01',
    currency: 'USD',
    claimedAmount: '150',
    city: 'New York',
    country: 'USA',
    description: 'Online Purchase',
    status: 'Pending'
  },
  {
    id: 'EXP-002',
    merchantName: 'Uber',
    invoiceNo: 'INV-1002',
    expenseDate: '2023-06-03',
    currency: 'USD',
    claimedAmount: '50',
    city: 'San Francisco',
    country: 'USA',
    description: 'Cab ride',
    status: 'Approved'
  },
  {
    id: 'EXP-003',
    merchantName: 'Hotel XYZ',
    invoiceNo: 'INV-1003',
    expenseDate: '2023-06-05',
    currency: 'USD',
    claimedAmount: '300',
    city: 'Chicago',
    country: 'USA',
    description: 'Hotel stay',
    status: 'Rejected'
  }
];

const getStatusColor = (status: string) => {
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

interface ExpenseViewProps {
  expenseId: string;
}

export default function ExpenseView({ expenseId }: ExpenseViewProps) {
  const expense = useMemo(() => {
    return EXPENSES.find((exp) => exp.id === expenseId);
  }, [expenseId]);

  if (!expense) {
    return (
      <div className='flex h-full flex-col items-center justify-center p-8'>
        <h2 className='mb-4 text-2xl font-bold'>Expense Not Found</h2>
        <p className='text-muted-foreground mb-6'>
          The expense you&#39;re looking for doesn&#39;t exist or has been
          removed.
        </p>
        <Button asChild>
          <Link href='/dashboard/finance/expenses'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6'>
      {/* Back button */}
      <div className='mb-6'>
        <Button variant='outline' asChild>
          <Link href='/dashboard/finance/expenses'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
      </div>

      {/* Expense Summary */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>{expense.merchantName}</h1>
        <p className='text-muted-foreground text-lg'>{expense.description}</p>
        <div className='mt-2 flex items-center gap-3'>
          <Badge className={getStatusColor(expense.status)}>
            {expense.status}
          </Badge>
          <span className='text-muted-foreground text-sm'>
            Invoice: {expense.invoiceNo}
          </span>
        </div>
      </div>

      {/* Expense Details */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Expense Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-start'>
              <DollarSign className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Claimed Amount</p>
                <p className='text-muted-foreground'>
                  {expense.claimedAmount} {expense.currency}
                </p>
              </div>
            </div>
            <div className='flex items-start'>
              <Calendar className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Expense Date</p>
                <p className='text-muted-foreground'>
                  {format(new Date(expense.expenseDate), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div className='flex items-start'>
              <MapPin className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Location</p>
                <p className='text-muted-foreground'>
                  {expense.city}, {expense.country}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Meta Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-start'>
              <FileText className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Invoice No</p>
                <p className='text-muted-foreground'>{expense.invoiceNo}</p>
              </div>
            </div>
            <div className='flex items-start'>
              <Receipt className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Description</p>
                <p className='text-muted-foreground'>{expense.description}</p>
              </div>
            </div>
            <div className='flex items-start'>
              <Clock className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Submission Time</p>
                <p className='text-muted-foreground'>June 06, 2023 02:15 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval History Section */}
      <div className='mt-10'>
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Approval History</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              {/* Approval history entries (mock) */}
              {[
                {
                  approver: 'John Manager',
                  status: 'Approved',
                  time: '2023-06-06 15:00'
                },
                {
                  approver: 'Jane Director',
                  status: 'Pending',
                  time: 'Awaiting Action'
                }
              ].map((entry, idx) => (
                <div key={idx} className='flex items-start gap-3'>
                  <User className='text-primary/70 mt-0.5 h-5 w-5' />
                  <div>
                    <p className='font-medium'>{entry.approver}</p>
                    <p className='text-muted-foreground text-sm'>
                      Status: {entry.status} • {entry.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action buttons */}
      <div className='mt-8 flex justify-end gap-4'>
        <Button variant='outline' asChild>
          <Link href={`/dashboard/finance/expenses/${expense.id}/edit`}>
            Edit Expense
          </Link>
        </Button>
        <Button>Approve / Reject</Button>
      </div>
    </div>
  );
}
