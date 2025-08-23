import { BaseApiClientDirect } from "./base-api-client-direct.ts";

interface Entity {
  id: string;
  name: string;
  description?: string;
  type: string;
  sub_type?: string;
  photos?: Array<{ url: string; caption?: string }>;
  status: string;
  metadata?: Record<string, any>;
  location?: { latitude: number; longitude: number };
  views_count?: number;
  likes_count?: number;
  products_count?: number;
  created_at: string;
}

interface CreateEntityRequest {
  name: string;
  description?: string;
  type: string;
  sub_type?: string;
  status?: string;
  metadata?: Record<string, any>;
  photos?: Array<{ url: string; caption?: string }>;
  location?: { latitude: number; longitude: number };
}

interface UpdateEntityRequest {
  name?: string;
  description?: string;
  type?: string;
  sub_type?: string;
  status?: string;
  metadata?: Record<string, any>;
  photos?: Array<{ url: string; caption?: string }>;
  location?: { latitude: number; longitude: number };
}

export class EntitiesApiClientDirect extends BaseApiClientDirect {
  // Basic CRUD operations
  async getEntities(): Promise<Entity[]> {
    return await this.makeRequest<Entity[]>("/entity");
  }

  async getEntity(id: string): Promise<Entity> {
    return await this.makeRequest<Entity>(`/entity/${id}`);
  }

  async createEntity(entity: CreateEntityRequest): Promise<Entity> {
    return await this.makeRequest<Entity>("/entity", {
      method: "POST",
      body: JSON.stringify(entity),
    });
  }

  async updateEntity(id: string, updates: UpdateEntityRequest): Promise<Entity> {
    return await this.makeRequest<Entity>(`/entity/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteEntity(id: string): Promise<void> {
    return await this.makeRequest<void>(`/entity/${id}`, {
      method: "DELETE",
    });
  }

  // Get products for an entity
  async getEntityProducts(entityId: string): Promise<any[]> {
    return await this.makeRequest<any[]>(`/entity/${entityId}/products`);
  }
}