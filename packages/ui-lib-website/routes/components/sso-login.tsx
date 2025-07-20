import { SSOLogin } from "../../shared/components/SSOLogin.tsx";

export default function SSOLoginDemo() {
  const handleSuccess = () => {
    console.log("SSO login successful");
  };

  const handleError = (error: Error) => {
    console.error("SSO login error:", error);
  };

  return (
    <div class="px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">SSOLogin Component</h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">All Providers</h2>
            <SSOLogin
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Selected Providers</h2>
            <SSOLogin
              providers={["google", "github"]}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>
        </div>

        <div class="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Usage</h2>
          <pre class="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<SSOLogin
  providers={['google', 'github', 'discord']}
  onSuccess={handleSuccess}
  onError={handleError}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
