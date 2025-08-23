import { useEffect, useState, useRef } from "preact/hooks";
import { Button, Card, Badge, Modal, Input, Textarea, Select, LoadingButton } from "@suppers/ui-lib";
import { Plus, Edit, Trash, Eye, Package, MapPin, Image, DollarSign } from "lucide-preact";
import { getAuthClient } from "../../lib/auth.ts";
import toast from "../../lib/toast-manager.ts";
import EntityModal from "../modals/EntityModal.tsx";
import ProductModal from "../modals/ProductModal.tsx";
import { EntitiesApiClientDirect } from "../../lib/api-client/entities-api-direct.ts";
import { ProductsApiClientDirect } from "../../lib/api-client/products-api-direct.ts";

interface Entity {
  id: string;
  name: string;
  description?: string;
  type: string;
  subType?: string;
  photos?: Array<{ url: string; caption?: string }>;
  status: string;
  metadata?: Record<string, any>;
  location?: { lat: number; lng: number };
  viewsCount?: number;
  likesCount?: number;
  productsCount?: number;
  createdAt: string;
}

interface Product {
  id: string;
  entityId: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  type: string;
  prices?: Array<{
    id: string;
    name: string;
    amount: number;
    currency: string;
    interval?: string;
  }>;
  status: string;
  viewsCount?: number;
  likesCount?: number;
  salesCount?: number;
}

interface EntitiesTabProps {
  user: any;
}

export default function EntitiesTab({ user }: EntitiesTabProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [entityProducts, setEntityProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [entitiesClient, setEntitiesClient] = useState<EntitiesApiClientDirect | null>(null);
  const [productsClient, setProductsClient] = useState<ProductsApiClientDirect | null>(null);
  
  // Modal states
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productEntityId, setProductEntityId] = useState<string | null>(null);

  useEffect(() => {
    const initClients = async () => {
      const authClient = getAuthClient();
      setEntitiesClient(new EntitiesApiClientDirect(authClient));
      setProductsClient(new ProductsApiClientDirect(authClient));
    };
    initClients();
  }, []);

  useEffect(() => {
    if (entitiesClient) {
      loadEntities();
    }
  }, [entitiesClient]);

  useEffect(() => {
    if (selectedEntity && entitiesClient) {
      loadEntityProducts(selectedEntity.id);
    }
  }, [selectedEntity, entitiesClient]);

  const loadEntities = async () => {
    if (!entitiesClient) return;
    
    try {
      setLoading(true);
      const data = await entitiesClient.getEntities();
      // Transform the data if needed (handle snake_case to camelCase)
      const transformedData = data.map(entity => ({
        ...entity,
        id: entity.id,
        name: entity.name,
        description: entity.description,
        type: entity.type,
        subType: entity.sub_type,
        status: entity.status,
        metadata: entity.metadata,
        photos: entity.photos,
        location: entity.location,
        viewsCount: entity.views_count,
        likesCount: entity.likes_count,
        productsCount: entity.products_count,
        createdAt: entity.created_at
      }));
      setEntities(transformedData);
    } catch (error) {
      console.error("Error loading entities:", error);
      toast.error("Failed to load entities");
      setEntities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEntityProducts = async (entityId: string) => {
    if (!entitiesClient) return;
    
    try {
      setLoadingProducts(true);
      const data = await entitiesClient.getEntityProducts(entityId);
      // Transform the data if needed
      const transformedData = data.map(product => ({
        ...product,
        entityId: product.entity_id || entityId,
        viewsCount: product.views_count,
        likesCount: product.likes_count,
        salesCount: product.sales_count
      }));
      setEntityProducts(transformedData);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
      setEntityProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCreateEntity = () => {
    setEditingEntity(null);
    setShowEntityModal(true);
  };

  const handleEditEntity = (entity: Entity) => {
    setEditingEntity(entity);
    setShowEntityModal(true);
  };

  const handleDeleteEntity = async (entity: Entity) => {
    if (!entitiesClient) return;
    
    if (confirm(`Are you sure you want to delete "${entity.name}"?`)) {
      try {
        await entitiesClient.deleteEntity(entity.id);
        toast.success(`Entity "${entity.name}" deleted successfully`);
        await loadEntities();
        if (selectedEntity?.id === entity.id) {
          setSelectedEntity(null);
        }
      } catch (error) {
        console.error("Error deleting entity:", error);
        toast.error("Failed to delete entity");
      }
    }
  };

  const handleCreateProduct = (entityId: string) => {
    setProductEntityId(entityId);
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductEntityId(product.entityId);
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!productsClient) return;
    
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await productsClient.deleteProduct(product.id);
        toast.success(`Product "${product.name}" deleted successfully`);
        if (selectedEntity) {
          await loadEntityProducts(selectedEntity.id);
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const handleEntitySave = async (data: any) => {
    if (!entitiesClient) return;
    
    try {
      if (editingEntity) {
        await entitiesClient.updateEntity(editingEntity.id, data);
        toast.success("Entity updated successfully");
      } else {
        await entitiesClient.createEntity(data);
        toast.success("Entity created successfully");
      }
      setShowEntityModal(false);
      setEditingEntity(null);
      await loadEntities();
    } catch (error) {
      console.error("Error saving entity:", error);
      toast.error("Failed to save entity");
    }
  };

  const handleProductSave = async (data: any) => {
    if (!productsClient) return;
    
    try {
      // Add entityId to the data
      const productData = {
        ...data,
        entity_id: productEntityId,
      };
      
      if (editingProduct) {
        await productsClient.updateProduct(editingProduct.id, productData);
        toast.success("Product updated successfully");
      } else {
        await productsClient.createProduct(productData);
        toast.success("Product created successfully");
      }
      setShowProductModal(false);
      setEditingProduct(null);
      if (selectedEntity) {
        await loadEntityProducts(selectedEntity.id);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  if (loading) {
    return (
      <div class="flex justify-center items-center h-64">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Header with Create Button */}
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-base-content">
          {selectedEntity ? `Products for ${selectedEntity.name}` : "My Entities"}
        </h3>
        <div class="flex gap-2">
          {selectedEntity && (
            <Button
              variant="ghost"
              onClick={() => setSelectedEntity(null)}
            >
              Back to Entities
            </Button>
          )}
          <Button
            color="primary"
            onClick={selectedEntity ? () => handleCreateProduct(selectedEntity.id) : handleCreateEntity}
            class="flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
            {selectedEntity ? "Add Product" : "Create Entity"}
          </Button>
        </div>
      </div>

      {/* Entities List or Products List */}
      {!selectedEntity ? (
        // Entities Grid
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entities.map((entity) => (
            <Card key={entity.id} class="hover:shadow-lg transition-shadow">
              <div class="p-4">
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <h4 class="font-semibold text-base-content">{entity.name}</h4>
                    <div class="flex items-center gap-2 mt-1">
                      <Badge variant="outline" size="sm">{entity.type}</Badge>
                      {entity.subType && (
                        <Badge variant="outline" size="sm" color="secondary">{entity.subType}</Badge>
                      )}
                    </div>
                  </div>
                  <Badge color={entity.status === "active" ? "success" : "warning"} size="sm">
                    {entity.status}
                  </Badge>
                </div>

                {entity.description && (
                  <p class="text-sm text-base-content/70 mb-3 line-clamp-2">
                    {entity.description}
                  </p>
                )}

                {/* Stats */}
                <div class="flex items-center gap-4 text-xs text-base-content/60 mb-3">
                  <span class="flex items-center gap-1">
                    <Eye class="w-3 h-3" /> {entity.viewsCount || 0}
                  </span>
                  <span class="flex items-center gap-1">
                    <Package class="w-3 h-3" /> {entity.productsCount || 0} products
                  </span>
                </div>

                {/* Actions */}
                <div class="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedEntity(entity)}
                    class="flex-1"
                  >
                    View Products
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditEntity(entity)}
                  >
                    <Edit class="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    color="error"
                    onClick={() => handleDeleteEntity(entity)}
                  >
                    <Trash class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {entities.length === 0 && (
            <div class="col-span-full text-center py-12">
              <Package class="w-16 h-16 mx-auto text-base-content/20 mb-4" />
              <p class="text-base-content/60 mb-4">No entities created yet</p>
              <Button color="primary" onClick={handleCreateEntity}>
                Create Your First Entity
              </Button>
            </div>
          )}
        </div>
      ) : (
        // Products Grid
        <div>
          {loadingProducts ? (
            <div class="flex justify-center items-center h-32">
              <span class="loading loading-spinner loading-md"></span>
            </div>
          ) : (
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entityProducts.map((product) => (
                <Card key={product.id} class="hover:shadow-lg transition-shadow">
                  <div class="p-4">
                    <div class="flex justify-between items-start mb-3">
                      <div>
                        <h4 class="font-semibold text-base-content">{product.name}</h4>
                        <Badge variant="outline" size="sm" class="mt-1">{product.type}</Badge>
                      </div>
                      <Badge color={product.status === "active" ? "success" : "warning"} size="sm">
                        {product.status}
                      </Badge>
                    </div>

                    {product.description && (
                      <p class="text-sm text-base-content/70 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Prices */}
                    {product.prices && product.prices.length > 0 && (
                      <div class="mb-3">
                        <p class="text-xs text-base-content/60 mb-1">Pricing:</p>
                        <div class="flex flex-wrap gap-2">
                          {product.prices.map(price => (
                            <Badge key={price.id} variant="outline" color="primary">
                              {price.name}: ${price.amount}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div class="flex items-center gap-4 text-xs text-base-content/60 mb-3">
                      <span class="flex items-center gap-1">
                        <Eye class="w-3 h-3" /> {product.viewsCount || 0}
                      </span>
                      <span class="flex items-center gap-1">
                        <DollarSign class="w-3 h-3" /> {product.salesCount || 0} sales
                      </span>
                    </div>

                    {/* Actions */}
                    <div class="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProduct(product)}
                        class="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        color="error"
                        onClick={() => handleDeleteProduct(product)}
                      >
                        <Trash class="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {entityProducts.length === 0 && (
                <div class="col-span-full text-center py-12">
                  <Package class="w-16 h-16 mx-auto text-base-content/20 mb-4" />
                  <p class="text-base-content/60 mb-4">No products added yet</p>
                  <Button color="primary" onClick={() => handleCreateProduct(selectedEntity.id)}>
                    Add First Product
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Entity Modal */}
      {showEntityModal && (
        <EntityModal
          entity={editingEntity}
          onSave={handleEntitySave}
          onClose={() => setShowEntityModal(false)}
        />
      )}

      {/* Product Modal */}
      {showProductModal && productEntityId && (
        <ProductModal
          product={editingProduct}
          entityId={productEntityId}
          onSave={handleProductSave}
          onClose={() => setShowProductModal(false)}
        />
      )}
    </div>
  );
}