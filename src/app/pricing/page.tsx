'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Sparkles, Building2, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function PricingPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const plans = [
    {
      id: 'free',
      nameKey: 'landing.pricing.free.name',
      priceKey: 'landing.pricing.free.price',
      descKey: 'landing.pricing.free.description',
      featuresKey: 'landing.pricing.free.features',
      defaultName: 'AutoBooks Free',
      defaultPrice: '0',
      defaultDesc: 'Perfect for individuals or small startups',
      defaultFeatures: [
        '10 AI features per day',
        'Basic bookkeeping',
        'Single company account',
        'Standard report exports',
        'Community support'
      ],
      popular: false,
      enterprise: false
    },
    {
      id: 'plus',
      nameKey: 'landing.pricing.plus.name',
      priceKey: 'landing.pricing.plus.price',
      descKey: 'landing.pricing.plus.description',
      featuresKey: 'landing.pricing.plus.features',
      defaultName: 'AutoBooks+',
      defaultPrice: '38.88',
      defaultDesc: 'For growing small businesses',
      defaultFeatures: [
        '50 AI features per day',
        'Advanced bookkeeping & reconciliation',
        'Up to 2 companies',
        'Invoice automation',
        'Bank account linking',
        'Email support'
      ],
      popular: false,
      enterprise: false
    },
    {
      id: 'pro',
      nameKey: 'landing.pricing.pro.name',
      priceKey: 'landing.pricing.pro.price',
      descKey: 'landing.pricing.pro.description',
      featuresKey: 'landing.pricing.pro.features',
      defaultName: 'AutoBooks Pro',
      defaultPrice: '58.88',
      defaultDesc: 'For mid-sized businesses needing full features',
      defaultFeatures: [
        '200 AI features per day',
        'Complete accounting suite',
        'Up to 5 companies',
        'Multi-currency support',
        'Automated tax calculations',
        'Advanced analytics dashboard',
        'Priority email support'
      ],
      popular: true,
      enterprise: false
    },
    {
      id: 'proPlus',
      nameKey: 'landing.pricing.proPlus.name',
      priceKey: 'landing.pricing.proPlus.price',
      descKey: 'landing.pricing.proPlus.description',
      featuresKey: 'landing.pricing.proPlus.features',
      defaultName: 'AutoBooks Pro+',
      defaultPrice: '178.88',
      defaultDesc: 'For large businesses or accounting firms',
      defaultFeatures: [
        'Unlimited AI features',
        'All Pro features',
        'Unlimited companies',
        'API access',
        'Custom report builder',
        'Multi-user permissions',
        'Dedicated account manager',
        'Phone support'
      ],
      popular: false,
      enterprise: false
    },
    {
      id: 'enterprise',
      nameKey: 'landing.pricing.enterpriseInfo.name',
      priceKey: 'landing.pricing.enterpriseInfo.price',
      descKey: 'landing.pricing.enterpriseInfo.description',
      featuresKey: 'landing.pricing.enterpriseInfo.features',
      defaultName: 'AutoBooks Enterprise',
      defaultPrice: 'Contact Us',
      defaultDesc: 'Tailored solutions for large enterprises',
      defaultFeatures: [
        'All Pro+ features',
        'Private cloud deployment',
        'Custom feature development',
        'Dedicated technical team',
        'SLA guarantee',
        'On-site training',
        'Enterprise security audit'
      ],
      popular: false,
      enterprise: true
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.enterprise) {
      return mounted ? t(plan.priceKey) : plan.defaultPrice;
    }
    const basePrice = parseFloat(mounted ? t(plan.priceKey) : plan.defaultPrice);
    if (isNaN(basePrice) || basePrice === 0) return '0';
    const price = isYearly ? (basePrice * 0.8).toFixed(2) : basePrice.toFixed(2);
    return price;
  };

  const getFeatures = (plan: typeof plans[0]): string[] => {
    if (!mounted) return plan.defaultFeatures;
    const features = t(plan.featuresKey);
    if (Array.isArray(features)) return features;
    return plan.defaultFeatures;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="h-6 w-6 text-primary" />
            AutoBooks ERP
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="outline" size="icon" />
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {mounted ? t('common.back') : 'Back'}
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl" suppressHydrationWarning>
            {mounted ? t('landing.pricing.title') : 'Simple, Transparent'}{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent" suppressHydrationWarning>
              {mounted ? t('landing.pricing.titleHighlight') : 'Pricing'}
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground" suppressHydrationWarning>
            {mounted ? t('landing.pricing.subtitle') : 'Choose the plan that fits your business. Upgrade anytime, no hidden fees.'}
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <Label htmlFor="billing-toggle" className={cn(!isYearly && 'text-foreground font-medium', isYearly && 'text-muted-foreground')} suppressHydrationWarning>
            {mounted ? t('landing.pricing.monthly') : 'Monthly'}
          </Label>
          <Switch
            id="billing-toggle"
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <Label htmlFor="billing-toggle" className={cn(isYearly && 'text-foreground font-medium', !isYearly && 'text-muted-foreground')} suppressHydrationWarning>
            {mounted ? t('landing.pricing.yearly') : 'Yearly'}
          </Label>
          {isYearly && (
            <Badge variant="secondary" className="ml-2" suppressHydrationWarning>
              {mounted ? t('landing.pricing.yearlyDiscount') : 'Save 20% with yearly'}
            </Badge>
          )}
        </motion.div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className={cn(
                'relative flex h-full flex-col',
                plan.popular && 'border-primary shadow-lg shadow-primary/20',
                plan.enterprise && 'border-amber-500/50 bg-gradient-to-b from-amber-500/5 to-transparent'
              )}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" suppressHydrationWarning>
                    {mounted ? t('landing.pricing.mostPopular') : 'Most Popular'}
                  </Badge>
                )}
                {plan.enterprise && (
                  <Badge variant="outline" className="absolute -top-3 left-1/2 -translate-x-1/2 border-amber-500 text-amber-600" suppressHydrationWarning>
                    <Building2 className="mr-1 h-3 w-3" />
                    {mounted ? t('landing.pricing.enterprise') : 'Enterprise'}
                  </Badge>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl" suppressHydrationWarning>
                    {mounted ? t(plan.nameKey) : plan.defaultName}
                  </CardTitle>
                  <CardDescription suppressHydrationWarning>
                    {mounted ? t(plan.descKey) : plan.defaultDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    {plan.enterprise ? (
                      <span className="text-2xl font-bold" suppressHydrationWarning>
                        {mounted ? t(plan.priceKey) : plan.defaultPrice}
                      </span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">${getPrice(plan)}</span>
                        <span className="text-muted-foreground" suppressHydrationWarning>
                          {mounted ? t('landing.pricing.perMonth') : '/mo'}
                        </span>
                      </>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {getFeatures(plan).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span suppressHydrationWarning>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : plan.enterprise ? 'outline' : 'secondary'}
                    asChild
                  >
                    <Link href={plan.enterprise ? '/contact' : '/sign-up'} suppressHydrationWarning>
                      {plan.enterprise
                        ? (mounted ? t('landing.pricing.contactSales') : 'Contact Sales')
                        : (mounted ? t('landing.pricing.getStarted') : 'Get Started')
                      }
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Link */}
      <div className="container mx-auto px-4 pb-20 text-center">
        <p className="text-muted-foreground">
          {mounted ? '還有疑問？' : 'Have questions?'}{' '}
          <Link href="/#faqs" className="text-primary hover:underline">
            {mounted ? '查看常見問題' : 'Check our FAQs'}
          </Link>
        </p>
      </div>
    </div>
  );
}
