'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  Plus,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc,
  FolderOpen,
  Calendar,
  DollarSign,
  Users,
  FileText,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Archive,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { IconDotsVertical, IconLoader2 } from '@tabler/icons-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/provider';
import { toast } from 'sonner';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectCategories,
  Project,
  ProjectStatus
} from '../../services';
import { format } from 'date-fns';

type SortField = 'name' | 'code' | 'budget_amount' | 'status' | 'created_at';
type SortOrder = 'asc' | 'desc';

const STATUS_COLORS: Record<ProjectStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  ON_HOLD: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  ARCHIVED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled',
  ARCHIVED: 'Archived',
};

export default function ProjectList() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    code: '',
    name: '',
    description: '',
    category: '',
    budget_amount: 0,
    status: 'ACTIVE' as ProjectStatus,
    start_date: '',
    end_date: '',
  });
  const [creating, setCreating] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (search) params.search = search;
      
      const response = await getProjects(params as Parameters<typeof getProjects>[0]);
      setProjects(response.results);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error(t('projects.loadError') || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getProjectCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  useEffect(() => {
    loadProjects();
    loadCategories();
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter, sortField, sortOrder]);

  const filteredProjects = useMemo(() => {
    let data = [...projects];

    if (search) {
      const term = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.code.toLowerCase().includes(term) ||
          (p.description?.toLowerCase().includes(term)) ||
          (p.client_name?.toLowerCase().includes(term))
      );
    }

    data.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'budget_amount') {
        return sortOrder === 'asc'
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      return sortOrder === 'asc'
        ? String(aValue || '').localeCompare(String(bValue || ''))
        : String(bValue || '').localeCompare(String(aValue || ''));
    });

    return data;
  }, [projects, search, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginated = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleCreateProject = async () => {
    if (!newProject.code || !newProject.name) {
      toast.error('Project code and name are required');
      return;
    }

    setCreating(true);
    try {
      await createProject(newProject);
      toast.success(t('projects.created') || 'Project created successfully');
      setCreateDialogOpen(false);
      setNewProject({
        code: '',
        name: '',
        description: '',
        category: '',
        budget_amount: 0,
        status: 'ACTIVE',
        start_date: '',
        end_date: '',
      });
      loadProjects();
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (project: Project, newStatus: ProjectStatus) => {
    try {
      await updateProject(project.id, { status: newStatus });
      toast.success(`Project status changed to ${STATUS_LABELS[newStatus]}`);
      loadProjects();
    } catch (error) {
      toast.error('Failed to update project status');
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete project "${project.name}"?`)) {
      return;
    }
    try {
      await deleteProject(project.id);
      toast.success('Project deleted successfully');
      loadProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            {t('projects.title') || 'Accounting Projects'} 📁
          </h1>
          <p className='text-muted-foreground text-sm'>
            {t('projects.subtitle') || 'Manage accounting projects and linked documents'}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='icon' onClick={loadProjects} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            {t('projects.create') || 'New Project'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
        <div className='relative flex-1'>
          <Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder={t('projects.search') || 'Search projects...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProjectStatus | 'all')}>
          <SelectTrigger className='w-[150px]'>
            <Filter className='mr-2 h-4 w-4' />
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='ACTIVE'>Active</SelectItem>
            <SelectItem value='COMPLETED'>Completed</SelectItem>
            <SelectItem value='ON_HOLD'>On Hold</SelectItem>
            <SelectItem value='CANCELLED'>Cancelled</SelectItem>
            <SelectItem value='ARCHIVED'>Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className='w-[150px]'>
            <FolderOpen className='mr-2 h-4 w-4' />
            <SelectValue placeholder='Category' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
          <SelectTrigger className='w-[130px]'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='created_at'>Date Created</SelectItem>
            <SelectItem value='name'>Name</SelectItem>
            <SelectItem value='code'>Code</SelectItem>
            <SelectItem value='budget_amount'>Budget</SelectItem>
            <SelectItem value='status'>Status</SelectItem>
          </SelectContent>
        </Select>
        <Button variant='outline' size='icon' onClick={toggleSortOrder}>
          {sortOrder === 'asc' ? <SortAsc className='h-4 w-4' /> : <SortDesc className='h-4 w-4' />}
        </Button>
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[120px]'>Code</TableHead>
              <TableHead>Project Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className='text-right'>Budget</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='w-[50px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className='h-24 text-center'>
                  <IconLoader2 className='mx-auto h-6 w-6 animate-spin' />
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='h-24 text-center'>
                  {t('projects.noResults') || 'No projects found'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((project) => (
                <TableRow key={project.id} className='cursor-pointer hover:bg-muted/50'>
                  <TableCell className='font-mono text-sm'>
                    <Link href={`/dashboard/finance/projects/${project.id}`} className='hover:underline'>
                      {project.code}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Link href={`/dashboard/finance/projects/${project.id}`} className='font-medium hover:underline'>
                        {project.name}
                      </Link>
                      {project.description && (
                        <p className='text-muted-foreground text-xs line-clamp-1'>
                          {project.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{project.client_name || '-'}</TableCell>
                  <TableCell>
                    {project.category && (
                      <Badge variant='outline'>{project.category}</Badge>
                    )}
                  </TableCell>
                  <TableCell className='text-right font-medium'>
                    {formatCurrency(project.budget_amount, project.currency_code)}
                  </TableCell>
                  <TableCell>
                    <div className='w-[100px]'>
                      <div className='mb-1 flex items-center justify-between text-xs'>
                        <span>{project.budget_utilization_percent?.toFixed(0) || 0}%</span>
                      </div>
                      <Progress 
                        value={project.budget_utilization_percent || 0} 
                        className='h-2'
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[project.status]}>
                      {STATUS_LABELS[project.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/finance/projects/${project.id}`)}>
                          <Eye className='mr-2 h-4 w-4' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/finance/projects/${project.id}/edit`)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {project.status !== 'ACTIVE' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(project, 'ACTIVE')}>
                            <PlayCircle className='mr-2 h-4 w-4' />
                            Set Active
                          </DropdownMenuItem>
                        )}
                        {project.status !== 'ON_HOLD' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(project, 'ON_HOLD')}>
                            <PauseCircle className='mr-2 h-4 w-4' />
                            Put On Hold
                          </DropdownMenuItem>
                        )}
                        {project.status !== 'COMPLETED' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(project, 'COMPLETED')}>
                            <FileText className='mr-2 h-4 w-4' />
                            Mark Complete
                          </DropdownMenuItem>
                        )}
                        {project.status !== 'ARCHIVED' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(project, 'ARCHIVED')}>
                            <Archive className='mr-2 h-4 w-4' />
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(project)} className='text-red-600'>
                          <Trash2 className='mr-2 h-4 w-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <p className='text-muted-foreground text-sm'>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of{' '}
            {filteredProjects.length} projects
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className='cursor-pointer'
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>{t('projects.createTitle') || 'Create New Project'}</DialogTitle>
            <DialogDescription>
              {t('projects.createDescription') || 'Enter the details for the new accounting project.'}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='code'>Project Code *</Label>
                <Input
                  id='code'
                  placeholder='PROJ-2024-XXX'
                  value={newProject.code}
                  onChange={(e) => setNewProject({ ...newProject, code: e.target.value })}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='category'>Category</Label>
                <Select
                  value={newProject.category}
                  onValueChange={(v) => setNewProject({ ...newProject, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select category' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    <SelectItem value='Other'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='name'>Project Name *</Label>
              <Input
                id='name'
                placeholder='Enter project name'
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                placeholder='Enter project description'
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='start_date'>Start Date</Label>
                <Input
                  id='start_date'
                  type='date'
                  value={newProject.start_date}
                  onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='end_date'>End Date</Label>
                <Input
                  id='end_date'
                  type='date'
                  value={newProject.end_date}
                  onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='budget'>Budget Amount</Label>
              <Input
                id='budget'
                type='number'
                min={0}
                step={0.01}
                placeholder='0.00'
                value={newProject.budget_amount || ''}
                onChange={(e) => setNewProject({ ...newProject, budget_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={creating}>
              {creating ? (
                <>
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
