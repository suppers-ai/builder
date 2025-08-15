// Toast notification management system for the admin package

export interface ToastNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  dismissible?: boolean;
  timestamp: number;
  timeoutId?: number;
}

export interface ToastOptions {
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  dismissible?: boolean;
}

class ToastManager {
  private toasts: ToastNotification[] = [];
  private listeners: ((toasts: ToastNotification[]) => void)[] = [];
  private defaultDuration = 5000; // 5 seconds

  // Add a new toast notification
  show(message: string, options: ToastOptions = {}): string {
    const id = crypto.randomUUID();
    const toast: ToastNotification = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration ?? this.defaultDuration,
      dismissible: options.dismissible ?? true,
      timestamp: Date.now(),
    };

    // Auto-dismiss after duration (if duration > 0)
    if (toast.duration && toast.duration > 0) {
      const timeoutId = setTimeout(() => {
        this.dismiss(id);
      }, toast.duration);
      toast.timeoutId = timeoutId;
    }

    this.toasts.push(toast);
    this.notifyListeners();

    return id;
  }

  // Show success toast
  success(message: string, options: Omit<ToastOptions, 'type'> = {}): string {
    return this.show(message, { ...options, type: 'success' });
  }

  // Show error toast
  error(message: string, options: Omit<ToastOptions, 'type'> = {}): string {
    return this.show(message, { 
      ...options, 
      type: 'error',
      duration: options.duration ?? 8000, // Longer duration for errors
    });
  }

  // Show warning toast
  warning(message: string, options: Omit<ToastOptions, 'type'> = {}): string {
    return this.show(message, { ...options, type: 'warning' });
  }

  // Show info toast
  info(message: string, options: Omit<ToastOptions, 'type'> = {}): string {
    return this.show(message, { ...options, type: 'info' });
  }

  // Dismiss a specific toast
  dismiss(id: string): void {
    const toastIndex = this.toasts.findIndex(toast => toast.id === id);
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
    this.toasts.forEach(toast => {
      if (toast.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
    });
    this.toasts = [];
    this.notifyListeners();
  }

  // Get all current toasts
  getToasts(): ToastNotification[] {
    return [...this.toasts];
  }

  // Subscribe to toast changes
  subscribe(listener: (toasts: ToastNotification[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.toasts]);
      } catch (error) {
        console.error('Error in toast listener:', error);
      }
    });
  }

  // Clean up old toasts (called periodically)
  cleanup(): void {
    const now = Date.now();
    const maxAge = 30000; // 30 seconds
    
    this.toasts = this.toasts.filter(toast => {
      return (now - toast.timestamp) < maxAge;
    });
    
    this.notifyListeners();
  }
}

// Global toast manager instance
export const toastManager = new ToastManager();

// Convenience functions for global access
export const showToast = (message: string, options?: ToastOptions) => 
  toastManager.show(message, options);

export const showSuccess = (message: string, options?: Omit<ToastOptions, 'type'>) => 
  toastManager.success(message, options);

export const showError = (message: string, options?: Omit<ToastOptions, 'type'>) => 
  toastManager.error(message, options);

export const showWarning = (message: string, options?: Omit<ToastOptions, 'type'>) => 
  toastManager.warning(message, options);

export const showInfo = (message: string, options?: Omit<ToastOptions, 'type'>) => 
  toastManager.info(message, options);

// Periodic cleanup
setInterval(() => {
  toastManager.cleanup();
}, 10000); // Clean up every 10 seconds