import { ApiResponse, BaseApiClient, PaginatedApiResponse } from "../base-api-client.ts";
import type {
  AdminApplication,
  ApplicationFilters,
  ApplicationStatus,
  BulkOperationResult,
  CreateApplicationData,
  UpdateApplicationData,
} from "../../../types/admin.ts";

export class ApplicationApiClient extends BaseApiClient {
  async getApplicationsFiltered(
    filters: ApplicationFilters = {},
  ): Promise<ApiResponse<PaginatedApiResponse<AdminApplication>>> {
    try {
      const queryString = this.buildQueryParams({
        status: filters.status,
        search: filters.search,
        limit: filters.limit,
        offset: filters.offset,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
      });

      const endpoint = `/applications${queryString ? `?${queryString}` : ""}`;
      return await this.makeRequest<PaginatedApiResponse<AdminApplication>>(endpoint);
    } catch (error) {
      console.error("Failed to fetch filtered applications:", error);
      return {
        error: error instanceof Error ? error.message : "Failed to fetch applications",
      };
    }
  }

  async createApplication(data: CreateApplicationData): Promise<ApiResponse<AdminApplication>> {
    return await this.makeRequest<AdminApplication>("/applications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateApplication(
    id: string,
    data: UpdateApplicationData,
  ): Promise<ApiResponse<AdminApplication>> {
    return await this.makeRequest<AdminApplication>(`/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteApplication(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return await this.makeRequest<{ success: boolean }>(`/applications/${id}`, {
      method: "DELETE",
    });
  }

  async updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
  ): Promise<ApiResponse<AdminApplication>> {
    return await this.makeRequest<AdminApplication>(`/applications/status/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async bulkUpdateApplicationStatus(
    applicationIds: string[],
    status: ApplicationStatus,
  ): Promise<ApiResponse<BulkOperationResult>> {
    return await this.makeRequest<BulkOperationResult>("/applications/bulk-status", {
      method: "PATCH",
      body: JSON.stringify({ ids: applicationIds, status }),
    });
  }
}
