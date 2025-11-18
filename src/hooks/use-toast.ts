'use client';

import { toast as soonerToast } from 'sonner';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function useToast() {
  const toast = ({ title, description }: ToastProps) => {
    return soonerToast(title, {
      description
    });
  };

  return {
    toast
  };
}
