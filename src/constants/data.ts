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
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Business 業務管理',
    url: '/dashboard/business',
    icon: 'billing',
    shortcut: ['b', 'u'],
    isActive: false,
    items: [
      {
        title: 'Overview / 總覽',
        url: '/dashboard/business'
      },
      {
        title: 'Audits / 審計專案',
        url: '/dashboard/business/audits'
      },
      {
        title: 'Tax Returns / 稅務申報',
        url: '/dashboard/business/tax-returns'
      },
      {
        title: 'Billable Hours / 工時記錄',
        url: '/dashboard/business/billable-hours'
      },
      {
        title: 'Revenue / 收入管理',
        url: '/dashboard/business/revenue'
      }
    ]
  },
  {
    title: 'AI Assistants AI 助理',
    url: '/dashboard/accounting-assistant',
    icon: 'bot',
    shortcut: ['a', 'i'],
    isActive: false,
    items: [
      {
        title: 'Accounting / 會計助手',
        url: '/dashboard/accounting-assistant'
      },
      {
        title: 'Email / 郵件助手',
        url: '/dashboard/emails'
      },
      {
        title: 'Document / 文件助手',
        url: '/dashboard/document-assistant'
      },
      {
        title: 'Planner / 規劃助手',
        url: '/dashboard/planner-assistant'
      },
      {
        title: 'Brainstorming / 腦力激盪',
        url: '/dashboard/brainstorming-assistant'
      },
      {
        title: 'Analyst / 分析助手',
        url: '/dashboard/analyst-assistant'
      }
    ]
  },
  {
    title: 'Finance 財務管理',
    url: '/dashboard/finance',
    icon: 'kanban',
    shortcut: ['f', 'i'],
    isActive: false,
    items: [
      {
        title: 'Dashboard / 儀表板',
        url: '/dashboard/finance'
      },
      {
        title: 'Invoices / 發票',
        url: '/dashboard/finance/invoices'
      },
      {
        title: 'Expenses / 費用',
        url: '/dashboard/finance/expenses'
      },
      {
        title: 'Accounts / 科目',
        url: '/dashboard/finance/accounts'
      }
    ]
  },
  {
    title: 'Settings 設定',
    url: '/dashboard/settings',
    icon: 'settings',
    shortcut: ['s', 's'],
    isActive: false,
    items: [
      {
        title: 'General / 一般設定',
        url: '/dashboard/settings'
      },
      {
        title: 'Currencies / 貨幣',
        url: '/dashboard/settings/currencies'
      },
      {
        title: 'Tax Rates / 稅率',
        url: '/dashboard/settings/tax-rates'
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
