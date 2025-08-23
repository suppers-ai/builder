/**
 * OAuth Handler Island
 * Handles OAuth provider redirects and authentication flows
 */

import { useState } from "preact/hooks";

interface OAuthHandlerProps {
  providers?: string[];
  redirectUrl?: string;
  onProviderSelect?: (provider: string) => void;
}

export default function OAuthHandler({ 
  providers = ['google', 'github'],
  redirectUrl = '/auth/callback',
  onProviderSelect 
}: OAuthHandlerProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleProviderClick = async (provider: string) => {
    setLoading(provider);
    try {
      // Construct OAuth URL
      const authUrl = new URL(`/auth/${provider}`, window.location.origin);
      authUrl.searchParams.set('redirect', redirectUrl);
      
      onProviderSelect?.(provider);
      
      // Redirect to OAuth provider
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error(`Failed to initiate ${provider} OAuth:`, error);
      setLoading(null);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return '🔍';
      case 'github':
        return '🐙';
      case 'discord':
        return '🎮';
      case 'twitter':
        return '🐦';
      default:
        return '🔐';
    }
  };

  return (
    <div class="space-y-3">
      {providers.map((provider) => (
        <button
          key={provider}
          class={`btn btn-outline w-full ${loading === provider ? 'loading' : ''}`}
          onClick={() => handleProviderClick(provider)}
          disabled={loading !== null}
        >
          {loading === provider ? (
            <span class="loading loading-spinner"></span>
          ) : (
            <>
              <span>{getProviderIcon(provider)}</span>
              <span>Continue with {provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}