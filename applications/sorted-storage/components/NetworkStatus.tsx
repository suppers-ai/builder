import { useEffect, useState } from "preact/hooks";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-preact";
import { showNetworkStatus } from "../lib/toast-manager.ts";

interface NetworkStatusProps {
  onStatusChange?: (isOnline: boolean) => void;
  showToasts?: boolean;
}

export function NetworkStatus({ onStatusChange, showToasts = true }: NetworkStatusProps) {
  // Start with true to avoid showing offline message during SSR
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Check actual online status on client side
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline && showToasts) {
        showNetworkStatus(true);
      }
      setWasOffline(false);
      onStatusChange?.(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      if (showToasts) {
        showNetworkStatus(false);
      }
      onStatusChange?.(false);
    };

    globalThis.addEventListener("online", handleOnline);
    globalThis.addEventListener("offline", handleOffline);

    return () => {
      globalThis.removeEventListener("online", handleOnline);
      globalThis.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline, showToasts, onStatusChange]);

  // Don't render anything if online
  if (isOnline) {
    return null;
  }

  return (
    <div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div class="alert alert-warning shadow-lg max-w-sm">
        <WifiOff class="w-5 h-5" />
        <div>
          <h3 class="font-bold">You're offline</h3>
          <div class="text-xs">Some features may not work properly</div>
        </div>
      </div>
    </div>
  );
}

// Hook for network status
export function useNetworkStatus() {
  // Start with true to avoid showing offline message during SSR
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>("unknown");

  useEffect(() => {
    // Check actual online status on client side
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Get connection type if available
    const connection = (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      setConnectionType(connection.effectiveType || connection.type || "unknown");

      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || connection.type || "unknown");
      };

      connection.addEventListener("change", handleConnectionChange);

      return () => {
        connection.removeEventListener("change", handleConnectionChange);
      };
    }

    globalThis.addEventListener("online", handleOnline);
    globalThis.addEventListener("offline", handleOffline);

    return () => {
      globalThis.removeEventListener("online", handleOnline);
      globalThis.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isSlowConnection: connectionType === "slow-2g" || connectionType === "2g",
  };
}

// Offline banner component
export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const [showBanner, setShowBanner] = useState(!isOnline);

  useEffect(() => {
    if (isOnline) {
      // Hide banner after a delay when coming back online
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowBanner(true);
    }
  }, [isOnline]);

  if (!showBanner) {
    return null;
  }

  return (
    <div
      class={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isOnline ? "bg-success text-success-content" : "bg-warning text-warning-content"
      }`}
    >
      <div class="container mx-auto px-4 py-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            {isOnline ? <Wifi class="w-4 h-4" /> : <WifiOff class="w-4 h-4" />}
            <span class="text-sm font-medium">
              {isOnline ? "Connection restored" : "You are currently offline"}
            </span>
          </div>

          {!isOnline && (
            <button
              onClick={() => globalThis.location.reload()}
              class="btn btn-xs btn-ghost"
              title="Retry connection"
            >
              <RefreshCw class="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Network-aware component wrapper
export function NetworkAware({
  children,
  fallback,
  requiresNetwork = false,
}: {
  children: any;
  fallback?: any;
  requiresNetwork?: boolean;
}) {
  const { isOnline } = useNetworkStatus();

  if (requiresNetwork && !isOnline) {
    return fallback || (
      <div class="flex flex-col items-center justify-center p-8 text-center">
        <WifiOff class="w-16 h-16 text-base-content/30 mb-4" />
        <h3 class="text-lg font-semibold mb-2">No Internet Connection</h3>
        <p class="text-base-content/60 mb-4">
          This feature requires an internet connection to work properly.
        </p>
        <button
          onClick={() => globalThis.location.reload()}
          class="btn btn-primary btn-sm"
        >
          <RefreshCw class="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return children;
}

// Connection quality indicator
export function ConnectionQuality() {
  const { isOnline, connectionType, isSlowConnection } = useNetworkStatus();

  if (!isOnline) {
    return (
      <div class="flex items-center gap-1 text-error text-xs">
        <WifiOff class="w-3 h-3" />
        <span>Offline</span>
      </div>
    );
  }

  if (isSlowConnection) {
    return (
      <div class="flex items-center gap-1 text-warning text-xs">
        <AlertTriangle class="w-3 h-3" />
        <span>Slow connection</span>
      </div>
    );
  }

  return (
    <div class="flex items-center gap-1 text-success text-xs">
      <Wifi class="w-3 h-3" />
      <span>Online</span>
    </div>
  );
}
