'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LANDING_SECTION_STYLES,
  LANDING_ANIMATIONS
} from '@/lib/landing-page-styles';

const LandingPageHeroSection = () => {
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
          The Smartest Way to Run Your Enterprise
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: false }}
          className={LANDING_SECTION_STYLES.hero.subtitle}
        >
          An AI-powered, all-in-one ERP platform designed to{' '}
          <span className='font-semibold'>streamline operations</span>,{' '}
          <span className='font-semibold'>automate workflows</span>, and{' '}
          <span className='font-semibold'>empower organizations</span> with{' '}
          <span className='text-primary font-semibold'>
            actionable insights
          </span>
          .
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
              Explore Features
            </motion.button>
          </Link>
          <Link href='/auth/signup' passHref>
            <motion.button
              {...LANDING_ANIMATIONS.buttonHover}
              className={LANDING_SECTION_STYLES.hero.secondaryButton}
            >
              Get Started
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingPageHeroSection;
