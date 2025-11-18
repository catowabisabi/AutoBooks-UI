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
  IconUsers,
  IconBuilding,
  IconUserCheck
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

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

// Function to get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Inactive':
      return 'bg-red-100 text-red-800';
    case 'Restructuring':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Sample department data
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

type SortField =
  | 'name'
  | 'headName'
  | 'employeeCount'
  | 'status'
  | 'createdDate'
  | 'budget';
type SortOrder = 'asc' | 'desc';
type FilterOption =
  | 'all'
  | 'active'
  | 'inactive'
  | 'restructuring'
  | 'employeeCount'
  | 'budget';

export default function DepartmentList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [employeeCountFilter, setEmployeeCountFilter] = useState<number>(0);
  const [budgetFilter, setBudgetFilter] = useState<number>(0);

  // Filter departments based on the search query and filter option
  const filteredDepartments = useMemo(() => {
    let result = [...DEPARTMENTS_DATA];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (department) =>
          department.name.toLowerCase().includes(query) ||
          department.description.toLowerCase().includes(query) ||
          department.headName.toLowerCase().includes(query) ||
          department.headEmail.toLowerCase().includes(query) ||
          (department.location &&
            department.location.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (filterOption === 'active') {
      result = result.filter((department) => department.status === 'Active');
    } else if (filterOption === 'inactive') {
      result = result.filter((department) => department.status === 'Inactive');
    } else if (filterOption === 'restructuring') {
      result = result.filter(
        (department) => department.status === 'Restructuring'
      );
    } else if (filterOption === 'employeeCount' && employeeCountFilter > 0) {
      result = result.filter(
        (department) => department.employeeCount >= employeeCountFilter
      );
    } else if (filterOption === 'budget' && budgetFilter > 0) {
      result = result.filter(
        (department) => (department.budget || 0) >= budgetFilter
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'headName':
          comparison = a.headName.localeCompare(b.headName);
          break;
        case 'employeeCount':
          comparison = a.employeeCount - b.employeeCount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'createdDate':
          comparison =
            new Date(a.createdDate).getTime() -
            new Date(b.createdDate).getTime();
          break;
        case 'budget':
          comparison = (a.budget || 0) - (b.budget || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [
    searchQuery,
    sortField,
    sortOrder,
    filterOption,
    employeeCountFilter,
    budgetFilter
  ]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDepartments = filteredDepartments.slice(
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
    setEmployeeCountFilter(0);
    setBudgetFilter(0);
    setCurrentPage(1);
  };

  // Handle create new department
  const handleCreateDepartment = () => {
    // This is a placeholder function that would be connected to actual department creation functionality
    console.log('Create new department clicked');
    // In a real implementation, this might navigate to a creation page or open a modal
  };

  return (
    <div className='flex min-h-[80vh] flex-col'>
      {/* Top Section: Search, Filter, and Results Summary */}
      <div className='mb-6 space-y-6'>
        <div>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold tracking-tight'>
              Department Directory
            </h2>

            {/* Create New Department Button */}
            <Button
              onClick={handleCreateDepartment}
              className='gap-2'
              variant='default'
            >
              <IconPlus className='h-4 w-4' />
              Add New Department
            </Button>
          </div>
        </div>
        {/* Search and Filter Bar */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='relative flex-1'>
            <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search departments'
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
                if (value !== 'employeeCount') {
                  setEmployeeCountFilter(0);
                }
                if (value !== 'budget') {
                  setBudgetFilter(0);
                }
              }}
            >
              <SelectTrigger className='w-[180px]'>
                <IconFilter className='mr-2 h-4 w-4' />
                <SelectValue placeholder='Filter by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Departments</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
                <SelectItem value='restructuring'>Restructuring</SelectItem>
                <SelectItem value='employeeCount'>By Employee Count</SelectItem>
                <SelectItem value='budget'>By Budget</SelectItem>
              </SelectContent>
            </Select>

            {filterOption === 'employeeCount' && (
              <Select
                value={employeeCountFilter.toString()}
                onValueChange={(value) =>
                  setEmployeeCountFilter(parseInt(value))
                }
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Min Employees' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='10'>10+ Employees</SelectItem>
                  <SelectItem value='15'>15+ Employees</SelectItem>
                  <SelectItem value='20'>20+ Employees</SelectItem>
                  <SelectItem value='30'>30+ Employees</SelectItem>
                </SelectContent>
              </Select>
            )}

            {filterOption === 'budget' && (
              <Select
                value={budgetFilter.toString()}
                onValueChange={(value) => setBudgetFilter(parseInt(value))}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Min Budget' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='500000'>$500K+</SelectItem>
                  <SelectItem value='1000000'>$1M+</SelectItem>
                  <SelectItem value='1500000'>$1.5M+</SelectItem>
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
                <SelectItem value='headName'>Department Head</SelectItem>
                <SelectItem value='employeeCount'>Employee Count</SelectItem>
                <SelectItem value='status'>Status</SelectItem>
                <SelectItem value='createdDate'>Creation Date</SelectItem>
                <SelectItem value='budget'>Budget</SelectItem>
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
        {filteredDepartments.length > 0 ? (
          <div className='text-muted-foreground text-sm'>
            Showing {paginatedDepartments.length} of{' '}
            {filteredDepartments.length} departments
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
                {filterOption === 'employeeCount'
                  ? `${employeeCountFilter}+ Employees`
                  : filterOption === 'budget'
                    ? `$${budgetFilter / 1000}K+ Budget`
                    : filterOption}
              </Badge>
            )}
          </div>
        ) : (
          <div className='py-8 text-center'>
            <p className='text-muted-foreground'>
              No departments found matching your criteria.
            </p>
            <Button variant='link' onClick={clearFilters} className='mt-2'>
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Middle Section: Department List (with flex-grow to push pagination to bottom) */}
      <div className='flex-grow'>
        {filteredDepartments.length > 0 && (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <div className='bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full'>
                          <IconBuilding className='text-primary h-5 w-5' />
                        </div>
                        <div>
                          <div className='font-medium'>{department.name}</div>
                          <div className='text-muted-foreground text-sm'>
                            {department.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <IconUserCheck className='text-primary/70 h-4 w-4' />
                        <div>
                          <div className='font-medium'>
                            {department.headName}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            {department.headEmail}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <IconUsers className='text-primary/70 h-4 w-4' />
                        <span>{department.employeeCount} members</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(department.status)}>
                        {department.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1 text-sm'>
                        <span>
                          ${department.budget?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Button asChild variant='default' size='sm'>
                          <Link
                            href={`/dashboard/hrms/departments/${department.id}`}
                          >
                            View
                          </Link>
                        </Button>
                        <Button variant='outline' size='sm'>
                          Manage
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
        {filteredDepartments.length > 0 && (
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

            {filteredDepartments.length > itemsPerPage && (
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
              {Math.min(startIndex + itemsPerPage, filteredDepartments.length)}{' '}
              of {filteredDepartments.length} departments
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
