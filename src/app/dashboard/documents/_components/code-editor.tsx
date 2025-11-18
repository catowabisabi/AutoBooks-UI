'use client';
import { Textarea } from '@/components/ui/textarea';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
}

export default function CodeEditor({ value, onChange }: CodeEditorProps) {
  // In a real implementation, you would use a proper code editor like Monaco Editor
  // For this MVP, we'll use a simple textarea with some basic styling
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='h-64 font-mono text-sm whitespace-pre'
      spellCheck={false}
    />
  );
}
