'use client';

import { Input } from '@/components/ui/input';
import * as React from 'react';

interface DataTableSearchProps {
  searchKey: string;
  searchQuery: string;
  setSearchQuery: (value: string | null) => void;
  setPage: (page: number) => void;
}

export function DataTableSearch({
  searchKey,
  searchQuery,
  setSearchQuery,
  setPage
}: DataTableSearchProps) {
  const [value, setValue] = React.useState(searchQuery || '');

  const handleSearch = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
    []
  );

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(value || null);
      setPage(1);
    }, 500);

    return () => clearTimeout(timeout);
  }, [value, setSearchQuery, setPage]);

  return (
    <div className='relative w-full sm:w-64'>
      <Input
        placeholder={`Search by ${searchKey}...`}
        value={value}
        onChange={handleSearch}
        className='h-8 w-full'
      />
    </div>
  );
}
