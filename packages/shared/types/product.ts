export interface CreateProductRequest {
  seller_id?: string;
  entity_id?: string | null;
  name: string;
  description?: string | null;
  thumbnail_url?: string | null;
  photos?: string[] | null;
  tags?: string[] | null;
  type?: string | null;
  metadata?: Record<string, any> | null;
  status?: string | null;
}

export interface UpdateProductRequest {
  seller_id?: string;
  entity_id?: string | null;
  name?: string;
  description?: string | null;
  thumbnail_url?: string | null;
  photos?: string[] | null;
  tags?: string[] | null;
  type?: string | null;
  metadata?: Record<string, any> | null;
  status?: string | null;
}

export enum ProductType {
  application = "application",
  system = "system",
}
