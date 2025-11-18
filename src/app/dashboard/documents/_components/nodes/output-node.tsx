//src/app/dashboard/documents/_components/nodes/output-node.tsx
'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Monitor, CheckCircle, XCircle, Clock, Settings } from 'lucide-react';
import type { NodeData } from '@/lib/types';

interface OutputNodeData extends NodeData {
  result?: string | object;
  documentId?: string;
  queryType?: string;
  filename?: string;
  status?: 'idle' | 'processing' | 'completed' | 'error';
  error?: string;
  query_result?: string | object;
  queryResult?: string | object;
}

export const OutputNode = memo(
  ({ data, isConnectable }: NodeProps<OutputNodeData>) => {
    const getStatusIcon = () => {
      switch (data.status) {
        case 'processing':
          return <Clock className='h-4 w-4 animate-spin text-yellow-500' />;
        case 'completed':
          return <CheckCircle className='h-4 w-4 text-green-500' />;
        case 'error':
          return <XCircle className='h-4 w-4 text-red-500' />;
        default:
          return <Settings className='h-4 w-4 text-gray-400' />;
      }
    };

    const getStatusColor = () => {
      switch (data.status) {
        case 'processing':
          return 'border-yellow-500';
        case 'completed':
          return 'border-green-500';
        case 'error':
          return 'border-red-500';
        default:
          return 'border-purple-500';
      }
    };

    const getStatusText = () => {
      switch (data.status) {
        case 'processing':
          return 'Processing...';
        case 'completed':
          return 'Result ready';
        case 'error':
          return 'Error occurred';
        default:
          return 'Awaiting input';
      }
    };

    // Helper function to safely get response data
    const getResponseData = () => {
      return data.result || data.query_result || data.queryResult;
    };

    // Helper: type guard for table-like responses
    const hasTables = (v: unknown): v is { tables: any[] } =>
      typeof v === 'object' &&
      v !== null &&
      'tables' in v &&
      Array.isArray((v as any).tables);

    // Helper function to get display text for preview
    const getDisplayText = () => {
      const responseData = getResponseData();
      if (!responseData) return '';

      if (typeof responseData === 'string') {
        return responseData;
      }

      if (hasTables(responseData)) {
        // For table objects, return a summary
        return `Found ${responseData.tables.length} table(s)`;
      }

      if (typeof responseData === 'object') {
        // For other objects, return a summary
        return 'Structured data ready';
      }

      return String(responseData);
    };

    // Helper function to detect response type
    const detectResponseType = () => {
      const responseData = getResponseData();
      const queryType = data.queryType || data.query_type;

      if (!responseData) return 'NONE';

      // Check based on query type first
      if (queryType === 'TABLE_TO_EXCEL') return 'TABLE';
      if (queryType === 'TRANSLATE') return 'HTML';

      // Check if it's an object with tables
      if (hasTables(responseData)) {
        return 'TABLE';
      }

      // Check content type for strings
      if (typeof responseData === 'string') {
        if (
          responseData.includes('<html>') ||
          responseData.includes('<table>') ||
          responseData.includes('<h1>')
        ) {
          return 'HTML';
        }
        // Check for CSV-like content
        if (
          responseData.includes(',') &&
          responseData.includes('\n') &&
          responseData.split('\n').length > 2
        ) {
          return 'CSV';
        }
      }

      return 'TEXT';
    };

    const responseType = detectResponseType();
    const displayText = getDisplayText();
    const hasResponse = !!getResponseData();

    return (
      <div
        className={`bg-card dark:bg-card max-w-[300px] min-w-[250px] rounded-md border-2 ${getStatusColor()} px-4 py-3 shadow-md`}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-500 dark:bg-purple-950 dark:text-purple-300'>
              <Monitor className='h-4 w-4' />
            </div>
            <div className='ml-2'>
              <div className='text-sm font-bold'>{data.label || 'Output'}</div>
              <div className='text-muted-foreground text-xs'>
                {getStatusText()}
              </div>
            </div>
          </div>
          {getStatusIcon()}
        </div>

        {/* Document info */}
        {data.filename && (
          <div className='mt-2 text-xs text-gray-600 dark:text-gray-400'>
            <div>File: {data.filename}</div>
            {(data.queryType || data.query_type) && (
              <div>Type: {data.queryType || data.query_type}</div>
            )}
          </div>
        )}

        {/* Result Preview */}
        <div className='mt-2'>
          {data.status === 'error' && data.error ? (
            <div className='rounded border border-red-200 bg-red-50 p-2 dark:border-red-800 dark:bg-red-950/20'>
              <div className='flex items-start'>
                <XCircle className='mt-0.5 mr-1 h-3 w-3 flex-shrink-0 text-red-500' />
                <div className='line-clamp-2 text-xs text-red-700 dark:text-red-300'>
                  {data.error}
                </div>
              </div>
            </div>
          ) : hasResponse ? (
            <div className='rounded border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-950/20'>
              <div className='flex items-start'>
                <CheckCircle className='mt-0.5 mr-1 h-3 w-3 flex-shrink-0 text-green-500' />
                <div className='flex-1'>
                  <div className='line-clamp-3 text-xs text-green-700 dark:text-green-300'>
                    {displayText}
                  </div>
                  {responseType !== 'TEXT' && (
                    <div className='mt-1 text-xs font-medium text-green-600 dark:text-green-400'>
                      {responseType} • Click to view
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : data.status === 'processing' ? (
            <div className='rounded border border-yellow-200 bg-yellow-50 p-2 dark:border-yellow-800 dark:bg-yellow-950/20'>
              <div className='flex items-center'>
                <Clock className='mr-1 h-3 w-3 animate-pulse text-yellow-500' />
                <div className='text-xs text-yellow-700 dark:text-yellow-300'>
                  Processing...
                </div>
              </div>
            </div>
          ) : (
            <div className='rounded border border-dashed border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800'>
              <div className='text-center text-xs text-gray-500 dark:text-gray-400'>
                Click to configure
              </div>
            </div>
          )}
        </div>

        <Handle
          type='target'
          position={Position.Top}
          isConnectable={isConnectable}
          className='h-3 w-3 bg-purple-500'
        />
      </div>
    );
  }
);

OutputNode.displayName = 'OutputNode';
