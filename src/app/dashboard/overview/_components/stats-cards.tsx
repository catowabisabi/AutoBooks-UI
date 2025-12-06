'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  IconTrendingUp, 
  IconCloud, 
  IconCloudOff, 
  IconRefresh, 
  IconExternalLink, 
  IconBuilding, 
  IconChartLine, 
  IconSpeakerphone, 
  IconNews, 
  IconFileCheck, 
  IconCertificate,
  IconClipboardList,
  IconReceipt,
  IconClock,
  IconCurrencyDollar,
  IconUsers,
  IconBriefcase
} from '@tabler/icons-react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/app-context';
import { useTranslation } from '@/lib/i18n/provider';
import type { TablerIcon } from '@tabler/icons-react';

// 統一的卡片配置類型
interface CardConfig {
  key: string;           // 數據鍵值
  labelKey: string;      // i18n key for 卡片標題
  href: string;          // 連結到的 CRUD 頁面
  linkTextKey: string;   // i18n key for 連結文字
  icon: TablerIcon;      // 圖標
  badgeKey?: string;     // 用於 badge 的數據鍵值
  trendKey?: string;     // 用於趨勢的數據鍵值
  footerKey?: string;    // 用於 footer 的數據鍵值
}

// 每種公司類型的 4 張卡片配置
// 相同結構，不同數據來源
const cardConfigsByType: Record<string, CardConfig[]> = {
  // 會計師事務所卡片
  accounting: [
    {
      key: 'auditsInProgress',
      labelKey: 'dashboard.statsCards.accounting.auditProjects',
      href: '/dashboard/business/audits',
      linkTextKey: 'dashboard.statsCards.accounting.viewAuditProjects',
      icon: IconClipboardList,
      trendKey: 'auditsTotal',
      footerKey: 'clientCount'
    },
    {
      key: 'taxReturnsPending',
      labelKey: 'dashboard.statsCards.accounting.taxReturns',
      href: '/dashboard/business/tax-returns',
      linkTextKey: 'dashboard.statsCards.accounting.viewTaxReturns',
      icon: IconReceipt,
      trendKey: 'taxReturnsTotal',
      footerKey: 'pendingTasks'
    },
    {
      key: 'billableHoursMTD',
      labelKey: 'dashboard.statsCards.accounting.billableHoursMTD',
      href: '/dashboard/business/billable-hours',
      linkTextKey: 'dashboard.statsCards.accounting.viewBillableHours',
      icon: IconClock,
      trendKey: 'utilizationRate',
      footerKey: 'complianceScore'
    },
    {
      key: 'revenueYTD',
      labelKey: 'dashboard.statsCards.accounting.annualRevenue',
      href: '/dashboard/business/revenue',
      linkTextKey: 'dashboard.statsCards.accounting.viewRevenueManagement',
      icon: IconCurrencyDollar,
      trendKey: 'revenuePending',
      footerKey: 'revenueGrowth'
    }
  ],

  // Financial PR 財經公關公司卡片
  'financial-pr': [
    {
      key: 'listedClients',
      labelKey: 'dashboard.statsCards.financialPR.listedClients',
      href: '/dashboard/business/listed-clients',
      linkTextKey: 'dashboard.statsCards.financialPR.viewListedClients',
      icon: IconBuilding,
      trendKey: 'activeContracts',
      footerKey: 'clientCount'
    },
    {
      key: 'announcementsThisMonth',
      labelKey: 'dashboard.statsCards.financialPR.monthlyAnnouncements',
      href: '/dashboard/business/announcements',
      linkTextKey: 'dashboard.statsCards.financialPR.viewAnnouncements',
      icon: IconSpeakerphone,
      trendKey: 'pendingAnnouncements',
      footerKey: 'announcementsTotal'
    },
    {
      key: 'mediaCoverage',
      labelKey: 'dashboard.statsCards.financialPR.mediaCoverage',
      href: '/dashboard/business/media-coverage',
      linkTextKey: 'dashboard.statsCards.financialPR.viewMediaCoverage',
      icon: IconNews,
      trendKey: 'positiveRate',
      footerKey: 'totalReach'
    },
    {
      key: 'activeEngagements',
      labelKey: 'dashboard.statsCards.financialPR.activeEngagements',
      href: '/dashboard/business/engagements',
      linkTextKey: 'dashboard.statsCards.financialPR.viewEngagements',
      icon: IconBriefcase,
      trendKey: 'engagementValue',
      footerKey: 'completedEngagements'
    }
  ],

  // IPO Advisory IPO顧問公司卡片
  'ipo-advisory': [
    {
      key: 'ipoMandates',
      labelKey: 'dashboard.statsCards.ipoAdvisory.ipoMandates',
      href: '/dashboard/business/ipo-mandates',
      linkTextKey: 'dashboard.statsCards.ipoAdvisory.viewIPOMandates',
      icon: IconChartLine,
      trendKey: 'pipelineValue',
      footerKey: 'sfcApproved'
    },
    {
      key: 'activeEngagements',
      labelKey: 'dashboard.statsCards.ipoAdvisory.engagements',
      href: '/dashboard/business/engagements',
      linkTextKey: 'dashboard.statsCards.ipoAdvisory.viewEngagements',
      icon: IconFileCheck,
      trendKey: 'engagementValue',
      footerKey: 'pendingTasks'
    },
    {
      key: 'clientPerformance',
      labelKey: 'dashboard.statsCards.ipoAdvisory.clientPerformance',
      href: '/dashboard/business/client-performance',
      linkTextKey: 'dashboard.statsCards.ipoAdvisory.viewClientPerformance',
      icon: IconCertificate,
      trendKey: 'satisfactionScore',
      footerKey: 'projectsCompleted'
    },
    {
      key: 'revenueYTD',
      labelKey: 'dashboard.statsCards.ipoAdvisory.revenueManagement',
      href: '/dashboard/business/revenue',
      linkTextKey: 'dashboard.statsCards.ipoAdvisory.viewRevenueManagement',
      icon: IconCurrencyDollar,
      trendKey: 'revenuePending',
      footerKey: 'revenueGrowth'
    }
  ]
};

export function StatsCards() {
  const { t } = useTranslation();
  const { dashboardData, isLoading, isUsingMockData, refetch } = useDashboardData();
  const { currentCompany } = useApp();
  const router = useRouter();
  
  // 獲取當前公司類型，默認使用會計
  const companyType = currentCompany?.type || 'accounting';

  // Loading state
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className='@container/card'>
            <CardHeader>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-8 w-32' />
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-20' />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // 根據公司類型獲取卡片配置
  const cardConfigs = cardConfigsByType[companyType] || cardConfigsByType.accounting;

  // 從 dashboardData 獲取值的輔助函數
  const getValue = (key: string): string => {
    const value = dashboardData?.[key];
    if (value === undefined || value === null) return '0';
    if (typeof value === 'number') {
      // 格式化數字
      if (value >= 1000000) {
        return `HK$${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `HK$${(value / 1000).toFixed(0)}K`;
      }
      return value.toString();
    }
    return String(value);
  };

  const getTrend = (key?: string): string => {
    if (!key) return '';
    const value = dashboardData?.[key];
    if (value === undefined || value === null) return '';
    if (typeof value === 'number') {
      if (key.includes('Rate') || key.includes('Score')) {
        return `${value}%`;
      }
      if (value >= 1000000) {
        return `HK$${(value / 1000000).toFixed(1)}M`;
      }
      return value.toString();
    }
    return String(value);
  };

  const getFooter = (key?: string): string => {
    if (!key) return '';
    const value = dashboardData?.[key];
    if (value === undefined || value === null) return '';
    return String(value);
  };

  const getBadgeText = (config: CardConfig): string => {
    // 根據數據類型返回適當的 badge
    const key = config.key;
    if (key.includes('Pending') || key.includes('Progress')) return t('dashboard.statsCards.active');
    if (key.includes('Revenue')) return t('dashboard.statsCards.growth');
    if (key.includes('Clients') || key.includes('Coverage')) return t('dashboard.statsCards.active');
    return t('dashboard.statsCards.active');
  };

  return (
    <div className='space-y-2'>
      {/* Data source indicator */}
      <div className='flex items-center justify-end gap-2 text-xs text-muted-foreground'>
        {isUsingMockData ? (
          <span className='flex items-center gap-1'>
            <IconCloudOff className='size-3' />
            {t('dashboard.demoData')}
          </span>
        ) : (
          <span className='flex items-center gap-1 text-green-600'>
            <IconCloud className='size-3' />
            {t('dashboard.liveAPI')}
          </span>
        )}
        <button onClick={refetch} className='p-1 hover:bg-muted rounded'>
          <IconRefresh className='size-3' />
        </button>
      </div>

      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
        {cardConfigs.map((config, index) => {
          const IconComponent = config.icon;
          const value = getValue(config.key);
          const trend = getTrend(config.trendKey);
          const footer = getFooter(config.footerKey);
          const badge = getBadgeText(config);
          
          const handleCardClick = () => {
            router.push(config.href);
          };
          
          return (
            <div key={index} className='group' onClick={handleCardClick}>
              <Card className='@container/card h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 cursor-pointer'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardDescription>{t(config.labelKey)}</CardDescription>
                    {IconComponent && <IconComponent className='size-5 text-muted-foreground' />}
                  </div>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                    {value}
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline'>
                      <IconTrendingUp />
                      {badge}
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  {trend && (
                    <div className='line-clamp-1 flex gap-2 font-medium'>
                      {trend} <IconTrendingUp className='size-4' />
                    </div>
                  )}
                  {footer && (
                    <div className='text-muted-foreground'>
                      {footer}
                    </div>
                  )}
                  <div className='flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity'>
                    <IconExternalLink className='size-3' />
                    {t(config.linkTextKey)}
                  </div>
                </CardFooter>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
