import EntitiesList from "../../islands/EntitiesList.tsx";

export default function EntitiesPage() {
  return (
    <div>
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">My Entities</h1>
        <p class="mt-2 text-gray-600">Manage your entities and their configurations.</p>
      </div>
      <EntitiesList isAdmin={false} />
    </div>
  );
}
