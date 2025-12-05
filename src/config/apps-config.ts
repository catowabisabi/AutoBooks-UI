import type { AppConfig, MenuItem } from '@/types/types';

export const APPS_CONFIG: AppConfig[] = [
  {
    id: 'hrms',
    name: 'HRMS',
    icon: '👥',
    color: 'bg-blue-500',
    menuItems: [
      {
        id: 'dashboard',
        label: 'HRMS Dashboard',
        href: '/dashboard/hrms',
        icon: '🏠'
      },
      {
        id: 'tasks',
        label: 'Employees',
        href: '/dashboard/hrms/employees',
        icon: '👤'
      },
      {
        id: 'departments',
        label: 'Departments',
        href: '/dashboard/hrms/departments',
        icon: '🏢'
      },
      {
        id: 'leaves',
        label: 'Leaves Management',
        href: '/dashboard/hrms/leaves',
        icon: '🏖️'
      },
      {
        id: 'payroll',
        label: 'Payroll Management',
        href: '/dashboard/hrms/payroll',
        icon: '💰'
      }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: '📊',
    color: 'bg-green-500',
    menuItems: [
      {
        id: 'dashboards',
        label: 'Dashboards',
        href: '/dashboard/analytics',
        icon: '📋'
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/dashboard/analytics/reports',
        icon: '📈'
      },
      {
        id: 'data-sources',
        label: 'Data Sources',
        href: '/dashboard/analytics/data-sources',
        icon: '💡'
      }
    ]
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: '🚀',
    color: 'bg-purple-500',
    menuItems: [
      {
        id: 'dashboard',
        label: 'Projects Dashboard',
        href: '/dashboard/projects',
        icon: '📝'
      },
      {
        id: 'tasks',
        label: 'Tasks',
        href: '/dashboard/projects/tasks',
        icon: '✅'
      },
      {
        id: 'timelines',
        label: 'Timelines',
        href: '/dashboard/projects/timelines',
        icon: '⏰'
      },
      {
        id: 'teams',
        label: 'Teams',
        href: '/dashboard/projects/teams',
        icon: '👥'
      },
      {
        id: 'reports',
        label: 'Project Reports',
        href: '/dashboard/projects/reports',
        icon: '👥'
      }
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: '💼',
    color: 'bg-orange-500',
    menuItems: [
      {
        id: 'finance-dashboard',
        label: 'Finance Dashboard / 財務儀表板',
        href: '/dashboard/finance',
        icon: '🧾'
      },
      {
        id: 'accounts',
        label: 'Chart of Accounts / 會計科目',
        href: '/dashboard/finance/accounts',
        icon: '📊'
      },
      {
        id: 'journal',
        label: 'Journal Entries / 日記帳',
        href: '/dashboard/finance/journal',
        icon: '📝'
      },
      {
        id: 'invoices',
        label: 'Invoices / 發票',
        href: '/dashboard/finance/invoices',
        icon: '🧾'
      },
      {
        id: 'payments',
        label: 'Payments / 付款管理',
        href: '/dashboard/finance/payments',
        icon: '💳'
      },
      {
        id: 'contacts',
        label: 'Contacts / 聯絡人',
        href: '/dashboard/finance/contacts',
        icon: '👥'
      },
      {
        id: 'expenses',
        label: 'Expenses / 費用',
        href: '/dashboard/finance/expenses',
        icon: '💸'
      },
      {
        id: 'reports',
        label: 'Reports / 報表',
        href: '/dashboard/finance/reports',
        icon: '📈'
      }
    ]
  },
  {
    id: 'documents',
    name: 'Documents Manager',
    icon: '📄',
    color: 'bg-blue-400',
    menuItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard/documents',
        icon: '🏠'
      },
      {
        id: 'workflow-builder',
        label: 'Workflow Builder',
        href: '/dashboard/documents',
        icon: '🔄'
      }
    ]
  }
];

export const COMMON_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard/overview',
    icon: '🏠'
  },
  { id: 'emails', label: 'Emails', href: '/dashboard/emails', icon: '📧' },
  { id: 'calendar', label: 'Calendar', href: '/dashboard/calendar', icon: '📅' }
];

export const BOTTOM_MENU_ITEMS: MenuItem[] = [
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: '⚙️' }
];

// Settings sub-menu items
export const SETTINGS_MENU_ITEMS: MenuItem[] = [
  {
    id: 'settings-general',
    label: 'General / 一般設定',
    href: '/dashboard/settings',
    icon: '⚙️'
  },
  {
    id: 'currencies',
    label: 'Currencies / 貨幣',
    href: '/dashboard/settings/currencies',
    icon: '💱'
  },
  {
    id: 'tax-rates',
    label: 'Tax Rates / 稅率',
    href: '/dashboard/settings/tax-rates',
    icon: '💹'
  },
  {
    id: 'fiscal-years',
    label: 'Fiscal Years / 財年',
    href: '/dashboard/settings/fiscal-years',
    icon: '📅'
  },
  {
    id: 'periods',
    label: 'Accounting Periods / 會計期間',
    href: '/dashboard/settings/periods',
    icon: '📆'
  },
  {
    id: 'api-keys',
    label: 'API Keys',
    href: '/dashboard/settings/api-keys',
    icon: '🔑'
  },
  {
    id: 'knowledge-base',
    label: 'Knowledge Base',
    href: '/dashboard/settings/knowledge-base',
    icon: '📚'
  }
];
