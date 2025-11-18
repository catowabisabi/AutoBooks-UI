'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import {
  X,
  Paperclip,
  Minus,
  ChevronDown,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  ImageIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { mockAccounts } from '@/lib/mock-data';

interface ComposeEmailProps {
  open: boolean;
  onClose: () => void;
  onSend?: (email: any) => void;
  replyTo?: {
    to: string;
    subject: string;
    content?: string;
  };
}

export default function ComposeEmail({
  open,
  onClose,
  onSend,
  replyTo
}: ComposeEmailProps) {
  const [minimized, setMinimized] = useState(false);
  const [to, setTo] = useState(replyTo?.to || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(
    replyTo?.subject ? `Re: ${replyTo.subject}` : ''
  );
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAccount, setSelectedAccount] = useState(mockAccounts[0]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    const email = {
      id: `email-${Date.now()}`,
      sender: {
        name: selectedAccount.name,
        email: selectedAccount.email
      },
      recipients: [
        ...(to ? [{ name: to, email: to }] : []),
        ...(cc ? [{ name: cc, email: cc }] : []),
        ...(bcc ? [{ name: bcc, email: bcc }] : [])
      ],
      subject,
      content,
      attachments: attachments.map((file) => ({
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        type: file.type,
        url: `/uploads/${file.name}`
      })),
      read: false,
      flagged: false,
      snoozed: false,
      archived: false,
      deleted: false,
      account: selectedAccount.id,
      date: new Date().toISOString()
    };

    if (onSend) onSend(email);

    setTo('');
    setCc('');
    setBcc('');
    setSubject('');
    setContent('');
    setAttachments([]);
    setSending(false);
    onClose();
  };

  const formatText = (style: string) => {
    switch (style) {
      case 'bold':
        setContent(content + '**bold text**');
        break;
      case 'italic':
        setContent(content + '*italic text*');
        break;
      case 'list':
        setContent(content + '\n- List item\n- List item\n- List item');
        break;
      case 'ordered-list':
        setContent(content + '\n1. List item\n2. List item\n3. List item');
        break;
      case 'link':
        setContent(content + '[link text](https://example.com)');
        break;
      default:
        break;
    }
  };

  if (minimized) {
    return (
      <div className='bg-background border-border fixed right-4 bottom-0 z-50 w-80 rounded-t-lg border shadow-lg'>
        <div
          className='border-border flex cursor-pointer items-center justify-between border-b p-3'
          onClick={() => setMinimized(false)}
        >
          <h3 className='truncate font-medium'>{subject || 'New Message'}</h3>
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6'
              onClick={(e) => {
                e.stopPropagation();
                setMinimized(false);
              }}
            >
              <Minus className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6'
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className='flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[700px]'>
          <DialogHeader className='border-border border-b p-4'>
            <div className='flex items-center justify-between'>
              <DialogTitle>Compose Email</DialogTitle>
              <div className='flex items-center gap-1'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setMinimized(true)}
                >
                  <Minus className='h-4 w-4' />
                </Button>
                <Button variant='ghost' size='icon' onClick={onClose}>
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className='flex flex-1 flex-col overflow-hidden'
          >
            <div className='flex-1 space-y-4 overflow-y-auto p-4'>
              {/* From account selector */}
              <div className='flex items-center gap-2'>
                <Label htmlFor='from' className='w-16'>
                  From
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='outline' className='w-full justify-start'>
                      <div className='flex items-center gap-2'>
                        <div
                          className='h-5 w-5 rounded-full'
                          style={{ backgroundColor: selectedAccount.color }}
                        />
                        <span>
                          {selectedAccount.name} &lt;{selectedAccount.email}&gt;
                        </span>
                      </div>
                      <ChevronDown className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-80 p-0'>
                    <div className='p-2'>
                      {mockAccounts.map((account) => (
                        <div
                          key={account.id}
                          className='hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md p-2'
                          onClick={() => setSelectedAccount(account)}
                        >
                          <div
                            className='h-5 w-5 rounded-full'
                            style={{ backgroundColor: account.color }}
                          />
                          <div>
                            <div className='font-medium'>{account.name}</div>
                            <div className='text-muted-foreground text-sm'>
                              {account.email}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* To field */}
              <div className='flex items-center gap-2'>
                <Label htmlFor='to' className='w-16'>
                  To
                </Label>
                <div className='flex flex-1 items-center gap-2'>
                  <Input
                    id='to'
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder='Recipients'
                    className='flex-1'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => setShowCcBcc(!showCcBcc)}
                    className='text-xs'
                  >
                    {showCcBcc ? 'Hide CC/BCC' : 'Show CC/BCC'}
                  </Button>
                </div>
              </div>

              {/* CC and BCC fields */}
              {showCcBcc && (
                <>
                  <div className='flex items-center gap-2'>
                    <Label htmlFor='cc' className='w-16'>
                      Cc
                    </Label>
                    <Input
                      id='cc'
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                      placeholder='Carbon copy recipients'
                    />
                  </div>
                  <div className='flex items-center gap-2'>
                    <Label htmlFor='bcc' className='w-16'>
                      Bcc
                    </Label>
                    <Input
                      id='bcc'
                      value={bcc}
                      onChange={(e) => setBcc(e.target.value)}
                      placeholder='Blind carbon copy recipients'
                    />
                  </div>
                </>
              )}

              {/* Subject field */}
              <div className='flex items-center gap-2'>
                <Label htmlFor='subject' className='w-16'>
                  Subject
                </Label>
                <Input
                  id='subject'
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder='Email subject'
                />
              </div>

              {/* Email content */}
              <div className='rounded-md border'>
                <div className='flex items-center gap-1 border-b p-1'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => formatText('bold')}
                        >
                          <Bold className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => formatText('italic')}
                        >
                          <Italic className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Italic</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => formatText('list')}
                        >
                          <List className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bullet List</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => formatText('ordered-list')}
                        >
                          <ListOrdered className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Numbered List</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => formatText('link')}
                        >
                          <Link className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Insert Link</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Insert Image</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder='Write your email here...'
                  className='min-h-[200px] resize-none rounded-none border-0'
                />
              </div>

              {/* Attachments */}
              {attachments.length > 0 && (
                <div className='rounded-md border p-3'>
                  <h4 className='mb-2 text-sm font-medium'>Attachments</h4>
                  <div className='flex flex-wrap gap-2'>
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className='bg-muted/50 flex items-center gap-2 rounded-md p-2 text-sm'
                      >
                        <span className='max-w-[150px] truncate'>
                          {file.name}
                        </span>
                        <span className='text-muted-foreground text-xs'>
                          ({Math.round(file.size / 1024)} KB)
                        </span>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6'
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className='h-3 w-3' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                type='file'
                ref={fileInputRef}
                onChange={handleFileSelect}
                className='hidden'
                multiple
              />
            </div>

            {/* Footer with actions */}
            <div className='border-border flex items-center justify-between border-t p-4'>
              <div className='flex items-center gap-2'>
                <Button type='submit' disabled={sending}>
                  {sending ? 'Sending...' : 'Send'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className='mr-2 h-4 w-4' />
                  Attach
                </Button>
              </div>
              <Button type='button' variant='ghost' onClick={onClose}>
                Discard
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
