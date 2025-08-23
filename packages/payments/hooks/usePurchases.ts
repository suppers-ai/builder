import { useEffect, useState } from "preact/hooks";
import { useApi } from "./useApi.ts";
import { type Purchase } from "../lib/api-client/purchases/purchases-api.ts";

export function usePurchases() {
  const { apiClient, loading: apiLoading } = useApi();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.purchases.getPurchases();
      setPurchases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch purchases");
      console.error("Error fetching purchases:", err);
    } finally {
      setLoading(false);
    }
  };

  const createPurchase = async (
    purchaseData: Omit<Purchase, "id" | "created_at" | "updated_at">,
  ) => {
    if (!apiClient) throw new Error("API client not available");

    try {
      setError(null);
      const newPurchase = await apiClient.purchases.createPurchase(purchaseData);
      await fetchPurchases(); // Refresh the list
      return newPurchase;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create purchase");
      throw err;
    }
  };

  const updatePurchase = async (id: string, purchaseData: Partial<Purchase>) => {
    if (!apiClient) throw new Error("API client not available");

    try {
      setError(null);
      const updatedPurchase = await apiClient.purchases.updatePurchase(id, purchaseData);
      await fetchPurchases(); // Refresh the list
      return updatedPurchase;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update purchase");
      throw err;
    }
  };

  useEffect(() => {
    if (apiClient && !apiLoading) {
      fetchPurchases();
    }
  }, [apiClient, apiLoading]);

  return {
    purchases,
    loading,
    error,
    fetchPurchases,
    createPurchase,
    updatePurchase,
  };
}
