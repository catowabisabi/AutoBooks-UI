'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  IconPlus, 
  IconFileInvoice, 
  IconUsers, 
  IconFolder, 
  IconChartBar, 
  IconSettings,
  IconBriefcase,
  IconBuilding,
  IconReceipt,
  IconClipboardList
} from '@tabler/icons-react';
import type { TablerIcon } from '@tabler/icons-react';
import Link from 'next/link';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: TablerIcon | React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  variant?: 'default' | 'card' | 'inline';
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = IconFolder,
  actionLabel,
  actionHref,
  onAction,
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  const { t } = useTranslation();
  
  const defaultTitle = t('emptyState.noData', 'No data yet');
  const defaultDescription = t('emptyState.getStarted', 'Get started by adding your first item.');
  
  const content = (
    <div className={`flex flex-col items-center justify-center text-center p-8 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">
        {title || defaultTitle}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description || defaultDescription}
      </p>
      {(actionLabel && (actionHref || onAction)) && (
        actionHref ? (
          <Button asChild>
            <Link href={actionHref}>
              <IconPlus className="w-4 h-4 mr-2" />
              {actionLabel}
            </Link>
          </Button>
        ) : (
          <Button onClick={onAction}>
            <IconPlus className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className="border-dashed">
        <CardContent className="p-0">
          {content}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-4 p-4 rounded-lg bg-muted/30 ${className}`}>
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{title || defaultTitle}</p>
          <p className="text-xs text-muted-foreground">{description || defaultDescription}</p>
        </div>
        {(actionLabel && (actionHref || onAction)) && (
          actionHref ? (
            <Button size="sm" variant="outline" asChild>
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onAction}>{actionLabel}</Button>
          )
        )}
      </div>
    );
  }

  return content;
}

// 預設的空白狀態配置
export const emptyStateConfigs = {
  dashboard: {
    icon: IconChartBar,
    titleKey: 'emptyState.dashboard.title',
    descriptionKey: 'emptyState.dashboard.description',
    defaultTitle: 'Welcome to AutoBooks',
    defaultDescription: 'Start by setting up your company profile and adding your first transactions.',
    actionLabelKey: 'emptyState.dashboard.action',
    defaultActionLabel: 'Complete Setup',
    actionHref: '/dashboard/settings/company',
  },
  invoices: {
    icon: IconFileInvoice,
    titleKey: 'emptyState.invoices.title',
    descriptionKey: 'emptyState.invoices.description',
    defaultTitle: 'No invoices yet',
    defaultDescription: 'Create your first invoice to start tracking your revenue.',
    actionLabelKey: 'emptyState.invoices.action',
    defaultActionLabel: 'Create Invoice',
    actionHref: '/dashboard/accounting/invoices/new',
  },
  clients: {
    icon: IconUsers,
    titleKey: 'emptyState.clients.title',
    descriptionKey: 'emptyState.clients.description',
    defaultTitle: 'No clients yet',
    defaultDescription: 'Add your first client to start managing your business relationships.',
    actionLabelKey: 'emptyState.clients.action',
    defaultActionLabel: 'Add Client',
    actionHref: '/dashboard/business/clients/new',
  },
  projects: {
    icon: IconBriefcase,
    titleKey: 'emptyState.projects.title',
    descriptionKey: 'emptyState.projects.description',
    defaultTitle: 'No projects yet',
    defaultDescription: 'Create your first project to start tracking work and billable hours.',
    actionLabelKey: 'emptyState.projects.action',
    defaultActionLabel: 'Create Project',
    actionHref: '/dashboard/projects/new',
  },
  audits: {
    icon: IconClipboardList,
    titleKey: 'emptyState.audits.title',
    descriptionKey: 'emptyState.audits.description',
    defaultTitle: 'No audit projects yet',
    defaultDescription: 'Start your first audit engagement to track progress and deadlines.',
    actionLabelKey: 'emptyState.audits.action',
    defaultActionLabel: 'Create Audit',
    actionHref: '/dashboard/business/audits/new',
  },
  taxReturns: {
    icon: IconReceipt,
    titleKey: 'emptyState.taxReturns.title',
    descriptionKey: 'emptyState.taxReturns.description',
    defaultTitle: 'No tax returns yet',
    defaultDescription: 'Add tax return filings to track deadlines and compliance.',
    actionLabelKey: 'emptyState.taxReturns.action',
    defaultActionLabel: 'Add Tax Return',
    actionHref: '/dashboard/business/tax-returns/new',
  },
  company: {
    icon: IconBuilding,
    titleKey: 'emptyState.company.title',
    descriptionKey: 'emptyState.company.description',
    defaultTitle: 'Company not set up',
    defaultDescription: 'Complete your company profile to unlock all features.',
    actionLabelKey: 'emptyState.company.action',
    defaultActionLabel: 'Set Up Company',
    actionHref: '/dashboard/settings/company',
  },
};

// 使用預設配置的空白狀態組件
interface TypedEmptyStateProps extends Omit<EmptyStateProps, 'icon' | 'title' | 'description' | 'actionLabel' | 'actionHref'> {
  type: keyof typeof emptyStateConfigs;
}

export function TypedEmptyState({ type, ...props }: TypedEmptyStateProps) {
  const { t } = useTranslation();
  const config = emptyStateConfigs[type];
  
  return (
    <EmptyState
      icon={config.icon}
      title={t(config.titleKey, config.defaultTitle)}
      description={t(config.descriptionKey, config.defaultDescription)}
      actionLabel={t(config.actionLabelKey, config.defaultActionLabel)}
      actionHref={config.actionHref}
      {...props}
    />
  );
}

export default EmptyState;
