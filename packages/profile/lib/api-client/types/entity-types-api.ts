import { BaseAPIClient } from "../base-api-client.ts";

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

export class EntityTypesAPIClient extends BaseAPIClient {
  private baseUrl = "/api/v1/admin/entity-types";

  async getAllEntityTypes(): Promise<EntityType[]> {
    const response = await this.get<{ data: EntityType[] }>(this.baseUrl);
    return response.data;
  }

  async getEntityType(id: string): Promise<EntityType> {
    const response = await this.get<{ data: EntityType }>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getEntitySubTypes(entityTypeId: string): Promise<EntitySubType[]> {
    const response = await this.get<{ data: EntitySubType[] }>(
      `${this.baseUrl}/${entityTypeId}/sub-types`,
    );
    return response.data;
  }
}
