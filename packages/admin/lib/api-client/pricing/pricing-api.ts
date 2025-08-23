import { ApiResponse, BaseApiClient } from "../base-api-client.ts";
import {
  AdminPricingProduct,
  CreateVariableDefinitionRequest,
  GlobalVariableDefinition,
  PricingTemplate,
  PricingTemplateListResponse,
  UpdateVariableDefinitionRequest,
  VariableDefinitionListResponse,
} from "@suppers/shared";

export class AdminPricingApiClient extends BaseApiClient {
  // =============================================
  // PRICING PRODUCTS MANAGEMENT
  // =============================================

  async getPricingProducts(params?: {
    category?: string;
    is_template?: boolean;
  }): Promise<ApiResponse<{ pricing_products: AdminPricingProduct[]; total: number }>> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.is_template !== undefined) {
      searchParams.set("is_template", params.is_template.toString());
    }

    const query = searchParams.toString();
    return await this.makeRequest<{ pricing_products: AdminPricingProduct[]; total: number }>(
      `/pricing-products${query ? `?${query}` : ""}`,
    );
  }

  async createPricingProduct(data: {
    name: string;
    description: string;
    template_category?: string;
    variable_ids?: string[];
  }): Promise<ApiResponse<AdminPricingProduct>> {
    return await this.makeRequest<AdminPricingProduct>("/pricing-products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePricingProduct(
    id: string,
    data: {
      name?: string;
      description?: string;
      template_category?: string;
      variable_ids?: string[];
    },
  ): Promise<ApiResponse<AdminPricingProduct>> {
    return await this.makeRequest<AdminPricingProduct>(`/pricing-products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePricingProduct(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return await this.makeRequest<{ success: boolean }>(`/pricing-products/${id}`, {
      method: "DELETE",
    });
  }

  async clonePricingProduct(
    id: string,
    data: { name: string },
  ): Promise<ApiResponse<AdminPricingProduct>> {
    return await this.makeRequest<AdminPricingProduct>(`/pricing-products/${id}/clone`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // =============================================
  // VARIABLE DEFINITIONS MANAGEMENT
  // =============================================

  async getVariableDefinitions(params?: {
    category?: string;
  }): Promise<ApiResponse<VariableDefinitionListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);

    const query = searchParams.toString();
    return await this.makeRequest<VariableDefinitionListResponse>(
      `/variable-definitions${query ? `?${query}` : ""}`,
    );
  }

  async createVariableDefinition(
    data: CreateVariableDefinitionRequest,
  ): Promise<ApiResponse<GlobalVariableDefinition>> {
    return await this.makeRequest<GlobalVariableDefinition>("/variable-definitions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateVariableDefinition(
    id: string,
    data: UpdateVariableDefinitionRequest,
  ): Promise<ApiResponse<GlobalVariableDefinition>> {
    return await this.makeRequest<GlobalVariableDefinition>(`/variable-definitions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteVariableDefinition(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return await this.makeRequest<{ success: boolean }>(`/variable-definitions/${id}`, {
      method: "DELETE",
    });
  }

  // =============================================
  // PRICING TEMPLATES (FOR USER SELECTION)
  // =============================================

  async getPricingTemplates(params?: {
    category?: string;
  }): Promise<ApiResponse<PricingTemplateListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);

    const query = searchParams.toString();
    return await this.makeRequest<PricingTemplateListResponse>(
      `/pricing-templates${query ? `?${query}` : ""}`,
    );
  }
}
