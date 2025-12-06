'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
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
import { IconCheck, IconSelector, IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Employee } from '@/features/hrms/services';

interface EmployeeSelectProps {
  value: string;
  onChange: (value: string) => void;
  employees: Employee[];
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
}

export function EmployeeSelect({
  value,
  onChange,
  employees,
  placeholder = '選擇負責人',
  allowClear = true,
  disabled = false,
}: EmployeeSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === value || e.user === value),
    [employees, value]
  );

  return (
    <div className='flex gap-2'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='flex-1 justify-between font-normal'
            disabled={disabled}
          >
            {selectedEmployee ? (
              <span>
                {selectedEmployee.user_full_name || selectedEmployee.employee_id}
                {selectedEmployee.designation_name && (
                  <span className='ml-2 text-muted-foreground text-xs'>
                    ({selectedEmployee.designation_name})
                  </span>
                )}
              </span>
            ) : (
              <span className='text-muted-foreground'>{placeholder}</span>
            )}
            <IconSelector className='ml-2 size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[400px] p-0' align='start'>
          <Command>
            <CommandInput placeholder='搜尋員工姓名...' />
            <CommandList>
              <CommandEmpty>找不到員工</CommandEmpty>
              <CommandGroup>
                {employees.map((employee) => (
                  <CommandItem
                    key={employee.id}
                    value={`${employee.user_full_name || ''} ${employee.employee_id}`}
                    onSelect={() => {
                      onChange(employee.user || employee.id);
                      setOpen(false);
                    }}
                  >
                    <IconCheck
                      className={cn(
                        'mr-2 size-4',
                        (value === employee.id || value === employee.user) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className='flex flex-col'>
                      <span>{employee.user_full_name || employee.employee_id}</span>
                      {employee.designation_name && (
                        <span className='text-xs text-muted-foreground'>
                          {employee.designation_name}
                          {employee.department_name && ` • ${employee.department_name}`}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {allowClear && value && (
        <Button
          type='button'
          variant='outline'
          size='icon'
          title='清除'
          onClick={() => onChange('')}
          disabled={disabled}
        >
          <IconX className='size-4' />
        </Button>
      )}
    </div>
  );
}
