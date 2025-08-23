import { Product } from "@suppers/shared";

// Re-export database type as primary type
export type { Product };

// Legacy type alias removed - use Product directly

export type IProductRestrictions = string[];

export enum PurchaseDataType {
  booking = "booking",
  subscription = "subscription",
}

/**
 * This is the metadata for the product, it is used to store additional information about the product.
 * Usefuly to store application specific information about the product.
 */
export type ProductMetadata = Record<string, any>;

// Business logic helper functions that work with database Product type
export function createProduct(productData: Partial<Product> & { seller_id: string }): Product {
  const now = new Date().toISOString();

  return {
    id: productData.id || crypto.randomUUID(),
    name: productData.name || "",
    description: productData.description || null,
    seller_id: productData.seller_id,
    type: productData.type || "product",
    sub_type: productData.sub_type || null,
    status: productData.status || "active",
    photos: productData.photos || null,
    thumbnail_url: productData.thumbnail_url || null,
    entity_id: productData.entity_id || null,
    metadata: productData.metadata || null,
    version_id: productData.version_id || 1,
    created_at: productData.created_at || now,
    updated_at: productData.updated_at || now,
    // Initialize filter fields to null
    filter_boolean_1: productData.filter_boolean_1 || null,
    filter_boolean_2: productData.filter_boolean_2 || null,
    filter_boolean_3: productData.filter_boolean_3 || null,
    filter_boolean_4: productData.filter_boolean_4 || null,
    filter_boolean_5: productData.filter_boolean_5 || null,
    filter_date_1: productData.filter_date_1 || null,
    filter_date_2: productData.filter_date_2 || null,
    filter_date_3: productData.filter_date_3 || null,
    filter_date_4: productData.filter_date_4 || null,
    filter_date_5: productData.filter_date_5 || null,
    filter_numeric_1: productData.filter_numeric_1 || null,
    filter_numeric_2: productData.filter_numeric_2 || null,
    filter_numeric_3: productData.filter_numeric_3 || null,
    filter_numeric_4: productData.filter_numeric_4 || null,
    filter_numeric_5: productData.filter_numeric_5 || null,
    filter_text_1: productData.filter_text_1 || null,
    filter_text_2: productData.filter_text_2 || null,
    filter_text_3: productData.filter_text_3 || null,
    filter_text_4: productData.filter_text_4 || null,
    filter_text_5: productData.filter_text_5 || null,
    likes_count: productData.likes_count || null,
    views_count: productData.views_count || null,
  };
}

// Helper functions for product metadata
export function getProductMetadata(product: Product): ProductMetadata {
  if (!product.metadata || typeof product.metadata !== "object") return {};
  return product.metadata as ProductMetadata;
}

export function setProductMetadata(product: Product, metadata: ProductMetadata): Product {
  return { ...product, metadata: metadata as any };
}
