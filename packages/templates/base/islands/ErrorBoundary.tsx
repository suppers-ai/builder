import { Component, ComponentChildren } from "preact";

interface ErrorBoundaryProps {
  children: ComponentChildren;
  fallback?: ComponentChildren;
  onError?: (error: Error, errorInfo: any) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
  errorId: string;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      errorId: crypto.randomUUID().slice(0, 8)
    };
  }

  static override getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { 
      hasError: true, 
      error,
      errorId: crypto.randomUUID().slice(0, 8)
    };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Store error info for debugging
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: crypto.randomUUID().slice(0, 8)
    });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 my-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-lg font-medium text-red-800 mb-2">
                Component Error
              </h3>
              <div class="text-sm text-red-700 mb-4">
                <p>An error occurred while rendering this component. This is likely a temporary issue.</p>
              </div>
              
              {this.props.showDetails !== false && this.state.error && (
                <details class="mb-4">
                  <summary class="cursor-pointer text-sm font-medium text-red-800 hover:text-red-900">
                    Show error details
                  </summary>
                  <div class="mt-3 space-y-2">
                    <div class="bg-red-100 p-3 rounded text-xs">
                      <div class="font-medium text-red-800 mb-1">Error Message:</div>
                      <div class="text-red-700 font-mono">{this.state.error.message}</div>
                    </div>
                    
                    {this.state.error.stack && (
                      <div class="bg-red-100 p-3 rounded text-xs">
                        <div class="font-medium text-red-800 mb-1">Stack Trace:</div>
                        <pre class="text-red-700 font-mono whitespace-pre-wrap overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    
                    <div class="text-xs text-red-600">
                      Error ID: {this.state.errorId}
                    </div>
                  </div>
                </details>
              )}
              
              <div class="flex space-x-3">
                <button
                  class="bg-red-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
                  onClick={this.handleRetry}
                >
                  Try Again
                </button>
                <button
                  class="bg-red-100 text-red-800 px-4 py-2 text-sm rounded-lg hover:bg-red-200 transition-colors"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </button>
              </div>
              
              <div class="mt-3 text-xs text-red-600">
                If this problem persists, please report it with Error ID: {this.state.errorId}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}