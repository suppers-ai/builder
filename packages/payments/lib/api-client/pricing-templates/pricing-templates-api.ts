import { BaseApiClient } from "../base-api-client.ts";
import {
  ApiResponse,
  ApplyPricingTemplateRequest,
  PricingTemplate,
  PricingTemplateListResponse,
  ProductVariablesResponse,
  SetProductVariableRequest,
  UserVariableInput,
} from "@suppers/shared";

export class PricingTemplatesApiClient extends BaseApiClient {
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
      `/admin/pricing-templates${query ? `?${query}` : ""}`,
    );
  }

  // =============================================
  // PRODUCT VARIABLE MANAGEMENT (SIMPLIFIED)
  // =============================================

  async getProductVariables(productId: string): Promise<ApiResponse<ProductVariablesResponse>> {
    return await this.makeRequest<ProductVariablesResponse>(`/products/${productId}/variables`);
  }

  async setProductVariable(
    productId: string,
    data: SetProductVariableRequest,
  ): Promise<ApiResponse<{ success: boolean }>> {
    return await this.makeRequest<{ success: boolean }>(`/products/${productId}/variables`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async applyPricingTemplate(
    productId: string,
    data: ApplyPricingTemplateRequest,
  ): Promise<ApiResponse<ProductVariablesResponse>> {
    return await this.makeRequest<ProductVariablesResponse>(
      `/products/${productId}/apply-template`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async removeProductTemplate(productId: string): Promise<ApiResponse<{ success: boolean }>> {
    return await this.makeRequest<{ success: boolean }>(`/products/${productId}/template`, {
      method: "DELETE",
    });
  }
}
