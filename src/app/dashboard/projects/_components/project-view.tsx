'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  IconArrowLeft,
  IconBriefcase,
  IconCalendar,
  IconUser,
  IconId,
  IconUsers,
  IconFileDescription,
  IconChartBar
} from '@tabler/icons-react';

// Project data structure
interface ProjectData {
  id: string;
  name: string;
  client: string;
  category: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  startDate: string;
  endDate?: string;
  budget: number;
  manager: string;
  teamSize: number;
  imageUrl?: string;
}

// Sample project data
const PROJECTS_DATA: ProjectData[] = [
  {
    id: 'P001',
    name: 'Website Redesign',
    client: 'Acme Corp',
    category: 'Web Development',
    description: 'Complete redesign of corporate website with modern UI/UX',
    status: 'Active',
    startDate: '2023-03-15',
    endDate: '2023-08-30',
    budget: 45000,
    manager: 'John Smith',
    teamSize: 5
  },
  {
    id: 'P002',
    name: 'Mobile App Development',
    client: 'TechStart Inc',
    category: 'Mobile Apps',
    description: 'iOS and Android app for customer engagement',
    status: 'Active',
    startDate: '2023-02-10',
    endDate: '2023-09-15',
    budget: 75000,
    manager: 'Anika Dorwart',
    teamSize: 8
  },
  {
    id: 'P003',
    name: 'E-commerce Platform',
    client: 'Retail Solutions',
    category: 'Web Development',
    description: 'Full-featured online store with payment integration',
    status: 'Completed',
    startDate: '2022-11-05',
    endDate: '2023-04-20',
    budget: 60000,
    manager: 'Michael Johnson',
    teamSize: 6
  },
  {
    id: 'P004',
    name: 'CRM Integration',
    client: 'Global Services',
    category: 'Software Integration',
    description: 'Integration of CRM system with existing infrastructure',
    status: 'Active',
    startDate: '2023-05-01',
    endDate: '2023-10-15',
    budget: 35000,
    manager: 'Sarah Williams',
    teamSize: 4
  },
  {
    id: 'P005',
    name: 'Data Analytics Dashboard',
    client: 'Analytics Pro',
    category: 'Data Analysis',
    description: 'Interactive dashboard for business intelligence',
    status: 'On Hold',
    startDate: '2023-01-20',
    endDate: '2023-07-30',
    budget: 50000,
    manager: 'Raj Sharma',
    teamSize: 3
  }
];

// Function to get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Completed':
      return 'bg-blue-100 text-blue-800';
    case 'On Hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface ProjectViewProps {
  projectId: string;
}

export default function ProjectView({ projectId }: ProjectViewProps) {
  // Find the project with the given ID
  const project = useMemo(() => {
    return PROJECTS_DATA.find((proj) => proj.id === projectId);
  }, [projectId]);

  // If project not found, show an error message
  if (!project) {
    return (
      <div className='flex h-full flex-col items-center justify-center p-8'>
        <h2 className='mb-4 text-2xl font-bold'>Project Not Found</h2>
        <p className='text-muted-foreground mb-6'>
          The project you&#39;re looking for doesn&#39;t exist or has been
          removed.
        </p>
        <Button asChild>
          <Link href='/dashboard/projects'>
            <IconArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6'>
      {/* Back button */}
      <div className='mb-6'>
        <Button variant='outline' asChild>
          <Link href='/dashboard/projects'>
            <IconArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
      </div>

      {/* Project header */}
      <div className='mb-8 flex flex-col gap-6 md:flex-row'>
        <div className='flex-shrink-0'>
          <Avatar className='h-24 w-24'>
            {project.imageUrl ? (
              <AvatarImage src={project.imageUrl} alt={project.name} />
            ) : (
              <AvatarFallback className='bg-primary/10 text-primary text-xl'>
                {project.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        <div className='flex flex-col justify-center'>
          <div className='flex items-center gap-3'>
            <h1 className='text-3xl font-bold'>{project.name}</h1>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
          <p className='text-muted-foreground text-xl'>{project.client}</p>
          <div className='mt-2 flex items-center'>
            <IconBriefcase className='text-primary/70 mr-2 h-4 w-4' />
            <span>{project.category}</span>
          </div>
        </div>
      </div>

      {/* Project details */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Project Information */}
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Project Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-start'>
              <IconFileDescription className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Description</p>
                <p className='text-muted-foreground'>{project.description}</p>
              </div>
            </div>
            <div className='flex items-start'>
              <IconId className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Project ID</p>
                <p className='text-muted-foreground'>{project.id}</p>
              </div>
            </div>
            <div className='flex items-start'>
              <IconUser className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Project Manager</p>
                <p className='text-muted-foreground'>{project.manager}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Information */}
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Timeline & Budget</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-start'>
              <IconCalendar className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Start Date</p>
                <p className='text-muted-foreground'>
                  {format(new Date(project.startDate), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div className='flex items-start'>
              <IconCalendar className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>End Date</p>
                <p className='text-muted-foreground'>
                  {project.endDate
                    ? format(new Date(project.endDate), 'MMMM dd, yyyy')
                    : 'Not specified'}
                </p>
              </div>
            </div>
            <div className='flex items-start'>
              <IconChartBar className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Budget</p>
                <p className='text-muted-foreground'>
                  ${project.budget.toLocaleString()}
                </p>
              </div>
            </div>
            <div className='flex items-start'>
              <IconUsers className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Team Size</p>
                <p className='text-muted-foreground'>
                  {project.teamSize} members
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional sections could be added here, such as:
      - Project milestones
      - Team members
      - Tasks and progress
      - Documents and files
      - etc. */}

      <div className='mt-8 flex justify-end gap-4'>
        <Button variant='outline'>Edit Project</Button>
        <Button>View Tasks</Button>
      </div>
    </div>
  );
}
