import { BaseApiClient } from "../base-api-client.ts";
import { CreateProductRequest, Product, UpdateProductRequest } from "@suppers/shared";

export class ProductsApiClient extends BaseApiClient {
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
}
