'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconPlus, IconEdit, IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface Dashboard {
  id: string;
  name: string;
}

interface DashboardSidebarProps {
  dashboards: Dashboard[];
  currentDashboard: string;
  onDashboardSelect: (id: string) => void;
  onCreateDashboard: () => void;
  onRenameDashboard: (id: string, newName: string) => void;
}

export default function DashboardSidebar({
  dashboards,
  currentDashboard,
  onDashboardSelect,
  onCreateDashboard,
  onRenameDashboard
}: DashboardSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');

  const handleStartEdit = (dashboard: Dashboard) => {
    setEditingId(dashboard.id);
    setEditName(dashboard.name);
  };

  const handleSave = () => {
    if (editingId && editName.trim()) {
      onRenameDashboard(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className='border-border mr-4 w-[250px] overflow-y-auto border-r pr-2'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='font-medium'>Dashboards</h3>
        <Button onClick={onCreateDashboard} size='sm' variant='ghost'>
          <IconPlus className='h-4 w-4' />
        </Button>
      </div>

      <div className='space-y-1'>
        {dashboards.map((dashboard) => (
          <div
            key={dashboard.id}
            className={cn(
              'group flex items-center justify-between rounded-md p-2',
              currentDashboard === dashboard.id
                ? 'bg-muted'
                : 'hover:bg-muted/50'
            )}
          >
            {editingId === dashboard.id ? (
              <div className='flex w-full items-center gap-2'>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  className='h-7 text-sm'
                  autoFocus
                />
                <Button
                  size='icon'
                  variant='ghost'
                  className='h-7 w-7'
                  onClick={handleSave}
                >
                  <IconX className='h-4 w-4' />
                </Button>
              </div>
            ) : (
              <>
                <button
                  className='flex-1 truncate text-left text-sm font-medium'
                  onClick={() => onDashboardSelect(dashboard.id)}
                >
                  {dashboard.name}
                </button>
                <Button
                  size='icon'
                  variant='ghost'
                  className='h-7 w-7 opacity-0 group-hover:opacity-100'
                  onClick={() => handleStartEdit(dashboard)}
                >
                  <IconEdit className='h-3.5 w-3.5' />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
