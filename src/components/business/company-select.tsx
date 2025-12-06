'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { IconPlus, IconLoader2, IconCheck, IconSelector } from '@tabler/icons-react';
import { companiesApi, Company } from '@/features/business/services';
import { cn } from '@/lib/utils';

interface CompanySelectProps {
  value: string;
  onChange: (value: string) => void;
  companies: Company[];
  onCompanyAdded?: (company: Company) => void;
  placeholder?: string;
  required?: boolean;
}

export function CompanySelect({
  value,
  onChange,
  companies,
  onCompanyAdded,
  placeholder = '選擇客戶公司',
  required = false,
}: CompanySelectProps) {
  const [open, setOpen] = useState(false);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isAddingCompany, setIsAddingCompany] = useState(false);

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === value),
    [companies, value]
  );

  const handleAddCompany = async () => {
    if (!newCompanyName.trim()) {
      toast.error('請輸入公司名稱');
      return;
    }
    setIsAddingCompany(true);
    try {
      const newCompany = await companiesApi.create({ name: newCompanyName.trim() });
      onCompanyAdded?.(newCompany);
      onChange(newCompany.id);
      setNewCompanyName('');
      setIsAddCompanyOpen(false);
      toast.success('公司已新增');
    } catch (error) {
      console.error('Add company error:', error);
      toast.error('新增公司失敗');
    } finally {
      setIsAddingCompany(false);
    }
  };

  return (
    <div className='flex gap-2'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='flex-1 justify-between font-normal'
          >
            {selectedCompany ? selectedCompany.name : placeholder}
            <IconSelector className='ml-2 size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[400px] p-0' align='start'>
          <Command>
            <CommandInput placeholder='搜尋公司名稱...' />
            <CommandList>
              <CommandEmpty>找不到公司</CommandEmpty>
              <CommandGroup>
                {companies.map((company) => (
                  <CommandItem
                    key={company.id}
                    value={company.name}
                    onSelect={() => {
                      onChange(company.id);
                      setOpen(false);
                    }}
                  >
                    <IconCheck
                      className={cn(
                        'mr-2 size-4',
                        value === company.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {company.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
        <DialogTrigger asChild>
          <Button type='button' variant='outline' size='icon' title='新增公司'>
            <IconPlus className='size-4' />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增客戶公司</DialogTitle>
            <DialogDescription>
              輸入新公司名稱以新增到系統
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='new-company-name'>公司名稱 *</Label>
              <Input
                id='new-company-name'
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder='例如：ABC 有限公司'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCompany();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsAddCompanyOpen(false)}
            >
              取消
            </Button>
            <Button
              type='button'
              onClick={handleAddCompany}
              disabled={isAddingCompany}
            >
              {isAddingCompany && (
                <IconLoader2 className='mr-2 size-4 animate-spin' />
              )}
              新增
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
