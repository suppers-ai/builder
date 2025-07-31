import { Button } from "../../action/button/Button.tsx";

interface EntityStatus {
  value: string;
  icon: string;
  message: string;
  badgeClass: string;
}

interface EntityAction {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: "primary" | "success" | "warning" | "error";
  condition?: boolean;
}

interface EntityMenuAction {
  label: string;
  icon: string;
  onClick: () => void;
  className?: string;
  condition?: boolean;
}

export interface EntityCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  updatedAt: string;
  status: {
    value: string;
    statuses: Record<string, EntityStatus>;
  };
  metadata?: Record<string, any>;
  className?: string;
  actions?: EntityAction[];
  menuActions?: EntityMenuAction[];
  showOwnerActions?: boolean;
  onView?: () => void;
}

export function EntityCard({
  title,
  subtitle,
  description,
  updatedAt,
  status,
  metadata,
  className = "",
  actions = [],
  menuActions = [],
  showOwnerActions = false,
  onView,
}: EntityCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const currentStatus = status.statuses[status.value] || {
    value: status.value,
    icon: "📄",
    message: "",
    badgeClass: "badge-neutral"
  };

  const visibleActions = actions.filter(action => action.condition !== false);
  const visibleMenuActions = menuActions.filter(action => action.condition !== false);

  return (
    <div class={`card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow ${className}`}>
      <div class="card-body">
        {/* Header */}
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="card-title text-lg">{title}</h3>
            <div class="flex items-center gap-2 mt-2">
              <div class={`badge ${currentStatus.badgeClass}`}>
                {currentStatus.icon} {status.value}
              </div>
              {subtitle && (
                <>
                  <span class="text-base-content/60">•</span>
                  <span class="text-sm text-base-content/80">{subtitle}</span>
                </>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          {(onView || (showOwnerActions && visibleMenuActions.length > 0)) && (
            <div class="dropdown dropdown-end">
              <div tabindex={0} role="button" class="btn btn-ghost btn-sm">
                ⋮
              </div>
              <ul
                tabindex={0}
                class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300"
              >
                {onView && (
                  <li>
                    <a onClick={onView}>👁️ View Details</a>
                  </li>
                )}
                {showOwnerActions && visibleMenuActions.map((action, index) => (
                  <li key={index}>
                    <a onClick={action.onClick} class={action.className}>
                      {action.icon} {action.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Status Message */}
        {currentStatus.message && (
          <div class="mt-2">
            <p class="text-xs text-base-content/60">
              {currentStatus.message}
            </p>
          </div>
        )}

        {/* Description */}
        {description && (
          <p class="text-base-content/80 text-sm mt-4 line-clamp-3">
            {description}
          </p>
        )}

        {/* Metadata Preview - Only show if not empty */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div class="mt-4">
            <details class="collapse collapse-arrow bg-base-200">
              <summary class="collapse-title text-xs font-medium">Configuration</summary>
              <div class="collapse-content">
                <pre class="text-xs text-base-content/70 whitespace-pre-wrap">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}

        {/* Footer */}
        <div class="card-actions justify-between items-center mt-4">
          <div class="text-xs text-base-content/60">
            Updated: {formatDate(updatedAt)}
          </div>

          {/* Primary Actions */}
          <div class="flex gap-2">
            {onView && (
              <Button color="primary" size="sm" onClick={onView}>
                View
              </Button>
            )}
            {showOwnerActions && visibleActions.map((action, index) => (
              <Button
                key={index}
                color={action.variant as any || 'neutral'}
                size="sm"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EntityCard;