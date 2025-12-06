'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Logo from '@/components/logo';
import { useAuth } from '@/contexts/auth-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslation } from '@/lib/i18n/provider';

export default function LandingPageNavbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  // Fix hydration mismatch by only rendering translated content after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navMenuItems = [
    { title: mounted ? t('landing.nav.home') : 'Home', href: '/' },
    { title: mounted ? t('landing.nav.features') : 'Features', href: '#features' },
    { title: mounted ? t('landing.nav.pricing') : 'Pricing', href: '/pricing' },
    { title: mounted ? t('landing.nav.faqs') : 'FAQs', href: '#faqs' },
    { title: mounted ? t('landing.nav.contactUs') : 'Contact', href: '#contact' }
  ];

  const handleDashboardRedirect = () => {
    if (user?.role) {
      router.push(`/dashboard/overview`);
    }
  };

  return (
    <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur'>
      <div className='flex h-14 items-center'>
        {/* Logo */}
        <Link href='/' className='mx-4 flex items-center space-x-1'>
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className='hidden flex-1 justify-center md:flex'>
          <ul className='flex space-x-14'>
            {navMenuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className='hover:text-primary text-lg font-medium transition-colors'
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Auth Buttons for Desktop */}
        <div className='mx-4 hidden items-center space-x-2 md:flex'>
          <LanguageSwitcher />
          {user ? (
            <>
              <Button
                variant='ghost'
                onClick={logout}
                className='transform transition-transform hover:scale-105 hover:shadow-lg'
              >
                {t('landing.nav.logout')}
              </Button>
              <Button
                onClick={handleDashboardRedirect}
                className='transform transition-transform hover:scale-105 hover:shadow-lg'
              >
                {t('landing.nav.dashboard')}
              </Button>
            </>
          ) : (
            <>
              <Link
                href='/book-demo'
              >
                <Button className='border-black-600 bg-primary text-primary-foreground transform rounded-full border px-6 py-2 transition-transform hover:scale-105 hover:shadow-lg'>
                  {t('landing.nav.bookDemo')}
                </Button>
              </Link>
              <Link href='/auth/sign-in'>
                <Button
                  variant='outline'
                  className='transform transition-transform hover:scale-105 hover:shadow-lg'
                >
                  {t('landing.nav.login')}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className='md:hidden'>
            <Button variant='ghost' size='icon'>
              <Menu className='h-5 w-5' />
              <span className='sr-only'>Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side='right' className='w-[300px] sm:w-[400px]'>
            <SheetTitle className='sr-only'>{t('landing.nav.mobileNav')}</SheetTitle>
            <nav className='flex h-full flex-col'>
              <ul className='flex flex-col space-y-4 px-4 py-6'>
                {navMenuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className='hover:text-primary text-lg font-medium transition-colors'
                      onClick={() => setOpen(false)}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className='flex flex-col space-y-4 border-t p-4'>
                <div className='flex justify-center'>
                  <LanguageSwitcher showLabel />
                </div>
                {user ? (
                  <>
                    <Button
                      variant='ghost'
                      className='w-full transform transition-transform hover:scale-105 hover:shadow-lg'
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                    >
                      {t('landing.nav.logout')}
                    </Button>
                    <Button
                      className='w-full transform transition-transform hover:scale-105 hover:shadow-lg'
                      onClick={() => {
                        handleDashboardRedirect();
                        setOpen(false);
                      }}
                    >
                      {t('landing.nav.dashboard')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href='/book-demo'
                      onClick={() => setOpen(false)}
                    >
                      <Button className='border-black-600 bg-primary text-primary-foreground w-full transform rounded-full border px-6 py-2 transition-transform hover:scale-105 hover:shadow-lg'>
                        {t('landing.nav.bookDemo')}
                      </Button>
                    </Link>
                    <Link href='/auth/sign-in'>
                      <Button
                        variant='outline'
                        className='w-full transform transition-transform hover:scale-105 hover:shadow-lg'
                        onClick={() => setOpen(false)}
                      >
                        {t('landing.nav.login')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
