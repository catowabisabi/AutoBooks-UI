'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LANDING_SECTION_STYLES,
  LANDING_ANIMATIONS
} from '@/lib/landing-page-styles';
import { useTranslation } from '@/lib/i18n/provider';

const LandingPageHeroSection = () => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          <Sparkles size={48} />
        </motion.div>

        {/* Hero Tagline Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: false }}
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
        >
          <Sparkles size={16} />
          <span suppressHydrationWarning>
            {mounted ? t('landing.hero.tagline') : 'Automate Accounting. Run Smarter.'}
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          {...LANDING_ANIMATIONS.fadeInUp}
          className={LANDING_SECTION_STYLES.hero.title}
          suppressHydrationWarning
        >
          <span suppressHydrationWarning>
            {mounted ? t('landing.hero.title') : 'Let AI Handle the Books.'}
          </span>
          <br />
          <span className={LANDING_SECTION_STYLES.hero.titleGradient} suppressHydrationWarning>
            {mounted ? t('landing.hero.titleHighlight') : 'You Focus on Growth.'}
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: false }}
          className={LANDING_SECTION_STYLES.hero.subtitle}
          suppressHydrationWarning
        >
          {mounted ? t('landing.hero.subtitle') : 'The intelligent ERP for modern business. Automated bookkeeping, one-click tax filing, and real-time financial insights.'}
        </motion.p>

        {/* Hero Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: false }}
          className={LANDING_SECTION_STYLES.hero.buttonContainer}
        >
          <Link href='/sign-up' passHref>
            <motion.button
              {...LANDING_ANIMATIONS.buttonHover}
              className={LANDING_SECTION_STYLES.hero.primaryButton}
              suppressHydrationWarning
            >
              {mounted ? t('landing.hero.getStarted') : 'Start Free Trial'}
            </motion.button>
          </Link>
          <Link href='/#features' passHref>
            <motion.button
              {...LANDING_ANIMATIONS.buttonHover}
              className={LANDING_SECTION_STYLES.hero.secondaryButton}
              suppressHydrationWarning
            >
              <Play size={16} className="mr-2" />
              {mounted ? t('landing.hero.exploreFeatures') : 'Watch 1-Min Demo'}
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust Badge */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: false }}
          className="mt-8 text-sm text-muted-foreground"
          suppressHydrationWarning
        >
          {mounted ? t('landing.hero.trustedBy') : 'Trusted by accounting firms and SMEs'}
        </motion.p>
      </div>
    </section>
  );
};

export default LandingPageHeroSection;
