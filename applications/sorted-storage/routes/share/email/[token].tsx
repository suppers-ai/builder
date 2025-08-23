/**
 * Email share route - displays shared content via email token
 * Similar to paint app pattern for email sharing
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { PageProps } from "$fresh/server.ts";
import { useEffect, useState } from "preact/hooks";
import { AlertTriangle, ArrowLeft, Download, Eye, File, Folder, Mail } from "lucide-preact";
import type { StorageObject } from "../../../types/storage.ts";
import { formatFileSize } from "../../../lib/storage-api.ts";
import Layout from "../../../components/Layout.tsx";
import config from "../../../../../config.ts";

interface EmailSharePageData {
  token: string;
}

interface EmailShareVerification {
  valid: boolean;
  storageObject?: StorageObject;
  session?: {
    sender_id: string;
    recipient_email: string;
    message?: string;
    expires_at: string;
    created_at: string;
  };
  error?: string;
}

export default function EmailSharePage({ params }: PageProps<void, EmailSharePageData>) {
  const [verification, setVerification] = useState<EmailShareVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyEmailToken();
  }, [params.token]);

  const verifyEmailToken = async () => {
    try {
      const response = await fetch(
        `${config.apiUrl}/api/v1/storage/share/email/verify/${params.token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const result: EmailShareVerification = await response.json();

      if (response.ok && result.valid) {
        setVerification(result);
      } else {
        setError(result.error || "Invalid or expired share token");
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      setError("Failed to verify share token");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item: StorageObject) => {
    try {
      const response = await fetch(
        `${config.apiUrl}/api/v1/storage/share/email/${params.token}/download/${item.id}`,
      );
      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.metadata?.custom_name || item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Please try again.");
    }
  };

  const handlePreview = (item: StorageObject) => {
    globalThis.open(
      `${config.apiUrl}/api/v1/storage/share/email/${params.token}/preview/${item.id}`,
      "_blank",
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (item: StorageObject) => {
    if (item.object_type === "folder") {
      return <Folder class="w-8 h-8 text-primary" />;
    }

    const mimeType = item.mime_type;
    if (mimeType.startsWith("image/")) {
      return (
        <div class="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
          IMG
        </div>
      );
    } else if (mimeType.startsWith("video/")) {
      return (
        <div class="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
          VID
        </div>
      );
    } else if (mimeType.startsWith("audio/")) {
      return (
        <div class="w-8 h-8 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
          AUD
        </div>
      );
    } else if (mimeType.includes("pdf")) {
      return (
        <div class="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
          PDF
        </div>
      );
    } else {
      return <File class="w-8 h-8 text-base-content/60" />;
    }
  };

  const canPreview = (item: StorageObject) => {
    const mimeType = item.mime_type;
    return mimeType.startsWith("image/") ||
      mimeType.startsWith("video/") ||
      mimeType.startsWith("audio/") ||
      mimeType.includes("pdf") ||
      mimeType.startsWith("text/");
  };

  if (loading) {
    return (
      <Layout title="Verifying Share Link - Sorted Storage" showNavbar={false}>
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center">
            <div class="loading loading-spinner loading-lg text-primary"></div>
            <p class="mt-4 text-lg">Verifying share link...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !verification?.valid) {
    return (
      <Layout title="Access Denied - Sorted Storage" showNavbar={false}>
        <div class="flex items-center justify-center min-h-screen">
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
      </Layout>
    );
  }

  const { storageObject, session } = verification;
  if (!storageObject || !session) {
    return (
      <Layout title="Content Not Found - Sorted Storage" showNavbar={false}>
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center">
            <AlertTriangle class="w-16 h-16 text-warning mx-auto mb-4" />
            <h2 class="text-2xl font-bold mb-2">Content Not Found</h2>
            <p class="text-base-content/70">The shared content could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const isFolder = storageObject.object_type === "folder";

  return (
    <Layout title="Shared Content - Sorted Storage" showNavbar={false}>
      <div class="container mx-auto py-8 px-4">
        <div class="card bg-base-100 shadow-xl max-w-4xl mx-auto">
          <div class="card-body">
            {/* Header */}
            <div class="text-center mb-6">
              <div class="flex items-center justify-center gap-2 mb-2">
                <Mail class="w-6 h-6 text-primary" />
                <h1 class="text-3xl font-bold">Shared {isFolder ? "Folder" : "File"}</h1>
              </div>
              <p class="text-base-content/70">
                Shared with {session.recipient_email} • Expires {formatDate(session.expires_at)}
              </p>
            </div>

            {/* Content */}
            <div class="grid md:grid-cols-2 gap-6">
              {/* Preview/Info */}
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  {storageObject.metadata?.emoji && (
                    <span class="text-3xl">{storageObject.metadata.emoji}</span>
                  )}
                  <div>
                    <h3 class="text-xl font-semibold">
                      {storageObject.metadata?.custom_name || storageObject.name}
                    </h3>
                    {storageObject.metadata?.description && (
                      <p class="text-base-content/70">{storageObject.metadata.description}</p>
                    )}
                  </div>
                </div>

                {/* Thumbnail or Icon */}
                <div class="flex justify-center">
                  {storageObject.thumbnail_url
                    ? (
                      <img
                        src={storageObject.thumbnail_url}
                        alt={storageObject.name}
                        class="max-w-full h-48 object-cover rounded-lg border border-base-300"
                      />
                    )
                    : (
                      <div class="w-48 h-48 flex items-center justify-center bg-base-200 rounded-lg border border-base-300">
                        {getFileIcon(storageObject)}
                      </div>
                    )}
                </div>

                {/* Stats */}
                <div class="stats shadow w-full">
                  <div class="stat">
                    <div class="stat-title">File Size</div>
                    <div class="stat-value text-lg">
                      {formatFileSize(storageObject.file_size)}
                    </div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">Type</div>
                    <div class="stat-value text-lg capitalize">
                      {storageObject.object_type}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details and Actions */}
              <div class="space-y-4">
                {/* Personal Message */}
                {session.message && (
                  <div class="card bg-primary/10 border border-primary/20">
                    <div class="card-body">
                      <h4 class="card-title text-lg">Personal Message</h4>
                      <p class="text-base-content/80">{session.message}</p>
                    </div>
                  </div>
                )}

                {/* Share Details */}
                <div class="space-y-2">
                  <h4 class="font-semibold">Share Details</h4>
                  <div class="text-sm space-y-1">
                    <p>
                      <span class="font-medium">From:</span> {session.sender_id}
                    </p>
                    <p>
                      <span class="font-medium">To:</span> {session.recipient_email}
                    </p>
                    <p>
                      <span class="font-medium">Created:</span>{" "}
                      {formatDate(storageObject.created_at)}
                    </p>
                    <p>
                      <span class="font-medium">Shared:</span> {formatDate(session.created_at)}
                    </p>
                    <p>
                      <span class="font-medium">Expires:</span> {formatDate(session.expires_at)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div class="card-actions flex-col sm:flex-row gap-2 mt-6">
                  {canPreview(storageObject) && (
                    <button
                      onClick={() => handlePreview(storageObject)}
                      class="btn btn-outline flex-1"
                    >
                      <Eye class="w-5 h-5 mr-2" />
                      Preview
                    </button>
                  )}

                  <button
                    onClick={() => handleDownload(storageObject)}
                    class="btn btn-primary flex-1"
                  >
                    <Download class="w-5 h-5 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div class="divider"></div>
            <div class="text-center text-sm text-base-content/60">
              <p>This content was shared with you via Sorted Storage</p>
              <p>The share link will expire on {formatDate(session.expires_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
