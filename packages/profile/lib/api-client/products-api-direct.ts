import { BaseApiClientDirect } from "./base-api-client-direct.ts";

interface Product {
  id: string;
  entity_id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  type: string;
  sub_type?: string;
  prices?: Array<{
    id?: string;
    name: string;
    amount: number;
    currency: string;
    interval?: string;
  }>;
  status: string;
  views_count?: number;
  likes_count?: number;
  sales_count?: number;
  metadata?: Record<string, any>;
  photos?: Array<{ url: string; caption?: string }>;
  created_at?: string;
}

interface CreateProductRequest {
  entity_id: string;
  name: string;
  description?: string;
  type: string;
  sub_type?: string;
  status?: string;
  metadata?: Record<string, any>;
  prices?: Array<{
    name: string;
    amount: number;
    currency: string;
    interval?: string;
    description?: string;
  }>;
  thumbnail_url?: string;
  photos?: Array<{ url: string; caption?: string }>;
}

interface UpdateProductRequest {
  name?: string;
  description?: string;
  type?: string;
  sub_type?: string;
  status?: string;
  metadata?: Record<string, any>;
  prices?: Array<{
    id?: string;
    name: string;
    amount: number;
    currency: string;
    interval?: string;
    description?: string;
  }>;
  thumbnail_url?: string;
  photos?: Array<{ url: string; caption?: string }>;
}

export class ProductsApiClientDirect extends BaseApiClientDirect {
  // Basic CRUD operations
  async getProducts(): Promise<Product[]> {
    return await this.makeRequest<Product[]>("/product");
  }

  async getProduct(id: string): Promise<Product> {
    return await this.makeRequest<Product>(`/product/${id}`);
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    return await this.makeRequest<Product>("/product", {
      method: "POST",
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, updates: UpdateProductRequest): Promise<Product> {
    return await this.makeRequest<Product>(`/product/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return await this.makeRequest<void>(`/product/${id}`, {
      method: "DELETE",
    });
  }

  // Get products for a specific entity
  async getEntityProducts(entityId: string): Promise<Product[]> {
    return await this.makeRequest<Product[]>(`/product?entity_id=${entityId}`);
  }
}