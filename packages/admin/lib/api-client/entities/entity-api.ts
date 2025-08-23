import { ApiResponse, BaseApiClient } from "../base-api-client.ts";
import { Entity, EntityStatus } from "@suppers/shared";

export interface AdminEntity extends Entity {
  created_at: string;
  updated_at: string;
  owner_email?: string;
}

export class EntityApiClient extends BaseApiClient {
  async getEntities(): Promise<ApiResponse<AdminEntity[]>> {
    return await this.makeRequest<AdminEntity[]>("/entities");
  }

  async getEntity(id: string): Promise<ApiResponse<AdminEntity>> {
    return await this.makeRequest<AdminEntity>(`/entities/${id}`);
  }

  async updateEntityStatus(
    id: string,
    status: EntityStatus,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.makeRequest(`/entities/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update entity status",
      };
    }
  }

  async deleteEntity(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.makeRequest(`/entities/${id}`, {
        method: "DELETE",
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete entity",
      };
    }
  }
}
