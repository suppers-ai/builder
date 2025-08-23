import ProductsList from "../../islands/ProductsList.tsx";

export default function ProductsPage() {
  return (
    <div>
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">My Products</h1>
        <p class="mt-2 text-gray-600">Manage your products and their configurations.</p>
      </div>
      <ProductsList />
    </div>
  );
}
