import { useEffect, useState } from "preact/hooks";
import { Entity, Variable } from "@suppers/shared";
import { useApi } from "../hooks/useApi.ts";

interface EntityDetailProps {
  entity: Entity;
  onUpdate?: (entity: Entity) => void;
  onClose?: () => void;
  isAdmin?: boolean;
}

export default function EntityDetail(
  { entity, onUpdate, onClose, isAdmin = false }: EntityDetailProps,
) {
  const { apiClient } = useApi();
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState<any[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "products" && apiClient) {
      loadEntityProducts();
    } else if (activeTab === "variables" && apiClient) {
      loadEntityVariables();
    }
  }, [activeTab, entity.id, apiClient]);

  const loadEntityProducts = async () => {
    if (!apiClient) return;
    setLoading(true);
    try {
      const response = await apiClient.entities.getEntityProducts(entity.id);
      setProducts(response);
    } catch (error) {
      console.error("Error loading entity products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEntityVariables = async () => {
    if (!apiClient) return;
    setLoading(true);
    try {
      const response = await apiClient.entities.getEntityVariables(entity.id);
      setVariables(response);
    } catch (error) {
      console.error("Error loading entity variables:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div class="flex justify-between items-center p-6 border-b">
          <div>
            <h2 class="text-2xl font-bold">{entity.name}</h2>
            <div class="flex gap-2 mt-1">
              <span
                class={`badge ${entity.status === "active" ? "badge-success" : "badge-warning"}`}
              >
                {entity.status}
              </span>
              {entity.verified && <span class="badge badge-primary">Verified</span>}
              {entity.type && <span class="badge badge-info">{entity.type}</span>}
              {entity.sub_type && <span class="badge badge-outline">{entity.sub_type}</span>}
              {entity.location && <span class="badge badge-ghost">📍 Location</span>}
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
            class={`tab ${activeTab === "products" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products
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
                <p class="text-gray-600">{entity.description || "No description available"}</p>
              </div>

              <div>
                <h3 class="text-lg font-semibold mb-2">Type Information</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label-text font-medium">Type:</label>
                    <p class="text-gray-600">{entity.type || "Not specified"}</p>
                  </div>
                  <div>
                    <label class="label-text font-medium">Sub-type:</label>
                    <p class="text-gray-600">{entity.sub_type || "Not specified"}</p>
                  </div>
                </div>
              </div>

              {entity.metadata && Object.keys(entity.metadata).length > 0 && (
                <div>
                  <h3 class="text-lg font-semibold mb-2">Metadata</h3>
                  <div class="bg-base-200 p-4 rounded-lg">
                    <div class="space-y-2">
                      {Object.entries(entity.metadata).map(([key, value]) => (
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

              {entity.location && (
                <div>
                  <h3 class="text-lg font-semibold mb-2">Location</h3>
                  <p class="text-gray-600 font-mono text-sm">{entity.location}</p>
                </div>
              )}

              <div>
                <h3 class="text-lg font-semibold mb-2">Connected Applications</h3>
                {entity.connected_application_ids &&
                    Array.isArray(entity.connected_application_ids) &&
                    entity.connected_application_ids.length > 0
                  ? (
                    <div class="space-y-1">
                      {(entity.connected_application_ids as string[]).map((appId) => (
                        <div key={appId} class="text-sm text-gray-600">{appId}</div>
                      ))}
                    </div>
                  )
                  : <p class="text-gray-500">No connected applications</p>}
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <h4 class="font-semibold">Created</h4>
                  <p class="text-sm text-gray-600">{formatDate(entity.created_at)}</p>
                </div>
                <div>
                  <h4 class="font-semibold">Last Updated</h4>
                  <p class="text-sm text-gray-600">{formatDate(entity.updated_at)}</p>
                </div>
                <div>
                  <h4 class="font-semibold">Version</h4>
                  <p class="text-sm text-gray-600">{entity.version_id}</p>
                </div>
                <div>
                  <h4 class="font-semibold">ID</h4>
                  <p class="text-sm text-gray-600 font-mono">{entity.id}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div>
              <h3 class="text-lg font-semibold mb-4">Associated Products</h3>
              {loading
                ? (
                  <div class="flex justify-center">
                    <span class="loading loading-spinner"></span>
                  </div>
                )
                : products.length > 0
                ? (
                  <div class="space-y-3">
                    {products.map((product) => (
                      <div key={product.id} class="card bg-base-100 border">
                        <div class="card-body compact">
                          <h4 class="card-title text-base">{product.name}</h4>
                          <p class="text-sm text-gray-600">{product.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
                : <p class="text-gray-500">No products associated with this entity</p>}
            </div>
          )}

          {activeTab === "variables" && (
            <div>
              <h3 class="text-lg font-semibold mb-4">Entity Variables</h3>
              {loading
                ? (
                  <div class="flex justify-center">
                    <span class="loading loading-spinner"></span>
                  </div>
                )
                : variables.length > 0
                ? (
                  <div class="space-y-3">
                    {variables.map((variable) => (
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
                : <p class="text-gray-500">No variables defined for this entity</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
