export default function ProtectedRouteDemo() {
  return (
    <div class="px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">ProtectedRoute Component</h1>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Route Protection</h2>
          <p class="text-gray-600 mb-4">
            ProtectedRoute component ensures that only authenticated users can access specific
            routes.
          </p>

          <pre class="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
