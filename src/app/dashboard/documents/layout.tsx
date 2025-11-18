import { ReactNode } from 'react';
import PageContainer from '@/components/layout/page-container';

export default function DocumentsLayout({ children }: { children: ReactNode }) {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>{children}</div>
    </PageContainer>
  );
}
