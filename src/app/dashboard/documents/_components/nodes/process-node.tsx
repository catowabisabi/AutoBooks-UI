'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Cog, Settings, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { NodeData } from '@/lib/types';

interface ProcessNodeData extends NodeData {
  query?: string;
  prompt?: string;
  status?: 'idle' | 'processing' | 'completed' | 'error';
}

export const ProcessNode = memo(
  ({ data, isConnectable }: NodeProps<ProcessNodeData>) => {
    const getStatusIcon = () => {
      switch (data.status) {
        case 'processing':
          return <Clock className='h-3 w-3 animate-spin text-yellow-500' />;
        case 'completed':
          return <CheckCircle className='h-3 w-3 text-green-500' />;
        case 'error':
          return <XCircle className='h-3 w-3 text-red-500' />;
        default:
          return <Settings className='h-3 w-3 text-gray-400' />;
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
          return 'border-orange-500';
      }
    };

    return (
      <div
        className={`bg-card dark:bg-card min-w-[200px] rounded-md border-2 ${getStatusColor()} px-4 py-3 shadow-md`}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-950 dark:text-orange-300'>
              <Cog className='h-4 w-4' />
            </div>
            <div className='ml-2'>
              <div className='text-sm font-bold'>{data.label || 'Process'}</div>
              <div className='text-muted-foreground text-xs'>
                {data.description || 'Configure query'}
              </div>
            </div>
          </div>
          {getStatusIcon()}
        </div>

        {/* Query Status Display */}
        <div className='mt-2'>
          {data.query || data.prompt ? (
            <div className='rounded border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-950/20'>
              <div className='mb-1 text-xs font-medium text-green-800 dark:text-green-200'>
                Query:
              </div>
              <div className='line-clamp-2 text-xs text-green-700 dark:text-green-300'>
                {data.query || data.prompt}
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

        {/* Processing status indicator */}
        {data.status && data.status !== 'idle' && (
          <div className='mt-2'>
            <div
              className={`rounded px-2 py-1 text-xs ${
                data.status === 'processing'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-200'
                  : data.status === 'completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-200'
              }`}
            >
              {data.status}
            </div>
          </div>
        )}

        <Handle
          type='target'
          position={Position.Top}
          isConnectable={isConnectable}
          className='h-3 w-3 bg-orange-500'
        />
        <Handle
          type='source'
          position={Position.Bottom}
          isConnectable={isConnectable}
          className='h-3 w-3 bg-orange-500'
        />
      </div>
    );
  }
);

ProcessNode.displayName = 'ProcessNode';
