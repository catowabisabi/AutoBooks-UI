'use client';

import React, { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, Info } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/provider';

interface HelpTooltipProps {
  tooltipKey?: string;
  content?: string;
  children?: ReactNode;
  icon?: 'help' | 'info';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  iconClassName?: string;
}

export function HelpTooltip({
  tooltipKey,
  content,
  children,
  icon = 'help',
  side = 'top',
  className = '',
  iconClassName = 'h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help',
}: HelpTooltipProps) {
  const { t } = useTranslation();
  
  // Get tooltip content from translations or use provided content
  const tooltipContent = tooltipKey ? t(`tooltips.${tooltipKey}`) : content;

  if (!tooltipContent) return null;

  const IconComponent = icon === 'help' ? HelpCircle : Info;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild className={className}>
          {children || <IconComponent className={iconClassName} />}
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Wrapper component for elements that need help tooltips
interface WithHelpProps {
  children: ReactNode;
  tooltipKey?: string;
  content?: string;
  position?: 'before' | 'after';
  icon?: 'help' | 'info';
  className?: string;
}

export function WithHelp({
  children,
  tooltipKey,
  content,
  position = 'after',
  icon = 'help',
  className = '',
}: WithHelpProps) {
  const helpIcon = (
    <HelpTooltip
      tooltipKey={tooltipKey}
      content={content}
      icon={icon}
      className="inline-flex ml-1"
    />
  );

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {position === 'before' && helpIcon}
      {children}
      {position === 'after' && helpIcon}
    </span>
  );
}

// Feature tooltip that shows on first visit
interface FeatureTooltipProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export function FeatureTooltip({
  id,
  title,
  description,
  children,
  position = 'bottom',
}: FeatureTooltipProps) {
  const [shown, setShown] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`feature-tooltip-${id}`) === 'dismissed';
    }
    return false;
  });

  React.useEffect(() => {
    if (!dismissed) {
      const timer = setTimeout(() => setShown(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [dismissed]);

  const handleDismiss = () => {
    setShown(false);
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`feature-tooltip-${id}`, 'dismissed');
    }
  };

  if (dismissed || !shown) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip open={shown}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={position}
          className="max-w-sm p-4 bg-primary text-primary-foreground"
        >
          <div className="space-y-2">
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm opacity-90">{description}</p>
            <button
              onClick={handleDismiss}
              className="text-xs underline opacity-80 hover:opacity-100"
            >
              Got it
            </button>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
