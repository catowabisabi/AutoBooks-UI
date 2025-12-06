'use client';

import { motion } from 'framer-motion';
import {
  Calendar,
  DollarSign,
  Users,
  Bell,
  BarChart,
  FileText
} from 'lucide-react';
import {
  LANDING_SECTION_STYLES,
  LANDING_ANIMATIONS
} from '@/lib/landing-page-styles';
import { useTranslation } from '@/lib/i18n/provider';

const LandingPageFeatureSection = () => {
  const { t } = useTranslation();

  // Features List with translation keys
  const features = [
    {
      icon: <Users size={20} />,
      textKey: 'landing.features.hrm.title',
      descKey: 'landing.features.hrm.description',
      defaultText: 'Human Resource Management',
      defaultDesc: 'Handle employee records, payroll, attendance, and leaves with complete visibility and automation.'
    },
    {
      icon: <BarChart size={20} />,
      textKey: 'landing.features.analytics.title',
      descKey: 'landing.features.analytics.description',
      defaultText: 'Smart Analytics',
      defaultDesc: 'Let our AI assistants convert data into dashboards, reports, and strategic insights – instantly.'
    },
    {
      icon: <Calendar size={20} />,
      textKey: 'landing.features.project.title',
      descKey: 'landing.features.project.description',
      defaultText: 'Project Management',
      defaultDesc: 'Plan, track, and manage projects with integrated timelines, resource allocation, and progress tracking.'
    },
    {
      icon: <DollarSign size={20} />,
      textKey: 'landing.features.finance.title',
      descKey: 'landing.features.finance.description',
      defaultText: 'Financial Management',
      defaultDesc: 'Streamline accounting, budgeting, invoicing, and financial reporting with automated workflows.'
    },
    {
      icon: <Bell size={20} />,
      textKey: 'landing.features.notification.title',
      descKey: 'landing.features.notification.description',
      defaultText: 'Notification System',
      defaultDesc: 'Stay informed with real-time alerts for tasks, approvals, deadlines, and important updates.'
    },
    {
      icon: <FileText size={20} />,
      textKey: 'landing.features.document.title',
      descKey: 'landing.features.document.description',
      defaultText: 'Document Management',
      defaultDesc: 'Centralize, organize, and secure all your business documents with intelligent search and retrieval.'
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
        <h2 className={LANDING_SECTION_STYLES.sectionHeader.title}>
          {t('landing.features.title', 'Key Features')}
        </h2>
        <p className={LANDING_SECTION_STYLES.sectionHeader.subtitle}>
          {t('landing.features.subtitle', 'Comprehensive tools to streamline operations, automate workflows, and drive business growth.')}
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
                  <h5 className={LANDING_SECTION_STYLES.card.title}>
                    {t(feature.textKey, feature.defaultText)}
                  </h5>
                  <p className={LANDING_SECTION_STYLES.card.description}>
                    {t(feature.descKey, feature.defaultDesc)}
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
