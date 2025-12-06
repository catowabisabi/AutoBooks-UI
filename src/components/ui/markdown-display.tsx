import React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownDisplayProps {
  content: string;
  className?: string;
}

/**
 * A simple component to display markdown-like content.
 * For full markdown support, please install 'react-markdown':
 * pnpm add react-markdown
 * 
 * Then replace this implementation with:
 * import ReactMarkdown from 'react-markdown';
 * return <ReactMarkdown className={cn("prose dark:prose-invert", className)}>{content}</ReactMarkdown>;
 */
export function MarkdownDisplay({ content, className }: MarkdownDisplayProps) {
  // Simple parser for basic formatting if needed, or just pre-wrap
  // For now, we use whitespace-pre-wrap to preserve formatting
  return (
    <div className={cn("whitespace-pre-wrap text-sm leading-relaxed overflow-x-auto max-w-full", className)}>
      {content}
    </div>
  );
}
