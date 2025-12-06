import LandingPageNavbar from '@/components/landing-page/landing-page-navbar';
import LandingPageHeroSection from '@/components/landing-page/landing-page-hero-section';
import LandingPageFeatureSection from '@/components/landing-page/landing-page-feature-section';
import StatsSection from '@/components/landing-page/stats-section';
import FAQsSection from '@/components/landing-page/landing-page-faqs-section';
import ContactSection from '@/components/landing-page/landing-page-contact-section';
import LandingPageFooter from '@/components/landing-page/landing-page-footer';
import LandingPageScrollToTopButton from '@/components/landing-page/landing-page-scroll-to-top-button';

export default function LandingPage() {
  return (
    <div className='flex min-h-screen flex-col'>
      <LandingPageNavbar />
      <main className='flex flex-1 flex-col'>
        <LandingPageHeroSection />
        <StatsSection />
        <section id='features'>
          <LandingPageFeatureSection />
        </section>
        <section id='faqs'>
          <FAQsSection />
        </section>
        <section id='contact'>
          <ContactSection />
        </section>
      </main>
      <LandingPageFooter />
      <LandingPageScrollToTopButton />
    </div>
  );
}
