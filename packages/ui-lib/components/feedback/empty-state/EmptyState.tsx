import { ComponentChildren } from "preact";
import { BaseComponentProps } from "../../types.ts";
import { Inbox, Plus } from "lucide-preact";

export interface EmptyStateProps extends BaseComponentProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: ComponentChildren;
  variant?: "default" | "minimal" | "detailed";
}

export function EmptyState({
  class: className = "",
  title = "No data found",
  description,
  actionText,
  onAction,
  icon,
  variant = "default",
  id,
  ...props
}: EmptyStateProps) {
  const containerClasses = [
    "text-center",
    variant === "minimal" ? "py-8" : "py-12",
    className,
  ].filter(Boolean).join(" ");

  const defaultIcon = (
    <Inbox
      size={variant === "minimal" ? 32 : 48}
      class="text-base-content/30 mx-auto"
    />
  );

  return (
    <div class={containerClasses} id={id} {...props}>
      <div class="space-y-4">
        {/* Icon */}
        <div>
          {icon || defaultIcon}
        </div>

        {/* Content */}
        <div class="space-y-2">
          <h3
            class={`font-semibold text-base-content ${
              variant === "minimal" ? "text-lg" : "text-xl"
            }`}
          >
            {title}
          </h3>

          {description && (
            <p
              class={`text-base-content/70 max-w-md mx-auto ${
                variant === "minimal" ? "text-sm" : "text-base"
              }`}
            >
              {description}
            </p>
          )}
        </div>

        {/* Action Button */}
        {actionText && onAction && (
          <div class="flex justify-center">
            <button
              type="button"
              class="btn btn-primary gap-2"
              onClick={onAction}
            >
              <Plus size={16} />
              {actionText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
