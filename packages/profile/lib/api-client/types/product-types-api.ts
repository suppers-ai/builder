import { BaseAPIClient } from "../base-api-client.ts";

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

export class ProductTypesAPIClient extends BaseAPIClient {
  private baseUrl = "/api/v1/admin/product-types";

  async getAllProductTypes(): Promise<ProductType[]> {
    const response = await this.get<{ data: ProductType[] }>(this.baseUrl);
    return response.data;
  }

  async getProductType(id: string): Promise<ProductType> {
    const response = await this.get<{ data: ProductType }>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getProductSubTypes(productTypeId: string): Promise<ProductSubType[]> {
    const response = await this.get<{ data: ProductSubType[] }>(
      `${this.baseUrl}/${productTypeId}/sub-types`,
    );
    return response.data;
  }
}
