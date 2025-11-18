import * as React from 'react';
import { Sparkles } from 'lucide-react';

export default function Logo() {
  return (
    <div className='flex items-center space-x-3'>
      <div className='flex items-center space-x-2'>
        <div className='flex items-baseline space-x-1'>
          <span className='text-foreground text-2xl font-bold tracking-tight'>
            Wise
          </span>
          <span className='text-primary text-2xl font-bold tracking-tight'>
            Matic
          </span>
        </div>
        <div className='from-primary/15 to-primary/10 text-primary border-primary/20 flex items-center rounded-full border bg-gradient-to-r px-3 py-1'>
          <span className='mr-1 text-sm font-semibold'>ERP.AI</span>
          <div className='flex items-center'>
            <Sparkles className='ml-1 h-3 w-3' />
          </div>
        </div>
      </div>
    </div>
  );
}
