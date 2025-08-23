import { useEffect, useState } from "preact/hooks";
import { EntityTypeAPIClient } from "../lib/api-client/entity-types/entity-type-api.ts";
import { ProductTypeAPIClient } from "../lib/api-client/product-types/product-type-api.ts";
import { getAuthClient } from "../lib/auth.ts";

interface BulkOperation {
  id: string;
  type: "create" | "update" | "delete";
  target: "entity" | "product";
  data: any;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

interface BulkTypeManagementProps {
  onClose?: () => void;
  isOpen?: boolean;
}

export default function BulkTypeManagement({ onClose, isOpen = true }: BulkTypeManagementProps) {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importData, setImportData] = useState("");
  const [activeTab, setActiveTab] = useState<"import" | "export" | "operations">("import");
  const [exportData, setExportData] = useState("");

  const authClient = getAuthClient();
  const entityTypesClient = new EntityTypeAPIClient(authClient);
  const productTypesClient = new ProductTypeAPIClient(authClient);

  // Import JSON configuration
  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      const newOperations: BulkOperation[] = [];

      // Process entity types
      if (data.entityTypes) {
        data.entityTypes.forEach((entityType: any, index: number) => {
          newOperations.push({
            id: `entity_${index}`,
            type: "create",
            target: "entity",
            data: entityType,
            status: "pending",
          });
        });
      }

      // Process product types
      if (data.productTypes) {
        data.productTypes.forEach((productType: any, index: number) => {
          newOperations.push({
            id: `product_${index}`,
            type: "create",
            target: "product",
            data: productType,
            status: "pending",
          });
        });
      }

      setOperations(newOperations);
    } catch (error) {
      alert("Invalid JSON format: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  // Export current configuration
  const handleExport = async () => {
    try {
      const [entityTypesResponse, productTypesResponse] = await Promise.all([
        entityTypesClient.getAllEntityTypes(),
        productTypesClient.getAllProductTypes(),
      ]);

      if (entityTypesResponse.error) {
        throw new Error(entityTypesResponse.error);
      }
      if (productTypesResponse.error) {
        throw new Error(productTypesResponse.error);
      }

      const entityTypes = entityTypesResponse.data || [];
      const productTypes = productTypesResponse.data || [];

      const exportConfig = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        entityTypes: entityTypes.map((type) => ({
          name: type.name,
          description: type.description,
          metadata_schema: type.metadata_schema,
          filter_config: type.filter_config,
          sub_types: type.entity_sub_types || [],
        })),
        productTypes: productTypes.map((type) => ({
          name: type.name,
          description: type.description,
          metadata_schema: type.metadata_schema,
          filter_config: type.filter_config,
          sub_types: type.product_sub_types || [],
        })),
      };

      setExportData(JSON.stringify(exportConfig, null, 2));
    } catch (error) {
      alert("Export failed: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  // Process all pending operations
  const processOperations = async () => {
    setIsProcessing(true);

    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];

      // Update status to processing
      setOperations((prev) =>
        prev.map((op, idx) => idx === i ? { ...op, status: "processing" } : op)
      );

      try {
        if (operation.target === "entity") {
          await processEntityOperation(operation);
        } else {
          await processProductOperation(operation);
        }

        // Mark as completed
        setOperations((prev) =>
          prev.map((op, idx) => idx === i ? { ...op, status: "completed" } : op)
        );
      } catch (error) {
        // Mark as failed
        setOperations((prev) =>
          prev.map((op, idx) =>
            idx === i
              ? {
                ...op,
                status: "failed",
                error: error instanceof Error ? error.message : "Unknown error",
              }
              : op
          )
        );
      }

      // Small delay to show progress
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setIsProcessing(false);
  };

  // Process individual entity operation
  const processEntityOperation = async (operation: BulkOperation) => {
    let result;
    switch (operation.type) {
      case "create":
        result = await entityTypesClient.createEntityType(operation.data);
        break;
      case "update":
        result = await entityTypesClient.updateEntityType(operation.data.id, operation.data);
        break;
      case "delete":
        result = await entityTypesClient.deleteEntityType(operation.data.id);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }

    if (!result.success) {
      throw new Error(result.error || "Operation failed");
    }
  };

  // Process individual product operation
  const processProductOperation = async (operation: BulkOperation) => {
    let result;
    switch (operation.type) {
      case "create":
        result = await productTypesClient.createProductType(operation.data);
        break;
      case "update":
        result = await productTypesClient.updateProductType(operation.data.id, operation.data);
        break;
      case "delete":
        result = await productTypesClient.deleteProductType(operation.data.id);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }

    if (!result.success) {
      throw new Error(result.error || "Operation failed");
    }
  };

  // Remove operation from queue
  const removeOperation = (operationId: string) => {
    setOperations((prev) => prev.filter((op) => op.id !== operationId));
  };

  // Clear all operations
  const clearOperations = () => {
    setOperations([]);
  };

  // Download export data as file
  const downloadExport = () => {
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `type-configuration-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy export data to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportData);
      alert("Configuration copied to clipboard!");
    } catch (error) {
      alert("Failed to copy to clipboard");
    }
  };

  // Load sample configuration
  const loadSampleConfig = () => {
    const sampleConfig = {
      version: "1.0",
      entityTypes: [
        {
          name: "restaurant",
          description: "Restaurants and dining establishments",
          metadata_schema: {
            fields: {
              cuisine_type: {
                type: "select",
                label: "Cuisine Type",
                options: ["Italian", "Chinese", "Mexican", "American"],
              },
              price_range: {
                type: "select",
                label: "Price Range",
                options: ["$", "$$", "$$$", "$$$$"],
              },
              seating_capacity: { type: "number", label: "Seating Capacity", min: 1 },
              outdoor_seating: { type: "boolean", label: "Outdoor Seating" },
              delivery_available: { type: "boolean", label: "Delivery Available" },
            },
          },
          filter_config: {
            filter_text_1: { label: "cuisine_type", searchable: true },
            filter_text_2: { label: "price_range", searchable: true },
            filter_numeric_1: { label: "seating_capacity", searchable: true },
            filter_boolean_1: { label: "outdoor_seating", searchable: true },
            filter_boolean_2: { label: "delivery_available", searchable: true },
          },
          sub_types: [
            {
              name: "fine_dining",
              description: "Fine dining restaurant",
              metadata_schema: {
                fields: {
                  dress_code: {
                    type: "select",
                    label: "Dress Code",
                    options: ["Casual", "Business Casual", "Formal"],
                  },
                  wine_list: { type: "boolean", label: "Wine List Available" },
                },
              },
            },
          ],
        },
      ],
      productTypes: [
        {
          name: "meal",
          description: "Restaurant meals and dishes",
          metadata_schema: {
            fields: {
              course_type: {
                type: "select",
                label: "Course Type",
                options: ["Appetizer", "Main Course", "Dessert"],
              },
              dietary_restrictions: {
                type: "array",
                label: "Dietary Options",
                options: ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free"],
              },
              spice_level: {
                type: "select",
                label: "Spice Level",
                options: ["Mild", "Medium", "Hot", "Extra Hot"],
              },
              calories: { type: "number", label: "Calories", min: 0 },
            },
          },
          filter_config: {
            filter_text_1: { label: "course_type", searchable: true },
            filter_text_2: { label: "dietary_restrictions", searchable: true },
            filter_text_3: { label: "spice_level", searchable: true },
            filter_numeric_1: { label: "calories", searchable: true },
          },
        },
      ],
    };

    setImportData(JSON.stringify(sampleConfig, null, 2));
  };

  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div class="flex justify-between items-center p-6 border-b">
          <h2 class="text-2xl font-bold">Bulk Type Management</h2>
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
            class={`tab ${activeTab === "import" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("import")}
          >
            Import
          </button>
          <button
            class={`tab ${activeTab === "export" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("export")}
          >
            Export
          </button>
          <button
            class={`tab ${activeTab === "operations" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("operations")}
          >
            Operations ({operations.length})
          </button>
        </div>

        {/* Content */}
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === "import" && (
            <div class="space-y-6">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold">Import Configuration</h3>
                <button
                  class="btn btn-outline btn-sm"
                  onClick={loadSampleConfig}
                >
                  Load Sample
                </button>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">JSON Configuration</span>
                </label>
                <textarea
                  class="textarea textarea-bordered h-96"
                  placeholder="Paste your JSON configuration here..."
                  value={importData}
                  onInput={(e) => setImportData(e.currentTarget.value)}
                />
              </div>

              <div class="flex gap-4">
                <button
                  class="btn btn-primary"
                  onClick={handleImport}
                  disabled={!importData.trim()}
                >
                  Parse Configuration
                </button>
              </div>

              {operations.length > 0 && (
                <div class="alert alert-info">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    >
                    </path>
                  </svg>
                  <span>
                    Found {operations.length}{" "}
                    operations. Switch to Operations tab to review and execute.
                  </span>
                </div>
              )}
            </div>
          )}

          {activeTab === "export" && (
            <div class="space-y-6">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold">Export Configuration</h3>
                <button
                  class="btn btn-primary"
                  onClick={handleExport}
                >
                  Generate Export
                </button>
              </div>

              {exportData && (
                <>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">JSON Configuration</span>
                    </label>
                    <textarea
                      class="textarea textarea-bordered h-96"
                      value={exportData}
                      readOnly
                    />
                  </div>

                  <div class="flex gap-4">
                    <button
                      class="btn btn-outline"
                      onClick={downloadExport}
                    >
                      📥 Download
                    </button>
                    <button
                      class="btn btn-outline"
                      onClick={copyToClipboard}
                    >
                      📋 Copy to Clipboard
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "operations" && (
            <div class="space-y-6">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold">Pending Operations</h3>
                <div class="flex gap-2">
                  <button
                    class="btn btn-outline btn-sm"
                    onClick={clearOperations}
                    disabled={operations.length === 0 || isProcessing}
                  >
                    Clear All
                  </button>
                  <button
                    class="btn btn-primary"
                    onClick={processOperations}
                    disabled={operations.length === 0 || isProcessing}
                  >
                    {isProcessing
                      ? (
                        <>
                          <span class="loading loading-spinner loading-sm"></span>
                          Processing...
                        </>
                      )
                      : (
                        `Execute ${operations.length} Operations`
                      )}
                  </button>
                </div>
              </div>

              {operations.length === 0
                ? (
                  <div class="text-center py-12 text-gray-500">
                    No operations queued. Import a configuration to get started.
                  </div>
                )
                : (
                  <div class="space-y-3">
                    {operations.map((operation, index) => (
                      <div key={operation.id} class="card bg-base-100 border">
                        <div class="card-body compact">
                          <div class="flex justify-between items-start">
                            <div class="flex-1">
                              <div class="flex items-center gap-2">
                                <span
                                  class={`badge ${
                                    operation.status === "completed"
                                      ? "badge-success"
                                      : operation.status === "failed"
                                      ? "badge-error"
                                      : operation.status === "processing"
                                      ? "badge-warning"
                                      : "badge-ghost"
                                  }`}
                                >
                                  {operation.status}
                                </span>
                                <span class="badge badge-outline">
                                  {operation.type} {operation.target}
                                </span>
                              </div>
                              <h4 class="font-semibold mt-1">{operation.data.name}</h4>
                              <p class="text-sm text-gray-600">{operation.data.description}</p>
                              {operation.error && (
                                <p class="text-sm text-error mt-1">Error: {operation.error}</p>
                              )}
                            </div>
                            <button
                              class="btn btn-ghost btn-xs"
                              onClick={() =>
                                removeOperation(operation.id)}
                              disabled={isProcessing}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Progress Summary */}
              {operations.length > 0 && (
                <div class="stats shadow">
                  <div class="stat">
                    <div class="stat-title">Total</div>
                    <div class="stat-value text-primary">{operations.length}</div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">Completed</div>
                    <div class="stat-value text-success">
                      {operations.filter((op) => op.status === "completed").length}
                    </div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">Failed</div>
                    <div class="stat-value text-error">
                      {operations.filter((op) => op.status === "failed").length}
                    </div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">Pending</div>
                    <div class="stat-value">
                      {operations.filter((op) => op.status === "pending").length}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
