// lib/landing-page-styles.ts
export const LANDING_SECTION_STYLES = {
  // Base section wrapper
  section: 'bg-background relative min-h-[600px] overflow-hidden py-16',

  // Background decorative elements
  backgroundWrapper: 'pointer-events-none absolute top-0 left-0 h-full w-full',
  backgroundDecorations: {
    topRight:
      'bg-primary/10 absolute top-0 right-0 h-80 w-80 translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl',
    bottomLeft:
      'bg-primary/10 absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full blur-3xl'
  },

  // Section headers
  sectionHeader: {
    wrapper: 'relative z-10 px-4 text-center',
    title:
      'text-foreground mt-10 text-3xl font-bold tracking-wide sm:text-4xl lg:mt-16 lg:text-5xl',
    subtitle:
      'text-muted-foreground mx-auto mt-4 max-w-3xl text-sm sm:text-base'
  },

  // Content containers
  contentWrapper: 'relative z-10 mx-auto mt-12 max-w-6xl px-4',

  // Hero section styles
  hero: {
    section: 'bg-background relative min-h-[600px] overflow-hidden py-16',
    contentWrapper:
      'relative z-10 flex flex-col items-center justify-center px-4 text-center',
    icon: 'bg-primary/10 text-primary mb-6 flex items-center justify-center rounded-2xl p-8 transition duration-300 hover:bg-primary/20',
    title:
      'text-foreground mb-4 text-4xl font-bold tracking-wide sm:text-5xl lg:text-6xl',
    titleGradient:
      'from-primary to-primary/80 inline-block bg-gradient-to-r bg-clip-text text-transparent',
    subtitle:
      'text-muted-foreground mx-auto mb-8 max-w-3xl text-sm sm:text-base',
    buttonContainer:
      'flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4',
    primaryButton:
      'bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 py-3 text-lg font-medium transition duration-300 hover:shadow-lg',
    secondaryButton:
      'bg-card hover:border-primary/30 border-primary/20 text-foreground hover:bg-primary/5 rounded-xl border px-8 py-3 text-lg font-medium transition duration-300 hover:shadow-lg'
  },

  // FAQ section styles
  faq: {
    contentWrapper: 'relative z-10 mx-auto mt-12 max-w-4xl px-4',
    faqItem: 'group mb-4',
    faqButton:
      'bg-card hover:border-primary/30 flex cursor-pointer items-center justify-between rounded-2xl border border-transparent p-6 transition duration-300 hover:shadow-2xl w-full text-left',
    faqIcon: 'rounded-xl p-2 transition-colors duration-300',
    faqIconActive: 'bg-primary/20 text-primary',
    faqIconInactive: 'bg-primary/10 text-primary/70',
    faqQuestion: 'text-foreground text-lg font-semibold',
    faqAnswer:
      'bg-card/80 text-muted-foreground rounded-b-2xl border-x border-b border-primary/20 p-6 shadow-sm backdrop-blur-sm mt-2',
    chevron: 'text-muted-foreground h-6 w-6 transform transition-transform'
  },

  // Contact section styles
  contact: {
    formWrapper: 'relative z-10 mx-auto mt-12 max-w-3xl px-4',
    form: 'bg-card hover:border-primary/30 relative overflow-hidden rounded-2xl border border-transparent p-8 transition duration-300 hover:shadow-2xl',
    formGrid: '-mx-2 flex flex-wrap',
    inputGroup: 'w-full px-2 md:w-1/2 mb-6',
    inputGroupFull: 'w-full mb-6',
    label: 'text-foreground block text-sm font-medium mb-2',
    input:
      'border-border bg-background text-foreground focus:ring-primary focus:border-primary/50 w-full rounded-xl border px-4 py-3 transition-all focus:shadow-lg focus:ring-2 focus:outline-none',
    textarea:
      'border-border bg-background text-foreground focus:ring-primary focus:border-primary/50 w-full rounded-xl border px-4 py-3 transition-all focus:shadow-lg focus:ring-2 focus:outline-none resize-none',
    submitButton:
      'bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-xl py-3 text-lg font-medium transition duration-300 hover:shadow-lg',
    submitButtonDisabled: 'bg-primary/50 cursor-not-allowed'
  },

  // Grid layouts
  grid: {
    features: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
    testimonials: 'grid gap-8 sm:grid-cols-2 lg:grid-cols-3',
    pricing: 'grid gap-8 sm:grid-cols-2 lg:grid-cols-3'
  },

  // Cards
  card: {
    wrapper:
      'bg-card hover:border-primary/30 relative overflow-hidden rounded-2xl border border-transparent p-6 transition duration-300 hover:shadow-2xl group h-full',
    featureCard:
      'bg-card hover:border-primary/30 relative overflow-hidden rounded-2xl border border-transparent p-6 transition duration-300 hover:shadow-2xl group h-[280px]',
    content: 'relative z-10 flex flex-col',
    icon: 'bg-primary/10 text-primary group-hover:bg-primary/20 mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition duration-300',
    title:
      'text-foreground group-hover:text-primary mb-2 text-lg font-semibold transition',
    description: 'text-muted-foreground text-sm',
    // Animated background effect for cards
    hoverEffect:
      'via-primary/5 absolute -top-1/2 -left-1/2 h-full w-full rotate-45 bg-gradient-to-br from-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100'
  }
};

// Common animation variants
export const LANDING_ANIMATIONS = {
  fadeInUp: {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: false }
  },

  staggeredCards: (index: number) => ({
    initial: { opacity: 0, y: 30, scale: 0.95 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    transition: {
      duration: 0.5,
      delay: index * 0.1,
      type: 'spring' as const,
      stiffness: 100
    },
    viewport: { once: false }
  }),

  slideInLeft: {
    initial: { opacity: 0, x: -50 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.6 },
    viewport: { once: false }
  },

  slideInRight: {
    initial: { opacity: 0, x: 50 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.6 },
    viewport: { once: false }
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, type: 'spring' as const, stiffness: 100 },
    viewport: { once: false }
  },

  // Hero section specific animations
  heroIcon: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.8, ease: 'easeOut' }
  },

  heroTitle: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, ease: 'easeOut' }
  },

  heroSubtitle: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.2, ease: 'easeOut', delay: 0.3 }
  },

  heroButtons: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, ease: 'easeOut', delay: 0.6 }
  },

  buttonHover: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  }
};
