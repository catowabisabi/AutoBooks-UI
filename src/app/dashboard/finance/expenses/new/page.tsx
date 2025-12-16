'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, ScanLine, CheckCircle, AlertCircle } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { useCurrencies, useCountries } from '@/features/core/hooks';

interface Currency {
  code: string;
  name: string;
}

interface Country {
  code: string;
  name: string;
}

const ExpenseForm = () => {
  const [formData, setFormData] = useState({
    merchantName: '',
    invoiceNo: '',
    expenseDate: '',
    currency: 'USD',
    claimedAmount: '',
    city: '',
    country: '',
    description: '',
    receiptFile: null as File | null
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanStatus, setScanStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Use cached hooks instead of raw fetch
  const { data: currencyData, isLoading: isCurrencyLoading } = useCurrencies();
  const { data: countryData, isLoading: isCountryLoading } = useCountries();
  
  const currencies: Currency[] = (currencyData as any)?.currencies || currencyData || [];
  const countries: Country[] = (countryData as any)?.countries || countryData || [];
  const isLoading = isCurrencyLoading || isCountryLoading;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const file = files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        receiptFile: file
      }));

      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      setFileType(fileExt);

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Reset scan status when a new file is uploaded
      setScanStatus(null);
    }
  };

  const handleScanReceipt = async () => {
    if (!formData.receiptFile) return;

    setIsProcessing(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', formData.receiptFile);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/finance-assistant/analyze/`,
        {
          method: 'POST',
          body: formDataObj
        }
      );

      if (!response.ok) {
        throw new Error('Failed to analyze receipt');
      }

      const data = await response.json();

      setFormData((prev) => ({
        ...prev,
        merchantName: data.merchantName || prev.merchantName,
        invoiceNo: data.invoiceNo || prev.invoiceNo,
        expenseDate: data.expenseDate || prev.expenseDate,
        currency: data.currency || prev.currency,
        claimedAmount: data.claimedAmount || prev.claimedAmount,
        city: data.city || prev.city,
        country: data.country || prev.country,
        description: data.description || prev.description
      }));

      setScanStatus({
        success: true,
        message:
          'Receipt analyzed successfully! Form has been filled with the extracted data.'
      });
    } catch (error) {
      console.error('Error scanning receipt:', error);
      setScanStatus({
        success: false,
        message:
          'Failed to analyze receipt. Please try again or upload a clearer image.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle>Add Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className='grid grid-cols-1 gap-6 md:grid-cols-2'
            >
              <div className='space-y-4'>
                <div>
                  <label className='mb-1 block text-sm font-medium'>
                    Merchant Name
                  </label>
                  <Input
                    name='merchantName'
                    value={formData.merchantName}
                    onChange={handleInputChange}
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-medium'>
                    Invoice Number
                  </label>
                  <Input
                    name='invoiceNo'
                    value={formData.invoiceNo}
                    onChange={handleInputChange}
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-medium'>
                    Expense Date
                  </label>
                  <Input
                    type='date'
                    name='expenseDate'
                    value={formData.expenseDate}
                    onChange={handleInputChange}
                    className='w-full'
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Currency
                    </label>
                    <select
                      name='currency'
                      value={formData.currency}
                      onChange={handleInputChange}
                      className='border-input text-foreground focus:ring-ring w-full rounded-md border bg-transparent p-2 focus:ring-1 focus:outline-none'
                    >
                      {isLoading ? (
                        <option>Loading currencies...</option>
                      ) : (
                        currencies.map((currency) => (
                          <option
                            key={currency.code}
                            value={currency.code}
                            className='bg-background text-foreground'
                          >
                            {currency.code} - {currency.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Claimed Amount
                    </label>
                    <Input
                      type='number'
                      name='claimedAmount'
                      value={formData.claimedAmount}
                      onChange={handleInputChange}
                      className='w-full'
                    />
                  </div>
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium'>City</label>
                  <Input
                    name='city'
                    value={formData.city}
                    onChange={handleInputChange}
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-medium'>
                    Country
                  </label>
                  <select
                    name='country'
                    value={formData.country}
                    onChange={handleInputChange}
                    className='border-input text-foreground focus:ring-ring w-full rounded-md border bg-transparent p-2 focus:ring-1 focus:outline-none'
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <option>Loading countries...</option>
                    ) : (
                      countries.map((country) => (
                        <option
                          key={country.code}
                          value={country.code}
                          className='bg-background text-foreground'
                        >
                          {country.name} ({country.code})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className='mb-1 block text-sm font-medium'>
                    Description
                  </label>
                  <Textarea
                    name='description'
                    value={formData.description}
                    onChange={handleInputChange}
                    className='w-full'
                    rows={3}
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <div className='rounded-lg border-2 border-dashed p-4 text-center'>
                  <input
                    type='file'
                    id='receipt'
                    className='hidden'
                    accept='image/*,.pdf'
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor='receipt'
                    className='flex cursor-pointer flex-col items-center justify-center space-y-2'
                  >
                    <Upload className='h-8 w-8' />
                    <span className='text-sm font-medium'>
                      Upload Receipt (Image/PDF)
                    </span>
                  </label>

                  {previewUrl && (
                    <div className='mt-4'>
                      {fileType === 'pdf' ? (
                        <iframe
                          src={previewUrl}
                          className='h-64 w-full'
                          title='PDF Preview'
                        ></iframe>
                      ) : (
                        <img
                          src={previewUrl}
                          alt='Receipt preview'
                          className='mx-auto h-auto max-w-full'
                        />
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type='button'
                  onClick={handleScanReceipt}
                  disabled={!formData.receiptFile || isProcessing}
                  className='w-full'
                >
                  <ScanLine className='mr-2 h-4 w-4' />
                  {isProcessing ? 'Scanning...' : 'Scan Receipt'}
                </Button>

                {scanStatus && (
                  <div
                    className={`mt-4 flex items-start rounded-md p-3 ${
                      scanStatus.success
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {scanStatus.success ? (
                      <CheckCircle className='mr-2 h-5 w-5 flex-shrink-0' />
                    ) : (
                      <AlertCircle className='mr-2 h-5 w-5 flex-shrink-0' />
                    )}
                    <span>{scanStatus.message}</span>
                  </div>
                )}
              </div>

              <div className='md:col-span-2'>
                <Button type='submit' className='w-full'>
                  Add Expense
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ExpenseForm;
