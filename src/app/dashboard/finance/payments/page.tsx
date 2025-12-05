'use client';

import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconPlus,
  IconRefresh,
  IconLoader2,
  IconSearch,
  IconFilter,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconCreditCard,
  IconBuildingBank,
  IconCash,
  IconCheck,
  IconReceipt,
} from '@tabler/icons-react';
import { getPayments, createPayment, getContacts, Payment, Contact } from '../services';

// Payment method icons
const paymentMethodIcons: Record<string, any> = {
  CASH: IconCash,
  BANK_TRANSFER: IconBuildingBank,
  CHECK: IconReceipt,
  CREDIT_CARD: IconCreditCard,
  OTHER: IconCreditCard,
};

// Status config
const statusConfig: Record<string, { color: string; label: string; labelZh: string }> = {
  PENDING: { color: 'secondary', label: 'Pending', labelZh: '待處理' },
  COMPLETED: { color: 'default', label: 'Completed', labelZh: '已完成' },
  CANCELLED: { color: 'destructive', label: 'Cancelled', labelZh: '已取消' },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'RECEIVED' | 'MADE'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    payment_type: 'RECEIVED' as 'RECEIVED' | 'MADE',
    contact: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    currency: 'TWD',
    payment_method: 'BANK_TRANSFER' as 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'CREDIT_CARD' | 'OTHER',
    reference: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [paymentsData, contactsData] = await Promise.all([
        getPayments({ type: activeTab === 'all' ? undefined : activeTab }),
        getContacts(),
      ]);
      setPayments(paymentsData.results || getDemoPayments());
      setContacts(contactsData.results || getDemoContacts());
    } catch (error) {
      console.error('Failed to load data:', error);
      setPayments(getDemoPayments());
      setContacts(getDemoContacts());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.contact || formData.amount <= 0) {
      alert('Please fill in all required fields / 請填寫所有必填欄位');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createPayment(formData);
      setShowCreateDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to create payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      payment_type: 'RECEIVED',
      contact: '',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      currency: 'TWD',
      payment_method: 'BANK_TRANSFER',
      reference: '',
      notes: '',
    });
  };

  // Calculate totals
  const totalReceived = payments
    .filter(p => p.payment_type === 'RECEIVED' && p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalMade = payments
    .filter(p => p.payment_type === 'MADE' && p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingPayments = payments.filter(p => p.status === 'PENDING').length;

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    if (activeTab !== 'all' && payment.payment_type !== activeTab) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return payment.payment_number?.toLowerCase().includes(query) ||
             payment.contact_name?.toLowerCase().includes(query) ||
             payment.reference?.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <PageContainer scrollable>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Payments / 收付款管理
            </h1>
            <p className="text-muted-foreground">
              Manage received and made payments
              <br />
              管理收款和付款記錄
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <IconRefresh className="mr-2 h-4 w-4" />
              Refresh / 重新整理
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Record Payment / 記錄收付款
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <IconArrowDownLeft className="h-4 w-4 text-green-500" />
                Received / 收款
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${totalReceived.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <IconArrowUpRight className="h-4 w-4 text-red-500" />
                Made / 付款
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${totalMade.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Net / 淨額</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalReceived - totalMade >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(totalReceived - totalMade).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending / 待處理</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {pendingPayments}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Filters */}
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All / 全部</TabsTrigger>
              <TabsTrigger value="RECEIVED">
                <IconArrowDownLeft className="mr-1 h-4 w-4" />
                Received / 收款
              </TabsTrigger>
              <TabsTrigger value="MADE">
                <IconArrowUpRight className="mr-1 h-4 w-4" />
                Made / 付款
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-[300px]">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments... / 搜尋收付款..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Records / 收付款記錄</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <IconCreditCard className="mx-auto h-12 w-12 mb-4" />
                <p>No payments found</p>
                <p className="text-sm">尚無收付款記錄</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type / 類型</TableHead>
                    <TableHead>Payment No. / 編號</TableHead>
                    <TableHead>Date / 日期</TableHead>
                    <TableHead>Contact / 聯絡人</TableHead>
                    <TableHead>Method / 方式</TableHead>
                    <TableHead className="text-right">Amount / 金額</TableHead>
                    <TableHead>Reference / 參考</TableHead>
                    <TableHead>Status / 狀態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const MethodIcon = paymentMethodIcons[payment.payment_method] || IconCreditCard;
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {payment.payment_type === 'RECEIVED' ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <IconArrowDownLeft className="mr-1 h-3 w-3" />
                              收款
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              <IconArrowUpRight className="mr-1 h-3 w-3" />
                              付款
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono">{payment.payment_number}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>{payment.contact_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MethodIcon className="h-4 w-4" />
                            <span className="text-sm">
                              {payment.payment_method === 'CASH' && '現金'}
                              {payment.payment_method === 'BANK_TRANSFER' && '銀行轉帳'}
                              {payment.payment_method === 'CHECK' && '支票'}
                              {payment.payment_method === 'CREDIT_CARD' && '信用卡'}
                              {payment.payment_method === 'OTHER' && '其他'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-mono font-medium ${
                          payment.payment_type === 'RECEIVED' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {payment.payment_type === 'RECEIVED' ? '+' : '-'}
                          ${payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{payment.reference || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[payment.status]?.color as any || 'secondary'}>
                            {statusConfig[payment.status]?.labelZh || payment.status}
                          </Badge>
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
              <DialogTitle>Record Payment / 記錄收付款</DialogTitle>
              <DialogDescription>
                Record a new payment received or made
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Type / 類型</Label>
                <Select
                  value={formData.payment_type}
                  onValueChange={(v) => setFormData({ ...formData, payment_type: v as any })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECEIVED">
                      <div className="flex items-center gap-2">
                        <IconArrowDownLeft className="h-4 w-4 text-green-500" />
                        Payment Received / 收款
                      </div>
                    </SelectItem>
                    <SelectItem value="MADE">
                      <div className="flex items-center gap-2">
                        <IconArrowUpRight className="h-4 w-4 text-red-500" />
                        Payment Made / 付款
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Contact / 聯絡人</Label>
                <Select
                  value={formData.contact}
                  onValueChange={(v) => setFormData({ ...formData, contact: v })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts
                      .filter(c => 
                        formData.payment_type === 'RECEIVED' 
                          ? c.contact_type === 'CUSTOMER' || c.contact_type === 'BOTH'
                          : c.contact_type === 'VENDOR' || c.contact_type === 'BOTH'
                      )
                      .map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name} {contact.company_name && `(${contact.company_name})`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Date / 日期</Label>
                <Input
                  type="date"
                  className="col-span-3"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Amount / 金額</Label>
                <div className="col-span-3 flex gap-2">
                  <Select
                    value={formData.currency}
                    onValueChange={(v) => setFormData({ ...formData, currency: v })}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TWD">TWD</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="CNY">CNY</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    className="flex-1"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Method / 方式</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(v) => setFormData({ ...formData, payment_method: v as any })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash / 現金</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer / 銀行轉帳</SelectItem>
                    <SelectItem value="CHECK">Check / 支票</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card / 信用卡</SelectItem>
                    <SelectItem value="OTHER">Other / 其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Reference / 參考</Label>
                <Input
                  className="col-span-3"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="Invoice number, check number, etc."
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Notes / 備註</Label>
                <Input
                  className="col-span-3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                Cancel / 取消
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isSubmitting || !formData.contact || formData.amount <= 0}
              >
                {isSubmitting ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Record / 記錄
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

// Demo data
function getDemoPayments(): Payment[] {
  return [
    {
      id: '1',
      payment_number: 'PMT-2025-001',
      payment_type: 'RECEIVED',
      contact: '1',
      contact_name: 'ABC Corporation / ABC公司',
      date: '2025-12-01',
      amount: 15000,
      currency: 'TWD',
      payment_method: 'BANK_TRANSFER',
      reference: 'INV-2025-001',
      status: 'COMPLETED',
      created_at: '2025-12-01',
    },
    {
      id: '2',
      payment_number: 'PMT-2025-002',
      payment_type: 'MADE',
      contact: '2',
      contact_name: 'XYZ Suppliers / XYZ供應商',
      date: '2025-12-02',
      amount: 8500,
      currency: 'TWD',
      payment_method: 'BANK_TRANSFER',
      reference: 'PO-2025-010',
      status: 'COMPLETED',
      created_at: '2025-12-02',
    },
    {
      id: '3',
      payment_number: 'PMT-2025-003',
      payment_type: 'RECEIVED',
      contact: '3',
      contact_name: 'DEF Enterprises / DEF企業',
      date: '2025-12-03',
      amount: 25000,
      currency: 'TWD',
      payment_method: 'CHECK',
      reference: 'INV-2025-002',
      status: 'PENDING',
      created_at: '2025-12-03',
    },
    {
      id: '4',
      payment_number: 'PMT-2025-004',
      payment_type: 'MADE',
      contact: '4',
      contact_name: 'Office Rent / 辦公室租金',
      date: '2025-12-01',
      amount: 30000,
      currency: 'TWD',
      payment_method: 'BANK_TRANSFER',
      reference: 'RENT-DEC-2025',
      status: 'COMPLETED',
      created_at: '2025-12-01',
    },
    {
      id: '5',
      payment_number: 'PMT-2025-005',
      payment_type: 'RECEIVED',
      contact: '5',
      contact_name: 'GHI Ltd / GHI有限公司',
      date: '2025-12-04',
      amount: 12000,
      currency: 'TWD',
      payment_method: 'CREDIT_CARD',
      status: 'COMPLETED',
      created_at: '2025-12-04',
    },
  ];
}

function getDemoContacts(): Contact[] {
  return [
    { id: '1', contact_type: 'CUSTOMER', name: 'ABC Corporation', company_name: 'ABC公司', email: 'contact@abc.com', is_active: true, outstanding_balance: 15000, created_at: '', updated_at: '' },
    { id: '2', contact_type: 'VENDOR', name: 'XYZ Suppliers', company_name: 'XYZ供應商', email: 'info@xyz.com', is_active: true, outstanding_balance: 0, created_at: '', updated_at: '' },
    { id: '3', contact_type: 'CUSTOMER', name: 'DEF Enterprises', company_name: 'DEF企業', is_active: true, outstanding_balance: 25000, created_at: '', updated_at: '' },
    { id: '4', contact_type: 'VENDOR', name: 'Office Building', company_name: '辦公大樓', is_active: true, outstanding_balance: 0, created_at: '', updated_at: '' },
    { id: '5', contact_type: 'BOTH', name: 'GHI Ltd', company_name: 'GHI有限公司', is_active: true, outstanding_balance: 0, created_at: '', updated_at: '' },
  ];
}
