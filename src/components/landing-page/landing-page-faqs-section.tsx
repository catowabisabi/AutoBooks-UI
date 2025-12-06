'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  Layers,
  MessageCircleQuestion,
  DollarSign
} from 'lucide-react';
import {
  LANDING_SECTION_STYLES,
  LANDING_ANIMATIONS
} from '@/lib/landing-page-styles';
import { useTranslation } from '@/lib/i18n/provider';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useTranslation();

  const faqs = [
    {
      questionKey: 'landing.faq.q1',
      answerKey: 'landing.faq.a1',
      defaultQuestion: 'What is WiseMatic ERP and who can use it?',
      defaultAnswer:
        'WiseMatic ERP is a comprehensive enterprise management platform designed for businesses, educational institutions, and organizations of all sizes. It streamlines operations, facilitates communication, and provides insightful analytics for all stakeholders.',
      icon: Layers
    },
    {
      questionKey: 'landing.faq.q2',
      answerKey: 'landing.faq.a2',
      defaultQuestion: 'How secure is the WiseMatic platform?',
      defaultAnswer:
        'We prioritize data security with end-to-end encryption, multi-factor authentication, and compliance with industry data protection regulations. Your information is always safe and protected with enterprise-grade security.',
      icon: ShieldCheck
    },
    {
      questionKey: 'landing.faq.q3',
      answerKey: 'landing.faq.a3',
      defaultQuestion: 'Can I customize WiseMatic for my specific organization?',
      defaultAnswer:
        "Absolutely! WiseMatic offers flexible configuration options to adapt to different organizational environments, whether you're a small business or a large enterprise with complex workflows.",
      icon: HelpCircle
    },
    {
      questionKey: 'landing.faq.q4',
      answerKey: 'landing.faq.a4',
      defaultQuestion: 'What kind of support do you offer?',
      defaultAnswer:
        'We provide 24/7 customer support through multiple channels including live chat, email, and phone. Our dedicated support team is always ready to help you maximize your WiseMatic experience.',
      icon: MessageCircleQuestion
    },
    {
      questionKey: 'landing.faq.q5',
      answerKey: 'landing.faq.a5',
      defaultQuestion: 'How does pricing work?',
      defaultAnswer:
        'WiseMatic offers scalable pricing models based on the size of your organization and required features. We provide transparent, competitive pricing with no hidden costs and flexible payment options.',
      icon: DollarSign
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
          {t('landing.faq.title', 'Frequently Asked')}{' '}
          <span className='from-primary to-primary/80 bg-gradient-to-r bg-clip-text text-transparent'>
            {t('landing.faq.titleHighlight', 'Questions')}
          </span>
        </h2>
        <p className={LANDING_SECTION_STYLES.sectionHeader.subtitle}>
          {t('landing.faq.subtitle', "Got questions? We've got answers. Explore our most common inquiries about WiseMatic ERP.")}
        </p>
      </motion.div>

      {/* FAQ Items */}
      <div className={LANDING_SECTION_STYLES.faq.contentWrapper}>
        {faqs.map((faq, index) => {
          const IconComponent = faq.icon;

          return (
            <motion.div
              key={index}
              {...LANDING_ANIMATIONS.staggeredCards(index)}
              className={LANDING_SECTION_STYLES.faq.faqItem}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={LANDING_SECTION_STYLES.faq.faqButton}
              >
                <div className='flex items-center space-x-4'>
                  <div
                    className={`${LANDING_SECTION_STYLES.faq.faqIcon} ${
                      openIndex === index
                        ? LANDING_SECTION_STYLES.faq.faqIconActive
                        : LANDING_SECTION_STYLES.faq.faqIconInactive
                    }`}
                  >
                    <IconComponent className='h-6 w-6' />
                  </div>
                  <h3 className={LANDING_SECTION_STYLES.faq.faqQuestion}>
                    {t(faq.questionKey, faq.defaultQuestion)}
                  </h3>
                </div>
                <ChevronDown
                  className={`${LANDING_SECTION_STYLES.faq.chevron} ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: 1,
                      height: 'auto',
                      transition: {
                        height: { duration: 0.3, ease: 'easeInOut' },
                        opacity: { duration: 0.3, delay: 0.1 }
                      }
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      transition: {
                        height: { duration: 0.3, ease: 'easeInOut' },
                        opacity: { duration: 0.2 }
                      }
                    }}
                    className='overflow-hidden'
                  >
                    <div className={LANDING_SECTION_STYLES.faq.faqAnswer}>
                      {t(faq.answerKey, faq.defaultAnswer)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQSection;
