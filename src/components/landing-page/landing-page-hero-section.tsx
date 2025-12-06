'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LANDING_SECTION_STYLES,
  LANDING_ANIMATIONS
} from '@/lib/landing-page-styles';
import { useTranslation } from '@/lib/i18n/provider';

const LandingPageHeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className={LANDING_SECTION_STYLES.hero.section}>
      {/* Background decorations */}
      <div className={LANDING_SECTION_STYLES.backgroundWrapper}>
        <div
          className={LANDING_SECTION_STYLES.backgroundDecorations.topRight}
        ></div>
        <div
          className={LANDING_SECTION_STYLES.backgroundDecorations.bottomLeft}
        ></div>
      </div>

      {/* Hero Content */}
      <div className={LANDING_SECTION_STYLES.hero.contentWrapper}>
        {/* Hero Icon */}
        <motion.div
          {...LANDING_ANIMATIONS.scaleIn}
          className={LANDING_SECTION_STYLES.hero.icon}
        >
          <GraduationCap size={48} />
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          {...LANDING_ANIMATIONS.fadeInUp}
          className={LANDING_SECTION_STYLES.hero.title}
        >
          <span className={LANDING_SECTION_STYLES.hero.titleGradient}>
            WiseMatic ERP
          </span>
          <br />
          {t('landing.hero.tagline', 'The Smartest Way to Run Your Enterprise')}
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: false }}
          className={LANDING_SECTION_STYLES.hero.subtitle}
        >
          {t('landing.hero.subtitle', 'An AI-powered, all-in-one ERP platform designed to streamline operations, automate workflows, and empower organizations with actionable insights.')}
        </motion.p>

        {/* Hero Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: false }}
          className={LANDING_SECTION_STYLES.hero.buttonContainer}
        >
          <Link href='/#features' passHref>
            <motion.button
              {...LANDING_ANIMATIONS.buttonHover}
              className={LANDING_SECTION_STYLES.hero.primaryButton}
            >
              {t('landing.hero.exploreFeatures', 'Explore Features')}
            </motion.button>
          </Link>
          <Link href='/auth/signup' passHref>
            <motion.button
              {...LANDING_ANIMATIONS.buttonHover}
              className={LANDING_SECTION_STYLES.hero.secondaryButton}
            >
              {t('landing.hero.getStarted', 'Get Started')}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingPageHeroSection;
