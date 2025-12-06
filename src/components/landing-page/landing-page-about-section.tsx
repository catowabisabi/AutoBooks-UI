'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BarChart2, Mail, FileText, Calendar, Brain } from 'lucide-react';

const aiAssistants = [
  {
    name: 'Analyst Assistant',
    icon: <BarChart2 size={50} />,
    desc: 'Ask questions, get instant charts and insights'
  },
  {
    name: 'Email Assistant',
    icon: <Mail size={50} />,
    desc: 'Prioritize, summarize, and respond to emails with AI'
  },
  {
    name: 'Document Assistant',
    icon: <FileText size={50} />,
    desc: 'Extract and analyze info from receipts, invoices, and reports'
  },
  {
    name: 'Planner Assistant',
    icon: <Calendar size={50} />,
    desc: 'Auto-schedule, optimize, and manage plans with ease'
  }
];

const AboutSection = () => {
  return (
    <section className='border-border bg-primary/10 relative min-h-[700px] overflow-hidden border-b py-16'>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: false }}
        className='text-center'
      >
        <div className='mb-4 flex items-center justify-center'>
          <Brain size={50} className='text-primary mr-2' />
        </div>
        <h2 className='text-foreground mt-6 text-4xl font-bold sm:text-5xl lg:text-6xl'>
          AI Assistants Built-In
        </h2>
        <p className='text-muted-foreground mx-auto mt-6 max-w-3xl text-xl font-medium'>
          &#34;Turn your data into decisions.&#34;
        </p>
        <p className='text-muted-foreground mx-auto mt-4 max-w-3xl text-lg'>
          With built-in AI assistants for analytics, emails, planning, and
          document processing, AutoBooks ERP helps your team work smarter, not
          harder.
        </p>
      </motion.div>

      <div className='mt-16 grid grid-cols-1 justify-center gap-12 px-6 sm:grid-cols-2 lg:grid-cols-4'>
        {aiAssistants.map((assistant, index) => (
          <motion.div
            key={assistant.name}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: false }}
            className='flex flex-col items-center space-y-4 text-center'
          >
            <div className='from-primary to-primary/80 text-primary-foreground flex h-24 w-24 transform items-center justify-center rounded-full bg-gradient-to-r shadow-2xl transition-all hover:scale-110'>
              {assistant.icon}
            </div>
            <h3 className='text-foreground text-2xl font-semibold'>
              {assistant.name}
            </h3>
            <p className='text-muted-foreground max-w-xs text-base'>
              {assistant.desc}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: false }}
        className='mt-20 flex flex-col items-center space-y-6 text-center'
      >
        <p className='from-primary to-primary/80 text-foreground bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent'>
          Experience the power of AI in your enterprise
        </p>
        <Button className='from-primary to-secondary text-primary-foreground rounded-full bg-gradient-to-r px-8 py-4 text-xl shadow-lg transition-all hover:scale-105'>
          <a
            href='/auth/signup'
            className='text-primary-foreground font-semibold tracking-wide uppercase'
          >
            Start Free Trial
          </a>
        </Button>
      </motion.div>
    </section>
  );
};

export default AboutSection;
