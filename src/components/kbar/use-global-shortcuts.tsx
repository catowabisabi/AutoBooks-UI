'use client';

import { useRegisterActions, Action } from 'kbar';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/**
 * Hook that registers global keyboard shortcuts for navigation
 * Uses kbar for command palette integration
 */
const useGlobalShortcuts = () => {
  const router = useRouter();

  const navigateTo = useCallback((url: string) => {
    router.push(url);
  }, [router]);

  const actions: Action[] = useMemo(() => [
    // Go-to shortcuts (g + key)
    {
      id: 'goto-home',
      name: 'Go to Home',
      shortcut: ['g', 'h'],
      keywords: 'home dashboard main',
      section: 'Navigation',
      subtitle: 'Go to main dashboard',
      perform: () => navigateTo('/dashboard'),
    },
    {
      id: 'goto-finance',
      name: 'Go to Finance',
      shortcut: ['g', 'f'],
      keywords: 'finance accounting money',
      section: 'Navigation',
      subtitle: 'Go to finance dashboard',
      perform: () => navigateTo('/dashboard/finance'),
    },
    {
      id: 'goto-invoices',
      name: 'Go to Invoices',
      shortcut: ['g', 'i'],
      keywords: 'invoices billing',
      section: 'Navigation',
      subtitle: 'Go to invoices list',
      perform: () => navigateTo('/dashboard/finance/invoices'),
    },
    {
      id: 'goto-expenses',
      name: 'Go to Expenses',
      shortcut: ['g', 'e'],
      keywords: 'expenses costs',
      section: 'Navigation',
      subtitle: 'Go to expenses list',
      perform: () => navigateTo('/dashboard/finance/expenses'),
    },
    {
      id: 'goto-reports',
      name: 'Go to Reports',
      shortcut: ['g', 'r'],
      keywords: 'reports analytics data',
      section: 'Navigation',
      subtitle: 'Go to financial reports',
      perform: () => navigateTo('/dashboard/finance/reports'),
    },
    {
      id: 'goto-approvals',
      name: 'Go to Approvals',
      shortcut: ['g', 'a'],
      keywords: 'approvals pending review',
      section: 'Navigation',
      subtitle: 'Go to pending approvals',
      perform: () => navigateTo('/dashboard/finance/approvals'),
    },
    {
      id: 'goto-contacts',
      name: 'Go to Contacts',
      shortcut: ['g', 'c'],
      keywords: 'contacts customers vendors',
      section: 'Navigation',
      subtitle: 'Go to contacts list',
      perform: () => navigateTo('/dashboard/finance/contacts'),
    },
    {
      id: 'goto-analytics',
      name: 'Go to Analytics',
      shortcut: ['g', 'n'],
      keywords: 'analytics charts data ai assistant',
      section: 'Navigation',
      subtitle: 'Go to analytics dashboard',
      perform: () => navigateTo('/dashboard/analytics'),
    },
    {
      id: 'goto-hr',
      name: 'Go to HR',
      shortcut: ['g', 'p'],
      keywords: 'hr human resources people employees',
      section: 'Navigation',
      subtitle: 'Go to HR dashboard',
      perform: () => navigateTo('/dashboard/hr'),
    },
    {
      id: 'goto-settings',
      name: 'Go to Settings',
      shortcut: ['g', 's'],
      keywords: 'settings preferences config',
      section: 'Navigation',
      subtitle: 'Go to settings',
      perform: () => navigateTo('/dashboard/settings'),
    },

    // New/Create shortcuts (n + key)
    {
      id: 'new-invoice',
      name: 'New Invoice',
      shortcut: ['n', 'i'],
      keywords: 'new create invoice billing',
      section: 'Create',
      subtitle: 'Create a new invoice',
      perform: () => navigateTo('/dashboard/finance/invoices/new'),
    },
    {
      id: 'new-expense',
      name: 'New Expense',
      shortcut: ['n', 'e'],
      keywords: 'new create expense cost',
      section: 'Create',
      subtitle: 'Create a new expense',
      perform: () => navigateTo('/dashboard/finance/expenses/new'),
    },
    {
      id: 'new-receipt',
      name: 'New Receipt',
      shortcut: ['n', 'r'],
      keywords: 'new create receipt',
      section: 'Create',
      subtitle: 'Create a new receipt',
      perform: () => navigateTo('/dashboard/finance/receipts/new'),
    },
    {
      id: 'new-payment',
      name: 'New Payment',
      shortcut: ['n', 'p'],
      keywords: 'new create payment',
      section: 'Create',
      subtitle: 'Record a new payment',
      perform: () => navigateTo('/dashboard/finance/payments/new'),
    },
    {
      id: 'new-contact',
      name: 'New Contact',
      shortcut: ['n', 'c'],
      keywords: 'new create contact customer vendor',
      section: 'Create',
      subtitle: 'Add a new contact',
      perform: () => navigateTo('/dashboard/finance/contacts/new'),
    },
    {
      id: 'new-journal',
      name: 'New Journal Entry',
      shortcut: ['n', 'j'],
      keywords: 'new create journal entry ledger',
      section: 'Create',
      subtitle: 'Create a journal entry',
      perform: () => navigateTo('/dashboard/finance/journal/new'),
    },
  ], [navigateTo]);

  useRegisterActions(actions, [navigateTo]);
};

export default useGlobalShortcuts;
