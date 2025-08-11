import { useEffect, useState } from "preact/hooks";
import { Alert, Button, Card } from "@suppers/ui-lib";
import { Plus, RefreshCw, Smartphone, Activity, FileText, ArrowLeft } from "lucide-preact";
import type { Application } from "@suppers/shared";
import ApplicationList from "./applications/ApplicationList.tsx";
import CreateApplicationModal from "./applications/CreateApplicationModal.tsx";
import { useAuth } from "../lib/applications/hooks.ts";
import { api } from "../lib/applications/api.ts";

export default function ApplicationPortalIsland() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/auth/login";
    }
  }, [authLoading, isAuthenticated]);

  // Fetch applications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchApplications();
    }
  }, [isAuthenticated, user]);

  const fetchApplications = async () => {
    console.log("ApplicationPortalIsland: fetchApplications called");
    try {
      setLoading(true);
      setError(null);
      
      // Add a small delay to ensure auth is fully initialized
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const apps = await api.applications.list();
      console.log("ApplicationPortalIsland: fetched applications:", apps);
      setApplications(apps);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      
      // If it's an auth error, don't show it as a user error since it might just be a timing issue
      if (err instanceof Error && err.message.includes("User not authenticated")) {
        console.log("Auth not ready yet, will retry when user state changes");
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load applications");
      }
    } finally {
      setLoading(false);
    }
  };


  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div class="min-h-screen bg-base-300">
        <div class="container mx-auto px-6 py-8 max-w-6xl">
          <div class="flex items-center justify-center min-h-[400px]">
            <div class="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const stats = {
    total: applications.length,
    published: applications.filter((app) => app.status === "published").length,
    draft: applications.filter((app) => app.status === "draft").length,
  };

  return (
    <div class="min-h-screen bg-base-300 flex items-center justify-center p-4 relative">
      {/* Floating back button */}
      <a 
        href="/profile" 
        class="fixed top-4 left-4 z-10 bg-base-100 hover:bg-base-200 rounded-full p-3 shadow-lg transition-colors"
        aria-label="Back to Profile"
      >
        <ArrowLeft class="w-5 h-5 text-base-content" />
      </a>

      <div class="w-full max-w-md">
        <Card class="p-6 overflow-hidden">
          {/* Header */}
          <div class="text-center mb-6">
            <h1 class="text-xl font-semibold text-base-content">My applications</h1>
          </div>

          {/* Error Alert */}
          {error && (
            <div class="mb-4" role="alert" aria-live="polite">
              <Alert color="error" class="mb-4">
                <span>{error}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setError(null)}
                  class="ml-auto"
                  aria-label="Dismiss error message"
                >
                  ✕
                </Button>
              </Alert>
            </div>
          )}

          {/* Stats */}
          <div class="grid grid-cols-3 gap-4 mb-6">
            {/* Total Applications */}
            <div class="text-center">
              <div class="flex justify-center mb-1">
                <Smartphone class="w-4 h-4 text-primary" aria-hidden="true" />
              </div>
              <p class="text-lg font-bold text-base-content">
                {stats.total}
              </p>
              <p class="text-xs text-base-content/70">
                Total
              </p>
            </div>

            {/* Published Applications */}
            <div class="text-center">
              <div class="flex justify-center mb-1">
                <Activity class="w-4 h-4 text-success" aria-hidden="true" />
              </div>
              <p class="text-lg font-bold text-base-content">
                {stats.published}
              </p>
              <p class="text-xs text-base-content/70">
                Published
              </p>
            </div>

            {/* Draft Applications */}
            <div class="text-center">
              <div class="flex justify-center mb-1">
                <FileText class="w-4 h-4 text-warning" aria-hidden="true" />
              </div>
              <p class="text-lg font-bold text-base-content">
                {stats.draft}
              </p>
              <p class="text-xs text-base-content/70">
                Drafts
              </p>
            </div>
          </div>

          {/* Create Application Button */}
          <div class="mb-6">
            <Button
              color="primary"
              onClick={() => setCreateModalOpen(true)}
              aria-label="Create a new application"
              class="w-full flex items-center justify-center gap-2"
            >
              <Plus class="w-4 h-4" />
              Create Application
            </Button>
          </div>

          {/* Applications List */}
          <div class="w-full overflow-hidden">
            <ApplicationList
              applications={applications}
              isLoading={loading}
            />
          </div>
        </Card>

        {/* Create Application Modal */}
        <CreateApplicationModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            console.log("ApplicationPortalIsland: Application created successfully, refreshing list");
            setCreateModalOpen(false);
            fetchApplications(); // Refresh the list
          }}
        />

      </div>
    </div>
  );
}
