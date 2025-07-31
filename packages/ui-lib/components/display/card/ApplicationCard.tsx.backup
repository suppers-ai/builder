import { EntityCard } from "./EntityCard.tsx";
import type { Application } from "../../../shared/lib/api-helpers.ts";

interface ApplicationCardProps {
  application: Application;
  onEdit?: (application: Application) => void;
  onDelete?: (application: Application) => void;
  onView?: (application: Application) => void;
  onSubmitForReview?: (application: Application) => void;
  className?: string;
  showOwnerActions?: boolean;
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

  const applicationStatuses = {
    published: {
      value: "published",
      icon: "🚀",
      message: "Live and available to users",
      badgeClass: "badge-success"
    },
    pending: {
      value: "pending", 
      icon: "⏳",
      message: "Waiting for admin review",
      badgeClass: "badge-warning"
    },
    draft: {
      value: "draft",
      icon: "📝", 
      message: "Work in progress",
      badgeClass: "badge-neutral"
    },
    archived: {
      value: "archived",
      icon: "📦",
      message: "No longer active", 
      badgeClass: "badge-error"
    }
  };

  const canEdit = (status: string): boolean => status === "draft";
  const canSubmitForReview = (status: string): boolean => status === "draft";
  const canDelete = (status: string): boolean => status === "draft" || status === "archived";

  const actions = [
    {
      label: "Edit",
      icon: "✏️",
      onClick: () => onEdit?.(application),
      variant: "success" as const,
      condition: onEdit && canEdit(application.status)
    },
    {
      label: "Submit", 
      icon: "📋",
      onClick: () => onSubmitForReview?.(application),
      variant: "warning" as const,
      condition: onSubmitForReview && canSubmitForReview(application.status)
    }
  ];

  const menuActions = [
    {
      label: "Edit",
      icon: "✏️", 
      onClick: () => onEdit?.(application),
      condition: onEdit && canEdit(application.status)
    },
    {
      label: "Submit for Review",
      icon: "📋",
      onClick: () => onSubmitForReview?.(application), 
      condition: onSubmitForReview && canSubmitForReview(application.status)
    },
    {
      label: "Delete",
      icon: "🗑️",
      onClick: () => onDelete?.(application),
      className: "text-error",
      condition: onDelete && canDelete(application.status)
    }
  ];

  return (
    <EntityCard
      title={application.name}
      subtitle={getTemplateDisplayName(application.template_id)}
      description={application.description}
      updatedAt={application.updated_at}
      status={{
        value: application.status,
        statuses: applicationStatuses
      }}
      metadata={application.configuration}
      className={className}
      actions={actions}
      menuActions={menuActions}
      showOwnerActions={showOwnerActions}
      onView={onView ? () => onView(application) : undefined}
    />
  );
}

export default ApplicationCard;