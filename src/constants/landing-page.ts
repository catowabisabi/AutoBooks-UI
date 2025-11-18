import { BotMessageSquare } from 'lucide-react';
import { BatteryCharging } from 'lucide-react';
import { Fingerprint } from 'lucide-react';
import { ShieldHalf } from 'lucide-react';
import { PlugZap } from 'lucide-react';

// Content for Landing Page NavBar
export const navMenuItems = [
  { title: 'Home', href: '/' },
  { title: 'Features', href: '#features' },
  { title: 'FAQs', href: '#faqs' },
  { title: 'Contact Us', href: '#contact' }
  // { title: 'Pricing', href: '#pricing' },
  // { title: 'About', href: '#about' },
  // { title: 'Testimonials', href: '#testimonials' },
];

// Content of the Features
export const features = [
  {
    icon: BatteryCharging,
    text: 'SaaS Solutions',
    description:
      'Popular Software-as-a-Service (SaaS) products used by companies globally.'
  },
  {
    icon: PlugZap,
    text: 'Data Analytics',
    description:
      'Analyze historical and real-time data to derive actionable insights. Build Data Warehouses, Data Lakes, and Data Lakehouses.'
  },
  {
    // icon: <GlobeLock />,
    icon: BotMessageSquare,
    text: 'Machine Learning',
    description:
      'Innovative solutions and services using the latest Machine Learning algorithms, such as Transformers, GANs, encoders, LSTMs, CNNs, and vision analytics.'
  },
  {
    icon: BotMessageSquare,
    text: 'Drug Discovery',
    description:
      'Determine the toxicity of the new chemical compounds as designed by AI.'
  },
  {
    icon: Fingerprint,
    text: 'Feature5',
    description: 'Feature description.'
  },
  {
    icon: ShieldHalf,
    text: 'Feature6',
    description: 'Feature description.'
  }
];

// Contents of the products
export const products = [
  {
    title: 'Virtual Trial Room',
    description:
      'Try Before You Buy. Try on clothes and accessories virtually using AI.',
    href: 'https://vtr.winzerd.com/'
  },
  {
    title: 'Expense Management Solution',
    description:
      "Record your company's expenses and apply rules around them using our AI-powered Expense Management Solution with built-in analytics.",
    href: '#'
  },
  {
    title: 'Voice Memo Solution',
    description:
      'Record meeting conversations and memos, and transcribe them to text using our AI-powered Voice Memo Solution.',
    href: '#'
  },
  {
    title: 'Document Search',
    description:
      'AI-powered solution to search for information within your documents and receive precise responses.',
    href: '#'
  },
  {
    title: 'Recommendation Engine',
    description:
      'Identify the relationships between your customers and products.  Recommend products to customers in the search results. Effectively introduce new products to customers.',
    href: '#'
  }
];

export const pricingOptions = [
  {
    title: 'Free',
    price: '$0',
    features: [
      'Private board sharing',
      '5 Gb Storage',
      'Web Analytics',
      'Private Mode'
    ]
  },
  {
    title: 'Pro',
    price: '$10',
    features: [
      'Private board sharing',
      '10 Gb Storage',
      'Web Analytics (Advance)',
      'Private Mode'
    ]
  },
  {
    title: 'Enterprise',
    price: '$200',
    features: [
      'Private board sharing',
      'Unlimited Storage',
      'High Performance Network',
      'Private Mode'
    ]
  }
];

// Contents of the Footer
export const resourcesLinks = [
  { href: '#', text: 'Getting Started' },
  { href: '#', text: 'Documentation' },
  { href: '#', text: 'Tutorials' },
  { href: '#', text: 'API Reference' },
  { href: '#', text: 'Community Forums' }
];

export const platformLinks = [
  { href: '#', text: 'Contact Us' },
  { href: '#', text: 'FAQs' }
];

export const communityLinks = [
  { href: '#', text: 'Events' },
  { href: '#', text: 'Meetups' },
  { href: '#', text: 'Conferences' },
  { href: '#', text: 'Hackathons' },
  { href: '#', text: 'Jobs' }
];
