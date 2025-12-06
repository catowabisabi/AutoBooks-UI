import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    titleKey: 'nav.dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Business',
    titleKey: 'nav.business',
    url: '/dashboard/business',
    icon: 'billing',
    shortcut: ['b', 'u'],
    isActive: false,
    items: [
      {
        title: 'Overview',
        titleKey: 'nav.overview',
        url: '/dashboard/business'
      },
      {
        title: 'Audits',
        titleKey: 'nav.audits',
        url: '/dashboard/business/audits'
      },
      {
        title: 'Tax Returns',
        titleKey: 'nav.taxReturns',
        url: '/dashboard/business/tax-returns'
      },
      {
        title: 'Billable Hours',
        titleKey: 'nav.billableHours',
        url: '/dashboard/business/billable-hours'
      },
      {
        title: 'Revenue',
        titleKey: 'nav.revenue',
        url: '/dashboard/business/revenue'
      }
    ]
  },
  {
    title: 'AI Assistants',
    titleKey: 'nav.aiAssistants',
    url: '/dashboard/accounting-assistant',
    icon: 'bot',
    shortcut: ['a', 'i'],
    isActive: false,
    items: [
      {
        title: 'Accounting',
        titleKey: 'nav.accountingAssistant',
        url: '/dashboard/accounting-assistant'
      },
      {
        title: 'Email',
        titleKey: 'nav.emailAssistant',
        url: '/dashboard/emails'
      },
      {
        title: 'Document',
        titleKey: 'nav.documentAssistant',
        url: '/dashboard/document-assistant'
      },
      {
        title: 'Planner',
        titleKey: 'nav.plannerAssistant',
        url: '/dashboard/planner-assistant'
      },
      {
        title: 'Brainstorming',
        titleKey: 'nav.brainstormingAssistant',
        url: '/dashboard/brainstorming-assistant'
      },
      {
        title: 'Analyst',
        titleKey: 'nav.analystAssistant',
        url: '/dashboard/analyst-assistant'
      }
    ]
  },
  {
    title: 'Company Finance',
    titleKey: 'nav.finance',
    url: '/dashboard/finance',
    icon: 'kanban',
    shortcut: ['f', 'i'],
    isActive: false,
    items: [
      {
        title: 'Dashboard',
        titleKey: 'nav.financeDashboard',
        url: '/dashboard/finance'
      },
      {
        title: 'Invoices',
        titleKey: 'nav.invoices',
        url: '/dashboard/finance/invoices'
      },
      {
        title: 'Expenses',
        titleKey: 'nav.expenses',
        url: '/dashboard/finance/expenses'
      },
      {
        title: 'Accounts',
        titleKey: 'nav.accountingItems',
        url: '/dashboard/finance/accounts'
      }
    ]
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
