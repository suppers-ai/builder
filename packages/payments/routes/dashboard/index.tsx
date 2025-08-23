import { PageProps } from "fresh";
import { Avatar, Badge, Button, Card, Divider, Loading, Stat } from "@suppers/ui-lib";
import { useApi } from "../../hooks/useApi.ts";
import { useProducts } from "../../hooks/useProducts.ts";
import { usePurchases } from "../../hooks/usePurchases.ts";
import SimpleAuthButton from "../../islands/SimpleAuthButton.tsx";

export default function UserDashboard(props: PageProps) {
  const { apiClient, loading: apiLoading, isAuthenticated: apiAuthenticated } = useApi();
  const { products, loading: productsLoading, error: productsError } = useProducts(apiClient);
  const { purchases, loading: purchasesLoading, error: purchasesError } = usePurchases(apiClient);

  // Debug logging
  console.log("Dashboard Debug:", {
    apiLoading,
    apiClient: !!apiClient,
    productsLoading,
    productsError,
    purchasesLoading,
    purchasesError,
    productsCount: products.length,
    purchasesCount: purchases.length,
  });

  // Check if user is authenticated
  const isAuthenticated = apiAuthenticated;
  const hasError = productsError || purchasesError;

  // Calculate stats from real data
  const totalProducts = products.length;
  const totalOrders = purchases.length;
  const totalRevenue = purchases.reduce((sum, purchase) => sum + (purchase.total_amount || 0), 0);
  const growthPercentage = purchases.length > 0
    ? Math.round((purchases.length / Math.max(1, products.length)) * 100)
    : 0;

  return (
    <div class="container mx-auto py-12 px-4">
      {/* Debug Info */}
      <Card class="mb-4">
        <div class="card-body">
          <h3 class="card-title">Debug Info</h3>
          <div class="text-sm">
            <p>API Loading: {apiLoading ? "true" : "false"}</p>
            <p>API Client: {apiClient ? "true" : "false"}</p>
            <p>API Authenticated: {apiAuthenticated ? "true" : "false"}</p>
            <p>Is Authenticated: {isAuthenticated ? "true" : "false"}</p>
            <p>Has Error: {hasError ? "true" : "false"}</p>
            <p>Products Loading: {productsLoading ? "true" : "false"}</p>
            <p>Products Error: {productsError || "none"}</p>
            <p>Purchases Loading: {purchasesLoading ? "true" : "false"}</p>
            <p>Purchases Error: {purchasesError || "none"}</p>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {apiLoading && (
        <Card>
          <div class="card-body text-center">
            <Loading size="lg" />
            <p class="text-sm opacity-70">Initializing dashboard...</p>
          </div>
        </Card>
      )}

      {/* Authentication Check */}
      {!isAuthenticated && !apiLoading && (
        <Card>
          <div class="card-body text-center">
            <div class="avatar placeholder mx-auto mb-4">
              <div class="bg-warning text-warning-content rounded-full w-16">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
            <h3 class="card-title justify-center">Authentication Required</h3>
            <p class="text-sm opacity-70 mb-4">
              Please sign in to access your dashboard and manage your products.
            </p>
            <div class="card-actions justify-center">
              <SimpleAuthButton />
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {hasError && (
        <Card>
          <div class="card-body text-center">
            <div class="avatar placeholder mx-auto mb-4">
              <div class="bg-error text-error-content rounded-full w-16">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
            <h3 class="card-title justify-center">Connection Error</h3>
            <p class="text-sm opacity-70 mb-4">
              {productsError || purchasesError ||
                "Failed to connect to the server. Please try again."}
            </p>
            <div class="card-actions justify-center">
              <Button onClick={() => globalThis.location.reload()} variant="primary">
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Dashboard Content - Only show if authenticated */}
      {isAuthenticated && !hasError && (
        <>
          {/* Stats Overview */}
          <div class="stats shadow w-full mb-8">
            <Stat
              title="My Products"
              value={productsLoading ? "Loading..." : totalProducts}
              description={productsError
                ? "Error loading products"
                : `${totalProducts} active products`}
              figure={
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              }
            />

            <Stat
              title="Total Orders"
              value={purchasesLoading ? "Loading..." : totalOrders}
              description={purchasesError
                ? "Error loading orders"
                : `${totalOrders} orders received`}
              figure={
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            />

            <Stat
              title="Revenue"
              value={purchasesLoading ? "Loading..." : `$${totalRevenue.toFixed(2)}`}
              description={purchasesError ? "Error loading revenue" : "Total revenue earned"}
              figure={
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              }
            />

            <Stat
              title="Growth"
              value={purchasesLoading || productsLoading ? "Loading..." : `${growthPercentage}%`}
              description={purchasesError || productsError
                ? "Error loading data"
                : "Order to product ratio"}
              figure={
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              }
            />
          </div>

          {/* Quick Actions */}
          <div class="mb-8">
            <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button href="/products" variant="primary" size="lg" class="w-full">
                <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create Product
              </Button>

              <Button href="/pricing" variant="secondary" size="lg" class="w-full">
                <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                Manage Pricing
              </Button>

              <Button href="/dashboard/inventory" variant="secondary" size="lg" class="w-full">
                <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                Manage Inventory
              </Button>

              <Button href="/dashboard/orders" variant="secondary" size="lg" class="w-full">
                <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                View Orders
              </Button>
            </div>
          </div>

          {/* Recent Products */}
          <div class="mb-8">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold">Recent Products</h2>
              <Button href="/dashboard/products" variant="outline" size="sm">
                View All
              </Button>
            </div>

            {productsLoading
              ? (
                <Card>
                  <div class="card-body text-center">
                    <Loading size="lg" />
                    <p class="text-sm opacity-70">Loading products...</p>
                  </div>
                </Card>
              )
              : products.length === 0
              ? (
                <Card>
                  <div class="card-body text-center">
                    <div class="avatar placeholder mx-auto mb-4">
                      <div class="bg-neutral text-neutral-content rounded-full w-16">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 class="card-title justify-center">No Products Yet</h3>
                    <p class="text-sm opacity-70 mb-4">
                      Start by creating your first product to begin selling online.
                    </p>
                    <div class="card-actions justify-center">
                      <Button href="/products" variant="primary">
                        Create Your First Product
                      </Button>
                    </div>
                  </div>
                </Card>
              )
              : (
                <div class="overflow-x-auto">
                  <table class="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 5).map((product) => (
                        <tr key={product.id}>
                          <td>
                            <div class="flex items-center space-x-3">
                              <Avatar>
                                {product.thumbnail_url
                                  ? <img src={product.thumbnail_url} alt={product.name} />
                                  : (
                                    <div class="bg-neutral text-neutral-content rounded-lg w-12 h-12 flex items-center justify-center">
                                      <svg
                                        class="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                          stroke-width="2"
                                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                        />
                                      </svg>
                                    </div>
                                  )}
                              </Avatar>
                              <div>
                                <div class="font-bold">{product.name}</div>
                                <div class="text-sm opacity-50">{product.description}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge variant={product.status === "active" ? "success" : "warning"}>
                              {product.status}
                            </Badge>
                          </td>
                          <td>{new Date(product.created_at).toLocaleDateString()}</td>
                          <td>
                            <Button
                              href={`/dashboard/products/${product.id}`}
                              variant="outline"
                              size="sm"
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>

          <Divider />

          {/* Getting Started */}
          <div>
            <h2 class="text-xl font-semibold mb-4">Getting Started</h2>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <div class="card-body">
                  <h3 class="card-title">Create Your First Product</h3>
                  <p class="text-sm opacity-70 mb-4">
                    Start by creating a product with pricing and inventory
                  </p>
                  <div class="card-actions">
                    <Button href="/products" variant="primary" size="sm">
                      Create Product
                    </Button>
                  </div>
                </div>
              </Card>

              <Card>
                <div class="card-body">
                  <h3 class="card-title">Set Up Pricing</h3>
                  <p class="text-sm opacity-70 mb-4">
                    Configure dynamic pricing with formulas and conditions
                  </p>
                  <div class="card-actions">
                    <Button href="/pricing" variant="secondary" size="sm">
                      Manage Pricing
                    </Button>
                  </div>
                </div>
              </Card>

              <Card>
                <div class="card-body">
                  <h3 class="card-title">View Analytics</h3>
                  <p class="text-sm opacity-70 mb-4">
                    Track your sales, revenue, and customer insights
                  </p>
                  <div class="card-actions">
                    <Button href="/dashboard/analytics" variant="secondary" size="sm">
                      View Analytics
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
