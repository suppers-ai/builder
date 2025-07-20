import { ComponentChildren } from "preact";
import { BaseComponentProps } from "../../types.ts";

export interface ToastProps extends BaseComponentProps {
  message: string;
  type?: "info" | "success" | "warning" | "error";
  position?:
    | "top-start"
    | "top-center"
    | "top-end"
    | "bottom-start"
    | "bottom-center"
    | "bottom-end";
  duration?: number;
  dismissible?: boolean;
  icon?: ComponentChildren;
  onDismiss?: () => void;
  onShow?: () => void;
}

export function Toast({
  class: className = "",
  message,
  type = "info",
  position = "top-end",
  dismissible = true,
  icon,
  id,
  ...props
}: ToastProps) {
  const toastClasses = [
    "alert",
    type === "info" ? "alert-info" : "",
    type === "success" ? "alert-success" : "",
    type === "warning" ? "alert-warning" : "",
    type === "error" ? "alert-error" : "",
    className,
  ].filter(Boolean).join(" ");

  const defaultIcons = {
    info: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="stroke-current shrink-0 w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        >
        </path>
      </svg>
    ),
    success: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.168 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    ),
    error: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <div class={toastClasses} id={id} {...props}>
      {icon || defaultIcons[type]}
      <span>{message}</span>
      {dismissible && (
        <div>
          <button class="btn btn-sm btn-circle btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
