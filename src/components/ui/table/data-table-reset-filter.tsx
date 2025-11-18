'use client';

import { Button } from '@/components/ui/button';
import { Cross2Icon } from '@radix-ui/react-icons';
import * as React from 'react';

interface DataTableResetFilterProps {
  isFilterActive: boolean;
  onReset: () => void;
}

export function DataTableResetFilter({
  isFilterActive,
  onReset
}: DataTableResetFilterProps) {
  if (!isFilterActive) return null;

  return (
    <Button
      aria-label='Reset filters'
      variant='outline'
      size='sm'
      className='border-dashed'
      onClick={onReset}
    >
      <Cross2Icon className='mr-2 h-4 w-4' />
      Reset
    </Button>
  );
}
