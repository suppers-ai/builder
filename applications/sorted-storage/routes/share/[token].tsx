/**
 * Shared content view route - displays shared files and folders
 * Requirements: 6.3, 6.4, 6.5
 */

import { PageProps } from "$fresh/server.ts";
import { useEffect, useState } from "preact/hooks";
import { AlertTriangle, ArrowLeft, Download, Eye, File, Folder } from "lucide-preact";
import type { StorageObject } from "../../types/storage.ts";
import { validateShareToken } from "../../lib/sharing-utils.ts";
import { formatFileSize } from "../../lib/storage-api.ts";
import Layout from "../../components/Layout.tsx";

interface SharePageData {
  token: string;
}

interface SharedContentState {
  loading: boolean;
  error: string | null;
  storageObject: StorageObject | null;
  children: StorageObject[];
}

export default function SharePage({ params }: PageProps<void, SharePageData>) {
  const [state, setState] = useState<SharedContentState>({
    loading: true,
    error: null,
    storageObject: null,
    children: [],
  });

  useEffect(() => {
    loadSharedContent();
  }, [params.token]);

  const loadSharedContent = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const validation = await validateShareToken(params.token);

      if (!validation.valid || !validation.storageObject) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: validation.error || "Invalid or expired share link",
        }));
        return;
      }

      const storageObject = validation.storageObject;
      let children: StorageObject[] = [];

      // If it's a folder, load its contents
      if (storageObject.object_type === "folder") {
        try {
          const response = await fetch(`/api/storage/share/${params.token}/contents`);
          if (response.ok) {
            children = await response.json();
          }
        } catch (err) {
          console.warn("Failed to load folder contents:", err);
        }
      }

      setState({
        loading: false,
        error: null,
        storageObject,
        children,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load shared content",
      }));
    }
  };

  const handleDownload = async (item: StorageObject) => {
    try {
      const response = await fetch(`/api/storage/share/${params.token}/download/${item.id}`);
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
    // Open preview in new tab
    globalThis.open(`/api/storage/share/${params.token}/preview/${item.id}`, "_blank");
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

  if (state.loading) {
    return (
      <Layout title="Loading - Sorted Storage" showNavbar={false}>
        <div class="flex items-center justify-center min-h-[50vh]">
          <div class="text-center">
            <div class="loading loading-spinner loading-lg text-primary"></div>
            <p class="mt-4 text-lg">Loading shared content...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (state.error) {
    return (
      <Layout title="Access Denied - Sorted Storage" showNavbar={false}>
        <div class="flex items-center justify-center min-h-[50vh]">
          <div class="text-center max-w-md">
            <AlertTriangle class="w-16 h-16 text-error mx-auto mb-4" />
            <h2 class="text-2xl font-bold mb-2">Access Denied</h2>
            <p class="text-base-content/70 mb-6">{state.error}</p>
            <a href="/" class="btn btn-primary">
              <ArrowLeft class="w-4 h-4 mr-2" />
              Go Home
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  if (!state.storageObject) {
    return (
      <Layout title="Content Not Found - Sorted Storage" showNavbar={false}>
        <div class="flex items-center justify-center min-h-[50vh]">
          <div class="text-center">
            <AlertTriangle class="w-16 h-16 text-warning mx-auto mb-4" />
            <h2 class="text-2xl font-bold mb-2">Content Not Found</h2>
            <p class="text-base-content/70">The shared content could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const { storageObject, children } = state;
  const isFolder = storageObject.object_type === "folder";

  return (
    <Layout title="Shared Content - Sorted Storage" showNavbar={false}>
      <div class="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div class="text-center mb-8">
          <div class="flex items-center justify-center gap-3 mb-4">
            {storageObject.metadata?.emoji && (
              <span class="text-4xl">{storageObject.metadata.emoji}</span>
            )}
            <div>
              <h1 class="text-3xl font-bold">
                {storageObject.metadata?.custom_name || storageObject.name}
              </h1>
              <p class="text-base-content/60">
                Shared {isFolder ? "folder" : "file"} • {formatDate(storageObject.created_at)}
              </p>
            </div>
          </div>

          {storageObject.metadata?.description && (
            <p class="text-lg text-base-content/80 max-w-2xl mx-auto">
              {storageObject.metadata.description}
            </p>
          )}
        </div>

        {/* Content */}
        {isFolder
          ? (
            /* Folder Contents */
            <div class="space-y-6">
              {/* Folder Stats */}
              <div class="stats shadow w-full">
                <div class="stat">
                  <div class="stat-title">Items</div>
                  <div class="stat-value text-2xl">{children.length}</div>
                  <div class="stat-desc">
                    {children.filter((c) => c.object_type === "folder").length} folders,{"  "}
                    {children.filter((c) => c.object_type === "file").length} files
                  </div>
                </div>
                <div class="stat">
                  <div class="stat-title">Total Size</div>
                  <div class="stat-value text-2xl">
                    {formatFileSize(children.reduce((sum, c) => sum + c.file_size, 0))}
                  </div>
                  <div class="stat-desc">Combined file sizes</div>
                </div>
              </div>

              {/* Items List */}
              {children.length > 0
                ? (
                  <div class="space-y-2">
                    {children.map((item) => (
                      <div key={item.id} class="card bg-base-100 shadow-sm border border-base-300">
                        <div class="card-body p-4">
                          <div class="flex items-center gap-4">
                            {/* Icon */}
                            <div class="flex-shrink-0">
                              {getFileIcon(item)}
                            </div>

                            {/* Info */}
                            <div class="flex-1 min-w-0">
                              <div class="flex items-center gap-2">
                                {item.metadata?.emoji && (
                                  <span class="text-lg">{item.metadata.emoji}</span>
                                )}
                                <h3 class="font-semibold truncate">
                                  {item.metadata?.custom_name || item.name}
                                </h3>
                              </div>
                              {item.metadata?.description && (
                                <p class="text-sm text-base-content/60 truncate">
                                  {item.metadata.description}
                                </p>
                              )}
                              <div class="flex items-center gap-4 text-xs text-base-content/50 mt-1">
                                <span>{formatFileSize(item.file_size)}</span>
                                <span>{formatDate(item.created_at)}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div class="flex items-center gap-2">
                              {item.object_type === "file" && canPreview(item) && (
                                <button
                                  onClick={() => handlePreview(item)}
                                  class="btn btn-ghost btn-sm"
                                  title="Preview"
                                >
                                  <Eye class="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  handleDownload(item)}
                                class="btn btn-primary btn-sm"
                                title="Download"
                              >
                                <Download class="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
                : (
                  <div class="text-center py-12">
                    <Folder class="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                    <p class="text-base-content/60">This folder is empty</p>
                  </div>
                )}
            </div>
          )
          : (
            /* Single File */
            <div class="space-y-6">
              {/* File Info */}
              <div class="card bg-base-100 shadow-lg">
                <div class="card-body">
                  <div class="flex items-start gap-6">
                    {/* File Icon/Thumbnail */}
                    <div class="flex-shrink-0">
                      {storageObject.thumbnail_url
                        ? (
                          <img
                            src={storageObject.thumbnail_url}
                            alt={storageObject.name}
                            class="w-32 h-32 object-cover rounded-lg border border-base-300"
                          />
                        )
                        : (
                          <div class="w-32 h-32 flex items-center justify-center bg-base-200 rounded-lg border border-base-300">
                            {getFileIcon(storageObject)}
                          </div>
                        )}
                    </div>

                    {/* File Details */}
                    <div class="flex-1">
                      <div class="stats shadow w-full">
                        <div class="stat">
                          <div class="stat-title">File Size</div>
                          <div class="stat-value text-lg">
                            {formatFileSize(storageObject.file_size)}
                          </div>
                        </div>
                        <div class="stat">
                          <div class="stat-title">Type</div>
                          <div class="stat-value text-lg">
                            {storageObject.mime_type.split("/")[1].toUpperCase()}
                          </div>
                        </div>
                        <div class="stat">
                          <div class="stat-title">Created</div>
                          <div class="stat-value text-lg">
                            {formatDate(storageObject.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div class="card-actions justify-end mt-6">
                    {canPreview(storageObject) && (
                      <button
                        onClick={() => handlePreview(storageObject)}
                        class="btn btn-outline"
                      >
                        <Eye class="w-4 h-4 mr-2" />
                        Preview
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(storageObject)}
                      class="btn btn-primary"
                    >
                      <Download class="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Footer */}
        <div class="text-center mt-12 pt-8 border-t border-base-300">
          <p class="text-sm text-base-content/60">
            Shared via{" "}
            <a href="/" class="link link-primary">
              Sorted Storage
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
