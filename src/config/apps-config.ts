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
  },
  {
    id: 'business',
    name: 'Business',
    icon: '💼',
    color: 'bg-indigo-500',
    menuItems: [
      {
        id: 'business-overview',
        label: 'Business Overview / 業務總覽',
        href: '/dashboard/business',
        icon: '🏠'
      },
      {
        id: 'listed-clients',
        label: 'Listed Clients / 上市公司客戶',
        href: '/dashboard/business/listed-clients',
        icon: '🏢'
      },
      {
        id: 'ipo-mandates',
        label: 'IPO Mandates / IPO項目',
        href: '/dashboard/business/ipo-mandates',
        icon: '📈'
      },
      {
        id: 'announcements',
        label: 'Announcements / 公告管理',
        href: '/dashboard/business/announcements',
        icon: '📢'
      },
      {
        id: 'media-coverage',
        label: 'Media Coverage / 媒體報導',
        href: '/dashboard/business/media-coverage',
        icon: '📰'
      },
      {
        id: 'audits',
        label: 'Audits / 審計專案',
        href: '/dashboard/business/audits',
        icon: '📋'
      },
      {
        id: 'tax-returns',
        label: 'Tax Returns / 稅務申報',
        href: '/dashboard/business/tax-returns',
        icon: '🧾'
      },
      {
        id: 'billable-hours',
        label: 'Billable Hours / 工時記錄',
        href: '/dashboard/business/billable-hours',
        icon: '⏱️'
      },
      {
        id: 'revenue',
        label: 'Revenue / 收入管理',
        href: '/dashboard/business/revenue',
        icon: '💰'
      }
    ]
  },
  {
    id: 'ai-assistants',
    name: 'AI Assistants',
    icon: '🤖',
    color: 'bg-pink-500',
    menuItems: [
      {
        id: 'accounting-assistant',
        label: 'Accounting Assistant / 會計助手',
        href: '/dashboard/accounting-assistant',
        icon: '🧮'
      },
      {
        id: 'email-assistant',
        label: 'Email Assistant / 郵件助手',
        href: '/dashboard/emails',
        icon: '📧'
      },
      {
        id: 'document-assistant',
        label: 'Document Assistant / 文件助手',
        href: '/dashboard/document-assistant',
        icon: '📄'
      },
      {
        id: 'planner-assistant',
        label: 'Planner Assistant / 規劃助手',
        href: '/dashboard/planner-assistant',
        icon: '📅'
      },
      {
        id: 'brainstorming-assistant',
        label: 'Brainstorming / 腦力激盪',
        href: '/dashboard/brainstorming-assistant',
        icon: '💡'
      },
      {
        id: 'analyst-assistant',
        label: 'Analyst Assistant / 分析助手',
        href: '/dashboard/analyst-assistant',
        icon: '📊'
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
    id: 'chart-of-accounts',
    label: 'Chart of Accounts / 會計項目表',
    href: '/dashboard/settings/chart-of-accounts',
    icon: '📊'
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
