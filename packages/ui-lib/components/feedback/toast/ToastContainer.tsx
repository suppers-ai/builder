import { useEffect, useState } from "preact/hooks";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-preact";

// Toast notification interface
export interface ToastNotification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  duration?: number;
  dismissible?: boolean;
  timestamp: number;
  timeoutId?: number;
}

// Toast manager interface
export interface ToastManager {
  subscribe: (listener: (toasts: ToastNotification[]) => void) => () => void;
  getToasts: () => ToastNotification[];
  dismiss: (id: string) => void;
}

interface ToastContainerProps {
  toastManager: ToastManager;
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  maxToasts?: number;
}

export function ToastContainer({
  toastManager,
  position = "top-right",
  maxToasts = 5,
}: ToastContainerProps) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    // Subscribe to toast changes
    const unsubscribe = toastManager.subscribe(setToasts);

    // Get initial toasts
    setToasts(toastManager.getToasts());

    return unsubscribe;
  }, [toastManager]);

  const handleDismiss = (id: string) => {
    toastManager.dismiss(id);
  };

  const getIcon = (type: ToastNotification["type"]) => {
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

  const getPositionClasses = (pos: string) => {
    switch (pos) {
      case "top-left":
        return "toast toast-top toast-start";
      case "top-center":
        return "toast toast-top";
      case "top-right":
        return "toast toast-top toast-end";
      case "bottom-left":
        return "toast toast-bottom toast-start";
      case "bottom-center":
        return "toast toast-bottom";
      case "bottom-right":
        return "toast toast-bottom toast-end";
      default:
        return "toast toast-top toast-end";
    }
  };

  if (toasts.length === 0) {
    return null;
  }

  // Limit the number of toasts displayed
  const visibleToasts = toasts.slice(0, maxToasts);

  return (
    <div class={`${getPositionClasses(position)} z-50`}>
      {visibleToasts.map((toast) => (
        <div
          key={toast.id}
          class={[
            "alert shadow-lg max-w-sm animate-in slide-in-from-right duration-300",
            toast.type === "success" ? "alert-success" : "",
            toast.type === "error" ? "alert-error" : "",
            toast.type === "warning" ? "alert-warning" : "",
            toast.type === "info" ? "alert-info" : "",
          ].filter(Boolean).join(" ")}
        >
          <div class="flex items-start gap-3 w-full">
            <div class="flex-shrink-0 mt-0.5">
              {getIcon(toast.type)}
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium break-words">
                {toast.message}
              </p>
            </div>

            {toast.dismissible && (
              <button
                onClick={() => handleDismiss(toast.id)}
                class="flex-shrink-0 btn btn-ghost btn-xs btn-circle ml-2"
                aria-label="Dismiss notification"
              >
                <X class="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
