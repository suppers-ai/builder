/**
 * Utility functions and helpers for DirectAuthClient
 */

/**
 * Create a promise that rejects after a timeout
 */
export function createTimeoutRejectPromise(
  timeoutMs: number,
  timeoutMessage: string = "Operation timed out"
): Promise<never> {
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${timeoutMessage} (${timeoutMs}ms)`));
    }, timeoutMs);
  });
}

/**
 * Race a promise against a timeout, rejecting on timeout
 */
export async function withTimeoutReject<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<T> {
  const timeoutPromise = createTimeoutRejectPromise(timeoutMs, timeoutMessage);
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Wrap a Supabase operation with timeout handling
 */
export async function withSupabaseTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number = 10000,
  operationName: string = "Supabase operation"
): Promise<T> {
  try {
    return await withTimeoutReject(
      operation,
      timeoutMs,
      `${operationName} timeout - please try again`
    );
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`${operationName} failed: ${String(error)}`);
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength (basic validation)
 */
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long" };
  }
  
  return { valid: true };
}

/**
 * Sanitize user input for display
 */
export function sanitizeUserInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

/**
 * Handle Supabase errors and convert to user-friendly messages
 */
export function handleSupabaseError(error: any): string {
  if (!error) {
    return "An unexpected error occurred";
  }

  // Handle common Supabase error codes
  if (error.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes("invalid login credentials")) {
      return "Invalid email or password";
    }
    
    if (message.includes("email not confirmed")) {
      return "Please check your email and click the confirmation link";
    }
    
    if (message.includes("user already registered")) {
      return "An account with this email already exists";
    }
    
    if (message.includes("password should be at least")) {
      return "Password must be at least 6 characters long";
    }
    
    if (message.includes("invalid email")) {
      return "Please enter a valid email address";
    }
    
    if (message.includes("row-level security policy")) {
      return "Access denied. Please try signing in again.";
    }
    
    if (message.includes("timeout") || message.includes("network")) {
      return "Connection timeout. Please check your internet connection and try again.";
    }
    
    // Return the original message if it's user-friendly
    if (message.length < 100 && !message.includes("pgrst") && !message.includes("jwt")) {
      return error.message;
    }
  }
  
  // Fallback for unknown errors
  return "An unexpected error occurred. Please try again.";
}

/**
 * Log error with context
 */
export function logError(context: string, error: any, additionalInfo?: Record<string, any>): void {
  console.error(`DirectAuthClient [${context}]:`, error, additionalInfo || "");
}

/**
 * Log info with context
 */
export function logInfo(context: string, message: string, additionalInfo?: Record<string, any>): void {
  console.log(`DirectAuthClient [${context}]: ${message}`, additionalInfo || "");
}

/**
 * Log warning with context
 */
export function logWarning(context: string, message: string, additionalInfo?: Record<string, any>): void {
  console.warn(`DirectAuthClient [${context}]: ${message}`, additionalInfo || "");
}

/**
 * Safely get item from localStorage
 */
export function safeLocalStorageGet(key: string): string | null {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      logError("localStorage", "Failed to get item", { key, error });
      return null;
    }
  }
  return null;
}

/**
 * Safely set item in localStorage
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      logError("localStorage", "Failed to set item", { key, error });
      return false;
    }
  }
  return false;
}

/**
 * Safely remove item from localStorage
 */
export function safeLocalStorageRemove(key: string): boolean {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      logError("localStorage", "Failed to remove item", { key, error });
      return false;
    }
  }
  return false;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}