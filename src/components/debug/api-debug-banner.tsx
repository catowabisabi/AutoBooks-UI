'use client';

import { useEffect, useState } from 'react';
import { X, Server, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface ApiStatus {
  isConnected: boolean;
  responseTime?: number;
  error?: string;
}

/**
 * API Debug Banner - 顯示當前 API 連接狀態
 * 只在 development 模式下顯示
 */
export function ApiDebugBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ isConnected: false });
  const [isChecking, setIsChecking] = useState(true);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001';
  const authEndpoint = `${apiBaseUrl}/api/v1/auth/token/`;
  const healthEndpoint = `${apiBaseUrl}/api/v1/health/`;
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isDev) return;

    const checkApiConnection = async () => {
      setIsChecking(true);
      const startTime = Date.now();
      
      try {
        // Try health endpoint first, then fall back to a simple OPTIONS request
        const response = await fetch(healthEndpoint, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000),
        });
        
        const responseTime = Date.now() - startTime;
        
        if (response.ok || response.status === 401) {
          // 401 means the API is running but requires auth - that's fine
          setApiStatus({ isConnected: true, responseTime });
        } else {
          setApiStatus({ 
            isConnected: false, 
            error: `HTTP ${response.status}: ${response.statusText}` 
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setApiStatus({ 
          isConnected: false, 
          error: errorMessage.includes('fetch') ? 'Cannot connect to API server' : errorMessage 
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkApiConnection();
    
    // Re-check every 30 seconds
    const interval = setInterval(checkApiConnection, 30000);
    return () => clearInterval(interval);
  }, [isDev, healthEndpoint]);

  // Don't render in production
  if (!isDev) return null;

  // Allow user to dismiss
  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-md rounded-lg border shadow-lg p-4 text-sm font-mono ${
      apiStatus.isConnected 
        ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
        : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
    }`}>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        aria-label="Close debug banner"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 mb-2">
        <Server className="h-4 w-4" />
        <span className="font-bold">🔧 Debug Mode - API Connection</span>
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">API Base:</span>
          <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{apiBaseUrl}</code>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Auth Endpoint:</span>
          <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs break-all">/api/v1/auth/token/</code>
        </div>

        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          {isChecking ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              <span>Checking connection...</span>
            </>
          ) : apiStatus.isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-green-700 dark:text-green-400">
                Connected {apiStatus.responseTime && `(${apiStatus.responseTime}ms)`}
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-red-700 dark:text-red-400">
                Disconnected
              </span>
            </>
          )}
        </div>

        {apiStatus.error && (
          <div className="flex items-start gap-2 mt-2 p-2 bg-red-100 dark:bg-red-900 rounded">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 dark:text-red-300 break-all">{apiStatus.error}</span>
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-gray-500">
          <div>💡 Tips:</div>
          <ul className="list-disc list-inside ml-2 space-y-0.5">
            <li>Ensure API server is running on correct port</li>
            <li>Check .env.local NEXT_PUBLIC_API_BASE_URL</li>
            <li>Verify CORS settings on API server</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
