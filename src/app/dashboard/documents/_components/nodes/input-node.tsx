'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Database, File, Settings } from 'lucide-react';
import type { NodeData } from '@/lib/types';

interface InputNodeData extends NodeData {
  file?: File;
  fileName?: string;
  dataSource?: string;
}

export const InputNode = memo(
  ({ data, isConnectable }: NodeProps<InputNodeData>) => {
    return (
      <div className='bg-card dark:bg-card min-w-[180px] rounded-md border-2 border-blue-500 px-4 py-3 shadow-md'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500 dark:bg-blue-950 dark:text-blue-300'>
              <Database className='h-4 w-4' />
            </div>
            <div className='ml-2'>
              <div className='text-sm font-bold'>{data.label || 'Input'}</div>
              <div className='text-muted-foreground text-xs'>
                {data.description || 'Upload document file'}
              </div>
            </div>
          </div>
          <Settings className='h-3 w-3 text-gray-400' />
        </div>

        {/* File Status Display */}
        <div className='mt-2'>
          {data.file ? (
            <div className='rounded border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-950/20'>
              <div className='flex items-center'>
                <File className='mr-1 h-3 w-3 text-green-600 dark:text-green-400' />
                <div className='truncate text-xs text-green-800 dark:text-green-200'>
                  {data.fileName}
                </div>
              </div>
              <div className='mt-1 text-xs text-green-600 dark:text-green-400'>
                {data.file
                  ? (data.file.size / 1024 / 1024).toFixed(2) + ' MB'
                  : ''}
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
          type='source'
          position={Position.Bottom}
          isConnectable={isConnectable}
          className='h-3 w-3 bg-blue-500'
        />
      </div>
    );
  }
);

InputNode.displayName = 'InputNode';
