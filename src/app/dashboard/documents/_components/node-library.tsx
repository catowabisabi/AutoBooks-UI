'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import {
  Database,
  FileOutput,
  GitBranch,
  Code,
  Settings,
  Mail,
  Filter,
  Workflow,
  Table
} from 'lucide-react';

const nodeTypes = [
  {
    type: 'input',
    label: 'Input',
    description: 'Data input node',
    icon: <Database className='mr-2 h-4 w-4' />
  },
  {
    type: 'output',
    label: 'Output',
    description: 'Data output node',
    icon: <FileOutput className='mr-2 h-4 w-4' />
  },
  {
    type: 'process',
    label: 'Process',
    description: 'Data processing node',
    icon: <Settings className='mr-2 h-4 w-4' />
  },
  {
    type: 'conditional',
    label: 'Conditional',
    description: 'Conditional branching',
    icon: <GitBranch className='mr-2 h-4 w-4' />
  },
  {
    type: 'code',
    label: 'Code',
    description: 'Custom code execution',
    icon: <Code className='mr-2 h-4 w-4' />
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Send email notification',
    icon: <Mail className='mr-2 h-4 w-4' />,
    disabled: true
  },
  {
    type: 'filter',
    label: 'Filter',
    description: 'Filter data',
    icon: <Filter className='mr-2 h-4 w-4' />,
    disabled: true
  },
  {
    type: 'workflow',
    label: 'Sub-workflow',
    description: 'Nested workflow',
    icon: <Workflow className='mr-2 h-4 w-4' />,
    disabled: true
  },
  {
    type: 'table',
    label: 'Table',
    description: 'Database table operation',
    icon: <Table className='mr-2 h-4 w-4' />,
    disabled: true
  }
];

export default function NodeLibrary() {
  const onDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    nodeType: string
  ) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className='flex flex-col gap-2'>
      {nodeTypes.map((node) => (
        <Button
          key={node.type}
          variant='outline'
          className={`justify-start text-left ${node.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          draggable={!node.disabled}
          onDragStart={(e) => onDragStart(e, node.type)}
          disabled={node.disabled}
        >
          {node.icon}
          <div className='flex flex-col items-start'>
            <span>{node.label}</span>
            <span className='text-muted-foreground text-xs'>
              {node.description}
            </span>
          </div>
        </Button>
      ))}
      <div className='text-muted-foreground mt-4 text-xs'>
        Drag and drop nodes onto the canvas to build your workflow
      </div>
    </div>
  );
}
