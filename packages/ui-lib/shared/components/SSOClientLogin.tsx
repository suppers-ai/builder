import { useState } from "preact/hooks";
import { useAuthClient } from "../providers/AuthClientProvider.tsx";

interface SSOClientLoginProps {
  providers?: ("google" | "github" | "discord" | "twitter")[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  redirectUri?: string;
}

const providerConfig = {
  google: {
    name: "Google",
    bgColor: "bg-red-500 hover:bg-red-600",
    icon: "🔍",
  },
  github: {
    name: "GitHub",
    bgColor: "bg-gray-800 hover:bg-gray-900",
    icon: "🐙",
  },
  discord: {
    name: "Discord",
    bgColor: "bg-indigo-500 hover:bg-indigo-600",
    icon: "🎮",
  },
  twitter: {
    name: "Twitter",
    bgColor: "bg-blue-400 hover:bg-blue-500",
    icon: "🐦",
  },
};

export function SSOClientLogin({
  providers = ["google", "github"],
  onSuccess,
  onError,
  className = "",
  redirectUri,
}: SSOClientLoginProps) {
  const { login } = useAuthClient();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSSOLogin = async (provider: "google" | "github" | "discord" | "twitter") => {
    setLoadingProvider(provider);
    try {
      // The auth client will handle the OAuth flow
      login(redirectUri);
      onSuccess?.();
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      onError?.(error as Error);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-center text-sm text-gray-600 mb-4">
        Sign in with your social account
      </div>

      {providers.map((provider) => {
        const config = providerConfig[provider];
        const isLoading = loadingProvider === provider;

        return (
          <button
            key={provider}
            onClick={() => handleSSOLogin(provider)}
            disabled={isLoading || loadingProvider !== null}
            className={`
              w-full flex items-center justify-center px-4 py-2 rounded-md text-white font-medium
              ${config.bgColor}
              ${isLoading || loadingProvider !== null ? "opacity-50 cursor-not-allowed" : ""}
              transition-colors duration-200
            `}
          >
            {isLoading
              ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              : (
                <>
                  <span className="mr-2">{config.icon}</span>
                  Continue with {config.name}
                </>
              )}
          </button>
        );
      })}

      <div className="text-center text-xs text-gray-500 mt-4">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  );
}

export default SSOClientLogin;