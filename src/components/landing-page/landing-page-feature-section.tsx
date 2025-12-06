'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  DollarSign,
  Users,
  Bell,
  Brain,
  Search
} from 'lucide-react';
import {
  LANDING_SECTION_STYLES,
  LANDING_ANIMATIONS
} from '@/lib/landing-page-styles';
import { useTranslation } from '@/lib/i18n/provider';

const LandingPageFeatureSection = () => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Features List with translation keys
  const features = [
    {
      icon: <Users size={20} />,
      textKey: 'landing.features.hrm.title',
      descKey: 'landing.features.hrm.description',
      defaultText: 'Smart Payroll Management',
      defaultDesc: 'Auto-calculate salaries, MPF, tax deductions. Employee self-service payslips. Reduce HR workload by 70%.'
    },
    {
      icon: <Brain size={20} />,
      textKey: 'landing.features.analytics.title',
      descKey: 'landing.features.analytics.description',
      defaultText: 'AI That Knows Your Business',
      defaultDesc: 'Stop guessing. AI analyzes cash flow trends, alerts you to risks, and accurately forecasts future revenue.'
    },
    {
      icon: <Calculator size={20} />,
      textKey: 'landing.features.project.title',
      descKey: 'landing.features.project.description',
      defaultText: 'Real-Time Project Costing',
      defaultDesc: 'Track labor and expenses for every project at a glance. Overspend alerts and resource optimization.'
    },
    {
      icon: <DollarSign size={20} />,
      textKey: 'landing.features.finance.title',
      descKey: 'landing.features.finance.description',
      defaultText: 'Zero-Entry Bookkeeping',
      defaultDesc: 'Snap a photo of invoices to book them instantly. Auto-reconcile bank transactions. 99% accuracy.'
    },
    {
      icon: <Bell size={20} />,
      textKey: 'landing.features.notification.title',
      descKey: 'landing.features.notification.description',
      defaultText: 'Never Miss What Matters',
      defaultDesc: 'Receivables due, tax filing deadlines, pending approvals... Smart reminders for everything important.'
    },
    {
      icon: <Search size={20} />,
      textKey: 'landing.features.document.title',
      descKey: 'landing.features.document.description',
      defaultText: 'Find Documents in Seconds',
      defaultDesc: 'Contracts, invoices, receipts — all digitized. AI-powered categorization. Type a keyword, find it instantly.'
    }
  ];

  return (
    <section className={LANDING_SECTION_STYLES.section}>
      {/* Background decorations */}
      <div className={LANDING_SECTION_STYLES.backgroundWrapper}>
        <div
          className={LANDING_SECTION_STYLES.backgroundDecorations.topRight}
        ></div>
        <div
          className={LANDING_SECTION_STYLES.backgroundDecorations.bottomLeft}
        ></div>
      </div>

      {/* Section Title */}
      <motion.div
        {...LANDING_ANIMATIONS.fadeInUp}
        className={LANDING_SECTION_STYLES.sectionHeader.wrapper}
      >
        <h2 className={LANDING_SECTION_STYLES.sectionHeader.title} suppressHydrationWarning>
          {mounted ? t('landing.features.title') : 'Why Choose'}{' '}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent" suppressHydrationWarning>
            {mounted ? t('landing.features.titleHighlight') : 'AutoBooks'}
          </span>
        </h2>
        <p className={LANDING_SECTION_STYLES.sectionHeader.subtitle} suppressHydrationWarning>
          {mounted ? t('landing.features.subtitle') : 'More than an ERP — your intelligent financial partner. Say goodbye to tedious tasks, embrace efficiency.'}
        </p>
      </motion.div>

      {/* Features Grid */}
      <div
        className={`${LANDING_SECTION_STYLES.contentWrapper} ${LANDING_SECTION_STYLES.grid.features}`}
      >
        {features.map((feature, index) => (
          <motion.div key={index} {...LANDING_ANIMATIONS.staggeredCards(index)}>
            <div className={LANDING_SECTION_STYLES.card.featureCard}>
              {/* Animated Background Effect */}
              <div className={LANDING_SECTION_STYLES.card.hoverEffect}></div>

              {/* Feature Content */}
              <div className={LANDING_SECTION_STYLES.card.content}>
                {/* Feature Icon */}
                <div className={LANDING_SECTION_STYLES.card.icon}>
                  {feature.icon}
                </div>

                {/* Feature Details */}
                <div>
                  <h5 className={LANDING_SECTION_STYLES.card.title} suppressHydrationWarning>
                    {mounted ? t(feature.textKey) : feature.defaultText}
                  </h5>
                  <p className={LANDING_SECTION_STYLES.card.description} suppressHydrationWarning>
                    {mounted ? t(feature.descKey) : feature.defaultDesc}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default LandingPageFeatureSection;
