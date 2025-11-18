'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

// Metadata needs to be in a separate layout file when using 'use client'

const projectPerformance = [
  { month: 'Jan', Development: 45, Design: 38 },
  { month: 'Feb', Development: 50, Design: 42 },
  { month: 'Mar', Development: 52, Design: 46 },
  { month: 'Apr', Development: 58, Design: 50 },
  { month: 'May', Development: 55, Design: 53 },
  { month: 'Jun', Development: 60, Design: 55 }
];

const projectDistribution = [
  { name: 'Web Development', value: 40 },
  { name: 'Mobile Apps', value: 25 },
  { name: 'UI/UX Design', value: 20 },
  { name: 'Data Analysis', value: 10 },
  { name: 'Infrastructure', value: 5 }
];

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#06b6d4', '#8b5cf6'];

export default function ProjectsHomePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className='flex flex-1 flex-col space-y-2'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-2xl font-bold tracking-tight'>
          Projects Overview 👋
        </h2>
      </div>

      {/*<Separator />*/}

      {/* Top Metrics */}
      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Active Projects</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              24
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconTrendingUp className='mr-1 size-4' />
                +2
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              2 new projects this month <IconTrendingUp className='size-4' />
            </div>
            <div className='text-muted-foreground'>Growing portfolio</div>
          </CardFooter>
        </Card>

        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Completed Projects</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              18
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconTrendingUp className='mr-1 size-4' />
                +3
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              3 completed this month <IconTrendingUp className='size-4' />
            </div>
            <div className='text-muted-foreground'>Ahead of schedule</div>
          </CardFooter>
        </Card>

        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Pending Tasks</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              42
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconTrendingDown className='mr-1 size-4' />
                -8
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              8 tasks completed yesterday{' '}
              <IconTrendingDown className='size-4' />
            </div>
            <div className='text-muted-foreground'>Good progress rate</div>
          </CardFooter>
        </Card>

        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Team Members</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              35
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconTrendingUp className='mr-1 size-4' />
                +2
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              2 new members this month <IconTrendingUp className='size-4' />
            </div>
            <div className='text-muted-foreground'>Team expanding</div>
          </CardFooter>
        </Card>
      </div>

      {/* Graphs */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='@container/card col-span-4'>
          <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
            <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
              <CardTitle>Project Performance</CardTitle>
              <CardDescription>
                <span className='hidden @[540px]/card:block'>
                  Performance metrics for the last 6 months
                </span>
                <span className='@[540px]/card:hidden'>Last 6 months</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className='h-[250px] px-2 pt-4 sm:px-6 sm:pt-6'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={projectPerformance}>
                <defs>
                  <linearGradient id='colorDesign' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id='colorDevelopment'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='5%' stopColor='#22c55e' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#22c55e' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey='month'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <Tooltip cursor={{ fill: 'var(--primary)', opacity: 0.1 }} />
                <Area
                  type='monotone'
                  dataKey='Design'
                  stroke='#3b82f6'
                  fillOpacity={1}
                  fill='url(#colorDesign)'
                />
                <Area
                  type='monotone'
                  dataKey='Development'
                  stroke='#22c55e'
                  fillOpacity={1}
                  fill='url(#colorDevelopment)'
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='@container/card col-span-3'>
          <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
            <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
              <CardTitle>Project Distribution</CardTitle>
              <CardDescription>
                <span>By category</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className='h-[250px] px-2 pt-4 sm:px-6 sm:pt-6'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={projectDistribution}
                  dataKey='value'
                  nameKey='name'
                  outerRadius={80}
                  label
                >
                  {projectDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lower Section */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
        {/* Project Status */}
        <Card className='@container/card col-span-2'>
          <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
            <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
              <CardTitle>Project Status</CardTitle>
              <CardDescription>
                <span>Active and completed projects</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 px-6 pt-4'>
            {[
              {
                name: 'Website Redesign',
                client: 'Acme Corp',
                status: 'Active'
              },
              {
                name: 'Mobile App Development',
                client: 'TechStart Inc',
                status: 'Active'
              },
              {
                name: 'E-commerce Platform',
                client: 'Retail Solutions',
                status: 'Completed'
              },
              {
                name: 'CRM Integration',
                client: 'Global Services',
                status: 'Active'
              }
            ].map((project, idx) => (
              <div key={idx} className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src='' />
                    <AvatarFallback>{project.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col text-sm'>
                    <span className='font-medium'>{project.name}</span>
                    <span className='text-muted-foreground text-xs'>
                      {project.client}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={project.status === 'Active' ? 'default' : 'outline'}
                >
                  {project.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className='@container/card col-span-2'>
          <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
            <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>
                <span>Next 7 days</span>
              </CardDescription>
            </div>
            <div className='flex items-center px-6 py-4'>
              <Button size='sm'>+ Add</Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 px-6 pt-4'>
            {[
              {
                title: 'UI Design Delivery',
                date: 'Jun 28, 2024',
                project: 'Website Redesign'
              },
              {
                title: 'Backend API Integration',
                date: 'Jun 30, 2024',
                project: 'Mobile App'
              },
              {
                title: 'Client Demo',
                date: 'Jul 2, 2024',
                project: 'CRM Integration'
              }
            ].map((deadline, idx) => (
              <div key={idx} className='flex flex-col space-y-1'>
                <div className='font-medium'>
                  {deadline.title} – {deadline.date}
                </div>
                <div className='text-muted-foreground text-xs'>
                  {deadline.project}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className='@container/card col-span-3'>
          <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
            <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                <span>Latest project updates</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 px-6 pt-4'>
            {[
              {
                name: 'Alex Johnson',
                action: 'Completed task: Homepage Design',
                time: '2 hours ago'
              },
              {
                name: 'Sarah Miller',
                action: 'Added new document to Mobile App project',
                time: '4 hours ago'
              },
              {
                name: 'David Chen',
                action: 'Commented on CRM Integration milestone',
                time: 'Yesterday'
              }
            ].map((activity, idx) => (
              <div key={idx} className='flex items-center gap-3'>
                <Avatar className='h-10 w-10'>
                  <AvatarImage src='' />
                  <AvatarFallback>{activity.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                  <span className='font-medium'>{activity.name}</span>
                  <span className='text-muted-foreground text-xs'>
                    {activity.action} – {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
