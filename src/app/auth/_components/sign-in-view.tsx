'use client';

import Link from 'next/link';
import { UserAuthForm } from './user-auth-form';
import { FeatureCarousel } from './feature-carousel';
import { useTranslation } from '@/lib/i18n/provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function SignInView() {
  const { t } = useTranslation();
  
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      {/* Top right buttons - Language and Home */}
      <div className='absolute right-4 top-4 z-50 flex items-center gap-2'>
        <LanguageSwitcher variant='outline' size='icon' />
        <Button variant='outline' size='icon' asChild>
          <Link href='/'>
            <Home className='h-4 w-4' />
          </Link>
        </Button>
      </div>

      <div className='bg-muted relative flex h-full flex-col p-10 text-white lg:flex-none lg:justify-between dark:border-r'>
        <div className='absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-800' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-2 h-6 w-6'
          >
            <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
          </svg>
          AutoBooks ERP
        </div>

        {/* Feature Carousel */}
        <div className='relative z-20 my-8 flex flex-1 items-center justify-center'>
          <FeatureCarousel />
        </div>

        <div className='relative z-20'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;{t('auth.featureQuote')}&rdquo;
            </p>
            <footer className='text-sm'>{t('auth.erpTeam')}</footer>
          </blockquote>
        </div>
      </div>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] lg:w-[400px]'>
          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              {t('auth.welcomeBack')}
            </h1>
            <p className='text-muted-foreground text-sm'>
              {t('auth.enterCredentials')}
            </p>
          </div>
          <UserAuthForm />
        </div>
      </div>
    </div>
  );
}
