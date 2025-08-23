import { useState } from "preact/hooks";
import { Product } from "@suppers/shared";
import { useProducts } from "../hooks/useProducts.ts";
import ProductForm from "./ProductForm.tsx";
import ProductDetail from "./ProductDetail.tsx";

export default function ProductsList() {
  const { products, loading, error, deleteProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Filter products based on search, status, and type
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesType = typeFilter === "all" || product.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      await deleteProduct(product.id);
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDetailClose = () => {
    setSelectedProduct(null);
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
        <span>Error loading products: {error}</span>
      </div>
    );
  }

  return (
    <>
      <div class="space-y-6">
        {/* Header */}
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold">Products</h1>
            <p class="text-gray-600">Manage your product catalog</p>
          </div>
          <button
            class="btn btn-primary"
            onClick={handleCreateProduct}
          >
            Create Product
          </button>
        </div>

        {/* Filters */}
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="form-control flex-1">
            <input
              type="text"
              placeholder="Search products..."
              class="input input-bordered"
              value={searchTerm}
              onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="form-control">
            <select
              class="select select-bordered"
              value={statusFilter}
              onChange={(e) => setStatusFilter((e.target as HTMLSelectElement).value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div class="form-control">
            <select
              class="select select-bordered"
              value={typeFilter}
              onChange={(e) => setTypeFilter((e.target as HTMLSelectElement).value)}
            >
              <option value="all">All Types</option>
              {[...new Set(products.map((p) => p.type).filter(Boolean))].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Total Products</div>
            <div class="stat-value">{products.length}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Active</div>
            <div class="stat-value text-primary">
              {products.filter((p) => p.status === "active").length}
            </div>
          </div>
          <div class="stat">
            <div class="stat-title">Draft</div>
            <div class="stat-value text-warning">
              {products.filter((p) => p.status === "draft").length}
            </div>
          </div>
        </div>

        {/* Products List */}
        {filteredProducts.length === 0
          ? (
            <div class="text-center py-12">
              <p class="text-gray-500 text-lg">
                {searchTerm || statusFilter !== "all"
                  ? "No products match your filters"
                  : "No products found. Create your first product!"}
              </p>
            </div>
          )
          : (
            <div class="grid gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} class="card bg-base-100 shadow-xl">
                  <div class="card-body">
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <h2 class="card-title">
                          {product.name}
                          <div class="badge badge-secondary">{product.status}</div>
                        </h2>
                        <p class="text-gray-600">{product.description}</p>

                        {/* Type Information */}
                        <div class="flex flex-wrap gap-1 mt-2">
                          {product.type && <span class="badge badge-info">{product.type}</span>}
                          {product.sub_type && (
                            <span class="badge badge-outline">{product.sub_type}</span>
                          )}
                        </div>

                        <div class="text-sm text-gray-500 mt-2">
                          Created: {new Date(product.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div class="card-actions">
                        <button
                          class="btn btn-sm btn-ghost"
                          onClick={() =>
                            handleViewProduct(product)}
                        >
                          View
                        </button>
                        <button
                          class="btn btn-sm btn-primary"
                          onClick={() =>
                            handleEditProduct(product)}
                        >
                          Edit
                        </button>
                        <button
                          class="btn btn-sm btn-error"
                          onClick={() => handleDeleteProduct(product)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Form Modal */}
      <ProductForm
        isOpen={showForm}
        onClose={handleFormCancel}
        product={editingProduct || undefined}
        onSave={handleFormSave}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={handleDetailClose}
        />
      )}
    </>
  );
}
