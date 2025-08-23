import { Place, PlaceVariable } from "@suppers/shared";
import { IPhoto } from "./photo.ts";

// Re-export database types as primary types
export type { Place, PlaceVariable };

// Legacy type aliases removed - use Place and PlaceVariable directly

// Keep enum for business logic compatibility
export enum PlaceVariableType {
  text = "text",
  number = "number",
  boolean = "boolean",
  json = "json",
}

// Business logic helper functions that work with database Place type
export function createPlace(placeData: Partial<Place> & { owner_id: string }): Place {
  const now = new Date().toISOString();

  return {
    id: placeData.id || crypto.randomUUID(),
    name: placeData.name || "",
    description: placeData.description || null,
    owner_id: placeData.owner_id,
    status: placeData.status || "active",
    verified: placeData.verified ?? true,
    tags: placeData.tags || null,
    photos: placeData.photos || null,
    connected_application_ids: placeData.connected_application_ids || null,
    version_id: placeData.version_id || 1,
    created_at: placeData.created_at || now,
    updated_at: placeData.updated_at || now,
  };
}

// Helper functions to work with Place tags (since they're stored as Json)
export function getPlaceTags(place: Place): Record<string, boolean> {
  if (!place.tags || typeof place.tags !== "object") return {};
  return place.tags as Record<string, boolean>;
}

export function setPlaceTags(place: Place, tags: Record<string, boolean>): Place {
  return { ...place, tags: tags as any };
}

// Helper functions for connected application IDs
export function getConnectedApplicationIds(place: Place): string[] {
  if (!place.connected_application_ids || !Array.isArray(place.connected_application_ids)) {
    return [];
  }
  return place.connected_application_ids as string[];
}

export function setConnectedApplicationIds(place: Place, applicationIds: string[]): Place {
  return { ...place, connected_application_ids: applicationIds as any };
}
