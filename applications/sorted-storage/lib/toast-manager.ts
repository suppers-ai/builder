/**
 * Toast notification management system for sorted-storage application
 * Implements requirements 8.2, 8.4 for user feedback
 */

export interface ToastNotification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  duration?: number;
  dismissible?: boolean;
  timestamp: number;
  timeoutId?: number;
  actions?: ToastAction[];
}

export interface ToastAction {
  label: string;
  action: () => void | Promise<void>;
  style?: "primary" | "secondary" | "danger";
}

export interface ToastOptions {
  type?: "info" | "success" | "warning" | "error";
  duration?: number;
  dismissible?: boolean;
  actions?: ToastAction[];
}

class ToastManager {
  private toasts: ToastNotification[] = [];
  private listeners: ((toasts: ToastNotification[]) => void)[] = [];
  private defaultDuration = 5000; // 5 seconds
  private maxToasts = 5; // Maximum number of toasts to show at once

  // Add a new toast notification
  show(message: string, options: ToastOptions = {}): string {
    const id = crypto.randomUUID();
    const toast: ToastNotification = {
      id,
      message,
      type: options.type || "info",
      duration: options.duration ?? this.defaultDuration,
      dismissible: options.dismissible ?? true,
      timestamp: Date.now(),
      actions: options.actions,
    };

    // Auto-dismiss after duration (if duration > 0)
    if (toast.duration && toast.duration > 0) {
      const timeoutId = setTimeout(() => {
        this.dismiss(id);
      }, toast.duration);
      toast.timeoutId = timeoutId;
    }

    // Add toast and limit total number
    this.toasts.push(toast);
    this.limitToasts();
    this.notifyListeners();

    return id;
  }

  // Show success toast
  success(message: string, options: Omit<ToastOptions, "type"> = {}): string {
    return this.show(message, { ...options, type: "success" });
  }

  // Show error toast
  error(message: string, options: Omit<ToastOptions, "type"> = {}): string {
    return this.show(message, {
      ...options,
      type: "error",
      duration: options.duration ?? 8000, // Longer duration for errors
    });
  }

  // Show warning toast
  warning(message: string, options: Omit<ToastOptions, "type"> = {}): string {
    return this.show(message, {
      ...options,
      type: "warning",
      duration: options.duration ?? 6000, // Slightly longer for warnings
    });
  }

  // Show info toast
  info(message: string, options: Omit<ToastOptions, "type"> = {}): string {
    return this.show(message, { ...options, type: "info" });
  }

  // Show loading toast (doesn't auto-dismiss)
  loading(message: string, options: Omit<ToastOptions, "type" | "duration"> = {}): string {
    return this.show(message, {
      ...options,
      type: "info",
      duration: 0, // Don't auto-dismiss
      dismissible: false,
    });
  }

  // Update an existing toast
  update(id: string, message: string, options: Partial<ToastOptions> = {}): boolean {
    const toastIndex = this.toasts.findIndex((toast) => toast.id === id);
    if (toastIndex === -1) {
      return false;
    }

    const toast = this.toasts[toastIndex];

    // Clear existing timeout
    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId);
    }

    // Update toast properties
    toast.message = message;
    if (options.type) toast.type = options.type;
    if (options.dismissible !== undefined) toast.dismissible = options.dismissible;
    if (options.actions) toast.actions = options.actions;

    // Set new duration and timeout
    const duration = options.duration ?? this.defaultDuration;
    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        this.dismiss(id);
      }, duration);
      toast.timeoutId = timeoutId;
    }

    this.notifyListeners();
    return true;
  }

  // Dismiss a specific toast
  dismiss(id: string): void {
    const toastIndex = this.toasts.findIndex((toast) => toast.id === id);
    if (toastIndex !== -1) {
      const toast = this.toasts[toastIndex];
      // Clear timeout if it exists
      if (toast.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
      this.toasts.splice(toastIndex, 1);
      this.notifyListeners();
    }
  }

  // Clear all toasts
  clear(): void {
    // Clear all timeouts
    this.toasts.forEach((toast) => {
      if (toast.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
    });
    this.toasts = [];
    this.notifyListeners();
  }

  // Clear toasts of a specific type
  clearType(type: ToastNotification["type"]): void {
    const toastsToRemove = this.toasts.filter((toast) => toast.type === type);
    toastsToRemove.forEach((toast) => {
      if (toast.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
    });

    this.toasts = this.toasts.filter((toast) => toast.type !== type);
    this.notifyListeners();
  }

  // Get all current toasts
  getToasts(): ToastNotification[] {
    return [...this.toasts];
  }

  // Get toasts of a specific type
  getToastsByType(type: ToastNotification["type"]): ToastNotification[] {
    return this.toasts.filter((toast) => toast.type === type);
  }

  // Check if there are any error toasts
  hasErrors(): boolean {
    return this.toasts.some((toast) => toast.type === "error");
  }

  // Subscribe to toast changes
  subscribe(listener: (toasts: ToastNotification[]) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Notify all listeners of changes
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener([...this.toasts]);
      } catch (error) {
        console.error("Error in toast listener:", error);
      }
    });
  }

  // Limit the number of toasts shown at once
  private limitToasts(): void {
    if (this.toasts.length > this.maxToasts) {
      // Remove oldest toasts first
      const toastsToRemove = this.toasts.splice(0, this.toasts.length - this.maxToasts);
      toastsToRemove.forEach((toast) => {
        if (toast.timeoutId) {
          clearTimeout(toast.timeoutId);
        }
      });
    }
  }

  // Clean up old toasts (called periodically)
  cleanup(): void {
    const now = Date.now();
    const maxAge = 60000; // 60 seconds

    const toastsToRemove = this.toasts.filter((toast) => {
      return (now - toast.timestamp) > maxAge;
    });

    toastsToRemove.forEach((toast) => {
      if (toast.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
    });

    this.toasts = this.toasts.filter((toast) => {
      return (now - toast.timestamp) <= maxAge;
    });

    if (toastsToRemove.length > 0) {
      this.notifyListeners();
    }
  }

  // Show operation progress toast
  showProgress(operation: string, progress?: number): string {
    const message = progress !== undefined
      ? `${operation}... ${Math.round(progress)}%`
      : `${operation}...`;

    return this.loading(message);
  }

  // Update progress toast
  updateProgress(id: string, operation: string, progress: number): boolean {
    const message = `${operation}... ${Math.round(progress)}%`;
    return this.update(id, message);
  }

  // Complete progress toast
  completeProgress(id: string, operation: string, success: boolean = true): void {
    const message = success ? `${operation} completed successfully` : `${operation} failed`;

    this.update(id, message, {
      type: success ? "success" : "error",
      duration: success ? 3000 : 8000,
      dismissible: true,
    });
  }

  // Show network status toast
  showNetworkStatus(isOnline: boolean): string {
    const message = isOnline ? "Connection restored" : "Connection lost - working offline";

    return this.show(message, {
      type: isOnline ? "success" : "warning",
      duration: isOnline ? 3000 : 0, // Keep offline message visible
      dismissible: isOnline,
    });
  }

  // Show batch operation results
  showBatchResult(operation: string, total: number, successful: number, failed: number): string {
    if (failed === 0) {
      return this.success(`${operation}: All ${total} items processed successfully`);
    } else if (successful === 0) {
      return this.error(`${operation}: All ${total} items failed`);
    } else {
      return this.warning(
        `${operation}: ${successful} successful, ${failed} failed out of ${total} items`,
      );
    }
  }
}

// Global toast manager instance
export const toastManager = new ToastManager();

// Convenience functions for global access
export const showToast = (message: string, options?: ToastOptions) =>
  toastManager.show(message, options);

export const showSuccess = (message: string, options?: Omit<ToastOptions, "type">) =>
  toastManager.success(message, options);

export const showError = (message: string, options?: Omit<ToastOptions, "type">) =>
  toastManager.error(message, options);

export const showWarning = (message: string, options?: Omit<ToastOptions, "type">) =>
  toastManager.warning(message, options);

export const showInfo = (message: string, options?: Omit<ToastOptions, "type">) =>
  toastManager.info(message, options);

export const showLoading = (message: string, options?: Omit<ToastOptions, "type" | "duration">) =>
  toastManager.loading(message, options);

export const updateToast = (id: string, message: string, options?: Partial<ToastOptions>) =>
  toastManager.update(id, message, options);

export const dismissToast = (id: string) => toastManager.dismiss(id);

export const clearToasts = () => toastManager.clear();

export const showProgress = (operation: string, progress?: number) =>
  toastManager.showProgress(operation, progress);

export const updateProgress = (id: string, operation: string, progress: number) =>
  toastManager.updateProgress(id, operation, progress);

export const completeProgress = (id: string, operation: string, success?: boolean) =>
  toastManager.completeProgress(id, operation, success);

export const showNetworkStatus = (isOnline: boolean) => toastManager.showNetworkStatus(isOnline);

export const showBatchResult = (
  operation: string,
  total: number,
  successful: number,
  failed: number,
) => toastManager.showBatchResult(operation, total, successful, failed);

// Periodic cleanup
setInterval(() => {
  toastManager.cleanup();
}, 30000); // Clean up every 30 seconds

// Network status monitoring (only in browser environment)
if (typeof window !== "undefined") {
  globalThis.addEventListener("online", () => {
    showNetworkStatus(true);
  });

  globalThis.addEventListener("offline", () => {
    showNetworkStatus(false);
  });
}
