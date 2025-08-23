import { BaseApiClient } from "../base-api-client.ts";

export interface Purchase {
  id: string;
  user_id: string;
  product_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at?: string;
  [key: string]: any;
}

export class PurchasesApiClient extends BaseApiClient {
  async getPurchases(): Promise<Purchase[]> {
    return await this.makeRequest<Purchase[]>("/purchase");
  }

  async getPurchase(id: string): Promise<Purchase> {
    return await this.makeRequest<Purchase>(`/purchase/${id}`);
  }

  async createPurchase(
    purchase: Omit<Purchase, "id" | "created_at" | "updated_at">,
  ): Promise<Purchase> {
    return await this.makeRequest<Purchase>("/purchase", {
      method: "POST",
      body: JSON.stringify(purchase),
    });
  }

  async updatePurchase(id: string, updates: Partial<Purchase>): Promise<Purchase> {
    return await this.makeRequest<Purchase>(`/purchase/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }
}
