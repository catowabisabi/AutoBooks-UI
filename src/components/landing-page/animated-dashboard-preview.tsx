'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

// Animated Line Chart Component
function AnimatedLineChart() {
  const [points, setPoints] = useState<number[]>([30, 45, 35, 55, 40, 60, 50, 70, 65, 80, 75, 90]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPoints(prev => {
        const newPoints = [...prev.slice(1)];
        newPoints.push(Math.floor(Math.random() * 40) + 50);
        return newPoints;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const pathD = points.map((p, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 100 - p;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={pathD + ` L 100 100 L 0 100 Z`}
        fill="url(#lineGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d={pathD}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
}

// Animated Bar Chart Component
function AnimatedBarChart() {
  const [bars, setBars] = useState([65, 80, 45, 90, 70, 55, 85]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.floor(Math.random() * 50) + 40));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-end justify-between h-full gap-1 px-2">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="flex-1 bg-gradient-to-t from-primary/80 to-primary rounded-t"
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// Animated Donut Chart Component
function AnimatedDonutChart() {
  const segments = [
    { percent: 35, color: 'hsl(var(--primary))' },
    { percent: 25, color: 'hsl(var(--primary) / 0.7)' },
    { percent: 20, color: 'hsl(var(--primary) / 0.5)' },
    { percent: 20, color: 'hsl(var(--primary) / 0.3)' },
  ];

  let cumulativePercent = 0;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {segments.map((segment, i) => {
        const startPercent = cumulativePercent;
        cumulativePercent += segment.percent;
        const startAngle = (startPercent / 100) * 360 - 90;
        const endAngle = (cumulativePercent / 100) * 360 - 90;
        
        const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
        const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
        const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
        const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
        
        const largeArcFlag = segment.percent > 50 ? 1 : 0;
        
        return (
          <motion.path
            key={i}
            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
            fill={segment.color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          />
        );
      })}
      <circle cx="50" cy="50" r="25" fill="hsl(var(--card))" />
    </svg>
  );
}

// Stat Card Component
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  isPositive 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  change: string;
  isPositive: boolean;
}) {
  return (
    <motion.div 
      className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className={`flex items-center text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {change}
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </motion.div>
  );
}

// Transaction Row Component
function TransactionRow({ name, amount, type, delay }: { name: string; amount: string; type: 'income' | 'expense'; delay: number }) {
  return (
    <motion.div 
      className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm">{name}</span>
      </div>
      <span className={`text-sm font-medium ${type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
        {type === 'income' ? '+' : '-'}{amount}
      </span>
    </motion.div>
  );
}

export default function AnimatedDashboardPreview() {
  const [currentView, setCurrentView] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Browser Chrome */}
      <div className="bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
        {/* Browser Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-muted/50 rounded-lg px-4 py-1 text-xs text-muted-foreground flex items-center gap-2">
              <Activity className="h-3 w-3" />
              app.autobooks.ai/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 bg-gradient-to-br from-background to-muted/20 min-h-[400px]">
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard icon={DollarSign} label="總營收" value="$128,450" change="+12.5%" isPositive={true} />
            <StatCard icon={TrendingUp} label="淨利潤" value="$45,200" change="+8.2%" isPositive={true} />
            <StatCard icon={FileText} label="待處理發票" value="23" change="-5.1%" isPositive={true} />
            <StatCard icon={Users} label="活躍客戶" value="156" change="+3.4%" isPositive={true} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Main Chart */}
            <motion.div 
              className="col-span-2 bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border/50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">營收趨勢</h3>
                  <p className="text-xs text-muted-foreground">過去 12 個月</p>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="h-40">
                <AnimatedLineChart />
              </div>
            </motion.div>

            {/* Side Charts */}
            <div className="space-y-4">
              <motion.div 
                className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border/50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">支出分佈</h3>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="h-24">
                  <AnimatedDonutChart />
                </div>
              </motion.div>

              <motion.div 
                className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border/50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h3 className="text-sm font-semibold mb-2">最近交易</h3>
                <TransactionRow name="客戶付款" amount="$2,450" type="income" delay={0.6} />
                <TransactionRow name="辦公室租金" amount="$1,200" type="expense" delay={0.7} />
                <TransactionRow name="軟體銷售" amount="$890" type="income" delay={0.8} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute -top-4 -right-4 bg-green-500/90 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: "spring" }}
      >
        +$12,450 今日
      </motion.div>

      <motion.div
        className="absolute -bottom-4 -left-4 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium shadow-lg flex items-center gap-1"
        initial={{ scale: 0, rotate: 10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.2, type: "spring" }}
      >
        <TrendingUp className="h-3 w-3" />
        AI 分析中...
      </motion.div>
    </div>
  );
}
