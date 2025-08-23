import { ApiResponse, BaseApiClient } from "../base-api-client.ts";
import { OAuthAuthClient } from "@suppers/auth-client";

export interface ProductType {
  id: string;
  name: string;
  description: string;
  metadata_schema: any;
  filter_config: any;
  created_at: string;
  updated_at: string;
  product_sub_types?: ProductSubType[];
}

export interface ProductSubType {
  id: string;
  product_type_id: string;
  name: string;
  description: string;
  metadata_schema: any;
  filter_config: any;
  created_at: string;
  updated_at: string;
}

export interface CreateProductTypeRequest {
  name: string;
  description?: string;
  metadata_schema?: any;
  filter_config?: any;
}

export interface CreateProductSubTypeRequest {
  name: string;
  description?: string;
  metadata_schema?: any;
  filter_config?: any;
}

export class ProductTypeAPIClient extends BaseApiClient {
  private adminBaseUrl = "/product-types";

  constructor(authClient: OAuthAuthClient) {
    super(authClient);
  }

  async getAllProductTypes(): Promise<ApiResponse<ProductType[]>> {
    return await this.makeRequest<ProductType[]>(this.adminBaseUrl);
  }

  async getProductType(id: string): Promise<ApiResponse<ProductType>> {
    return await this.makeRequest<ProductType>(`${this.adminBaseUrl}/${id}`);
  }

  async createProductType(
    productType: CreateProductTypeRequest,
  ): Promise<{ success: boolean; data?: ProductType; error?: string }> {
    try {
      const result = await this.makeRequest<ProductType>(this.adminBaseUrl, {
        method: "POST",
        body: JSON.stringify(productType),
      });
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create product type",
      };
    }
  }

  async updateProductType(
    id: string,
    productType: Partial<CreateProductTypeRequest>,
  ): Promise<{ success: boolean; data?: ProductType; error?: string }> {
    try {
      const result = await this.makeRequest<ProductType>(`${this.adminBaseUrl}/${id}`, {
        method: "PUT",
        body: JSON.stringify(productType),
      });
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update product type",
      };
    }
  }

  async deleteProductType(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.makeRequest(`${this.adminBaseUrl}/${id}`, {
        method: "DELETE",
      });
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete product type",
      };
    }
  }

  async getProductSubTypes(productTypeId: string): Promise<ApiResponse<ProductSubType[]>> {
    return await this.makeRequest<ProductSubType[]>(
      `${this.adminBaseUrl}/${productTypeId}/sub-types`,
    );
  }

  async createProductSubType(
    productTypeId: string,
    subType: CreateProductSubTypeRequest,
  ): Promise<{ success: boolean; data?: ProductSubType; error?: string }> {
    try {
      const result = await this.makeRequest<ProductSubType>(
        `${this.adminBaseUrl}/${productTypeId}/sub-types`,
        {
          method: "POST",
          body: JSON.stringify(subType),
        },
      );
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create product sub-type",
      };
    }
  }

  async updateProductSubType(
    productTypeId: string,
    subTypeId: string,
    subType: Partial<CreateProductSubTypeRequest>,
  ): Promise<{ success: boolean; data?: ProductSubType; error?: string }> {
    try {
      const result = await this.makeRequest<ProductSubType>(
        `${this.adminBaseUrl}/${productTypeId}/sub-types/${subTypeId}`,
        {
          method: "PUT",
          body: JSON.stringify(subType),
        },
      );
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update product sub-type",
      };
    }
  }

  async deleteProductSubType(
    productTypeId: string,
    subTypeId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.makeRequest(
        `${this.adminBaseUrl}/${productTypeId}/sub-types/${subTypeId}`,
        {
          method: "DELETE",
        },
      );
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete product sub-type",
      };
    }
  }
}
