'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Users, 
  MessageSquare,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/language-switcher';
import AnimatedBackground from '@/components/landing-page/animated-background';
import { toast } from 'sonner';

// Generate dates for the next 30 days
const generateAvailableDates = () => {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    // Skip weekends
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      dates.push(date);
    }
  }
  return dates;
};

// Available time slots
const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

// Company size options
const companySizeOptions = [
  { value: '1-5', labelKey: 'bookDemo.companySize.1-5' },
  { value: '6-20', labelKey: 'bookDemo.companySize.6-20' },
  { value: '21-50', labelKey: 'bookDemo.companySize.21-50' },
  { value: '51-100', labelKey: 'bookDemo.companySize.51-100' },
  { value: '101-500', labelKey: 'bookDemo.companySize.101-500' },
  { value: '500+', labelKey: 'bookDemo.companySize.500+' },
];

// Industry options
const industryOptions = [
  { value: 'accounting', labelKey: 'bookDemo.industry.accounting' },
  { value: 'retail', labelKey: 'bookDemo.industry.retail' },
  { value: 'manufacturing', labelKey: 'bookDemo.industry.manufacturing' },
  { value: 'technology', labelKey: 'bookDemo.industry.technology' },
  { value: 'services', labelKey: 'bookDemo.industry.services' },
  { value: 'healthcare', labelKey: 'bookDemo.industry.healthcare' },
  { value: 'construction', labelKey: 'bookDemo.industry.construction' },
  { value: 'education', labelKey: 'bookDemo.industry.education' },
  { value: 'food', labelKey: 'bookDemo.industry.food' },
  { value: 'other', labelKey: 'bookDemo.industry.other' },
];

export default function BookDemoPage() {
  const { t, locale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1); // 1: Select date/time, 2: Fill form, 3: Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Calendar state
  const [availableDates] = useState(generateAvailableDates());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    companySize: '',
    industry: '',
    jobTitle: '',
    message: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const getText = (key: string, fallback: string) => {
    return mounted ? t(key) : fallback;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calendar navigation
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateAvailable = (day: number) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return availableDates.some(d => 
      d.getDate() === checkDate.getDate() && 
      d.getMonth() === checkDate.getMonth() && 
      d.getFullYear() === checkDate.getFullYear()
    );
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const handleDateSelect = (day: number) => {
    if (isDateAvailable(day)) {
      setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
      setSelectedTime(null);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, you would send this to your API
      console.log('Demo booking:', {
        date: selectedDate,
        time: selectedTime,
        ...formData,
      });

      setSubmitted(true);
      setStep(3);
      toast.success(getText('bookDemo.successMessage', 'Demo scheduled successfully!'));
    } catch (error) {
      toast.error(getText('bookDemo.errorMessage', 'Failed to schedule demo. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = selectedDate && selectedTime;
  const isFormValid = formData.firstName && formData.lastName && formData.email && 
                      formData.phone && formData.companyName && formData.companySize && 
                      formData.industry && formData.jobTitle;

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const available = isDateAvailable(day);
      const selected = isDateSelected(day);
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          disabled={!available}
          className={cn(
            'h-10 w-10 rounded-full text-sm font-medium transition-colors',
            available && !selected && 'hover:bg-primary/10 text-foreground cursor-pointer',
            !available && 'text-muted-foreground/30 cursor-not-allowed',
            selected && 'bg-primary text-primary-foreground'
          )}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground variant="pricing" />

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
                {getText('common.back', 'Back')}
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="relative z-10 container mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {getText('bookDemo.title', 'Book a')}{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {getText('bookDemo.titleHighlight', 'Demo')}
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {getText('bookDemo.subtitle', 'Schedule a personalized demo with our team to see how AutoBooks can transform your business.')}
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mt-8 flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {step > s ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              <span className={cn(
                'hidden sm:block text-sm font-medium',
                step >= s ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {s === 1 && getText('bookDemo.step1', 'Select Time')}
                {s === 2 && getText('bookDemo.step2', 'Your Details')}
                {s === 3 && getText('bookDemo.step3', 'Confirmation')}
              </span>
              {s < 3 && <div className="hidden sm:block w-12 h-0.5 bg-muted" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pb-20">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Select Date & Time */}
          {step === 1 && (
            <div className="grid gap-6 lg:grid-cols-2 max-w-4xl mx-auto">
              {/* Calendar */}
              <Card className="backdrop-blur-sm bg-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {getText('bookDemo.selectDate', 'Select a Date')}
                  </CardTitle>
                  <CardDescription>
                    {getText('bookDemo.selectDateDesc', 'Choose your preferred date for the demo')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-medium">
                      {currentMonth.toLocaleDateString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {(locale === 'zh-TW' 
                      ? ['日', '一', '二', '三', '四', '五', '六']
                      : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
                    ).map((day) => (
                      <div key={day} className="h-10 w-10 flex items-center justify-center text-xs font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                  </div>

                  {selectedDate && (
                    <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm font-medium text-primary">
                        {getText('bookDemo.selectedDate', 'Selected')}: {formatFullDate(selectedDate)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Time Slots */}
              <Card className="backdrop-blur-sm bg-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    {getText('bookDemo.selectTime', 'Select a Time')}
                  </CardTitle>
                  <CardDescription>
                    {getText('bookDemo.selectTimeDesc', 'Choose your preferred time slot (Hong Kong Time)')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          type="button"
                          variant={selectedTime === time ? 'default' : 'outline'}
                          className="w-full"
                          onClick={() => handleTimeSelect(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                      {getText('bookDemo.selectDateFirst', 'Please select a date first')}
                    </div>
                  )}

                  {selectedTime && (
                    <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm font-medium text-primary">
                        {getText('bookDemo.selectedTime', 'Selected')}: {selectedTime} HKT
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Continue Button */}
              <div className="lg:col-span-2 flex justify-end">
                <Button
                  size="lg"
                  disabled={!canProceedToStep2}
                  onClick={() => setStep(2)}
                  className="px-8"
                >
                  {getText('bookDemo.continue', 'Continue')}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Contact Form */}
          {step === 2 && (
            <Card className="max-w-2xl mx-auto backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {getText('bookDemo.yourDetails', 'Your Details')}
                </CardTitle>
                <CardDescription>
                  {getText('bookDemo.yourDetailsDesc', 'Please fill in your information to schedule the demo')}
                </CardDescription>
                {selectedDate && selectedTime && (
                  <Badge variant="outline" className="w-fit mt-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(selectedDate)} at {selectedTime} HKT
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        {getText('bookDemo.firstName', 'First Name')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        placeholder={getText('bookDemo.firstNamePlaceholder', 'John')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        {getText('bookDemo.lastName', 'Last Name')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        placeholder={getText('bookDemo.lastNamePlaceholder', 'Doe')}
                      />
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <Mail className="h-3 w-3 inline mr-1" />
                        {getText('bookDemo.email', 'Email')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="john@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <Phone className="h-3 w-3 inline mr-1" />
                        {getText('bookDemo.phone', 'Phone')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+852 1234 5678"
                      />
                    </div>
                  </div>

                  {/* Company Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">
                        <Building2 className="h-3 w-3 inline mr-1" />
                        {getText('bookDemo.companyName', 'Company Name')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                        placeholder={getText('bookDemo.companyNamePlaceholder', 'ABC Company Ltd.')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">
                        {getText('bookDemo.jobTitle', 'Job Title')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        required
                        placeholder={getText('bookDemo.jobTitlePlaceholder', 'Finance Manager')}
                      />
                    </div>
                  </div>

                  {/* Select Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>
                        <Users className="h-3 w-3 inline mr-1" />
                        {getText('bookDemo.companySizeLabel', 'Company Size')} <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.companySize}
                        onValueChange={(value) => handleSelectChange('companySize', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={getText('bookDemo.selectCompanySize', 'Select company size')} />
                        </SelectTrigger>
                        <SelectContent>
                          {companySizeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {getText(option.labelKey, option.value + ' employees')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {getText('bookDemo.industryLabel', 'Industry')} <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(value) => handleSelectChange('industry', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={getText('bookDemo.selectIndustry', 'Select industry')} />
                        </SelectTrigger>
                        <SelectContent>
                          {industryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {getText(option.labelKey, option.value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      <MessageSquare className="h-3 w-3 inline mr-1" />
                      {getText('bookDemo.message', 'Message (Optional)')}
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={getText('bookDemo.messagePlaceholder', 'Tell us about your specific needs or questions...')}
                      rows={4}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {getText('bookDemo.back', 'Back')}
                    </Button>
                    <Button type="submit" disabled={!isFormValid || isSubmitting} size="lg">
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          {getText('bookDemo.scheduling', 'Scheduling...')}
                        </>
                      ) : (
                        getText('bookDemo.scheduleDemo', 'Schedule Demo')
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && submitted && (
            <Card className="max-w-lg mx-auto backdrop-blur-sm bg-card/80 text-center">
              <CardContent className="pt-12 pb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center"
                >
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </motion.div>
                
                <h2 className="text-2xl font-bold mb-2">
                  {getText('bookDemo.confirmed', "You're All Set!")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {getText('bookDemo.confirmedDesc', 'Your demo has been scheduled. We\'ve sent a confirmation email with the meeting details.')}
                </p>

                <div className="p-4 rounded-lg bg-muted/50 mb-6 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedDate && formatFullDate(selectedDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedTime} HKT</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  {getText('bookDemo.checkEmail', 'Please check your email for the calendar invite and meeting link.')}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/">
                      {getText('bookDemo.backToHome', 'Back to Home')}
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/sign-up">
                      {getText('bookDemo.startFreeTrial', 'Start Free Trial')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
