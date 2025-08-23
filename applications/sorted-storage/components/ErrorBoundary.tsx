import { Component, ComponentChildren } from "preact";
import { AlertTriangle, Home, RefreshCw, Wifi, WifiOff } from "lucide-preact";
import { showError } from "../lib/error-handler.ts";
import type { ErrorContext, StorageError } from "../types/errors.ts";

interface ErrorBoundaryProps {
  children: ComponentChildren;
  fallback?: ComponentChildren;
  onError?: (error: Error, errorInfo: any) => void;
  context?: string;
  showRetry?: boolean;
  showHome?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  isOnline: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isOnline: navigator.onLine,
    };
  }

  static override getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidMount() {
    // Listen for online/offline events
    globalThis.addEventListener("online", this.handleOnline);
    globalThis.addEventListener("offline", this.handleOffline);
  }

  override componentWillUnmount() {
    globalThis.removeEventListener("online", this.handleOnline);
    globalThis.removeEventListener("offline", this.handleOffline);
  }

  handleOnline = () => {
    this.setState({ isOnline: true });
  };

  handleOffline = () => {
    this.setState({ isOnline: false });
  };

  override componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Create error context for better debugging
    const context: ErrorContext = {
      operation: this.props.context || "unknown",
      resourceType: "user", // Default, can be overridden
      userId: undefined, // Would be set from auth context
      sessionId: crypto.randomUUID(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    // Show toast notification
    const contextName = this.props.context || "Application";
    showError(`${contextName} Error: ${error.message}`, {
      duration: 8000,
      recoverable: true,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        console.error("Error in custom error handler:", handlerError);
      }
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    globalThis.location.href = "/";
  };

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Determine error type and appropriate message
      const isNetworkError = this.state.error?.message.includes("fetch") ||
        this.state.error?.message.includes("network") ||
        !this.state.isOnline;

      // Default error UI
      return (
        <div class="flex flex-col items-center justify-center p-8 bg-base-100 rounded-lg border border-error/20 min-h-[400px]">
          {/* Network status indicator */}
          <div class="flex items-center gap-2 mb-4">
            {this.state.isOnline
              ? <Wifi class="w-5 h-5 text-success" />
              : <WifiOff class="w-5 h-5 text-error" />}
            <span class={`text-sm ${this.state.isOnline ? "text-success" : "text-error"}`}>
              {this.state.isOnline ? "Online" : "Offline"}
            </span>
          </div>

          <AlertTriangle class="w-16 h-16 text-error mb-4" />

          <h3 class="text-lg font-semibold text-base-content mb-2">
            {isNetworkError ? "Connection Problem" : "Something went wrong"}
          </h3>

          <p class="text-base-content/70 text-center mb-4 max-w-md">
            {isNetworkError
              ? (
                <>
                  Unable to connect to the server. Please check your internet connection and try
                  again.
                </>
              )
              : (
                <>
                  {this.props.context || "The application"}{" "}
                  encountered an unexpected error. Please try again or refresh the page.
                </>
              )}
          </p>

          {/* Helpful suggestions based on error type */}
          {isNetworkError && (
            <div class="bg-base-200 rounded-lg p-4 mb-4 max-w-md">
              <h4 class="font-medium text-base-content mb-2">Try these steps:</h4>
              <ul class="text-sm text-base-content/70 space-y-1">
                <li>• Check your internet connection</li>
                <li>• Refresh the page</li>
                <li>• Try again in a few moments</li>
                <li>• Contact support if the problem persists</li>
              </ul>
            </div>
          )}

          {/* Error details (only in development) */}
          {Deno.env.get("DENO_ENV") === "development" && this.state.error && (
            <details class="mb-4 w-full max-w-md">
              <summary class="cursor-pointer text-sm text-base-content/60 hover:text-base-content">
                Error Details (Development)
              </summary>
              <div class="mt-2 p-3 bg-base-200 rounded text-xs font-mono text-base-content/80 overflow-auto max-h-32">
                <div class="font-semibold mb-1">Error:</div>
                <div class="mb-2">{this.state.error.message}</div>
                <div class="font-semibold mb-1">Stack:</div>
                <div class="whitespace-pre-wrap">{this.state.error.stack}</div>
              </div>
            </details>
          )}

          <div class="flex gap-2">
            {(this.props.showRetry !== false) && (
              <button
                onClick={this.handleRetry}
                class="btn btn-primary btn-sm"
              >
                <RefreshCw class="w-4 h-4 mr-2" />
                Try Again
              </button>
            )}

            <button
              onClick={() => globalThis.location.reload()}
              class="btn btn-outline btn-sm"
            >
              Refresh Page
            </button>

            {(this.props.showHome !== false) && (
              <button
                onClick={this.handleGoHome}
                class="btn btn-ghost btn-sm"
              >
                <Home class="w-4 h-4 mr-2" />
                Go Home
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Storage-specific error boundary with specialized error handling
export function StorageErrorBoundary({ children }: { children: ComponentChildren }) {
  const handleStorageError = (error: Error, errorInfo: any) => {
    // Log storage-specific error details
    console.error("Storage Error Details:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: globalThis.location.href,
    });

    // You could send this to an error reporting service here
    // Example: errorReportingService.report({ error, errorInfo, context: 'storage' });
  };

  return (
    <ErrorBoundary
      context="Storage"
      onError={handleStorageError}
      fallback={
        <div class="flex flex-col items-center justify-center p-8 bg-base-100 rounded-lg border border-error/20 min-h-[400px]">
          <AlertTriangle class="w-16 h-16 text-error mb-4" />

          <h3 class="text-lg font-semibold text-base-content mb-2">
            Storage Error
          </h3>

          <p class="text-base-content/70 text-center mb-4 max-w-md">
            The storage system encountered an error. This might be due to:
          </p>

          <ul class="text-sm text-base-content/60 mb-4 space-y-1">
            <li>• Network connectivity issues</li>
            <li>• Server maintenance</li>
            <li>• Storage quota exceeded</li>
            <li>• File corruption or access problems</li>
          </ul>

          <div class="flex gap-2">
            <button
              onClick={() => globalThis.location.reload()}
              class="btn btn-primary btn-sm"
            >
              <RefreshCw class="w-4 h-4 mr-2" />
              Reload Storage
            </button>

            <a href="/" class="btn btn-outline btn-sm">
              <Home class="w-4 h-4 mr-2" />
              Go Home
            </a>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Upload-specific error boundary
export function UploadErrorBoundary({ children }: { children: ComponentChildren }) {
  return (
    <ErrorBoundary
      context="File Upload"
      fallback={
        <div class="flex flex-col items-center justify-center p-6 bg-base-100 rounded-lg border border-error/20">
          <AlertTriangle class="w-12 h-12 text-error mb-3" />

          <h4 class="text-base font-semibold text-base-content mb-2">
            Upload Error
          </h4>

          <p class="text-sm text-base-content/70 text-center mb-4">
            File upload encountered an error. Please try uploading again.
          </p>

          <button
            onClick={() => globalThis.location.reload()}
            class="btn btn-primary btn-sm"
          >
            <RefreshCw class="w-4 h-4 mr-2" />
            Reset Upload
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
