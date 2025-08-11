import { 
  Rocket, 
  Clock, 
  FileText, 
  Archive,
  Smartphone
} from "lucide-preact";
import type { Application } from "@suppers/shared";

export interface ApplicationCardProps {
  application: Application;
  className?: string;
}

export function ApplicationCard({
  application,
  className = "",
}: ApplicationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <Rocket class="w-3 h-3 text-success" />;
      case "pending":
        return <Clock class="w-3 h-3 text-warning" />;
      case "draft":
        return <FileText class="w-3 h-3 text-base-content/70" />;
      case "archived":
        return <Archive class="w-3 h-3 text-error" />;
      default:
        return <FileText class="w-3 h-3 text-base-content/70" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "published":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "draft":
        return "badge-ghost";
      case "archived":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  const handleCardClick = () => {
    window.location.href = `/applications/${application.id}`;
  };

  return (
    <div 
      onClick={handleCardClick}
      class={`card bg-base-100 shadow-sm hover:shadow-lg transition-all duration-200 border border-base-200 hover:border-primary/30 hover:bg-primary/5 cursor-pointer ${className}`}
    >
      <div class="card-body p-4">
        {/* App Icon and Title */}
        <div class="flex items-center gap-3 mb-2">
          <div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Smartphone class="w-4 h-4 text-primary" />
          </div>
          <h3 class="font-semibold text-base-content text-sm truncate">
            {application.name}
          </h3>
        </div>

        {/* Status Badge */}
        <div class="flex items-center gap-2 mb-2">
          <div class={`badge gap-1 ${getStatusBadgeClass(application.status)} badge-sm`}>
            {getStatusIcon(application.status)}
            <span class="capitalize">{application.status}</span>
          </div>
        </div>

        {/* Description */}
        {application.description && (
          <p class="text-sm text-base-content/70 line-clamp-2 mb-2">
            {application.description}
          </p>
        )}

        {/* Last updated */}
        <p class="text-xs text-base-content/50">
          Updated {formatDate(application.updated_at)}
        </p>
      </div>
    </div>
  );
}

export default ApplicationCard;
