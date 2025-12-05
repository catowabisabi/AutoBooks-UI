'use client';

import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  IconPlus,
  IconRefresh,
  IconLoader2,
  IconSearch,
  IconEdit,
  IconUser,
  IconUsers,
  IconBuildingStore,
  IconMail,
  IconPhone,
  IconMapPin,
} from '@tabler/icons-react';
import { getContacts, createContact, updateContact, Contact } from '../services';

// Contact type config
const contactTypeConfig: Record<string, { color: string; label: string; labelZh: string; icon: any }> = {
  CUSTOMER: { color: 'default', label: 'Customer', labelZh: '客戶', icon: IconUser },
  VENDOR: { color: 'secondary', label: 'Vendor', labelZh: '供應商', icon: IconBuildingStore },
  BOTH: { color: 'outline', label: 'Both', labelZh: '客戶/供應商', icon: IconUsers },
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'CUSTOMER' | 'VENDOR'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    contact_type: 'CUSTOMER' as 'CUSTOMER' | 'VENDOR' | 'BOTH',
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Taiwan',
    tax_id: '',
    payment_terms: 30,
    credit_limit: 0,
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getContacts({
        type: activeTab === 'all' ? undefined : activeTab,
      });
      setContacts(data.results || getDemoContacts());
    } catch (error) {
      console.error('Failed to load contacts:', error);
      setContacts(getDemoContacts());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) {
      alert('Name is required / 名稱為必填');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createContact(formData);
      setShowCreateDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to create contact:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      contact_type: contact.contact_type,
      name: contact.name,
      company_name: contact.company_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || '',
      city: contact.city || '',
      country: contact.country || 'Taiwan',
      tax_id: contact.tax_id || '',
      payment_terms: contact.payment_terms || 30,
      credit_limit: contact.credit_limit || 0,
      is_active: contact.is_active,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!editingContact) return;
    
    setIsSubmitting(true);
    try {
      await updateContact(editingContact.id, formData);
      setShowEditDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to update contact:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      contact_type: 'CUSTOMER',
      name: '',
      company_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'Taiwan',
      tax_id: '',
      payment_terms: 30,
      credit_limit: 0,
      is_active: true,
    });
    setEditingContact(null);
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    if (activeTab !== 'all' && contact.contact_type !== activeTab && contact.contact_type !== 'BOTH') {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return contact.name?.toLowerCase().includes(query) ||
             contact.company_name?.toLowerCase().includes(query) ||
             contact.email?.toLowerCase().includes(query);
    }
    return true;
  });

  // Calculate stats
  const totalCustomers = contacts.filter(c => c.contact_type === 'CUSTOMER' || c.contact_type === 'BOTH').length;
  const totalVendors = contacts.filter(c => c.contact_type === 'VENDOR' || c.contact_type === 'BOTH').length;
  const totalReceivable = contacts
    .filter(c => c.contact_type === 'CUSTOMER' || c.contact_type === 'BOTH')
    .reduce((sum, c) => sum + (c.outstanding_balance || 0), 0);
  const totalPayable = contacts
    .filter(c => c.contact_type === 'VENDOR' || c.contact_type === 'BOTH')
    .reduce((sum, c) => sum + (c.outstanding_balance || 0), 0);

  const ContactForm = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Type / 類型</Label>
        <Select
          value={formData.contact_type}
          onValueChange={(v) => setFormData({ ...formData, contact_type: v as any })}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CUSTOMER">Customer / 客戶</SelectItem>
            <SelectItem value="VENDOR">Vendor / 供應商</SelectItem>
            <SelectItem value="BOTH">Both / 客戶和供應商</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Name / 名稱 *</Label>
        <Input
          className="col-span-3"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Contact name"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Company / 公司</Label>
        <Input
          className="col-span-3"
          value={formData.company_name}
          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          placeholder="Company name"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Email</Label>
        <Input
          type="email"
          className="col-span-3"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="email@example.com"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Phone / 電話</Label>
        <Input
          className="col-span-3"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+886 2 xxxx xxxx"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Address / 地址</Label>
        <Input
          className="col-span-3"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Street address"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">City / 城市</Label>
        <Input
          className="col-span-3"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          placeholder="Taipei"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Tax ID / 統編</Label>
        <Input
          className="col-span-3"
          value={formData.tax_id}
          onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
          placeholder="12345678"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Payment Terms / 付款條件</Label>
        <Select
          value={String(formData.payment_terms)}
          onValueChange={(v) => setFormData({ ...formData, payment_terms: parseInt(v) })}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Due on Receipt / 即期</SelectItem>
            <SelectItem value="7">Net 7 / 7天</SelectItem>
            <SelectItem value="15">Net 15 / 15天</SelectItem>
            <SelectItem value="30">Net 30 / 30天</SelectItem>
            <SelectItem value="45">Net 45 / 45天</SelectItem>
            <SelectItem value="60">Net 60 / 60天</SelectItem>
            <SelectItem value="90">Net 90 / 90天</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {(formData.contact_type === 'CUSTOMER' || formData.contact_type === 'BOTH') && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Credit Limit / 信用額度</Label>
          <Input
            type="number"
            className="col-span-3"
            value={formData.credit_limit || ''}
            onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
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
              Contacts / 聯絡人管理
            </h1>
            <p className="text-muted-foreground">
              Manage customers and vendors
              <br />
              管理客戶和供應商
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <IconRefresh className="mr-2 h-4 w-4" />
              Refresh / 重新整理
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Add Contact / 新增聯絡人
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <IconUser className="h-4 w-4" />
                Customers / 客戶
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <IconBuildingStore className="h-4 w-4" />
                Vendors / 供應商
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVendors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Receivables / 應收帳款</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${totalReceivable.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Payables / 應付帳款</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${totalPayable.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Filters */}
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All / 全部</TabsTrigger>
              <TabsTrigger value="CUSTOMER">
                <IconUser className="mr-1 h-4 w-4" />
                Customers / 客戶
              </TabsTrigger>
              <TabsTrigger value="VENDOR">
                <IconBuildingStore className="mr-1 h-4 w-4" />
                Vendors / 供應商
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-[300px]">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts... / 搜尋聯絡人..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contacts / 聯絡人</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <IconUsers className="mx-auto h-12 w-12 mb-4" />
                <p>No contacts found</p>
                <p className="text-sm">尚無聯絡人</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact / 聯絡人</TableHead>
                    <TableHead>Type / 類型</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone / 電話</TableHead>
                    <TableHead className="text-right">Outstanding / 餘額</TableHead>
                    <TableHead>Status / 狀態</TableHead>
                    <TableHead>Actions / 操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => {
                    const typeConfig = contactTypeConfig[contact.contact_type];
                    const TypeIcon = typeConfig?.icon || IconUser;
                    return (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {contact.name?.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{contact.name}</div>
                              {contact.company_name && (
                                <div className="text-sm text-muted-foreground">
                                  {contact.company_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={typeConfig?.color as any || 'secondary'}>
                            <TypeIcon className="mr-1 h-3 w-3" />
                            {typeConfig?.labelZh || contact.contact_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {contact.email ? (
                            <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                              <IconMail className="h-3 w-3" />
                              {contact.email}
                            </a>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {contact.phone ? (
                            <a href={`tel:${contact.phone}`} className="flex items-center gap-1">
                              <IconPhone className="h-3 w-3" />
                              {contact.phone}
                            </a>
                          ) : '-'}
                        </TableCell>
                        <TableCell className={`text-right font-mono ${
                          contact.outstanding_balance > 0 
                            ? contact.contact_type === 'CUSTOMER' ? 'text-green-600' : 'text-red-600'
                            : ''
                        }`}>
                          ${contact.outstanding_balance?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={contact.is_active ? 'default' : 'secondary'}>
                            {contact.is_active ? '啟用' : '停用'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(contact)}>
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
              <DialogTitle>Add Contact / 新增聯絡人</DialogTitle>
              <DialogDescription>
                Create a new customer or vendor contact
              </DialogDescription>
            </DialogHeader>
            <ContactForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                Cancel / 取消
              </Button>
              <Button onClick={handleCreate} disabled={isSubmitting || !formData.name}>
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
              <DialogTitle>Edit Contact / 編輯聯絡人</DialogTitle>
              <DialogDescription>
                Update contact information
              </DialogDescription>
            </DialogHeader>
            <ContactForm />
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
function getDemoContacts(): Contact[] {
  return [
    {
      id: '1',
      contact_type: 'CUSTOMER',
      name: 'ABC Corporation',
      company_name: 'ABC股份有限公司',
      email: 'contact@abc-corp.com',
      phone: '+886 2 2345 6789',
      address: '台北市信義區信義路五段7號',
      city: 'Taipei',
      country: 'Taiwan',
      tax_id: '12345678',
      payment_terms: 30,
      credit_limit: 100000,
      outstanding_balance: 45200,
      is_active: true,
      created_at: '2025-01-01',
      updated_at: '2025-12-01',
    },
    {
      id: '2',
      contact_type: 'VENDOR',
      name: 'XYZ Suppliers',
      company_name: 'XYZ供應商有限公司',
      email: 'sales@xyz-suppliers.com',
      phone: '+886 3 9876 5432',
      address: '桃園市中壢區中山路100號',
      city: 'Taoyuan',
      country: 'Taiwan',
      tax_id: '87654321',
      payment_terms: 45,
      outstanding_balance: 32100,
      is_active: true,
      created_at: '2025-01-15',
      updated_at: '2025-11-20',
    },
    {
      id: '3',
      contact_type: 'CUSTOMER',
      name: 'DEF Enterprises',
      company_name: 'DEF企業集團',
      email: 'info@def-ent.com',
      phone: '+886 4 2222 3333',
      address: '台中市西屯區台灣大道三段99號',
      city: 'Taichung',
      country: 'Taiwan',
      tax_id: '11223344',
      payment_terms: 30,
      credit_limit: 500000,
      outstanding_balance: 125000,
      is_active: true,
      created_at: '2025-02-01',
      updated_at: '2025-12-03',
    },
    {
      id: '4',
      contact_type: 'BOTH',
      name: 'GHI Trading Co.',
      company_name: 'GHI貿易有限公司',
      email: 'trading@ghi.com',
      phone: '+886 7 7777 8888',
      address: '高雄市前鎮區成功二路88號',
      city: 'Kaohsiung',
      country: 'Taiwan',
      tax_id: '55667788',
      payment_terms: 30,
      credit_limit: 200000,
      outstanding_balance: 15000,
      is_active: true,
      created_at: '2025-03-01',
      updated_at: '2025-12-04',
    },
    {
      id: '5',
      contact_type: 'VENDOR',
      name: 'Office Supplies Inc.',
      company_name: '辦公用品有限公司',
      email: 'orders@office-supplies.com',
      phone: '+886 2 5555 6666',
      address: '新北市板橋區文化路一段50號',
      city: 'New Taipei',
      country: 'Taiwan',
      payment_terms: 15,
      outstanding_balance: 8500,
      is_active: true,
      created_at: '2025-03-15',
      updated_at: '2025-11-28',
    },
  ];
}
