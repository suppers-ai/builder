import { useEffect, useState } from "preact/hooks";
import { Button, Card, Badge, Avatar, Modal, Input, Textarea, Select, LoadingButton } from "@suppers/ui-lib";
import { getAuthClient } from "../lib/auth.ts";
import toast from "../lib/toast-manager.ts";

interface Entity {
  id: string;
  name: string;
  description?: string;
  type: string;
  photos?: Array<{ url: string; caption?: string }>;
  status: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface Product {
  id: string;
  entity_id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  type: string;
  status: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export default function EntityDashboard() {
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showCreateEntity, setShowCreateEntity] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "general",
  });
  const [productFormData, setProductFormData] = useState({
    name: "",
    description: "",
    type: "service",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEntities();
  }, []);

  useEffect(() => {
    if (selectedEntity) {
      loadProducts(selectedEntity.id);
    }
  }, [selectedEntity]);

  const loadEntities = async () => {
    try {
      setLoading(true);
      const authClient = getAuthClient();
      await authClient.initialize();
      
      const user = await authClient.getUser();
      if (!user) {
        toast.error("Please sign in to continue");
        return;
      }

      // Fetch entities from API
      const response = await fetch("/api/entities", {
        headers: {
          "Authorization": `Bearer ${await authClient.getAccessToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEntities(data.entities || []);
      } else {
        toast.error("Failed to load entities");
      }
    } catch (error) {
      console.error("Error loading entities:", error);
      toast.error("Failed to load entities");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (entityId: string) => {
    try {
      const authClient = getAuthClient();
      const response = await fetch(`/api/entities/${entityId}/products`, {
        headers: {
          "Authorization": `Bearer ${await authClient.getAccessToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    }
  };

  const handleCreateEntity = async () => {
    try {
      setSaving(true);
      const authClient = getAuthClient();
      
      const response = await fetch("/api/entities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await authClient.getAccessToken()}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newEntity = await response.json();
        setEntities([...entities, newEntity]);
        setShowCreateEntity(false);
        setFormData({ name: "", description: "", type: "general" });
        toast.success("Entity created successfully!");
      } else {
        toast.error("Failed to create entity");
      }
    } catch (error) {
      console.error("Error creating entity:", error);
      toast.error("Failed to create entity");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!selectedEntity) return;

    try {
      setSaving(true);
      const authClient = getAuthClient();
      
      const response = await fetch(`/api/entities/${selectedEntity.id}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await authClient.getAccessToken()}`,
        },
        body: JSON.stringify(productFormData),
      });

      if (response.ok) {
        const newProduct = await response.json();
        setProducts([...products, newProduct]);
        setShowCreateProduct(false);
        setProductFormData({ name: "", description: "", type: "service" });
        toast.success("Product created successfully!");
      } else {
        toast.error("Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div class="min-h-screen bg-base-100 flex items-center justify-center">
        <div class="text-center">
          <div class="loading loading-spinner loading-lg mb-4"></div>
          <p class="text-base-content/60">Loading your business...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-base-100">
      <div class="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-2">My Business</h1>
          <p class="text-base-content/70">
            Manage your entities and products in one place
          </p>
        </div>

        {/* Entities Section */}
        <Card class="mb-8">
          <div class="card-body">
            <div class="flex justify-between items-center mb-6">
              <h2 class="card-title">Business Entities</h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCreateEntity(true)}
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Entity
              </Button>
            </div>

            {entities.length === 0 ? (
              <div class="text-center py-12">
                <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-base-200 mb-4">
                  <svg class="w-10 h-10 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold mb-2">No entities yet</h3>
                <p class="text-base-content/60 mb-4 max-w-md mx-auto">
                  To start selling products, please create your first business entity. 
                  An entity represents your business, store, or service location.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateEntity(true)}
                >
                  Create Your First Entity
                </Button>
              </div>
            ) : (
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entities.map((entity) => (
                  <div
                    key={entity.id}
                    class={`card bg-base-200 cursor-pointer transition-all hover:shadow-lg ${
                      selectedEntity?.id === entity.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedEntity(entity)}
                  >
                    <div class="card-body p-4">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <h3 class="font-semibold text-lg">{entity.name}</h3>
                          <p class="text-sm text-base-content/70 mt-1">
                            {entity.description || "No description"}
                          </p>
                        </div>
                        <Badge variant={entity.status === "active" ? "success" : "warning"} size="sm">
                          {entity.status}
                        </Badge>
                      </div>
                      <div class="mt-3 flex items-center justify-between">
                        <span class="text-xs text-base-content/50">
                          {entity.type}
                        </span>
                        <span class="text-xs text-base-content/50">
                          {new Date(entity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Products Section */}
        {selectedEntity && (
          <Card>
            <div class="card-body">
              <div class="flex justify-between items-center mb-6">
                <div>
                  <h2 class="card-title">Products for {selectedEntity.name}</h2>
                  <p class="text-sm text-base-content/60 mt-1">
                    Manage products and services for this entity
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreateProduct(true)}
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </Button>
              </div>

              {products.length === 0 ? (
                <div class="text-center py-8">
                  <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-base-200 mb-3">
                    <svg class="w-8 h-8 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 class="font-semibold mb-2">No products yet</h3>
                  <p class="text-base-content/60 mb-3 text-sm">
                    Add your first product to start selling
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowCreateProduct(true)}
                  >
                    Create Product
                  </Button>
                </div>
              ) : (
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div key={product.id} class="card bg-base-200">
                      <div class="card-body p-4">
                        <div class="flex items-start gap-4">
                          {product.thumbnail_url ? (
                            <img 
                              src={product.thumbnail_url} 
                              alt={product.name}
                              class="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div class="w-16 h-16 rounded-lg bg-base-300 flex items-center justify-center">
                              <svg class="w-8 h-8 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                            </div>
                          )}
                          <div class="flex-1">
                            <h4 class="font-semibold">{product.name}</h4>
                            <p class="text-sm text-base-content/70 mt-1">
                              {product.description || "No description"}
                            </p>
                            <div class="flex items-center gap-2 mt-2">
                              <Badge variant="outline" size="sm">{product.type}</Badge>
                              <Badge 
                                variant={product.status === "active" ? "success" : "warning"} 
                                size="sm"
                              >
                                {product.status}
                              </Badge>
                            </div>
                          </div>
                          <div class="dropdown dropdown-end">
                            <label tabIndex={0} class="btn btn-ghost btn-sm btn-circle">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </label>
                            <ul tabIndex={0} class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                              <li><a href={`/products/${product.id}/edit`}>Edit Product</a></li>
                              <li><a href={`/products/${product.id}/pricing`}>Configure Pricing</a></li>
                              <li><a class="text-error">Delete Product</a></li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Create Entity Modal */}
        {showCreateEntity && (
          <Modal open={showCreateEntity} onClose={() => setShowCreateEntity(false)}>
            <h3 class="font-bold text-lg mb-4">Create New Entity</h3>
            
            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Entity Name</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                  placeholder="e.g., My Restaurant, My Store"
                  required
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Description</span>
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
                  placeholder="Brief description of your business"
                  rows={3}
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Entity Type</span>
                </label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.currentTarget.value })}
                >
                  <option value="general">General Business</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="service">Service Provider</option>
                  <option value="venue">Event Venue</option>
                </Select>
              </div>
            </div>

            <div class="modal-action">
              <Button variant="ghost" onClick={() => setShowCreateEntity(false)}>
                Cancel
              </Button>
              <LoadingButton
                variant="primary"
                onClick={handleCreateEntity}
                loading={saving}
                disabled={!formData.name}
              >
                Create Entity
              </LoadingButton>
            </div>
          </Modal>
        )}

        {/* Create Product Modal */}
        {showCreateProduct && (
          <Modal open={showCreateProduct} onClose={() => setShowCreateProduct(false)}>
            <h3 class="font-bold text-lg mb-4">Create New Product</h3>
            
            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Product Name</span>
                </label>
                <Input
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.currentTarget.value })}
                  placeholder="e.g., Premium Service, Standard Package"
                  required
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Description</span>
                </label>
                <Textarea
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.currentTarget.value })}
                  placeholder="What does this product include?"
                  rows={3}
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Product Type</span>
                </label>
                <Select
                  value={productFormData.type}
                  onChange={(e) => setProductFormData({ ...productFormData, type: e.currentTarget.value })}
                >
                  <option value="service">Service</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="ecommerce">Physical Product</option>
                  <option value="experience">Experience/Event</option>
                </Select>
              </div>
            </div>

            <div class="modal-action">
              <Button variant="ghost" onClick={() => setShowCreateProduct(false)}>
                Cancel
              </Button>
              <LoadingButton
                variant="primary"
                onClick={handleCreateProduct}
                loading={saving}
                disabled={!productFormData.name}
              >
                Create Product
              </LoadingButton>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}