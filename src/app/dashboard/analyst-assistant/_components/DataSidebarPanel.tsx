'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  IconFileAnalytics,
  IconReceipt,
  IconBuildingSkyscraper,
  IconCash,
  IconRefresh,
  IconSearch,
  IconTrendingUp,
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconChevronLeft,
  IconChevronRight,
  IconUsers,
  IconFileDescription,
  IconCalendarStats,
  IconReportMoney,
  IconLoader2
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n/provider';
import {
  auditsApi,
  taxReturnsApi,
  bmiProjectsApi,
  revenueApi,
  companiesApi,
  billableHoursApi,
  AuditProject,
  TaxReturnCase,
  BMIIPOPRRecord,
  Revenue,
  Company,
  BillableHour
} from '@/features/business/services';

interface DataSidebarPanelProps {
  onSelectItem?: (type: string, item: any) => void;
  isDemo?: boolean;
}

// Tab configuration
const TABS = [
  { id: 'audits', icon: IconFileAnalytics, label: '審計' },
  { id: 'tax', icon: IconReceipt, label: '稅務' },
  { id: 'bmi', icon: IconBuildingSkyscraper, label: 'IPO/PR' },
  { id: 'revenue', icon: IconCash, label: '收入' },
  { id: 'companies', icon: IconUsers, label: '客戶' },
  { id: 'hours', icon: IconCalendarStats, label: '時數' },
];

const MAX_VISIBLE_TABS = 4;
const PAGE_SIZE = 10;

// Demo data generators
const generateDemoAudits = (page: number): AuditProject[] => {
  const statuses: AuditProject['status'][] = ['NOT_STARTED', 'PLANNING', 'FIELDWORK', 'REVIEW', 'REPORTING', 'COMPLETED'];
  const types = ['FINANCIAL', 'COMPLIANCE', 'INTERNAL', 'TAX'];
  return Array.from({ length: PAGE_SIZE }, (_, i) => ({
    id: `${page * PAGE_SIZE + i + 1}`,
    company: `${page * PAGE_SIZE + i + 1}`,
    company_name: `Company ${page * PAGE_SIZE + i + 1} Ltd`,
    fiscal_year: '2024',
    audit_type: types[i % types.length],
    progress: Math.floor(Math.random() * 100),
    status: statuses[i % statuses.length],
    deadline: `2025-0${(i % 9) + 1}-${15 + (i % 15)}`,
    assigned_to_name: ['John Chan', 'Mary Wong', 'Peter Lee', 'Amy Tan'][i % 4],
    is_active: true,
    created_at: '',
    updated_at: ''
  }));
};

const generateDemoTaxReturns = (page: number): TaxReturnCase[] => {
  const statuses: TaxReturnCase['status'][] = ['PENDING', 'IN_PROGRESS', 'UNDER_REVIEW', 'SUBMITTED', 'ACCEPTED'];
  const types = ['PROFITS_TAX', 'SALARIES_TAX', 'PROPERTY_TAX', 'STAMP_DUTY'];
  return Array.from({ length: PAGE_SIZE }, (_, i) => ({
    id: `${page * PAGE_SIZE + i + 1}`,
    company: `${page * PAGE_SIZE + i + 1}`,
    company_name: `Company ${page * PAGE_SIZE + i + 1} Ltd`,
    tax_year: '2024',
    tax_type: types[i % types.length],
    progress: Math.floor(Math.random() * 100),
    status: statuses[i % statuses.length],
    deadline: `2025-0${(i % 9) + 1}-${15 + (i % 15)}`,
    handler_name: ['John Chan', 'Mary Wong', 'Peter Lee', 'Amy Tan'][i % 4],
    tax_amount: Math.floor(Math.random() * 2000000) + 100000,
    documents_received: i % 2 === 0,
    is_active: true,
    created_at: '',
    updated_at: ''
  }));
};

const generateDemoBmiProjects = (page: number): BMIIPOPRRecord[] => {
  const stages = ['INITIAL_ASSESSMENT', 'DUE_DILIGENCE', 'DOCUMENTATION', 'REGULATORY_FILING', 'MARKETING'];
  const statuses: BMIIPOPRRecord['status'][] = ['ACTIVE', 'ON_TRACK', 'DELAYED', 'AT_RISK'];
  const types = ['IPO', 'RIGHTS_ISSUE', 'PLACEMENT', 'PR'];
  return Array.from({ length: PAGE_SIZE }, (_, i) => ({
    id: `${page * PAGE_SIZE + i + 1}`,
    project_name: `Project ${page * PAGE_SIZE + i + 1} ${types[i % types.length]}`,
    company: `${page * PAGE_SIZE + i + 1}`,
    company_name: `Company ${page * PAGE_SIZE + i + 1} Ltd`,
    stage: stages[i % stages.length],
    status: statuses[i % statuses.length],
    project_type: types[i % types.length],
    estimated_value: Math.floor(Math.random() * 500000000) + 50000000,
    progress: Math.floor(Math.random() * 100),
    target_completion_date: `2025-0${(i % 9) + 1}-${15 + (i % 15)}`,
    lead_manager_name: ['David Chen', 'Sarah Lee', 'Michael Wong', 'Emily Ng'][i % 4],
    is_active: true,
    created_at: '',
    updated_at: ''
  }));
};

const generateDemoRevenues = (page: number): Revenue[] => {
  const statuses: Revenue['status'][] = ['PENDING', 'PARTIAL', 'RECEIVED', 'OVERDUE'];
  return Array.from({ length: PAGE_SIZE }, (_, i) => ({
    id: `${page * PAGE_SIZE + i + 1}`,
    company: `${page * PAGE_SIZE + i + 1}`,
    company_name: `Company ${page * PAGE_SIZE + i + 1} Ltd`,
    invoice_number: `INV-2024-${String(page * PAGE_SIZE + i + 1).padStart(3, '0')}`,
    total_amount: Math.floor(Math.random() * 500000) + 50000,
    received_amount: Math.floor(Math.random() * 300000),
    status: statuses[i % statuses.length],
    invoice_date: '2024-11-01',
    due_date: `2025-0${(i % 3) + 1}-01`,
    is_active: true,
    created_at: '',
    updated_at: ''
  }));
};

const generateDemoCompanies = (page: number): Company[] => {
  const industries = ['Technology', 'Finance', 'Real Estate', 'Manufacturing', 'Retail'];
  return Array.from({ length: PAGE_SIZE }, (_, i) => ({
    id: `${page * PAGE_SIZE + i + 1}`,
    name: `Company ${page * PAGE_SIZE + i + 1} Ltd`,
    registration_number: `BR${String(page * PAGE_SIZE + i + 1).padStart(6, '0')}`,
    industry: industries[i % industries.length],
    contact_person: ['John Wong', 'Mary Chan', 'Peter Lee', 'Amy Tan'][i % 4],
    contact_email: `contact${page * PAGE_SIZE + i + 1}@company.com`,
    is_active: true,
    created_at: '',
    updated_at: ''
  }));
};

const generateDemoHours = (page: number): BillableHour[] => {
  const roles: BillableHour['role'][] = ['CLERK', 'ACCOUNTANT', 'MANAGER', 'DIRECTOR', 'PARTNER'];
  return Array.from({ length: PAGE_SIZE }, (_, i) => ({
    id: `${page * PAGE_SIZE + i + 1}`,
    employee: `${i + 1}`,
    employee_name: ['John Chan', 'Mary Wong', 'Peter Lee', 'Amy Tan', 'David Chen'][i % 5],
    company: `${page * PAGE_SIZE + i + 1}`,
    company_name: `Company ${page * PAGE_SIZE + i + 1} Ltd`,
    role: roles[i % roles.length],
    base_hourly_rate: 100 + (i % 5) * 50,
    hourly_rate_multiplier: [1, 5, 3, 10, 15][i % 5],
    date: `2024-12-0${(i % 9) + 1}`,
    actual_hours: Math.floor(Math.random() * 8) + 1,
    description: 'Project work',
    is_billable: true,
    is_invoiced: i % 2 === 0,
    is_active: true,
    created_at: '',
    updated_at: ''
  }));
};

export default function DataSidebarPanel({
  onSelectItem,
  isDemo = false
}: DataSidebarPanelProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('audits');
  const [tabScrollIndex, setTabScrollIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states with pagination
  const [audits, setAudits] = useState<AuditProject[]>([]);
  const [taxReturns, setTaxReturns] = useState<TaxReturnCase[]>([]);
  const [bmiProjects, setBmiProjects] = useState<BMIIPOPRRecord[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [hours, setHours] = useState<BillableHour[]>([]);
  
  // Pagination states
  const [pages, setPages] = useState<Record<string, number>>({
    audits: 0, tax: 0, bmi: 0, revenue: 0, companies: 0, hours: 0
  });
  const [hasMore, setHasMore] = useState<Record<string, boolean>>({
    audits: true, tax: true, bmi: true, revenue: true, companies: true, hours: true
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [usingDemoData, setUsingDemoData] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Tab navigation
  const visibleTabs = TABS.slice(tabScrollIndex, tabScrollIndex + MAX_VISIBLE_TABS);
  const canScrollLeft = tabScrollIndex > 0;
  const canScrollRight = tabScrollIndex + MAX_VISIBLE_TABS < TABS.length;

  const scrollTabsLeft = () => setTabScrollIndex(Math.max(0, tabScrollIndex - 1));
  const scrollTabsRight = () => setTabScrollIndex(Math.min(TABS.length - MAX_VISIBLE_TABS, tabScrollIndex + 1));

  // Initial data load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [auditsRes, taxRes, bmiRes, revenueRes, companiesRes, hoursRes] = await Promise.all([
        auditsApi.list({ page: 1, page_size: PAGE_SIZE }).catch(() => ({ results: [] })),
        taxReturnsApi.list({ page: 1, page_size: PAGE_SIZE }).catch(() => ({ results: [] })),
        bmiProjectsApi.list({ page: 1, page_size: PAGE_SIZE }).catch(() => ({ results: [] })),
        revenueApi.list({ page: 1, page_size: PAGE_SIZE }).catch(() => ({ results: [] })),
        companiesApi.list({ page: 1, page_size: PAGE_SIZE }).catch(() => ({ results: [] })),
        billableHoursApi.list({ page: 1, page_size: PAGE_SIZE }).catch(() => ({ results: [] }))
      ]);
      
      let hasRealData = false;
      
      if (auditsRes.results?.length > 0) {
        setAudits(auditsRes.results);
        hasRealData = true;
      } else {
        setAudits(generateDemoAudits(0));
      }
      
      if (taxRes.results?.length > 0) {
        setTaxReturns(taxRes.results);
        hasRealData = true;
      } else {
        setTaxReturns(generateDemoTaxReturns(0));
      }
      
      if (bmiRes.results?.length > 0) {
        setBmiProjects(bmiRes.results);
        hasRealData = true;
      } else {
        setBmiProjects(generateDemoBmiProjects(0));
      }
      
      if (revenueRes.results?.length > 0) {
        setRevenues(revenueRes.results);
        hasRealData = true;
      } else {
        setRevenues(generateDemoRevenues(0));
      }
      
      if (companiesRes.results?.length > 0) {
        setCompanies(companiesRes.results);
        hasRealData = true;
      } else {
        setCompanies(generateDemoCompanies(0));
      }
      
      if (hoursRes.results?.length > 0) {
        setHours(hoursRes.results);
        hasRealData = true;
      } else {
        setHours(generateDemoHours(0));
      }
      
      setUsingDemoData(!hasRealData);
    } catch (error) {
      console.warn('Error loading business data, using demo:', error);
      setAudits(generateDemoAudits(0));
      setTaxReturns(generateDemoTaxReturns(0));
      setBmiProjects(generateDemoBmiProjects(0));
      setRevenues(generateDemoRevenues(0));
      setCompanies(generateDemoCompanies(0));
      setHours(generateDemoHours(0));
      setUsingDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  // Load more data (infinite scroll)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore[activeTab]) return;
    
    setLoadingMore(true);
    const nextPage = pages[activeTab] + 1;
    
    try {
      if (usingDemoData) {
        // Simulate API delay for demo data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        switch (activeTab) {
          case 'audits':
            if (nextPage < 5) { // Limit demo data to 5 pages
              setAudits(prev => [...prev, ...generateDemoAudits(nextPage)]);
            } else {
              setHasMore(prev => ({ ...prev, audits: false }));
            }
            break;
          case 'tax':
            if (nextPage < 5) {
              setTaxReturns(prev => [...prev, ...generateDemoTaxReturns(nextPage)]);
            } else {
              setHasMore(prev => ({ ...prev, tax: false }));
            }
            break;
          case 'bmi':
            if (nextPage < 5) {
              setBmiProjects(prev => [...prev, ...generateDemoBmiProjects(nextPage)]);
            } else {
              setHasMore(prev => ({ ...prev, bmi: false }));
            }
            break;
          case 'revenue':
            if (nextPage < 5) {
              setRevenues(prev => [...prev, ...generateDemoRevenues(nextPage)]);
            } else {
              setHasMore(prev => ({ ...prev, revenue: false }));
            }
            break;
          case 'companies':
            if (nextPage < 5) {
              setCompanies(prev => [...prev, ...generateDemoCompanies(nextPage)]);
            } else {
              setHasMore(prev => ({ ...prev, companies: false }));
            }
            break;
          case 'hours':
            if (nextPage < 5) {
              setHours(prev => [...prev, ...generateDemoHours(nextPage)]);
            } else {
              setHasMore(prev => ({ ...prev, hours: false }));
            }
            break;
        }
        setPages(prev => ({ ...prev, [activeTab]: nextPage }));
      } else {
        // Real API call
        switch (activeTab) {
          case 'audits': {
            const auditsResponse = await auditsApi.list({ page: nextPage + 1, page_size: PAGE_SIZE });
            if (auditsResponse.results?.length > 0) {
              setAudits(prev => [...prev, ...auditsResponse.results]);
            }
            setHasMore(prev => ({ ...prev, audits: !!auditsResponse.next }));
            break;
          }
          case 'tax': {
            const taxResponse = await taxReturnsApi.list({ page: nextPage + 1, page_size: PAGE_SIZE });
            if (taxResponse.results?.length > 0) {
              setTaxReturns(prev => [...prev, ...taxResponse.results]);
            }
            setHasMore(prev => ({ ...prev, tax: !!taxResponse.next }));
            break;
          }
          case 'bmi': {
            const bmiResponse = await bmiProjectsApi.list({ page: nextPage + 1, page_size: PAGE_SIZE });
            if (bmiResponse.results?.length > 0) {
              setBmiProjects(prev => [...prev, ...bmiResponse.results]);
            }
            setHasMore(prev => ({ ...prev, bmi: !!bmiResponse.next }));
            break;
          }
          case 'revenue': {
            const revenueResponse = await revenueApi.list({ page: nextPage + 1, page_size: PAGE_SIZE });
            if (revenueResponse.results?.length > 0) {
              setRevenues(prev => [...prev, ...revenueResponse.results]);
            }
            setHasMore(prev => ({ ...prev, revenue: !!revenueResponse.next }));
            break;
          }
          case 'companies': {
            const companiesResponse = await companiesApi.list({ page: nextPage + 1, page_size: PAGE_SIZE });
            if (companiesResponse.results?.length > 0) {
              setCompanies(prev => [...prev, ...companiesResponse.results]);
            }
            setHasMore(prev => ({ ...prev, companies: !!companiesResponse.next }));
            break;
          }
          case 'hours': {
            const hoursResponse = await billableHoursApi.list({ page: nextPage + 1, page_size: PAGE_SIZE });
            if (hoursResponse.results?.length > 0) {
              setHours(prev => [...prev, ...hoursResponse.results]);
            }
            setHasMore(prev => ({ ...prev, hours: !!hoursResponse.next }));
            break;
          }
        }
        setPages(prev => ({ ...prev, [activeTab]: nextPage }));
      }
    } catch (error) {
      console.warn('Error loading more data:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [activeTab, loadingMore, hasMore, pages, usingDemoData]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    
    // Load more when near bottom (100px threshold)
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMore();
    }
  }, [loadMore]);

  const handleRefresh = async () => {
    setPages({ audits: 0, tax: 0, bmi: 0, revenue: 0, companies: 0, hours: 0 });
    setHasMore({ audits: true, tax: true, bmi: true, revenue: true, companies: true, hours: true });
    await loadInitialData();
  };

  // Filter data based on search
  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();
    switch (activeTab) {
      case 'audits':
        return audits.filter(a => 
          (a.company_name || '').toLowerCase().includes(query) ||
          (a.fiscal_year || '').includes(query)
        );
      case 'tax':
        return taxReturns.filter(t => 
          (t.company_name || '').toLowerCase().includes(query) ||
          (t.tax_year || '').includes(query)
        );
      case 'bmi':
        return bmiProjects.filter(b => 
          (b.project_name || '').toLowerCase().includes(query) ||
          (b.company_name || '').toLowerCase().includes(query)
        );
      case 'revenue':
        return revenues.filter(r => 
          (r.company_name || '').toLowerCase().includes(query) ||
          (r.invoice_number || '').toLowerCase().includes(query)
        );
      case 'companies':
        return companies.filter(c => 
          (c.name || '').toLowerCase().includes(query) ||
          (c.industry || '').toLowerCase().includes(query)
        );
      case 'hours':
        return hours.filter(h => 
          (h.employee_name || '').toLowerCase().includes(query) ||
          (h.company_name || '').toLowerCase().includes(query)
        );
      default:
        return [];
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('zh-HK', { style: 'currency', currency: 'HKD', notation: 'compact', maximumFractionDigits: 1 }).format(amount);
  };

  // Status colors
  const getAuditStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'NOT_STARTED': 'text-gray-600 bg-gray-50',
      'PLANNING': 'text-blue-600 bg-blue-50',
      'FIELDWORK': 'text-purple-600 bg-purple-50',
      'REVIEW': 'text-orange-600 bg-orange-50',
      'REPORTING': 'text-cyan-600 bg-cyan-50',
      'COMPLETED': 'text-green-600 bg-green-50',
      'ON_HOLD': 'text-red-600 bg-red-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getTaxStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'text-gray-600 bg-gray-50',
      'IN_PROGRESS': 'text-blue-600 bg-blue-50',
      'UNDER_REVIEW': 'text-orange-600 bg-orange-50',
      'SUBMITTED': 'text-cyan-600 bg-cyan-50',
      'ACCEPTED': 'text-green-600 bg-green-50',
      'REJECTED': 'text-red-600 bg-red-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getBmiStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ACTIVE': 'text-blue-600 bg-blue-50',
      'ON_TRACK': 'text-green-600 bg-green-50',
      'DELAYED': 'text-orange-600 bg-orange-50',
      'AT_RISK': 'text-red-600 bg-red-50',
      'COMPLETED': 'text-emerald-600 bg-emerald-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getRevenueStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'text-yellow-600 bg-yellow-50',
      'PARTIAL': 'text-blue-600 bg-blue-50',
      'RECEIVED': 'text-green-600 bg-green-50',
      'OVERDUE': 'text-red-600 bg-red-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getBmiStatusIcon = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return <IconCircleCheck className="h-3.5 w-3.5 text-green-500" />;
      case 'DELAYED': return <IconClock className="h-3.5 w-3.5 text-orange-500" />;
      case 'AT_RISK': return <IconAlertTriangle className="h-3.5 w-3.5 text-red-500" />;
      default: return <IconTrendingUp className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  const filteredData = getFilteredData();

  return (
    <div className='flex h-full flex-col border rounded-lg bg-card overflow-hidden'>
      {/* Fixed Header */}
      <div className='shrink-0 border-b p-3'>
        <div className='flex items-center justify-between mb-2'>
          <h3 className='font-semibold text-sm'>業務數據</h3>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            onClick={handleRefresh}
            disabled={loading}
          >
            <IconRefresh className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </Button>
        </div>
        <div className='relative'>
          <IconSearch className='absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='搜索...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='h-8 pl-8 text-xs'
          />
        </div>
      </div>

      {/* Tab Navigation with Arrows */}
      <div className='shrink-0 flex items-center border-b bg-muted/30'>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 shrink-0'
          onClick={scrollTabsLeft}
          disabled={!canScrollLeft}
        >
          <IconChevronLeft className='h-4 w-4' />
        </Button>
        
        <div className='flex-1 flex items-center overflow-hidden'>
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 py-2 text-xs transition-colors',
                  activeTab === tab.id
                    ? 'bg-background border-b-2 border-primary text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className='h-3.5 w-3.5' />
                <span className='hidden sm:inline truncate'>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 shrink-0'
          onClick={scrollTabsRight}
          disabled={!canScrollRight}
        >
          <IconChevronRight className='h-4 w-4' />
        </Button>
      </div>

      {/* Scrollable Content with Infinite Loading */}
      <div 
        ref={scrollRef}
        className='flex-1 overflow-auto'
        onScroll={handleScroll}
      >
        <div className='p-2 space-y-2'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <IconLoader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
          ) : filteredData.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground text-sm'>
              無數據
            </div>
          ) : (
            <>
              {/* Audits */}
              {activeTab === 'audits' && (filteredData as AuditProject[]).map((audit) => (
                <div
                  key={audit.id}
                  className='p-2.5 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors'
                  onClick={() => onSelectItem?.('audit', audit)}
                >
                  <div className='flex items-start justify-between gap-2 mb-1.5'>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium truncate'>{audit.company_name}</p>
                      <p className='text-xs text-muted-foreground'>
                        {audit.fiscal_year} • {audit.audit_type}
                      </p>
                    </div>
                    <Badge variant='outline' className={cn('text-[10px] px-1.5 shrink-0', getAuditStatusColor(audit.status))}>
                      {audit.status}
                    </Badge>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Progress value={audit.progress} className='h-1.5 flex-1' />
                    <span className='text-[10px] text-muted-foreground w-8'>{audit.progress}%</span>
                  </div>
                </div>
              ))}

              {/* Tax Returns */}
              {activeTab === 'tax' && (filteredData as TaxReturnCase[]).map((taxReturn) => (
                <div
                  key={taxReturn.id}
                  className='p-2.5 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors'
                  onClick={() => onSelectItem?.('tax', taxReturn)}
                >
                  <div className='flex items-start justify-between gap-2 mb-1.5'>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium truncate'>{taxReturn.company_name}</p>
                      <p className='text-xs text-muted-foreground'>
                        {taxReturn.tax_year} • {taxReturn.tax_type}
                      </p>
                    </div>
                    <Badge variant='outline' className={cn('text-[10px] px-1.5 shrink-0', getTaxStatusColor(taxReturn.status))}>
                      {taxReturn.status}
                    </Badge>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Progress value={taxReturn.progress} className='h-1.5 flex-1' />
                    <span className='text-[10px] text-muted-foreground w-8'>{taxReturn.progress}%</span>
                  </div>
                  {taxReturn.tax_amount && (
                    <p className='text-[10px] text-muted-foreground mt-1'>
                      稅額: {formatCurrency(taxReturn.tax_amount)}
                    </p>
                  )}
                </div>
              ))}

              {/* BMI Projects */}
              {activeTab === 'bmi' && (filteredData as BMIIPOPRRecord[]).map((project) => (
                <div
                  key={project.id}
                  className='p-2.5 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors'
                  onClick={() => onSelectItem?.('bmi', project)}
                >
                  <div className='flex items-start justify-between gap-2 mb-1.5'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-1.5'>
                        {getBmiStatusIcon(project.status)}
                        <p className='text-sm font-medium truncate'>{project.project_name}</p>
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        {project.company_name} • {project.project_type}
                      </p>
                    </div>
                    <Badge variant='outline' className={cn('text-[10px] px-1.5 shrink-0', getBmiStatusColor(project.status))}>
                      {project.stage}
                    </Badge>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Progress value={project.progress} className='h-1.5 flex-1' />
                    <span className='text-[10px] text-muted-foreground w-8'>{project.progress}%</span>
                  </div>
                  <p className='text-[10px] font-medium text-primary mt-1'>
                    {formatCurrency(project.estimated_value)}
                  </p>
                </div>
              ))}

              {/* Revenue */}
              {activeTab === 'revenue' && (filteredData as Revenue[]).map((revenue) => (
                <div
                  key={revenue.id}
                  className='p-2.5 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors'
                  onClick={() => onSelectItem?.('revenue', revenue)}
                >
                  <div className='flex items-start justify-between gap-2 mb-1.5'>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium truncate'>{revenue.company_name}</p>
                      <p className='text-xs text-muted-foreground'>{revenue.invoice_number}</p>
                    </div>
                    <Badge variant='outline' className={cn('text-[10px] px-1.5 shrink-0', getRevenueStatusColor(revenue.status))}>
                      {revenue.status}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <p className='text-xs font-medium'>{formatCurrency(revenue.total_amount)}</p>
                    <p className='text-[10px] text-muted-foreground'>到期: {revenue.due_date}</p>
                  </div>
                </div>
              ))}

              {/* Companies */}
              {activeTab === 'companies' && (filteredData as Company[]).map((company) => (
                <div
                  key={company.id}
                  className='p-2.5 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors'
                  onClick={() => onSelectItem?.('company', company)}
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium truncate'>{company.name}</p>
                      <p className='text-xs text-muted-foreground'>{company.industry}</p>
                    </div>
                    <Badge variant='outline' className='text-[10px] px-1.5 shrink-0'>
                      {company.registration_number}
                    </Badge>
                  </div>
                  {company.contact_person && (
                    <p className='text-[10px] text-muted-foreground mt-1'>
                      聯絡人: {company.contact_person}
                    </p>
                  )}
                </div>
              ))}

              {/* Hours */}
              {activeTab === 'hours' && (filteredData as BillableHour[]).map((hour) => (
                <div
                  key={hour.id}
                  className='p-2.5 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors'
                  onClick={() => onSelectItem?.('hour', hour)}
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium truncate'>{hour.employee_name}</p>
                      <p className='text-xs text-muted-foreground'>{hour.company_name}</p>
                    </div>
                    <Badge variant='outline' className='text-[10px] px-1.5 shrink-0'>
                      {hour.role}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between mt-1'>
                    <p className='text-xs'>{hour.actual_hours}h @ {formatCurrency(hour.base_hourly_rate * hour.hourly_rate_multiplier)}/h</p>
                    <p className='text-[10px] text-muted-foreground'>{hour.date}</p>
                  </div>
                </div>
              ))}

              {/* Loading More Indicator */}
              {loadingMore && (
                <div className='flex items-center justify-center py-4'>
                  <IconLoader2 className='h-5 w-5 animate-spin text-muted-foreground' />
                  <span className='ml-2 text-xs text-muted-foreground'>載入更多...</span>
                </div>
              )}

              {/* End of Data Indicator */}
              {!hasMore[activeTab] && filteredData.length > 0 && (
                <div className='text-center py-4 text-xs text-muted-foreground'>
                  已顯示全部數據
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className='shrink-0 border-t p-2 bg-muted/30'>
        <div className='flex justify-between text-[10px] text-muted-foreground'>
          <span>{filteredData.length} 項</span>
          {usingDemoData && (
            <Badge variant='secondary' className='text-[10px] px-1 py-0'>
              演示數據
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
