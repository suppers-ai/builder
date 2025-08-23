import { useEffect, useState } from "preact/hooks";
import { Product } from "@suppers/shared";

interface ProductDetailProps {
  product: Product;
  onUpdate?: (product: Product) => void;
  onClose?: () => void;
  isAdmin?: boolean;
}

export default function ProductDetail(
  { product, onUpdate, onClose, isAdmin = false }: ProductDetailProps,
) {
  const [activeTab, setActiveTab] = useState("overview");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPrice = (pricing: any) => {
    if (!pricing) return "Not configured";

    // Extract pricing information from complex structure
    const priceData = pricing.pricing_products?.pricing_prices?.[0];
    if (priceData?.amount && typeof priceData.amount === "object") {
      const price = priceData.amount.USD;
      return price ? `$${parseFloat(price).toFixed(2)}` : "Not configured";
    }

    return "Not configured";
  };

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div class="flex justify-between items-center p-6 border-b">
          <div>
            <h2 class="text-2xl font-bold">{product.name}</h2>
            <div class="flex gap-2 mt-1">
              <span
                class={`badge ${
                  product.status === "active"
                    ? "badge-success"
                    : product.status === "draft"
                    ? "badge-warning"
                    : "badge-error"
                }`}
              >
                {product.status}
              </span>
              {product.type && <span class="badge badge-info">{product.type}</span>}
              {product.sub_type && <span class="badge badge-outline">{product.sub_type}</span>}
            </div>
          </div>
          <button class="btn btn-ghost btn-circle" onClick={onClose}>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              >
              </path>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div class="tabs tabs-bordered px-6">
          <button
            class={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            class={`tab ${activeTab === "pricing" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("pricing")}
          >
            Pricing
          </button>
          <button
            class={`tab ${activeTab === "variables" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("variables")}
          >
            Variables
          </button>
        </div>

        {/* Content */}
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "overview" && (
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold mb-2">Description</h3>
                <p class="text-gray-600">{product.description || "No description available"}</p>
              </div>

              <div>
                <h3 class="text-lg font-semibold mb-2">Type Information</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label-text font-medium">Type:</label>
                    <p class="text-gray-600">{product.type || "Not specified"}</p>
                  </div>
                  <div>
                    <label class="label-text font-medium">Sub-type:</label>
                    <p class="text-gray-600">{product.sub_type || "Not specified"}</p>
                  </div>
                </div>
              </div>

              {product.metadata && Object.keys(product.metadata).length > 0 && (
                <div>
                  <h3 class="text-lg font-semibold mb-2">Metadata</h3>
                  <div class="bg-base-200 p-4 rounded-lg">
                    <div class="space-y-2">
                      {Object.entries(product.metadata).map(([key, value]) => (
                        <div key={key} class="flex justify-between">
                          <span class="font-medium">{key}:</span>
                          <span class="text-gray-600">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <h4 class="font-semibold">Created</h4>
                  <p class="text-sm text-gray-600">{formatDate(product.created_at)}</p>
                </div>
                <div>
                  <h4 class="font-semibold">Last Updated</h4>
                  <p class="text-sm text-gray-600">{formatDate(product.updated_at)}</p>
                </div>
                <div>
                  <h4 class="font-semibold">Seller ID</h4>
                  <p class="text-sm text-gray-600 font-mono">{product.seller_id}</p>
                </div>
                <div>
                  <h4 class="font-semibold">Product ID</h4>
                  <p class="text-sm text-gray-600 font-mono">{product.id}</p>
                </div>
              </div>

              {product.entity_id && (
                <div>
                  <h4 class="font-semibold">Associated Entity</h4>
                  <p class="text-sm text-gray-600 font-mono">{product.entity_id}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "pricing" && (
            <div>
              <h3 class="text-lg font-semibold mb-4">Pricing Configuration</h3>
              {product.product_pricing && product.product_pricing.length > 0
                ? (
                  <div class="space-y-4">
                    {product.product_pricing.map((pricing, index) => (
                      <div key={index} class="card bg-base-100 border">
                        <div class="card-body">
                          <h4 class="card-title text-base">Pricing Configuration {index + 1}</h4>
                          <div class="grid grid-cols-2 gap-4">
                            <div>
                              <label class="label-text font-medium">Price:</label>
                              <p class="text-lg font-semibold text-primary">
                                {formatPrice(pricing)}
                              </p>
                            </div>
                            <div>
                              <label class="label-text font-medium">Configuration:</label>
                              <p class="text-sm text-gray-600">
                                {pricing.pricing_products ? "Dynamic Pricing" : "Fixed Price"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
                : <p class="text-gray-500">No pricing configuration found</p>}
            </div>
          )}

          {activeTab === "variables" && (
            <div>
              <h3 class="text-lg font-semibold mb-4">Product Variables</h3>
              {product.variables && product.variables.length > 0
                ? (
                  <div class="space-y-3">
                    {product.variables.map((variable) => (
                      <div key={variable.id} class="card bg-base-100 border">
                        <div class="card-body compact">
                          <div class="flex justify-between items-start">
                            <div>
                              <h4 class="font-semibold">{variable.name}</h4>
                              <p class="text-sm text-gray-600">{variable.description}</p>
                              <div class="text-xs text-gray-500 mt-1">
                                ID: {variable.variable_id} | Type: {variable.value_type}
                              </div>
                            </div>
                            <div class="text-right">
                              <div class="badge badge-outline">{variable.value}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
                : <p class="text-gray-500">No variables defined for this product</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
