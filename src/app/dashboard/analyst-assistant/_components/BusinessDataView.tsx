'use client';

import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  IconSearch,
  IconRefresh,
  IconDownload,
  IconFilter,
  IconLoader2,
  IconFileAnalytics,
  IconReceipt,
  IconBuildingSkyscraper,
  IconCash,
  IconUsers,
  IconCalendarStats
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
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

interface BusinessDataViewProps {
  onSelectItem?: (type: string, item: any) => void;
}

const TABS = [
  { id: 'audits', icon: IconFileAnalytics, label: '審計項目', color: 'text-blue-500' },
  { id: 'tax', icon: IconReceipt, label: '稅務案件', color: 'text-green-500' },
  { id: 'bmi', icon: IconBuildingSkyscraper, label: 'IPO/PR', color: 'text-purple-500' },
  { id: 'revenue', icon: IconCash, label: '收入', color: 'text-yellow-500' },
  { id: 'companies', icon: IconUsers, label: '客戶', color: 'text-cyan-500' },
  { id: 'hours', icon: IconCalendarStats, label: '計費時數', color: 'text-orange-500' },
];

export default function BusinessDataView({ onSelectItem }: BusinessDataViewProps) {
  const [activeTab, setActiveTab] = useState('audits');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [audits, setAudits] = useState<AuditProject[]>([]);
  const [taxReturns, setTaxReturns] = useState<TaxReturnCase[]>([]);
  const [bmiProjects, setBmiProjects] = useState<BMIIPOPRRecord[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [hours, setHours] = useState<BillableHour[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [auditsRes, taxRes, bmiRes, revenueRes, companiesRes, hoursRes] = await Promise.all([
        auditsApi.list({ page_size: 100 }).catch(() => ({ results: [] })),
        taxReturnsApi.list({ page_size: 100 }).catch(() => ({ results: [] })),
        bmiProjectsApi.list({ page_size: 100 }).catch(() => ({ results: [] })),
        revenueApi.list({ page_size: 100 }).catch(() => ({ results: [] })),
        companiesApi.list({ page_size: 100 }).catch(() => ({ results: [] })),
        billableHoursApi.list({ page_size: 100 }).catch(() => ({ results: [] }))
      ]);

      setAudits(auditsRes.results || []);
      setTaxReturns(taxRes.results || []);
      setBmiProjects(bmiRes.results || []);
      setRevenues(revenueRes.results || []);
      setCompanies(companiesRes.results || []);
      setHours(hoursRes.results || []);
    } catch (error) {
      console.error('Error loading business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('zh-HK', { 
      style: 'currency', 
      currency: 'HKD',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'COMPLETED': 'bg-green-100 text-green-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'PLANNING': 'bg-cyan-100 text-cyan-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'ON_TRACK': 'bg-green-100 text-green-800',
      'DELAYED': 'bg-orange-100 text-orange-800',
      'AT_RISK': 'bg-red-100 text-red-800',
      'ACTIVE': 'bg-blue-100 text-blue-800',
      'RECEIVED': 'bg-green-100 text-green-800',
      'OVERDUE': 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={cn('text-[10px]', colors[status] || 'bg-gray-100 text-gray-800')}>
        {status}
      </Badge>
    );
  };

  const filterData = <T extends Record<string, any>>(data: T[], query: string): T[] => {
    if (!query) return data;
    const lowerQuery = query.toLowerCase();
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(lowerQuery)
      )
    );
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'audits': return filterData(audits, searchQuery);
      case 'tax': return filterData(taxReturns, searchQuery);
      case 'bmi': return filterData(bmiProjects, searchQuery);
      case 'revenue': return filterData(revenues, searchQuery);
      case 'companies': return filterData(companies, searchQuery);
      case 'hours': return filterData(hours, searchQuery);
      default: return [];
    }
  };

  return (
    <div className='flex flex-col h-full border rounded-lg bg-card overflow-hidden'>
      {/* Header */}
      <div className='shrink-0 border-b p-3 bg-muted/30'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='font-semibold'>業務數據總覽</h3>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={loadData} disabled={loading}>
              <IconRefresh className={cn('h-4 w-4 mr-1', loading && 'animate-spin')} />
              刷新
            </Button>
            <Button 
              variant='outline' 
              size='sm' 
              onClick={() => exportToCSV(getCurrentData(), activeTab)}
            >
              <IconDownload className='h-4 w-4 mr-1' />
              導出
            </Button>
          </div>
        </div>
        <div className='relative'>
          <IconSearch className='absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='搜索...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-9'
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='flex-1 flex flex-col overflow-hidden'>
        <TabsList className='shrink-0 grid grid-cols-6 m-3 mb-0'>
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className='text-xs gap-1'>
                <Icon className={cn('h-3.5 w-3.5', tab.color)} />
                <span className='hidden lg:inline'>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Content */}
        <div className='flex-1 overflow-hidden p-3'>
          {loading ? (
            <div className='flex items-center justify-center h-full'>
              <IconLoader2 className='h-8 w-8 animate-spin text-muted-foreground' />
            </div>
          ) : (
            <>
              {/* Audits Table */}
              <TabsContent value='audits' className='h-full m-0'>
                <ScrollArea className='h-full'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>公司名稱</TableHead>
                        <TableHead>財年</TableHead>
                        <TableHead>類型</TableHead>
                        <TableHead>進度</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>截止日期</TableHead>
                        <TableHead>負責人</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterData(audits, searchQuery).map(audit => (
                        <TableRow 
                          key={audit.id} 
                          className='cursor-pointer hover:bg-muted/50'
                          onClick={() => onSelectItem?.('audit', audit)}
                        >
                          <TableCell className='font-medium'>{audit.company_name}</TableCell>
                          <TableCell>{audit.fiscal_year}</TableCell>
                          <TableCell>{audit.audit_type}</TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <div className='w-16 h-2 bg-muted rounded-full overflow-hidden'>
                                <div 
                                  className='h-full bg-primary' 
                                  style={{ width: `${audit.progress}%` }}
                                />
                              </div>
                              <span className='text-xs'>{audit.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(audit.status)}</TableCell>
                          <TableCell>{audit.deadline}</TableCell>
                          <TableCell>{audit.assigned_to_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              {/* Tax Returns Table */}
              <TabsContent value='tax' className='h-full m-0'>
                <ScrollArea className='h-full'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>公司名稱</TableHead>
                        <TableHead>稅務年度</TableHead>
                        <TableHead>稅種</TableHead>
                        <TableHead>進度</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>稅額</TableHead>
                        <TableHead>截止日期</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterData(taxReturns, searchQuery).map(tax => (
                        <TableRow 
                          key={tax.id}
                          className='cursor-pointer hover:bg-muted/50'
                          onClick={() => onSelectItem?.('tax', tax)}
                        >
                          <TableCell className='font-medium'>{tax.company_name}</TableCell>
                          <TableCell>{tax.tax_year}</TableCell>
                          <TableCell>{tax.tax_type}</TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <div className='w-16 h-2 bg-muted rounded-full overflow-hidden'>
                                <div 
                                  className='h-full bg-green-500' 
                                  style={{ width: `${tax.progress}%` }}
                                />
                              </div>
                              <span className='text-xs'>{tax.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(tax.status)}</TableCell>
                          <TableCell>{formatCurrency(tax.tax_amount)}</TableCell>
                          <TableCell>{tax.deadline}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              {/* BMI Projects Table */}
              <TabsContent value='bmi' className='h-full m-0'>
                <ScrollArea className='h-full'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>項目名稱</TableHead>
                        <TableHead>公司</TableHead>
                        <TableHead>類型</TableHead>
                        <TableHead>階段</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>估值</TableHead>
                        <TableHead>進度</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterData(bmiProjects, searchQuery).map(project => (
                        <TableRow 
                          key={project.id}
                          className='cursor-pointer hover:bg-muted/50'
                          onClick={() => onSelectItem?.('bmi', project)}
                        >
                          <TableCell className='font-medium'>{project.project_name}</TableCell>
                          <TableCell>{project.company_name}</TableCell>
                          <TableCell>{project.project_type}</TableCell>
                          <TableCell>{project.stage}</TableCell>
                          <TableCell>{getStatusBadge(project.status)}</TableCell>
                          <TableCell>{formatCurrency(project.estimated_value)}</TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <div className='w-16 h-2 bg-muted rounded-full overflow-hidden'>
                                <div 
                                  className='h-full bg-purple-500' 
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <span className='text-xs'>{project.progress}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              {/* Revenue Table */}
              <TabsContent value='revenue' className='h-full m-0'>
                <ScrollArea className='h-full'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>公司名稱</TableHead>
                        <TableHead>發票號</TableHead>
                        <TableHead>總金額</TableHead>
                        <TableHead>已收金額</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>發票日期</TableHead>
                        <TableHead>到期日</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterData(revenues, searchQuery).map(rev => (
                        <TableRow 
                          key={rev.id}
                          className='cursor-pointer hover:bg-muted/50'
                          onClick={() => onSelectItem?.('revenue', rev)}
                        >
                          <TableCell className='font-medium'>{rev.company_name}</TableCell>
                          <TableCell>{rev.invoice_number}</TableCell>
                          <TableCell>{formatCurrency(rev.total_amount)}</TableCell>
                          <TableCell>{formatCurrency(rev.received_amount)}</TableCell>
                          <TableCell>{getStatusBadge(rev.status)}</TableCell>
                          <TableCell>{rev.invoice_date}</TableCell>
                          <TableCell>{rev.due_date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              {/* Companies Table */}
              <TabsContent value='companies' className='h-full m-0'>
                <ScrollArea className='h-full'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>公司名稱</TableHead>
                        <TableHead>註冊號碼</TableHead>
                        <TableHead>行業</TableHead>
                        <TableHead>聯絡人</TableHead>
                        <TableHead>電郵</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterData(companies, searchQuery).map(company => (
                        <TableRow 
                          key={company.id}
                          className='cursor-pointer hover:bg-muted/50'
                          onClick={() => onSelectItem?.('company', company)}
                        >
                          <TableCell className='font-medium'>{company.name}</TableCell>
                          <TableCell>{company.registration_number}</TableCell>
                          <TableCell>{company.industry}</TableCell>
                          <TableCell>{company.contact_person}</TableCell>
                          <TableCell>{company.contact_email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              {/* Billable Hours Table */}
              <TabsContent value='hours' className='h-full m-0'>
                <ScrollArea className='h-full'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>員工</TableHead>
                        <TableHead>公司</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>日期</TableHead>
                        <TableHead>時數</TableHead>
                        <TableHead>時薪</TableHead>
                        <TableHead>已開票</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterData(hours, searchQuery).map(hour => (
                        <TableRow 
                          key={hour.id}
                          className='cursor-pointer hover:bg-muted/50'
                          onClick={() => onSelectItem?.('hour', hour)}
                        >
                          <TableCell className='font-medium'>{hour.employee_name}</TableCell>
                          <TableCell>{hour.company_name}</TableCell>
                          <TableCell>{hour.role}</TableCell>
                          <TableCell>{hour.date}</TableCell>
                          <TableCell>{hour.actual_hours}h</TableCell>
                          <TableCell>{formatCurrency(hour.base_hourly_rate * hour.hourly_rate_multiplier)}</TableCell>
                          <TableCell>
                            <Badge variant={hour.is_invoiced ? 'default' : 'secondary'}>
                              {hour.is_invoiced ? '已開票' : '未開票'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>

      {/* Footer */}
      <div className='shrink-0 border-t p-2 bg-muted/30'>
        <div className='flex justify-between text-xs text-muted-foreground'>
          <span>共 {getCurrentData().length} 條記錄</span>
          <span>最後更新: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
