'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Thompson',
    role: 'School Administrator',
    quote:
      'BITMAP has completely transformed how we manage our educational ecosystem. The dashboard analytics provide insights we never had before!',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    rating: 5
  },
  {
    name: 'Michael Rodriguez',
    role: 'Tutor',
    quote:
      'Scheduling classes and tracking student progress has never been easier. BITMAP is a game-changer for educators.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4.5
  },
  {
    name: 'Elena Kovacs',
    role: 'Parent',
    quote:
      "I love how transparent and connected I can be with my child's education through BITMAP. Communication is seamless!",
    avatar: 'https://randomuser.me/api/portraits/women/75.jpg',
    rating: 5
  },
  {
    name: 'David Chen',
    role: 'Educational Technology Consultant',
    quote:
      'BITMAP represents the future of educational management - intuitive, comprehensive, and truly transformative.',
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
    rating: 4.8
  },
  {
    name: 'Olivia Martinez',
    role: 'High School Principal',
    quote:
      "The role-based access and analytics have revolutionized our school's administrative processes.",
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    rating: 4.7
  },
  {
    name: 'Alex Kim',
    role: 'Education Researcher',
    quote:
      'A comprehensive platform that truly understands the needs of modern educational institutions.',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    rating: 4.6
  }
];

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatar: string;
  rating: number;
};

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < Math.floor(rating)
            ? 'text-yellow-400'
            : index === Math.floor(rating) && rating % 1 >= 0.5
              ? 'text-yellow-300'
              : 'text-gray-300'
        }`}
        fill={
          index < Math.floor(rating)
            ? '#facc15'
            : index === Math.floor(rating) && rating % 1 >= 0.5
              ? '#fde047'
              : 'none'
        }
      />
    ));
  };

  return (
    <div className='bg-card relative flex h-full flex-col items-center space-y-4 rounded-lg p-6 text-center shadow-md'>
      <div className='absolute top-4 left-4'>
        <Quote className='text-primary/30 absolute -top-2 -left-2 h-10 w-10' />
      </div>

      <div className='border-primary h-24 w-24 overflow-hidden rounded-full border-4'>
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className='h-full w-full object-cover'
        />
      </div>

      <div className='mb-2 flex justify-center'>
        {renderStars(testimonial.rating)}
      </div>

      <p className='text-muted-foreground relative max-w-xs flex-grow pr-4 pl-4 text-base italic'>
        <span className='text-primary/30 absolute top-0 left-0 text-4xl'></span>
        {testimonial.quote}
        <span className='text-primary/30 absolute right-0 bottom-0 text-4xl'></span>
      </p>

      <div>
        <h3 className='text-foreground text-xl font-semibold'>
          {testimonial.name}
        </h3>
        <p className='text-muted-foreground text-sm'>{testimonial.role}</p>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [testimonialsPerPage, setTestimonialsPerPage] = useState(() => {
    // Dynamically set testimonials per page based on screen size
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3;
  });

  // Add event listener to update testimonials per page on resize
  React.useEffect(() => {
    const handleResize = () => {
      setTestimonialsPerPage(window.innerWidth < 768 ? 1 : 3);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const getCurrentTestimonials = () => {
    const start = currentPage * testimonialsPerPage;
    return testimonials.slice(start, start + testimonialsPerPage);
  };

  return (
    <section className='border-border bg-background relative min-h-[600px] overflow-hidden border-b py-16'>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: false }}
        className='text-center'
      >
        <h2 className='text-foreground mt-10 text-4xl font-bold sm:text-5xl lg:text-6xl'>
          What{' '}
          <span className='from-primary to-primary/80 bg-gradient-to-r bg-clip-text text-transparent'>
            Users Say
          </span>
        </h2>
        <p className='text-muted-foreground mx-auto mt-6 max-w-3xl text-lg'>
          Hear from educators, administrators, and parents who have transformed
          their educational experience with BITMAP.
        </p>
      </motion.div>

      <div className='relative mx-auto mt-16 max-w-5xl px-6'>
        <div className='absolute top-1/2 right-0 left-0 z-10 flex -translate-y-1/2 transform justify-between'>
          <button
            onClick={handlePrev}
            className='bg-primary/10 hover:bg-primary/20 rounded-full p-2 transition-all'
          >
            <ChevronLeft className='text-primary h-8 w-8' />
          </button>
          <button
            onClick={handleNext}
            className='bg-primary/10 hover:bg-primary/20 rounded-full p-2 transition-all'
          >
            <ChevronRight className='text-primary h-8 w-8' />
          </button>
        </div>

        <AnimatePresence mode='popLayout'>
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{
              type: 'tween',
              duration: 0.3
            }}
            className='grid grid-cols-1 gap-6 md:grid-cols-3'
          >
            {getCurrentTestimonials().map((testimonial) => (
              <TestimonialCard
                key={testimonial.name}
                testimonial={testimonial}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        <div className='mt-6 flex justify-center space-x-2'>
          {Array.from({ length: totalPages }, (_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentPage
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
