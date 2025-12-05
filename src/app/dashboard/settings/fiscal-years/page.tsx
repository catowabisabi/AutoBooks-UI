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
  IconPlus,
  IconRefresh,
  IconLoader2,
  IconEdit,
  IconCalendarEvent,
  IconLock,
} from '@tabler/icons-react';
import { getFiscalYears, createFiscalYear, updateFiscalYear, FiscalYear } from '@/app/dashboard/finance/services';

export default function FiscalYearsPage() {
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingFiscalYear, setEditingFiscalYear] = useState<FiscalYear | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_closed: false,
    is_current: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getFiscalYears();
      setFiscalYears(data.results || getDemoFiscalYears());
    } catch (error) {
      console.error('Failed to load fiscal years:', error);
      setFiscalYears(getDemoFiscalYears());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.start_date || !formData.end_date) {
      alert('All fields are required / 所有欄位皆為必填');
      return;
    }
    
    if (formData.start_date >= formData.end_date) {
      alert('End date must be after start date / 結束日期必須在開始日期之後');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createFiscalYear(formData);
      setShowCreateDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to create fiscal year:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (fiscalYear: FiscalYear) => {
    setEditingFiscalYear(fiscalYear);
    setFormData({
      name: fiscalYear.name,
      start_date: fiscalYear.start_date,
      end_date: fiscalYear.end_date,
      is_closed: fiscalYear.is_closed || false,
      is_current: fiscalYear.is_current || false,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!editingFiscalYear) return;
    
    setIsSubmitting(true);
    try {
      await updateFiscalYear(editingFiscalYear.id, formData);
      setShowEditDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to update fiscal year:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-generate fiscal year name based on dates
  const generateFiscalYearName = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return '';
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    if (startYear === endYear) {
      return `FY${startYear}`;
    }
    return `FY${startYear}-${endYear.toString().slice(-2)}`;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
      is_closed: false,
      is_current: false,
    });
    setEditingFiscalYear(null);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Calculate fiscal year duration
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return `${months} months / ${months}個月`;
  };

  // Determine fiscal year status
  const getFiscalYearStatus = (fy: FiscalYear) => {
    if (fy.is_closed) return { label: 'Closed / 已結帳', variant: 'secondary' as const };
    if (fy.is_current) return { label: 'Current / 目前', variant: 'default' as const };
    
    const today = new Date();
    const startDate = new Date(fy.start_date);
    const endDate = new Date(fy.end_date);
    
    if (today < startDate) return { label: 'Future / 未來', variant: 'outline' as const };
    if (today > endDate) return { label: 'Past / 過去', variant: 'secondary' as const };
    return { label: 'Active / 進行中', variant: 'default' as const };
  };

  const FiscalYearForm = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Name / 名稱 *</Label>
        <Input
          className="col-span-3"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="FY2025, FY2024-25..."
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Start Date / 開始日期 *</Label>
        <Input
          type="date"
          className="col-span-3"
          value={formData.start_date}
          onChange={(e) => {
            const newStart = e.target.value;
            setFormData({ 
              ...formData, 
              start_date: newStart,
              name: formData.name || generateFiscalYearName(newStart, formData.end_date)
            });
          }}
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">End Date / 結束日期 *</Label>
        <Input
          type="date"
          className="col-span-3"
          value={formData.end_date}
          onChange={(e) => {
            const newEnd = e.target.value;
            setFormData({ 
              ...formData, 
              end_date: newEnd,
              name: formData.name || generateFiscalYearName(formData.start_date, newEnd)
            });
          }}
        />
      </div>
      
      {formData.start_date && formData.end_date && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Duration / 期間</Label>
          <div className="col-span-3 text-sm text-muted-foreground">
            {calculateDuration(formData.start_date, formData.end_date)}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Current Year / 目前年度</Label>
        <div className="col-span-3 flex items-center gap-2">
          <Switch
            checked={formData.is_current}
            onCheckedChange={(checked) => setFormData({ ...formData, is_current: checked })}
          />
          <span className="text-sm text-muted-foreground">
            Set as the current fiscal year / 設為目前會計年度
          </span>
        </div>
      </div>
      
      {editingFiscalYear && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Closed / 已結帳</Label>
          <div className="col-span-3 flex items-center gap-2">
            <Switch
              checked={formData.is_closed}
              onCheckedChange={(checked) => setFormData({ ...formData, is_closed: checked })}
            />
            <span className="text-sm text-muted-foreground">
              {formData.is_closed 
                ? 'Fiscal year is closed for entries / 會計年度已結帳' 
                : 'Open for journal entries / 可新增日記帳'}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const currentFiscalYear = fiscalYears.find(fy => fy.is_current);

  return (
    <PageContainer scrollable>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Fiscal Years / 財年管理
            </h1>
            <p className="text-muted-foreground">
              Manage accounting fiscal years
              <br />
              管理會計年度
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <IconRefresh className="mr-2 h-4 w-4" />
              Refresh / 重新整理
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Add Fiscal Year / 新增財年
            </Button>
          </div>
        </div>

        {/* Current Fiscal Year Info */}
        {currentFiscalYear && (
          <Card className="bg-primary/5">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <IconCalendarEvent className="h-4 w-4" />
                Current Fiscal Year / 目前會計年度
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">
                    {currentFiscalYear.name}
                  </div>
                  <div>
                    <div className="font-medium">
                      {formatDate(currentFiscalYear.start_date)} ~ {formatDate(currentFiscalYear.end_date)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {calculateDuration(currentFiscalYear.start_date, currentFiscalYear.end_date)}
                    </div>
                  </div>
                </div>
                {currentFiscalYear.is_closed ? (
                  <Badge variant="secondary" className="gap-1">
                    <IconLock className="h-3 w-3" />
                    Closed / 已結帳
                  </Badge>
                ) : (
                  <Badge variant="default">
                    Open / 開放
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fiscal Years Table */}
        <Card>
          <CardHeader>
            <CardTitle>Fiscal Years / 會計年度列表</CardTitle>
            <CardDescription>
              Manage and configure accounting periods
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : fiscalYears.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <IconCalendarEvent className="mx-auto h-12 w-12 mb-4" />
                <p>No fiscal years configured</p>
                <p className="text-sm">尚未設定會計年度</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fiscal Year / 會計年度</TableHead>
                    <TableHead>Start Date / 開始日期</TableHead>
                    <TableHead>End Date / 結束日期</TableHead>
                    <TableHead>Duration / 期間</TableHead>
                    <TableHead>Status / 狀態</TableHead>
                    <TableHead>Actions / 操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fiscalYears.map((fiscalYear) => {
                    const status = getFiscalYearStatus(fiscalYear);
                    return (
                      <TableRow key={fiscalYear.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {fiscalYear.is_current && (
                              <Badge variant="outline" className="text-xs">Current</Badge>
                            )}
                            {fiscalYear.is_closed && (
                              <IconLock className="h-4 w-4 text-muted-foreground" />
                            )}
                            {fiscalYear.name}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(fiscalYear.start_date)}</TableCell>
                        <TableCell>{formatDate(fiscalYear.end_date)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {calculateDuration(fiscalYear.start_date, fiscalYear.end_date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(fiscalYear)}
                            disabled={fiscalYear.is_closed}
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
              <DialogTitle>Add Fiscal Year / 新增會計年度</DialogTitle>
              <DialogDescription>
                Create a new fiscal year for accounting
              </DialogDescription>
            </DialogHeader>
            <FiscalYearForm />
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
              <DialogTitle>Edit Fiscal Year / 編輯會計年度</DialogTitle>
              <DialogDescription>
                Update fiscal year settings
              </DialogDescription>
            </DialogHeader>
            <FiscalYearForm />
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

// Demo data
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
    {
      id: '3',
      name: 'FY2023',
      start_date: '2023-01-01',
      end_date: '2023-12-31',
      is_closed: true,
      is_current: false,
    },
    {
      id: '4',
      name: 'FY2026',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      is_closed: false,
      is_current: false,
    },
  ];
}
