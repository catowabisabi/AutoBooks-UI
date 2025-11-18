'use client';

import React from 'react';
import { ArrowUp } from 'lucide-react';

const LandingPageScrollToTopButton = () => {
  // Scroll to the top of the page
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <button
      className='bg-primary text-primary-foreground hover:bg-primary/80 focus:ring-primary/50 fixed right-5 bottom-5 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition duration-300 focus:ring focus:outline-none'
      onClick={scrollToTop}
      aria-label='Scroll to top'
    >
      <ArrowUp size={20} />
    </button>
  );
};

export default LandingPageScrollToTopButton;
