import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
// import HeaderWithAppProvider from '@/components/layout/header-with-app-provider';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cookies } from 'next/headers';
import React from 'react';
import { AppProvider } from '@/contexts/app-context';
import Header from '@/components/layout/header';
import { AIButlerWrapper } from '@/components/ai-butler-wrapper';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            {/* page main content */}
            {children}
            {/* page main content ends */}
          </SidebarInset>
          {/* AI Butler - floating assistant */}
          <AIButlerWrapper />
        </AppProvider>
      </SidebarProvider>
    </KBar>
  );
}
