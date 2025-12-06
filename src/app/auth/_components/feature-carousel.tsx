'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/provider';
import { 
  BarChart3, 
  FileText, 
  Brain, 
  Calendar, 
  Users, 
  TrendingUp,
  Database,
  MessageSquare,
  PieChart,
  Lightbulb
} from 'lucide-react';

// ERP System Features for the carousel
const carouselItems = [
  {
    titleKey: 'auth.features.aiAnalytics.title',
    descriptionKey: 'auth.features.aiAnalytics.description',
    Icon: BarChart3,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    titleKey: 'auth.features.documentAssistant.title',
    descriptionKey: 'auth.features.documentAssistant.description',
    Icon: FileText,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    titleKey: 'auth.features.planningAssistant.title',
    descriptionKey: 'auth.features.planningAssistant.description',
    Icon: Calendar,
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    titleKey: 'auth.features.brainstorming.title',
    descriptionKey: 'auth.features.brainstorming.description',
    Icon: Lightbulb,
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    titleKey: 'auth.features.financialAnalytics.title',
    descriptionKey: 'auth.features.financialAnalytics.description',
    Icon: TrendingUp,
    gradient: 'from-red-500 to-rose-500'
  },
  {
    titleKey: 'auth.features.knowledgeBase.title',
    descriptionKey: 'auth.features.knowledgeBase.description',
    Icon: Database,
    gradient: 'from-indigo-500 to-violet-500'
  }
];

export function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Manual navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentItem = carouselItems[currentIndex];

  return (
    <div className='relative flex h-full w-full flex-col justify-center'>
      <div className='relative h-[380px] overflow-hidden'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className='absolute inset-0 flex flex-col items-center justify-center px-2'
          >
            {/* Feature Card */}
            <div className='flex min-h-[320px] w-full max-w-xl flex-col items-center justify-center rounded-3xl border border-white/20 bg-white/10 px-8 py-6 shadow-lg backdrop-blur-sm'>
              {/* Icon */}
              <div className={cn(
                'mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br',
                currentItem.gradient
              )}>
                {currentItem.Icon && <currentItem.Icon className='h-8 w-8 text-white' />}
              </div>
              
              {/* Title */}
              <h3 className='mb-4 text-center text-xl font-bold text-white' suppressHydrationWarning>
                {mounted ? t(currentItem.titleKey) : ''}
              </h3>
              
              {/* Description */}
              <p className='text-center text-sm text-white/80 leading-relaxed px-2' suppressHydrationWarning>
                {mounted ? t(currentItem.descriptionKey) : ''}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators */}
      <div className='mt-6 flex justify-center gap-2'>
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'h-2 w-2 rounded-full transition-all duration-300',
              currentIndex === index
                ? 'w-6 bg-white'
                : 'bg-white/50 hover:bg-white/70'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
