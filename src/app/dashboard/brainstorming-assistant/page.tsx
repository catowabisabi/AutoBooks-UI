'use client';

import { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  MoreHorizontal,
  Settings,
  FolderOpen,
  Shield,
  TrendingUp,
  DollarSign,
  Scale,
  Users,
  CheckCircle,
  MessageSquare,
  FileText,
  Brain
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import React from 'react';

interface BrainstormingFolder {
  id: string;
  name: string;
  handle: string;
  description: string;
  icon: JSX.Element;
  iconBg: string;
  createdBy: {
    name: string;
    avatar?: string;
  };
  threadCount: number;
  documentCount: number;
  lastActivity: string;
}

export default function BrowseFolders() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'private' | 'shared'>('private');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAssistantName, setNewAssistantName] = useState('');
  const [newAssistantHandle, setNewAssistantHandle] = useState('');
  const [newAssistantDescription, setNewAssistantDescription] = useState('');
  const [newAssistantIcon, setNewAssistantIcon] = useState('brain');
  const [folders, setFolders] = useState<BrainstormingFolder[]>([
    {
      id: '1',
      name: 'Cyber Security Strategy',
      handle: '@cybersecurity',
      description:
        'Designed to proactively identify threats and safeguarding sensitive information through collaborative analysis.',
      icon: <Shield className='h-6 w-6 text-white' />,
      iconBg: 'bg-slate-800',
      createdBy: { name: 'Jonathan Freid' },
      threadCount: 2,
      documentCount: 15,
      lastActivity: '2 hours ago'
    },
    {
      id: '2',
      name: 'Marketing Campaign Ideas',
      handle: '@marketing',
      description:
        'Designed to provide guidance on marketing strategies, campaign development, and customer engagement optimization.',
      icon: <TrendingUp className='h-6 w-6 text-white' />,
      iconBg: 'bg-slate-800',
      createdBy: { name: 'Jonathan Freid' },
      threadCount: 2,
      documentCount: 23,
      lastActivity: '1 day ago'
    },
    {
      id: '3',
      name: 'Sales Process Optimization',
      handle: '@sales',
      description:
        'Designed to help manage sales processes and maximize customer engagement through data-driven insights.',
      icon: <DollarSign className='h-6 w-6 text-white' />,
      iconBg: 'bg-slate-800',
      createdBy: { name: 'Jonathan Freid' },
      threadCount: 2,
      documentCount: 18,
      lastActivity: '3 hours ago'
    },
    {
      id: '4',
      name: 'Legal Document Analysis',
      handle: '@legal',
      description:
        'Designed to support drafting and analyzing legal documents with comprehensive knowledge base integration.',
      icon: <Scale className='h-6 w-6 text-white' />,
      iconBg: 'bg-slate-800',
      createdBy: { name: 'Jonathan Freid' },
      threadCount: 2,
      documentCount: 31,
      lastActivity: '5 hours ago'
    },
    {
      id: '5',
      name: 'HR Policy Development',
      handle: '@hr',
      description:
        'Designed to provide guidance on HR policies, employee relations, and recruitment process optimization.',
      icon: <Users className='h-6 w-6 text-white' />,
      iconBg: 'bg-slate-800',
      createdBy: { name: 'Jonathan Freid' },
      threadCount: 2,
      documentCount: 12,
      lastActivity: '1 day ago'
    },
    {
      id: '6',
      name: 'Quality Assurance Standards',
      handle: '@quality',
      description:
        'Designed to ensure everything meets predefined standards and requirements through systematic evaluation.',
      icon: <CheckCircle className='h-6 w-6 text-white' />,
      iconBg: 'bg-slate-800',
      createdBy: { name: 'Jonathan Freid' },
      threadCount: 2,
      documentCount: 27,
      lastActivity: '6 hours ago'
    }
  ]);

  const filteredFolders = folders.filter(
    (folder) =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      folder.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFolderClick = (folderId: string) => {
    router.push(`/dashboard/brainstorming-assistant/folder/${folderId}`);
  };

  const iconOptions = [
    {
      value: 'brain',
      label: 'Brain',
      icon: <Brain className='h-6 w-6 text-white' />
    },
    {
      value: 'shield',
      label: 'Shield',
      icon: <Shield className='h-6 w-6 text-white' />
    },
    {
      value: 'trending',
      label: 'Trending',
      icon: <TrendingUp className='h-6 w-6 text-white' />
    },
    {
      value: 'dollar',
      label: 'Dollar',
      icon: <DollarSign className='h-6 w-6 text-white' />
    },
    {
      value: 'scale',
      label: 'Scale',
      icon: <Scale className='h-6 w-6 text-white' />
    },
    {
      value: 'users',
      label: 'Users',
      icon: <Users className='h-6 w-6 text-white' />
    },
    {
      value: 'check',
      label: 'Check',
      icon: <CheckCircle className='h-6 w-6 text-white' />
    }
  ];

  const handleCreateAssistant = () => {
    if (newAssistantName && newAssistantDescription) {
      const selectedIcon = iconOptions.find(
        (icon) => icon.value === newAssistantIcon
      );
      const newFolder: BrainstormingFolder = {
        id: Date.now().toString(),
        name: newAssistantName,
        handle:
          newAssistantHandle ||
          `@${newAssistantName.toLowerCase().replace(/\s+/g, '')}`,
        description: newAssistantDescription,
        icon: selectedIcon?.icon || <Brain className='h-6 w-6 text-white' />,
        iconBg: 'bg-slate-800',
        createdBy: { name: 'You' },
        threadCount: 0,
        documentCount: 0,
        lastActivity: 'Just created'
      };

      setFolders([newFolder, ...folders]);

      // Reset form
      setNewAssistantName('');
      setNewAssistantHandle('');
      setNewAssistantDescription('');
      setNewAssistantIcon('brain');
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className='flex flex-1 flex-col space-y-6'>
      {/* Welcome Header */}
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-2xl font-bold tracking-tight'>
          Hi, Welcome to Brainstorming Assistant 👋
        </h2>
      </div>

      {/* Stats Cards */}
      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Total Assistants</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {folders.length}
            </CardTitle>
            <Badge variant='outline' className='flex items-center gap-1'>
              <TrendingUp className='h-3.5 w-3.5' />
              +2 new
            </Badge>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              Growing collection <TrendingUp className='size-4' />
            </div>
            <div className='text-muted-foreground'>
              Create custom assistants for your needs
            </div>
          </CardFooter>
        </Card>
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Active Threads</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {folders.reduce((sum, folder) => sum + folder.threadCount, 0)}
            </CardTitle>
            <Badge variant='outline' className='flex items-center gap-1'>
              <TrendingUp className='h-3.5 w-3.5' />
              +5 active
            </Badge>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              Ongoing conversations <MessageSquare className='size-4' />
            </div>
            <div className='text-muted-foreground'>
              Collaborative brainstorming sessions
            </div>
          </CardFooter>
        </Card>
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Knowledge Base</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {folders.reduce((sum, folder) => sum + folder.documentCount, 0)}
            </CardTitle>
            <Badge variant='outline' className='flex items-center gap-1'>
              <TrendingUp className='h-3.5 w-3.5' />
              +12 docs
            </Badge>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              Growing knowledge base <FileText className='size-4' />
            </div>
            <div className='text-muted-foreground'>
              Documents and resources available
            </div>
          </CardFooter>
        </Card>
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Collaboration</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {activeTab === 'shared' ? 'Active' : 'Ready'}
            </CardTitle>
            <Badge variant='outline' className='flex items-center gap-1'>
              <TrendingUp className='h-3.5 w-3.5' />
              +3 users
            </Badge>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              Team collaboration <Users className='size-4' />
            </div>
            <div className='text-muted-foreground'>
              Share insights and ideas with your team
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 gap-6'>
        {/* Search and Controls */}
        <div className='flex items-center justify-between'>
          <div className='relative max-w-md flex-1'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
            <Input
              placeholder='Search assistant'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex rounded-lg border bg-background p-1'>
              <button
                onClick={() => setActiveTab('private')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'private'
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Private
              </button>
              <button
                onClick={() => setActiveTab('shared')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'shared'
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Shared
              </button>
            </div>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  Create Assistant
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Create New Assistant</DialogTitle>
                  <DialogDescription>
                    Create a new brainstorming assistant with custom knowledge
                    base and capabilities.
                  </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='name'>Assistant Name</Label>
                    <Input
                      id='name'
                      placeholder='e.g., Product Strategy Assistant'
                      value={newAssistantName}
                      onChange={(e) => setNewAssistantName(e.target.value)}
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='handle'>Handle (optional)</Label>
                    <Input
                      id='handle'
                      placeholder='@productstrategy'
                      value={newAssistantHandle}
                      onChange={(e) => setNewAssistantHandle(e.target.value)}
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='description'>Description</Label>
                    <Textarea
                      id='description'
                      placeholder='Describe what this assistant will help with...'
                      value={newAssistantDescription}
                      onChange={(e) =>
                        setNewAssistantDescription(e.target.value)
                      }
                      rows={3}
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='icon'>Icon</Label>
                    <Select
                      value={newAssistantIcon}
                      onValueChange={setNewAssistantIcon}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select an icon' />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className='flex items-center gap-2'>
                              <div className='flex h-6 w-6 items-center justify-center rounded bg-slate-800'>
                                {React.cloneElement(option.icon, {
                                  className: 'h-4 w-4 text-white'
                                })}
                              </div>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAssistant}
                    disabled={!newAssistantName || !newAssistantDescription}
                  >
                    Create Assistant
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Folders Grid */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {filteredFolders.map((folder) => (
            <Card
              key={folder.id}
              className='group cursor-pointer transition-shadow hover:shadow-md'
              onClick={() => handleFolderClick(folder.id)}
            >
              <CardContent className='p-6'>
                {/* Header with Icon and Actions */}
                <div className='mb-4 flex items-start justify-between'>
                  <div
                    className={`h-12 w-12 rounded-xl ${folder.iconBg} flex items-center justify-center`}
                  >
                    {folder.icon}
                  </div>
                  <div className='flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100'>
                    <Button size='sm' variant='outline' className='text-xs'>
                      <Settings className='mr-1 h-3 w-3' />
                      Customize
                    </Button>
                    <Button size='sm' variant='ghost'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                {/* Title and Handle */}
                <div className='mb-3'>
                  <h3 className='mb-1 font-semibold text-gray-900'>
                    {folder.name}
                  </h3>
                  <p className='text-sm text-gray-500'>{folder.handle}</p>
                </div>

                {/* Description */}
                <p className='mb-4 line-clamp-3 text-sm text-gray-600'>
                  {folder.description}
                </p>

                {/* Stats */}
                <div className='mb-4 flex items-center gap-4'>
                  <div className='flex items-center gap-1 text-xs text-gray-500'>
                    <MessageSquare className='h-3 w-3' />
                    {folder.threadCount} threads
                  </div>
                  <div className='flex items-center gap-1 text-xs text-gray-500'>
                    <FileText className='h-3 w-3' />
                    {folder.documentCount} docs
                  </div>
                </div>

                {/* Footer with User Info */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Avatar className='h-6 w-6'>
                      <AvatarImage
                        src={folder.createdBy.avatar || '/placeholder.svg'}
                      />
                      <AvatarFallback className='text-xs'>
                        {folder.createdBy.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className='text-xs text-gray-600'>
                      {folder.createdBy.name}
                    </span>
                  </div>
                  <span className='text-xs text-gray-500'>
                    {folder.lastActivity}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredFolders.length === 0 && (
          <div className='py-12 text-center'>
            <FolderOpen className='mx-auto mb-4 h-12 w-12 text-gray-400' />
            <h3 className='mb-2 text-lg font-medium text-gray-900'>
              No assistants found
            </h3>
            <p className='mb-4 text-gray-600'>
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Create your first assistant to get started'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Create Assistant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
