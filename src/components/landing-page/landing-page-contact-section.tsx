'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  LANDING_SECTION_STYLES,
  LANDING_ANIMATIONS
} from '@/lib/landing-page-styles';

const ContactSection = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus(null);

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
        setSubmitStatus({
          success: true,
          message: data.message || 'Message sent successfully!'
        });
        toast.success(data.message || 'Message sent successfully!');
        setForm({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus({
          success: false,
          message: data.message || 'Failed to send message. Please try again.'
        });
        toast.error('Error', {
          description: 'Failed to send message. Please try again.'
        });
      }
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: 'An error occurred. Please try again later.'
      });
      toast.error('Error', {
        description: 'An error occurred. Please try again later.'
      });
      console.error('Error submitting contact form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={LANDING_SECTION_STYLES.section}>
      {/* Background decorations */}
      <div className={LANDING_SECTION_STYLES.backgroundWrapper}>
        <div
          className={LANDING_SECTION_STYLES.backgroundDecorations.topRight}
        ></div>
        <div
          className={LANDING_SECTION_STYLES.backgroundDecorations.bottomLeft}
        ></div>
      </div>

      {/* Section Title */}
      <motion.div
        {...LANDING_ANIMATIONS.fadeInUp}
        className={LANDING_SECTION_STYLES.sectionHeader.wrapper}
      >
        <h2 className={LANDING_SECTION_STYLES.sectionHeader.title}>
          Get in{' '}
          <span className='from-primary to-primary/80 bg-gradient-to-r bg-clip-text text-transparent'>
            Touch
          </span>
        </h2>
        <p className={LANDING_SECTION_STYLES.sectionHeader.subtitle}>
          Have questions or want to know more? Drop us a message below and
          we&#39;ll get back to you soon.
        </p>
      </motion.div>

      {/* Contact Form */}
      <div className={LANDING_SECTION_STYLES.contact.formWrapper}>
        <motion.form
          onSubmit={handleSubmit}
          {...LANDING_ANIMATIONS.scaleIn}
          className={LANDING_SECTION_STYLES.contact.form}
        >
          {/* Animated Background Effect */}
          <div className={LANDING_SECTION_STYLES.card.hoverEffect}></div>

          {/* Form Content */}
          <div className='relative z-10 space-y-6'>
            {/* Name and Email Row */}
            <div className={LANDING_SECTION_STYLES.contact.formGrid}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: false }}
                className={LANDING_SECTION_STYLES.contact.inputGroup}
              >
                <label
                  htmlFor='name'
                  className={LANDING_SECTION_STYLES.contact.label}
                >
                  Name
                </label>
                <input
                  type='text'
                  id='name'
                  name='name'
                  value={form.name}
                  onChange={handleChange}
                  className={LANDING_SECTION_STYLES.contact.input}
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: false }}
                className={LANDING_SECTION_STYLES.contact.inputGroup}
              >
                <label
                  htmlFor='email'
                  className={LANDING_SECTION_STYLES.contact.label}
                >
                  Email
                </label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  value={form.email}
                  onChange={handleChange}
                  className={LANDING_SECTION_STYLES.contact.input}
                  required
                />
              </motion.div>
            </div>

            {/* Subject */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: false }}
              className={LANDING_SECTION_STYLES.contact.inputGroupFull}
            >
              <label
                htmlFor='subject'
                className={LANDING_SECTION_STYLES.contact.label}
              >
                Subject
              </label>
              <input
                type='text'
                id='subject'
                name='subject'
                value={form.subject}
                onChange={handleChange}
                className={LANDING_SECTION_STYLES.contact.input}
                required
              />
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: false }}
              className={LANDING_SECTION_STYLES.contact.inputGroupFull}
            >
              <label
                htmlFor='message'
                className={LANDING_SECTION_STYLES.contact.label}
              >
                Message
              </label>
              <textarea
                id='message'
                name='message'
                rows={4}
                value={form.message}
                onChange={handleChange}
                className={LANDING_SECTION_STYLES.contact.textarea}
                required
              />
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type='submit'
              {...LANDING_ANIMATIONS.buttonHover}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: false }}
              className={`${LANDING_SECTION_STYLES.contact.submitButton} ${
                isLoading
                  ? LANDING_SECTION_STYLES.contact.submitButtonDisabled
                  : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Send Message'}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default ContactSection;
