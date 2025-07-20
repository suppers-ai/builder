import { useCallback, useState } from "preact/hooks";

export interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface AsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  resetOnStart?: boolean;
}

/**
 * Hook for managing async operations with loading, error, and success states
 */
export function useAsyncOperation<T = any>(
  options: AsyncOperationOptions = {},
) {
  const { onSuccess, onError, resetOnStart = true } = options;

  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (operation: () => Promise<T>) => {
    if (resetOnStart) {
      setState((prev) => ({ ...prev, loading: true, error: null, success: false }));
    } else {
      setState((prev) => ({ ...prev, loading: true, error: null }));
    }

    try {
      const result = await operation();
      setState((prev) => ({ ...prev, data: result, loading: false, success: true }));
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage, success: false }));
      onError?.(error as Error);
      throw error;
    }
  }, [onSuccess, onError, resetOnStart]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error, loading: false, success: false }));
  }, []);

  const setSuccess = useCallback((success: boolean) => {
    setState((prev) => ({ ...prev, success, error: success ? null : prev.error }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setError,
    setSuccess,
  };
}
