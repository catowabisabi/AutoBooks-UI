'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Archive,
  Trash2,
  Clock,
  Reply,
  ReplyAll,
  Forward,
  MoreHorizontal,
  Download,
  Printer,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Email } from '@/types/email';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AvatarWithLogo } from './avatar-with-logo';
import ComposeEmail from './compose-email';
import { useToast } from '@/hooks/use-toast';

interface EmailDetailProps {
  email: Email;
  onClose: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onSnooze: (id: string, snoozeUntil: Date) => void;
}

export default function EmailDetail({
  email,
  onClose,
  onArchive,
  onDelete,
  onSnooze
}: EmailDetailProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const { toast } = useToast();

  // Helper function to determine which badges to show
  const getBadges = () => {
    const badges = [];

    if (email.account === 'work') {
      badges.push({ label: 'Work', variant: 'default' });
    }

    if (email.account === 'personal') {
      badges.push({ label: 'Personal', variant: 'secondary' });
    }

    if (email.flagged) {
      badges.push({ label: 'Important', variant: 'destructive' });
    }

    return badges;
  };

  // Handle sending reply
  const handleSendReply = () => {
    toast({
      title: 'Reply Sent',
      description: `Your reply to ${email.sender.name} has been sent.`
    });
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='border-border/50 flex items-center justify-between border-b p-4'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' onClick={onClose}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h2 className='truncate text-lg font-medium'>{email.subject}</h2>
            <div className='mt-1 flex gap-1.5'>
              {getBadges().map((badge, index) => (
                <Badge key={index} variant={badge.variant as any}>
                  {badge.label}
                </Badge>
              ))}
              {email.attachments && email.attachments.length > 0 && (
                <Badge variant='outline'>
                  {email.attachments.length} Attachment
                  {email.attachments.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' onClick={onArchive}>
            <Archive className='h-5 w-5' />
          </Button>
          <Button variant='ghost' size='icon' onClick={onDelete}>
            <Trash2 className='h-5 w-5' />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon'>
                <MoreHorizontal className='h-5 w-5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className='mr-2 h-4 w-4' />
                Print
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className='mr-2 h-4 w-4' />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className='mr-2 h-4 w-4' />
                Mark as important
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className='flex-1'>
        <div className='p-4'>
          <div className='mb-4 flex items-start justify-between'>
            <div className='flex items-start gap-3'>
              <AvatarWithLogo sender={email.sender} size='lg' />

              <div>
                <div className='font-medium'>{email.sender.name}</div>
                <div className='text-muted-foreground text-sm'>
                  {email.sender.email}
                </div>
                {email.sender.organization && (
                  <div className='text-muted-foreground text-sm'>
                    {email.sender.organization.name}
                  </div>
                )}
                <div className='text-muted-foreground mt-1 flex items-center gap-2 text-sm'>
                  <span>To: me</span>
                  <button
                    className='text-xs underline'
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 'Hide' : 'Show'} details
                  </button>
                </div>

                {showDetails && (
                  <div className='bg-muted/50 border-border/50 mt-2 rounded-md border p-2 text-sm'>
                    <div>
                      <strong>From:</strong> {email.sender.name} &lt;
                      {email.sender.email}&gt;
                    </div>
                    <div>
                      <strong>To:</strong> Your Name
                      &lt;your.email@example.com&gt;
                    </div>
                    <div>
                      <strong>Date:</strong> {formatDate(new Date(email.date))}
                    </div>
                    <div>
                      <strong>Subject:</strong> {email.subject}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='text-muted-foreground text-sm'>
              {formatDate(new Date(email.date))}
            </div>
          </div>

          <div className='prose prose-sm max-w-none'>
            {email.content.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}

            {email.attachments && email.attachments.length > 0 && (
              <div className='mt-6'>
                <h3 className='mb-2 text-sm font-medium'>
                  Attachments ({email.attachments.length})
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {email.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className='bg-muted/50 border-border/50 flex items-center gap-2 rounded-md border p-2'
                    >
                      <div className='text-sm'>
                        <div>{attachment.name}</div>
                        <div className='text-muted-foreground text-xs'>
                          {attachment.size}
                        </div>
                      </div>
                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                        <Download className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className='border-border/50 border-t p-4'>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            className='flex-1'
            onClick={() => setReplyOpen(true)}
          >
            <Reply className='mr-2 h-4 w-4' />
            Reply
          </Button>
          <Button variant='outline'>
            <ReplyAll className='h-4 w-4' />
          </Button>
          <Button variant='outline'>
            <Forward className='h-4 w-4' />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline'>
                <Clock className='h-4 w-4' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              <div className='p-2'>
                <div className='mb-2 font-medium'>Snooze until</div>
                <div className='space-y-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start'
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      tomorrow.setHours(9, 0, 0, 0);
                      onSnooze(email.id, tomorrow);
                    }}
                  >
                    Tomorrow morning
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start'
                    onClick={() => {
                      const nextWeek = new Date();
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      nextWeek.setHours(9, 0, 0, 0);
                      onSnooze(email.id, nextWeek);
                    }}
                  >
                    Next week
                  </Button>
                </div>
                <Calendar
                  mode='single'
                  selected={undefined}
                  onSelect={(date) => {
                    if (date) {
                      onSnooze(email.id, date);
                    }
                  }}
                  className='mt-2'
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Reply Modal */}
      <ComposeEmail
        open={replyOpen}
        onClose={() => setReplyOpen(false)}
        onSend={handleSendReply}
        replyTo={{
          to: email.sender.email,
          subject: email.subject,
          content: email.content
        }}
      />
    </div>
  );
}
