import { useEffect, useState } from "preact/hooks";
import { useApi } from "./useApi.ts";
import { CreateProductRequest, Product, UpdateProductRequest } from "@suppers/shared";

export function useSystemProducts() {
  const { apiClient, loading: apiLoading } = useApi();
  const [systemProducts, setSystemProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemProducts = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.products.getSystemProducts();
      setSystemProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch system products");
      console.error("Error fetching system products:", err);
    } finally {
      setLoading(false);
    }
  };

  const createSystemProduct = async (systemProductData: CreateProductRequest) => {
    if (!apiClient) throw new Error("API client not available");

    try {
      setError(null);
      const newSystemProduct = await apiClient.products.createSystemProduct(systemProductData);
      await fetchSystemProducts(); // Refresh the list
      return newSystemProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create system product");
      throw err;
    }
  };

  const updateSystemProduct = async (id: string, systemProductData: UpdateProductRequest) => {
    if (!apiClient) throw new Error("API client not available");

    try {
      setError(null);
      const updatedSystemProduct = await apiClient.products.updateSystemProduct(
        id,
        systemProductData,
      );
      await fetchSystemProducts(); // Refresh the list
      return updatedSystemProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update system product");
      throw err;
    }
  };

  const deleteSystemProduct = async (id: string) => {
    if (!apiClient) throw new Error("API client not available");

    try {
      setError(null);
      await apiClient.products.deleteSystemProduct(id);
      await fetchSystemProducts(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete system product");
      throw err;
    }
  };

  useEffect(() => {
    if (apiClient && !apiLoading) {
      fetchSystemProducts();
    }
  }, [apiClient, apiLoading]);

  return {
    systemProducts,
    loading,
    error,
    fetchSystemProducts,
    createSystemProduct,
    updateSystemProduct,
    deleteSystemProduct,
  };
}
