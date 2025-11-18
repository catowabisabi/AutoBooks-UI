'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { features, products } from '@/constants/landing-page';
import { cn } from '@/lib/utils';

// Combine features and products for the carousel
const carouselItems = [
  ...features.map((feature) => ({
    title: feature.text,
    description: feature.description,
    Icon: feature.icon
  })),
  ...products.map((product) => ({
    title: product.title,
    description: product.description,
    Icon: null
  }))
];

export function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

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
  return (
    <div className='relative flex h-full flex-col justify-center'>
      {/*
        CARD DIMENSION CONTROLS:
        - Container height: Change 'h-[350px]' to adjust overall container height
        - Card width: Change 'max-w-4xl' to control card width (max-w-sm, max-w-md, max-w-lg, max-w-xl, max-w-2xl, max-w-3xl, max-w-4xl, max-w-5xl, etc.)
        - Card height: Change 'min-h-[280px]' to set minimum card height
        - Card padding: Change 'p-10' to adjust internal spacing (p-4, p-6, p-8, p-10, p-12, p-16, etc.)
      */}
      <div className='relative h-[350px] overflow-hidden'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className='absolute inset-0 flex flex-col items-center justify-center px-4'
          >
            {/* Empty card container - wider and shorter dimensions for all cards */}
            <div className='flex min-h-[280px] w-full max-w-4xl flex-col justify-center rounded-3xl border border-white/20 bg-white/15 p-10 shadow-lg backdrop-blur-sm'>
              {/* Empty card content - all cards will have identical dimensions */}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators */}
      <div className='mt-8 flex justify-center gap-2'>
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
