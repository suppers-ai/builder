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
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New variable form state
  const [newVariable, setNewVariable] = useState({
    variable_id: "",
    name: "",
    description: "",
    type: "text",
    value: "",
  });

  useEffect(() => {
    loadEntityData();
  }, [entity.id]);

  const loadEntityData = async () => {
    if (!apiClient) return;

    setLoading(true);
    setError(null);
    try {
      const [productsResponse, availableResponse, variablesResponse] = await Promise.all([
        apiClient.entities.getEntityProducts(entity.id),
        apiClient.products.getUnassignedProducts(),
        apiClient.entities.getEntityVariables(entity.id),
      ]);

      setProducts(productsResponse || []);
      setAvailableProducts(availableResponse || []);
      setVariables(variablesResponse || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entity data");
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productId: string) => {
    if (!apiClient) return;

    try {
      await apiClient.entities.addProductToEntity(entity.id, productId);
      await loadEntityData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product");
    }
  };

  const removeProduct = async (productId: string) => {
    if (!apiClient) return;

    try {
      await apiClient.entities.removeProductFromEntity(entity.id, productId);
      await loadEntityData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove product");
    }
  };

  const addVariable = async () => {
    if (!apiClient || !newVariable.variable_id || !newVariable.name) return;

    try {
      let value: any = newVariable.value;
      if (newVariable.type === "number") {
        value = parseFloat(value) || 0;
      } else if (newVariable.type === "boolean") {
        value = value === "true";
      } else if (newVariable.type === "json") {
        try {
          value = JSON.parse(value);
        } catch {
          setError("Invalid JSON format");
          return;
        }
      }

      await apiClient.entities.createEntityVariable(entity.id, {
        ...newVariable,
        value,
      });

      setNewVariable({
        variable_id: "",
        name: "",
        description: "",
        type: "text",
        value: "",
      });
      await loadEntityData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add variable");
    }
  };

  const removeVariable = async (variableId: string) => {
    if (!apiClient) return;

    try {
      await apiClient.entities.deleteEntityVariable(entity.id, variableId);
      await loadEntityData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove variable");
    }
  };

  const tabs = [
    { id: "overview", name: "Overview" },
    { id: "products", name: "Products" },
    { id: "variables", name: "Variables" },
  ];

  return (
    <div class="min-h-screen bg-base-200">
      {/* Header */}
      <div class="navbar bg-base-100 shadow-sm">
        <div class="navbar-start">
          <button onClick={onClose} class="btn btn-ghost btn-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        </div>
        <div class="navbar-center">
          <h1 class="text-xl font-semibold">{entity.name}</h1>
        </div>
        <div class="navbar-end">
          {entity.verified && <div class="badge badge-primary">Verified</div>}
        </div>
      </div>

      {error && (
        <div class="alert alert-error mx-4 mt-4">
          <span>{error}</span>
          <button onClick={() => setError(null)} class="btn btn-ghost btn-xs">×</button>
        </div>
      )}

      {/* Tabs */}
      <div class="tabs tabs-boxed mx-4 mt-6 bg-base-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            class={`tab ${activeTab === tab.id ? "tab-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div class="p-4">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div class="grid gap-6">
            <div class="card bg-base-100 shadow-sm">
              <div class="card-body">
                <h2 class="card-title">Entity Information</h2>
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Name</p>
                    <p class="font-medium">{entity.name}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Status</p>
                    <div
                      class={`badge ${
                        entity.status === "active" ? "badge-success" : "badge-warning"
                      }`}
                    >
                      {entity.status}
                    </div>
                  </div>
                  <div class="md:col-span-2">
                    <p class="text-sm text-gray-500">Description</p>
                    <p>{entity.description || "No description provided"}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Type</p>
                    <p>{entity.type || "Not specified"}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Sub Type</p>
                    <p>{entity.sub_type || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="stats shadow bg-base-100">
              <div class="stat">
                <div class="stat-title">Products</div>
                <div class="stat-value text-primary">{products.length}</div>
              </div>
              <div class="stat">
                <div class="stat-title">Variables</div>
                <div class="stat-value text-secondary">{variables.length}</div>
              </div>
              <div class="stat">
                <div class="stat-title">Applications</div>
                <div class="stat-value">
                  {entity.connected_application_ids &&
                      Array.isArray(entity.connected_application_ids)
                    ? entity.connected_application_ids.length
                    : 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div class="space-y-6">
            <div class="card bg-base-100 shadow-sm">
              <div class="card-body">
                <div class="flex justify-between items-center mb-4">
                  <h2 class="card-title">Products at {entity.name}</h2>
                  <span class="text-sm text-gray-500">{products.length} products</span>
                </div>

                {products.length === 0
                  ? (
                    <div class="text-center py-8 text-gray-500">
                      <p>No products assigned to this entity yet</p>
                    </div>
                  )
                  : (
                    <div class="space-y-2">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          class="flex items-center justify-between p-3 bg-base-200 rounded"
                        >
                          <div>
                            <h3 class="font-medium">{product.name}</h3>
                            <p class="text-sm text-gray-500">{product.description}</p>
                          </div>
                          <button
                            onClick={() => removeProduct(product.id)}
                            class="btn btn-ghost btn-sm text-error"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {availableProducts.length > 0 && (
              <div class="card bg-base-100 shadow-sm">
                <div class="card-body">
                  <h2 class="card-title">Available Products</h2>
                  <p class="text-sm text-gray-500 mb-4">Products not assigned to any place</p>
                  <div class="space-y-2">
                    {availableProducts.map((product) => (
                      <div
                        key={product.id}
                        class="flex items-center justify-between p-3 bg-base-200 rounded"
                      >
                        <div>
                          <h3 class="font-medium">{product.name}</h3>
                          <p class="text-sm text-gray-500">{product.description}</p>
                        </div>
                        <button
                          onClick={() => addProduct(product.id)}
                          class="btn btn-primary btn-sm"
                        >
                          Add to Entity
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Variables Tab */}
        {activeTab === "variables" && (
          <div class="space-y-6">
            <div class="card bg-base-100 shadow-sm">
              <div class="card-body">
                <h2 class="card-title">Add New Variable</h2>
                <div class="grid md:grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Variable ID</span>
                    </label>
                    <input
                      type="text"
                      class="input input-bordered input-sm"
                      placeholder="e.g., maxCapacity"
                      value={newVariable.variable_id}
                      onInput={(e) =>
                        setNewVariable((prev) => ({
                          ...prev,
                          variable_id: (e.target as HTMLInputElement).value,
                        }))}
                    />
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Name</span>
                    </label>
                    <input
                      type="text"
                      class="input input-bordered input-sm"
                      placeholder="e.g., Maximum Capacity"
                      value={newVariable.name}
                      onInput={(e) =>
                        setNewVariable((prev) => ({
                          ...prev,
                          name: (e.target as HTMLInputElement).value,
                        }))}
                    />
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Type</span>
                    </label>
                    <select
                      class="select select-bordered select-sm"
                      value={newVariable.type}
                      onChange={(e) =>
                        setNewVariable((prev) => ({
                          ...prev,
                          type: (e.target as HTMLSelectElement).value,
                        }))}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Value</span>
                    </label>
                    <input
                      type="text"
                      class="input input-bordered input-sm"
                      placeholder={newVariable.type === "boolean" ? "true/false" : "Enter value"}
                      value={newVariable.value}
                      onInput={(e) =>
                        setNewVariable((prev) => ({
                          ...prev,
                          value: (e.target as HTMLInputElement).value,
                        }))}
                    />
                  </div>
                  <div class="form-control md:col-span-2">
                    <label class="label">
                      <span class="label-text">Description</span>
                    </label>
                    <input
                      type="text"
                      class="input input-bordered input-sm"
                      placeholder="Optional description"
                      value={newVariable.description}
                      onInput={(e) =>
                        setNewVariable((prev) => ({
                          ...prev,
                          description: (e.target as HTMLInputElement).value,
                        }))}
                    />
                  </div>
                  <div class="md:col-span-2">
                    <button
                      onClick={addVariable}
                      class="btn btn-primary btn-sm"
                      disabled={!newVariable.variable_id || !newVariable.name}
                    >
                      Add Variable
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-sm">
              <div class="card-body">
                <div class="flex justify-between items-center mb-4">
                  <h2 class="card-title">Current Variables</h2>
                  <span class="text-sm text-gray-500">{variables.length} variables</span>
                </div>

                {variables.length === 0
                  ? (
                    <div class="text-center py-8 text-gray-500">
                      <p>No variables defined for this entity yet</p>
                    </div>
                  )
                  : (
                    <div class="overflow-x-auto">
                      <table class="table table-zebra">
                        <thead>
                          <tr>
                            <th>Variable ID</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Value</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variables.map((variable) => (
                            <tr key={variable.id}>
                              <td>
                                <code class="text-xs">{variable.variable_id}</code>
                              </td>
                              <td>{variable.name}</td>
                              <td>
                                <span class="badge badge-outline badge-sm">{variable.type}</span>
                              </td>
                              <td>
                                <span class="text-sm">
                                  {variable.type === "json"
                                    ? JSON.stringify(variable.value)
                                    : String(variable.value)}
                                </span>
                              </td>
                              <td>
                                <button
                                  onClick={() => removeVariable(variable.variable_id)}
                                  class="btn btn-ghost btn-xs text-error"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
