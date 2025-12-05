'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { useApp } from '@/contexts/app-context';

// Accounting - Recent client payments
const accountingTransactions = [
  {
    name: 'Pacific Trading Ltd.',
    description: 'Statutory Audit FY2024',
    avatar: '',
    fallback: 'PT',
    amount: '+HK$285,000'
  },
  {
    name: 'Golden Dragon Holdings',
    description: 'Profits Tax Filing',
    avatar: '',
    fallback: 'GD',
    amount: '+HK$45,000'
  },
  {
    name: 'Asia Tech Solutions',
    description: 'Group Consolidation - Progress',
    avatar: '',
    fallback: 'AT',
    amount: '+HK$260,000'
  },
  {
    name: 'Sunshine Property Mgmt',
    description: 'MPF & Payroll Audit',
    avatar: '',
    fallback: 'SP',
    amount: '+HK$38,000'
  },
  {
    name: 'Fortune Investment Ltd.',
    description: 'Due Diligence Retainer',
    avatar: '',
    fallback: 'FI',
    amount: '+HK$175,000'
  }
];

// Financial PR - Recent client activities
const prTransactions = [
  {
    name: 'China Biotech (2389.HK)',
    description: 'Annual Results Announcement',
    avatar: '',
    fallback: 'CB',
    amount: '+HK$280,000'
  },
  {
    name: 'Pacific Real Estate (1688.HK)',
    description: 'IR Retainer Q4',
    avatar: '',
    fallback: 'PR',
    amount: '+HK$120,000'
  },
  {
    name: 'Dragon FinTech (Pre-IPO)',
    description: 'Pre-IPO Media Strategy',
    avatar: '',
    fallback: 'DF',
    amount: '+HK$325,000'
  },
  {
    name: 'Asia Green Energy (6128.HK)',
    description: 'ESG Report & Communications',
    avatar: '',
    fallback: 'AG',
    amount: '+HK$110,000'
  },
  {
    name: 'Golden Mining (0888.HK)',
    description: 'Crisis Communication',
    avatar: '',
    fallback: 'GM',
    amount: '+HK$180,000'
  }
];

// IPO Advisory - Recent deal fees
const ipoTransactions = [
  {
    name: 'TechVenture Holdings',
    description: 'Main Board IPO - Retainer',
    avatar: '',
    fallback: 'TV',
    amount: '+HK$650,000'
  },
  {
    name: 'Asia Digital Finance',
    description: 'GEM Listing - Success Fee',
    avatar: '',
    fallback: 'AD',
    amount: '+HK$2,800,000'
  },
  {
    name: 'BioPharm Innovation',
    description: 'Chapter 18A - Progress',
    avatar: '',
    fallback: 'BP',
    amount: '+HK$520,000'
  },
  {
    name: 'Smart Manufacturing Group',
    description: 'GEM to Main Board Transfer',
    avatar: '',
    fallback: 'SM',
    amount: '+HK$280,000'
  },
  {
    name: 'Green Mobility Tech',
    description: 'Pre-IPO Restructuring',
    avatar: '',
    fallback: 'GT',
    amount: '+HK$150,000'
  }
];

const configByType = {
  accounting: {
    title: 'Recent Payments',
    description: 'You received 12 payments this month',
    data: accountingTransactions
  },
  'financial-pr': {
    title: 'Recent Activities',
    description: '28 announcements handled this month',
    data: prTransactions
  },
  'ipo-advisory': {
    title: 'Recent Deal Fees',
    description: '8 active mandates in progress',
    data: ipoTransactions
  }
};

export function RecentSales() {
  const { currentCompany } = useApp();
  const companyType = currentCompany.type;
  const config = configByType[companyType];

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {config.data.map((item, index) => (
            <div key={index} className='flex items-center'>
              <Avatar className='h-9 w-9'>
                <AvatarImage src={item.avatar} alt='Avatar' />
                <AvatarFallback>{item.fallback}</AvatarFallback>
              </Avatar>
              <div className='ml-4 space-y-1'>
                <p className='text-sm leading-none font-medium'>{item.name}</p>
                <p className='text-muted-foreground text-sm'>{item.description}</p>
              </div>
              <div className='ml-auto font-medium text-green-600'>{item.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
