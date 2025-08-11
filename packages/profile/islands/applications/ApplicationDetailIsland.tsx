import { useEffect, useState } from "preact/hooks";
import { Alert, Button, Card } from "@suppers/ui-lib";
import { 
  ArrowLeft, 
  Smartphone, 
  Calendar, 
  User, 
  FileText, 
  Upload, 
  Download,
  Trash2,
  Edit3,
  Settings,
  Code
} from "lucide-preact";
import type { Application } from "@suppers/shared";
import { useAuth } from "../../lib/applications/hooks.ts";
import { api } from "../../lib/applications/api.ts";

interface ApplicationDetailIslandProps {
  applicationId: string;
}

export default function ApplicationDetailIsland({ applicationId }: ApplicationDetailIslandProps) {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/auth/login";
    }
  }, [authLoading, isAuthenticated]);

  // Fetch application when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && applicationId) {
      fetchApplication();
    }
  }, [isAuthenticated, user, applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add a small delay to ensure auth is fully initialized
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const app = await api.applications.get(applicationId);
      setApplication(app);
    } catch (err) {
      console.error("Failed to fetch application:", err);
      setError(err instanceof Error ? err.message : "Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <div class="w-2 h-2 bg-success rounded-full"></div>;
      case "pending":
        return <div class="w-2 h-2 bg-warning rounded-full animate-pulse"></div>;
      case "draft":
        return <div class="w-2 h-2 bg-base-content/50 rounded-full"></div>;
      case "archived":
        return <div class="w-2 h-2 bg-error rounded-full"></div>;
      default:
        return <div class="w-2 h-2 bg-base-content/50 rounded-full"></div>;
    }
  };

  const handleDelete = async () => {
    if (!application) return;

    try {
      await api.applications.delete(application.id);
      // Redirect back to applications list
      window.location.href = "/applications";
    } catch (err) {
      console.error("Failed to delete application:", err);
      setError(err instanceof Error ? err.message : "Failed to delete application");
    }
  };

  const handleUploadConfiguration = () => {
    // TODO: Implement configuration upload
    alert("Configuration upload coming soon!");
  };

  const handleDownloadConfiguration = () => {
    // TODO: Implement configuration download
    alert("Configuration download coming soon!");
  };

  // Show loading state while auth is initializing
  if (authLoading || loading) {
    return (
      <div class="min-h-screen bg-base-300 flex items-center justify-center">
        <div class="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div class="min-h-screen bg-base-300 flex items-center justify-center p-4">
        <div class="w-full max-w-md">
          <Card class="p-6 text-center">
            <div class="text-error mb-4">
              <FileText class="w-12 h-12 mx-auto" />
            </div>
            <h1 class="text-xl font-semibold text-base-content mb-2">Error</h1>
            <p class="text-base-content/70 mb-4">{error}</p>
            <div class="flex gap-2 justify-center">
              <Button 
                color="primary" 
                onClick={fetchApplication}
                class="btn-sm"
              >
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/applications"}
                class="btn-sm"
              >
                Back to Applications
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Application not found
  if (!application) {
    return (
      <div class="min-h-screen bg-base-300 flex items-center justify-center p-4">
        <div class="w-full max-w-md">
          <Card class="p-6 text-center">
            <div class="text-base-content/50 mb-4">
              <Smartphone class="w-12 h-12 mx-auto" />
            </div>
            <h1 class="text-xl font-semibold text-base-content mb-2">Application Not Found</h1>
            <p class="text-base-content/70 mb-4">The application you're looking for doesn't exist or you don't have access to it.</p>
            <Button 
              color="primary" 
              onClick={() => window.location.href = "/applications"}
            >
              Back to Applications
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-base-300 relative">
      {/* Floating back button */}
      <a 
        href="/applications" 
        class="fixed top-4 left-4 z-10 bg-base-100 hover:bg-base-200 rounded-full p-3 shadow-lg transition-colors"
        aria-label="Back to Applications"
      >
        <ArrowLeft class="w-5 h-5 text-base-content" />
      </a>

      <div class="container mx-auto px-4 py-8 max-w-4xl">
        <div class="space-y-6">
          {/* Header Card */}
          <Card class="p-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone class="w-6 h-6 text-primary" />
              </div>
              
              <div class="flex-1 min-w-0">
                <h1 class="text-2xl font-bold text-base-content mb-2">{application.name}</h1>
                
                <div class="flex items-center gap-3 mb-3">
                  <div class="flex items-center gap-2">
                    {getStatusIcon(application.status)}
                    <span class="text-sm font-medium capitalize">{application.status}</span>
                  </div>
                  <span class="text-base-content/50">•</span>
                  <div class="flex items-center gap-2 text-base-content/70">
                    <User class="w-4 h-4" />
                    <span class="text-sm">ID: {application.id}</span>
                  </div>
                </div>

                {application.description && (
                  <p class="text-base-content/80 mb-4">{application.description}</p>
                )}

                <div class="flex items-center gap-4 text-sm text-base-content/60">
                  <div class="flex items-center gap-2">
                    <Calendar class="w-4 h-4" />
                    <span>Created {formatDate(application.created_at)}</span>
                  </div>
                  <span>•</span>
                  <div class="flex items-center gap-2">
                    <Calendar class="w-4 h-4" />
                    <span>Updated {formatDate(application.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions Card */}
          <Card class="p-6">
            <h2 class="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
              <Settings class="w-5 h-5" />
              Actions
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Configuration Management */}
              <div class="space-y-3">
                <h3 class="text-sm font-medium text-base-content flex items-center gap-2">
                  <Code class="w-4 h-4" />
                  Configuration
                </h3>
                <div class="space-y-2">
                  <Button 
                    color="primary" 
                    variant="outline"
                    onClick={handleUploadConfiguration}
                    class="w-full flex items-center gap-2"
                    size="sm"
                  >
                    <Upload class="w-4 h-4" />
                    Upload Config
                  </Button>
                  <Button 
                    color="neutral" 
                    variant="outline"
                    onClick={handleDownloadConfiguration}
                    class="w-full flex items-center gap-2"
                    size="sm"
                  >
                    <Download class="w-4 h-4" />
                    Download Config
                  </Button>
                </div>
              </div>

              {/* Application Management */}
              <div class="space-y-3">
                <h3 class="text-sm font-medium text-base-content flex items-center gap-2">
                  <Edit3 class="w-4 h-4" />
                  Management
                </h3>
                <div class="space-y-2">
                  <Button 
                    color="primary" 
                    variant="outline"
                    onClick={() => window.location.href = `/applications/edit/${application.id}`}
                    class="w-full flex items-center gap-2"
                    size="sm"
                  >
                    <Edit3 class="w-4 h-4" />
                    Edit App
                  </Button>
                  <Button 
                    color="error" 
                    variant="outline"
                    onClick={() => setDeleteModalOpen(true)}
                    class="w-full flex items-center gap-2"
                    size="sm"
                  >
                    <Trash2 class="w-4 h-4" />
                    Delete App
                  </Button>
                </div>
              </div>

              {/* Deployment */}
              <div class="space-y-3">
                <h3 class="text-sm font-medium text-base-content flex items-center gap-2">
                  <Smartphone class="w-4 h-4" />
                  Deployment
                </h3>
                <div class="space-y-2">
                  <Button 
                    color="success" 
                    variant="outline"
                    onClick={() => alert("Deploy feature coming soon!")}
                    class="w-full flex items-center gap-2"
                    size="sm"
                  >
                    <ArrowLeft class="w-4 h-4 transform rotate-45" />
                    Deploy
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Configuration Preview Card */}
          {application.metadata && (
            <Card class="p-6">
              <h2 class="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                <FileText class="w-5 h-5" />
                Current Configuration
              </h2>
              <div class="bg-base-200 rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-base-content/80 whitespace-pre-wrap">
                  {JSON.stringify(application.metadata, null, 2)}
                </pre>
              </div>
            </Card>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-base-100 rounded-lg p-6 w-full max-w-md">
              <h3 class="text-lg font-semibold text-base-content mb-4">Delete Application</h3>
              <p class="text-base-content/70 mb-6">
                Are you sure you want to delete "{application.name}"? This action cannot be undone.
              </p>
              <div class="flex gap-3 justify-end">
                <Button 
                  variant="ghost" 
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  color="error" 
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}