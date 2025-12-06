'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IconUser, IconBell, IconCreditCard, IconKey, IconDatabase, IconLoader } from '@tabler/icons-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/provider';
import { useAuth } from '@/contexts/auth-context';
import {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateNotificationSettings,
  updateBillingSettings,
  UserProfile,
  UserSettings,
} from '@/features/settings/services';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Update active tab when URL param changes
  useEffect(() => {
    if (tabParam && ['profile', 'notifications', 'billing', 'api-keys', 'data'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  // Profile State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    timezone: 'Asia/Hong_Kong',
    language: 'en',
  });

  // Settings State
  const [settings, setSettings] = useState<UserSettings | null>(null);
  
  // Notification Form
  const [notificationForm, setNotificationForm] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    notify_task_assigned: true,
    notify_task_completed: true,
    notify_invoice_received: true,
    notify_payment_due: true,
    notify_system_updates: true,
    notify_security_alerts: true,
    notify_weekly_digest: false,
    notify_monthly_report: true,
  });

  // Billing Form
  const [billingForm, setBillingForm] = useState({
    billing_email: '',
    billing_address: '',
    billing_city: '',
    billing_country: '',
    billing_postal_code: '',
    company_name: '',
    tax_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [profileData, settingsData] = await Promise.all([
        getUserProfile(),
        getUserSettings(),
      ]);
      
      setProfile(profileData);
      setProfileForm({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        timezone: profileData.timezone || 'Asia/Hong_Kong',
        language: profileData.language || 'en',
      });

      setSettings(settingsData);
      setNotificationForm({
        email_notifications: settingsData.email_notifications,
        push_notifications: settingsData.push_notifications,
        sms_notifications: settingsData.sms_notifications,
        notify_task_assigned: settingsData.notify_task_assigned,
        notify_task_completed: settingsData.notify_task_completed,
        notify_invoice_received: settingsData.notify_invoice_received,
        notify_payment_due: settingsData.notify_payment_due,
        notify_system_updates: settingsData.notify_system_updates,
        notify_security_alerts: settingsData.notify_security_alerts,
        notify_weekly_digest: settingsData.notify_weekly_digest,
        notify_monthly_report: settingsData.notify_monthly_report,
      });
      setBillingForm({
        billing_email: settingsData.billing_email || '',
        billing_address: settingsData.billing_address || '',
        billing_city: settingsData.billing_city || '',
        billing_country: settingsData.billing_country || '',
        billing_postal_code: settingsData.billing_postal_code || '',
        company_name: settingsData.company_name || '',
        tax_id: settingsData.tax_id || '',
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Use demo data if API fails
      setProfile({
        id: 1,
        email: user?.email || 'demo@autobooks.com',
        full_name: user?.full_name || 'Demo User',
        phone: '+852 9123 4567',
        timezone: 'Asia/Hong_Kong',
        language: 'en',
        role: 'ADMIN',
        is_active: true,
      });
      setProfileForm({
        full_name: user?.full_name || 'Demo User',
        phone: '+852 9123 4567',
        timezone: 'Asia/Hong_Kong',
        language: 'en',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(profileForm);
      toast.success(t('settings.profileSaved', 'Profile saved successfully'));
    } catch (error) {
      toast.error(t('common.error', 'Error'), {
        description: t('settings.saveFailed', 'Failed to save profile'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await updateNotificationSettings(notificationForm);
      toast.success(t('settings.notificationsSaved', 'Notification settings saved'));
    } catch (error) {
      toast.error(t('common.error', 'Error'), {
        description: t('settings.saveFailed', 'Failed to save settings'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBilling = async () => {
    setIsSaving(true);
    try {
      await updateBillingSettings(billingForm);
      toast.success(t('settings.billingSaved', 'Billing settings saved'));
    } catch (error) {
      toast.error(t('common.error', 'Error'), {
        description: t('settings.saveFailed', 'Failed to save billing'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <IconLoader className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <Heading 
            title={t('settings.title', 'Settings')} 
            description={t('settings.description', 'Manage your account settings and preferences')} 
          />
        </div>
        <Separator />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <IconUser className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.profile', 'Profile')}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <IconBell className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.notifications', 'Notifications')}</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <IconCreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.billing', 'Billing')}</span>
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <IconKey className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.apiKeys', 'API Keys')}</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <IconDatabase className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.data', 'Data')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.profileInfo', 'Profile Information')}</CardTitle>
                <CardDescription>
                  {t('settings.profileInfoDesc', 'Update your personal information and preferences')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-xl">
                      {profileForm.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{profileForm.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    <Badge variant="secondary" className="mt-1">
                      {profile?.role || 'USER'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">{t('settings.fullName', 'Full Name')}</Label>
                    <Input
                      id="full_name"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      placeholder={t('settings.fullNamePlaceholder', 'Enter your full name')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('settings.email', 'Email')}</Label>
                    <Input
                      id="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('settings.emailCannotChange', 'Email cannot be changed')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('settings.phone', 'Phone')}</Label>
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+852 9123 4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">{t('settings.timezone', 'Timezone')}</Label>
                    <Select
                      value={profileForm.timezone}
                      onValueChange={(value) => setProfileForm({ ...profileForm, timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Hong_Kong">Hong Kong (GMT+8)</SelectItem>
                        <SelectItem value="Asia/Shanghai">Shanghai (GMT+8)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
                        <SelectItem value="Asia/Singapore">Singapore (GMT+8)</SelectItem>
                        <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Los Angeles (GMT-8)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">{t('settings.language', 'Language')}</Label>
                    <Select
                      value={profileForm.language}
                      onValueChange={(value) => setProfileForm({ ...profileForm, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh-TW">繁體中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.notificationPreferences', 'Notification Preferences')}</CardTitle>
                <CardDescription>
                  {t('settings.notificationDesc', 'Choose how you want to receive notifications')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notification Channels */}
                <div>
                  <h4 className="font-medium mb-4">{t('settings.notificationChannels', 'Notification Channels')}</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('settings.emailNotifications', 'Email Notifications')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.emailNotificationsDesc', 'Receive notifications via email')}
                        </p>
                      </div>
                      <Switch
                        checked={notificationForm.email_notifications}
                        onCheckedChange={(checked) => 
                          setNotificationForm({ ...notificationForm, email_notifications: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('settings.pushNotifications', 'Push Notifications')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.pushNotificationsDesc', 'Receive push notifications in browser')}
                        </p>
                      </div>
                      <Switch
                        checked={notificationForm.push_notifications}
                        onCheckedChange={(checked) => 
                          setNotificationForm({ ...notificationForm, push_notifications: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('settings.smsNotifications', 'SMS Notifications')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.smsNotificationsDesc', 'Receive SMS for urgent alerts')}
                        </p>
                      </div>
                      <Switch
                        checked={notificationForm.sms_notifications}
                        onCheckedChange={(checked) => 
                          setNotificationForm({ ...notificationForm, sms_notifications: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Notification Types */}
                <div>
                  <h4 className="font-medium mb-4">{t('settings.notificationTypes', 'Notification Types')}</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between">
                      <Label>{t('settings.taskAssigned', 'Task Assigned')}</Label>
                      <Switch
                        checked={notificationForm.notify_task_assigned}
                        onCheckedChange={(checked) => 
                          setNotificationForm({ ...notificationForm, notify_task_assigned: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t('settings.taskCompleted', 'Task Completed')}</Label>
                      <Switch
                        checked={notificationForm.notify_task_completed}
                        onCheckedChange={(checked) => 
                          setNotificationForm({ ...notificationForm, notify_task_completed: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t('settings.invoiceReceived', 'Invoice Received')}</Label>
                      <Switch
                        checked={notificationForm.notify_invoice_received}
                        onCheckedChange={(checked) => 
                          setNotificationForm({ ...notificationForm, notify_invoice_received: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t('settings.paymentDue', 'Payment Due')}</Label>
                      <Switch
                        checked={notificationForm.notify_payment_due}
                        onCheckedChange={(checked) => 
                          setNotificationForm({ ...notificationForm, notify_payment_due: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t('settings.systemUpdates', 'System Updates')}</Label>
                      <Switch
                        checked={notificationForm.notify_system_updates}
                        onCheckedChange={(checked) => 
                          setNotificationForm({ ...notificationForm, notify_system_updates: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t('settings.securityAlerts', 'Security Alerts')}</Label>
                      <Switch
                        checked={notificationForm.notify_security_alerts}
                        onCheckedChange={(checked) => 
                          setNotificationForm({ ...notificationForm, notify_security_alerts: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t('settings.weeklyDigest', 'Weekly Digest')}</Label>
                      <Switch
                        checked={notificationForm.notify_weekly_digest}
                        onCheckedChange={(checked) => 
                          setNotificationForm({ ...notificationForm, notify_weekly_digest: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t('settings.monthlyReport', 'Monthly Report')}</Label>
                      <Switch
                        checked={notificationForm.notify_monthly_report}
                        onCheckedChange={(checked) => 
                          setNotificationForm({ ...notificationForm, notify_monthly_report: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={isSaving}>
                    {isSaving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            {/* Subscription Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.subscription', 'Subscription')}</CardTitle>
                <CardDescription>
                  {t('settings.subscriptionDesc', 'Manage your subscription plan')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-semibold capitalize">
                      {settings?.subscription_plan || 'Free'} {t('settings.plan', 'Plan')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.status', 'Status')}: 
                      <Badge variant="outline" className="ml-2 capitalize">
                        {settings?.subscription_status || 'active'}
                      </Badge>
                    </p>
                  </div>
                  <Button variant="outline">
                    {t('settings.upgradePlan', 'Upgrade Plan')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Billing Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.billingInfo', 'Billing Information')}</CardTitle>
                <CardDescription>
                  {t('settings.billingInfoDesc', 'Update your billing address and company details')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">{t('settings.companyName', 'Company Name')}</Label>
                    <Input
                      id="company_name"
                      value={billingForm.company_name}
                      onChange={(e) => setBillingForm({ ...billingForm, company_name: e.target.value })}
                      placeholder={t('settings.companyNamePlaceholder', 'Your company name')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_id">{t('settings.taxId', 'Tax ID / VAT Number')}</Label>
                    <Input
                      id="tax_id"
                      value={billingForm.tax_id}
                      onChange={(e) => setBillingForm({ ...billingForm, tax_id: e.target.value })}
                      placeholder="12345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing_email">{t('settings.billingEmail', 'Billing Email')}</Label>
                    <Input
                      id="billing_email"
                      type="email"
                      value={billingForm.billing_email}
                      onChange={(e) => setBillingForm({ ...billingForm, billing_email: e.target.value })}
                      placeholder="billing@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing_country">{t('settings.country', 'Country')}</Label>
                    <Select
                      value={billingForm.billing_country}
                      onValueChange={(value) => setBillingForm({ ...billingForm, billing_country: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('settings.selectCountry', 'Select country')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HK">Hong Kong</SelectItem>
                        <SelectItem value="CN">China</SelectItem>
                        <SelectItem value="TW">Taiwan</SelectItem>
                        <SelectItem value="SG">Singapore</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_address">{t('settings.address', 'Address')}</Label>
                  <Textarea
                    id="billing_address"
                    value={billingForm.billing_address}
                    onChange={(e) => setBillingForm({ ...billingForm, billing_address: e.target.value })}
                    placeholder={t('settings.addressPlaceholder', 'Street address')}
                    rows={2}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="billing_city">{t('settings.city', 'City')}</Label>
                    <Input
                      id="billing_city"
                      value={billingForm.billing_city}
                      onChange={(e) => setBillingForm({ ...billingForm, billing_city: e.target.value })}
                      placeholder={t('settings.cityPlaceholder', 'City')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing_postal_code">{t('settings.postalCode', 'Postal Code')}</Label>
                    <Input
                      id="billing_postal_code"
                      value={billingForm.billing_postal_code}
                      onChange={(e) => setBillingForm({ ...billingForm, billing_postal_code: e.target.value })}
                      placeholder="000000"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveBilling} disabled={isSaving}>
                    {isSaving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.paymentMethod', 'Payment Method')}</CardTitle>
                <CardDescription>
                  {t('settings.paymentMethodDesc', 'Manage your payment methods')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {settings?.payment_method_type ? (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 bg-muted rounded flex items-center justify-center">
                        <IconCreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{settings.payment_method_type.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          •••• {settings.payment_method_last_four} | {t('settings.expires', 'Expires')} {settings.payment_method_expiry}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {t('settings.update', 'Update')}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">
                      {t('settings.noPaymentMethod', 'No payment method added')}
                    </p>
                    <Button variant="outline">
                      {t('settings.addPaymentMethod', 'Add Payment Method')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.apiKeysTitle', 'API Keys')}</CardTitle>
                <CardDescription>
                  {t('settings.apiKeysDesc', 'Manage your AI service API keys')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/settings/api-keys">
                  <Button>{t('settings.manageApiKeys', 'Manage API Keys')}</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.knowledgeBase', 'Knowledge Base')}</CardTitle>
                <CardDescription>
                  {t('settings.knowledgeBaseDesc', 'Manage documents for AI-powered search')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/settings/knowledge-base">
                  <Button>{t('settings.manageKnowledgeBase', 'Manage Knowledge Base')}</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
