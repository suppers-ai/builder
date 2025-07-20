// No React import needed for simple components
import type { Application } from "../lib/api-helpers.ts";

interface ApplicationCardProps {
  application: Application;
  onEdit?: (application: Application) => void;
  onDelete?: (application: Application) => void;
  onView?: (application: Application) => void;
  onSubmitForReview?: (application: Application) => void;
  className?: string;
  showOwnerActions?: boolean; // Whether to show edit/delete/submit actions (for My Applications page)
}

export function ApplicationCard({
  application,
  onEdit,
  onDelete,
  onView,
  onSubmitForReview,
  className = "",
  showOwnerActions = false,
}: ApplicationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTemplateDisplayName = (templateId: string): string => {
    const templates: { [key: string]: string } = {
      "fresh-basic": "Fresh Basic",
      "nextjs-basic": "Next.js Basic",
      "nextjs-supabase": "Next.js + Supabase",
      "react-spa": "React SPA",
      "vue-spa": "Vue SPA",
    };

    return templates[templateId] || templateId;
  };

  const getStatusBadge = (status: string): string => {
    switch (status) {
      case "published":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "draft":
        return "badge-neutral";
      case "archived":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "published":
        return "🚀";
      case "pending":
        return "⏳";
      case "draft":
        return "📝";
      case "archived":
        return "📦";
      default:
        return "📄";
    }
  };

  const getStatusMessage = (status: string): string => {
    switch (status) {
      case "published":
        return "Live and available to users";
      case "pending":
        return "Waiting for admin review";
      case "draft":
        return "Work in progress";
      case "archived":
        return "No longer active";
      default:
        return "";
    }
  };

  const canEdit = (status: string): boolean => {
    return status === "draft";
  };

  const canSubmitForReview = (status: string): boolean => {
    return status === "draft";
  };

  const canDelete = (status: string): boolean => {
    return status === "draft" || status === "archived";
  };

  return (
    <div class={`card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow ${className}`}>
      <div class="card-body">
        {/* Header */}
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="card-title text-lg">{application.name}</h3>
            <div class="flex items-center gap-2 mt-2">
              <div class={`badge ${getStatusBadge(application.status)}`}>
                {getStatusIcon(application.status)} {application.status}
              </div>
              <span class="text-base-content/60">•</span>
              <span class="text-sm text-base-content/80">
                {getTemplateDisplayName(application.template_id)}
              </span>
            </div>
          </div>

          {/* Actions Menu */}
          {(onView || (showOwnerActions && (onEdit || onDelete || onSubmitForReview))) && (
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
                    <a onClick={() => onView(application)}>👁️ View Details</a>
                  </li>
                )}
                {showOwnerActions && onEdit && canEdit(application.status) && (
                  <li>
                    <a onClick={() => onEdit(application)}>✏️ Edit</a>
                  </li>
                )}
                {showOwnerActions && onSubmitForReview && canSubmitForReview(application.status) &&
                  (
                    <li>
                      <a onClick={() => onSubmitForReview(application)}>📋 Submit for Review</a>
                    </li>
                  )}
                {showOwnerActions && onDelete && canDelete(application.status) && (
                  <li>
                    <a onClick={() => onDelete(application)} class="text-error">🗑️ Delete</a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Status Message */}
        {getStatusMessage(application.status) && (
          <div class="mt-2">
            <p class="text-xs text-base-content/60">
              {getStatusMessage(application.status)}
            </p>
          </div>
        )}

        {/* Description */}
        {application.description && (
          <p class="text-base-content/80 text-sm mt-4 line-clamp-3">
            {application.description}
          </p>
        )}

        {/* Configuration Preview - Only show if not empty */}
        {application.configuration &&
          typeof application.configuration === "object" &&
          Object.keys(application.configuration).length > 0 && (
          <div class="mt-4">
            <details class="collapse collapse-arrow bg-base-200">
              <summary class="collapse-title text-xs font-medium">Configuration</summary>
              <div class="collapse-content">
                <pre class="text-xs text-base-content/70 whitespace-pre-wrap">
                    {JSON.stringify(application.configuration, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}

        {/* Footer */}
        <div class="card-actions justify-between items-center mt-4">
          <div class="text-xs text-base-content/60">
            Updated: {formatDate(application.updated_at)}
          </div>

          {/* Primary Actions */}
          <div class="flex gap-2">
            {onView && (
              <button class="btn btn-primary btn-sm" onClick={() => onView(application)}>
                View
              </button>
            )}
            {showOwnerActions && onEdit && canEdit(application.status) && (
              <button
                class="btn btn-success btn-sm"
                onClick={() => onEdit(application)}
              >
                Edit
              </button>
            )}
            {showOwnerActions && onSubmitForReview && canSubmitForReview(application.status) && (
              <button class="btn btn-warning btn-sm" onClick={() => onSubmitForReview(application)}>
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationCard;
