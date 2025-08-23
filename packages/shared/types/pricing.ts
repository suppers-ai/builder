export interface CreatePricingProductRequest {
  description?: string | null;
  name: string;
}

export interface UpdatePricingProductRequest {
  name?: string;
  description?: string | null;
}
