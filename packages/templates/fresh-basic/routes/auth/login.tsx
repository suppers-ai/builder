import { type PageProps } from "fresh";
import { useAuthClient } from "@packages/ui-lib/shared/providers/AuthClientProvider.tsx";
import { SSOClientLogin } from "@packages/ui-lib/shared/components/SSOClientLogin.tsx";

export default function Login(props: PageProps) {
  const { user, loading } = useAuthClient();

  // Redirect if already authenticated
  if (user && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-4">Already Logged In</h1>
          <p className="text-gray-600 mb-4">Redirecting you...</p>
          <script>
            {`window.location.href = "/";`}
          </script>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Fresh Basic App
          </h1>
          <h2 className="text-xl text-gray-600">
            Sign in to your account
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SSOClientLogin
            providers={["google", "github"]}
            redirectUri={typeof window !== "undefined" ? window.location.origin + "/auth/callback" : ""}
            onSuccess={() => {
              console.log("Login successful");
            }}
            onError={(error) => {
              console.error("Login error:", error);
            }}
          />
          
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}