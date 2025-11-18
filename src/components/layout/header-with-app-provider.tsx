'use client';

import React from 'react';
import Header from './header';
import { AppProvider } from '@/contexts/app-context';

export default function HeaderWithAppProvider() {
  return (
    <AppProvider>
      <Header />
    </AppProvider>
  );
}
