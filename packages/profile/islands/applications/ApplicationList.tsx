import { ApplicationCard } from "@suppers/ui-lib";
import { Plus, Smartphone } from "lucide-preact";
import type { Application } from "@suppers/shared";

interface ApplicationListProps {
  applications: Application[];
  isLoading?: boolean;
}

export default function ApplicationList({
  applications,
  isLoading = false,
}: ApplicationListProps) {

  // Loading state
  if (isLoading) {
    return (
      <div class="text-center py-4" role="status" aria-label="Loading applications">
        <div class="loading loading-spinner loading-md text-primary"></div>
        <p class="text-sm text-base-content/70 mt-2">Loading applications...</p>
      </div>
    );
  }

  // Empty state
  if (!applications || applications.length === 0) {
    return (
      <div class="text-center py-6" role="region" aria-labelledby="empty-state-heading">
        <div class="mb-3 flex justify-center" aria-hidden="true">
          <Smartphone class="w-12 h-12 text-base-content/30" />
        </div>
        <h3
          id="empty-state-heading"
          class="text-base font-medium text-base-content mb-2"
        >
          No applications yet
        </h3>
        <p class="text-base-content/70 text-sm mb-4">
          Create your first application to get started.
        </p>
      </div>
    );
  }

  // Application list
  return (
    <div
      class="space-y-3"
      role="region"
      aria-label={`${applications.length} application${applications.length === 1 ? "" : "s"} found`}
    >
      {applications.map((application) => (
        <div key={application.id} class="w-full">
          <ApplicationCard
            application={application}
            className="w-full"
          />
        </div>
      ))}
    </div>
  );
}
