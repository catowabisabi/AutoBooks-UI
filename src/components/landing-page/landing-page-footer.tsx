'use client';

import { Github, Twitter, Linkedin, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/provider';

const Footer = () => {
  const { t } = useTranslation();

  const companyLinks = [
    { textKey: 'landing.footer.about', defaultText: 'About', href: '#' },
    { textKey: 'landing.footer.team', defaultText: 'Team', href: '#' },
    { textKey: 'landing.footer.careers', defaultText: 'Careers', href: '#' }
  ];

  const resourcesLinks = [
    { textKey: 'landing.footer.docs', defaultText: 'Docs', href: '#' },
    { textKey: 'landing.footer.api', defaultText: 'API', href: '#' },
    { textKey: 'landing.footer.support', defaultText: 'Support', href: '#' }
  ];

  const platformLinks = [
    { textKey: 'landing.nav.dashboard', defaultText: 'Dashboard', href: '#' },
    { textKey: 'landing.footer.pricing', defaultText: 'Pricing', href: '#pricing' },
    { textKey: 'landing.nav.features', defaultText: 'Features', href: '#features' }
  ];

  return (
    <footer className='relative overflow-hidden bg-neutral-900 py-12 text-neutral-300'>
      {/* Subtle Animated Background */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='animate-gradient-slow absolute top-0 left-0 h-full w-full bg-gradient-to-br from-blue-900 via-neutral-900 to-purple-900 opacity-20'></div>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-transparent via-neutral-900/20 to-neutral-900/40'></div>
      </div>

      <div className='relative z-10 container mx-auto px-4'>
        {/* Main Content Grid */}
        <div className='grid grid-cols-1 gap-8 md:grid-cols-12'>
          {/* Brand Section */}
          <div className='space-y-4 md:col-span-4'>
            <h2 className='text-2xl font-bold tracking-tight text-white'>
              AutoBooks ERP
            </h2>
            <p className='max-w-xs text-sm leading-relaxed text-neutral-400'>
              {t('landing.footer.description', 'An AI-powered, all-in-one ERP platform designed to streamline operations, automate workflows, and empower organizations with actionable insights.')}
            </p>

            {/* Social Links */}
            <div className='flex space-x-2 pt-2'>
              {[
                {
                  icon: Github,
                  href: '#',
                  color: 'hover:text-white hover:bg-neutral-700'
                },
                {
                  icon: Twitter,
                  href: '#',
                  color: 'hover:text-blue-400 hover:bg-blue-900/20'
                },
                {
                  icon: Linkedin,
                  href: '#',
                  color: 'hover:text-blue-500 hover:bg-blue-900/20'
                }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`rounded-full bg-neutral-800 p-2 text-neutral-500 transition-all duration-300 ${social.color} `}
                >
                  <social.icon className='h-4 w-4' />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className='grid grid-cols-3 gap-4 md:col-span-8'>
            {[
              {
                titleKey: 'landing.footer.company',
                defaultTitle: 'Company',
                links: companyLinks
              },
              {
                titleKey: 'landing.footer.resources',
                defaultTitle: 'Resources',
                links: resourcesLinks
              },
              {
                titleKey: 'landing.footer.platform',
                defaultTitle: 'Platform',
                links: platformLinks
              }
            ].map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h3 className='mb-3 text-xs font-semibold tracking-wider text-white uppercase'>
                  {t(section.titleKey, section.defaultTitle)}
                </h3>
                <ul className='space-y-2'>
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className='group flex items-center text-xs text-neutral-400 transition-colors hover:text-white'
                      >
                        {t(link.textKey, link.defaultText)}
                        <ArrowUpRight
                          size={12}
                          className='ml-1 text-neutral-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:text-white group-hover:opacity-100'
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className='mt-8 flex flex-col items-center justify-between border-t border-neutral-800 pt-4 md:flex-row'>
          <p className='mb-2 text-xs text-neutral-500 md:mb-0'>
            © {new Date().getFullYear()} AutoBooks Inc. {t('landing.footer.allRightsReserved', 'All rights reserved.')}
          </p>
          <div className='flex space-x-4 text-xs text-neutral-500'>
            <a href='#' className='hover:text-white'>
              {t('landing.footer.privacy', 'Privacy Policy')}
            </a>
            <a href='#' className='hover:text-white'>
              {t('landing.footer.terms', 'Terms of Service')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
