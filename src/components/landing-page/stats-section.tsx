'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, FileText, TrendingUp, Clock } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/provider';

// Calculate base numbers from EST midnight today
function getBaseNumbers() {
  // Get current time in EST
  const now = new Date();
  const estOffset = -5; // EST is UTC-5
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const estTime = new Date(utc + (3600000 * estOffset));
  
  // Get minutes since midnight EST today
  const midnightEST = new Date(estTime);
  midnightEST.setHours(0, 0, 0, 0);
  const minutesSinceMidnight = Math.floor((estTime.getTime() - midnightEST.getTime()) / 60000);
  
  // Base numbers (starting values)
  const baseUsers = 5000;
  const baseInvoices = 2500000;
  
  // Increment per minute
  const usersIncrement = minutesSinceMidnight * 1; // +1 user per minute
  const invoicesIncrement = minutesSinceMidnight * (baseUsers + usersIncrement) * 3; // x active users x 3
  
  return {
    users: baseUsers + usersIncrement,
    invoices: baseInvoices + invoicesIncrement
  };
}

interface StatItemProps {
  icon: React.ReactNode;
  getValue: () => number;
  suffix?: string;
  prefix?: string;
  labelKey: string;
  defaultLabel: string;
  delay: number;
  format?: 'number' | 'compact';
}

function AnimatedCounter({ 
  getValue, 
  suffix = '', 
  prefix = '',
  format = 'number'
}: { 
  getValue: () => number; 
  suffix?: string; 
  prefix?: string;
  format?: 'number' | 'compact';
}) {
  const [displayCount, setDisplayCount] = useState(0);
  const [targetValue, setTargetValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update target value every minute
  useEffect(() => {
    if (!mounted) return;
    
    const updateTarget = () => {
      setTargetValue(getValue());
    };
    
    updateTarget();
    const interval = setInterval(updateTarget, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [mounted, getValue]);

  // Animate to target
  useEffect(() => {
    if (!isInView || !mounted || targetValue === 0) return;
    
    const duration = 2000;
    const steps = 60;
    const startValue = displayCount;
    const increment = (targetValue - startValue) / steps;
    let current = startValue;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayCount(targetValue);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, mounted, targetValue]);

  const formatNumber = (num: number) => {
    if (format === 'compact' && num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (format === 'compact' && num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toLocaleString();
  };

  if (!mounted) {
    return <span ref={ref}>--</span>;
  }

  return (
    <span ref={ref}>
      {prefix}{formatNumber(displayCount)}{suffix}
    </span>
  );
}

function StatItem({ icon, getValue, suffix, prefix, labelKey, defaultLabel, delay, format }: StatItemProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 text-primary mb-3 md:mb-4">
        {icon}
      </div>
      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 md:mb-2">
        <AnimatedCounter getValue={getValue} suffix={suffix} prefix={prefix} format={format} />
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground">
        {t(labelKey, defaultLabel)}
      </p>
    </motion.div>
  );
}

export default function StatsSection() {
  const { t } = useTranslation();

  // Memoize getValue functions to prevent unnecessary re-renders
  const getUsers = useMemo(() => () => getBaseNumbers().users, []);
  const getInvoices = useMemo(() => () => getBaseNumbers().invoices, []);
  const getAccuracy = useMemo(() => () => 99, []);
  const getTimeSaved = useMemo(() => () => 80, []);

  const stats = [
    {
      icon: <Users className="h-5 w-5 md:h-7 md:w-7" />,
      getValue: getUsers,
      suffix: '+',
      labelKey: 'landing.stats.activeUsers',
      defaultLabel: 'Active Users',
      format: 'compact' as const
    },
    {
      icon: <FileText className="h-5 w-5 md:h-7 md:w-7" />,
      getValue: getInvoices,
      suffix: '+',
      labelKey: 'landing.stats.invoicesProcessed',
      defaultLabel: 'Invoices Processed',
      format: 'compact' as const
    },
    {
      icon: <TrendingUp className="h-5 w-5 md:h-7 md:w-7" />,
      getValue: getAccuracy,
      suffix: '%',
      labelKey: 'landing.stats.accuracy',
      defaultLabel: 'AI Accuracy',
      format: 'number' as const
    },
    {
      icon: <Clock className="h-5 w-5 md:h-7 md:w-7" />,
      getValue: getTimeSaved,
      suffix: '%',
      labelKey: 'landing.stats.timeSaved',
      defaultLabel: 'Time Saved',
      format: 'number' as const
    }
  ];

  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5" />
      
      {/* Decorative elements */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 rounded-full bg-primary/20 blur-2xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-purple-500/20 blur-2xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
      />

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
            {t('landing.stats.title', 'Trusted by')}
            {' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {t('landing.stats.titleHighlight', 'Growing Businesses')}
            </span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            {t('landing.stats.subtitle', 'Join thousands of businesses that have transformed their financial operations with AutoBooks.')}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              icon={stat.icon}
              getValue={stat.getValue}
              suffix={stat.suffix}
              labelKey={stat.labelKey}
              defaultLabel={stat.defaultLabel}
              delay={index * 0.1}
              format={stat.format}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
