// 'use client';
//
// import { DashboardCard } from './dashboard-card';
// import React, { useState, useMemo } from 'react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/components/ui/select';
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious
// } from '@/components/ui/pagination';
// import {
//   IconSearch,
//   IconFilter,
//   IconSortAscending,
//   IconSortDescending,
//   IconX,
//   IconPlus
// } from '@tabler/icons-react';
// import { Badge } from '@/components/ui/badge';
//
// type DashboardCardProps = React.ComponentProps<typeof DashboardCard>;
//
// const DASHBOARDS_DATA: DashboardCardProps[] = [
//   {
//     id: 'd1f3a2e0-9b17-4f35-b5ab-2ef76a3d7c1f',
//     title: 'Marketing Overview',
//     createdBy: 'a74e4fc3-92f5-4213-a290-34c6cf34a6c1',
//     createdByName: 'Apoorv Srivastava',
//     createdByEmail: 'apoorv@example.com',
//     dataSources: 4,
//     createdOn: '2024-12-01',
//     lastRefreshed: '2025-06-20T09:15:00'
//   },
//   {
//     id: 'a80d90be-7274-4c6e-97b3-2698c1a8018f',
//     title: 'Sales Metrics',
//     createdBy: 'f281f37e-3dd7-4ef4-8540-c94be7a9ef12',
//     createdByName: 'Raj Sharma',
//     createdByEmail: 'raj.sharma@example.com',
//     dataSources: 6,
//     createdOn: '2025-01-15',
//     lastRefreshed: '2025-06-22T10:30:00'
//   },
//   {
//     id: 'b7a382e1-5054-4ef2-b0d7-5084d0ac2899',
//     title: 'Product Trends',
//     createdBy: '3fefc2b1-baf1-46bb-a6fa-02077a3dba52',
//     createdByName: 'Neha Verma',
//     createdByEmail: 'neha.verma@example.com',
//     dataSources: 3,
//     createdOn: '2025-03-12',
//     lastRefreshed: '2025-06-21T15:45:00'
//   },
//   {
//     id: 'c9e47f12-8a63-4d21-b8e5-1c3a9f5d7890',
//     title: 'Customer Insights',
//     createdBy: '5d8e2a1b-7c94-4f36-a8d2-9b3e7c1f6d45',
//     createdByName: 'Priya Patel',
//     createdByEmail: 'priya.patel@example.com',
//     dataSources: 5,
//     createdOn: '2025-02-18',
//     lastRefreshed: '2025-06-19T14:20:00'
//   },
//   {
//     id: 'd2e8f9a3-6b5c-4d7e-9f8a-1b2c3d4e5f6a',
//     title: 'Financial Performance',
//     createdBy: '7f8e9d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f',
//     createdByName: 'Vikram Singh',
//     createdByEmail: 'vikram.singh@example.com',
//     dataSources: 8,
//     createdOn: '2025-01-05',
//     lastRefreshed: '2025-06-23T08:45:00'
//   },
//   {
//     id: 'e3f4a5b6-c7d8-9e0f-1a2b-3c4d5e6f7a8b',
//     title: 'Operational Efficiency',
//     createdBy: '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
//     createdByName: 'Ananya Gupta',
//     createdByEmail: 'ananya.gupta@example.com',
//     dataSources: 7,
//     createdOn: '2025-04-10',
//     lastRefreshed: '2025-06-22T16:30:00'
//   },
//   {
//     id: 'f4e5d6c7-b8a9-0f1e-2d3c-4b5a6c7d8e9f',
//     title: 'Social Media Analytics',
//     createdBy: 'b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
//     createdByName: 'Rahul Mehta',
//     createdByEmail: 'rahul.mehta@example.com',
//     dataSources: 4,
//     createdOn: '2025-03-25',
//     lastRefreshed: '2025-06-21T11:10:00'
//   }
// ];
//
// type SortField =
//   | 'title'
//   | 'createdByName'
//   | 'dataSources'
//   | 'createdOn'
//   | 'lastRefreshed';
// type SortOrder = 'asc' | 'desc';
// type FilterOption = 'all' | 'recent' | 'dataSources';
//
// export default function DashboardList() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(6);
//   const [sortField, setSortField] = useState<SortField>('title');
//   const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
//   const [filterOption, setFilterOption] = useState<FilterOption>('all');
//
//   // Filter dashboards based on the search query and filter option
//   const filteredDashboards = useMemo(() => {
//     let result = [...DASHBOARDS_DATA];
//
//     // Apply search filter
//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       result = result.filter(
//         (dashboard) =>
//           dashboard.title.toLowerCase().includes(query) ||
//           dashboard.createdByName.toLowerCase().includes(query) ||
//           dashboard.createdByEmail.toLowerCase().includes(query)
//       );
//     }
//
//     // Apply category filter
//     if (filterOption === 'recent') {
//       // Filter dashboards refreshed in the last 2 days
//       const twoDaysAgo = new Date();
//       twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
//       result = result.filter(
//         (dashboard) => new Date(dashboard.lastRefreshed) >= twoDaysAgo
//       );
//     } else if (filterOption === 'dataSources') {
//       // Filter dashboards with more than 5 data sources
//       result = result.filter((dashboard) => dashboard.dataSources > 5);
//     }
//
//     // Apply sorting
//     result.sort((a, b) => {
//       let comparison = 0;
//
//       switch (sortField) {
//         case 'title':
//           comparison = a.title.localeCompare(b.title);
//           break;
//         case 'createdByName':
//           comparison = a.createdByName.localeCompare(b.createdByName);
//           break;
//         case 'dataSources':
//           comparison = a.dataSources - b.dataSources;
//           break;
//         case 'createdOn':
//           comparison =
//             new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime();
//           break;
//         case 'lastRefreshed':
//           comparison =
//             new Date(a.lastRefreshed).getTime() -
//             new Date(b.lastRefreshed).getTime();
//           break;
//       }
//
//       return sortOrder === 'asc' ? comparison : -comparison;
//     });
//
//     return result;
//   }, [searchQuery, sortField, sortOrder, filterOption]);
//
//   // Calculate pagination
//   const totalPages = Math.ceil(filteredDashboards.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedDashboards = filteredDashboards.slice(
//     startIndex,
//     startIndex + itemsPerPage
//   );
//
//   // Handle page change
//   const handlePageChange = (page: number) => {
//     setCurrentPage(page);
//   };
//
//   // Toggle sort order
//   const toggleSortOrder = () => {
//     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//   };
//
//   // Clear all filters
//   const clearFilters = () => {
//     setSearchQuery('');
//     setSortField('title');
//     setSortOrder('asc');
//     setFilterOption('all');
//     setCurrentPage(1);
//   };
//
//   // Handle create new dashboard
//   const handleCreateDashboard = () => {
//     // This is a placeholder function that would be connected to actual dashboard creation functionality
//     console.log('Create new dashboard clicked');
//     // In a real implementation, this might navigate to a creation page or open a modal
//   };
//
//   return (
//     <div className='flex min-h-[80vh] flex-col'>
//       {/* Top Section: Search, Filter, and Results Summary */}
//       <div className='mb-6 space-y-6'>
//         <div>
//           <div className='flex items-center justify-between'>
//             <h2 className='text-2xl font-bold tracking-tight'>
//               Analytics Dashboards
//             </h2>
//
//             {/* Create New Dashboard Button */}
//             <Button
//               onClick={handleCreateDashboard}
//               className='gap-2'
//               variant='default'
//             >
//               <IconPlus className='h-4 w-4' />
//               Create New Dashboard
//             </Button>
//           </div>
//
//           {/*<Separator />*/}
//         </div>
//         {/* Search and Filter Bar */}
//         <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
//           <div className='relative flex-1'>
//             <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
//             <Input
//               placeholder='Search dashboards'
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className='w-full pl-9'
//             />
//           </div>
//
//           <div className='flex flex-wrap gap-2'>
//             <Select
//               value={filterOption}
//               onValueChange={(value) => setFilterOption(value as FilterOption)}
//             >
//               <SelectTrigger className='w-[180px]'>
//                 <IconFilter className='mr-2 h-4 w-4' />
//                 <SelectValue placeholder='Filter by' />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value='all'>All Dashboards</SelectItem>
//                 <SelectItem value='recent'>Recently Updated</SelectItem>
//                 <SelectItem value='dataSources'>Many Data Sources</SelectItem>
//               </SelectContent>
//             </Select>
//
//             <Select
//               value={sortField}
//               onValueChange={(value) => setSortField(value as SortField)}
//             >
//               <SelectTrigger className='w-[180px]'>
//                 {sortOrder === 'asc' ? (
//                   <IconSortAscending className='mr-2 h-4 w-4' />
//                 ) : (
//                   <IconSortDescending className='mr-2 h-4 w-4' />
//                 )}
//                 <SelectValue placeholder='Sort by' />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value='title'>Title</SelectItem>
//                 <SelectItem value='createdByName'>Creator</SelectItem>
//                 <SelectItem value='dataSources'>Data Sources</SelectItem>
//                 <SelectItem value='createdOn'>Creation Date</SelectItem>
//                 <SelectItem value='lastRefreshed'>Last Updated</SelectItem>
//               </SelectContent>
//             </Select>
//
//             <Button
//               variant='outline'
//               size='icon'
//               onClick={toggleSortOrder}
//               className='h-10 w-10'
//             >
//               {sortOrder === 'asc' ? (
//                 <IconSortAscending className='h-4 w-4' />
//               ) : (
//                 <IconSortDescending className='h-4 w-4' />
//               )}
//             </Button>
//
//             {(searchQuery ||
//               filterOption !== 'all' ||
//               sortField !== 'title' ||
//               sortOrder !== 'asc') && (
//               <Button
//                 variant='outline'
//                 size='sm'
//                 onClick={clearFilters}
//                 className='h-10 gap-1'
//               >
//                 <IconX className='h-4 w-4' />
//                 Clear
//               </Button>
//             )}
//           </div>
//         </div>
//
//         {/* Results Summary */}
//         {filteredDashboards.length > 0 ? (
//           <div className='text-muted-foreground text-sm'>
//             Showing {paginatedDashboards.length} of {filteredDashboards.length}{' '}
//             dashboards
//             {searchQuery && (
//               <Badge
//                 variant='outline'
//                 className='bg-primary/5 text-primary ml-2'
//               >
//                 Search: {searchQuery}
//               </Badge>
//             )}
//             {filterOption !== 'all' && (
//               <Badge
//                 variant='outline'
//                 className='bg-primary/5 text-primary ml-2'
//               >
//                 Filter:{' '}
//                 {filterOption === 'recent'
//                   ? 'Recently Updated'
//                   : 'Many Data Sources'}
//               </Badge>
//             )}
//           </div>
//         ) : (
//           <div className='py-8 text-center'>
//             <p className='text-muted-foreground'>
//               No dashboards found matching your criteria.
//             </p>
//             <Button variant='link' onClick={clearFilters} className='mt-2'>
//               Clear filters
//             </Button>
//           </div>
//         )}
//       </div>
//
//       {/* Middle Section: Dashboard Grid (with flex-grow to push pagination to bottom) */}
//       <div className='flex-grow'>
//         {filteredDashboards.length > 0 && (
//           <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
//             {paginatedDashboards.map((dashboard) => (
//               <DashboardCard key={dashboard.id} {...dashboard} />
//             ))}
//           </div>
//         )}
//       </div>
//
//       {/* Bottom Section: Pagination (always at the bottom) */}
//       <div className='mt-auto pt-8'>
//         {filteredDashboards.length > itemsPerPage && (
//           <div className='flex justify-center'>
//             <Pagination>
//               <PaginationContent>
//                 <PaginationItem>
//                   <PaginationPrevious
//                     onClick={() =>
//                       handlePageChange(Math.max(1, currentPage - 1))
//                     }
//                     className={
//                       currentPage === 1 ? 'pointer-events-none opacity-50' : ''
//                     }
//                   />
//                 </PaginationItem>
//
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                   (page) => (
//                     <PaginationItem key={page}>
//                       <PaginationLink
//                         onClick={() => handlePageChange(page)}
//                         isActive={page === currentPage}
//                       >
//                         {page}
//                       </PaginationLink>
//                     </PaginationItem>
//                   )
//                 )}
//
//                 <PaginationItem>
//                   <PaginationNext
//                     onClick={() =>
//                       handlePageChange(Math.min(totalPages, currentPage + 1))
//                     }
//                     className={
//                       currentPage === totalPages
//                         ? 'pointer-events-none opacity-50'
//                         : ''
//                     }
//                   />
//                 </PaginationItem>
//               </PaginationContent>
//             </Pagination>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// _components/dashboard-list.tsx
'use client';

import { DashboardCard } from './dashboard-card';
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
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconX,
  IconPlus
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

type DashboardCardProps = React.ComponentProps<typeof DashboardCard>;

const DASHBOARDS_DATA: DashboardCardProps[] = [
  {
    id: 'd1f3a2e0-9b17-4f35-b5ab-2ef76a3d7c1f',
    title: 'Marketing Overview',
    createdBy: 'a74e4fc3-92f5-4213-a290-34c6cf34a6c1',
    createdByName: 'Apoorv Srivastava',
    createdByEmail: 'apoorv@example.com',
    dataSources: 4,
    createdOn: '2024-12-01',
    lastRefreshed: '2025-06-20T09:15:00'
  },
  {
    id: 'a80d90be-7274-4c6e-97b3-2698c1a8018f',
    title: 'Sales Metrics',
    createdBy: 'f281f37e-3dd7-4ef4-8540-c94be7a9ef12',
    createdByName: 'Raj Sharma',
    createdByEmail: 'raj.sharma@example.com',
    dataSources: 6,
    createdOn: '2025-01-15',
    lastRefreshed: '2025-06-22T10:30:00'
  },
  {
    id: 'b7a382e1-5054-4ef2-b0d7-5084d0ac2899',
    title: 'Product Trends',
    createdBy: '3fefc2b1-baf1-46bb-a6fa-02077a3dba52',
    createdByName: 'Neha Verma',
    createdByEmail: 'neha.verma@example.com',
    dataSources: 3,
    createdOn: '2025-03-12',
    lastRefreshed: '2025-06-21T15:45:00'
  },
  {
    id: 'c9e47f12-8a63-4d21-b8e5-1c3a9f5d7890',
    title: 'Customer Insights',
    createdBy: '5d8e2a1b-7c94-4f36-a8d2-9b3e7c1f6d45',
    createdByName: 'Priya Patel',
    createdByEmail: 'priya.patel@example.com',
    dataSources: 5,
    createdOn: '2025-02-18',
    lastRefreshed: '2025-06-19T14:20:00'
  },
  {
    id: 'd2e8f9a3-6b5c-4d7e-9f8a-1b2c3d4e5f6a',
    title: 'Financial Performance',
    createdBy: '7f8e9d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f',
    createdByName: 'Vikram Singh',
    createdByEmail: 'vikram.singh@example.com',
    dataSources: 8,
    createdOn: '2025-01-05',
    lastRefreshed: '2025-06-23T08:45:00'
  }
];

type SortField =
  | 'title'
  | 'createdByName'
  | 'dataSources'
  | 'createdOn'
  | 'lastRefreshed';
type SortOrder = 'asc' | 'desc';
type FilterOption = 'all' | 'recent' | 'dataSources';

export default function DashboardList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');

  // Create dashboard dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDashboardTitle, setNewDashboardTitle] = useState('');
  const [newDashboardDescription, setNewDashboardDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Filter dashboards based on the search query and filter option
  const filteredDashboards = useMemo(() => {
    let result = [...DASHBOARDS_DATA];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (dashboard) =>
          dashboard.title.toLowerCase().includes(query) ||
          dashboard.createdByName.toLowerCase().includes(query) ||
          dashboard.createdByEmail.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filterOption === 'recent') {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      result = result.filter(
        (dashboard) => new Date(dashboard.lastRefreshed) >= twoDaysAgo
      );
    } else if (filterOption === 'dataSources') {
      result = result.filter((dashboard) => dashboard.dataSources > 5);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdByName':
          comparison = a.createdByName.localeCompare(b.createdByName);
          break;
        case 'dataSources':
          comparison = a.dataSources - b.dataSources;
          break;
        case 'createdOn':
          comparison =
            new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime();
          break;
        case 'lastRefreshed':
          comparison =
            new Date(a.lastRefreshed).getTime() -
            new Date(b.lastRefreshed).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [searchQuery, sortField, sortOrder, filterOption]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredDashboards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDashboards = filteredDashboards.slice(
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
    setSortField('title');
    setSortOrder('asc');
    setFilterOption('all');
    setCurrentPage(1);
  };

  // Handle create new dashboard
  const handleCreateDashboard = async () => {
    if (!newDashboardTitle.trim()) return;

    setIsCreating(true);

    try {
      // Generate a new dashboard ID
      const newId = `dashboard-${Date.now()}`;

      // In a real app, you would make an API call here
      // await createDashboard({ title: newDashboardTitle, description: newDashboardDescription });

      // For now, we'll simulate the creation and redirect
      console.log('Creating dashboard:', {
        id: newId,
        title: newDashboardTitle,
        description: newDashboardDescription
      });

      // Close dialog and reset form
      setIsCreateDialogOpen(false);
      setNewDashboardTitle('');
      setNewDashboardDescription('');

      // Navigate to the new dashboard
      router.push(`/dashboard/analytics/${newId}`);
    } catch (error) {
      console.error('Error creating dashboard:', error);
      // Handle error - you could show a toast notification here
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className='flex min-h-[80vh] flex-col'>
      {/* Top Section: Search, Filter, and Results Summary */}
      <div className='mb-6 space-y-6'>
        <div>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold tracking-tight'>
              Analytics Dashboards
            </h2>

            {/* Create New Dashboard Button */}
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className='gap-2' variant='default'>
                  <IconPlus className='h-4 w-4' />
                  Create New Dashboard
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Create New Dashboard</DialogTitle>
                  <DialogDescription>
                    Create a new analytics dashboard to organize your data
                    visualizations.
                  </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='title' className='text-right'>
                      Title
                    </Label>
                    <Input
                      id='title'
                      placeholder='Dashboard title'
                      value={newDashboardTitle}
                      onChange={(e) => setNewDashboardTitle(e.target.value)}
                      className='col-span-3'
                    />
                  </div>
                  <div className='grid grid-cols-4 items-start gap-4'>
                    <Label htmlFor='description' className='pt-2 text-right'>
                      Description
                    </Label>
                    <Textarea
                      id='description'
                      placeholder='Optional description'
                      value={newDashboardDescription}
                      onChange={(e) =>
                        setNewDashboardDescription(e.target.value)
                      }
                      className='col-span-3 min-h-[80px]'
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setNewDashboardTitle('');
                      setNewDashboardDescription('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='button'
                    onClick={handleCreateDashboard}
                    disabled={!newDashboardTitle.trim() || isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create Dashboard'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='relative flex-1'>
            <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search dashboards'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-9'
            />
          </div>

          <div className='flex flex-wrap gap-2'>
            <Select
              value={filterOption}
              onValueChange={(value) => setFilterOption(value as FilterOption)}
            >
              <SelectTrigger className='w-[180px]'>
                <IconFilter className='mr-2 h-4 w-4' />
                <SelectValue placeholder='Filter by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Dashboards</SelectItem>
                <SelectItem value='recent'>Recently Updated</SelectItem>
                <SelectItem value='dataSources'>Many Data Sources</SelectItem>
              </SelectContent>
            </Select>

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
                <SelectItem value='title'>Title</SelectItem>
                <SelectItem value='createdByName'>Creator</SelectItem>
                <SelectItem value='dataSources'>Data Sources</SelectItem>
                <SelectItem value='createdOn'>Creation Date</SelectItem>
                <SelectItem value='lastRefreshed'>Last Updated</SelectItem>
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
              sortField !== 'title' ||
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
        {filteredDashboards.length > 0 ? (
          <div className='text-muted-foreground text-sm'>
            Showing {paginatedDashboards.length} of {filteredDashboards.length}{' '}
            dashboards
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
                {filterOption === 'recent'
                  ? 'Recently Updated'
                  : 'Many Data Sources'}
              </Badge>
            )}
          </div>
        ) : (
          <div className='py-8 text-center'>
            <p className='text-muted-foreground'>
              No dashboards found matching your criteria.
            </p>
            <Button variant='link' onClick={clearFilters} className='mt-2'>
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Middle Section: Dashboard Grid */}
      <div className='flex-grow'>
        {filteredDashboards.length > 0 && (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {paginatedDashboards.map((dashboard) => (
              <DashboardCard key={dashboard.id} {...dashboard} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section: Pagination */}
      <div className='mt-auto pt-8'>
        {filteredDashboards.length > itemsPerPage && (
          <div className='flex justify-center'>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    className={
                      currentPage === 1 ? 'pointer-events-none opacity-50' : ''
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
                      handlePageChange(Math.min(totalPages, currentPage + 1))
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
      </div>
    </div>
  );
}
