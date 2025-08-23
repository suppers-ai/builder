import PricingList from "../../islands/PricingList.tsx";

export default function PricingPage() {
  return (
    <div>
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Pricing Management</h1>
        <p class="mt-2 text-gray-600">Manage your pricing strategies and formulas.</p>
      </div>
      <PricingList />
    </div>
  );
}
