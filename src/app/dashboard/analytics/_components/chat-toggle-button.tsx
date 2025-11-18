'use client';

import { IconMessage } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

interface ChatToggleButtonProps {
  onClick: () => void;
}

export default function ChatToggleButton({ onClick }: ChatToggleButtonProps) {
  return (
    <Button
      className='fixed right-6 bottom-6 z-50 h-12 w-12 rounded-full shadow-lg'
      onClick={onClick}
    >
      <IconMessage className='h-5 w-5' />
    </Button>
  );
}
