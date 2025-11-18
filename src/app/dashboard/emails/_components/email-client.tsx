'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from './sidebar';
import EmailList from './email-list';
import EmailDetail from './email-detail';
import type { Email, EmailAccount, EmailFolder } from '@/types/email';
import { mockEmails, mockAccounts } from '@/lib/mock-data';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui/resizable';

export default function EmailClient() {
  const [selectedFolder, setSelectedFolder] = useState<EmailFolder>('unified');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [accounts] = useState<EmailAccount[]>(mockAccounts);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const isMobile = useIsMobile();
  // Filter emails based on selected folder
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

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Close detail view when no email is selected
  useEffect(() => {
    if (!selectedEmail) {
      setDetailOpen(false);
    }
  }, [selectedEmail]);

  // Handle email selection
  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);

    // Mark as read
    setEmails(
      emails.map((e) => (e.id === email.id ? { ...e, read: true } : e))
    );

    // Open detail view on mobile
    if (isMobile) {
      setDetailOpen(true);
    }
  };

  // Handle email snooze
  const handleSnoozeEmail = (emailId: string, snoozeUntil: Date) => {
    setEmails(
      emails.map((email) =>
        email.id === emailId ? { ...email, snoozed: true, snoozeUntil } : email
      )
    );
  };

  // Handle email archive
  const handleArchiveEmail = (emailId: string) => {
    setEmails(
      emails.map((email) =>
        email.id === emailId ? { ...email, archived: true } : email
      )
    );

    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };

  // Handle email delete
  const handleDeleteEmail = (emailId: string) => {
    setEmails(
      emails.map((email) =>
        email.id === emailId ? { ...email, deleted: true } : email
      )
    );

    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };

  // Handle sending email
  const handleSendEmail = async (email: Email) => {
    try {
      const res = await fetch('http://localhost:8000/email-assistant/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email)
      });

      const result = await res.json();
      console.log('✅ Email sent:', result.message);
    } catch (err) {
      console.error('❌ Failed to send email:', err);
    }
  };

  // Select first email by default
  useEffect(() => {
    if (emails.length > 0 && !selectedEmail) {
      const firstVisibleEmail = filteredEmails[0];
      if (firstVisibleEmail) {
        setSelectedEmail(firstVisibleEmail);

        // Mark as read
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
      {/* Sidebar */}
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

      {/* Main Content with Resizable Panels */}
      {isMobile ? (
        // Mobile view - show either list or detail
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
        // Desktop view - resizable panels
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
    </div>
  );
}
