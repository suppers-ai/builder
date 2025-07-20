import { useAuthClient } from "@packages/ui-lib/shared/providers/AuthClientProvider.tsx";
import { UserClientAvatar } from "@packages/ui-lib/shared/components/UserClientAvatar.tsx";

export default function Home() {
  const { user, loading, login, logout, isAuthenticated } = useAuthClient();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Fresh Basic App
          </h1>
          <p className="text-xl text-gray-600">
            Welcome to your SSO-enabled Fresh application
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {isAuthenticated()
            ? (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <UserClientAvatar user={user!} size="lg" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Welcome, {user!.name || user!.email}!
                    </h2>
                    <p className="text-gray-600">{user!.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-700">
                    You are successfully authenticated via SSO.
                  </p>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => logout()}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )
            : (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Authentication Required
                </h2>
                <p className="text-gray-600 mb-6">
                  Please sign in to access the application.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => login()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Sign In
                  </button>

                  <p className="text-sm text-gray-500">
                    Or visit the{" "}
                    <a href="/auth/login" className="text-blue-600 hover:text-blue-500">
                      login page
                    </a>
                  </p>
                </div>
              </div>
            )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            About This App
          </h3>
          <div className="space-y-3 text-gray-700">
            <p>
              This is a Fresh application integrated with the Suppers Store SSO system.
            </p>
            <p>
              Key features:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Single Sign-On (SSO) authentication</li>
              <li>OAuth integration with Google and GitHub</li>
              <li>Centralized user management</li>
              <li>Secure token-based authentication</li>
              <li>Fresh framework with Preact</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
