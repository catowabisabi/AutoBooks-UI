'use client';

import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  IconPlus,
  IconRefresh,
  IconLoader2,
  IconEdit,
  IconCalendar,
  IconLock,
  IconLockOpen,
} from '@tabler/icons-react';
import { 
  getPeriods, 
  getFiscalYears, 
  createPeriod, 
  updatePeriod, 
  Period, 
  FiscalYear 
} from '@/app/dashboard/finance/services';

export default function PeriodsPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('');
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    fiscal_year: '',
    start_date: '',
    end_date: '',
    period_number: 1,
    is_closed: false,
  });

  useEffect(() => {
    loadFiscalYears();
  }, []);

  useEffect(() => {
    if (selectedFiscalYear) {
      loadPeriods();
    }
  }, [selectedFiscalYear]);

  const loadFiscalYears = async () => {
    try {
      const data = await getFiscalYears();
      const fys = data.results || getDemoFiscalYears();
      setFiscalYears(fys);
      // Auto-select current fiscal year
      const currentFY = fys.find(fy => fy.is_current);
      if (currentFY) {
        setSelectedFiscalYear(currentFY.id);
      } else if (fys.length > 0) {
        setSelectedFiscalYear(fys[0].id);
      }
    } catch (error) {
      console.error('Failed to load fiscal years:', error);
      const fys = getDemoFiscalYears();
      setFiscalYears(fys);
      setSelectedFiscalYear(fys[0].id);
    }
  };

  const loadPeriods = async () => {
    setIsLoading(true);
    try {
      const data = await getPeriods({ fiscal_year: selectedFiscalYear });
      setPeriods(data.results || getDemoPeriods(selectedFiscalYear));
    } catch (error) {
      console.error('Failed to load periods:', error);
      setPeriods(getDemoPeriods(selectedFiscalYear));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.fiscal_year || !formData.start_date || !formData.end_date) {
      alert('All fields are required / 所有欄位皆為必填');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createPeriod(formData);
      setShowCreateDialog(false);
      resetForm();
      loadPeriods();
    } catch (error) {
      console.error('Failed to create period:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (period: Period) => {
    setEditingPeriod(period);
    setFormData({
      name: period.name,
      fiscal_year: period.fiscal_year?.toString() || selectedFiscalYear,
      start_date: period.start_date,
      end_date: period.end_date,
      period_number: period.period_number || 1,
      is_closed: period.is_closed || false,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!editingPeriod) return;
    
    setIsSubmitting(true);
    try {
      await updatePeriod(editingPeriod.id, formData);
      setShowEditDialog(false);
      resetForm();
      loadPeriods();
    } catch (error) {
      console.error('Failed to update period:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      fiscal_year: selectedFiscalYear,
      start_date: '',
      end_date: '',
      period_number: periods.length + 1,
      is_closed: false,
    });
    setEditingPeriod(null);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Determine period status
  const getPeriodStatus = (period: Period) => {
    if (period.is_closed) return { label: 'Closed / 已結帳', variant: 'secondary' as const, icon: IconLock };
    
    const today = new Date();
    const startDate = new Date(period.start_date);
    const endDate = new Date(period.end_date);
    
    if (today < startDate) return { label: 'Future / 未來', variant: 'outline' as const, icon: IconLockOpen };
    if (today > endDate) return { label: 'Past / 過去', variant: 'secondary' as const, icon: IconLockOpen };
    return { label: 'Current / 目前', variant: 'default' as const, icon: IconLockOpen };
  };

  const selectedFY = fiscalYears.find(fy => fy.id === selectedFiscalYear);
  const currentPeriod = periods.find(p => {
    const today = new Date();
    return new Date(p.start_date) <= today && today <= new Date(p.end_date) && !p.is_closed;
  });
  const closedPeriodsCount = periods.filter(p => p.is_closed).length;

  const PeriodForm = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Fiscal Year / 會計年度 *</Label>
        <Select
          value={formData.fiscal_year}
          onValueChange={(v) => setFormData({ ...formData, fiscal_year: v })}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select fiscal year" />
          </SelectTrigger>
          <SelectContent>
            {fiscalYears.map((fy) => (
              <SelectItem key={fy.id} value={fy.id}>
                {fy.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Period # / 期間編號 *</Label>
        <Input
          type="number"
          min={1}
          max={12}
          className="col-span-3"
          value={formData.period_number}
          onChange={(e) => setFormData({ ...formData, period_number: parseInt(e.target.value) || 1 })}
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Name / 名稱 *</Label>
        <Input
          className="col-span-3"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="January 2025, Q1 2025..."
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Start Date / 開始日期 *</Label>
        <Input
          type="date"
          className="col-span-3"
          value={formData.start_date}
          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">End Date / 結束日期 *</Label>
        <Input
          type="date"
          className="col-span-3"
          value={formData.end_date}
          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
        />
      </div>
      
      {editingPeriod && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Closed / 已結帳</Label>
          <div className="col-span-3 flex items-center gap-2">
            <Switch
              checked={formData.is_closed}
              onCheckedChange={(checked) => setFormData({ ...formData, is_closed: checked })}
            />
            <span className="text-sm text-muted-foreground">
              {formData.is_closed 
                ? 'Period is closed for entries / 期間已結帳' 
                : 'Open for journal entries / 可新增日記帳'}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <PageContainer scrollable>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Accounting Periods / 會計期間
            </h1>
            <p className="text-muted-foreground">
              Manage accounting periods within fiscal years
              <br />
              管理會計年度內的會計期間
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadPeriods}>
              <IconRefresh className="mr-2 h-4 w-4" />
              Refresh / 重新整理
            </Button>
            <Button onClick={() => {
              resetForm();
              setShowCreateDialog(true);
            }}>
              <IconPlus className="mr-2 h-4 w-4" />
              Add Period / 新增期間
            </Button>
          </div>
        </div>

        {/* Fiscal Year Selector */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Select Fiscal Year / 選擇會計年度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select
                value={selectedFiscalYear}
                onValueChange={setSelectedFiscalYear}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select fiscal year" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears.map((fy) => (
                    <SelectItem key={fy.id} value={fy.id}>
                      <div className="flex items-center gap-2">
                        {fy.name}
                        {fy.is_current && <Badge variant="outline" className="text-xs">Current</Badge>}
                        {fy.is_closed && <IconLock className="h-3 w-3" />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedFY && (
                <div className="text-sm text-muted-foreground">
                  {formatDate(selectedFY.start_date)} ~ {formatDate(selectedFY.end_date)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <IconCalendar className="h-4 w-4" />
                Total Periods / 總期間數
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{periods.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <IconLock className="h-4 w-4" />
                Closed / 已結帳
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{closedPeriodsCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5">
            <CardHeader className="pb-2">
              <CardDescription>Current Period / 目前期間</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {currentPeriod ? currentPeriod.name : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Periods Table */}
        <Card>
          <CardHeader>
            <CardTitle>Periods / 會計期間列表</CardTitle>
            <CardDescription>
              {selectedFY 
                ? `Periods for ${selectedFY.name}`
                : 'Select a fiscal year to view periods'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : periods.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <IconCalendar className="mx-auto h-12 w-12 mb-4" />
                <p>No periods configured for this fiscal year</p>
                <p className="text-sm">此會計年度尚未設定期間</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    resetForm();
                    setShowCreateDialog(true);
                  }}
                >
                  <IconPlus className="mr-2 h-4 w-4" />
                  Create Periods / 建立期間
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Period / 期間</TableHead>
                    <TableHead>Start Date / 開始日期</TableHead>
                    <TableHead>End Date / 結束日期</TableHead>
                    <TableHead>Status / 狀態</TableHead>
                    <TableHead>Actions / 操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods
                    .sort((a, b) => (a.period_number || 0) - (b.period_number || 0))
                    .map((period) => {
                      const status = getPeriodStatus(period);
                      const StatusIcon = status.icon;
                      return (
                        <TableRow key={period.id}>
                          <TableCell className="font-medium">
                            {period.period_number}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {period.is_closed && (
                                <IconLock className="h-4 w-4 text-muted-foreground" />
                              )}
                              {period.name}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(period.start_date)}</TableCell>
                          <TableCell>{formatDate(period.end_date)}</TableCell>
                          <TableCell>
                            <Badge variant={status.variant} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(period)}
                            >
                              <IconEdit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Period / 新增會計期間</DialogTitle>
              <DialogDescription>
                Create a new accounting period
              </DialogDescription>
            </DialogHeader>
            <PeriodForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                Cancel / 取消
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={isSubmitting || !formData.name || !formData.start_date || !formData.end_date}
              >
                {isSubmitting ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create / 建立
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Period / 編輯會計期間</DialogTitle>
              <DialogDescription>
                Update accounting period settings
              </DialogDescription>
            </DialogHeader>
            <PeriodForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
                Cancel / 取消
              </Button>
              <Button onClick={handleUpdate} disabled={isSubmitting}>
                {isSubmitting ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update / 更新
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

// Demo fiscal years
function getDemoFiscalYears(): FiscalYear[] {
  return [
    {
      id: '1',
      name: 'FY2025',
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      is_closed: false,
      is_current: true,
    },
    {
      id: '2',
      name: 'FY2024',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      is_closed: true,
      is_current: false,
    },
  ];
}

// Demo periods
function getDemoPeriods(fiscalYearId: string): Period[] {
  if (fiscalYearId === '2') {
    // FY2024 - all closed
    return Array.from({ length: 12 }, (_, i) => ({
      id: `2024-${i + 1}`,
      name: `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][i]} 2024`,
      fiscal_year: 2,
      start_date: `2024-${String(i + 1).padStart(2, '0')}-01`,
      end_date: `2024-${String(i + 1).padStart(2, '0')}-${i === 1 ? '29' : [3, 5, 8, 10].includes(i) ? '30' : '31'}`,
      period_number: i + 1,
      is_closed: true,
    }));
  }
  
  // FY2025 - some open
  const currentMonth = new Date().getMonth();
  return Array.from({ length: 12 }, (_, i) => ({
    id: `2025-${i + 1}`,
    name: `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][i]} 2025`,
    fiscal_year: 1,
    start_date: `2025-${String(i + 1).padStart(2, '0')}-01`,
    end_date: `2025-${String(i + 1).padStart(2, '0')}-${i === 1 ? '28' : [3, 5, 8, 10].includes(i) ? '30' : '31'}`,
    period_number: i + 1,
    is_closed: i < currentMonth,
  }));
}
