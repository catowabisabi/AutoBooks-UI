'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Floating shape component
function FloatingShape({ 
  className, 
  delay = 0,
  duration = 20,
  size = 'md'
}: { 
  className?: string; 
  delay?: number;
  duration?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizes = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40',
    lg: 'w-64 h-64',
    xl: 'w-96 h-96'
  };

  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${sizes[size]} ${className}`}
      animate={{
        y: [0, -30, 0],
        x: [0, 20, 0],
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.5, 0.3]
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  );
}

// Animated grid pattern
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      <svg className="absolute h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/20" />
          </pattern>
          <linearGradient id="grid-fade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="30%" stopColor="white" stopOpacity="1" />
            <stop offset="70%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="grid-mask">
            <rect width="100%" height="100%" fill="url(#grid-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#grid-mask)" />
      </svg>
    </div>
  );
}

// Pre-defined particle positions to avoid hydration mismatch
const PARTICLE_CONFIGS = [
  { id: 0, size: 4, x: 5, y: 10, duration: 18, delay: 0 },
  { id: 1, size: 3, x: 15, y: 25, duration: 22, delay: 1 },
  { id: 2, size: 5, x: 25, y: 15, duration: 16, delay: 2 },
  { id: 3, size: 2, x: 35, y: 45, duration: 20, delay: 0.5 },
  { id: 4, size: 4, x: 45, y: 5, duration: 24, delay: 1.5 },
  { id: 5, size: 3, x: 55, y: 60, duration: 19, delay: 2.5 },
  { id: 6, size: 5, x: 65, y: 30, duration: 17, delay: 3 },
  { id: 7, size: 2, x: 75, y: 70, duration: 21, delay: 0 },
  { id: 8, size: 4, x: 85, y: 20, duration: 23, delay: 1 },
  { id: 9, size: 3, x: 95, y: 50, duration: 18, delay: 2 },
  { id: 10, size: 5, x: 10, y: 80, duration: 20, delay: 3.5 },
  { id: 11, size: 2, x: 20, y: 90, duration: 15, delay: 4 },
  { id: 12, size: 4, x: 30, y: 55, duration: 22, delay: 0 },
  { id: 13, size: 3, x: 40, y: 75, duration: 19, delay: 1 },
  { id: 14, size: 5, x: 50, y: 85, duration: 16, delay: 2 },
  { id: 15, size: 2, x: 60, y: 40, duration: 24, delay: 3 },
  { id: 16, size: 4, x: 70, y: 95, duration: 17, delay: 4 },
  { id: 17, size: 3, x: 80, y: 35, duration: 21, delay: 0.5 },
  { id: 18, size: 5, x: 90, y: 65, duration: 18, delay: 1.5 },
  { id: 19, size: 2, x: 98, y: 8, duration: 20, delay: 2.5 }
];

// Floating particles - only render on client to avoid hydration issues
function Particles() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLE_CONFIGS.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/30"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

// Main animated background component
export default function AnimatedBackground({ variant = 'hero' }: { variant?: 'hero' | 'section' | 'pricing' }) {
  if (variant === 'hero') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <FloatingShape 
          className="bg-primary/40 -top-20 -left-20" 
          size="xl" 
          duration={25} 
        />
        <FloatingShape 
          className="bg-blue-500/30 top-1/4 right-0 translate-x-1/2" 
          size="lg" 
          delay={2}
          duration={20} 
        />
        <FloatingShape 
          className="bg-purple-500/30 bottom-0 left-1/4" 
          size="lg" 
          delay={4}
          duration={22} 
        />
        <FloatingShape 
          className="bg-cyan-500/20 bottom-1/4 right-1/4" 
          size="md" 
          delay={6}
          duration={18} 
        />
        
        {/* Grid pattern */}
        <AnimatedGrid />
        
        {/* Particles */}
        <Particles />
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>
    );
  }

  if (variant === 'pricing') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <FloatingShape 
          className="bg-primary/30 top-0 left-1/4" 
          size="xl" 
          duration={30} 
        />
        <FloatingShape 
          className="bg-amber-500/20 bottom-0 right-0 translate-x-1/3 translate-y-1/3" 
          size="xl" 
          delay={3}
          duration={25} 
        />
        <FloatingShape 
          className="bg-green-500/20 top-1/2 -left-20" 
          size="lg" 
          delay={5}
          duration={20} 
        />
        
        {/* Grid pattern */}
        <AnimatedGrid />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/50 to-background/80" />
      </div>
    );
  }

  // Default section variant
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <FloatingShape 
        className="bg-primary/20 -top-10 right-0 translate-x-1/2" 
        size="lg" 
        duration={20} 
      />
      <FloatingShape 
        className="bg-primary/20 bottom-0 -left-10" 
        size="md" 
        delay={3}
        duration={18} 
      />
    </div>
  );
}

// Export individual components for flexibility
export { FloatingShape, AnimatedGrid, Particles };
