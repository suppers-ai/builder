import { PageProps } from "@fresh/core";
import ApplicationDetailIsland from "../../islands/applications/ApplicationDetailIsland.tsx";

export default function ApplicationDetailPage(props: PageProps) {
  const applicationId = props.params.id;

  if (!applicationId) {
    return (
      <div class="min-h-screen bg-base-300 flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-2xl font-bold text-error mb-4">Application Not Found</h1>
          <p class="text-base-content/70 mb-4">The requested application could not be found.</p>
          <a href="/applications" class="btn btn-primary">Back to Applications</a>
        </div>
      </div>
    );
  }

  return <ApplicationDetailIsland applicationId={applicationId} />;
}