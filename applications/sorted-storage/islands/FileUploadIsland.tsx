/**
 * File upload island with drag-and-drop support, progress indicators, and metadata input
 * Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 8.2, 8.4
 */

import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { storageApi } from "../lib/storage-api.ts";
import { generateThumbnail, supportsThumbnailGeneration } from "../lib/thumbnail-generator.ts";
import type {
  FileUploadOptions,
  StorageMetadata,
  StorageObject,
  UploadProgress,
} from "../types/storage.ts";
import type { UploadError, ValidationError } from "../types/errors.ts";
import {
  Alert,
  Badge,
  Button,
  Card,
  FileInput,
  Input,
  Loading,
  Modal,
  Progress,
} from "@suppers/ui-lib";
import { UploadErrorBoundary } from "../components/ErrorBoundary.tsx";
import { InlineLoader, LoadingState } from "../components/LoadingState.tsx";
import { handleUploadError } from "../lib/error-handler.ts";
import { completeProgress, showError, showProgress, updateProgress } from "../lib/toast-manager.ts";

interface FileUploadState {
  // Upload state
  isDragOver: boolean;
  isUploading: boolean;
  uploadQueue: File[];
  uploadProgress: Map<string, UploadProgress>;
  completedUploads: StorageObject[];

  // Validation and errors
  validationErrors: Map<string, string>;
  uploadErrors: Map<string, string>;

  // Metadata input
  showMetadataModal: boolean;
  currentFileForMetadata: File | null;
  fileMetadata: Map<string, Partial<StorageMetadata>>;

  // Settings
  uploadOptions: FileUploadOptions;
}

interface FileUploadIslandProps {
  currentFolderId?: string;
  maxFileSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
  showMetadataInput?: boolean;
  onUploadComplete?: (files: StorageObject[]) => void;
  onUploadError?: (error: UploadError) => void;
  className?: string;
}

// Default file size limit: 50MB
const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024;

// Default allowed file types (common file types)
const DEFAULT_ALLOWED_TYPES = [
  "image/*",
  "text/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
];

export default function FileUploadIsland({
  currentFolderId,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  multiple = true,
  showMetadataInput = true,
  onUploadComplete,
  onUploadError,
  className = "",
}: FileUploadIslandProps) {
  const [state, setState] = useState<FileUploadState>({
    isDragOver: false,
    isUploading: false,
    uploadQueue: [],
    uploadProgress: new Map(),
    completedUploads: [],
    validationErrors: new Map(),
    uploadErrors: new Map(),
    showMetadataModal: false,
    currentFileForMetadata: null,
    fileMetadata: new Map(),
    uploadOptions: {
      currentFolderId,
      maxFileSize,
      allowedTypes,
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Update upload options when props change
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      uploadOptions: {
        currentFolderId,
        maxFileSize,
        allowedTypes,
      },
    }));
  }, [currentFolderId, maxFileSize, allowedTypes]);

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxFileSize)}.`;
    }

    // Check file type
    if (allowedTypes.length > 0) {
      const isAllowed = allowedTypes.some((type) => {
        if (type.endsWith("/*")) {
          const baseType = type.slice(0, -2);
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });

      if (!isAllowed) {
        return `File type "${file.type}" is not allowed.`;
      }
    }

    return null;
  }, [maxFileSize, allowedTypes]);

  // Validate multiple files
  const validateFiles = useCallback((files: File[]): Map<string, string> => {
    const errors = new Map<string, string>();

    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.set(file.name, error);
      }
    });

    return errors;
  }, [validateFile]);

  // Handle file selection
  const handleFileSelect = useCallback((files: File[]) => {
    const validationErrors = validateFiles(files);

    setState((prev) => ({
      ...prev,
      uploadQueue: [...prev.uploadQueue, ...files],
      validationErrors,
    }));

    // If metadata input is enabled and there are valid files, show metadata modal for first file
    if (showMetadataInput && files.length > 0 && validationErrors.size === 0) {
      setState((prev) => ({
        ...prev,
        showMetadataModal: true,
        currentFileForMetadata: files[0],
      }));
    } else if (validationErrors.size === 0) {
      // Start upload immediately if no metadata input required
      startUpload(files);
    }
  }, [validateFiles, showMetadataInput]);

  // Handle drag and drop events
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, isDragOver: true }));
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, isDragOver: false }));
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, isDragOver: false }));

    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  // Set up drag and drop event listeners
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    dropZone.addEventListener("dragover", handleDragOver);
    dropZone.addEventListener("dragleave", handleDragLeave);
    dropZone.addEventListener("drop", handleDrop);

    return () => {
      dropZone.removeEventListener("dragover", handleDragOver);
      dropZone.removeEventListener("dragleave", handleDragLeave);
      dropZone.removeEventListener("drop", handleDrop);
    };
  }, [handleDragOver, handleDragLeave, handleDrop]);

  // Start file upload
  const startUpload = useCallback(async (files: File[]) => {
    setState((prev) => ({ ...prev, isUploading: true }));

    const uploadPromises = files.map(async (file) => {
      const fileId = crypto.randomUUID();
      const metadata = state.fileMetadata.get(file.name) || {};

      // Initialize progress
      setState((prev) => {
        const newProgress = new Map(prev.uploadProgress);
        newProgress.set(fileId, {
          fileId,
          fileName: file.name,
          progress: 0,
          status: "pending",
        });
        return { ...prev, uploadProgress: newProgress };
      });

      try {
        // Show progress toast
        const progressToastId = showProgress(`Uploading ${file.name}`);

        // Generate thumbnail if supported
        let thumbnailUrl: string | null = null;
        if (supportsThumbnailGeneration(file.type)) {
          try {
            updateProgress(progressToastId, `Generating thumbnail for ${file.name}`, 5);
            thumbnailUrl = await generateThumbnail(file, {
              width: 200,
              height: 200,
              quality: 0.8,
              format: "webp",
            });
          } catch (thumbnailError) {
            console.warn("Failed to generate thumbnail:", thumbnailError);
            // Continue with upload even if thumbnail generation fails
          }
        }

        // Create enhanced upload options with thumbnail
        const enhancedOptions: FileUploadOptions = {
          ...state.uploadOptions,
          generateThumbnail: true,
        };

        const uploadedFile = await storageApi.uploadFile(
          file,
          enhancedOptions,
          (progress) => {
            setState((prev) => {
              const newProgress = new Map(prev.uploadProgress);
              newProgress.set(fileId, progress);
              return { ...prev, uploadProgress: newProgress };
            });

            // Update progress toast
            updateProgress(progressToastId, `Uploading ${file.name}`, progress.progress);
          },
        );

        // If we generated a thumbnail locally, update the uploaded file
        if (thumbnailUrl && uploadedFile) {
          uploadedFile.thumbnail_url = thumbnailUrl;
        }

        // Mark as completed
        setState((prev) => ({
          ...prev,
          completedUploads: [...prev.completedUploads, uploadedFile],
        }));

        // Complete progress toast
        completeProgress(progressToastId, `Upload of ${file.name}`, true);

        return uploadedFile;
      } catch (error) {
        console.error("Upload error:", error);

        // Handle upload error with proper error handling
        const uploadError = handleUploadError(error as Error, {
          name: file.name,
          size: file.size,
        });

        setState((prev) => {
          const newErrors = new Map(prev.uploadErrors);
          newErrors.set(file.name, uploadError.message);

          const newProgress = new Map(prev.uploadProgress);
          newProgress.set(fileId, {
            fileId,
            fileName: file.name,
            progress: 0,
            status: "error",
            error: uploadError.message,
          });

          return {
            ...prev,
            uploadErrors: newErrors,
            uploadProgress: newProgress,
          };
        });

        // Show user-friendly error message
        if (uploadError.message.includes("size")) {
          showError(`File "${file.name}" is too large. Please choose a smaller file.`, {
            duration: 8000,
          });
        } else if (uploadError.message.includes("type")) {
          showError(`File type not supported for "${file.name}". Please choose a different file.`, {
            duration: 8000,
          });
        } else if (uploadError.message.includes("quota")) {
          showError("Storage quota exceeded. Please free up space or upgrade your plan.", {
            duration: 10000,
          });
        } else {
          showError(`Failed to upload "${file.name}". Please try again.`, {
            duration: 8000,
          });
        }

        if (onUploadError) {
          onUploadError(uploadError);
        }

        throw error;
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<StorageObject> =>
          result.status === "fulfilled"
        )
        .map((result) => result.value);

      if (successfulUploads.length > 0 && onUploadComplete) {
        onUploadComplete(successfulUploads);
      }
    } finally {
      setState((prev) => ({
        ...prev,
        isUploading: false,
        uploadQueue: [],
      }));
    }
  }, [state.uploadOptions, state.fileMetadata, onUploadComplete, onUploadError]);

  // Handle metadata input
  const handleMetadataSubmit = useCallback((metadata: Partial<StorageMetadata>) => {
    if (!state.currentFileForMetadata) return;

    setState((prev) => {
      const newMetadata = new Map(prev.fileMetadata);
      newMetadata.set(state.currentFileForMetadata!.name, metadata);

      return {
        ...prev,
        fileMetadata: newMetadata,
        showMetadataModal: false,
        currentFileForMetadata: null,
      };
    });

    // Start upload with metadata
    if (state.currentFileForMetadata) {
      startUpload([state.currentFileForMetadata]);
    }
  }, [state.currentFileForMetadata, startUpload]);

  // Clear completed uploads
  const clearCompleted = useCallback(() => {
    setState((prev) => ({
      ...prev,
      completedUploads: [],
      uploadProgress: new Map(),
      uploadErrors: new Map(),
      validationErrors: new Map(),
    }));
  }, []);

  // Remove file from queue
  const removeFromQueue = useCallback((fileName: string) => {
    setState((prev) => ({
      ...prev,
      uploadQueue: prev.uploadQueue.filter((file) => file.name !== fileName),
      validationErrors: new Map([...prev.validationErrors].filter(([name]) => name !== fileName)),
    }));
  }, []);

  // Calculate overall progress
  const overallProgress = state.uploadProgress.size > 0
    ? Array.from(state.uploadProgress.values()).reduce(
      (sum, progress) => sum + progress.progress,
      0,
    ) / state.uploadProgress.size
    : 0;

  return (
    <UploadErrorBoundary>
      <div class={`space-y-4 ${className}`}>
        {/* Drop Zone */}
        <div
          ref={dropZoneRef}
          class={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${
            state.isDragOver
              ? "border-primary bg-primary/10"
              : "border-base-300 hover:border-base-400"
          }
          ${state.isUploading ? "pointer-events-none opacity-50" : "cursor-pointer"}
        `}
          onClick={() => fileInputRef.current?.click()}
        >
          <div class="space-y-4">
            <div class="text-4xl">
              {state.isDragOver ? "📤" : "📁"}
            </div>

            <div>
              <h3 class="text-lg font-semibold mb-2">
                {state.isDragOver ? "Drop files here" : "Upload Files"}
              </h3>
              <p class="text-base-content/70">
                Drag and drop files here, or click to select files
              </p>
              <p class="text-sm text-base-content/50 mt-2">
                Maximum file size: {formatFileSize(maxFileSize)}
                {allowedTypes.length > 0 && (
                  <span class="block">
                    Allowed types: {allowedTypes.join(", ")}
                  </span>
                )}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple={multiple}
              accept={allowedTypes.join(",")}
              onChange={(e) => {
                const files = Array.from((e.target as HTMLInputElement).files || []);
                if (files.length > 0) {
                  handleFileSelect(files);
                }
              }}
              class="hidden"
            />
          </div>
        </div>

        {/* Upload Progress */}
        {state.uploadProgress.size > 0 && (
          <Card class="p-4">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-semibold">Upload Progress</h4>
              <div class="flex items-center gap-2">
                <span class="text-sm text-base-content/70">
                  {Math.round(overallProgress)}%
                </span>
                {state.isUploading && <Loading size="sm" />}
              </div>
            </div>

            <Progress
              value={overallProgress}
              class="mb-4"
              color={overallProgress === 100 ? "success" : "primary"}
            />

            <div class="space-y-2 max-h-48 overflow-y-auto">
              {Array.from(state.uploadProgress.values()).map((progress) => (
                <div key={progress.fileId} class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <div class="truncate">{progress.fileName}</div>
                    <Badge
                      color={progress.status === "completed"
                        ? "success"
                        : progress.status === "error"
                        ? "error"
                        : progress.status === "uploading"
                        ? "primary"
                        : undefined}
                      size="xs"
                    >
                      {progress.status}
                    </Badge>
                  </div>
                  <div class="text-right">
                    {progress.status === "error"
                      ? <span class="text-error text-xs">{progress.error}</span>
                      : <span>{progress.progress}%</span>}
                  </div>
                </div>
              ))}
            </div>

            {state.completedUploads.length > 0 && (
              <div class="flex justify-end mt-4">
                <Button size="sm" class="btn-outline" onClick={clearCompleted}>
                  Clear Completed
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Validation Errors */}
        {state.validationErrors.size > 0 && (
          <Alert class="alert-error">
            <div>
              <h4 class="font-semibold">File Validation Errors</h4>
              <ul class="list-disc list-inside text-sm mt-2">
                {Array.from(state.validationErrors.entries()).map(([fileName, error]) => (
                  <li key={fileName}>
                    <strong>{fileName}:</strong> {error}
                    <button
                      class="btn btn-xs btn-ghost ml-2"
                      onClick={() =>
                        removeFromQueue(fileName)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Alert>
        )}

        {/* Upload Queue */}
        {state.uploadQueue.length > 0 && !state.isUploading && (
          <Card class="p-4">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-semibold">
                Files Ready to Upload ({state.uploadQueue.length})
              </h4>
              <div class="flex gap-2">
                <Button
                  size="sm"
                  class="btn-outline"
                  onClick={() => setState((prev) => ({ ...prev, uploadQueue: [] }))}
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={() => startUpload(state.uploadQueue)}
                  disabled={state.validationErrors.size > 0}
                >
                  Upload All
                </Button>
              </div>
            </div>

            <div class="space-y-2">
              {state.uploadQueue.map((file) => (
                <div key={file.name} class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2">
                    <span class="truncate">{file.name}</span>
                    <Badge size="xs" class="badge-ghost">
                      {formatFileSize(file.size)}
                    </Badge>
                  </div>
                  <button
                    class="btn btn-xs btn-ghost"
                    onClick={() =>
                      removeFromQueue(file.name)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Metadata Input Modal */}
        {showMetadataInput && (
          <MetadataInputModal
            open={state.showMetadataModal}
            file={state.currentFileForMetadata}
            onSubmit={handleMetadataSubmit}
            onCancel={() =>
              setState((prev) => ({
                ...prev,
                showMetadataModal: false,
                currentFileForMetadata: null,
              }))}
          />
        )}
      </div>
    </UploadErrorBoundary>
  );
}

/**
 * Metadata input modal component
 */
interface MetadataInputModalProps {
  open: boolean;
  file: File | null;
  onSubmit: (metadata: Partial<StorageMetadata>) => void;
  onCancel: () => void;
}

function MetadataInputModal({ open, file, onSubmit, onCancel }: MetadataInputModalProps) {
  const [metadata, setMetadata] = useState<Partial<StorageMetadata>>({
    custom_name: "",
    description: "",
    emoji: "",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");

  // Reset metadata when file changes
  useEffect(() => {
    if (file) {
      setMetadata({
        custom_name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        description: "",
        emoji: "",
        tags: [],
      });
    }
  }, [file]);

  const handleSubmit = useCallback(() => {
    onSubmit(metadata);
    setMetadata({
      custom_name: "",
      description: "",
      emoji: "",
      tags: [],
    });
  }, [metadata, onSubmit]);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !metadata.tags?.includes(tagInput.trim())) {
      setMetadata((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput("");
    }
  }, [tagInput, metadata.tags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setMetadata((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  }, []);

  if (!file) return null;

  return (
    <Modal open={open} onClose={onCancel} title="Add File Details">
      <div class="space-y-4">
        <div>
          <p class="text-sm text-base-content/70 mb-4">
            Adding details for: <strong>{file.name}</strong>
          </p>
        </div>

        <div>
          <label class="label">
            <span class="label-text">Custom Name</span>
          </label>
          <Input
            value={metadata.custom_name || ""}
            onChange={(e) =>
              setMetadata((prev) => ({
                ...prev,
                custom_name: (e.target as HTMLInputElement).value,
              }))}
            placeholder="Enter a custom name for this file"
          />
        </div>

        <div>
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea
            class="textarea textarea-bordered w-full"
            value={metadata.description || ""}
            onChange={(e) =>
              setMetadata((prev) => ({
                ...prev,
                description: (e.target as HTMLTextAreaElement).value,
              }))}
            placeholder="Add a description for this file"
            rows={3}
          />
        </div>

        <div>
          <label class="label">
            <span class="label-text">Emoji</span>
          </label>
          <input
            type="text"
            class="input input-bordered w-full"
            value={metadata.emoji || ""}
            onChange={(e) =>
              setMetadata((prev) => ({
                ...prev,
                emoji: (e.target as HTMLInputElement).value,
              }))}
            placeholder="📄"
            maxLength={2}
          />
        </div>

        <div>
          <label class="label">
            <span class="label-text">Tags</span>
          </label>
          <div class="flex gap-2 mb-2">
            <input
              type="text"
              class="input input-bordered flex-1"
              value={tagInput}
              onChange={(e) => setTagInput((e.target as HTMLInputElement).value)}
              placeholder="Add a tag"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button size="sm" onClick={handleAddTag}>
              Add
            </Button>
          </div>
          {metadata.tags && metadata.tags.length > 0 && (
            <div class="flex flex-wrap gap-1">
              {metadata.tags.map((tag) => (
                <Badge key={tag} class="badge-outline">
                  {tag}
                  <button
                    class="ml-1 text-xs"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ✕
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <Button class="btn-ghost" onClick={onCancel}>
            Skip
          </Button>
          <Button onClick={handleSubmit}>
            Upload File
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
