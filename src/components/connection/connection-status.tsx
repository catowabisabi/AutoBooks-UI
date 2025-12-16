'use client';

import { useConnection } from '@/contexts/connection-context';
import { AlertTriangle, RefreshCw, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  className?: string;
  showWhenConnected?: boolean;
}

/**
 * Inline connection status indicator
 * Can be used in page headers to show current connection status
 */
export function ConnectionStatus({ className, showWhenConnected = false }: ConnectionStatusProps) {
  const { isConnected, isChecking, healthData, checkConnection } = useConnection();

  if (isChecking) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>檢查連接中...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-destructive", className)}>
        <WifiOff className="h-4 w-4" />
        <span>API 連接失敗</span>
        <button 
          onClick={checkConnection}
          className="text-xs underline hover:no-underline"
        >
          重試
        </button>
      </div>
    );
  }

  if (healthData?.status === 'degraded') {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-yellow-600", className)}>
        <AlertCircle className="h-4 w-4" />
        <span>部分服務異常</span>
      </div>
    );
  }

  if (showWhenConnected) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-green-600", className)}>
        <CheckCircle className="h-4 w-4" />
        <span>已連接</span>
      </div>
    );
  }

  return null;
}

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wraps page content and shows error state when API is unavailable
 */
export function PageConnectionGuard({ children, fallback }: PageErrorBoundaryProps) {
  const { isConnected, isChecking, error, apiBaseUrl, checkConnection } = useConnection();

  // Show loading during initial check
  if (isChecking && !isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">正在連接服務器...</p>
      </div>
    );
  }

  // Show error state
  if (!isConnected) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          
          <h2 className="text-xl font-semibold mb-2">此頁面目前無法使用</h2>
          <p className="text-muted-foreground mb-4">
            無法連接到 API 服務器，請檢查網絡連接或稍後再試。
          </p>
          
          <div className="bg-muted rounded-md p-3 mb-4 text-sm text-left">
            <p className="font-medium mb-1">錯誤詳情:</p>
            <p className="text-destructive font-mono text-xs break-all">{error}</p>
            <p className="text-muted-foreground mt-2 text-xs">
              API: {apiBaseUrl}
            </p>
          </div>

          <button
            onClick={checkConnection}
            disabled={isChecking}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                重試中...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                重試連接
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Service status card for settings/admin pages
 */
export function ServiceStatusCard() {
  const { isConnected, healthData, lastChecked, checkConnection, isChecking, apiBaseUrl } = useConnection();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'degraded': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'not_configured': return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'degraded': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">系統服務狀態</h3>
        <button
          onClick={checkConnection}
          disabled={isChecking}
          className="text-sm text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
        >
          <RefreshCw className={cn("h-3 w-3", isChecking && "animate-spin")} />
          {isChecking ? '檢查中...' : '重新檢查'}
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">API 地址</span>
          <code className="text-xs bg-muted px-2 py-1 rounded">{apiBaseUrl}</code>
        </div>
        
        {lastChecked && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">上次檢查</span>
            <span>{lastChecked.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {!isConnected ? (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-center gap-2 text-destructive">
            <WifiOff className="h-4 w-4" />
            <span className="font-medium">無法連接到 API 服務器</span>
          </div>
        </div>
      ) : healthData ? (
        <div className="space-y-2">
          {Object.entries(healthData.services).map(([name, service]) => (
            <div 
              key={name}
              className={cn(
                "flex items-center justify-between p-2 rounded-md text-sm",
                getStatusColor(service.status)
              )}
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(service.status)}
                <span className="capitalize font-medium">{name}</span>
              </div>
              <span className="text-xs opacity-80">{service.message}</span>
            </div>
          ))}
        </div>
      ) : null}

      {healthData?.version && (
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground flex justify-between">
          <span>Version: {healthData.version}</span>
          <span>Environment: {healthData.environment}</span>
        </div>
      )}
    </div>
  );
}
