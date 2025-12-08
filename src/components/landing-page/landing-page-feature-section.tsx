'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Calculator,
  DollarSign,
  Users,
  Bell,
  Brain,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/provider';
import AnimatedAIChart from './animated-ai-chart';

// 5 unique animation variants
const animationVariants = {
  // 1. Slide from left with bounce
  slideLeft: {
    hidden: { opacity: 0, x: -80 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  },
  // 2. Fade up with scale
  fadeUpScale: {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },
  // 3. Rotate in from right
  rotateRight: {
    hidden: { opacity: 0, x: 80, rotate: 10 },
    visible: { 
      opacity: 1, 
      x: 0, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12
      }
    }
  },
  // 4. Pop with elastic
  popElastic: {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  },
  // 5. Slide from bottom with blur (simulated)
  slideUpBlur: {
    hidden: { opacity: 0, y: 60, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }
};

const animationKeys = ['slideLeft', 'fadeUpScale', 'rotateRight', 'popElastic', 'slideUpBlur'] as const;

interface FeaturePointProps {
  icon: React.ReactNode;
  textKey: string;
  descKey: string;
  defaultText: string;
  defaultDesc: string;
  index: number;
  t: (key: string, defaultValue?: string) => string;
}

function FeaturePoint({ icon, textKey, descKey, defaultText, defaultDesc, index, t }: FeaturePointProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const animationKey = animationKeys[index % animationKeys.length];
  
  return (
    <motion.div
      ref={ref}
      variants={animationVariants[animationKey]}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="group relative"
    >
      <div className="flex items-start gap-4 p-4 md:p-6 rounded-2xl transition-all duration-300 hover:bg-primary/5">
        {/* Animated Icon Container */}
        <motion.div 
          className="relative shrink-0"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/20 group-hover:border-primary/40 transition-colors">
            {icon}
          </div>
          {/* Pulse effect on hover */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-primary/20"
            initial={{ scale: 1, opacity: 0 }}
            whileHover={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </motion.div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            <h3 className="font-semibold text-base md:text-lg text-foreground group-hover:text-primary transition-colors">
              {t(textKey, defaultText)}
            </h3>
          </div>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {t(descKey, defaultDesc)}
          </p>
        </div>
        
        {/* Arrow indicator on hover */}
        <motion.div
          className="self-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <ArrowRight className="w-5 h-5 text-primary" />
        </motion.div>
      </div>
      
      {/* Connecting line for visual flow */}
      {index < 5 && (
        <div className="absolute left-7 md:left-8 top-[72px] md:top-[80px] w-0.5 h-8 bg-gradient-to-b from-primary/20 to-transparent" />
      )}
    </motion.div>
  );
}

const LandingPageFeatureSection = () => {
  const { t } = useTranslation();

  // Features List with translation keys
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      textKey: 'landing.features.analytics.title',
      descKey: 'landing.features.analytics.description',
      defaultText: 'AI That Knows Your Business',
      defaultDesc: 'Stop guessing. AI analyzes cash flow trends, alerts you to risks, and accurately forecasts future revenue.'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      textKey: 'landing.features.finance.title',
      descKey: 'landing.features.finance.description',
      defaultText: 'Zero-Entry Bookkeeping',
      defaultDesc: 'Snap a photo of invoices to book them instantly. Auto-reconcile bank transactions. 99% accuracy.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      textKey: 'landing.features.hrm.title',
      descKey: 'landing.features.hrm.description',
      defaultText: 'Smart Payroll Management',
      defaultDesc: 'Auto-calculate salaries, MPF, tax deductions. Employee self-service payslips. Reduce HR workload by 70%.'
    },
    {
      icon: <Calculator className="w-6 h-6" />,
      textKey: 'landing.features.project.title',
      descKey: 'landing.features.project.description',
      defaultText: 'Real-Time Project Costing',
      defaultDesc: 'Track labor and expenses for every project at a glance. Overspend alerts and resource optimization.'
    },
    {
      icon: <Bell className="w-6 h-6" />,
      textKey: 'landing.features.notification.title',
      descKey: 'landing.features.notification.description',
      defaultText: 'Never Miss What Matters',
      defaultDesc: 'Receivables due, tax filing deadlines, pending approvals... Smart reminders for everything important.'
    },
    {
      icon: <Search className="w-6 h-6" />,
      textKey: 'landing.features.document.title',
      descKey: 'landing.features.document.description',
      defaultText: 'Find Documents in Seconds',
      defaultDesc: 'Contracts, invoices, receipts — all digitized. AI-powered categorization. Type a keyword, find it instantly.'
    }
  ];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      {/* Floating decorations */}
      <motion.div
        className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {t('landing.features.badge', 'Powerful Features')}
            </span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
            {t('landing.features.title', 'Why Choose')}{' '}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
              {t('landing.features.titleHighlight', 'AutoBooks')}
            </span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('landing.features.subtitle', 'More than an ERP — your intelligent financial partner. Say goodbye to tedious tasks, embrace efficiency.')}
          </p>
        </motion.div>

        {/* Two Column Layout - AI Chart + Features */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - AI Chart Animation */}
          <div className="hidden lg:flex justify-center items-start sticky top-24">
            <AnimatedAIChart />
          </div>

          {/* Right Column - Features List */}
          <div className="space-y-2">
            {features.map((feature, index) => (
              <FeaturePoint
                key={index}
                icon={feature.icon}
                textKey={feature.textKey}
                descKey={feature.descKey}
                defaultText={feature.defaultText}
                defaultDesc={feature.defaultDesc}
                index={index}
                t={t}
              />
            ))}
          </div>
        </div>

        {/* Mobile AI Chart - shown below features on mobile */}
        <div className="lg:hidden mt-12 flex justify-center">
          <AnimatedAIChart />
        </div>
      </div>
    </section>
  );
};

export default LandingPageFeatureSection;
