import { Entity, Variable } from "@suppers/shared";
import { IPhoto } from "./photo.ts";

// Re-export database types as primary types
export type { Entity, Variable };

// Keep enum for business logic compatibility
export enum EntityVariableType {
  text = "text",
  number = "number",
  boolean = "boolean",
  json = "json",
}

// Business logic helper functions that work with database Entity type
export function createEntity(entityData: Partial<Entity> & { owner_id: string }): Entity {
  const now = new Date().toISOString();

  return {
    id: entityData.id || crypto.randomUUID(),
    name: entityData.name || "",
    description: entityData.description || null,
    owner_id: entityData.owner_id,
    type: entityData.type || "generic",
    sub_type: entityData.sub_type || null,
    status: entityData.status || "active",
    verified: entityData.verified ?? true,
    photos: entityData.photos || null,
    connected_application_ids: entityData.connected_application_ids || null,
    location: entityData.location || null,
    metadata: entityData.metadata || null,
    version_id: entityData.version_id || 1,
    created_at: entityData.created_at || now,
    updated_at: entityData.updated_at || now,
    // Initialize filter fields to null
    filter_boolean_1: entityData.filter_boolean_1 || null,
    filter_boolean_2: entityData.filter_boolean_2 || null,
    filter_boolean_3: entityData.filter_boolean_3 || null,
    filter_boolean_4: entityData.filter_boolean_4 || null,
    filter_boolean_5: entityData.filter_boolean_5 || null,
    filter_date_1: entityData.filter_date_1 || null,
    filter_date_2: entityData.filter_date_2 || null,
    filter_date_3: entityData.filter_date_3 || null,
    filter_date_4: entityData.filter_date_4 || null,
    filter_date_5: entityData.filter_date_5 || null,
    filter_numeric_1: entityData.filter_numeric_1 || null,
    filter_numeric_2: entityData.filter_numeric_2 || null,
    filter_numeric_3: entityData.filter_numeric_3 || null,
    filter_numeric_4: entityData.filter_numeric_4 || null,
    filter_numeric_5: entityData.filter_numeric_5 || null,
    filter_text_1: entityData.filter_text_1 || null,
    filter_text_2: entityData.filter_text_2 || null,
    filter_text_3: entityData.filter_text_3 || null,
    filter_text_4: entityData.filter_text_4 || null,
    filter_text_5: entityData.filter_text_5 || null,
    likes_count: entityData.likes_count || null,
    views_count: entityData.views_count || null,
  };
}

// Helper functions for connected application IDs
export function getConnectedApplicationIds(entity: Entity): string[] {
  if (!entity.connected_application_ids || !Array.isArray(entity.connected_application_ids)) {
    return [];
  }
  return entity.connected_application_ids as string[];
}

export function setConnectedApplicationIds(entity: Entity, applicationIds: string[]): Entity {
  return { ...entity, connected_application_ids: applicationIds as any };
}
