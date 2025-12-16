'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Service status types
export type ServiceStatus = 'ok' | 'error' | 'degraded' | 'not_configured' | 'checking';

export interface ServiceHealth {
  status: ServiceStatus;
  message: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  services: {
    api: ServiceHealth;
    database: ServiceHealth;
    redis: ServiceHealth;
    cache: ServiceHealth;
  };
  version?: string;
  environment?: string;
}

export interface ConnectionState {
  isConnected: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
  healthData: HealthCheckResponse | null;
  apiBaseUrl: string;
}

interface ConnectionContextType extends ConnectionState {
  checkConnection: () => Promise<void>;
  dismissError: () => void;
}

const ConnectionContext = createContext<ConnectionContextType | null>(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001';

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectionState>({
    isConnected: true, // Assume connected initially to avoid flash
    isChecking: true,
    lastChecked: null,
    error: null,
    healthData: null,
    apiBaseUrl: API_BASE_URL,
  });

  const [isDismissed, setIsDismissed] = useState(false);

  const checkConnection = useCallback(async () => {
    setState(prev => ({ ...prev, isChecking: true }));

    try {
      // First try detailed health check
      const response = await fetch(`${API_BASE_URL}/api/v1/health/detailed/`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok || response.status === 503) {
        const data: HealthCheckResponse = await response.json();
        setState({
          isConnected: true,
          isChecking: false,
          lastChecked: new Date(),
          error: data.status === 'degraded' ? 'Some services are experiencing issues' : null,
          healthData: data,
          apiBaseUrl: API_BASE_URL,
        });
        setIsDismissed(false);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Try simple health check as fallback
      try {
        const simpleResponse = await fetch(`${API_BASE_URL}/api/v1/health/`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000),
        });

        if (simpleResponse.ok) {
          setState({
            isConnected: true,
            isChecking: false,
            lastChecked: new Date(),
            error: null,
            healthData: {
              status: 'ok',
              timestamp: new Date().toISOString(),
              services: {
                api: { status: 'ok', message: 'API connected' },
                database: { status: 'ok', message: 'Assumed OK' },
                redis: { status: 'not_configured', message: 'Not checked' },
                cache: { status: 'not_configured', message: 'Not checked' },
              },
            },
            apiBaseUrl: API_BASE_URL,
          });
          setIsDismissed(false);
          return;
        }
      } catch {
        // Both checks failed
      }

      const errorMessage = error instanceof Error 
        ? (error.message.includes('fetch') || error.message.includes('network') 
          ? `無法連接到 API 服務器 (${API_BASE_URL})` 
          : error.message)
        : 'Unknown connection error';

      setState({
        isConnected: false,
        isChecking: false,
        lastChecked: new Date(),
        error: errorMessage,
        healthData: null,
        apiBaseUrl: API_BASE_URL,
      });
      setIsDismissed(false);
    }
  }, []);

  const dismissError = useCallback(() => {
    setIsDismissed(true);
  }, []);

  // Initial check on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Periodic health checks every 30 seconds
  useEffect(() => {
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  // Re-check when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      checkConnection();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkConnection]);

  const contextValue: ConnectionContextType = {
    ...state,
    checkConnection,
    dismissError,
  };

  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
      {!isDismissed && <ConnectionStatusOverlay />}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}

// ============================================================================
// Connection Status Overlay Component
// ============================================================================

function ConnectionStatusOverlay() {
  const { isConnected, isChecking, error, healthData, apiBaseUrl, checkConnection, dismissError } = useConnection();

  // Don't show anything if connected and no errors
  if (isConnected && !error && healthData?.status === 'ok') {
    return null;
  }

  // Show loading state during initial check
  if (isChecking && !healthData) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="text-center p-8 max-w-md">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">正在連接服務器...</h2>
          <p className="text-muted-foreground text-sm">Connecting to {apiBaseUrl}</p>
        </div>
      </div>
    );
  }

  // Show disconnected state
  if (!isConnected) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="text-center p-8 max-w-lg bg-card border border-destructive/50 rounded-lg shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-destructive mb-2">無法連接到服務器</h1>
          <h2 className="text-lg text-muted-foreground mb-4">Unable to Connect to Server</h2>
          
          <div className="bg-muted/50 rounded-md p-4 mb-6 text-left">
            <p className="text-sm font-medium mb-2">錯誤詳情 / Error Details:</p>
            <p className="text-sm text-destructive font-mono break-all">{error}</p>
          </div>

          <div className="bg-muted/30 rounded-md p-4 mb-6 text-left text-sm">
            <p className="font-medium mb-2">🔧 可能的解決方案 / Possible Solutions:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>確認 API 服務器正在運行 (Check if API server is running)</li>
              <li>檢查網絡連接 (Check network connection)</li>
              <li>確認 API URL 配置正確: <code className="bg-muted px-1 rounded">{apiBaseUrl}</code></li>
              <li>檢查防火牆設置 (Check firewall settings)</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={checkConnection}
              disabled={isChecking}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {isChecking ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  重試中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  重試連接 / Retry
                </>
              )}
            </button>
            <button
              onClick={dismissError}
              className="px-6 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80"
            >
              繼續使用 / Continue Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show degraded state (partial service issues)
  if (healthData?.status === 'degraded') {
    const failedServices = Object.entries(healthData.services)
      .filter(([_, service]) => service.status === 'error')
      .map(([name, service]) => ({ name, ...service }));

    return (
      <div className="fixed top-0 left-0 right-0 z-[9998] bg-yellow-500/90 text-yellow-950 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span className="font-semibold">部分服務異常 / Service Degraded</span>
              <span className="mx-2">|</span>
              <span className="text-sm">
                {failedServices.map(s => `${s.name}: ${s.message}`).join(', ')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={checkConnection}
              disabled={isChecking}
              className="px-3 py-1 bg-yellow-600 text-yellow-50 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
            >
              {isChecking ? '檢查中...' : '重新檢查'}
            </button>
            <button
              onClick={dismissError}
              className="p-1 hover:bg-yellow-600/50 rounded"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default ConnectionProvider;
