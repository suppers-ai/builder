/**
 * FilePreview component for displaying file previews in modal
 * Requirements: 4.3, 4.4, 7.2, 8.1
 */

import { useEffect, useState } from "preact/hooks";
import type { StorageObject } from "../types/storage.ts";
import { getPreviewInfo, type PreviewInfo } from "../lib/thumbnail-generator.ts";
import { Alert, Button, Loading, Modal } from "@suppers/ui-lib";

interface FilePreviewProps {
  file: StorageObject | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (file: StorageObject) => void;
  onShare?: (file: StorageObject) => void;
}

export function FilePreview({
  file,
  isOpen,
  onClose,
  onDownload,
  onShare,
}: FilePreviewProps) {
  const [previewInfo, setPreviewInfo] = useState<PreviewInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const info = getPreviewInfo(file);
      setPreviewInfo(info);
      setError(null);
      setTextContent(null);

      // Load text content for text files
      if (info.previewType === "text" && info.previewUrl) {
        loadTextContent(info.previewUrl);
      }
    } else {
      setPreviewInfo(null);
      setError(null);
      setTextContent(null);
    }
  }, [file]);

  const loadTextContent = async (url: string) => {
    setLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to load file content");
      }
      const content = await response.text();
      setTextContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load file");
    } finally {
      setLoading(false);
    }
  };

  if (!file || !previewInfo) {
    return null;
  }

  const displayName = file.metadata?.custom_name || file.name;
  const emoji = file.metadata?.emoji;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div class="flex items-center gap-2">
          {emoji && <span class="text-xl">{emoji}</span>}
          <span class="truncate">{displayName}</span>
        </div>
      }
      size="large"
      className="file-preview-modal"
    >
      <div class="flex flex-col h-full">
        {/* File info header */}
        <div class="flex items-center justify-between p-4 border-b border-base-300">
          <div class="flex items-center gap-3">
            <div class="text-sm text-base-content/70">
              <div>{formatFileSize(file.file_size)}</div>
              <div>{getFileTypeLabel(file.mime_type)}</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(file)}
              >
                ⬇️ Download
              </Button>
            )}
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShare(file)}
              >
                🔗 Share
              </Button>
            )}
          </div>
        </div>

        {/* Preview content */}
        <div class="flex-1 overflow-auto p-4">
          {!previewInfo.canPreview
            ? (
              <div class="flex flex-col items-center justify-center h-full text-center">
                <div class="text-6xl mb-4">📄</div>
                <h3 class="text-lg font-medium mb-2">Preview not available</h3>
                <p class="text-base-content/70 mb-4">
                  This file type cannot be previewed in the browser.
                </p>
                {onDownload && (
                  <Button onClick={() => onDownload(file)}>
                    Download to view
                  </Button>
                )}
              </div>
            )
            : (
              <div class="h-full">
                {renderPreviewContent(previewInfo, file, loading, error, textContent)}
              </div>
            )}
        </div>
      </div>
    </Modal>
  );
}

/**
 * Render preview content based on file type
 */
function renderPreviewContent(
  previewInfo: PreviewInfo,
  file: StorageObject,
  loading: boolean,
  error: string | null,
  textContent: string | null,
) {
  if (loading) {
    return (
      <div class="flex items-center justify-center h-full">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div class="flex items-center justify-center h-full">
        <Alert variant="error">
          <div class="text-center">
            <div class="text-lg mb-2">⚠️</div>
            <div>{error}</div>
          </div>
        </Alert>
      </div>
    );
  }

  switch (previewInfo.previewType) {
    case "image":
      return (
        <div class="flex items-center justify-center h-full">
          <img
            src={previewInfo.previewUrl}
            alt={file.name}
            class="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            style={{ maxHeight: "70vh" }}
          />
        </div>
      );

    case "video":
      return (
        <div class="flex items-center justify-center h-full">
          <video
            src={previewInfo.previewUrl}
            controls
            class="max-w-full max-h-full rounded-lg shadow-lg"
            style={{ maxHeight: "70vh" }}
            poster={previewInfo.thumbnailUrl}
          >
            Your browser does not support video playback.
          </video>
        </div>
      );

    case "audio":
      return (
        <div class="flex flex-col items-center justify-center h-full">
          <div class="text-6xl mb-6">🎵</div>
          <div class="w-full max-w-md">
            <audio
              src={previewInfo.previewUrl}
              controls
              class="w-full"
            >
              Your browser does not support audio playback.
            </audio>
          </div>
          <div class="text-center mt-4">
            <h3 class="font-medium">{file.metadata?.custom_name || file.name}</h3>
            <p class="text-sm text-base-content/70 mt-1">
              {formatFileSize(file.file_size)}
            </p>
          </div>
        </div>
      );

    case "pdf":
      return (
        <div class="h-full">
          <iframe
            src={previewInfo.previewUrl}
            class="w-full h-full border-0 rounded-lg"
            title={`PDF preview: ${file.name}`}
          >
            <div class="flex flex-col items-center justify-center h-full">
              <div class="text-6xl mb-4">📋</div>
              <p class="text-base-content/70 mb-4">
                Your browser doesn't support PDF preview.
              </p>
              <Button onClick={() => globalThis.open(previewInfo.previewUrl, "_blank")}>
                Open in new tab
              </Button>
            </div>
          </iframe>
        </div>
      );

    case "text":
      return (
        <div class="h-full">
          <div class="bg-base-200 rounded-lg p-4 h-full overflow-auto">
            <pre class="text-sm font-mono whitespace-pre-wrap break-words">
              {textContent || 'Loading...'}
            </pre>
          </div>
        </div>
      );

    default:
      return (
        <div class="flex flex-col items-center justify-center h-full text-center">
          <div class="text-6xl mb-4">📄</div>
          <h3 class="text-lg font-medium mb-2">Preview not available</h3>
          <p class="text-base-content/70">
            This file type cannot be previewed.
          </p>
        </div>
      );
  }
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get human-readable file type label
 */
function getFileTypeLabel(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("audio/")) return "Audio";
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("document") || mimeType.includes("word")) return "Document";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "Spreadsheet";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "Presentation";
  if (mimeType.includes("zip") || mimeType.includes("archive")) return "Archive";
  if (mimeType.includes("text/")) return "Text";
  return "File";
}
