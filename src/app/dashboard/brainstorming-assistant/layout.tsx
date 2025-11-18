import type { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import React from 'react';

export const metadata: Metadata = {
  title: 'Brainstorming Assistant',
  description: 'Discover and create custom assistants for brainstorming'
};

export default function BrainstormingAssistantLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PageContainer>{children}</PageContainer>;
}
