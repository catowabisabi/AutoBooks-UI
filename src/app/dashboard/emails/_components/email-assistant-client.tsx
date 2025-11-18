'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './sidebar';
import EmailList from './email-list';
import EmailDetail from './email-detail';
import type { Email, EmailAccount, EmailFolder } from '@/types/email';
import { mockAccounts } from '@/lib/mock-data';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui/resizable';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconMessage, IconSend } from '@tabler/icons-react';

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
  };
}

function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={`mb-4 flex max-w-[90%] flex-col ${
        message.role === 'user' ? 'ml-auto' : 'mr-auto'
      }`}
    >
      <div
        className={`rounded-lg p-3 ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <p>{message.content}</p>
      </div>
    </div>
  );
}

const initialMessages: ChatMessageProps['message'][] = [
  {
    id: '1',
    role: 'user',
    content: 'Can you help me draft a response to the meeting follow-up email?'
  },
  {
    id: '2',
    role: 'assistant',
    content:
      "I'd be happy to help you draft a response. What key points would you like to include in your reply?"
  }
];

export default function EmailAssistantClient() {
  const [selectedFolder, setSelectedFolder] = useState<EmailFolder>('unified');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [accounts] = useState<EmailAccount[]>(mockAccounts);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await fetch('http://localhost:8000/email-assistant/emails');
        const data = await res.json();
        setEmails(data);
      } catch (error) {
        toast({
          title: 'Error loading emails',
          description: 'Unable to fetch emails from the server'
        });
      }
    };

    fetchEmails();
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: newMessage
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');

    try {
      const res = await fetch('http://localhost:8000/email-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread: selectedEmail ? [selectedEmail] : [],
          query: userMessage.content
        })
      });

      const data = await res.json();
      const aiResponse: ChatMessageProps['message'] = {
        id: `ai-${Date.now()}`,
        role: data.role === 'user' ? 'user' : 'assistant',
        content: data.content
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content:
            "Sorry, I couldn't generate a response. Please try again later."
        }
      ]);
    }
  };

  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      if (email.deleted) return false;
      if (email.snoozed) return selectedFolder === 'snoozed';
      if (email.archived) return selectedFolder === 'archived';

      if (selectedFolder === 'unified')
        return !email.archived && !email.snoozed;
      if (selectedFolder === 'unread')
        return !email.read && !email.archived && !email.snoozed;
      if (selectedFolder === 'flagged')
        return email.flagged && !email.archived && !email.snoozed;

      return (
        email.account === selectedFolder && !email.archived && !email.snoozed
      );
    });
  }, [emails, selectedFolder]);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (!selectedEmail) {
      setDetailOpen(false);
    }
  }, [selectedEmail]);

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
    setEmails(
      emails.map((e) => (e.id === email.id ? { ...e, read: true } : e))
    );

    if (isMobile) {
      setDetailOpen(true);
    }
  };

  const handleSnoozeEmail = (emailId: string, snoozeUntil: Date) => {
    setEmails(
      emails.map((email) =>
        email.id === emailId ? { ...email, snoozed: true, snoozeUntil } : email
      )
    );
  };

  const handleArchiveEmail = (emailId: string) => {
    setEmails(
      emails.map((email) =>
        email.id === emailId ? { ...email, archived: true } : email
      )
    );
    if (selectedEmail?.id === emailId) setSelectedEmail(null);
  };

  const handleDeleteEmail = (emailId: string) => {
    setEmails(
      emails.map((email) =>
        email.id === emailId ? { ...email, deleted: true } : email
      )
    );
    if (selectedEmail?.id === emailId) setSelectedEmail(null);
  };

  const handleSendEmail = async (email: Email) => {
    try {
      const res = await fetch('http://localhost:8000/email-assistant/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email)
      });
      const result = await res.json();
      toast({
        title: 'Email Sent',
        description: result.message
      });
    } catch (error) {
      toast({
        title: 'Failed to send email',
        description: 'Something went wrong while sending the email.'
      });
    }
  };

  useEffect(() => {
    if (emails.length > 0 && !selectedEmail) {
      const firstVisibleEmail = filteredEmails[0];
      if (firstVisibleEmail) {
        setSelectedEmail(firstVisibleEmail);
        setEmails(
          emails.map((e) =>
            e.id === firstVisibleEmail.id ? { ...e, read: true } : e
          )
        );
      }
    }
  }, [emails, filteredEmails, selectedEmail]);

  return (
    <div className='flex h-screen w-full'>
      <div
        className={`${sidebarOpen ? 'block' : 'hidden'} border-border/50 bg-background/60 border-r backdrop-blur-md md:block`}
      >
        <Sidebar
          accounts={accounts}
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onSendEmail={handleSendEmail}
        />
      </div>

      {isMobile ? (
        <div className='flex-1'>
          {detailOpen && selectedEmail ? (
            <EmailDetail
              email={selectedEmail}
              onClose={() => setDetailOpen(false)}
              onArchive={() => handleArchiveEmail(selectedEmail.id)}
              onDelete={() => handleDeleteEmail(selectedEmail.id)}
              onSnooze={handleSnoozeEmail}
            />
          ) : (
            <EmailList
              emails={filteredEmails}
              selectedEmail={selectedEmail}
              onSelectEmail={handleEmailSelect}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              onArchiveEmail={handleArchiveEmail}
              onDeleteEmail={handleDeleteEmail}
              onSnoozeEmail={handleSnoozeEmail}
              selectedFolder={selectedFolder}
            />
          )}
        </div>
      ) : (
        <ResizablePanelGroup direction='horizontal' className='flex-1'>
          <ResizablePanel defaultSize={30} minSize={20}>
            <EmailList
              emails={filteredEmails}
              selectedEmail={selectedEmail}
              onSelectEmail={handleEmailSelect}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              onArchiveEmail={handleArchiveEmail}
              onDeleteEmail={handleDeleteEmail}
              onSnoozeEmail={handleSnoozeEmail}
              selectedFolder={selectedFolder}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={70}>
            {selectedEmail ? (
              <EmailDetail
                email={selectedEmail}
                onClose={() => setSelectedEmail(null)}
                onArchive={() => handleArchiveEmail(selectedEmail.id)}
                onDelete={() => handleDeleteEmail(selectedEmail.id)}
                onSnooze={handleSnoozeEmail}
              />
            ) : (
              <div className='text-muted-foreground flex h-full items-center justify-center'>
                <p>Select an email to view</p>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      <Button
        className='fixed right-6 bottom-6 h-12 w-12 rounded-full shadow-lg'
        onClick={() => setIsChatOpen(true)}
      >
        <IconMessage className='h-5 w-5' />
      </Button>

      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent
          side='right'
          className='flex h-full w-[400px] flex-col p-0 sm:w-[540px]'
        >
          <SheetHeader className='border-border shrink-0 border-b p-4'>
            <SheetTitle>Email Assistant</SheetTitle>
            <SheetDescription>Get help with your emails</SheetDescription>
          </SheetHeader>

          <ScrollArea className='flex-1 overflow-auto p-4'>
            <div className='flex flex-col'>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className='border-border mt-auto shrink-0 border-t p-4'>
            <div className='flex gap-2'>
              <Input
                placeholder='Type your message...'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} size='icon'>
                <IconSend className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
