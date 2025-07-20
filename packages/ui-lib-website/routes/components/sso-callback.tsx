export default function SSOCallbackDemo() {
  return (
    <div class="px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">SSOCallback Component</h1>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">OAuth Callback Handler</h2>
          <p class="text-gray-600 mb-4">
            SSOCallback component handles OAuth callback responses from authentication providers.
          </p>

          <pre class="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<SSOCallback
  onSuccess={(session) => handleSuccess(session)}
  onError={(error) => handleError(error)}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
