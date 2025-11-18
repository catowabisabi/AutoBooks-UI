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

const LandingPageFeatureSection = () => {
  // Features List
  const features = [
    {
      icon: <Users size={20} />,
      text: 'Human Resource Management',
      description:
        'Handle employee records, payroll, attendance, and leaves with complete visibility and automation.'
    },
    {
      icon: <BarChart size={20} />,
      text: 'Smart Analytics',
      description:
        'Let our AI assistants convert data into dashboards, reports, and strategic insights – instantly.'
    },
    {
      icon: <Calendar size={20} />,
      text: 'Project Management',
      description:
        'Plan, track, and manage projects with integrated timelines, resource allocation, and progress tracking.'
    },
    {
      icon: <DollarSign size={20} />,
      text: 'Financial Management',
      description:
        'Streamline accounting, budgeting, invoicing, and financial reporting with automated workflows.'
    },
    {
      icon: <Bell size={20} />,
      text: 'Notification System',
      description:
        'Stay informed with real-time alerts for tasks, approvals, deadlines, and important updates.'
    },
    {
      icon: <FileText size={20} />,
      text: 'Document Management',
      description:
        'Centralize, organize, and secure all your business documents with intelligent search and retrieval.'
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
          Key Features
        </h2>
        <p className={LANDING_SECTION_STYLES.sectionHeader.subtitle}>
          Comprehensive tools to streamline operations, automate workflows, and
          drive business growth.
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
                    {feature.text}
                  </h5>
                  <p className={LANDING_SECTION_STYLES.card.description}>
                    {feature.description}
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
