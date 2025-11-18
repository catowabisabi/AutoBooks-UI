'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';
import type { NodeData } from '@/lib/types';

export const ConditionalNode = memo(
  ({ data, isConnectable }: NodeProps<NodeData>) => {
    return (
      <div className='bg-card dark:bg-card min-w-[150px] rounded-md border-2 border-amber-500 px-4 py-2 shadow-md'>
        <div className='flex items-center'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-500 dark:bg-amber-950 dark:text-amber-300'>
            <GitBranch className='h-4 w-4' />
          </div>
          <div className='ml-2'>
            <div className='text-sm font-bold'>
              {data.label || 'Conditional'}
            </div>
            <div className='text-muted-foreground text-xs'>
              {data.description || 'Conditional branching'}
            </div>
          </div>
        </div>

        {data.condition && (
          <div className='bg-muted text-muted-foreground mt-2 rounded p-1 text-xs'>
            Condition: {data.condition}
          </div>
        )}

        <div className='mt-2 flex justify-between text-xs'>
          <div className='text-green-600 dark:text-green-400'>
            {data.trueLabel || 'Yes'}
          </div>
          <div className='text-red-600 dark:text-red-400'>
            {data.falseLabel || 'No'}
          </div>
        </div>

        <Handle
          type='target'
          position={Position.Top}
          isConnectable={isConnectable}
          className='h-3 w-3 bg-amber-500'
        />
        <Handle
          type='source'
          position={Position.Bottom}
          id='true'
          style={{ left: '25%' }}
          isConnectable={isConnectable}
          className='h-3 w-3 bg-green-500'
        />
        <Handle
          type='source'
          position={Position.Bottom}
          id='false'
          style={{ left: '75%' }}
          isConnectable={isConnectable}
          className='h-3 w-3 bg-red-500'
        />
      </div>
    );
  }
);

ConditionalNode.displayName = 'ConditionalNode';
