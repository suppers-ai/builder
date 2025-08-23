import { useEffect, useState } from "preact/hooks";
import { toastManager, type ToastNotification } from "../lib/toast-manager.ts";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-preact";

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

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div class="toast toast-top toast-end z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          class={`alert ${
            getAlertClass(toast.type)
          } shadow-lg max-w-sm animate-in slide-in-from-right duration-300`}
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
                type="button"
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
