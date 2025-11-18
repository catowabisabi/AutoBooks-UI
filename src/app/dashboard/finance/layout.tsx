import PageContainer from '@/components/layout/page-container';
import React from 'react';

export const metadata = {
  title: 'Dashboard: Finance'
};

export default function FinanceLayout({
  children,
  assistant
}: {
  children: React.ReactNode;
  assistant: React.ReactNode;
}) {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='w-full'>{children}</div>
        {assistant}
      </div>
    </PageContainer>
  );
}
