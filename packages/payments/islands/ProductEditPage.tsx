import { useEffect, useState } from "preact/hooks";
import { Button, Card, Input, Textarea, Select, Badge, LoadingButton, Tabs } from "@suppers/ui-lib";
import { getAuthClient } from "../lib/auth.ts";
import toast from "../lib/toast-manager.ts";
import ProductPricingConfig from "./ProductPricingConfig.tsx";

interface Product {
  id: string;
  entity_id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  type: string;
  status: string;
  metadata?: Record<string, any>;
}

interface Props {
  productId: string;
}

export default function ProductEditPage({ productId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "service",
    status: "active",
  });
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const authClient = getAuthClient();
      const response = await fetch(`/api/products/${productId}`, {
        headers: {
          "Authorization": `Bearer ${await authClient.getAccessToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        setFormData({
          name: data.name,
          description: data.description || "",
          type: data.type,
          status: data.status,
        });
      } else {
        toast.error("Failed to load product");
      }
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const authClient = getAuthClient();
      
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await authClient.getAccessToken()}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Product updated successfully!");
        await loadProduct();
      } else {
        toast.error("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div class="min-h-screen bg-base-100 flex items-center justify-center">
        <div class="text-center">
          <div class="loading loading-spinner loading-lg mb-4"></div>
          <p class="text-base-content/60">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div class="min-h-screen bg-base-100 flex items-center justify-center">
        <Card>
          <div class="card-body text-center">
            <h2 class="card-title justify-center">Product Not Found</h2>
            <p class="text-base-content/60 mb-4">
              The product you're looking for doesn't exist or you don't have access to it.
            </p>
            <div class="card-actions justify-center">
              <Button href="/dashboard" variant="primary">
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-base-100">
      <div class="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div class="mb-8">
          <div class="flex items-center gap-2 text-sm breadcrumbs mb-4">
            <a href="/dashboard" class="link link-hover">Dashboard</a>
            <span>/</span>
            <a href="/entities" class="link link-hover">Entities</a>
            <span>/</span>
            <span>Edit Product</span>
          </div>
          
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold mb-2">Edit Product</h1>
              <p class="text-base-content/70">
                Update product details and configure pricing
              </p>
            </div>
            <Badge variant={product.status === "active" ? "success" : "warning"} size="lg">
              {product.status}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <div class="tabs tabs-boxed mb-6">
            <button 
              class={`tab ${activeTab === "details" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("details")}
            >
              Product Details
            </button>
            <button 
              class={`tab ${activeTab === "pricing" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("pricing")}
            >
              Pricing Configuration
            </button>
            <button 
              class={`tab ${activeTab === "inventory" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("inventory")}
            >
              Inventory
            </button>
          </div>

          {/* Product Details Tab */}
          {activeTab === "details" && (
            <Card>
              <div class="card-body">
                <h2 class="card-title mb-4">Product Information</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Product Name</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Product Type</span>
                    </label>
                    <Select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.currentTarget.value })}
                    >
                      <option value="service">Service</option>
                      <option value="accommodation">Accommodation</option>
                      <option value="ecommerce">Physical Product</option>
                      <option value="experience">Experience/Event</option>
                    </Select>
                  </div>

                  <div class="form-control md:col-span-2">
                    <label class="label">
                      <span class="label-text">Description</span>
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
                      placeholder="Describe your product or service"
                      rows={4}
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Status</span>
                    </label>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.currentTarget.value })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                    </Select>
                  </div>
                </div>

                <div class="card-actions justify-end mt-6">
                  <Button href="/dashboard" variant="ghost">
                    Cancel
                  </Button>
                  <LoadingButton
                    variant="primary"
                    onClick={handleSave}
                    loading={saving}
                  >
                    Save Changes
                  </LoadingButton>
                </div>
              </div>
            </Card>
          )}

          {/* Pricing Tab */}
          {activeTab === "pricing" && (
            <ProductPricingConfig 
              productId={productId} 
              productName={product.name}
            />
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <Card>
              <div class="card-body">
                <h2 class="card-title mb-4">Inventory Management</h2>
                
                <div class="bg-base-200 rounded-lg p-6 text-center">
                  <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-base-300 mb-4">
                    <svg class="w-8 h-8 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 class="font-semibold mb-2">Inventory Tracking</h3>
                  <p class="text-sm text-base-content/60 mb-4 max-w-md mx-auto">
                    Track stock levels, manage variants, and set up automatic notifications for low inventory.
                  </p>
                  <Button variant="primary" size="sm">
                    Configure Inventory
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </Tabs>

        {/* Quick Actions */}
        <Card class="mt-6">
          <div class="card-body">
            <h3 class="card-title text-lg mb-4">Quick Actions</h3>
            <div class="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate Product
              </Button>
              <Button variant="outline" size="sm">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview Product
              </Button>
              <Button variant="outline" size="sm" class="text-error">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Product
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}