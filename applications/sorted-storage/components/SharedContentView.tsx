/**
 * SharedContentView - Reusable component for displaying shared content
 * Requirements: 6.3, 6.4, 6.5
 */

import { Download, Eye, File, Folder, Share } from "lucide-preact";
import type { StorageObject } from "../types/storage.ts";
import { formatFileSize } from "../lib/storage-api.ts";

interface SharedContentViewProps {
  storageObject: StorageObject;
  children?: StorageObject[];
  onDownload: (item: StorageObject) => void;
  onPreview?: (item: StorageObject) => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function SharedContentView({
  storageObject,
  children = [],
  onDownload,
  onPreview,
  showActions = true,
  compact = false,
}: SharedContentViewProps) {
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

  const isFolder = storageObject.object_type === "folder";

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class={`text-center ${compact ? "mb-4" : "mb-8"}`}>
        <div class="flex items-center justify-center gap-3 mb-4">
          <Share class="w-6 h-6 text-primary" />
          {storageObject.metadata?.emoji && (
            <span class={compact ? "text-2xl" : "text-4xl"}>{storageObject.metadata.emoji}</span>
          )}
          <div>
            <h1 class={compact ? "text-xl font-bold" : "text-3xl font-bold"}>
              {storageObject.metadata?.custom_name || storageObject.name}
            </h1>
            <p class="text-base-content/60">
              Shared {isFolder ? "folder" : "file"} • {formatDate(storageObject.created_at)}
            </p>
          </div>
        </div>

        {storageObject.metadata?.description && (
          <p class={`text-base-content/80 max-w-2xl mx-auto ${compact ? "text-base" : "text-lg"}`}>
            {storageObject.metadata.description}
          </p>
        )}
      </div>

      {/* Content */}
      {isFolder
        ? (
          /* Folder Contents */
          <div class="space-y-4">
            {/* Folder Stats */}
            {!compact && (
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
            )}

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
                          {showActions && (
                            <div class="flex items-center gap-2">
                              {item.object_type === "file" && canPreview(item) && onPreview && (
                                <button
                                  onClick={() => onPreview(item)}
                                  class="btn btn-ghost btn-sm"
                                  title="Preview"
                                >
                                  <Eye class="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  onDownload(item)}
                                class="btn btn-primary btn-sm"
                                title="Download"
                              >
                                <Download class="w-4 h-4" />
                              </button>
                            </div>
                          )}
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
                          class={`object-cover rounded-lg border border-base-300 ${
                            compact ? "w-24 h-24" : "w-32 h-32"
                          }`}
                        />
                      )
                      : (
                        <div
                          class={`flex items-center justify-center bg-base-200 rounded-lg border border-base-300 ${
                            compact ? "w-24 h-24" : "w-32 h-32"
                          }`}
                        >
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
                        <div class="stat-value text-lg">{formatDate(storageObject.created_at)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {showActions && (
                  <div class="card-actions justify-end mt-6">
                    {canPreview(storageObject) && onPreview && (
                      <button
                        onClick={() => onPreview(storageObject)}
                        class="btn btn-outline"
                      >
                        <Eye class="w-4 h-4 mr-2" />
                        Preview
                      </button>
                    )}
                    <button
                      onClick={() => onDownload(storageObject)}
                      class="btn btn-primary"
                    >
                      <Download class="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
