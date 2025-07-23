import { type PageProps } from "fresh";
import { useEffect } from "preact/hooks";
import { useAuthClient } from "@suppers/ui-lib/shared/providers/AuthClientProvider.tsx";

export default function AuthCallback(props: PageProps) {
  const { authClient } = useAuthClient();

  useEffect(() => {
    // Auth client will handle the callback automatically
    // Redirect to home after successful auth
    const timer = setTimeout(() => {
      globalThis.location.href = "/";
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4">
        </div>
        <h2 className="text-xl font-semibold mb-2">Processing Authentication</h2>
        <p className="text-gray-600">Please wait while we complete your login...</p>
      </div>
    </div>
  );
}
