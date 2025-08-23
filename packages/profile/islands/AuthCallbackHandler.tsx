/**
 * Auth Callback Handler Island
 * Handles OAuth callback processing
 */

import { useEffect, useState } from "preact/hooks";

interface AuthCallbackHandlerProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

export default function AuthCallbackHandler({ onSuccess, onError }: AuthCallbackHandlerProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(error);
          onError?.(error);
          return;
        }

        if (code) {
          // Process auth code
          setStatus('success');
          setMessage('Authentication successful');
          onSuccess?.({ code });
        } else {
          setStatus('error');
          setMessage('No authorization code received');
          onError?.('No authorization code received');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Authentication failed');
        onError?.(error instanceof Error ? error.message : String(error));
      }
    };

    handleCallback();
  }, [onSuccess, onError]);

  return (
    <div class="flex items-center justify-center min-h-screen">
      <div class="card w-96 bg-base-100 shadow-xl">
        <div class="card-body text-center">
          {status === 'loading' && (
            <>
              <span class="loading loading-spinner loading-lg"></span>
              <h2 class="card-title">Processing Authentication...</h2>
            </>
          )}
          {status === 'success' && (
            <>
              <div class="text-success text-4xl">✓</div>
              <h2 class="card-title text-success">Success!</h2>
              <p>{message}</p>
            </>
          )}
          {status === 'error' && (
            <>
              <div class="text-error text-4xl">✗</div>
              <h2 class="card-title text-error">Error</h2>
              <p>{message}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}