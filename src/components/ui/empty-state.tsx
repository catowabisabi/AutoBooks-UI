'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type EmptyStateVariant = 
  | 'no-data'
  | 'no-results'
  | 'no-invoices'
  | 'no-expenses'
  | 'no-contacts'
  | 'no-reports'
  | 'error'
  | 'coming-soon';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

// SVG illustrations for each variant
const illustrations: Record<EmptyStateVariant, React.ReactNode> = {
  'no-data': (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="120" height="90" rx="8" className="fill-muted stroke-muted-foreground/20" strokeWidth="2" />
      <rect x="55" y="50" width="90" height="8" rx="2" className="fill-muted-foreground/20" />
      <rect x="55" y="65" width="70" height="8" rx="2" className="fill-muted-foreground/20" />
      <rect x="55" y="80" width="80" height="8" rx="2" className="fill-muted-foreground/20" />
      <rect x="55" y="95" width="60" height="8" rx="2" className="fill-muted-foreground/20" />
      <circle cx="100" cy="75" r="30" className="fill-primary/10" />
      <path d="M90 75 L100 85 L115 65" className="stroke-primary" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  'no-results': (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="85" cy="70" r="35" className="stroke-muted-foreground/30" strokeWidth="3" fill="none" />
      <line x1="110" y1="95" x2="140" y2="125" className="stroke-muted-foreground/30" strokeWidth="4" strokeLinecap="round" />
      <circle cx="85" cy="70" r="20" className="fill-primary/10" />
      <path d="M75 70 L95 70 M85 60 L85 80" className="stroke-muted-foreground/40" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  'no-invoices': (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="20" width="100" height="110" rx="4" className="fill-muted stroke-muted-foreground/20" strokeWidth="2" />
      <rect x="60" y="35" width="60" height="6" rx="1" className="fill-primary/30" />
      <rect x="60" y="50" width="80" height="4" rx="1" className="fill-muted-foreground/20" />
      <rect x="60" y="60" width="70" height="4" rx="1" className="fill-muted-foreground/20" />
      <line x1="60" y1="75" x2="140" y2="75" className="stroke-muted-foreground/20" strokeWidth="1" strokeDasharray="4 2" />
      <rect x="60" y="85" width="40" height="4" rx="1" className="fill-muted-foreground/20" />
      <rect x="110" y="85" width="25" height="4" rx="1" className="fill-muted-foreground/20" />
      <rect x="60" y="95" width="40" height="4" rx="1" className="fill-muted-foreground/20" />
      <rect x="110" y="95" width="25" height="4" rx="1" className="fill-muted-foreground/20" />
      <rect x="100" y="110" width="35" height="8" rx="2" className="fill-primary/20" />
      <circle cx="150" cy="40" r="20" className="fill-green-500/20" />
      <path d="M142 40 L147 45 L158 34" className="stroke-green-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  'no-expenses': (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="35" width="120" height="80" rx="6" className="fill-muted stroke-muted-foreground/20" strokeWidth="2" />
      <rect x="50" y="50" width="30" height="20" rx="3" className="fill-primary/20" />
      <circle cx="65" cy="60" r="6" className="fill-primary/30" />
      <rect x="90" y="52" width="60" height="4" rx="1" className="fill-muted-foreground/20" />
      <rect x="90" y="62" width="40" height="4" rx="1" className="fill-muted-foreground/20" />
      <line x1="50" y1="85" x2="150" y2="85" className="stroke-muted-foreground/20" strokeWidth="1" />
      <rect x="50" y="95" width="50" height="4" rx="1" className="fill-muted-foreground/20" />
      <rect x="120" y="95" width="25" height="4" rx="1" className="fill-primary/30" />
      <path d="M160 25 L175 40 L160 55" className="stroke-primary/40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  'no-contacts': (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="50" r="25" className="fill-primary/10 stroke-muted-foreground/20" strokeWidth="2" />
      <circle cx="100" cy="45" r="10" className="fill-muted-foreground/20" />
      <path d="M80 70 Q100 90 120 70" className="stroke-muted-foreground/20" strokeWidth="8" fill="none" strokeLinecap="round" />
      <circle cx="55" cy="95" r="15" className="fill-muted stroke-muted-foreground/20" strokeWidth="1" />
      <circle cx="145" cy="95" r="15" className="fill-muted stroke-muted-foreground/20" strokeWidth="1" />
      <circle cx="55" cy="92" r="5" className="fill-muted-foreground/20" />
      <circle cx="145" cy="92" r="5" className="fill-muted-foreground/20" />
      <path d="M47 105 Q55 115 63 105" className="stroke-muted-foreground/20" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M137 105 Q145 115 153 105" className="stroke-muted-foreground/20" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M70 95 L85 85" className="stroke-primary/30" strokeWidth="1" strokeDasharray="3 2" />
      <path d="M130 95 L115 85" className="stroke-primary/30" strokeWidth="1" strokeDasharray="3 2" />
    </svg>
  ),
  'no-reports': (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="40" width="60" height="70" rx="4" className="fill-muted stroke-muted-foreground/20" strokeWidth="2" />
      <rect x="40" y="55" width="40" height="4" rx="1" className="fill-muted-foreground/20" />
      <rect x="40" y="65" width="30" height="4" rx="1" className="fill-muted-foreground/20" />
      <rect x="40" y="80" width="20" height="20" rx="2" className="fill-primary/20" />
      <rect x="110" y="40" width="60" height="70" rx="4" className="fill-muted stroke-muted-foreground/20" strokeWidth="2" />
      <rect x="120" y="50" width="10" height="30" rx="1" className="fill-primary/30" />
      <rect x="135" y="60" width="10" height="20" rx="1" className="fill-green-500/30" />
      <rect x="150" y="55" width="10" height="25" rx="1" className="fill-blue-500/30" />
      <rect x="120" y="90" width="40" height="4" rx="1" className="fill-muted-foreground/20" />
      <path d="M90 75 L105 75" className="stroke-primary/40" strokeWidth="2" strokeDasharray="4 2" />
    </svg>
  ),
  'error': (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="75" r="45" className="fill-destructive/10 stroke-destructive/30" strokeWidth="2" />
      <circle cx="100" cy="75" r="30" className="fill-destructive/5" />
      <line x1="85" y1="60" x2="115" y2="90" className="stroke-destructive" strokeWidth="4" strokeLinecap="round" />
      <line x1="115" y1="60" x2="85" y2="90" className="stroke-destructive" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  'coming-soon': (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="30" width="100" height="90" rx="8" className="fill-muted stroke-muted-foreground/20" strokeWidth="2" />
      <circle cx="100" cy="65" r="20" className="fill-primary/10" />
      <path d="M100 50 L100 70 L110 75" className="stroke-primary" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="70" y="95" width="60" height="8" rx="2" className="fill-primary/20" />
      <circle cx="155" cy="45" r="8" className="fill-yellow-500/30" />
      <path d="M155 40 L155 50" className="stroke-yellow-500" strokeWidth="2" strokeLinecap="round" />
      <circle cx="155" cy="55" r="1" className="fill-yellow-500" />
    </svg>
  ),
};

// Default titles and descriptions for each variant
const defaultContent: Record<EmptyStateVariant, { title: string; description: string; hint?: string }> = {
  'no-data': {
    title: 'No data yet',
    description: 'Start by adding your first item to see it here.',
    hint: 'Click the button below to get started.',
  },
  'no-results': {
    title: 'No results found',
    description: 'We couldn\'t find anything matching your search.',
    hint: 'Try adjusting your filters or search terms.',
  },
  'no-invoices': {
    title: 'No invoices yet',
    description: 'Create your first invoice to start tracking your billing.',
    hint: 'Press N + I to quickly create a new invoice.',
  },
  'no-expenses': {
    title: 'No expenses recorded',
    description: 'Start tracking your business expenses here.',
    hint: 'Press N + E to quickly add a new expense.',
  },
  'no-contacts': {
    title: 'No contacts yet',
    description: 'Add customers and vendors to manage your business relationships.',
    hint: 'Press N + C to quickly add a new contact.',
  },
  'no-reports': {
    title: 'No reports available',
    description: 'Reports will appear here once you have enough data.',
    hint: 'Add some transactions to generate financial reports.',
  },
  'error': {
    title: 'Something went wrong',
    description: 'We encountered an error loading this content.',
    hint: 'Please try refreshing the page or contact support.',
  },
  'coming-soon': {
    title: 'Coming Soon',
    description: 'This feature is currently under development.',
    hint: 'Check back soon for updates!',
  },
};

export function EmptyState({
  variant = 'no-data',
  title,
  description,
  hint,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  children,
}: EmptyStateProps) {
  const content = defaultContent[variant];
  const displayTitle = title ?? content.title;
  const displayDescription = description ?? content.description;
  const displayHint = hint ?? content.hint;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      {/* Illustration */}
      <div className="w-48 h-36 mb-6">
        {illustrations[variant]}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {displayTitle}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground max-w-sm mb-4">
        {displayDescription}
      </p>

      {/* Hint with gradient background */}
      {displayHint && (
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg px-4 py-2 mb-6">
          <p className="text-sm text-muted-foreground">
            💡 {displayHint}
          </p>
        </div>
      )}

      {/* Actions */}
      {(actionLabel || secondaryActionLabel || children) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button onClick={onAction} className="gap-2">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
