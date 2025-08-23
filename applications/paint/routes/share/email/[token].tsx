import { PageProps } from "fresh";
import { useEffect, useState } from "preact/hooks";
import type { EmailShareTokenVerification } from "../../../../../packages/shared/types/notifications.ts";
import config from "../../../../../config.ts";

interface EmailSharePageData {
  token: string;
}

export default function EmailSharePage({ params }: PageProps<void, EmailSharePageData>) {
  const [verification, setVerification] = useState<EmailShareTokenVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/v1/email-sharing/verify/${params.token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result: EmailShareTokenVerification = await response.json();

      if (response.ok && result.valid) {
        setVerification(result);
      } else {
        setError(result.error || "Invalid share token");
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      setError("Failed to verify share token");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div class="min-h-screen bg-base-200 flex items-center justify-center">
        <div class="text-center">
          <div class="loading loading-spinner loading-lg text-primary"></div>
          <p class="mt-4 text-lg">Verifying share link...</p>
        </div>
      </div>
    );
  }

  if (error || !verification?.valid) {
    return (
      <div class="min-h-screen bg-base-200 flex items-center justify-center">
        <div class="card w-96 bg-base-100 shadow-xl">
          <div class="card-body text-center">
            <div class="text-error text-6xl mb-4">⚠️</div>
            <h2 class="card-title justify-center">Access Denied</h2>
            <p class="text-base-content/70">{error}</p>
            <div class="card-actions justify-end mt-4">
              <a href="/" class="btn btn-primary">Go Home</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { storageObject, session } = verification;
  const shareUrl = `${config.apiUrl}/api/v1/storage/${storageObject?.file_path}`;

  return (
    <div class="min-h-screen bg-base-200">
      <div class="container mx-auto py-8 px-4">
        <div class="card bg-base-100 shadow-xl max-w-4xl mx-auto">
          <div class="card-body">
            {/* Header */}
            <div class="text-center mb-6">
              <h1 class="text-3xl font-bold mb-2">Shared Painting</h1>
              <p class="text-base-content/70">
                Shared by {session?.sender_id} • Expires{" "}
                {new Date(session?.expires_at || "").toLocaleDateString()}
              </p>
            </div>

            {/* Content */}
            <div class="grid md:grid-cols-2 gap-6">
              {/* Preview */}
              <div class="space-y-4">
                <h3 class="text-xl font-semibold">{storageObject?.name}</h3>

                {storageObject?.thumbnail_url && (
                  <div class="aspect-square bg-base-200 rounded-lg overflow-hidden">
                    <img
                      src={storageObject.thumbnail_url}
                      alt={storageObject.name}
                      class="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div class="stats shadow">
                  <div class="stat">
                    <div class="stat-title">File Size</div>
                    <div class="stat-value text-lg">
                      {Math.round((storageObject?.file_size || 0) / 1024)} KB
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div class="space-y-4">
                {session?.message && (
                  <div class="card bg-primary/10 border border-primary/20">
                    <div class="card-body">
                      <h4 class="card-title text-lg">Personal Message</h4>
                      <p class="text-base-content/80">{session.message}</p>
                    </div>
                  </div>
                )}

                <div class="space-y-2">
                  <h4 class="font-semibold">Share Details</h4>
                  <div class="text-sm space-y-1">
                    <p>
                      <span class="font-medium">Created:</span>{" "}
                      {new Date(storageObject?.created_at || "").toLocaleDateString()}
                    </p>
                    <p>
                      <span class="font-medium">Shared:</span>{" "}
                      {new Date(session?.created_at || "").toLocaleDateString()}
                    </p>
                    <p>
                      <span class="font-medium">Expires:</span>{" "}
                      {new Date(session?.expires_at || "").toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div class="card-actions flex-col sm:flex-row gap-2 mt-6">
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-primary flex-1"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      >
                      </path>
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      >
                      </path>
                    </svg>
                    View Full Size
                  </a>

                  <a
                    href={shareUrl}
                    download={storageObject?.name}
                    class="btn btn-outline flex-1"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      >
                      </path>
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div class="divider"></div>
            <div class="text-center text-sm text-base-content/60">
              <p>This content was shared with you via Suppers AI Builder</p>
              <p>
                The share link will expire on {new Date(session?.expires_at || "").toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
