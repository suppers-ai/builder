import { useState } from "preact/hooks";
import { PricingProduct } from "@suppers/shared";
import { usePricing } from "../hooks/usePricing.ts";
import { useProducts } from "../hooks/useProducts.ts";
import PricingProductForm from "./PricingProductForm.tsx";
import { handleSessionExpiredError } from "@suppers/ui-lib";

export default function PricingList() {
  const { products: pricingProducts, loading, error } = usePricing();
  const { products } = useProducts();
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PricingProduct | null>(null);
  const [selectedTab, setSelectedTab] = useState<"products" | "pricing">("pricing");

  const handleCreatePricingProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditPricingProduct = (product: PricingProduct) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleFormSave = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleFormCancel = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div class="flex justify-center items-center h-64">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div class="alert alert-error">
        <span>Error loading pricing data: {error}</span>
      </div>
    );
  }

  return (
    <>
      <div class="space-y-6">
        {/* Header */}
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold">Pricing Management</h1>
            <p class="text-gray-600">Manage your pricing products and configurations</p>
          </div>
          <button
            class="btn btn-primary"
            onClick={handleCreatePricingProduct}
          >
            Create Pricing Product
          </button>
        </div>

        {/* Tabs */}
        <div class="tabs tabs-boxed">
          <button
            class={`tab ${selectedTab === "pricing" ? "tab-active" : ""}`}
            onClick={() => setSelectedTab("pricing")}
          >
            Pricing Products ({pricingProducts?.length || 0})
          </button>
          <button
            class={`tab ${selectedTab === "products" ? "tab-active" : ""}`}
            onClick={() => setSelectedTab("products")}
          >
            Regular Products ({products?.length || 0})
          </button>
        </div>

        {/* Stats */}
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Pricing Products</div>
            <div class="stat-value">{pricingProducts?.length || 0}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Regular Products</div>
            <div class="stat-value text-primary">{products?.length || 0}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Total</div>
            <div class="stat-value text-success">
              {(pricingProducts?.length || 0) + (products?.length || 0)}
            </div>
          </div>
        </div>

        {/* Content based on selected tab */}
        {selectedTab === "pricing"
          ? (
            <div class="space-y-4">
              <h2 class="text-xl font-semibold">Pricing Products</h2>
              {!pricingProducts || pricingProducts.length === 0
                ? (
                  <div class="text-center py-12">
                    <p class="text-gray-500 text-lg">
                      No pricing products found. Create your first pricing product!
                    </p>
                  </div>
                )
                : (
                  <div class="grid gap-4">
                    {pricingProducts.map((pricingProduct) => (
                      <div key={pricingProduct.id} class="card bg-base-100 shadow-xl">
                        <div class="card-body">
                          <div class="flex justify-between items-start">
                            <div class="flex-1">
                              <h3 class="card-title">
                                {pricingProduct.name}
                              </h3>
                              <p class="text-gray-600">
                                {pricingProduct.description || "No description"}
                              </p>

                              <div class="text-sm text-gray-500 mt-2">
                                Created: {pricingProduct.created_at
                                  ? new Date(pricingProduct.created_at).toLocaleDateString()
                                  : "Unknown"}
                              </div>
                            </div>

                            <div class="card-actions">
                              <button
                                class="btn btn-sm btn-primary"
                                onClick={() =>
                                  handleEditPricingProduct(pricingProduct)}
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )
          : (
            <div class="space-y-4">
              <h2 class="text-xl font-semibold">Regular Products</h2>
              {!products || products.length === 0
                ? (
                  <div class="text-center py-12">
                    <p class="text-gray-500 text-lg">
                      No regular products found. Create products first, then create pricing for
                      them.
                    </p>
                  </div>
                )
                : (
                  <div class="grid gap-4">
                    {products.map((product) => (
                      <div key={product.id} class="card bg-base-100 shadow-xl">
                        <div class="card-body">
                          <div class="flex justify-between items-start">
                            <div class="flex-1">
                              <h3 class="card-title">
                                {product.name}
                                <div class="badge badge-secondary">{product.status}</div>
                              </h3>
                              <p class="text-gray-600">{product.description || "No description"}</p>

                              <div class="text-sm text-gray-500 mt-2">
                                Type: {product.type} | Created: {product.created_at
                                  ? new Date(product.created_at).toLocaleDateString()
                                  : "Unknown"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
      </div>

      {/* Pricing Product Form Modal */}
      <PricingProductForm
        isOpen={showProductForm}
        onClose={handleFormCancel}
        product={editingProduct || undefined}
        onSave={handleFormSave}
      />
    </>
  );
}
