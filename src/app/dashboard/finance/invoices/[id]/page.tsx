'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { IconArrowLeft, IconEdit, IconPrinter, IconFileTypePdf } from '@tabler/icons-react';
import { useTranslation } from '@/lib/i18n/provider';
import { downloadInvoicePDF } from '@/lib/export-utils';
import { toast } from 'sonner';

// Sample invoice data (in a real app, this would come from the API)
const sampleInvoices = [
  {
    id: '1',
    invoiceNumber: 'INV-2023-001',
    client: 'Acme Corporation',
    clientEmail: 'accounts@acme.com',
    clientAddress: '123 Business Ave, Hong Kong',
    amount: 5250.75,
    issueDate: '2023-06-01',
    dueDate: '2023-06-15',
    status: 'Paid' as const,
    items: [
      { description: 'Consulting Services', quantity: 10, unitPrice: 500, amount: 5000 },
      { description: 'Travel Expenses', quantity: 1, unitPrice: 250.75, amount: 250.75 },
    ],
    notes: 'Payment received via bank transfer',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2023-002',
    client: 'Globex Industries',
    clientEmail: 'billing@globex.com',
    clientAddress: '456 Industrial Blvd, Kowloon',
    amount: 3120.5,
    issueDate: '2023-06-05',
    dueDate: '2023-06-20',
    status: 'Paid' as const,
    items: [
      { description: 'Monthly Retainer', quantity: 1, unitPrice: 3000, amount: 3000 },
      { description: 'Additional Hours', quantity: 2, unitPrice: 60.25, amount: 120.5 },
    ],
    notes: '',
  },
];

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<typeof sampleInvoices[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadInvoice = async () => {
      setIsLoading(true);
      try {
        // In real app: const data = await invoicesApi.get(invoiceId);
        const found = sampleInvoices.find(inv => inv.id === invoiceId);
        if (found) {
          setInvoice(found);
        } else {
          toast.error(t('invoices.notFound'));
          router.push('/dashboard/finance/invoices');
        }
      } catch (error) {
        console.error('Failed to load invoice:', error);
        toast.error(t('invoices.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInvoice();
  }, [invoiceId, router, t]);

  const handleDownloadPDF = () => {
    if (invoice) {
      downloadInvoicePDF({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        client: invoice.client,
        amount: invoice.amount,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        currency: 'HKD',
      });
      toast.success(t('invoices.generating'));
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className='space-y-6'>
          <Skeleton className='h-10 w-64' />
          <Skeleton className='h-[400px]' />
        </div>
      </PageContainer>
    );
  }

  if (!invoice) {
    return null;
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link href='/dashboard/finance/invoices'>
              <Button variant='ghost' size='icon'>
                <IconArrowLeft className='size-5' />
              </Button>
            </Link>
            <div>
              <h1 className='text-2xl font-bold'>{invoice.invoiceNumber}</h1>
              <p className='text-muted-foreground'>{t('invoices.viewDetails')}</p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={handleDownloadPDF}>
              <IconFileTypePdf className='mr-2 size-4' />
              {t('invoices.downloadPdf')}
            </Button>
            <Button variant='outline'>
              <IconPrinter className='mr-2 size-4' />
              {t('common.print')}
            </Button>
            <Link href={`/dashboard/finance/invoices/${invoiceId}/edit`}>
              <Button>
                <IconEdit className='mr-2 size-4' />
                {t('invoices.edit')}
              </Button>
            </Link>
          </div>
        </div>

        <Separator />

        <div className='grid gap-6 md:grid-cols-2'>
          {/* Invoice Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('invoices.invoiceInfo')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>{t('invoices.invoiceNumber')}</span>
                <span className='font-medium'>{invoice.invoiceNumber}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>{t('invoices.issueDate')}</span>
                <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>{t('invoices.dueDate')}</span>
                <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>{t('invoices.status')}</span>
                <Badge
                  variant={
                    invoice.status === 'Paid'
                      ? 'default'
                      : invoice.status === 'Pending'
                        ? 'outline'
                        : 'destructive'
                  }
                >
                  {invoice.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('invoices.clientInfo')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>{t('invoices.client')}</span>
                <span className='font-medium'>{invoice.client}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>{t('invoices.clientEmail')}</span>
                <span>{invoice.clientEmail || '-'}</span>
              </div>
              <div>
                <span className='text-muted-foreground'>{t('invoices.clientAddress')}</span>
                <p className='mt-1'>{invoice.clientAddress || '-'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle>{t('invoices.invoiceItems')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='rounded-lg border'>
              <table className='w-full'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='px-4 py-3 text-left text-sm font-medium'>{t('invoices.itemDescription')}</th>
                    <th className='px-4 py-3 text-right text-sm font-medium'>{t('invoices.quantity')}</th>
                    <th className='px-4 py-3 text-right text-sm font-medium'>{t('invoices.unitPrice')}</th>
                    <th className='px-4 py-3 text-right text-sm font-medium'>{t('invoices.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className='border-t'>
                      <td className='px-4 py-3'>{item.description}</td>
                      <td className='px-4 py-3 text-right'>{item.quantity}</td>
                      <td className='px-4 py-3 text-right'>${item.unitPrice.toFixed(2)}</td>
                      <td className='px-4 py-3 text-right'>${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='mt-4 flex justify-end'>
              <div className='w-64 space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>{t('invoices.subtotal')}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <Separator />
                <div className='flex justify-between text-lg font-bold'>
                  <span>{t('invoices.total')}</span>
                  <span>${invoice.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <CardHeader>
              <CardTitle>{t('invoices.notes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>{invoice.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
