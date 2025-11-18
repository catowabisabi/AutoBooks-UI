'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  IconArrowLeft,
  IconBriefcase,
  IconCalendar,
  IconMail,
  IconUsers,
  IconBuilding,
  IconUserCheck,
  IconCoin,
  IconMapPin
} from '@tabler/icons-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

// Department data structure
interface DepartmentData {
  id: string;
  name: string;
  description: string;
  headName: string;
  headEmail: string;
  employeeCount: number;
  status: 'Active' | 'Inactive' | 'Restructuring';
  createdDate: string;
  budget?: number;
  location?: string;
}

// Employee data structure for department members
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

// Sample department data - this should be the same as in department-list.tsx
const DEPARTMENTS_DATA: DepartmentData[] = [
  {
    id: 'D001',
    name: 'Engineering',
    description: 'Software development and technical operations',
    headName: 'Michael Johnson',
    headEmail: 'michael.johnson@example.com',
    employeeCount: 42,
    status: 'Active',
    createdDate: '2020-01-15',
    budget: 1500000,
    location: 'Floor 3, Building A'
  },
  {
    id: 'D002',
    name: 'Design',
    description: 'UI/UX and graphic design',
    headName: 'John Smith',
    headEmail: 'john.smith@example.com',
    employeeCount: 18,
    status: 'Active',
    createdDate: '2020-02-20',
    budget: 800000,
    location: 'Floor 2, Building B'
  },
  {
    id: 'D003',
    name: 'Marketing',
    description: 'Brand management and promotion',
    headName: 'Emma Garcia',
    headEmail: 'emma.garcia@example.com',
    employeeCount: 15,
    status: 'Active',
    createdDate: '2020-03-10',
    budget: 1200000,
    location: 'Floor 4, Building A'
  },
  {
    id: 'D004',
    name: 'Sales',
    description: 'Client acquisition and relationship management',
    headName: 'Carlos Rodriguez',
    headEmail: 'carlos.rodriguez@example.com',
    employeeCount: 25,
    status: 'Active',
    createdDate: '2020-01-30',
    budget: 2000000,
    location: 'Floor 1, Building C'
  },
  {
    id: 'D005',
    name: 'Human Resources',
    description: 'Employee management and recruitment',
    headName: 'Sarah Williams',
    headEmail: 'sarah.williams@example.com',
    employeeCount: 12,
    status: 'Active',
    createdDate: '2020-02-05',
    budget: 600000,
    location: 'Floor 2, Building A'
  },
  {
    id: 'D006',
    name: 'Finance',
    description: 'Budget management and financial operations',
    headName: 'James Brown',
    headEmail: 'james.brown@example.com',
    employeeCount: 10,
    status: 'Active',
    createdDate: '2020-03-15',
    budget: 500000,
    location: 'Floor 5, Building A'
  },
  {
    id: 'D007',
    name: 'Product',
    description: 'Product strategy and roadmap',
    headName: 'Tom Wilson',
    headEmail: 'tom.wilson@example.com',
    employeeCount: 8,
    status: 'Restructuring',
    createdDate: '2020-04-20',
    budget: 1000000,
    location: 'Floor 3, Building B'
  },
  {
    id: 'D008',
    name: 'Customer Support',
    description: 'Client assistance and issue resolution',
    headName: 'Nina Patel',
    headEmail: 'nina.patel@example.com',
    employeeCount: 20,
    status: 'Active',
    createdDate: '2020-05-10',
    budget: 700000,
    location: 'Floor 1, Building B'
  },
  {
    id: 'D009',
    name: 'IT Operations',
    description: 'Infrastructure and system administration',
    headName: 'Robert Kim',
    headEmail: 'robert.kim@example.com',
    employeeCount: 15,
    status: 'Active',
    createdDate: '2020-06-15',
    budget: 900000,
    location: 'Floor 4, Building B'
  },
  {
    id: 'D010',
    name: 'Research & Development',
    description: 'Innovation and new technology exploration',
    headName: 'Raj Sharma',
    headEmail: 'raj.sharma@example.com',
    employeeCount: 12,
    status: 'Active',
    createdDate: '2020-07-20',
    budget: 1800000,
    location: 'Floor 5, Building B'
  },
  {
    id: 'D011',
    name: 'Legal',
    description: 'Legal compliance and contract management',
    headName: 'Elena Martinez',
    headEmail: 'elena.martinez@example.com',
    employeeCount: 5,
    status: 'Active',
    createdDate: '2020-08-10',
    budget: 400000,
    location: 'Floor 6, Building A'
  },
  {
    id: 'D012',
    name: 'Quality Assurance',
    description: 'Product testing and quality control',
    headName: 'Lakshmi Nair',
    headEmail: 'lakshmi.nair@example.com',
    employeeCount: 14,
    status: 'Active',
    createdDate: '2020-09-15',
    budget: 650000,
    location: 'Floor 3, Building C'
  },
  {
    id: 'D013',
    name: 'Business Development',
    description: 'Strategic partnerships and growth opportunities',
    headName: 'Ahmed Hassan',
    headEmail: 'ahmed.hassan@example.com',
    employeeCount: 7,
    status: 'Restructuring',
    createdDate: '2020-10-20',
    budget: 900000,
    location: 'Floor 2, Building C'
  },
  {
    id: 'D014',
    name: 'Content',
    description: 'Content creation and management',
    headName: 'Olivia Johnson',
    headEmail: 'olivia.johnson@example.com',
    employeeCount: 9,
    status: 'Active',
    createdDate: '2020-11-10',
    budget: 500000,
    location: 'Floor 4, Building C'
  },
  {
    id: 'D015',
    name: 'Data Science',
    description: 'Data analysis and machine learning',
    headName: 'Daniel Taylor',
    headEmail: 'daniel.taylor@example.com',
    employeeCount: 11,
    status: 'Active',
    createdDate: '2020-12-15',
    budget: 1100000,
    location: 'Floor 5, Building C'
  },
  {
    id: 'D016',
    name: 'Public Relations',
    description: 'Media relations and public image management',
    headName: 'Grace Wong',
    headEmail: 'grace.wong@example.com',
    employeeCount: 6,
    status: 'Inactive',
    createdDate: '2021-01-20',
    budget: 400000,
    location: 'Floor 1, Building A'
  },
  {
    id: 'D017',
    name: 'Facilities',
    description: 'Office management and maintenance',
    headName: 'Hiroshi Tanaka',
    headEmail: 'hiroshi.tanaka@example.com',
    employeeCount: 8,
    status: 'Active',
    createdDate: '2021-02-10',
    budget: 300000,
    location: 'Floor 1, Building D'
  },
  {
    id: 'D018',
    name: 'Security',
    description: 'Physical and digital security management',
    headName: 'Fatima Al-Farsi',
    headEmail: 'fatima.alfarsi@example.com',
    employeeCount: 7,
    status: 'Active',
    createdDate: '2021-03-15',
    budget: 500000,
    location: 'Floor 2, Building D'
  }
];

// Sample employee data for department members
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
    id: 'E023',
    name: 'Hiroshi Tanaka',
    role: 'Mobile Developer',
    department: 'Engineering',
    email: 'hiroshi.tanaka@example.com',
    phone: '+1 (555) 345-6789',
    status: 'Inactive',
    joinDate: '2023-03-05'
  }
];

// Function to get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Inactive':
      return 'bg-red-100 text-red-800';
    case 'Restructuring':
      return 'bg-yellow-100 text-yellow-800';
    case 'On Leave':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface DepartmentViewProps {
  departmentId: string;
}

export default function DepartmentView({ departmentId }: DepartmentViewProps) {
  // Find the department with the given ID
  const department = useMemo(() => {
    return DEPARTMENTS_DATA.find((dept) => dept.id === departmentId);
  }, [departmentId]);

  // Get tasks in this department
  const departmentEmployees = useMemo(() => {
    if (!department) return [];
    return EMPLOYEES_DATA.filter((emp) => emp.department === department.name);
  }, [department]);

  // If department not found, show an error message
  if (!department) {
    return (
      <div className='flex h-full flex-col items-center justify-center p-8'>
        <h2 className='mb-4 text-2xl font-bold'>Department Not Found</h2>
        <p className='text-muted-foreground mb-6'>
          The department you&#39;re looking for doesn&#39;t exist or has been
          removed.
        </p>
        <Button asChild>
          <Link href='/dashboard/hrms/departments'>
            <IconArrowLeft className='mr-2 h-4 w-4' />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6'>
      {/* Back button and action buttons */}
      <div className='mb-6 flex items-center justify-between'>
        <Button variant='outline' asChild>
          <Link href='/dashboard/hrms/departments'>
            <IconArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div className='flex gap-4'>
          <Button variant='outline'>Edit Department</Button>
          <Button>Manage Members</Button>
        </div>
      </div>

      {/* Department header */}
      <div className='mb-8 flex flex-col gap-6 md:flex-row'>
        <div className='flex-shrink-0'>
          <div className='bg-primary/10 flex h-24 w-24 items-center justify-center rounded-full'>
            <IconBuilding className='text-primary h-12 w-12' />
          </div>
        </div>
        <div className='flex flex-col justify-center'>
          <div className='flex items-center gap-3'>
            <h1 className='text-3xl font-bold'>{department.name}</h1>
            <Badge className={getStatusColor(department.status)}>
              {department.status}
            </Badge>
          </div>
          <p className='text-muted-foreground text-xl'>
            {department.description}
          </p>
          <div className='mt-2 flex items-center'>
            <IconUserCheck className='text-primary/70 mr-2 h-4 w-4' />
            <span>Head: {department.headName}</span>
          </div>
        </div>
      </div>

      {/* Department details */}
      <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Department Information */}
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Department Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-start'>
              <IconUsers className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Employee Count</p>
                <p className='text-muted-foreground'>
                  {department.employeeCount} employees
                </p>
              </div>
            </div>
            <div className='flex items-start'>
              <IconCalendar className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Established</p>
                <p className='text-muted-foreground'>
                  {format(new Date(department.createdDate), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div className='flex items-start'>
              <IconMapPin className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Location</p>
                <p className='text-muted-foreground'>
                  {department.location || 'Not specified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Information */}
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Management Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-start'>
              <IconUserCheck className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Department Head</p>
                <p className='text-muted-foreground'>{department.headName}</p>
              </div>
            </div>
            <div className='flex items-start'>
              <IconMail className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Contact Email</p>
                <p className='text-muted-foreground'>{department.headEmail}</p>
              </div>
            </div>
            <div className='flex items-start'>
              <IconCoin className='text-primary/70 mt-0.5 mr-3 h-5 w-5' />
              <div>
                <p className='font-medium'>Annual Budget</p>
                <p className='text-muted-foreground'>
                  ${department.budget?.toLocaleString() || 'Not specified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Members */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='text-xl'>Department Members</CardTitle>
        </CardHeader>
        <CardContent>
          {departmentEmployees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-8 w-8'>
                          {employee.imageUrl ? (
                            <AvatarImage
                              src={employee.imageUrl}
                              alt={employee.name}
                            />
                          ) : (
                            <AvatarFallback className='bg-primary/10 text-primary text-xs'>
                              {employee.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className='font-medium'>{employee.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(employee.joinDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant='default' size='sm'>
                        <Link href={`/dashboard/hrms/employees/${employee.id}`}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className='text-muted-foreground py-4 text-center'>
              No employees found in this department.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
