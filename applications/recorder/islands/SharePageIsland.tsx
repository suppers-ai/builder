import { useEffect, useState } from "preact/hooks";
import { Alert, Button, Loading } from "@suppers/ui-lib";
import { AlertTriangle, Download, Globe, Link, Play, Shield } from "lucide-preact";
import { formatDate, formatFileSize } from "../lib/recorder-utils.ts";

interface SharePageProps {
  shareToken?: string;
  applicationSlug?: string;
  filename?: string;
  isPublic?: boolean;
}

interface SharedRecording {
  id: string;
  name: string;
  size: number;
  contentType: string;
  createdAt: string;
  downloadUrl: string;
}

export default function SharePageIsland({
  shareToken,
  applicationSlug,
  filename,
  isPublic = false,
}: SharePageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState<SharedRecording | null>(null);

  const API_BASE_URL = "http://127.0.0.1:54321/functions/v1/api/v1";

  useEffect(() => {
    loadSharedRecording();
  }, [shareToken, applicationSlug, filename]);

  const loadSharedRecording = async () => {
    setLoading(true);
    setError(null);

    try {
      let url: string;

      if (shareToken) {
        // Token-based sharing
        url = `${API_BASE_URL}/share/token/${shareToken}`;
      } else if (applicationSlug && filename) {
        // Public sharing
        url = `${API_BASE_URL}/share/public/${applicationSlug}/${filename}`;
      } else {
        throw new Error("Invalid share parameters");
      }

      // First, make a HEAD request to get metadata
      const headResponse = await fetch(url, { method: "HEAD" });

      if (!headResponse.ok) {
        if (headResponse.status === 404) {
          setError("This shared recording could not be found or may have been removed.");
        } else {
          setError(`Failed to load recording: ${headResponse.statusText}`);
        }
        return;
      }

      // Extract metadata from headers
      const contentType = headResponse.headers.get("Content-Type") || "video/webm";
      const contentLength = parseInt(headResponse.headers.get("Content-Length") || "0");
      const lastModified = headResponse.headers.get("Last-Modified");

      // Create recording object
      const sharedRecording: SharedRecording = {
        id: shareToken || `${applicationSlug}-${filename}`,
        name: filename || "Shared Recording",
        size: contentLength,
        contentType,
        createdAt: lastModified || new Date().toISOString(),
        downloadUrl: url,
      };

      setRecording(sharedRecording);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shared recording");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!recording) return;

    try {
      // Create a link and trigger download
      const a = document.createElement("a");
      a.href = recording.downloadUrl;
      a.download = recording.name;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to download recording");
    }
  };

  if (loading) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <Loading size="lg" />
          <p class="mt-4 text-lg">Loading shared recording...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="max-w-md w-full">
          <Alert color="error">
            <AlertTriangle class="w-5 h-5" />
            <div>
              <h3 class="font-semibold">Unable to Load Recording</h3>
              <p class="text-sm mt-1">{error}</p>
            </div>
          </Alert>
          <div class="text-center mt-6">
            <Button onClick={() => globalThis.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!recording) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <Alert color="warning">
          <AlertTriangle class="w-5 h-5" />
          <span>Recording not found</span>
        </Alert>
      </div>
    );
  }

  return (
    <div class="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-2 mb-2">
          {isPublic
            ? <Globe class="w-6 h-6 text-primary" />
            : <Link class="w-6 h-6 text-primary" />}
          <h1 class="text-2xl font-bold">
            {isPublic ? "Public Recording" : "Shared Recording"}
          </h1>
        </div>
        <p class="text-base-content/60">
          {isPublic
            ? "This recording has been shared publicly"
            : "Someone shared this recording with you"}
        </p>
      </div>

      {/* Video Player */}
      <div class="bg-base-100 rounded-lg shadow-lg overflow-hidden mb-6">
        <div class="aspect-video bg-black relative">
          <video
            controls
            class="w-full h-full object-contain"
            poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+"
          >
            <source src={recording.downloadUrl} type={recording.contentType} />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Recording Details */}
      <div class="bg-base-100 rounded-lg shadow-lg p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield class="w-5 h-5" />
          Recording Details
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-3">
            <div>
              <span class="font-medium text-base-content/70">Name:</span>
              <p class="text-lg">{recording.name}</p>
            </div>
            <div>
              <span class="font-medium text-base-content/70">Size:</span>
              <p>{formatFileSize(recording.size)}</p>
            </div>
          </div>
          <div class="space-y-3">
            <div>
              <span class="font-medium text-base-content/70">Type:</span>
              <p>{recording.contentType}</p>
            </div>
            <div>
              <span class="font-medium text-base-content/70">Shared:</span>
              <p>{formatDate(new Date(recording.createdAt))}</p>
            </div>
          </div>
        </div>

        {/* Sharing Info */}
        <div class="mt-6 p-4 bg-base-200 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            {isPublic
              ? (
                <>
                  <Globe class="w-4 h-4 text-info" />
                  <span class="font-medium text-info">Public Access</span>
                </>
              )
              : (
                <>
                  <Link class="w-4 h-4 text-warning" />
                  <span class="font-medium text-warning">Private Share</span>
                </>
              )}
          </div>
          <p class="text-sm text-base-content/60">
            {isPublic
              ? "This recording is publicly accessible to anyone with the link."
              : "This recording was shared privately and access can be revoked by the owner."}
          </p>
        </div>
      </div>
    </div>
  );
}
