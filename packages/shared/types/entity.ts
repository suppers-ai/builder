export interface CreateEntityRequest {
  name: string;
  description?: string;
  type: string;
  sub_type?: string;
  photos?: string[];
  metadata?: Record<string, any>;
  location?: { latitude: number; longitude: number };
  status?: string;
  connected_application_ids?: string[];
}

export interface UpdateEntityRequest {
  name?: string;
  description?: string;
  type?: string;
  sub_type?: string;
  photos?: string[];
  metadata?: Record<string, any>;
  location?: { latitude: number; longitude: number };
  status?: string;
  connected_application_ids?: string[];
}

export enum EntityStatus {
  active = "active",
  pending = "pending",
  deleted = "deleted",
}
