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
  IconMail,
  IconPhone,
  IconClock,
  IconId
} from '@tabler/icons-react';

// This should match the employee data structure in employee-list.tsx
interface EmployeeData {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  joinDate: string;
  imageUrl?: string;
}

// Sample employee data - this should be the same as in employee-list.tsx
const EMPLOYEES_DATA: EmployeeData[] = [
  {
    id: 'E001',
    name: 'John Smith',
    role: 'UI/UX Designer',
    department: 'Design',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    status: 'Active',
    joinDate: '2023-01-15'
  },
  {
    id: 'E002',
    name: 'Anika Dorwart',
    role: 'React Developer',
    department: 'Engineering',
    email: 'anika.dorwart@example.com',
    phone: '+1 (555) 234-5678',
    status: 'Active',
    joinDate: '2022-11-05'
  },
  {
    id: 'E003',
    name: 'Alfredo Saris',
    role: 'Graphic Designer',
    department: 'Design',
    email: 'alfredo.saris@example.com',
    phone: '+1 (555) 345-6789',
    status: 'Inactive',
    joinDate: '2023-03-20'
  },
  {
    id: 'E004',
    name: 'Priya Patel',
    role: 'Project Manager',
    department: 'Management',
    email: 'priya.patel@example.com',
    phone: '+1 (555) 456-7890',
    status: 'Active',
    joinDate: '2022-08-12'
  },
  {
    id: 'E005',
    name: 'Michael Johnson',
    role: 'Backend Developer',
    department: 'Engineering',
    email: 'michael.johnson@example.com',
    phone: '+1 (555) 567-8901',
    status: 'On Leave',
    joinDate: '2023-02-10'
  },
  {
    id: 'E006',
    name: 'Sarah Williams',
    role: 'HR Specialist',
    department: 'Human Resources',
    email: 'sarah.williams@example.com',
    phone: '+1 (555) 678-9012',
    status: 'Active',
    joinDate: '2022-10-18'
  },
  {
    id: 'E007',
    name: 'David Lee',
    role: 'DevOps Engineer',
    department: 'Engineering',
    email: 'david.lee@example.com',
    phone: '+1 (555) 789-0123',
    status: 'Active',
    joinDate: '2023-04-05'
  },
  {
    id: 'E008',
    name: 'Emma Garcia',
    role: 'Content Writer',
    department: 'Marketing',
    email: 'emma.garcia@example.com',
    phone: '+1 (555) 890-1234',
    status: 'Inactive',
    joinDate: '2022-12-15'
  },
  {
    id: 'E009',
    name: 'Raj Sharma',
    role: 'Data Scientist',
    department: 'Analytics',
    email: 'raj.sharma@example.com',
    phone: '+1 (555) 901-2345',
    status: 'Active',
    joinDate: '2023-05-20'
  },
  {
    id: 'E010',
    role: 'Frontend Developer',
    name: 'Sophia Chen',
    department: 'Engineering',
    email: 'sophia.chen@example.com',
    phone: '+1 (555) 012-3456',
    status: 'Active',
    joinDate: '2023-01-30'
  },
  {
    id: 'E011',
    name: 'Carlos Rodriguez',
    role: 'Sales Manager',
    department: 'Sales',
    email: 'carlos.rodriguez@example.com',
    phone: '+1 (555) 123-4567',
    status: 'Active',
    joinDate: '2022-09-15'
  },
  {
    id: 'E012',
    name: 'Aisha Khan',
    role: 'Marketing Specialist',
    department: 'Marketing',
    email: 'aisha.khan@example.com',
    phone: '+1 (555) 234-5678',
    status: 'On Leave',
    joinDate: '2023-02-28'
  },
  {
    id: 'E013',
    name: 'Tom Wilson',
    role: 'Product Manager',
    department: 'Product',
    email: 'tom.wilson@example.com',
    phone: '+1 (555) 345-6789',
    status: 'Active',
    joinDate: '2022-07-10'
  },
  {
    id: 'E014',
    name: 'Lakshmi Nair',
    role: 'QA Engineer',
    department: 'Engineering',
    email: 'lakshmi.nair@example.com',
    phone: '+1 (555) 456-7890',
    status: 'Active',
    joinDate: '2023-03-15'
  },
  {
    id: 'E015',
    name: 'James Brown',
    role: 'Financial Analyst',
    department: 'Finance',
    email: 'james.brown@example.com',
    phone: '+1 (555) 567-8901',
    status: 'Inactive',
    joinDate: '2022-11-20'
  },
  {
    id: 'E016',
    name: 'Nina Patel',
    role: 'Customer Support',
    department: 'Support',
    email: 'nina.patel@example.com',
    phone: '+1 (555) 678-9012',
    status: 'Active',
    joinDate: '2023-04-10'
  },
  {
    id: 'E017',
    name: 'Robert Kim',
    role: 'Systems Administrator',
    department: 'IT',
    email: 'robert.kim@example.com',
    phone: '+1 (555) 789-0123',
    status: 'Active',
    joinDate: '2022-10-05'
  },
  {
    id: 'E018',
    name: 'Elena Martinez',
    role: 'Content Strategist',
    department: 'Marketing',
    email: 'elena.martinez@example.com',
    phone: '+1 (555) 890-1234',
    status: 'On Leave',
    joinDate: '2023-01-25'
  },
  {
    id: 'E019',
    name: 'Ahmed Hassan',
    role: 'UX Researcher',
    department: 'Design',
    email: 'ahmed.hassan@example.com',
    phone: '+1 (555) 901-2345',
    status: 'Active',
    joinDate: '2022-12-01'
  },
  {
    id: 'E020',
    name: 'Grace Wong',
    role: 'HR Manager',
    department: 'Human Resources',
    email: 'grace.wong@example.com',
    phone: '+1 (555) 012-3456',
    status: 'Active',
    joinDate: '2022-08-30'
  },
  {
    id: 'E021',
    name: 'Daniel Taylor',
    role: 'Software Architect',
    department: 'Engineering',
    email: 'daniel.taylor@example.com',
    phone: '+1 (555) 123-4567',
    status: 'Active',
    joinDate: '2023-02-15'
  },
  {
    id: 'E022',
    name: 'Olivia Johnson',
    role: 'Social Media Manager',
    department: 'Marketing',
    email: 'olivia.johnson@example.com',
    phone: '+1 (555) 234-5678',
    status: 'Active',
    joinDate: '2022-09-22'
  },
  {
    id: 'E023',
    name: 'Hiroshi Tanaka',
    role: 'Mobile Developer',
    department: 'Engineering',
    email: 'hiroshi.tanaka@example.com',
    phone: '+1 (555) 345-6789',
    status: 'Inactive',
    joinDate: '2023-03-05'
  },
  {
    id: 'E024',
    name: 'Fatima Al-Farsi',
    role: 'Business Analyst',
    department: 'Analytics',
    email: 'fatima.alfarsi@example.com',
    phone: '+1 (555) 456-7890',
    status: 'Active',
    joinDate: '2022-11-10'
  },
  {
    id: 'E025',
    name: 'Lucas Silva',
    role: 'Technical Writer',
    department: 'Documentation',
    email: 'lucas.silva@example.com',
    phone: '+1 (555) 567-8901',
    status: 'Active',
    joinDate: '2023-05-01'
  }
];

// Function to get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Inactive':
      return 'bg-red-100 text-red-800';
    case 'On Leave':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface EmployeeViewProps {
  employeeId: string;
}

export default function EmployeeView({ employeeId }: EmployeeViewProps) {
  // Find the employee with the given ID
  const employee = useMemo(() => {
    return EMPLOYEES_DATA.find((emp) => emp.id === employeeId);
  }, [employeeId]);

  // If employee not found, show an error message
  if (!employee) {
    return (
      <div className='flex h-full flex-col items-center justify-center p-8'>
        <h2 className='mb-4 text-2xl font-bold'>Employee Not Found</h2>
        <p className='text-muted-foreground mb-6'>
          The employee you&#39;re looking for doesn&#39;t exist or has been
          removed.
        </p>
        <Button asChild>
          <Link href='/dashboard/hrms/employees'>
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
          <Link href='/dashboard/hrms/employees'>
            <IconArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
      </div>

      {/* Employee header */}
      <div className='mb-8 flex flex-col gap-6 md:flex-row'>
        <div className='flex-shrink-0'>
          <Avatar className='h-24 w-24'>
            {employee.imageUrl ? (
              <AvatarImage src={employee.imageUrl} alt={employee.name} />
            ) : (
              <AvatarFallback className='bg-primary/10 text-primary text-xl'>
                {employee.name
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
            <h1 className='text-3xl font-bold'>{employee.name}</h1>
            <Badge className={getStatusColor(employee.status)}>
              {employee.status}
            </Badge>
          </div>
          <p className='text-muted-foreground text-xl'>{employee.role}</p>
          <div className='mt-2 flex items-center'>
            <IconBriefcase className='text-primary/70 mr-2 h-4 w-4' />
            <span>{employee.department}</span>
          </div>
        </div>
      </div>

      {/* Employee details */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-start'>
              <IconMail className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Email</p>
                <p className='text-muted-foreground'>{employee.email}</p>
              </div>
            </div>
            <div className='flex items-start'>
              <IconPhone className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Phone</p>
                <p className='text-muted-foreground'>{employee.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Employment Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-start'>
              <IconId className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Employee ID</p>
                <p className='text-muted-foreground'>{employee.id}</p>
              </div>
            </div>
            <div className='flex items-start'>
              <IconCalendar className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Join Date</p>
                <p className='text-muted-foreground'>
                  {format(new Date(employee.joinDate), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div className='flex items-start'>
              <IconClock className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Employment Duration</p>
                <p className='text-muted-foreground'>
                  {format(new Date(employee.joinDate), "'Joined' MMMM yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional sections could be added here, such as:
      - Performance metrics
      - Current projects
      - Skills and qualifications
      - Employment history
      - etc. */}

      <div className='mt-8 flex justify-end gap-4'>
        <Button variant='outline'>Edit Profile</Button>
        <Button>Contact Employee</Button>
      </div>
    </div>
  );
}
