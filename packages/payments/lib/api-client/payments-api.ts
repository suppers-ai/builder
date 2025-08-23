import { OAuthAuthClient } from "@suppers/auth-client";
import { EntitiesApiClient } from "./places/entities-api.ts";
import { ProductsApiClient } from "./products/products-api.ts";
import { PurchasesApiClient } from "./purchases/purchases-api.ts";
import { PricingApiClient } from "./pricing/pricing-api.ts";

export class PaymentsApiClient {
  public entities: EntitiesApiClient;
  public products: ProductsApiClient;
  public purchases: PurchasesApiClient;
  public pricing: PricingApiClient;

  constructor(authClient: OAuthAuthClient) {
    this.entities = new EntitiesApiClient(authClient);
    this.products = new ProductsApiClient(authClient);
    this.purchases = new PurchasesApiClient(authClient);
    this.pricing = new PricingApiClient(authClient);
  }
}

// Export all the individual clients and types as well
export { EntitiesApiClient } from "./places/entities-api.ts";
export { ProductsApiClient } from "./products/products-api.ts";
export { type Purchase, PurchasesApiClient } from "./purchases/purchases-api.ts";
export { PricingApiClient } from "./pricing/pricing-api.ts";
export { type ApiResponse, BaseApiClient, type PaginatedApiResponse } from "./base-api-client.ts";
