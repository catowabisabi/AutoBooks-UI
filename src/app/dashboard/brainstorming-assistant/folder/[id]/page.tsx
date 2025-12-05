'use client';

import type React from 'react';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  Upload,
  Send,
  FileText,
  Brain,
  Plus,
  MessageSquare,
  Download,
  Trash2,
  Link,
  ImageIcon,
  Loader2,
  Globe,
  Lock,
  Users,
  MoreHorizontal
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface KnowledgeBaseItem {
  id: string;
  name: string;
  type: 'document' | 'image' | 'link' | 'text';
  size?: string;
  url?: string;
  content?: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  author?: string;
}

interface ChatConversation {
  id: string;
  name: string;
  type: 'private' | 'shared';
  messages: ChatMessage[];
  lastActivity: string;
  participants?: string[];
}

export default function FolderDetail() {
  const params = useParams();
  const router = useRouter();
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>([
    {
      id: '1',
      name: 'Security Framework.pdf',
      type: 'document',
      size: '2.4 MB',
      uploadedBy: 'Jonathan Freid',
      uploadedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Threat Analysis.docx',
      type: 'document',
      size: '1.8 MB',
      uploadedBy: 'Sarah Chen',
      uploadedAt: '2024-01-14'
    },
    {
      id: '3',
      name: 'Security Architecture Diagram',
      type: 'image',
      size: '1.2 MB',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '2024-01-13'
    },
    {
      id: '4',
      name: 'NIST Cybersecurity Framework',
      type: 'link',
      url: 'https://www.nist.gov/cyberframework',
      uploadedBy: 'Alice Brown',
      uploadedAt: '2024-01-12'
    }
  ]);

  const [conversations, setConversations] = useState<ChatConversation[]>([
    {
      id: '1',
      name: 'Security Analysis',
      type: 'private',
      lastActivity: '2 hours ago',
      messages: [
        {
          id: '1',
          type: 'assistant',
          content:
            "Hello! I'm ready to help you analyze your cybersecurity knowledge base. What would you like to explore?",
          timestamp: '10:00 AM'
        }
      ]
    },
    {
      id: '2',
      name: 'Team Discussion',
      type: 'shared',
      lastActivity: '1 day ago',
      participants: ['Jonathan Freid', 'Sarah Chen', 'Mike Johnson'],
      messages: [
        {
          id: '1',
          type: 'assistant',
          content:
            'Welcome to the teams discussion! How can I help with your collaborative analysis?',
          timestamp: '9:00 AM'
        }
      ]
    },
    {
      id: '3',
      name: 'Threat Assessment',
      type: 'private',
      lastActivity: '3 hours ago',
      messages: [
        {
          id: '1',
          type: 'assistant',
          content:
            "Let's analyze potential security threats based on your knowledge base.",
          timestamp: '8:00 AM'
        }
      ]
    }
  ]);

  const [activeConversation, setActiveConversation] = useState<string>('1');
  const [newMessage, setNewMessage] = useState('');
  const [isAddKnowledgeOpen, setIsAddKnowledgeOpen] = useState(false);
  const [newKnowledgeType, setNewKnowledgeType] = useState<
    'document' | 'image' | 'link' | 'text'
  >('document');
  const [newKnowledgeName, setNewKnowledgeName] = useState('');
  const [newKnowledgeUrl, setNewKnowledgeUrl] = useState('');
  const [newKnowledgeContent, setNewKnowledgeContent] = useState('');

  const currentConversation = conversations.find(
    (conv) => conv.id === activeConversation
  );
  const privateChats = conversations.filter((conv) => conv.type === 'private');
  const sharedChats = conversations.filter((conv) => conv.type === 'shared');

  const handleSendMessage = async () => {
    if (newMessage.trim() && currentConversation && !isLoading) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        author: 'You'
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation
            ? {
                ...conv,
                messages: [...conv.messages, userMessage],
                lastActivity: 'Just now'
              }
            : conv
        )
      );

      const messageToSend = newMessage;
      setNewMessage('');
      setIsLoading(true);

      try {
        // Build conversation history for AI context
        const conversationHistory = currentConversation.messages.map((msg) => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));
        conversationHistory.push({ role: 'user', content: messageToSend });

        // Add knowledge base context to the system
        const knowledgeContext = knowledgeBase.length > 0 
          ? `Knowledge base items: ${knowledgeBase.map(item => item.name).join(', ')}. ` 
          : '';
        
        const systemPrompt = `You are a brainstorming assistant helping with creative thinking and problem-solving. ${knowledgeContext}Provide insightful, actionable suggestions and help explore ideas thoroughly.`;

        const response = await aiApi.chatWithHistory(
          conversationHistory,
          'openai',
          { systemPrompt }
        );

        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.content || 'I apologize, I could not generate a response.',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversation
              ? {
                  ...conv,
                  messages: [...conv.messages, aiResponse]
                }
              : conv
          )
        );
      } catch (error) {
        console.error('AI response error:', error);
        // Fallback response on error
        const fallbackResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'I apologize, I encountered an issue. Let me try to help with your brainstorming. Could you provide more context about what you\'re trying to explore?',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversation
              ? {
                  ...conv,
                  messages: [...conv.messages, fallbackResponse]
                }
              : conv
          )
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const fileType = file.type.startsWith('image/') ? 'image' : 'document';
        const newItem: KnowledgeBaseItem = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: fileType,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadedBy: 'You',
          uploadedAt: new Date().toISOString().split('T')[0]
        };
        setKnowledgeBase((prev) => [...prev, newItem]);
      });
    }
  };

  const handleAddKnowledge = () => {
    if (newKnowledgeName) {
      const newItem: KnowledgeBaseItem = {
        id: Date.now().toString(),
        name: newKnowledgeName,
        type: newKnowledgeType,
        url: newKnowledgeType === 'link' ? newKnowledgeUrl : undefined,
        content: newKnowledgeType === 'text' ? newKnowledgeContent : undefined,
        uploadedBy: 'You',
        uploadedAt: new Date().toISOString().split('T')[0]
      };

      setKnowledgeBase((prev) => [...prev, newItem]);

      // Reset form
      setNewKnowledgeName('');
      setNewKnowledgeUrl('');
      setNewKnowledgeContent('');
      setNewKnowledgeType('document');
      setIsAddKnowledgeOpen(false);
    }
  };

  const createNewChat = (type: 'private' | 'shared') => {
    const newChat: ChatConversation = {
      id: Date.now().toString(),
      name: `New ${type} chat`,
      type,
      lastActivity: 'Just now',
      messages: [
        {
          id: '1',
          type: 'assistant',
          content: `Welcome to your new ${type} conversation! How can I help you today?`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      ],
      participants: type === 'shared' ? ['You'] : undefined
    };

    setConversations((prev) => [newChat, ...prev]);
    setActiveConversation(newChat.id);
  };

  const getKnowledgeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className='h-4 w-4 text-blue-600' />;
      case 'image':
        return <ImageIcon className='h-4 w-4 text-green-600' />;
      case 'link':
        return <Link className='h-4 w-4 text-purple-600' />;
      case 'text':
        return <FileText className='h-4 w-4 text-orange-600' />;
      default:
        return <FileText className='h-4 w-4 text-gray-600' />;
    }
  };

  const getKnowledgeColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'bg-blue-100';
      case 'image':
        return 'bg-green-100';
      case 'link':
        return 'bg-purple-100';
      case 'text':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className='flex flex-1 flex-col space-y-6'>
      <div>
        {/* Header */}
        <div className='mb-6'>
          <div className='mb-4 flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => router.back()}
              className='flex items-center gap-2'
            >
              <ArrowLeft className='h-4 w-4' />
              Back
            </Button>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800'>
              <Brain className='h-6 w-6 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                Cyber Security Strategy
              </h1>
              <p className='text-muted-foreground'>@cybersecurity</p>
            </div>
          </div>
          <p className='text-muted-foreground max-w-3xl'>
            Collaborative workspace for cybersecurity analysis with knowledge
            base and AI-powered insights
          </p>
        </div>

        <Tabs defaultValue='chat' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2'>
            <TabsTrigger value='chat' className='flex items-center gap-2'>
              <MessageSquare className='h-4 w-4' />
              Chat & Query
            </TabsTrigger>
            <TabsTrigger value='knowledge' className='flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Knowledge Base
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value='chat' className='space-y-6'>
            <div className='grid h-[700px] grid-cols-1 gap-6 lg:grid-cols-5'>
              {/* Chat Sidebar */}
              <div className='lg:col-span-1'>
                <Card className='@container/card flex h-full flex-col'>
                  <CardHeader className='flex-shrink-0 pb-3'>
                    <CardTitle className='text-lg'>Conversations</CardTitle>
                  </CardHeader>
                  <CardContent className='flex-1 overflow-hidden p-0'>
                    <ScrollArea className='h-full'>
                      <div className='space-y-4 px-4 pb-4'>
                        {/* Private Chats */}
                        <div>
                          <div className='mb-3 flex items-center justify-between'>
                            <h4 className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                              <Lock className='h-3 w-3' />
                              Private
                            </h4>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => createNewChat('private')}
                              className='h-6 w-6 p-0'
                            >
                              <Plus className='h-3 w-3' />
                            </Button>
                          </div>
                          <div className='space-y-1'>
                            {privateChats.map((chat) => (
                              <button
                                key={chat.id}
                                onClick={() => setActiveConversation(chat.id)}
                                className={`w-full rounded-lg p-3 text-left text-sm transition-all duration-200 ${
                                  activeConversation === chat.id
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'hover:bg-accent text-foreground'
                                }`}
                              >
                                <div className='mb-1 truncate font-medium'>
                                  {chat.name}
                                </div>
                                <div
                                  className={`text-xs ${
                                    activeConversation === chat.id
                                      ? 'text-gray-300'
                                      : 'text-gray-500'
                                  }}`}
                                >
                                  {chat.lastActivity}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Shared Chats */}
                        <div>
                          <div className='mb-3 flex items-center justify-between'>
                            <h4 className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                              <Users className='h-3 w-3' />
                              Shared
                            </h4>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => createNewChat('shared')}
                              className='h-6 w-6 p-0'
                            >
                              <Plus className='h-3 w-3' />
                            </Button>
                          </div>
                          <div className='space-y-1'>
                            {sharedChats.map((chat) => (
                              <button
                                key={chat.id}
                                onClick={() => setActiveConversation(chat.id)}
                                className={`w-full rounded-lg p-3 text-left text-sm transition-all duration-200 ${
                                  activeConversation === chat.id
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'hover:bg-accent text-foreground'
                                }`}
                              >
                                <div className='mb-1 truncate font-medium'>
                                  {chat.name}
                                </div>
                                <div
                                  className={`mb-1 text-xs ${
                                    activeConversation === chat.id
                                      ? 'text-gray-300'
                                      : 'text-gray-500'
                                  }}`}
                                >
                                  {chat.lastActivity}
                                </div>
                                {chat.participants && (
                                  <div
                                    className={`text-xs ${
                                      activeConversation === chat.id
                                        ? 'text-gray-400'
                                        : 'text-gray-400'
                                    }`}
                                  >
                                    {chat.participants.length} participants
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Chat Interface */}
              <div className='lg:col-span-3'>
                <Card className='@container/card flex h-full flex-col'>
                  <CardHeader className='flex-shrink-0 border-b'>
                    <CardTitle className='flex items-center justify-between'>
                      <span className='flex items-center gap-2'>
                        <Brain className='h-5 w-5' />
                        <span className='truncate'>
                          {currentConversation?.name}
                        </span>
                      </span>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant={
                            currentConversation?.type === 'private'
                              ? 'secondary'
                              : 'default'
                          }
                        >
                          {currentConversation?.type === 'private' ? (
                            <Lock className='mr-1 h-3 w-3' />
                          ) : (
                            <Users className='mr-1 h-3 w-3' />
                          )}
                          {currentConversation?.type}
                        </Badge>
                        <Button size='sm' variant='ghost'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription className='truncate'>
                      {currentConversation?.type === 'shared' &&
                      currentConversation.participants
                        ? `${currentConversation.participants.length} participants`
                        : 'Query your knowledge base and get AI-powered insights'}
                    </CardDescription>
                  </CardHeader>

                  {/* Messages Area */}
                  <CardContent className='flex flex-1 flex-col overflow-hidden p-0'>
                    <ScrollArea className='flex-1 px-6 py-4'>
                      <div className='space-y-4'>
                        {currentConversation?.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                message.type === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-accent text-accent-foreground border'
                              }`}
                            >
                              {message.author && (
                                <div
                                  className={`mb-2 text-xs font-medium ${
                                    message.type === 'user'
                                      ? 'text-primary-foreground/80'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {message.author}
                                </div>
                              )}
                              <div className='text-sm leading-relaxed break-words whitespace-pre-wrap'>
                                {message.content}
                              </div>
                              <div
                                className={`mt-2 text-xs ${
                                  message.type === 'user'
                                    ? 'text-primary-foreground/70'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {message.timestamp}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className='flex-shrink-0 border-t bg-background p-4'>
                      <div className='flex gap-3'>
                        <Input
                          placeholder='Ask about your knowledge base...'
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === 'Enter' && handleSendMessage()
                          }
                          className='flex-1 text-foreground'
                        />
                        <Button
                          onClick={handleSendMessage}
                          size='icon'
                          disabled={!newMessage.trim()}
                        >
                          <Send className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats and Suggestions */}
              <div className='space-y-4 lg:col-span-1'>
                <Card className='@container/card'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg'>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex items-center justify-between rounded-lg bg-blue-50 p-2'>
                      <span className='text-sm font-medium text-blue-900'>
                        Knowledge Items
                      </span>
                      <Badge
                        variant='secondary'
                        className='bg-blue-100 text-blue-800'
                      >
                        {knowledgeBase.length}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between rounded-lg bg-green-50 p-2'>
                      <span className='text-sm font-medium text-green-900'>
                        Private Chats
                      </span>
                      <Badge
                        variant='secondary'
                        className='bg-green-100 text-green-800'
                      >
                        {privateChats.length}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between rounded-lg bg-purple-50 p-2'>
                      <span className='text-sm font-medium text-purple-900'>
                        Shared Chats
                      </span>
                      <Badge
                        variant='secondary'
                        className='bg-purple-100 text-purple-800'
                      >
                        {sharedChats.length}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className='@container/card'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                      <Brain className='h-4 w-4' />
                      Suggested Queries
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <button
                      onClick={() =>
                        setNewMessage(
                          'What are the main security vulnerabilities in our current framework?'
                        )
                      }
                      className='group w-full rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-3 text-left transition-all duration-200 hover:from-blue-100 hover:to-blue-200'
                    >
                      <div className='mb-1 text-sm font-medium text-blue-900 group-hover:text-blue-800'>
                        Security Vulnerabilities
                      </div>
                      <div className='text-xs leading-relaxed text-blue-700'>
                        Analyze main security vulnerabilities in our framework
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        setNewMessage(
                          'How can we improve our security posture?'
                        )
                      }
                      className='group w-full rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-3 text-left transition-all duration-200 hover:from-green-100 hover:to-green-200'
                    >
                      <div className='mb-1 text-sm font-medium text-green-900 group-hover:text-green-800'>
                        Security Improvements
                      </div>
                      <div className='text-xs leading-relaxed text-green-700'>
                        Get recommendations for improving security posture
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        setNewMessage(
                          'Summarize key insights from uploaded documents'
                        )
                      }
                      className='group w-full rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 p-3 text-left transition-all duration-200 hover:from-purple-100 hover:to-purple-200'
                    >
                      <div className='mb-1 text-sm font-medium text-purple-900 group-hover:text-purple-800'>
                        Document Insights
                      </div>
                      <div className='text-xs leading-relaxed text-purple-700'>
                        Summarize key insights from your knowledge base
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        setNewMessage(
                          'What are the latest cybersecurity trends I should know about?'
                        )
                      }
                      className='group w-full rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 p-3 text-left transition-all duration-200 hover:from-orange-100 hover:to-orange-200'
                    >
                      <div className='mb-1 text-sm font-medium text-orange-900 group-hover:text-orange-800'>
                        Industry Trends
                      </div>
                      <div className='text-xs leading-relaxed text-orange-700'>
                        Explore latest cybersecurity trends and best practices
                      </div>
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value='knowledge' className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              <div className='lg:col-span-2'>
                <Card className='@container/card'>
                  <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                      <span className='flex items-center gap-2'>
                        <FileText className='h-5 w-5' />
                        Knowledge Base
                      </span>
                      <div className='flex gap-2'>
                        <Input
                          type='file'
                          multiple
                          onChange={handleFileUpload}
                          className='hidden'
                          id='file-upload'
                          accept='.pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.png,.jpg,.jpeg,.gif'
                        />
                        <Button
                          onClick={() =>
                            document.getElementById('file-upload')?.click()
                          }
                          size='sm'
                          variant='outline'
                          className='flex items-center gap-2'
                        >
                          <Upload className='h-4 w-4' />
                          Upload Files
                        </Button>
                        <Dialog
                          open={isAddKnowledgeOpen}
                          onOpenChange={setIsAddKnowledgeOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size='sm'
                              className='flex items-center gap-2'
                            >
                              <Plus className='h-4 w-4' />
                              Add Knowledge
                            </Button>
                          </DialogTrigger>
                          <DialogContent className='sm:max-w-[425px]'>
                            <DialogHeader>
                              <DialogTitle>Add Knowledge</DialogTitle>
                              <DialogDescription>
                                Add different types of knowledge to your base:
                                links, text notes, or other content.
                              </DialogDescription>
                            </DialogHeader>
                            <div className='grid gap-4 py-4'>
                              <div className='grid gap-2'>
                                <Label htmlFor='type'>Type</Label>
                                <Select
                                  value={newKnowledgeType}
                                  onValueChange={(value: any) =>
                                    setNewKnowledgeType(value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder='Select knowledge type' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='link'>
                                      Link/URL
                                    </SelectItem>
                                    <SelectItem value='text'>
                                      Text Note
                                    </SelectItem>
                                    <SelectItem value='document'>
                                      Document Reference
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className='grid gap-2'>
                                <Label htmlFor='name'>Name/Title</Label>
                                <Input
                                  id='name'
                                  placeholder='Enter a descriptive name'
                                  value={newKnowledgeName}
                                  onChange={(e) =>
                                    setNewKnowledgeName(e.target.value)
                                  }
                                />
                              </div>
                              {newKnowledgeType === 'link' && (
                                <div className='grid gap-2'>
                                  <Label htmlFor='url'>URL</Label>
                                  <Input
                                    id='url'
                                    placeholder='https://example.com'
                                    value={newKnowledgeUrl}
                                    onChange={(e) =>
                                      setNewKnowledgeUrl(e.target.value)
                                    }
                                  />
                                </div>
                              )}
                              {newKnowledgeType === 'text' && (
                                <div className='grid gap-2'>
                                  <Label htmlFor='content'>Content</Label>
                                  <Textarea
                                    id='content'
                                    placeholder='Enter your text content...'
                                    value={newKnowledgeContent}
                                    onChange={(e) =>
                                      setNewKnowledgeContent(e.target.value)
                                    }
                                    rows={4}
                                  />
                                </div>
                              )}
                            </div>
                            <DialogFooter>
                              <Button
                                variant='outline'
                                onClick={() => setIsAddKnowledgeOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleAddKnowledge}
                                disabled={!newKnowledgeName}
                              >
                                Add Knowledge
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      {knowledgeBase.map((item) => (
                        <div
                          key={item.id}
                          className='flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50'
                        >
                          <div className='flex items-center gap-3'>
                            <div
                              className={`p-2 ${getKnowledgeColor(item.type)} rounded`}
                            >
                              {getKnowledgeIcon(item.type)}
                            </div>
                            <div>
                              <div className='font-medium'>{item.name}</div>
                              <div className='text-sm text-gray-500'>
                                {item.size && `${item.size} • `}
                                {item.url && `${item.url} • `}
                                Uploaded by {item.uploadedBy} on{' '}
                                {item.uploadedAt}
                              </div>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Badge variant='outline' className='capitalize'>
                              {item.type}
                            </Badge>
                            {item.type === 'link' && (
                              <Button
                                size='icon'
                                variant='ghost'
                                onClick={() => window.open(item.url, '_blank')}
                              >
                                <Globe className='h-4 w-4' />
                              </Button>
                            )}
                            <Button size='icon' variant='ghost'>
                              <Download className='h-4 w-4' />
                            </Button>
                            <Button size='icon' variant='ghost'>
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className='@container/card'>
                  <CardHeader>
                    <CardTitle className='text-lg'>Knowledge Types</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3 text-sm'>
                    <div className='flex items-center gap-2 rounded bg-blue-50 p-2'>
                      <FileText className='h-4 w-4 text-blue-600' />
                      <span>Documents: PDF, DOC, TXT, MD</span>
                    </div>
                    <div className='flex items-center gap-2 rounded bg-green-50 p-2'>
                      <ImageIcon className='h-4 w-4 text-green-600' />
                      <span>Images: PNG, JPG, GIF</span>
                    </div>
                    <div className='flex items-center gap-2 rounded bg-purple-50 p-2'>
                      <Link className='h-4 w-4 text-purple-600' />
                      <span>Links: Websites, Resources</span>
                    </div>
                    <div className='flex items-center gap-2 rounded bg-orange-50 p-2'>
                      <FileText className='h-4 w-4 text-orange-600' />
                      <span>Text: Notes, Insights</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className='@container/card mt-4'>
                  <CardHeader>
                    <CardTitle className='text-lg'>Usage Tips</CardTitle>
                  </CardHeader>
                  <CardContent className='text-muted-foreground space-y-2 text-sm'>
                    <p>• Upload relevant documents and images</p>
                    <p>• Add links to external resources</p>
                    <p>• Create text notes for quick insights</p>
                    <p>• Use descriptive names for easy searching</p>
                    <p>• Organize by project or topic</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
