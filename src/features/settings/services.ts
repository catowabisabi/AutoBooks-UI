import api from '@/lib/api';

// Types
export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  timezone: string;
  language: string;
  role: string;
  is_active: boolean;
}

export interface UserSettings {
  id: number;
  // Notification Settings
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notify_task_assigned: boolean;
  notify_task_completed: boolean;
  notify_invoice_received: boolean;
  notify_payment_due: boolean;
  notify_system_updates: boolean;
  notify_security_alerts: boolean;
  notify_weekly_digest: boolean;
  notify_monthly_report: boolean;
  // Billing Settings
  billing_email?: string;
  billing_address?: string;
  billing_city?: string;
  billing_country?: string;
  billing_postal_code?: string;
  company_name?: string;
  tax_id?: string;
  // Subscription
  subscription_plan: 'free' | 'starter' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'cancelled' | 'past_due' | 'trial';
  subscription_start_date?: string;
  subscription_end_date?: string;
  // Payment
  payment_method_type?: 'credit_card' | 'bank_transfer' | 'paypal';
  payment_method_last_four?: string;
  payment_method_expiry?: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notify_task_assigned: boolean;
  notify_task_completed: boolean;
  notify_invoice_received: boolean;
  notify_payment_due: boolean;
  notify_system_updates: boolean;
  notify_security_alerts: boolean;
  notify_weekly_digest: boolean;
  notify_monthly_report: boolean;
}

export interface BillingSettings {
  billing_email?: string;
  billing_address?: string;
  billing_city?: string;
  billing_country?: string;
  billing_postal_code?: string;
  company_name?: string;
  tax_id?: string;
}

// API Functions
export async function getUserProfile(): Promise<UserProfile> {
  const response = await api.get<UserProfile>('/api/v1/users/me/');
  return response;
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const response = await api.patch<UserProfile>('/api/v1/users/profile/', data);
  return response;
}

export async function getUserSettings(): Promise<UserSettings> {
  const response = await api.get<UserSettings>('/api/v1/user-settings/');
  return response;
}

export async function updateNotificationSettings(data: Partial<NotificationSettings>): Promise<UserSettings> {
  const response = await api.patch<UserSettings>('/api/v1/user-settings/notifications/', data);
  return response;
}

export async function updateBillingSettings(data: Partial<BillingSettings>): Promise<UserSettings> {
  const response = await api.patch<UserSettings>('/api/v1/user-settings/billing/', data);
  return response;
}
