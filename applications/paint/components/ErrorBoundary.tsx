import { Component, ComponentChildren } from "preact";
import { AlertTriangle, RefreshCw } from "lucide-preact";
import { showError } from "../lib/toast-manager.ts";

interface ErrorBoundaryProps {
  children: ComponentChildren;
  fallback?: ComponentChildren;
  onError?: (error: Error, errorInfo: any) => void;
  context?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static override getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Show toast notification
    const context = this.props.context || "Application";
    showError(`${context} Error: ${error.message}`, {
      duration: 8000,
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

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div class="flex flex-col items-center justify-center p-8 bg-base-100 rounded-lg border border-error/20">
          <AlertTriangle class="w-16 h-16 text-error mb-4" />

          <h3 class="text-lg font-semibold text-base-content mb-2">
            Something went wrong
          </h3>

          <p class="text-base-content/70 text-center mb-4 max-w-md">
            {this.props.context || "The application"}{" "}
            encountered an unexpected error. Please try again or refresh the page.
          </p>

          {/* Error details (only in development) */}
          {Deno.env.get("DENO_ENV") === "development" && this.state.error && (
            <details class="mb-4 w-full max-w-md">
              <summary class="cursor-pointer text-sm text-base-content/60 hover:text-base-content">
                Error Details
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
            <button
              onClick={this.handleRetry}
              class="btn btn-primary btn-sm"
            >
              <RefreshCw class="w-4 h-4 mr-2" />
              Try Again
            </button>

            <button
              onClick={() => globalThis.location.reload()}
              class="btn btn-outline btn-sm"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Canvas-specific error boundary with specialized error handling
export function CanvasErrorBoundary({ children }: { children: ComponentChildren }) {
  const handleCanvasError = (error: Error, errorInfo: any) => {
    // Log canvas-specific error details
    console.error("Canvas Error Details:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // You could send this to an error reporting service here
  };

  return (
    <ErrorBoundary
      context="Canvas"
      onError={handleCanvasError}
      fallback={
        <div class="flex flex-col items-center justify-center p-8 bg-base-100 rounded-lg border border-error/20 min-h-[400px]">
          <AlertTriangle class="w-16 h-16 text-error mb-4" />

          <h3 class="text-lg font-semibold text-base-content mb-2">
            Canvas Error
          </h3>

          <p class="text-base-content/70 text-center mb-4 max-w-md">
            The drawing canvas encountered an error. This might be due to:
          </p>

          <ul class="text-sm text-base-content/60 mb-4 space-y-1">
            <li>• Browser compatibility issues</li>
            <li>• Memory limitations</li>
            <li>• Corrupted drawing data</li>
            <li>• Network connectivity problems</li>
          </ul>

          <div class="flex gap-2">
            <button
              onClick={() => globalThis.location.reload()}
              class="btn btn-primary btn-sm"
            >
              <RefreshCw class="w-4 h-4 mr-2" />
              Restart Canvas
            </button>

            <a href="/gallery" class="btn btn-outline btn-sm">
              Go to Gallery
            </a>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
