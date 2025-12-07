'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconTable,
  IconKey,
  IconLink,
  IconRefresh,
  IconChevronRight,
  IconChevronDown,
  IconDatabase,
  IconSearch,
  IconFilter,
  IconCopy,
  IconCheck,
  IconLoader2
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

// API Base URL
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/api/v1`;

interface Column {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  nullable?: boolean;
  description?: string;
}

interface TableSchema {
  name: string;
  columns: Column[];
  rowCount?: number;
  description?: string;
  group?: string;
}

interface DatabaseSchemaPanelProps {
  onSelectTable?: (tableName: string) => void;
  isDemo?: boolean;
}

// Group tables by category
interface TableGroup {
  id: string;
  name: string;
  tables: TableSchema[];
}

// Demo schema data
const DEMO_SCHEMA: TableSchema[] = [
  {
    name: 'sales_orders',
    description: '銷售訂單表 / Sales Orders',
    rowCount: 1250,
    group: 'sales',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: '主鍵' },
      { name: 'order_number', type: 'VARCHAR(50)', description: '訂單編號' },
      { name: 'customer_id', type: 'UUID', isForeign: true, description: '客戶ID' },
      { name: 'order_date', type: 'DATE', description: '訂單日期' },
      { name: 'total_amount', type: 'DECIMAL(15,2)', description: '總金額' },
      { name: 'status', type: 'VARCHAR(20)', description: '狀態' },
      { name: 'created_at', type: 'TIMESTAMP', description: '創建時間' }
    ]
  },
  {
    name: 'customers',
    description: '客戶表 / Customers',
    rowCount: 458,
    group: 'crm',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: '主鍵' },
      { name: 'name', type: 'VARCHAR(255)', description: '客戶名稱' },
      { name: 'email', type: 'VARCHAR(255)', description: '電郵' },
      { name: 'phone', type: 'VARCHAR(50)', nullable: true, description: '電話' },
      { name: 'company', type: 'VARCHAR(255)', nullable: true, description: '公司' },
      { name: 'country', type: 'VARCHAR(100)', description: '國家' },
      { name: 'created_at', type: 'TIMESTAMP', description: '創建時間' }
    ]
  },
  {
    name: 'products',
    description: '產品表 / Products',
    rowCount: 156,
    group: 'inventory',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: '主鍵' },
      { name: 'name', type: 'VARCHAR(255)', description: '產品名稱' },
      { name: 'sku', type: 'VARCHAR(50)', description: 'SKU編號' },
      { name: 'category_id', type: 'UUID', isForeign: true, description: '類別ID' },
      { name: 'price', type: 'DECIMAL(10,2)', description: '價格' },
      { name: 'stock_quantity', type: 'INTEGER', description: '庫存數量' },
      { name: 'is_active', type: 'BOOLEAN', description: '是否啟用' }
    ]
  },
  {
    name: 'order_items',
    description: '訂單明細表 / Order Items',
    rowCount: 3420,
    group: 'sales',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: '主鍵' },
      { name: 'order_id', type: 'UUID', isForeign: true, description: '訂單ID' },
      { name: 'product_id', type: 'UUID', isForeign: true, description: '產品ID' },
      { name: 'quantity', type: 'INTEGER', description: '數量' },
      { name: 'unit_price', type: 'DECIMAL(10,2)', description: '單價' },
      { name: 'discount', type: 'DECIMAL(5,2)', nullable: true, description: '折扣' },
      { name: 'subtotal', type: 'DECIMAL(15,2)', description: '小計' }
    ]
  },
  {
    name: 'categories',
    description: '產品類別表 / Categories',
    rowCount: 24,
    group: 'inventory',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: '主鍵' },
      { name: 'name', type: 'VARCHAR(100)', description: '類別名稱' },
      { name: 'parent_id', type: 'UUID', isForeign: true, nullable: true, description: '父類別ID' },
      { name: 'description', type: 'TEXT', nullable: true, description: '描述' }
    ]
  },
  {
    name: 'invoices',
    description: '發票表 / Invoices',
    rowCount: 892,
    group: 'finance',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: '主鍵' },
      { name: 'invoice_number', type: 'VARCHAR(50)', description: '發票號碼' },
      { name: 'order_id', type: 'UUID', isForeign: true, description: '訂單ID' },
      { name: 'issue_date', type: 'DATE', description: '開票日期' },
      { name: 'due_date', type: 'DATE', description: '到期日期' },
      { name: 'amount', type: 'DECIMAL(15,2)', description: '金額' },
      { name: 'status', type: 'VARCHAR(20)', description: '狀態' }
    ]
  }
];

const GROUP_NAMES: Record<string, string> = {
  sales: '銷售 Sales',
  crm: '客戶關係 CRM',
  inventory: '庫存 Inventory',
  finance: '財務 Finance',
  accounting: '會計 Accounting',
  business: '業務 Business',
  users: '用戶 Users',
  hrms: '人資 HRMS',
  projects: '專案 Projects',
  documents: '文件 Documents',
  loaded_data: '已載入數據 Loaded Data',
  data: '數據 Data',
  other: '其他 Other',
};

// Loading skeleton component
function SchemaLoadingSkeleton() {
  return (
    <div className='p-3 space-y-3'>
      <Skeleton className='h-4 w-32' />
      <div className='space-y-2'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='space-y-1.5'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-4 w-4 rounded' />
              <Skeleton className='h-3 w-24' />
              <Skeleton className='h-3 w-12 ml-auto' />
            </div>
            <div className='pl-6 space-y-1'>
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className='h-3 w-full' />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DatabaseSchemaPanel({
  onSelectTable,
  isDemo = false
}: DatabaseSchemaPanelProps) {
  const [schema, setSchema] = useState<TableSchema[]>(DEMO_SCHEMA);
  const [activeTable, setActiveTable] = useState<string>(DEMO_SCHEMA[0]?.name || '');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['sales', 'crm', 'inventory', 'finance', 'data', 'accounting', 'loaded_data']));
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [schemaIsDemo, setSchemaIsDemo] = useState(isDemo);
  const [dataSource, setDataSource] = useState<'database' | 'csv_fallback' | 'no_data'>('no_data');
  const [dataSourceMessage, setDataSourceMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grouped' | 'tabs'>('grouped');
  const [copiedColumn, setCopiedColumn] = useState<string | null>(null);

  // Fetch schema from backend API
  const fetchSchema = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
      const response = await fetch(`${API_BASE_URL}/analyst-assistant/schema/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.tables && data.tables.length > 0) {
          setSchema(data.tables);
          setSchemaIsDemo(data.isDemo || false);
          setDataSource(data.dataSource || 'database');
          setDataSourceMessage(data.message || '');
          if (data.tables[0]) {
            setActiveTable(data.tables[0].name);
          }
          // Expand all groups that have tables
          const groups = new Set<string>(data.tables.map((t: TableSchema) => t.group || 'other'));
          setExpandedGroups(groups);
          console.log('[DatabaseSchemaPanel] Loaded schema from API:', data.tables.length, 'tables, source:', data.dataSource);
        } else {
          // No tables returned, use demo data
          console.log('[DatabaseSchemaPanel] No tables from API, using demo data');
          setSchemaIsDemo(true);
          setDataSource('no_data');
        }
      } else {
        console.error('[DatabaseSchemaPanel] Failed to fetch schema:', response.status);
        setSchemaIsDemo(true);
        setDataSource('no_data');
      }
    } catch (error) {
      console.error('[DatabaseSchemaPanel] Error fetching schema:', error);
      setSchemaIsDemo(true);
      setDataSource('no_data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch schema on mount
  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

  // Group tables by category
  const groupedTables = useMemo(() => {
    const groups: Record<string, TableSchema[]> = {};
    schema.forEach((table) => {
      const group = table.group || 'other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(table);
    });
    return groups;
  }, [schema]);

  // Filter tables by search query
  const filteredSchema = useMemo(() => {
    if (!searchQuery.trim()) return schema;
    const query = searchQuery.toLowerCase();
    return schema.filter(
      (table) =>
        table.name.toLowerCase().includes(query) ||
        table.description?.toLowerCase().includes(query) ||
        table.columns.some(
          (col) =>
            col.name.toLowerCase().includes(query) ||
            col.type.toLowerCase().includes(query)
        )
    );
  }, [schema, searchQuery]);

  // Filtered grouped tables
  const filteredGroupedTables = useMemo(() => {
    const groups: Record<string, TableSchema[]> = {};
    filteredSchema.forEach((table) => {
      const group = table.group || 'other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(table);
    });
    return groups;
  }, [filteredSchema]);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleTable = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const handleTableClick = (tableName: string) => {
    setActiveTable(tableName);
    onSelectTable?.(tableName);
  };

  const copyColumnName = async (columnName: string) => {
    await navigator.clipboard.writeText(columnName);
    setCopiedColumn(columnName);
    setTimeout(() => setCopiedColumn(null), 2000);
  };

  const refreshSchema = async () => {
    await fetchSchema();
  };

  const getTypeColor = (type: string) => {
    if (type.includes('VARCHAR') || type.includes('TEXT')) return 'text-blue-500';
    if (type.includes('INT') || type.includes('DECIMAL')) return 'text-green-500';
    if (type.includes('DATE') || type.includes('TIME')) return 'text-purple-500';
    if (type.includes('UUID')) return 'text-orange-500';
    if (type.includes('BOOL')) return 'text-pink-500';
    return 'text-muted-foreground';
  };

  return (
    <TooltipProvider>
      <div className='flex h-full flex-col border-t'>
        {/* Header */}
        <div className='flex items-center justify-between border-b px-4 py-2 bg-muted/30 shrink-0'>
          <div className='flex items-center gap-2'>
            <IconDatabase className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm font-medium'>Database Schema</span>
            {dataSource === 'csv_fallback' && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant='outline' className='text-xs text-amber-600 border-amber-600'>
                    CSV Demo
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className='text-xs'>Using CSV demo data. No database records found.</p>
                  <p className='text-xs text-muted-foreground'>使用 CSV 示範數據（資料庫無記錄）</p>
                </TooltipContent>
              </Tooltip>
            )}
            {dataSource === 'database' && !schemaIsDemo && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant='outline' className='text-xs text-green-600 border-green-600'>
                    Live DB
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className='text-xs'>Connected to database with real data.</p>
                  <p className='text-xs text-muted-foreground'>已連接資料庫（真實數據）</p>
                </TooltipContent>
              </Tooltip>
            )}
            {schemaIsDemo && dataSource !== 'csv_fallback' && (
              <Badge variant='outline' className='text-xs text-orange-600 border-orange-600'>
                Demo
              </Badge>
            )}
            <Badge variant='secondary' className='text-[10px]'>
              {schema.length} tables
            </Badge>
          </div>
          <div className='flex items-center gap-1'>
            <Button
              variant={viewMode === 'grouped' ? 'secondary' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('grouped')}
              className='h-7 px-2'
            >
              <IconFilter className='h-3.5 w-3.5' />
            </Button>
            <Button
              variant={viewMode === 'tabs' ? 'secondary' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('tabs')}
              className='h-7 px-2'
            >
              <IconTable className='h-3.5 w-3.5' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={refreshSchema}
              disabled={loading}
              className='h-7 px-2'
            >
              {loading ? (
                <IconLoader2 className='h-3.5 w-3.5 animate-spin' />
              ) : (
                <IconRefresh className='h-3.5 w-3.5' />
              )}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className='px-3 py-2 border-b shrink-0'>
          <div className='relative'>
            <IconSearch className='absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Search tables, columns...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='h-8 pl-8 text-xs'
            />
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <SchemaLoadingSkeleton />
        ) : viewMode === 'grouped' ? (
          /* Grouped view */
          <ScrollArea className='flex-1 min-h-0'>
            <div className='p-2 space-y-1'>
              {Object.entries(filteredGroupedTables).map(([groupId, tables]) => (
                <Collapsible
                  key={groupId}
                  open={expandedGroups.has(groupId)}
                  onOpenChange={() => toggleGroup(groupId)}
                >
                  <CollapsibleTrigger asChild>
                    <div className='flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer'>
                      {expandedGroups.has(groupId) ? (
                        <IconChevronDown className='h-3.5 w-3.5 text-muted-foreground' />
                      ) : (
                        <IconChevronRight className='h-3.5 w-3.5 text-muted-foreground' />
                      )}
                      <span className='text-xs font-medium'>
                        {GROUP_NAMES[groupId] || groupId}
                      </span>
                      <Badge variant='outline' className='text-[9px] ml-auto'>
                        {tables.length}
                      </Badge>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className='pl-4 space-y-0.5'>
                      {tables.map((table) => (
                        <Collapsible
                          key={table.name}
                          open={expandedTables.has(table.name)}
                          onOpenChange={() => toggleTable(table.name)}
                        >
                          <CollapsibleTrigger asChild>
                            <div
                              className={cn(
                                'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer',
                                activeTable === table.name && 'bg-muted'
                              )}
                              onClick={() => handleTableClick(table.name)}
                            >
                              <IconTable className='h-3.5 w-3.5 text-muted-foreground' />
                              <span className='text-xs font-mono'>{table.name}</span>
                              <Badge
                                variant='secondary'
                                className='text-[9px] px-1 py-0 ml-auto'
                              >
                                {table.rowCount?.toLocaleString()}
                              </Badge>
                              {expandedTables.has(table.name) ? (
                                <IconChevronDown className='h-3 w-3 text-muted-foreground' />
                              ) : (
                                <IconChevronRight className='h-3 w-3 text-muted-foreground' />
                              )}
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className='pl-6 py-1 space-y-0.5'>
                              {table.columns.map((column) => (
                                <Tooltip key={column.name}>
                                  <TooltipTrigger asChild>
                                    <div
                                      className='flex items-center gap-1.5 px-2 py-1 text-[11px] rounded hover:bg-muted/30 cursor-pointer group'
                                      onClick={() => copyColumnName(column.name)}
                                    >
                                      {column.isPrimary && (
                                        <IconKey className='h-3 w-3 text-yellow-500 shrink-0' />
                                      )}
                                      {column.isForeign && (
                                        <IconLink className='h-3 w-3 text-blue-500 shrink-0' />
                                      )}
                                      {!column.isPrimary && !column.isForeign && (
                                        <span className='w-3' />
                                      )}
                                      <span className='font-mono text-foreground'>
                                        {column.name}
                                      </span>
                                      <span className={cn('font-mono ml-auto', getTypeColor(column.type))}>
                                        {column.type}
                                      </span>
                                      <span className='opacity-0 group-hover:opacity-100 transition-opacity'>
                                        {copiedColumn === column.name ? (
                                          <IconCheck className='h-3 w-3 text-green-500' />
                                        ) : (
                                          <IconCopy className='h-3 w-3 text-muted-foreground' />
                                        )}
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side='right' className='text-xs'>
                                    <p>{column.description}</p>
                                    {column.nullable && (
                                      <p className='text-muted-foreground'>Nullable</p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}

              {filteredSchema.length === 0 && (
                <div className='py-8 text-center text-muted-foreground'>
                  <IconSearch className='h-8 w-8 mx-auto mb-2 opacity-50' />
                  <p className='text-xs'>No tables found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          /* Tabs view */
          <Tabs value={activeTable} onValueChange={handleTableClick} className='flex-1 flex flex-col min-h-0'>
            <div className='border-b overflow-x-auto shrink-0'>
              <div className='w-max'>
                <TabsList className='h-9 w-max bg-transparent p-0 px-2'>
                  {filteredSchema.map((table) => (
                    <TabsTrigger
                      key={table.name}
                      value={table.name}
                      className='text-xs data-[state=active]:bg-muted rounded-none border-b-2 border-transparent data-[state=active]:border-primary'
                    >
                      <IconTable className='h-3 w-3 mr-1.5' />
                      {table.name}
                      <Badge variant='secondary' className='ml-1.5 text-[10px] px-1 py-0'>
                        {table.rowCount}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            {/* Table content */}
            <ScrollArea className='flex-1 min-h-0'>
              {filteredSchema.map((table) => (
                <TabsContent key={table.name} value={table.name} className='m-0 p-3'>
                  <div className='space-y-3'>
                    {/* Table description */}
                    <div className='text-xs text-muted-foreground'>
                      {table.description}
                    </div>

                    {/* Columns */}
                    <div className='space-y-1'>
                      {table.columns.map((column) => (
                        <div
                          key={column.name}
                          className='flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 text-xs group cursor-pointer'
                          onClick={() => copyColumnName(column.name)}
                        >
                          <div className='flex items-center gap-1 min-w-[120px]'>
                            {column.isPrimary && (
                              <IconKey className='h-3 w-3 text-yellow-500' />
                            )}
                            {column.isForeign && (
                              <IconLink className='h-3 w-3 text-blue-500' />
                            )}
                            <span className='font-mono font-medium'>{column.name}</span>
                          </div>
                          <span className={cn('font-mono text-[10px]', getTypeColor(column.type))}>
                            {column.type}
                          </span>
                          {column.nullable && (
                            <Badge variant='outline' className='text-[9px] px-1 py-0'>
                              NULL
                            </Badge>
                          )}
                          {column.description && (
                            <span className='text-muted-foreground ml-auto truncate max-w-[150px]'>
                              {column.description}
                            </span>
                          )}
                          <span className='opacity-0 group-hover:opacity-100 transition-opacity'>
                            {copiedColumn === column.name ? (
                              <IconCheck className='h-3 w-3 text-green-500' />
                            ) : (
                              <IconCopy className='h-3 w-3 text-muted-foreground' />
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Quick actions */}
                    <div className='flex gap-2 pt-2 border-t'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='text-xs h-7'
                        onClick={() => onSelectTable?.(table.name)}
                      >
                        Query this table
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-xs h-7'
                      >
                        Show sample data
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        )}
      </div>
    </TooltipProvider>
  );
}
