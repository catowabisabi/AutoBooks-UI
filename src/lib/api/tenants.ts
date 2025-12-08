/**
 * Tenants API - 租戶 API
 * Multi-tenant management endpoints with full type safety
 */

import { typedApi } from './client';
import type {
  Tenant,
  TenantListItem,
  TenantCreateRequest,
  TenantMembership,
  TenantInvitation,
  InviteUserRequest,
  TenantRole,
  PaginatedResponse,
  ListParams,
} from './types';

export const tenantsApi = {
  // ---------------------------------------------------------------
  // Tenant CRUD / 租戶 CRUD
  // ---------------------------------------------------------------

  /**
   * List all tenants for current user
   * 列出當前用戶的所有租戶
   */
  list: async (params?: ListParams): Promise<PaginatedResponse<TenantListItem>> => {
    return typedApi.get<PaginatedResponse<TenantListItem>>('/tenants/', params);
  },

  /**
   * Get tenant details by ID
   * 通過 ID 獲取租戶詳情
   */
  get: async (id: string): Promise<Tenant> => {
    return typedApi.get<Tenant>(`/tenants/${id}/`);
  },

  /**
   * Get tenant by slug
   * 通過 slug 獲取租戶
   */
  getBySlug: async (slug: string): Promise<Tenant> => {
    return typedApi.get<Tenant>(`/tenants/by-slug/${slug}/`);
  },

  /**
   * Create a new tenant
   * 創建新租戶
   */
  create: async (data: TenantCreateRequest): Promise<Tenant> => {
    return typedApi.post<Tenant>('/tenants/', data);
  },

  /**
   * Update tenant
   * 更新租戶
   */
  update: async (id: string, data: Partial<Tenant>): Promise<Tenant> => {
    return typedApi.patch<Tenant>(`/tenants/${id}/`, data);
  },

  /**
   * Delete tenant
   * 刪除租戶
   */
  delete: async (id: string): Promise<void> => {
    return typedApi.delete(`/tenants/${id}/`);
  },

  /**
   * Get current active tenant
   * 獲取當前活動租戶
   */
  getCurrent: async (): Promise<Tenant> => {
    return typedApi.get<Tenant>('/tenants/current/');
  },

  /**
   * Switch to a different tenant
   * 切換到不同的租戶
   */
  switchTo: async (id: string): Promise<{ message: string }> => {
    return typedApi.post<{ message: string }>(`/tenants/${id}/switch/`);
  },

  // ---------------------------------------------------------------
  // Members / 成員
  // ---------------------------------------------------------------

  /**
   * List tenant members
   * 列出租戶成員
   */
  listMembers: async (tenantId: string, params?: ListParams): Promise<PaginatedResponse<TenantMembership>> => {
    return typedApi.get<PaginatedResponse<TenantMembership>>(
      `/tenants/${tenantId}/members/`,
      params
    );
  },

  /**
   * Get member details
   * 獲取成員詳情
   */
  getMember: async (tenantId: string, memberId: string): Promise<TenantMembership> => {
    return typedApi.get<TenantMembership>(`/tenants/${tenantId}/members/${memberId}/`);
  },

  /**
   * Update member role
   * 更新成員角色
   */
  updateMemberRole: async (
    tenantId: string,
    memberId: string,
    role: TenantRole
  ): Promise<TenantMembership> => {
    return typedApi.patch<TenantMembership>(
      `/tenants/${tenantId}/members/${memberId}/`,
      { role }
    );
  },

  /**
   * Remove member from tenant
   * 從租戶移除成員
   */
  removeMember: async (tenantId: string, memberId: string): Promise<void> => {
    return typedApi.delete(`/tenants/${tenantId}/members/${memberId}/`);
  },

  /**
   * Leave tenant (for current user)
   * 離開租戶（當前用戶）
   */
  leave: async (tenantId: string): Promise<void> => {
    return typedApi.post<void>(`/tenants/${tenantId}/leave/`);
  },

  // ---------------------------------------------------------------
  // Invitations / 邀請
  // ---------------------------------------------------------------

  /**
   * List pending invitations
   * 列出待處理的邀請
   */
  listInvitations: async (tenantId: string, params?: ListParams): Promise<PaginatedResponse<TenantInvitation>> => {
    return typedApi.get<PaginatedResponse<TenantInvitation>>(
      `/tenants/${tenantId}/invitations/`,
      params
    );
  },

  /**
   * Invite a user to tenant
   * 邀請用戶加入租戶
   */
  inviteUser: async (tenantId: string, data: InviteUserRequest): Promise<TenantInvitation> => {
    return typedApi.post<TenantInvitation>(`/tenants/${tenantId}/invitations/`, data);
  },

  /**
   * Cancel an invitation
   * 取消邀請
   */
  cancelInvitation: async (tenantId: string, invitationId: string): Promise<void> => {
    return typedApi.delete(`/tenants/${tenantId}/invitations/${invitationId}/`);
  },

  /**
   * Resend an invitation
   * 重新發送邀請
   */
  resendInvitation: async (tenantId: string, invitationId: string): Promise<TenantInvitation> => {
    return typedApi.post<TenantInvitation>(
      `/tenants/${tenantId}/invitations/${invitationId}/resend/`
    );
  },

  /**
   * Accept an invitation (for invited user)
   * 接受邀請（被邀請用戶）
   */
  acceptInvitation: async (token: string): Promise<TenantMembership> => {
    return typedApi.post<TenantMembership>('/tenants/invitations/accept/', { token });
  },

  /**
   * Get invitation details by token
   * 通過 token 獲取邀請詳情
   */
  getInvitationByToken: async (token: string): Promise<TenantInvitation> => {
    return typedApi.get<TenantInvitation>(
      `/tenants/invitations/by-token/${token}/`,
      undefined,
      { skipAuth: true }
    );
  },
};

export default tenantsApi;
