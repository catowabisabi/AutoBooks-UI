'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/provider';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Search,
  Building2,
  Calendar,
  FileText,
  LayoutGrid,
  LayoutList,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Archive,
  Mail,
  Phone,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Project types
type ProjectType = 'bookkeeping' | 'audit_prep' | 'tax_filing' | 'custom';
type ProjectStatus = 'in_progress' | 'completed' | 'review_pending' | 'archived';

interface ClientInfo {
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

interface AccountingProject {
  id: string;
  companyName: string;
  clientInfo: ClientInfo;
  fiscalYear: number;
  fiscalPeriod: string;
  type: ProjectType;
  status: ProjectStatus;
  createdAt: string;
  documentsCount: number;
  entriesCount: number;
  notes?: string;
}

// Mock data for demo - stored in localStorage for persistence
const getInitialProjects = (): AccountingProject[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('accounting-projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
  }
  return [
    {
      id: '1',
      companyName: 'ABC Trading Ltd',
      clientInfo: {
        contactPerson: 'John Chan',
        email: 'john@abctrading.com',
        phone: '+852 2345 6789',
        address: 'Unit 1001, Tower A, Central Plaza, Hong Kong',
      },
      fiscalYear: 2024,
      fiscalPeriod: 'Q4',
      type: 'bookkeeping',
      status: 'in_progress',
      createdAt: '2024-12-01',
      documentsCount: 45,
      entriesCount: 120,
    },
    {
      id: '2',
      companyName: 'XYZ Holdings',
      clientInfo: {
        contactPerson: 'Mary Wong',
        email: 'mary@xyzholdings.com',
        phone: '+852 2456 7890',
        address: '23/F, Finance Tower, Wan Chai, Hong Kong',
      },
      fiscalYear: 2024,
      fiscalPeriod: 'Full Year',
      type: 'audit_prep',
      status: 'review_pending',
      createdAt: '2024-11-15',
      documentsCount: 230,
      entriesCount: 580,
    },
    {
      id: '3',
      companyName: 'Tech Solutions Co',
      clientInfo: {
        contactPerson: 'David Lee',
        email: 'david@techsolutions.com',
        phone: '+852 2567 8901',
        address: 'Suite 502, Science Park, Sha Tin, Hong Kong',
      },
      fiscalYear: 2024,
      fiscalPeriod: 'Q3',
      type: 'tax_filing',
      status: 'completed',
      createdAt: '2024-10-20',
      documentsCount: 78,
      entriesCount: 245,
    },
  ];
};

export default function AccountingWorkspacePage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<AccountingProject[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    fiscalYear: new Date().getFullYear(),
    fiscalPeriod: 'Full Year',
    type: 'bookkeeping' as ProjectType,
    notes: '',
  });

  useEffect(() => {
    setMounted(true);
    setProjects(getInitialProjects());
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (mounted && projects.length > 0) {
      localStorage.setItem('accounting-projects', JSON.stringify(projects));
    }
  }, [projects, mounted]);

  // i18n helper - use t() function with fallback
  const getText = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.companyName
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      project.clientInfo.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || project.status === filterStatus;
    const matchesType = filterType === 'all' || project.type === filterType;
    const matchesYear =
      filterYear === 'all' || project.fiscalYear.toString() === filterYear;
    return matchesSearch && matchesStatus && matchesType && matchesYear;
  });

  const getStatusBadge = (status: ProjectStatus) => {
    const config = {
      in_progress: {
        labelKey: 'accountingWorkspace.projectStatus.inProgress',
        labelFallback: 'In Progress',
        variant: 'default' as const,
        icon: Clock,
      },
      completed: {
        labelKey: 'accountingWorkspace.projectStatus.completed',
        labelFallback: 'Completed',
        variant: 'secondary' as const,
        icon: CheckCircle,
      },
      review_pending: {
        labelKey: 'accountingWorkspace.projectStatus.review',
        labelFallback: 'Under Review',
        variant: 'outline' as const,
        icon: AlertCircle,
      },
      archived: {
        labelKey: 'accountingWorkspace.projectStatus.onHold',
        labelFallback: 'Archived',
        variant: 'secondary' as const,
        icon: Archive,
      },
    };
    const { labelKey, labelFallback, variant, icon: Icon } = config[status];
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {getText(labelKey, labelFallback)}
      </Badge>
    );
  };

  const getTypeLabel = (type: ProjectType) => {
    const typeConfig = {
      bookkeeping: { key: 'accountingWorkspace.projectTypes.monthlyBookkeeping', fallback: 'Bookkeeping' },
      audit_prep: { key: 'accountingWorkspace.projectTypes.annualAudit', fallback: 'Audit Prep' },
      tax_filing: { key: 'accountingWorkspace.projectTypes.taxFiling', fallback: 'Tax Filing' },
      custom: { key: 'accountingWorkspace.projectTypes.specialProject', fallback: 'Custom' },
    };
    const { key, fallback } = typeConfig[type];
    return getText(key, fallback);
  };

  const handleCreateProject = () => {
    if (!newProject.companyName.trim()) {
      toast.error(getText('accountingWorkspace.errors.companyRequired', 'Company name is required'));
      return;
    }

    const project: AccountingProject = {
      id: Date.now().toString(),
      companyName: newProject.companyName,
      clientInfo: {
        contactPerson: newProject.contactPerson,
        email: newProject.email,
        phone: newProject.phone,
        address: newProject.address,
      },
      fiscalYear: newProject.fiscalYear,
      fiscalPeriod: newProject.fiscalPeriod,
      type: newProject.type,
      status: 'in_progress',
      createdAt: new Date().toISOString().split('T')[0],
      documentsCount: 0,
      entriesCount: 0,
      notes: newProject.notes,
    };

    setProjects([project, ...projects]);
    setIsCreateDialogOpen(false);
    
    // Reset form
    setNewProject({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      fiscalYear: new Date().getFullYear(),
      fiscalPeriod: 'Full Year',
      type: 'bookkeeping',
      notes: '',
    });

    toast.success(getText('accountingWorkspace.projectCreated', 'Project created successfully'));
    
    // Navigate to the new project
    router.push(`/dashboard/accounting-workspace/${project.id}`);
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/dashboard/accounting-workspace/${projectId}`);
  };

  const handleDeleteProject = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setProjects(projects.filter((p) => p.id !== id));
    toast.success(getText('accountingWorkspace.projectDeleted', 'Project deleted'));
  };

  if (!mounted) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse text-muted-foreground">
            {getText('common.loading', 'Loading...')}
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {getText('accountingWorkspace.title', 'Accounting Workspace')}
            </h1>
            <p className="text-muted-foreground">
              {getText('accountingWorkspace.description', 'Unified workspace for document processing and bookkeeping')}
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {getText('accountingWorkspace.newProject', 'New Project')}
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={getText('accountingWorkspace.search', 'Search projects...')}
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={getText('accountingWorkspace.filterByStatus', 'Status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{getText('common.all', 'All')}</SelectItem>
                  <SelectItem value="in_progress">{getText('accountingWorkspace.projectStatus.inProgress', 'In Progress')}</SelectItem>
                  <SelectItem value="review_pending">{getText('accountingWorkspace.projectStatus.review', 'Under Review')}</SelectItem>
                  <SelectItem value="completed">{getText('accountingWorkspace.projectStatus.completed', 'Completed')}</SelectItem>
                  <SelectItem value="archived">{getText('accountingWorkspace.projectStatus.onHold', 'Archived')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={getText('accountingWorkspace.filterByType', 'Type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{getText('common.all', 'All')}</SelectItem>
                  <SelectItem value="bookkeeping">{getText('accountingWorkspace.projectTypes.monthlyBookkeeping', 'Bookkeeping')}</SelectItem>
                  <SelectItem value="audit_prep">{getText('accountingWorkspace.projectTypes.annualAudit', 'Audit Prep')}</SelectItem>
                  <SelectItem value="tax_filing">{getText('accountingWorkspace.projectTypes.taxFiling', 'Tax Filing')}</SelectItem>
                  <SelectItem value="custom">{getText('accountingWorkspace.projectTypes.specialProject', 'Custom')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={getText('accountingWorkspace.fiscalYear', 'Year')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{getText('common.all', 'All')}</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid View */}
        {viewMode === 'grid' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="group hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleOpenProject(project.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {project.companyName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {project.fiscalYear} {project.fiscalPeriod}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProject(project.id);
                        }}>
                          <FolderOpen className="h-4 w-4 mr-2" />
                          {getText('accountingWorkspace.view', 'Open')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Pencil className="h-4 w-4 mr-2" />
                          {getText('accountingWorkspace.editProject', 'Edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => handleDeleteProject(project.id, e)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {getText('accountingWorkspace.delete', 'Delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Client Contact Info */}
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{project.clientInfo.email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{project.clientInfo.phone || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {getStatusBadge(project.status)}
                    <Badge variant="outline">{getTypeLabel(project.type)}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>
                        {project.documentsCount} {getText('accountingWorkspace.documentsTab', 'docs')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>
                        {project.entriesCount} {getText('accountingWorkspace.entriesTab', 'entries')}
                      </span>
                    </div>
                  </div>
                  
                  <Button className="w-full gap-2" variant="secondary">
                    <FolderOpen className="h-4 w-4" />
                    {getText('accountingWorkspace.view', 'Open Project')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Projects List View */}
        {viewMode === 'list' && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{getText('accountingWorkspace.clientName', 'Company')}</TableHead>
                  <TableHead>{getText('accountingWorkspace.clientInfo', 'Contact')}</TableHead>
                  <TableHead>{getText('accountingWorkspace.period', 'Period')}</TableHead>
                  <TableHead>{getText('accountingWorkspace.projectType', 'Type')}</TableHead>
                  <TableHead>{getText('accountingWorkspace.status', 'Status')}</TableHead>
                  <TableHead>{getText('accountingWorkspace.documentsTab', 'Docs')}</TableHead>
                  <TableHead>{getText('accountingWorkspace.entriesTab', 'Entries')}</TableHead>
                  <TableHead className="text-right">{getText('accountingWorkspace.actions', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow 
                    key={project.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleOpenProject(project.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {project.companyName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{project.clientInfo.contactPerson}</div>
                        <div className="text-muted-foreground text-xs">{project.clientInfo.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {project.fiscalYear} {project.fiscalPeriod}
                    </TableCell>
                    <TableCell>{getTypeLabel(project.type)}</TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>{project.documentsCount}</TableCell>
                    <TableCell>{project.entriesCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProject(project.id);
                          }}
                        >
                          {getText('accountingWorkspace.view', 'Open')}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Pencil className="h-4 w-4 mr-2" />
                              {getText('accountingWorkspace.editProject', 'Edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => handleDeleteProject(project.id, e)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {getText('accountingWorkspace.delete', 'Delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {getText('accountingWorkspace.noProjects', 'No projects found')}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {getText('accountingWorkspace.createFirstProject', 'Create your first project to get started')}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {getText('accountingWorkspace.newProject', 'New Project')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Project Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{getText('accountingWorkspace.createProject', 'Create New Project')}</DialogTitle>
              <DialogDescription>
                {getText('accountingWorkspace.createProjectDesc', 'Create a new accounting project for your client company')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              {/* Company Info Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  {getText('accountingWorkspace.clientInfo', 'Client Information')}
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>{getText('accountingWorkspace.clientName', 'Company Name')} *</Label>
                    <Input
                      placeholder={getText('accountingWorkspace.enterCompanyName', 'Enter company name...')}
                      value={newProject.companyName}
                      onChange={(e) =>
                        setNewProject({ ...newProject, companyName: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>{getText('accountingWorkspace.contactPerson', 'Contact Person')}</Label>
                      <Input
                        placeholder={getText('accountingWorkspace.enterContactPerson', 'Contact name...')}
                        value={newProject.contactPerson}
                        onChange={(e) =>
                          setNewProject({ ...newProject, contactPerson: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{getText('accountingWorkspace.phone', 'Phone')}</Label>
                      <Input
                        placeholder="+852 1234 5678"
                        value={newProject.phone}
                        onChange={(e) =>
                          setNewProject({ ...newProject, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{getText('accountingWorkspace.email', 'Email')}</Label>
                    <Input
                      type="email"
                      placeholder="client@company.com"
                      value={newProject.email}
                      onChange={(e) =>
                        setNewProject({ ...newProject, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{getText('accountingWorkspace.address', 'Address')}</Label>
                    <Textarea
                      placeholder={getText('accountingWorkspace.enterAddress', 'Company address...')}
                      value={newProject.address}
                      onChange={(e) =>
                        setNewProject({ ...newProject, address: e.target.value })
                      }
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Project Info Section */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  {getText('accountingWorkspace.projectInfo', 'Project Information')}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{getText('accountingWorkspace.fiscalYear', 'Fiscal Year')}</Label>
                    <Select
                      value={newProject.fiscalYear.toString()}
                      onValueChange={(v) =>
                        setNewProject({ ...newProject, fiscalYear: parseInt(v) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{getText('accountingWorkspace.period', 'Period')}</Label>
                    <Select
                      value={newProject.fiscalPeriod}
                      onValueChange={(v) =>
                        setNewProject({ ...newProject, fiscalPeriod: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Q1">Q1</SelectItem>
                        <SelectItem value="Q2">Q2</SelectItem>
                        <SelectItem value="Q3">Q3</SelectItem>
                        <SelectItem value="Q4">Q4</SelectItem>
                        <SelectItem value="H1">H1</SelectItem>
                        <SelectItem value="H2">H2</SelectItem>
                        <SelectItem value="Full Year">
                          {getText('accountingWorkspace.fullYear', 'Full Year')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{getText('accountingWorkspace.projectType', 'Project Type')}</Label>
                  <Select
                    value={newProject.type}
                    onValueChange={(v) =>
                      setNewProject({ ...newProject, type: v as ProjectType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bookkeeping">
                        {getText('accountingWorkspace.projectTypes.monthlyBookkeeping', 'Monthly Bookkeeping')}
                      </SelectItem>
                      <SelectItem value="audit_prep">
                        {getText('accountingWorkspace.projectTypes.annualAudit', 'Annual Audit')}
                      </SelectItem>
                      <SelectItem value="tax_filing">
                        {getText('accountingWorkspace.projectTypes.taxFiling', 'Tax Filing')}
                      </SelectItem>
                      <SelectItem value="custom">
                        {getText('accountingWorkspace.projectTypes.specialProject', 'Special Project')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{getText('accountingWorkspace.notes', 'Notes')}</Label>
                  <Textarea
                    placeholder={getText('accountingWorkspace.enterNotes', 'Any special instructions or notes...')}
                    value={newProject.notes}
                    onChange={(e) =>
                      setNewProject({ ...newProject, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {getText('common.cancel', 'Cancel')}
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={!newProject.companyName.trim()}
              >
                {getText('accountingWorkspace.createProject', 'Create Project')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
