'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { APPS_CONFIG } from '@/config/apps-config';
import { useApp } from '@/contexts/app-context';

export function AppSwitcher() {
  const router = useRouter();
  const { currentApp, getCurrentAppConfig } = useApp();
  const [open, setOpen] = React.useState(false);

  const handleAppSelect = (appId: string) => {
    router.push(`/dashboard/${appId}`);
    setOpen(false);
  };

  const currentAppConfig = getCurrentAppConfig();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='secondary'
          size='icon'
          className='size-8'
          aria-label='Switch apps'
        >
          <Grid3X3 className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-80'
        align='end'
        sideOffset={10}
        forceMount
      >
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm leading-none font-medium'>Switch Apps</p>
            <p className='text-muted-foreground text-xs leading-none'>
              Select an application to navigate to
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <div className='grid grid-cols-3 gap-3 p-2'>
            {APPS_CONFIG.map((app) => (
              <button
                key={app.id}
                onClick={() => handleAppSelect(app.id)}
                className={`hover:bg-muted focus:ring-ring flex flex-col items-center rounded-lg p-3 transition-colors focus:ring-2 focus:outline-none ${
                  currentApp === app.id ? 'bg-muted' : ''
                }`}
              >
                <div className='text-foreground mb-2 flex h-12 w-12 items-center justify-center text-2xl'>
                  {app.icon}
                </div>
                <span className='text-center text-xs font-medium'>
                  {app.name}
                </span>
              </button>
            ))}
          </div>
        </DropdownMenuGroup>
        {currentAppConfig && (
          <>
            <DropdownMenuSeparator />
            <div className='px-3 py-2'>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <div className='text-foreground flex h-5 w-5 items-center justify-center text-sm'>
                  {currentAppConfig.icon}
                </div>
                <span>Currently in {currentAppConfig.name}</span>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
