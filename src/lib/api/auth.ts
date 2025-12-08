/**
 * Auth API - 認證 API
 * Authentication endpoints with full type safety
 */

import { typedApi } from './client';
import type {
  TokenResponse,
  LoginRequest,
  RegisterRequest,
  GoogleAuthUrlResponse,
  GoogleCallbackRequest,
  User,
} from './types';

export const authApi = {
  /**
   * Login with email and password
   * 使用電子郵件和密碼登入
   */
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const response = await typedApi.post<TokenResponse>(
      '/auth/token/',
      credentials,
      { skipAuth: true }
    );
    typedApi.setTokens(response.access, response.refresh);
    return response;
  },

  /**
   * Logout and clear tokens
   * 登出並清除 token
   */
  logout: (): void => {
    typedApi.clearTokens();
  },

  /**
   * Register a new user
   * 註冊新用戶
   */
  register: async (data: RegisterRequest): Promise<User> => {
    return typedApi.post<User>('/users/register/', data, { skipAuth: true });
  },

  /**
   * Get Google OAuth URL
   * 獲取 Google OAuth URL
   */
  getGoogleAuthUrl: async (): Promise<GoogleAuthUrlResponse> => {
    return typedApi.get<GoogleAuthUrlResponse>('/auth/google/url/', undefined, { skipAuth: true });
  },

  /**
   * Handle Google OAuth callback
   * 處理 Google OAuth 回調
   */
  googleCallback: async (data: GoogleCallbackRequest): Promise<TokenResponse> => {
    const response = await typedApi.post<TokenResponse>(
      '/auth/google/callback/',
      data,
      { skipAuth: true }
    );
    typedApi.setTokens(response.access, response.refresh);
    return response;
  },

  /**
   * Get current authenticated user
   * 獲取當前認證用戶
   */
  getCurrentUser: async (): Promise<User> => {
    return typedApi.get<User>('/users/me/');
  },

  /**
   * Check if user is authenticated
   * 檢查用戶是否已認證
   */
  isAuthenticated: (): boolean => {
    return typedApi.isAuthenticated();
  },

  /**
   * Get current access token
   * 獲取當前 access token
   */
  getAccessToken: (): string | null => {
    return typedApi.getAccessToken();
  },

  /**
   * Set tokens manually (e.g., from OAuth flow)
   * 手動設置 token（例如從 OAuth 流程）
   */
  setTokens: (access: string, refresh: string): void => {
    typedApi.setTokens(access, refresh);
  },
};

export default authApi;
