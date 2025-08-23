import { useState } from "preact/hooks";

export default function TestComponent() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div class="flex justify-center items-center min-h-screen">
        <div class="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div class="container mx-auto px-4 py-8">
      <h1>Test Component</h1>
    </div>
  );
}