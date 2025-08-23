import { BaseApiClient } from "../base-api-client.ts";
import {
  CreateEntityRequest,
  Entity,
  EntityUpdateData,
  UpdateEntityRequest,
} from "@suppers/shared";

export class EntitiesApiClient extends BaseApiClient {
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

  // Entity-Application connections
  async connectEntityToApplication(entityId: string, applicationId: string): Promise<void> {
    return await this.makeRequest<void>(`/entity/${entityId}/connect/${applicationId}`, {
      method: "POST",
    });
  }

  async disconnectEntityFromApplication(entityId: string, applicationId: string): Promise<void> {
    return await this.makeRequest<void>(`/entity/${entityId}/disconnect/${applicationId}`, {
      method: "DELETE",
    });
  }

  async getEntitiesForApplication(applicationId: string): Promise<Entity[]> {
    return await this.makeRequest<Entity[]>(`/entity/for-application/${applicationId}`);
  }

  // Entity Variables
  async getEntityVariables(entityId: string): Promise<any[]> {
    return await this.makeRequest<any[]>(`/entity/${entityId}/variables`);
  }

  async createEntityVariable(entityId: string, variable: any): Promise<any> {
    return await this.makeRequest<any>(`/entity/${entityId}/variables`, {
      method: "POST",
      body: JSON.stringify(variable),
    });
  }

  async updateEntityVariable(entityId: string, variableId: string, variable: any): Promise<any> {
    return await this.makeRequest<any>(`/entity/${entityId}/variables/${variableId}`, {
      method: "PUT",
      body: JSON.stringify(variable),
    });
  }

  async deleteEntityVariable(entityId: string, variableId: string): Promise<void> {
    return await this.makeRequest<void>(`/entity/${entityId}/variables/${variableId}`, {
      method: "DELETE",
    });
  }

  // Entity-Product relationships
  async getEntityProducts(entityId: string): Promise<any[]> {
    return await this.makeRequest<any[]>(`/entity/${entityId}/products`);
  }

  async addProductToEntity(entityId: string, productId: string): Promise<void> {
    return await this.makeRequest<void>(`/entity/${entityId}/products/${productId}`, {
      method: "POST",
    });
  }

  async removeProductFromEntity(entityId: string, productId: string): Promise<void> {
    return await this.makeRequest<void>(`/entity/${entityId}/products/${productId}`, {
      method: "DELETE",
    });
  }
}
