'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Play, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LANDING_SECTION_STYLES,
  LANDING_ANIMATIONS
} from '@/lib/landing-page-styles';
import { useTranslation } from '@/lib/i18n/provider';
import AnimatedBackground from './animated-background';
import AnimatedDashboardPreview from './animated-dashboard-preview';

const LandingPageHeroSection = () => {
  const { t } = useTranslation();

  const trustPoints = [
    { key: 'landing.hero.trustPoints.freeTrial', default: '14-day free trial' },
    { key: 'landing.hero.trustPoints.noCard', default: 'No credit card required' },
    { key: 'landing.hero.trustPoints.cancelAnytime', default: 'Cancel anytime' }
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-background pt-20 pb-10">
      {/* Animated Background */}
      <AnimatedBackground variant="hero" />

      <div className="relative z-10 container mx-auto px-4">
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            {/* Hero Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20"
            >
              <Sparkles size={16} className="animate-pulse" />
              <span>
                {t('landing.hero.tagline', 'Automate Accounting. Run Smarter.')}
              </span>
            </motion.div>

            {/* Hero Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 break-words"
            >
              <span>
                {t('landing.hero.title', 'Let AI Handle the Books.')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-purple-600 bg-clip-text text-transparent">
                {t('landing.hero.titleHighlight', 'You Focus on Growth.')}
              </span>
            </motion.h1>

            {/* Hero Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              {t('landing.hero.subtitle', 'The intelligent ERP for modern business. Automated bookkeeping, one-click tax filing, and real-time financial insights.')}
            </motion.p>

            {/* Hero Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <Link href='/sign-up'>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 w-full sm:w-auto"
                >
                  {t('landing.hero.getStarted', 'Start Free Trial')}
                </motion.button>
              </Link>
              <Link href='/#features'>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-card border border-border px-8 py-4 rounded-xl text-lg font-semibold hover:bg-muted transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Play size={18} className="text-primary" />
                  {t('landing.hero.exploreFeatures', 'Watch 1-Min Demo')}
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust Points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              {trustPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>
                    {t(point.key, point.default)}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <AnimatedDashboardPreview />
          </motion.div>
        </div>

        {/* Mobile Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="lg:hidden mt-12"
        >
          <AnimatedDashboardPreview />
        </motion.div>
      </div>
    </section>
  );
};

export default LandingPageHeroSection;
