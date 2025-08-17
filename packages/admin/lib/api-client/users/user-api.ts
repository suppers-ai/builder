import { BaseApiClient, ApiResponse } from "../base-api-client.ts";
import type {
  UserRole,
  UserFilters,
  AdminUser,
  UserStatus,
  UserActivity,
  UserStorageDetails,
  UserStatistics,
  BulkOperationResult,
  AdminApplication,
} from "../../../types/admin.ts";

export class UserApiClient extends BaseApiClient {
  async getUsersFiltered(filters: UserFilters = {}): Promise<ApiResponse<AdminUser[]>> {
    try {
      const queryString = this.buildQueryParams({
        role: filters.role,
        status: filters.status,
        search: filters.search,
        limit: filters.limit,
        offset: filters.offset,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
      });

      const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
      const response = await this.makeRequest<{ users: AdminUser[], pagination: any }>(endpoint);
      
      // Extract users array from the wrapped response
      if (response.data) {
        return { data: response.data.users };
      }
      
      return response as ApiResponse<AdminUser[]>;
    } catch (error) {
      console.error("Failed to fetch filtered users:", error);
      return { 
        error: error instanceof Error ? error.message : "Failed to fetch users" 
      };
    }
  }

  async getUserById(id: string): Promise<ApiResponse<AdminUser>> {
    return await this.makeRequest<AdminUser>(`/users/${id}`);
  }

  async searchUsers(query: string, limit: number = 20): Promise<ApiResponse<AdminUser[]>> {
    const queryString = this.buildQueryParams({ search: query, limit });
    return await this.makeRequest<AdminUser[]>(`/users/search?${queryString}`);
  }

  async updateUserStatus(id: string, status: UserStatus): Promise<ApiResponse<AdminUser>> {
    return await this.makeRequest<AdminUser>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateUserRole(id: string, role: UserRole): Promise<ApiResponse<AdminUser>> {
    return await this.makeRequest<AdminUser>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async getUserActivity(userId: string, limit: number = 50): Promise<ApiResponse<UserActivity[]>> {
    const queryString = this.buildQueryParams({ limit });
    return await this.makeRequest<UserActivity[]>(`/users/${userId}/activity?${queryString}`);
  }

  async getUserApplications(userId: string): Promise<ApiResponse<AdminApplication[]>> {
    return await this.makeRequest<AdminApplication[]>(`/users/${userId}/applications`);
  }

  async getUserStorageDetails(userId: string): Promise<ApiResponse<UserStorageDetails>> {
    return await this.makeRequest<UserStorageDetails>(`/users/${userId}/storage`);
  }

  async updateUserStorageLimits(
    userId: string, 
    limits: { storageLimit?: number; bandwidthLimit?: number }
  ): Promise<ApiResponse<AdminUser>> {
    return await this.makeRequest<AdminUser>(`/users/${userId}/limits`, {
      method: 'PATCH',
      body: JSON.stringify(limits),
    });
  }

  async getUserStatistics(): Promise<ApiResponse<UserStatistics>> {
    return await this.makeRequest<UserStatistics>('/users/statistics');
  }

  async bulkUpdateUserStatus(
    userIds: string[], 
    status: UserStatus
  ): Promise<ApiResponse<BulkOperationResult>> {
    return await this.makeRequest<BulkOperationResult>('/users/bulk-status', {
      method: 'PATCH',
      body: JSON.stringify({ user_ids: userIds, status }),
    });
  }

  async exportUserData(filters: UserFilters = {}): Promise<ApiResponse<{ downloadUrl: string }>> {
    const queryString = this.buildQueryParams({
      role: filters.role,
      status: filters.status,
      search: filters.search,
    });

    const endpoint = `/users/export${queryString ? `?${queryString}` : ''}`;
    return await this.makeRequest<{ downloadUrl: string }>(endpoint, {
      method: 'POST',
    });
  }
}