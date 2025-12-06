'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  Layers,
  MessageCircleQuestion,
  DollarSign,
  Zap,
  Clock,
  Globe,
  Users,
  Headphones,
  Send,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/provider';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Contact form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contact-us-form`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || t('landing.contact.successMessage'));
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(t('landing.contact.errorMessage'));
      }
    } catch (error) {
      toast.error(t('landing.contact.networkError'));
      console.error('Error submitting contact form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Extended FAQ list with more compelling questions
  const faqs = [
    {
      questionKey: 'landing.faq.q1',
      answerKey: 'landing.faq.a1',
      defaultQuestion: 'What types of businesses is AutoBooks best suited for?',
      defaultAnswer: 'AutoBooks is designed for businesses of all sizes — from startups and SMEs to large enterprises and accounting firms. We\'ve specifically optimized for Hong Kong and Greater China businesses, supporting multi-currency, multi-company consolidation, and full compliance with local tax regulations.',
      icon: Layers
    },
    {
      questionKey: 'landing.faq.q2',
      answerKey: 'landing.faq.a2',
      defaultQuestion: 'How secure is my financial data with AutoBooks?',
      defaultAnswer: 'Absolutely secure. We use bank-grade 256-bit encryption, store data on ISO 27001 certified cloud servers, and support multi-factor authentication. Only authorized personnel can access sensitive data, and we conduct regular security audits.',
      icon: ShieldCheck
    },
    {
      questionKey: 'landing.faq.q3',
      answerKey: 'landing.faq.a3',
      defaultQuestion: 'How quickly can I get started with AutoBooks?',
      defaultAnswer: 'Most users complete basic setup and start using AutoBooks within 30 minutes. We offer free one-on-one onboarding support and seamless data migration from your existing systems. Our AI assistant guides you through every step.',
      icon: Clock
    },
    {
      questionKey: 'landing.faq.q4',
      answerKey: 'landing.faq.a4',
      defaultQuestion: 'Can AutoBooks integrate with my existing systems?',
      defaultAnswer: 'Yes! AutoBooks provides open APIs for seamless integration with banks, e-commerce platforms, POS systems, and popular business tools. Our technical team can also create custom integrations tailored to your specific needs.',
      icon: Zap
    },
    {
      questionKey: 'landing.faq.q5',
      answerKey: 'landing.faq.a5',
      defaultQuestion: 'What happens if I want to cancel my subscription?',
      defaultAnswer: 'No long-term contracts required. You can upgrade, downgrade, or cancel anytime. After cancellation, you can export all your data. We believe in earning your business every month, not locking you in.',
      icon: DollarSign
    },
    {
      questionKey: 'landing.faq.q6',
      answerKey: 'landing.faq.a6',
      defaultQuestion: 'How accurate is the AI-powered bookkeeping?',
      defaultAnswer: 'Our AI achieves 99% accuracy in invoice recognition and transaction categorization. It learns from your corrections and gets smarter over time. For complex cases, our human review team provides additional verification.',
      icon: HelpCircle
    },
    {
      questionKey: 'landing.faq.q7',
      answerKey: 'landing.faq.a7',
      defaultQuestion: 'Does AutoBooks support multiple currencies and languages?',
      defaultAnswer: 'Yes! We support 150+ currencies with real-time exchange rates, automatic currency conversion, and multi-currency financial reports. The platform is available in English, Traditional Chinese, and Simplified Chinese.',
      icon: Globe
    },
    {
      questionKey: 'landing.faq.q8',
      answerKey: 'landing.faq.a8',
      defaultQuestion: 'Can I manage multiple companies from one account?',
      defaultAnswer: 'Absolutely. Depending on your plan, you can manage multiple companies from a single dashboard. Each company has separate books, but you can generate consolidated reports and easily switch between entities.',
      icon: Users
    }
  ];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden" id="faqs">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      {/* Decorative elements */}
      {mounted && (
        <>
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          />
        </>
      )}

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" suppressHydrationWarning>
            {mounted ? t('landing.faq.title') : 'Frequently Asked'}{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent" suppressHydrationWarning>
              {mounted ? t('landing.faq.titleHighlight') : 'Questions'}
            </span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto" suppressHydrationWarning>
            {mounted ? t('landing.faq.subtitle') : "Got questions? We've got answers. Explore our most common inquiries about AutoBooks ERP."}
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - FAQ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-6">
              <MessageCircleQuestion className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold" suppressHydrationWarning>
                {mounted ? t('landing.faq.faqTitle') : 'Common Questions'}
              </h3>
            </div>
            
            {faqs.map((faq, index) => {
              const IconComponent = faq.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${
                        openIndex === index 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-sm md:text-base" suppressHydrationWarning>
                        {mounted ? t(faq.questionKey) : faq.defaultQuestion}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`} />
                  </button>

                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0">
                          <div className="pl-11 text-sm text-muted-foreground leading-relaxed" suppressHydrationWarning>
                            {mounted ? t(faq.answerKey) : faq.defaultAnswer}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Headphones className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold" suppressHydrationWarning>
                {mounted ? t('landing.contact.title') : 'Get in'}{' '}
                <span className="text-primary" suppressHydrationWarning>
                  {mounted ? t('landing.contact.titleHighlight') : 'Touch'}
                </span>
              </h3>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6"
            >
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pb-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                      {mounted ? t('landing.contact.emailLabel') : 'Email'}
                    </p>
                    <p className="text-sm font-medium">hi@autobooks.ai</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                      {mounted ? t('landing.contact.phoneLabel') : 'Phone'}
                    </p>
                    <p className="text-sm font-medium">+852 1234 5678</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                      {mounted ? t('landing.contact.locationLabel') : 'Location'}
                    </p>
                    <p className="text-sm font-medium">Hong Kong</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block" suppressHydrationWarning>
                      {mounted ? t('landing.contact.name') : 'Name'}
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="bg-background/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block" suppressHydrationWarning>
                      {mounted ? t('landing.contact.email') : 'Email'}
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="bg-background/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" suppressHydrationWarning>
                    {mounted ? t('landing.contact.subject') : 'Subject'}
                  </label>
                  <Input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" suppressHydrationWarning>
                    {mounted ? t('landing.contact.message') : 'Message'}
                  </label>
                  <Textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="bg-background/50 resize-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span suppressHydrationWarning>
                      {mounted ? t('landing.contact.submitting') : 'Sending...'}
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      <span suppressHydrationWarning>
                        {mounted ? t('landing.contact.send') : 'Send Message'}
                      </span>
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
