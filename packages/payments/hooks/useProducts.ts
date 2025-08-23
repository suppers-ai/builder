import { useEffect, useState } from "preact/hooks";
import { useApi } from "./useApi.ts";
import { CreateProductRequest, Product, UpdateProductRequest } from "@suppers/shared";

export function useProducts() {
  const { apiClient, loading: apiLoading } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.products.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: CreateProductRequest) => {
    if (!apiClient) throw new Error("API client not available");

    try {
      setError(null);
      const newProduct = await apiClient.products.createProduct(productData);
      await fetchProducts(); // Refresh the list
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: UpdateProductRequest) => {
    if (!apiClient) throw new Error("API client not available");

    try {
      setError(null);
      const updatedProduct = await apiClient.products.updateProduct(id, productData);
      await fetchProducts(); // Refresh the list
      return updatedProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    if (!apiClient) throw new Error("API client not available");

    try {
      setError(null);
      await apiClient.products.deleteProduct(id);
      await fetchProducts(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
      throw err;
    }
  };

  const getUnassignedProducts = async () => {
    if (!apiClient) return [];

    try {
      setError(null);
      return await apiClient.products.getUnassignedProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch unassigned products");
      return [];
    }
  };

  useEffect(() => {
    if (apiClient && !apiLoading) {
      fetchProducts();
    }
  }, [apiClient, apiLoading]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getUnassignedProducts,
  };
}
