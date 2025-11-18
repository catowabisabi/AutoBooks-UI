'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import {
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconX,
  IconPlus,
  IconBriefcase,
  IconCalendar,
  IconMail,
  IconPhone
} from '@tabler/icons-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

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

// Sample employee data
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

type SortField = 'name' | 'role' | 'department' | 'status' | 'joinDate';
type SortOrder = 'asc' | 'desc';
type FilterOption = 'all' | 'active' | 'inactive' | 'onLeave' | 'department';

export default function GEmployeeList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Increased for list view
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  // Get unique departments for filtering
  const departments = useMemo(() => {
    const depts = new Set(EMPLOYEES_DATA.map((emp) => emp.department));
    return Array.from(depts);
  }, []);

  // Filter tasks based on the search query and filter option
  const filteredEmployees = useMemo(() => {
    let result = [...EMPLOYEES_DATA];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (employee) =>
          employee.name.toLowerCase().includes(query) ||
          employee.role.toLowerCase().includes(query) ||
          employee.department.toLowerCase().includes(query) ||
          employee.email.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterOption === 'active') {
      result = result.filter((employee) => employee.status === 'Active');
    } else if (filterOption === 'inactive') {
      result = result.filter((employee) => employee.status === 'Inactive');
    } else if (filterOption === 'onLeave') {
      result = result.filter((employee) => employee.status === 'On Leave');
    } else if (filterOption === 'department' && departmentFilter) {
      result = result.filter(
        (employee) => employee.department === departmentFilter
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'department':
          comparison = a.department.localeCompare(b.department);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'joinDate':
          comparison =
            new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [searchQuery, sortField, sortOrder, filterOption, departmentFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSortField('name');
    setSortOrder('asc');
    setFilterOption('all');
    setDepartmentFilter('');
    setCurrentPage(1);
  };

  // Handle create new employee
  const handleCreateEmployee = () => {
    // This is a placeholder function that would be connected to actual employee creation functionality
    console.log('Create new employee clicked');
    // In a real implementation, this might navigate to a creation page or open a modal
  };

  return (
    <div className='flex min-h-[80vh] flex-col'>
      {/* Top Section: Search, Filter, and Results Summary */}
      <div className='mb-6 space-y-6'>
        <div>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold tracking-tight'>
              Employee Directory
            </h2>

            {/* Create New Employee Button */}
            <Button
              onClick={handleCreateEmployee}
              className='gap-2'
              variant='default'
            >
              <IconPlus className='h-4 w-4' />
              Add New Employee
            </Button>
          </div>
        </div>
        {/* Search and Filter Bar */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='relative flex-1'>
            <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search employees'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-9'
            />
          </div>

          <div className='flex flex-wrap gap-2'>
            <Select
              value={filterOption}
              onValueChange={(value) => {
                setFilterOption(value as FilterOption);
                if (value !== 'department') {
                  setDepartmentFilter('');
                }
              }}
            >
              <SelectTrigger className='w-[180px]'>
                <IconFilter className='mr-2 h-4 w-4' />
                <SelectValue placeholder='Filter by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Employees</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
                <SelectItem value='onLeave'>On Leave</SelectItem>
                <SelectItem value='department'>By Department</SelectItem>
              </SelectContent>
            </Select>

            {filterOption === 'department' && (
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Select Department' />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={sortField}
              onValueChange={(value) => setSortField(value as SortField)}
            >
              <SelectTrigger className='w-[180px]'>
                {sortOrder === 'asc' ? (
                  <IconSortAscending className='mr-2 h-4 w-4' />
                ) : (
                  <IconSortDescending className='mr-2 h-4 w-4' />
                )}
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='name'>Name</SelectItem>
                <SelectItem value='role'>Role</SelectItem>
                <SelectItem value='department'>Department</SelectItem>
                <SelectItem value='status'>Status</SelectItem>
                <SelectItem value='joinDate'>Join Date</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant='outline'
              size='icon'
              onClick={toggleSortOrder}
              className='h-10 w-10'
            >
              {sortOrder === 'asc' ? (
                <IconSortAscending className='h-4 w-4' />
              ) : (
                <IconSortDescending className='h-4 w-4' />
              )}
            </Button>

            {(searchQuery ||
              filterOption !== 'all' ||
              sortField !== 'name' ||
              sortOrder !== 'asc') && (
              <Button
                variant='outline'
                size='sm'
                onClick={clearFilters}
                className='h-10 gap-1'
              >
                <IconX className='h-4 w-4' />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        {filteredEmployees.length > 0 ? (
          <div className='text-muted-foreground text-sm'>
            Showing {paginatedEmployees.length} of {filteredEmployees.length}{' '}
            employees
            {searchQuery && (
              <Badge
                variant='outline'
                className='bg-primary/5 text-primary ml-2'
              >
                Search: {searchQuery}
              </Badge>
            )}
            {filterOption !== 'all' && (
              <Badge
                variant='outline'
                className='bg-primary/5 text-primary ml-2'
              >
                Filter:{' '}
                {filterOption === 'department'
                  ? departmentFilter
                  : filterOption}
              </Badge>
            )}
          </div>
        ) : (
          <div className='py-8 text-center'>
            <p className='text-muted-foreground'>
              No employees found matching your criteria.
            </p>
            <Button variant='link' onClick={clearFilters} className='mt-2'>
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Middle Section: Employee List (with flex-grow to push pagination to bottom) */}
      <div className='flex-grow'>
        {filteredEmployees.length > 0 && (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-9 w-9'>
                          {employee.imageUrl ? (
                            <AvatarImage
                              src={employee.imageUrl}
                              alt={employee.name}
                            />
                          ) : (
                            <AvatarFallback className='bg-primary/10 text-primary'>
                              {employee.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className='font-medium'>{employee.name}</div>
                          <div className='text-muted-foreground text-sm'>
                            {employee.role}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <IconBriefcase className='text-primary/70 h-4 w-4' />
                        <span>{employee.department}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col gap-1'>
                        <div className='flex items-center gap-1 text-sm'>
                          <IconMail className='h-3.5 w-3.5' />
                          <span>{employee.email}</span>
                        </div>
                        <div className='flex items-center gap-1 text-sm'>
                          <IconPhone className='h-3.5 w-3.5' />
                          <span>{employee.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1 text-sm'>
                        <IconCalendar className='h-3.5 w-3.5' />
                        <span>
                          {formatDistanceToNow(new Date(employee.joinDate))} ago
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Button asChild variant='default' size='sm'>
                          <Link
                            href={`/dashboard/hrms/employees/${employee.id}`}
                          >
                            View
                          </Link>
                        </Button>
                        <Button variant='outline' size='sm'>
                          Contact
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Bottom Section: Pagination (always at the bottom) */}
      <div className='mt-auto pt-8'>
        {filteredEmployees.length > 0 && (
          <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground text-sm'>
                Items per page:
              </span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(parseInt(value));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
              >
                <SelectTrigger className='w-[80px]'>
                  <SelectValue placeholder='10' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='5'>5</SelectItem>
                  <SelectItem value='10'>10</SelectItem>
                  <SelectItem value='15'>15</SelectItem>
                  <SelectItem value='20'>20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredEmployees.length > itemsPerPage && (
              <div className='flex justify-center'>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : ''
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? 'pointer-events-none opacity-50'
                            : ''
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            <div className='text-muted-foreground text-sm'>
              Showing {startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredEmployees.length)} of{' '}
              {filteredEmployees.length} employees
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
