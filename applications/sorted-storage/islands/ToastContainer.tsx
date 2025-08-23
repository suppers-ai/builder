import { useEffect, useState } from "preact/hooks";
import { type ToastAction, toastManager, type ToastNotification } from "../lib/toast-manager.ts";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  Wifi,
  WifiOff,
  X,
} from "lucide-preact";

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    // Subscribe to toast changes
    const unsubscribe = toastManager.subscribe(setToasts);

    // Get initial toasts
    setToasts(toastManager.getToasts());

    return unsubscribe;
  }, []);

  const handleDismiss = (id: string) => {
    toastManager.dismiss(id);
  };

  const handleAction = async (action: ToastAction, toastId: string) => {
    try {
      await action.action();
      // Optionally dismiss toast after successful action
      handleDismiss(toastId);
    } catch (error) {
      console.error("Error executing toast action:", error);
      // Show error toast for failed action
      toastManager.error("Action failed. Please try again.");
    }
  };

  const getIcon = (type: ToastNotification["type"], message: string) => {
    // Special handling for loading/progress messages
    if (message.includes("...") && (message.includes("%") || type === "info")) {
      return <Loader2 class="w-5 h-5 animate-spin" />;
    }

    // Special handling for network status
    if (message.includes("Connection restored") || message.includes("online")) {
      return <Wifi class="w-5 h-5" />;
    }
    if (message.includes("Connection lost") || message.includes("offline")) {
      return <WifiOff class="w-5 h-5" />;
    }

    // Default icons by type
    switch (type) {
      case "success":
        return <CheckCircle class="w-5 h-5" />;
      case "error":
        return <AlertCircle class="w-5 h-5" />;
      case "warning":
        return <AlertTriangle class="w-5 h-5" />;
      case "info":
      default:
        return <Info class="w-5 h-5" />;
    }
  };

  const getAlertClass = (type: ToastNotification["type"]) => {
    switch (type) {
      case "success":
        return "alert-success";
      case "error":
        return "alert-error";
      case "warning":
        return "alert-warning";
      case "info":
      default:
        return "alert-info";
    }
  };

  const getActionButtonClass = (style?: ToastAction["style"]) => {
    switch (style) {
      case "primary":
        return "btn-primary";
      case "danger":
        return "btn-error";
      case "secondary":
      default:
        return "btn-outline";
    }
  };

  const getAnimationClass = (index: number) => {
    // Stagger animations for multiple toasts
    const delay = index * 100;
    return `animate-in slide-in-from-right duration-300 delay-[${delay}ms]`;
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div class="toast toast-top toast-end z-50 max-w-sm">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          class={`alert ${getAlertClass(toast.type)} shadow-lg mb-2 ${getAnimationClass(index)}`}
          role="alert"
          aria-live={toast.type === "error" ? "assertive" : "polite"}
        >
          <div class="flex items-start gap-3 w-full">
            <div class="flex-shrink-0 mt-0.5">
              {getIcon(toast.type, toast.message)}
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium break-words leading-relaxed">
                {toast.message}
              </p>

              {/* Action buttons */}
              {toast.actions && toast.actions.length > 0 && (
                <div class="flex gap-2 mt-2">
                  {toast.actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={() => handleAction(action, toast.id)}
                      class={`btn btn-xs ${getActionButtonClass(action.style)}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {toast.dismissible && (
              <button
                onClick={() => handleDismiss(toast.id)}
                class="flex-shrink-0 btn btn-ghost btn-xs btn-circle ml-2 hover:bg-base-content/10"
                aria-label="Dismiss notification"
                title="Dismiss"
              >
                <X class="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress bar for loading toasts */}
          {toast.message.includes("%") && (
            <div class="w-full mt-2">
              <div class="w-full bg-base-content/20 rounded-full h-1">
                <div
                  class="bg-current h-1 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      Math.min(
                        100,
                        Math.max(0, parseInt(toast.message.match(/(\d+)%/)?.[1] || "0")),
                      )
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Timestamp for persistent toasts */}
          {toast.duration === 0 && (
            <div class="text-xs opacity-60 mt-1">
              {new Date(toast.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Hook for using toast manager in components
export function useToast() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    setToasts(toastManager.getToasts());
    return unsubscribe;
  }, []);

  return {
    toasts,
    show: toastManager.show.bind(toastManager),
    success: toastManager.success.bind(toastManager),
    error: toastManager.error.bind(toastManager),
    warning: toastManager.warning.bind(toastManager),
    info: toastManager.info.bind(toastManager),
    loading: toastManager.loading.bind(toastManager),
    dismiss: toastManager.dismiss.bind(toastManager),
    clear: toastManager.clear.bind(toastManager),
    update: toastManager.update.bind(toastManager),
    showProgress: toastManager.showProgress.bind(toastManager),
    updateProgress: toastManager.updateProgress.bind(toastManager),
    completeProgress: toastManager.completeProgress.bind(toastManager),
    showBatchResult: toastManager.showBatchResult.bind(toastManager),
    hasErrors: toastManager.hasErrors.bind(toastManager),
  };
}
