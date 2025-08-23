import { useEffect, useState } from "preact/hooks";
import { useApi } from "./useApi.ts";
import {
  CreatePricingProductRequest,
  PricingProduct,
  UpdatePricingProductRequest,
} from "@suppers/shared";

export function usePricing() {
  const { apiClient, loading: apiLoading } = useApi();
  const [products, setProducts] = useState<PricingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPricingProducts = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.pricing.getPricingProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pricing products");
      console.error("Error fetching pricing products:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPricingProduct = async (id: string) => {
    if (!apiClient) throw new Error("API client not available");

    try {
      setError(null);
      const product = await apiClient.pricing.getPricingProduct(id);
      return product;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pricing product");
      throw err;
    }
  };

  const createPricingProduct = async (productData: CreatePricingProductRequest) => {
    if (!apiClient) throw new Error("API client not available");

    try {
      setError(null);
      const newProduct = await apiClient.pricing.createPricingProduct(productData);
      await fetchPricingProducts(); // Refresh the list
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create pricing product");
      throw err;
    }
  };

  const updatePricingProduct = async (id: string, productData: UpdatePricingProductRequest) => {
    if (!apiClient) throw new Error("API client not available");

    try {
      setError(null);
      const updatedProduct = await apiClient.pricing.updatePricingProduct(id, productData);
      await fetchPricingProducts(); // Refresh the list
      return updatedProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update pricing product");
      throw err;
    }
  };

  const deletePricingProduct = async (id: string) => {
    if (!apiClient) throw new Error("API client not available");

    try {
      setError(null);
      await apiClient.pricing.deletePricingProduct(id);
      await fetchPricingProducts(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete pricing product");
      throw err;
    }
  };

  // Admin methods (if user has admin privileges)
  const getAdminPricingProducts = async () => {
    if (!apiClient) throw new Error("API client not available");

    try {
      setError(null);
      const data = await apiClient.pricing.getAdminPricingProducts();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch admin pricing products");
      throw err;
    }
  };

  const deleteAdminPricingProduct = async (id: string) => {
    if (!apiClient) throw new Error("API client not available");

    try {
      setError(null);
      await apiClient.pricing.deleteAdminPricingProduct(id);
      await fetchPricingProducts(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete pricing product (admin)");
      throw err;
    }
  };

  useEffect(() => {
    if (apiClient && !apiLoading) {
      fetchPricingProducts();
    }
  }, [apiClient, apiLoading]);

  return {
    products,
    loading,
    error,
    fetchPricingProducts,
    getPricingProduct,
    createPricingProduct,
    updatePricingProduct,
    deletePricingProduct,
    getAdminPricingProducts,
    deleteAdminPricingProduct,
  };
}
