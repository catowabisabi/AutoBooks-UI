'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, RefreshCw } from 'lucide-react';

// =================================================================
// Loading Spinner - Simple animated spinner
// =================================================================
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <Loader2 
      className={cn('animate-spin text-primary', sizeClasses[size], className)} 
    />
  );
}

// =================================================================
// Loading Dots - Animated dots for text-like loading
// =================================================================
export function LoadingDots({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" />
    </span>
  );
}

// =================================================================
// Loading Pulse - Pulsing circle animation
// =================================================================
export function LoadingPulse({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <div className="absolute h-8 w-8 rounded-full bg-primary/20 animate-ping" />
      <div className="relative h-4 w-4 rounded-full bg-primary" />
    </div>
  );
}

// =================================================================
// Loading Bar - Animated progress bar (indeterminate)
// =================================================================
export function LoadingBar({ className }: { className?: string }) {
  return (
    <div className={cn('h-1 w-full overflow-hidden rounded-full bg-primary/20', className)}>
      <div 
        className="h-full w-1/3 rounded-full bg-primary animate-loading-bar"
        style={{
          animation: 'loading-bar 1.5s ease-in-out infinite',
        }}
      />
      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(200%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}

// =================================================================
// Page Loading Overlay - Full page loading state
// =================================================================
interface PageLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  blur?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function PageLoadingOverlay({
  isLoading,
  message = 'Loading...',
  blur = true,
  className,
  children,
}: PageLoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn('relative', className)}>
      {children && (
        <div className={cn(blur && 'blur-sm pointer-events-none')}>
          {children}
        </div>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-card shadow-lg border">
          <LoadingSpinner size="xl" />
          <p className="text-sm text-muted-foreground font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// Card Loading Skeleton - For card-based content
// =================================================================
interface CardLoadingSkeletonProps {
  className?: string;
  rows?: number;
  showHeader?: boolean;
  showChart?: boolean;
}

export function CardLoadingSkeleton({
  className,
  rows = 3,
  showHeader = true,
  showChart = false,
}: CardLoadingSkeletonProps) {
  return (
    <div className={cn('p-6 space-y-4 rounded-xl border bg-card', className)}>
      {showHeader && (
        <div className="space-y-2">
          <div className="h-5 w-1/3 rounded bg-muted animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-muted/70 animate-pulse" />
        </div>
      )}
      {showChart && (
        <div className="h-40 w-full rounded-lg bg-muted animate-pulse" />
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div 
            key={i} 
            className="h-4 rounded bg-muted animate-pulse"
            style={{ 
              width: `${Math.random() * 40 + 60}%`,
              animationDelay: `${i * 100}ms` 
            }}
          />
        ))}
      </div>
    </div>
  );
}

// =================================================================
// Data Fetching Overlay - Compact overlay for data fetching
// =================================================================
interface DataFetchingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
  showSpinner?: boolean;
  minHeight?: string;
}

export function DataFetchingOverlay({
  isLoading,
  children,
  message = 'Fetching data...',
  className,
  showSpinner = true,
  minHeight = '200px',
}: DataFetchingOverlayProps) {
  return (
    <div className={cn('relative', className)} style={{ minHeight: isLoading ? minHeight : undefined }}>
      {isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          {showSpinner && <LoadingSpinner size="lg" />}
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// =================================================================
// Refresh Button with Loading State
// =================================================================
interface RefreshButtonProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  className?: string;
}

export function RefreshButton({ isRefreshing, onRefresh, className }: RefreshButtonProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium',
        'border bg-background hover:bg-accent transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </button>
  );
}

// =================================================================
// Page Content Loader - Full page skeleton for dashboard pages
// =================================================================
export function PageContentLoader() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-1/4 rounded-lg bg-muted" />
        <div className="h-4 w-1/3 rounded bg-muted/70" />
      </div>

      {/* Stats cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl border bg-card p-4 space-y-3">
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-6 w-2/3 rounded bg-muted" />
            <div className="h-3 w-1/3 rounded bg-muted/70" />
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-xl border bg-card p-4">
          <div className="h-full bg-muted/50 rounded-lg" />
        </div>
        <div className="h-80 rounded-xl border bg-card p-4">
          <div className="h-full bg-muted/50 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// =================================================================
// Inline Loading - For loading within content
// =================================================================
interface InlineLoadingProps {
  message?: string;
  className?: string;
}

export function InlineLoading({ message = 'Loading', className }: InlineLoadingProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-muted-foreground', className)}>
      <LoadingSpinner size="sm" />
      <span className="text-sm">{message}</span>
      <LoadingDots className="text-muted-foreground" />
    </span>
  );
}
