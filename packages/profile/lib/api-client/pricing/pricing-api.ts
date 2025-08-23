import { BaseApiClient } from "../base-api-client.ts";
import {
  CreatePricingProductRequest,
  PricingProduct,
  UpdatePricingProductRequest,
} from "@suppers/shared";

export class PricingApiClient extends BaseApiClient {
  // Get all pricing products
  async getPricingProducts(): Promise<PricingProduct[]> {
    return await this.makeRequest<PricingProduct[]>("/price");
  }

  // Get specific pricing product
  async getPricingProduct(id: string): Promise<PricingProduct> {
    return await this.makeRequest<PricingProduct>(`/price/${id}`);
  }

  // Create new pricing product
  async createPricingProduct(data: CreatePricingProductRequest): Promise<PricingProduct> {
    return await this.makeRequest<PricingProduct>("/price", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Update pricing product
  async updatePricingProduct(
    id: string,
    data: UpdatePricingProductRequest,
  ): Promise<PricingProduct> {
    return await this.makeRequest<PricingProduct>(`/price/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Delete pricing product
  async deletePricingProduct(id: string): Promise<void> {
    return await this.makeRequest<void>(`/price/${id}`, {
      method: "DELETE",
    });
  }

  // Get pricing products with admin privileges (if user is admin)
  async getAdminPricingProducts(): Promise<PricingProduct[]> {
    return await this.makeRequest<PricingProduct[]>("/price?admin=true");
  }

  // Delete pricing product with admin privileges (if user is admin)
  async deleteAdminPricingProduct(id: string): Promise<void> {
    return await this.makeRequest<void>(`/price/${id}?admin=true`, {
      method: "DELETE",
    });
  }
}
