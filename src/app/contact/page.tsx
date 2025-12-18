'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Send, 
  ArrowLeft, 
  Building2, 
  Users, 
  Sparkles,
  CheckCircle2,
  Clock,
  Shield,
  Headphones
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function ContactPage() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    companySize: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (value: string) => {
    setForm(prev => ({ ...prev, companySize: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      setForm({
        name: '',
        email: '',
        company: '',
        companySize: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: Clock,
      title: t('contact.features.response.title', '24-Hour Response'),
      description: t('contact.features.response.description', 'Our team responds to all inquiries within 24 hours'),
    },
    {
      icon: Headphones,
      title: t('contact.features.support.title', 'Dedicated Support'),
      description: t('contact.features.support.description', 'Get personalized assistance from our expert team'),
    },
    {
      icon: Shield,
      title: t('contact.features.security.title', 'Enterprise Security'),
      description: t('contact.features.security.description', 'Bank-grade security for your financial data'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">A</span>
            </div>
            <span className="text-xl font-bold">AutoBooks</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="outline" size="icon" />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back', 'Back')}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('contact.hero.title', "Let's Talk About Your")} {' '}
            <span className="text-primary">{t('contact.hero.titleHighlight', 'Business')}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('contact.hero.subtitle', 'Whether you have questions about our platform, pricing, or want to schedule a demo, we\'re here to help you transform your financial operations.')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Left Side - Features & Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact Info Card */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-5 h-5" />
                  <div>
                    <p className="text-sm opacity-80">{t('contact.directEmail', 'Email us directly')}</p>
                    <p className="font-semibold">hi@autobooks.ai</p>
                  </div>
                </div>
                <p className="text-sm opacity-80">
                  {t('contact.officeHours', 'Our team is available Monday to Friday, 9am - 6pm HKT')}
                </p>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-card/50 border border-border/50 text-center">
                <div className="text-2xl font-bold text-primary">1,000+</div>
                <div className="text-sm text-muted-foreground">{t('contact.stats.businesses', 'Businesses')}</div>
              </div>
              <div className="p-4 rounded-xl bg-card/50 border border-border/50 text-center">
                <div className="text-2xl font-bold text-primary">99%</div>
                <div className="text-sm text-muted-foreground">{t('contact.stats.satisfaction', 'Satisfaction')}</div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {t('contact.form.title', 'Get in Touch')}
                </CardTitle>
                <CardDescription>
                  {t('contact.form.description', 'Fill out the form below and we\'ll get back to you within 24 hours.')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitStatus === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {t('contact.success.title', 'Message Sent!')}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {t('contact.success.message', 'Thank you for reaching out. We\'ll get back to you within 24 hours.')}
                    </p>
                    <Button onClick={() => setSubmitStatus('idle')}>
                      {t('contact.success.sendAnother', 'Send Another Message')}
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {submitStatus === 'error' && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {t('contact.error', 'Something went wrong. Please try again.')}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('contact.form.name', 'Your Name')} *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder={t('contact.form.namePlaceholder', 'John Doe')}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('contact.form.email', 'Work Email')} *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder={t('contact.form.emailPlaceholder', 'john@company.com')}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">
                          <Building2 className="w-4 h-4 inline mr-1" />
                          {t('contact.form.company', 'Company Name')}
                        </Label>
                        <Input
                          id="company"
                          name="company"
                          value={form.company}
                          onChange={handleChange}
                          placeholder={t('contact.form.companyPlaceholder', 'Your Company Ltd.')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companySize">
                          <Users className="w-4 h-4 inline mr-1" />
                          {t('contact.form.companySize', 'Company Size')}
                        </Label>
                        <Select value={form.companySize} onValueChange={handleSelectChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('contact.form.selectSize', 'Select size')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">{t('contact.form.size.startup', '1-10 employees')}</SelectItem>
                            <SelectItem value="11-50">{t('contact.form.size.small', '11-50 employees')}</SelectItem>
                            <SelectItem value="51-200">{t('contact.form.size.medium', '51-200 employees')}</SelectItem>
                            <SelectItem value="201-500">{t('contact.form.size.large', '201-500 employees')}</SelectItem>
                            <SelectItem value="500+">{t('contact.form.size.enterprise', '500+ employees')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">{t('contact.form.subject', 'Subject')} *</Label>
                      <Select 
                        value={form.subject} 
                        onValueChange={(value) => setForm(prev => ({ ...prev, subject: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('contact.form.selectSubject', 'What can we help you with?')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="demo">{t('contact.form.subjects.demo', 'Request a Demo')}</SelectItem>
                          <SelectItem value="pricing">{t('contact.form.subjects.pricing', 'Pricing Information')}</SelectItem>
                          <SelectItem value="features">{t('contact.form.subjects.features', 'Product Features')}</SelectItem>
                          <SelectItem value="support">{t('contact.form.subjects.support', 'Technical Support')}</SelectItem>
                          <SelectItem value="partnership">{t('contact.form.subjects.partnership', 'Partnership Inquiry')}</SelectItem>
                          <SelectItem value="other">{t('contact.form.subjects.other', 'Other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t('contact.form.message', 'Message')} *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder={t('contact.form.messagePlaceholder', 'Tell us more about your business needs and how we can help...')}
                        rows={5}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          {t('contact.form.sending', 'Sending...')}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {t('contact.form.send', 'Send Message')}
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      {t('contact.form.privacy', 'By submitting this form, you agree to our Privacy Policy and Terms of Service.')}
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 AutoBooks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
