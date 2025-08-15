import { ComponentChildren } from "preact";
import { BaseComponentProps } from "../../types.ts";
import { AlertTriangle, RefreshCw } from "lucide-preact";

export interface ErrorStateProps extends BaseComponentProps {
  title?: string;
  description?: string;
  actions?: ComponentChildren;
  onRetry?: () => void;
  retryText?: string;
  icon?: ComponentChildren;
  variant?: "default" | "minimal" | "detailed";
}

export function ErrorState({
  class: className = "",
  title = "Something went wrong",
  description,
  actions,
  onRetry,
  retryText = "Try again",
  icon,
  variant = "default",
  id,
  ...props
}: ErrorStateProps) {
  const containerClasses = [
    "text-center",
    variant === "minimal" ? "py-8" : "py-12",
    className,
  ].filter(Boolean).join(" ");

  const defaultIcon = (
    <AlertTriangle 
      size={variant === "minimal" ? 32 : 48} 
      class="text-error opacity-60 mx-auto" 
    />
  );

  const defaultActions = onRetry ? (
    <button 
      type="button"
      class="btn btn-primary btn-sm gap-2"
      onClick={onRetry}
    >
      <RefreshCw size={16} />
      {retryText}
    </button>
  ) : null;

  return (
    <div class={containerClasses} id={id} {...props}>
      <div class="space-y-4">
        {/* Icon */}
        <div>
          {icon || defaultIcon}
        </div>

        {/* Content */}
        <div class="space-y-2">
          <h3 class={`font-semibold text-base-content ${
            variant === "minimal" ? "text-lg" : "text-xl"
          }`}>
            {title}
          </h3>
          
          {description && (
            <p class={`text-base-content/70 max-w-md mx-auto ${
              variant === "minimal" ? "text-sm" : "text-base"
            }`}>
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {(actions || defaultActions) && (
          <div class="flex flex-col sm:flex-row gap-2 justify-center items-center">
            {actions || defaultActions}
          </div>
        )}
      </div>
    </div>
  );
}