import { ApiResponse, BaseApiClient } from "../base-api-client.ts";
import { OAuthAuthClient } from "@suppers/auth-client";

export interface EntityType {
  id: string;
  name: string;
  description: string;
  metadata_schema: any;
  filter_config: any;
  location_required: boolean;
  created_at: string;
  updated_at: string;
  entity_sub_types?: EntitySubType[];
}

export interface EntitySubType {
  id: string;
  entity_type_id: string;
  name: string;
  description: string;
  metadata_schema: any;
  filter_config: any;
  created_at: string;
  updated_at: string;
}

export interface CreateEntityTypeRequest {
  name: string;
  description?: string;
  metadata_schema?: any;
  filter_config?: any;
  location_required?: boolean;
}

export interface CreateEntitySubTypeRequest {
  name: string;
  description?: string;
  metadata_schema?: any;
  filter_config?: any;
}

export class EntityTypeAPIClient extends BaseApiClient {
  private adminBaseUrl = "/entity-types";

  constructor(authClient: OAuthAuthClient) {
    super(authClient);
  }

  async getAllEntityTypes(): Promise<ApiResponse<EntityType[]>> {
    return await this.makeRequest<EntityType[]>(this.adminBaseUrl);
  }

  async getEntityType(id: string): Promise<ApiResponse<EntityType>> {
    return await this.makeRequest<EntityType>(`${this.adminBaseUrl}/${id}`);
  }

  async createEntityType(
    entityType: CreateEntityTypeRequest,
  ): Promise<{ success: boolean; data?: EntityType; error?: string }> {
    try {
      const result = await this.makeRequest<EntityType>(this.adminBaseUrl, {
        method: "POST",
        body: JSON.stringify(entityType),
      });
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create entity type",
      };
    }
  }

  async updateEntityType(
    id: string,
    entityType: Partial<CreateEntityTypeRequest>,
  ): Promise<{ success: boolean; data?: EntityType; error?: string }> {
    try {
      const result = await this.makeRequest<EntityType>(`${this.adminBaseUrl}/${id}`, {
        method: "PUT",
        body: JSON.stringify(entityType),
      });
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update entity type",
      };
    }
  }

  async deleteEntityType(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.makeRequest(`${this.adminBaseUrl}/${id}`, {
        method: "DELETE",
      });
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete entity type",
      };
    }
  }

  async getEntitySubTypes(entityTypeId: string): Promise<ApiResponse<EntitySubType[]>> {
    return await this.makeRequest<EntitySubType[]>(
      `${this.adminBaseUrl}/${entityTypeId}/sub-types`,
    );
  }

  async createEntitySubType(
    entityTypeId: string,
    subType: CreateEntitySubTypeRequest,
  ): Promise<{ success: boolean; data?: EntitySubType; error?: string }> {
    try {
      const result = await this.makeRequest<EntitySubType>(
        `${this.adminBaseUrl}/${entityTypeId}/sub-types`,
        {
          method: "POST",
          body: JSON.stringify(subType),
        },
      );
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create entity sub-type",
      };
    }
  }

  async updateEntitySubType(
    entityTypeId: string,
    subTypeId: string,
    subType: Partial<CreateEntitySubTypeRequest>,
  ): Promise<{ success: boolean; data?: EntitySubType; error?: string }> {
    try {
      const result = await this.makeRequest<EntitySubType>(
        `${this.adminBaseUrl}/${entityTypeId}/sub-types/${subTypeId}`,
        {
          method: "PUT",
          body: JSON.stringify(subType),
        },
      );
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update entity sub-type",
      };
    }
  }

  async deleteEntitySubType(
    entityTypeId: string,
    subTypeId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.makeRequest(
        `${this.adminBaseUrl}/${entityTypeId}/sub-types/${subTypeId}`,
        {
          method: "DELETE",
        },
      );
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete entity sub-type",
      };
    }
  }
}
