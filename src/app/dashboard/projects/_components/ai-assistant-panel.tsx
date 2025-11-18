'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconMessage, IconSend } from '@tabler/icons-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';

export default function AiAssistantPanel() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! How can I help you?'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add a user message
    setMessages([
      ...messages,
      { id: `user-${Date.now()}`, role: 'user', content: message }
    ]);

    // Clear input
    setMessage('');

    // Simulate AI response (in a real app, this would be an API call)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: `I received your question about "${message}". This is a placeholder response.`
        }
      ]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        className='fixed right-6 bottom-6 h-12 w-12 rounded-full shadow-lg'
        onClick={() => setIsChatOpen(true)}
      >
        <IconMessage className='h-5 w-5' />
      </Button>

      {/* Chat Panel (Sheet) */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent
          side='right'
          className='flex h-full w-[400px] flex-col p-0 sm:w-[540px]'
        >
          <SheetHeader className='border-border shrink-0 border-b p-4'>
            <SheetTitle>HR AI Assistant</SheetTitle>
            <SheetDescription>
              Ask questions or get insights about HR portal analytics.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className='flex-1 overflow-auto p-4'>
            <div className='flex flex-col gap-4'>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className='border-border mt-auto shrink-0 border-t p-4'>
            <div className='flex gap-2'>
              <Input
                placeholder='Ask a question...'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} size='icon'>
                <IconSend className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
