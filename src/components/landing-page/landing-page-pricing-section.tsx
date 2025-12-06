'use client';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { useTranslation } from '@/lib/i18n/provider';

type Category = 'organization' | 'instructor';

interface PricingToggleProps {
  onToggle: (category: Category) => void;
}

const PricingToggle = ({ onToggle }: PricingToggleProps) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Category>('organization');

  const toggleSwitch = () => {
    const newSelection =
      selected === 'organization' ? 'instructor' : 'organization';
    setSelected(newSelection);
    onToggle(newSelection);
  };

  return (
    <motion.div
      className='my-6 flex items-center justify-center gap-4'
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: false }}
    >
      <span className='text-base font-medium text-gray-700'>{t('landing.pricing.organization', 'Organization')}</span>
      <button
        onClick={toggleSwitch}
        className={`$ { selected === 'instructor' ? 'bg-blue-500' : 'bg-gray-400' } relative flex h-6 w-12 items-center rounded-full bg-gray-400 p-1 transition`}
      >
        <motion.div
          className='h-5 w-5 rounded-full bg-white shadow-md'
          animate={{ x: selected === 'instructor' ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        />
      </button>
      <span className='text-base font-medium text-gray-700'>{t('landing.pricing.instructor', 'Instructor')}</span>
    </motion.div>
  );
};

const Pricing = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<
    'organization' | 'instructor'
  >('organization');

  const pricingOptions = {
    organization: [
      {
        title: t('landing.pricing.freePlan', 'Free Plan'),
        price: '$0',
        duration: t('landing.pricing.30Days', '30 Days'),
        features: [
          t('landing.pricing.features.100Users', '100 Users'),
          t('landing.pricing.features.basicSupport', 'Basic Support'),
          t('landing.pricing.features.accessToDashboard', 'Access to Dashboard')
        ]
      },
      {
        title: t('landing.pricing.paidPlan', 'Paid Plan'),
        price: '$99.99',
        duration: t('landing.pricing.yearly', 'Yearly'),
        features: [
          t('landing.pricing.features.1000Users', '1000 Users'),
          t('landing.pricing.features.premiumSupport', 'Premium Support'),
          t('landing.pricing.features.advancedAnalytics', 'Advanced Analytics')
        ]
      }
    ],
    instructor: [
      {
        title: t('landing.pricing.freePlan', 'Free Plan'),
        price: '$0',
        duration: t('landing.pricing.30Days', '30 Days'),
        features: [
          t('landing.pricing.features.50Users', '50 Users'),
          t('landing.pricing.features.basicSupport', 'Basic Support'),
          t('landing.pricing.features.limitedAnalytics', 'Limited Analytics')
        ]
      },
      {
        title: t('landing.pricing.paidPlan', 'Paid Plan'),
        price: '$29.99',
        duration: t('landing.pricing.yearly', 'Yearly'),
        features: [
          t('landing.pricing.features.200Users', '200 Users'),
          t('landing.pricing.features.prioritySupport', 'Priority Support'),
          t('landing.pricing.features.fullAnalyticsAccess', 'Full Analytics Access')
        ]
      }
    ]
  };

  return (
    <motion.section
      className='mt-20 px-6'
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: false }}
    >
      <motion.h2
        className='text-foreground my-8 text-center text-3xl tracking-wide sm:text-5xl lg:text-5xl'
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: false }}
      >
        {t('landing.pricing.title', 'Pricing Plans')}
      </motion.h2>
      <p className='text-muted-foreground mx-auto max-w-3xl text-center text-lg'>
        {t('landing.pricing.subtitle', 'Choose a plan that fits your needs and scale your education services')}
        effortlessly.
      </p>

      <PricingToggle onToggle={setSelectedCategory} />

      <div className='mt-10 flex flex-wrap justify-center'>
        {pricingOptions[selectedCategory].map((option, index) => (
          <motion.div
            key={index}
            className='w-full p-4 sm:w-1/2 lg:w-1/3'
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: false }}
          >
            <div className='border-border bg-card rounded-xl border p-8 shadow-md transition hover:shadow-lg'>
              <p className='text-foreground mb-4 text-2xl font-bold'>
                {option.title}
              </p>

              <p className='mb-6'>
                <span className='text-primary text-4xl font-bold'>
                  {option.price}
                </span>
                <span className='text-muted-foreground ml-2 text-lg'>
                  /{option.duration}
                </span>
              </p>

              <ul className='space-y-4'>
                {option.features.map((feature, index) => (
                  <li
                    key={index}
                    className='text-muted-foreground flex items-center'
                  >
                    <CheckCircle2 className='text-black-500' size={20} />
                    <span className='ml-3'>{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                className='bg-primary text-primary-foreground hover:bg-primary/90 mt-8 w-full rounded-lg py-3 text-center font-medium transition'
                aria-label={`Subscribe to ${option.title}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default Pricing;
