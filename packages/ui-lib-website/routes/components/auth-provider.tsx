export default function AuthProviderDemo() {
  return (
    <div class="px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">AuthProvider Component</h1>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Provider Component</h2>
          <p class="text-gray-600 mb-4">
            AuthProvider is a context provider that wraps your application to provide authentication
            state and methods.
          </p>

          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div class="flex">
              <div class="ml-3">
                <p class="text-sm text-blue-700">
                  This component is typically used at the root of your application and doesn't
                  render any UI itself.
                </p>
              </div>
            </div>
          </div>

          <h3 class="text-lg font-semibold text-gray-900 mb-2">Usage</h3>
          <pre class="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import { AuthProvider } from 'jsr:@suppers/ui-lib';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}`}
          </pre>

          <h3 class="text-lg font-semibold text-gray-900 mb-2 mt-6">useAuth Hook</h3>
          <pre class="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import { useAuth } from 'jsr:@suppers/ui-lib';

function MyComponent() {
  const { user, signIn, signOut, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <button onClick={() => signIn(credentials)}>Sign In</button>
      )}
    </div>
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
