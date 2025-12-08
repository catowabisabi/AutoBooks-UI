/**
 * Users API - 用戶 API
 * User management endpoints with full type safety
 */

import { typedApi } from './client';
import type {
  User,
  UserProfile,
  UserProfileUpdateRequest,
  UserSettings,
  UserSettingsUpdateRequest,
  UserSubscription,
  SubscriptionPlan,
  PaginatedResponse,
  ListParams,
} from './types';

export const usersApi = {
  /**
   * Get current user profile
   * 獲取當前用戶資料
   */
  me: async (): Promise<User> => {
    return typedApi.get<User>('/users/me/');
  },

  /**
   * Update current user profile
   * 更新當前用戶資料
   */
  updateProfile: async (data: UserProfileUpdateRequest): Promise<UserProfile> => {
    return typedApi.patch<UserProfile>('/users/me/', data);
  },

  /**
   * List all users (admin only)
   * 列出所有用戶（僅限管理員）
   */
  list: async (params?: ListParams): Promise<PaginatedResponse<User>> => {
    return typedApi.get<PaginatedResponse<User>>('/users/', params);
  },

  /**
   * Get user by ID (admin only)
   * 通過 ID 獲取用戶（僅限管理員）
   */
  get: async (id: string): Promise<User> => {
    return typedApi.get<User>(`/users/${id}/`);
  },

  /**
   * Create a new user (admin only)
   * 創建新用戶（僅限管理員）
   */
  create: async (data: { email: string; full_name: string; password: string; role?: string }): Promise<User> => {
    return typedApi.post<User>('/users/', data);
  },

  /**
   * Update user (admin only)
   * 更新用戶（僅限管理員）
   */
  update: async (id: string, data: Partial<User>): Promise<User> => {
    return typedApi.patch<User>(`/users/${id}/`, data);
  },

  /**
   * Delete user (admin only)
   * 刪除用戶（僅限管理員）
   */
  delete: async (id: string): Promise<void> => {
    return typedApi.delete(`/users/${id}/`);
  },

  // ---------------------------------------------------------------
  // Settings / 設置
  // ---------------------------------------------------------------

  /**
   * Get user settings
   * 獲取用戶設置
   */
  getSettings: async (): Promise<UserSettings> => {
    return typedApi.get<UserSettings>('/users/settings/');
  },

  /**
   * Update user settings
   * 更新用戶設置
   */
  updateSettings: async (data: UserSettingsUpdateRequest): Promise<UserSettings> => {
    return typedApi.patch<UserSettings>('/users/settings/', data);
  },

  // ---------------------------------------------------------------
  // Subscriptions / 訂閱
  // ---------------------------------------------------------------

  /**
   * Get available subscription plans
   * 獲取可用的訂閱方案
   */
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    return typedApi.get<SubscriptionPlan[]>('/subscriptions/plans/');
  },

  /**
   * Get current user subscription
   * 獲取當前用戶訂閱
   */
  getSubscription: async (): Promise<UserSubscription> => {
    return typedApi.get<UserSubscription>('/users/subscription/');
  },

  /**
   * Update subscription
   * 更新訂閱
   */
  updateSubscription: async (planId: string, billingCycle: 'monthly' | 'yearly'): Promise<UserSubscription> => {
    return typedApi.post<UserSubscription>('/users/subscription/', {
      plan_id: planId,
      billing_cycle: billingCycle,
    });
  },

  /**
   * Cancel subscription
   * 取消訂閱
   */
  cancelSubscription: async (): Promise<UserSubscription> => {
    return typedApi.post<UserSubscription>('/users/subscription/cancel/');
  },
};

export default usersApi;
