'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n/provider';
import { Sparkles, Brain, TrendingUp, BarChart3, PieChart, FileSpreadsheet } from 'lucide-react';

// Animated number that changes
function AnimatedNumber({ value, color }: { value: number; color: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="font-mono font-bold"
      style={{ color }}
    >
      {value.toLocaleString()}
    </motion.span>
  );
}

// Spreadsheet row animation
function SpreadsheetRow({ 
  label, 
  value, 
  color, 
  delay 
}: { 
  label: string; 
  value: number; 
  color: string; 
  delay: number;
}) {
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentValue(prev => {
        const change = Math.floor(Math.random() * 2000) - 1000;
        return Math.max(0, prev + change);
      });
    }, 2000 + delay * 500);
    return () => clearInterval(interval);
  }, [delay]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay * 0.1 }}
      className="flex items-center justify-between py-1.5 px-2 rounded border-b border-border/20"
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <AnimatePresence mode="wait">
        <AnimatedNumber value={currentValue} color={color} />
      </AnimatePresence>
    </motion.div>
  );
}

// Mini bar chart
function MiniBarChart() {
  const [mounted, setMounted] = useState(false);
  const [bars, setBars] = useState([40, 65, 45, 80, 55, 70, 90]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.floor(Math.random() * 60) + 30));
    }, 2500);
    return () => clearInterval(interval);
  }, [mounted]);

  return (
    <div className="flex items-end gap-1 h-16">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t"
          style={{
            background: `linear-gradient(to top, ${
              i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#22c55e' : '#f59e0b'
            }, ${
              i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#10b981' : '#eab308'
            })`
          }}
          animate={{ height: `${height}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// Mini line chart
function MiniLineChart() {
  const [mounted, setMounted] = useState(false);
  const [points, setPoints] = useState([20, 35, 25, 50, 40, 60, 45, 70]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setPoints(prev => {
        const newPoints = [...prev.slice(1)];
        newPoints.push(Math.floor(Math.random() * 50) + 30);
        return newPoints;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [mounted]);

  const pathD = points.map((p, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 100 - p;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id="miniLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={pathD + ` L 100 100 L 0 100 Z`}
        fill="url(#miniLineGrad)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.path
        d={pathD}
        fill="none"
        stroke="#22c55e"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Mini pie chart
function MiniPieChart() {
  const segments = [
    { percent: 35, color: '#3b82f6' },
    { percent: 25, color: '#22c55e' },
    { percent: 20, color: '#f59e0b' },
    { percent: 20, color: '#ef4444' },
  ];

  let cumulativePercent = 0;

  return (
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      {segments.map((segment, i) => {
        const startPercent = cumulativePercent;
        cumulativePercent += segment.percent;
        const startAngle = (startPercent / 100) * 360 - 90;
        const endAngle = (cumulativePercent / 100) * 360 - 90;
        
        const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
        const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
        const x2 = 50 + 45 * Math.cos((endAngle * Math.PI) / 180);
        const y2 = 50 + 45 * Math.sin((endAngle * Math.PI) / 180);
        
        const largeArcFlag = segment.percent > 50 ? 1 : 0;
        
        return (
          <motion.path
            key={i}
            d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
            fill={segment.color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1, type: "spring" }}
          />
        );
      })}
      <circle cx="50" cy="50" r="20" fill="hsl(var(--card))" />
    </svg>
  );
}

// AI thinking dots animation
function ThinkingDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
}

// AI Prompt typing animation
function AIPrompt({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let index = 0;
    setDisplayText('');
    setIsTyping(true);
    
    const typingInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(prev => prev + text[index]);
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
        
        // Reset after pause
        setTimeout(() => {
          setDisplayText('');
          index = 0;
          setIsTyping(true);
        }, 3000);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [text]);

  return (
    <div className="flex items-center gap-2 text-sm text-primary">
      <Sparkles className="w-4 h-4 shrink-0" />
      <span className="font-medium">{displayText}</span>
      {isTyping && (
        <motion.span
          className="w-0.5 h-4 bg-primary"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}

export default function AnimatedAIChart() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setCurrentPromptIndex(prev => (prev + 1) % 3);
    }, 8000);
    return () => clearInterval(interval);
  }, [mounted]);

  const prompts = [
    { key: 'landing.aiChat.prompt1', default: 'Analyzing cash flow patterns...' },
    { key: 'landing.aiChat.prompt2', default: 'Detecting anomalies in expenses...' },
    { key: 'landing.aiChat.prompt3', default: 'Forecasting next quarter revenue...' },
  ];

  const spreadsheetData = [
    { labelKey: 'landing.aiChat.revenue', defaultLabel: 'Revenue', value: 125680, color: '#22c55e' },
    { labelKey: 'landing.aiChat.expenses', defaultLabel: 'Expenses', value: 78450, color: '#ef4444' },
    { labelKey: 'landing.aiChat.profit', defaultLabel: 'Profit', value: 47230, color: '#3b82f6' },
    { labelKey: 'landing.aiChat.forecast', defaultLabel: 'Forecast', value: 156890, color: '#f59e0b' },
  ];

  if (!mounted) {
    return (
      <div className="w-full max-w-md bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse bg-muted rounded w-full h-full" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md"
    >
      <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl overflow-hidden">
        {/* Header with AI indicator */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <motion.div
              className="p-1.5 rounded-lg bg-primary/20"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-sm font-medium" suppressHydrationWarning>
              {mounted ? t('landing.aiChat.title') : 'AutoBooks AI'}
            </span>
          </div>
          <ThinkingDots />
        </div>

        {/* AI Prompt */}
        <div className="px-4 py-3 bg-primary/5 border-b border-border/30">
          <AIPrompt 
            text={mounted ? t(prompts[currentPromptIndex].key) : prompts[currentPromptIndex].default} 
          />
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Spreadsheet section */}
          <motion.div 
            className="bg-muted/30 rounded-xl p-3 border border-border/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground" suppressHydrationWarning>
                {mounted ? t('landing.aiChat.liveData') : 'Live Financial Data'}
              </span>
            </div>
            {spreadsheetData.map((row, i) => (
              <SpreadsheetRow
                key={i}
                label={mounted ? t(row.labelKey) : row.defaultLabel}
                value={row.value}
                color={row.color}
                delay={i}
              />
            ))}
          </motion.div>

          {/* Charts grid */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              className="bg-muted/30 rounded-xl p-3 border border-border/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-1 mb-2">
                <BarChart3 className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                  {mounted ? t('landing.aiChat.monthlyRevenue') : 'Monthly'}
                </span>
              </div>
              <MiniBarChart />
            </motion.div>

            <motion.div
              className="bg-muted/30 rounded-xl p-3 border border-border/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-1 mb-2">
                <TrendingUp className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                  {mounted ? t('landing.aiChat.trend') : 'Trend'}
                </span>
              </div>
              <MiniLineChart />
            </motion.div>
          </div>

          {/* Pie chart and insight */}
          <motion.div
            className="flex items-center gap-4 bg-muted/30 rounded-xl p-3 border border-border/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MiniPieChart />
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <PieChart className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                  {mounted ? t('landing.aiChat.expenses') : 'Expense Breakdown'}
                </span>
              </div>
              <p className="text-xs text-primary font-medium" suppressHydrationWarning>
                {mounted ? t('landing.aiChat.insight') : '💡 Marketing spend 15% above target'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
