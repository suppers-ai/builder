import { ComponentChildren } from "preact";
import { Download, File, Folder, Loader2, Search, Share, Trash2, Upload } from "lucide-preact";

interface LoadingStateProps {
  loading: boolean;
  children: ComponentChildren;
  loadingText?: string;
  operation?: "upload" | "download" | "delete" | "share" | "search" | "folder" | "file" | "general";
  size?: "sm" | "md" | "lg";
  overlay?: boolean;
  progress?: number;
  className?: string;
}

export function LoadingState({
  loading,
  children,
  loadingText,
  operation = "general",
  size = "md",
  overlay = false,
  progress,
  className = "",
}: LoadingStateProps) {
  if (!loading) {
    return <>{children}</>;
  }

  const getOperationIcon = () => {
    switch (operation) {
      case "upload":
        return <Upload class="w-5 h-5" />;
      case "download":
        return <Download class="w-5 h-5" />;
      case "delete":
        return <Trash2 class="w-5 h-5" />;
      case "share":
        return <Share class="w-5 h-5" />;
      case "search":
        return <Search class="w-5 h-5" />;
      case "folder":
        return <Folder class="w-5 h-5" />;
      case "file":
        return <File class="w-5 h-5" />;
      default:
        return <Loader2 class="w-5 h-5 animate-spin" />;
    }
  };

  const getDefaultText = () => {
    switch (operation) {
      case "upload":
        return "Uploading files...";
      case "download":
        return "Downloading...";
      case "delete":
        return "Deleting...";
      case "share":
        return "Creating share link...";
      case "search":
        return "Searching...";
      case "folder":
        return "Loading folder...";
      case "file":
        return "Loading file...";
      default:
        return "Loading...";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm gap-2";
      case "lg":
        return "text-lg gap-4";
      default:
        return "text-base gap-3";
    }
  };

  const loadingContent = (
    <div class={`flex flex-col items-center justify-center p-6 ${getSizeClasses()} ${className}`}>
      <div class="flex items-center gap-3 mb-2">
        {getOperationIcon()}
        <span class="font-medium">
          {loadingText || getDefaultText()}
        </span>
      </div>

      {progress !== undefined && (
        <div class="w-full max-w-xs">
          <div class="flex justify-between text-xs text-base-content/60 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div class="w-full bg-base-300 rounded-full h-2">
            <div
              class="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div class="relative">
        {children}
        <div class="absolute inset-0 bg-base-100/80 backdrop-blur-sm flex items-center justify-center z-10">
          {loadingContent}
        </div>
      </div>
    );
  }

  return loadingContent;
}

// Skeleton loading component for list items
export function SkeletonLoader({
  count = 3,
  type = "list",
  className = "",
}: {
  count?: number;
  type?: "list" | "grid" | "card";
  className?: string;
}) {
  const getSkeletonItem = (index: number) => {
    switch (type) {
      case "grid":
        return (
          <div key={index} class="bg-base-200 rounded-lg p-4 animate-pulse">
            <div class="w-full h-24 bg-base-300 rounded mb-3"></div>
            <div class="h-4 bg-base-300 rounded mb-2"></div>
            <div class="h-3 bg-base-300 rounded w-2/3"></div>
          </div>
        );
      case "card":
        return (
          <div key={index} class="bg-base-200 rounded-lg p-6 animate-pulse">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-base-300 rounded-full"></div>
              <div class="flex-1">
                <div class="h-4 bg-base-300 rounded mb-2"></div>
                <div class="h-3 bg-base-300 rounded w-1/2"></div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="h-3 bg-base-300 rounded"></div>
              <div class="h-3 bg-base-300 rounded w-3/4"></div>
            </div>
          </div>
        );
      default: // list
        return (
          <div key={index} class="flex items-center gap-3 p-3 bg-base-200 rounded-lg animate-pulse">
            <div class="w-8 h-8 bg-base-300 rounded"></div>
            <div class="flex-1">
              <div class="h-4 bg-base-300 rounded mb-2"></div>
              <div class="h-3 bg-base-300 rounded w-2/3"></div>
            </div>
            <div class="w-16 h-3 bg-base-300 rounded"></div>
          </div>
        );
    }
  };

  return (
    <div class={`space-y-3 ${className}`}>
      {Array.from({ length: count }, (_, index) => getSkeletonItem(index))}
    </div>
  );
}

// Inline loading spinner for buttons and small components
export function InlineLoader({
  size = "sm",
  className = "",
}: {
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
  };

  return <Loader2 class={`animate-spin ${sizeClasses[size]} ${className}`} />;
}

// Loading overlay for full-screen operations
export function LoadingOverlay({
  visible,
  message = "Loading...",
  progress,
  onCancel,
}: {
  visible: boolean;
  message?: string;
  progress?: number;
  onCancel?: () => void;
}) {
  if (!visible) return null;

  return (
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-base-100 rounded-lg p-8 max-w-sm w-full mx-4 shadow-xl">
        <div class="flex flex-col items-center text-center">
          <Loader2 class="w-12 h-12 animate-spin text-primary mb-4" />

          <h3 class="text-lg font-semibold mb-2">
            {message}
          </h3>

          {progress !== undefined && (
            <div class="w-full mb-4">
              <div class="flex justify-between text-sm text-base-content/60 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div class="w-full bg-base-300 rounded-full h-2">
                <div
                  class="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            </div>
          )}

          {onCancel && (
            <button
              onClick={onCancel}
              class="btn btn-outline btn-sm mt-2"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Empty state component for when there's no data
export function EmptyState({
  icon: Icon = Folder,
  title = "No items found",
  description = "There are no items to display.",
  action,
  className = "",
}: {
  icon?: any;
  title?: string;
  description?: string;
  action?: ComponentChildren;
  className?: string;
}) {
  return (
    <div class={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <Icon class="w-16 h-16 text-base-content/30 mb-4" />

      <h3 class="text-lg font-semibold text-base-content mb-2">
        {title}
      </h3>

      <p class="text-base-content/60 mb-6 max-w-md">
        {description}
      </p>

      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}
