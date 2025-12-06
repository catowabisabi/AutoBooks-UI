'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { agentApi } from '@/features/ai-assistants/services';
import { Loader2, Send, Bot, User, Wrench, RotateCcw, Play } from 'lucide-react';
import { MarkdownDisplay } from '@/components/ui/markdown-display';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
}

export default function AgentAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'I am your Autonomous Agent. I can perform tasks, look up information, and help you manage your ERP system. How can I assist you today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response: any = await agentApi.chat(userMsg.content, sessionId);
      
      if (response.session_id) {
        setSessionId(response.session_id);
      }

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message || response.response || "Task completed.",
        timestamp: new Date(),
        toolsUsed: response.tools_used || [],
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to communicate with the agent.');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Error: Could not reach the agent. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col p-6 space-y-4 h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Autonomous Agent</h2>
          <p className="text-muted-foreground">
            An AI agent capable of performing complex tasks and using tools.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMessages([])}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Chat
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <CardContent className="flex-1 p-0 flex flex-col min-h-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {msg.role === 'system' ? <Wrench className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                  )}
                  
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : msg.role === 'system'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted'
                    }`}
                  >
                    <MarkdownDisplay content={msg.content} className={msg.role === 'user' ? 'text-primary-foreground' : ''} />
                    
                    {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs font-semibold mb-1 opacity-70">Tools Used:</p>
                        <div className="flex flex-wrap gap-1">
                          {msg.toolsUsed.map((tool, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] h-5">
                              <Wrench className="w-3 h-3 mr-1" />
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-1 text-[10px] opacity-50 text-right">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask the agent to perform a task..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
