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
        id: 'Finance Dashboard',
        label: 'Finance Dashboard',
        href: '/dashboard/finance',
        icon: '🧾'
      },
      {
        id: 'expenses',
        label: 'Expenses',
        href: '/dashboard/finance/expenses',
        icon: '💸'
      },
      {
        id: 'approvals',
        label: 'Approvals',
        href: '/dashboard/finance/approvals',
        icon: '🧾'
      },
      {
        id: 'ledgers',
        label: 'Ledgers',
        href: '/dashboard/finance/ledgers',
        icon: '💳'
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
