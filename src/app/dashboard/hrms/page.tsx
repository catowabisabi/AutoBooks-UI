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
import {
  AIAttritionRisk,
  AIBottleneckDetection
} from '@/components/ai/dashboard-ai-cards';
import { AIAssistantCard } from '@/components/ai/ai-assistant-card';

// Metadata needs to be in a separate layout file when using 'use client'

const teamPerformance = [
  { month: 'Jan', Design: 45, Dev: 48 },
  { month: 'Feb', Design: 50, Dev: 42 },
  { month: 'Mar', Design: 52, Dev: 46 },
  { month: 'Apr', Design: 58, Dev: 40 },
  { month: 'May', Design: 55, Dev: 50 },
  { month: 'Jun', Design: 60, Dev: 55 }
];

const employeeDistribution = [
  { name: 'Software Engineer', value: 50 },
  { name: 'UI/UX Designer', value: 28 },
  { name: 'Data Analyst', value: 25 },
  { name: 'Mobile Dev', value: 10 },
  { name: 'Project Manager', value: 7 }
];

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#06b6d4', '#8b5cf6'];

export default function HRMSHomePage() {
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
        <h2 className='text-2xl font-bold tracking-tight'>HRMS Overview 👋</h2>
      </div>

      {/*<Separator />*/}

      {/* Top Metrics */}
      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Total Present</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              99
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconTrendingUp className='mr-1 size-4' />
                +5%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              Higher than yesterday <IconTrendingUp className='size-4' />
            </div>
            <div className='text-muted-foreground'>Good attendance rate</div>
          </CardFooter>
        </Card>

        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Total Absent</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              15
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconTrendingDown className='mr-1 size-4' />
                -2%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              Lower than yesterday <IconTrendingDown className='size-4' />
            </div>
            <div className='text-muted-foreground'>Improving attendance</div>
          </CardFooter>
        </Card>

        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Total on Leave</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              6
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconTrendingUp className='mr-1 size-4' />
                +1
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              One more than yesterday <IconTrendingUp className='size-4' />
            </div>
            <div className='text-muted-foreground'>Within expected range</div>
          </CardFooter>
        </Card>

        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Total Employees</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              120
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
              3 new hires this month <IconTrendingUp className='size-4' />
            </div>
            <div className='text-muted-foreground'>Growing steadily</div>
          </CardFooter>
        </Card>
      </div>

      {/* Graphs */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='@container/card col-span-4'>
          <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
            <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
              <CardTitle>Team Performance</CardTitle>
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
              <AreaChart data={teamPerformance}>
                <defs>
                  <linearGradient id='colorDesign' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='colorDev' x1='0' y1='0' x2='0' y2='1'>
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
                  dataKey='Dev'
                  stroke='#22c55e'
                  fillOpacity={1}
                  fill='url(#colorDev)'
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='@container/card col-span-3'>
          <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
            <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
              <CardTitle>Employee Distribution</CardTitle>
              <CardDescription>
                <span>By department</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className='h-[250px] px-2 pt-4 sm:px-6 sm:pt-6'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={employeeDistribution}
                  dataKey='value'
                  nameKey='name'
                  outerRadius={80}
                  label
                >
                  {employeeDistribution.map((entry, index) => (
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
        {/* Employee Status */}
        <Card className='@container/card col-span-2'>
          <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
            <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
              <CardTitle>Employee Status</CardTitle>
              <CardDescription>
                <span>Active and inactive employees</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 px-6 pt-4'>
            {[
              { name: 'John Smith', role: 'UI/UX Designer', status: 'Active' },
              {
                name: 'Anika Dorwart',
                role: 'React Developer',
                status: 'Active'
              },
              {
                name: 'Alfredo Saris',
                role: 'Graphic Designer',
                status: 'Inactive'
              },
              {
                name: 'Jakob Gousie',
                role: 'Software Developer',
                status: 'Active'
              }
            ].map((emp, idx) => (
              <div key={idx} className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src='' />
                    <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col text-sm'>
                    <span className='font-medium'>{emp.name}</span>
                    <span className='text-muted-foreground text-xs'>
                      {emp.role}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={emp.status === 'Active' ? 'default' : 'outline'}
                >
                  {emp.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Meetings */}
        <Card className='@container/card col-span-2'>
          <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
            <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
              <CardTitle>Events & Meetings</CardTitle>
              <CardDescription>
                <span>Today&apos;s schedule</span>
              </CardDescription>
            </div>
            <div className='flex items-center px-6 py-4'>
              <Button size='sm'>+ Add</Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 px-6 pt-4'>
            {[
              {
                title: 'Marketing Meeting',
                time: '8:00 AM',
                location: 'Conference Room A'
              },
              {
                title: 'Dev Interview',
                time: '10:00 AM',
                location: 'Meeting Room B'
              },
              {
                title: 'Safety Training',
                time: '11:30 AM',
                location: 'Training Hall'
              }
            ].map((event, idx) => (
              <div key={idx} className='flex flex-col space-y-1'>
                <div className='font-medium'>
                  {event.title} – {event.time}
                </div>
                <div className='text-muted-foreground text-xs'>
                  {event.location}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Birthdays */}
        <Card className='@container/card col-span-3'>
          <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
            <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4'>
              <CardTitle>Birthdays This Month</CardTitle>
              <CardDescription>
                <span>Upcoming celebrations</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 px-6 pt-4'>
            {[
              {
                name: 'Madelyn Philips',
                role: 'Sr. UI/UX Designer',
                date: '12/08/2024'
              },
              {
                name: 'Ann Stanton',
                role: 'HR Manager',
                date: '20/08/2024'
              },
              {
                name: 'Terry Saris',
                role: 'Software Developer',
                date: '22/08/2024'
              }
            ].map((emp, idx) => (
              <div key={idx} className='flex items-center gap-3'>
                <Avatar className='h-10 w-10'>
                  <AvatarImage src='' />
                  <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                  <span className='font-medium'>{emp.name}</span>
                  <span className='text-muted-foreground text-xs'>
                    {emp.role} – {emp.date}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI-Powered HR Insights */}
      <div className='mt-6'>
        <h3 className='text-lg font-semibold mb-4'>🤖 AI-Powered HR Insights</h3>
        
        {/* Universal AI Assistant Card */}
        <div className='mb-4'>
          <AIAssistantCard
            module="hrms"
            title="HRMS AI Assistant"
            description="Analyze workforce data, predict attrition, and get HR insights"
            contextData={{
              totalPresent: 99,
              totalAbsent: 15,
              onLeave: 6,
              totalEmployees: 120,
              teamPerformance: teamPerformance,
              employeeDistribution: employeeDistribution,
            }}
            className="w-full"
          />
        </div>
        
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <AIAttritionRisk
            employees={[
              { id: '1', name: 'John Smith', department: 'Engineering', tenure: 3.5, performanceScore: 4.2, salaryCompetitiveness: 0.85, recentPromotion: true, leaveBalance: 10, overtimeHours: 5 },
              { id: '2', name: 'Sarah Johnson', department: 'Design', tenure: 1.2, performanceScore: 3.8, salaryCompetitiveness: 0.70, recentPromotion: false, leaveBalance: 5, overtimeHours: 20 },
              { id: '3', name: 'Mike Chen', department: 'Sales', tenure: 4.8, performanceScore: 4.5, salaryCompetitiveness: 0.90, recentPromotion: true, leaveBalance: 15, overtimeHours: 2 },
              { id: '4', name: 'Emily Davis', department: 'HR', tenure: 0.8, performanceScore: 3.2, salaryCompetitiveness: 0.60, recentPromotion: false, leaveBalance: 2, overtimeHours: 25 },
            ]}
          />
          <AIBottleneckDetection
            project={{
              id: 'team-capacity',
              name: 'Team Capacity Analysis',
              tasks: [
                { id: 't1', name: 'Recruitment Pipeline', status: 'in_progress', assignee: 'HR Team', priority: 'high', daysStalled: 3 },
                { id: 't2', name: 'Training Program', status: 'blocked', assignee: 'L&D Team', priority: 'medium', daysStalled: 7 },
                { id: 't3', name: 'Performance Reviews', status: 'completed', assignee: 'Managers', priority: 'high', daysStalled: 0 },
              ],
              dependencies: [
                { from: 't2', to: 't1' }
              ]
            }}
          />
        </div>
      </div>
    </div>
  );
}
