'use client';

import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Inbox,
  Archive,
  Clock,
  Flag,
  Trash2,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Plus,
  Mail,
  AlertCircle,
  PenSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import type { EmailAccount, EmailFolder } from '@/types/email';
import ComposeEmail from './compose-email';

interface SidebarProps {
  accounts: EmailAccount[];
  selectedFolder: EmailFolder;
  onSelectFolder: (folder: EmailFolder) => void;
  onToggleSidebar: () => void;
  onSendEmail?: (email: any) => void;
}

export default function Sidebar({
  accounts,
  selectedFolder,
  onSelectFolder,
  onToggleSidebar,
  onSendEmail
}: SidebarProps) {
  const [accountsOpen, setAccountsOpen] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const isMobile = useIsMobile();

  const folderItems = [
    { id: 'unified', label: 'Unified Inbox', icon: Inbox },
    { id: 'unread', label: 'Unread', icon: AlertCircle },
    { id: 'flagged', label: 'Flagged', icon: Flag },
    { id: 'snoozed', label: 'Snoozed', icon: Clock },
    { id: 'archived', label: 'Archived', icon: Archive },
    { id: 'trash', label: 'Trash', icon: Trash2 }
  ];

  return (
    <div className='bg-background/60 flex h-full w-64 flex-col backdrop-blur-md'>
      <div className='border-border/50 flex items-center justify-between border-b p-4'>
        <h1 className='text-xl font-semibold'>Mail</h1>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' onClick={onToggleSidebar}>
            {isMobile ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className='flex-1'>
        <div className='p-2'>
          <Button
            variant='default'
            className='mb-2 w-full justify-start'
            onClick={() => setComposeOpen(true)}
          >
            <PenSquare className='mr-2 h-4 w-4' />
            Compose
          </Button>

          {/* Main folders */}
          <div className='mb-4 space-y-1'>
            {folderItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={selectedFolder === item.id ? 'secondary' : 'ghost'}
                  className='w-full justify-start'
                  onClick={() => onSelectFolder(item.id as EmailFolder)}
                >
                  <Icon className='mr-2 h-4 w-4' />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Accounts */}
          <Collapsible
            open={accountsOpen}
            onOpenChange={setAccountsOpen}
            className='mb-4'
          >
            <CollapsibleTrigger asChild>
              <Button variant='ghost' className='w-full justify-between'>
                <span className='flex items-center'>
                  <Mail className='mr-2 h-4 w-4' />
                  Accounts
                </span>
                {accountsOpen ? (
                  <ChevronDown className='h-4 w-4' />
                ) : (
                  <ChevronRight className='h-4 w-4' />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className='space-y-1 pl-4'>
              {accounts.map((account) => (
                <Button
                  key={account.id}
                  variant={
                    selectedFolder === account.id ? 'secondary' : 'ghost'
                  }
                  className='w-full justify-start'
                  onClick={() => onSelectFolder(account.id as EmailFolder)}
                >
                  <span
                    className='mr-2 h-3 w-3 rounded-full'
                    style={{ backgroundColor: account.color }}
                  />
                  {account.name}
                </Button>
              ))}
              <Button
                variant='ghost'
                className='text-muted-foreground w-full justify-start'
              >
                <Plus className='mr-2 h-4 w-4' />
                Add Account
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      <div className='border-border/50 flex items-center justify-between border-t p-4'>
        <Button variant='ghost' size='icon'>
          <Settings className='h-5 w-5' />
        </Button>
      </div>

      {/* Compose Email Modal */}
      <ComposeEmail
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSend={onSendEmail}
      />
    </div>
  );
}
