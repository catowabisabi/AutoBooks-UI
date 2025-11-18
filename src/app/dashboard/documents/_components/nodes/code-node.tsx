'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Code } from 'lucide-react';
import type { NodeData } from '@/lib/types';

export const CodeNode = memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  return (
    <div className='bg-card dark:bg-card min-w-[150px] rounded-md border-2 border-gray-500 px-4 py-2 shadow-md'>
      <div className='flex items-center'>
        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'>
          <Code className='h-4 w-4' />
        </div>
        <div className='ml-2'>
          <div className='text-sm font-bold'>{data.label || 'Code'}</div>
          <div className='text-muted-foreground text-xs'>
            {data.description || 'Custom code execution'}
          </div>
        </div>
      </div>

      {data.codeLanguage && (
        <div className='bg-muted text-muted-foreground mt-2 rounded p-1 text-xs'>
          Language: {data.codeLanguage}
        </div>
      )}

      <Handle
        type='target'
        position={Position.Top}
        isConnectable={isConnectable}
        className='h-3 w-3 bg-gray-500'
      />
      <Handle
        type='source'
        position={Position.Bottom}
        isConnectable={isConnectable}
        className='h-3 w-3 bg-gray-500'
      />
    </div>
  );
});

CodeNode.displayName = 'CodeNode';
