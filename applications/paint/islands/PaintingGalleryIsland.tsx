import { useEffect, useState } from "preact/hooks";
import {
  AlertTriangle,
  Calendar,
  Eye,
  FileImage,
  Globe,
  Link2,
  Loader2,
  Trash2,
} from "lucide-preact";
import type { SavedPainting } from "../types/paint.ts";
import { deletePainting, fetchPaintings, formatFileSize } from "../lib/api-utils.ts";
import { getAuthClient } from "../lib/auth.ts";
import { showError, showInfo, showSuccess, showWarning } from "../lib/toast-manager.ts";

interface PaintingGalleryIslandProps {
  onLoadPainting?: (painting: SavedPainting) => void;
}

export default function PaintingGalleryIsland({ onLoadPainting }: PaintingGalleryIslandProps) {
  const [paintings, setPaintings] = useState<SavedPainting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const authClient = getAuthClient();
    const checkAuth = async () => {
      const user = await authClient.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  // Load paintings
  const loadPaintings = async (pageNum: number = 1) => {
    if (!isAuthenticated) {
      const errorMessage = "Please log in to view your paintings";
      setError(errorMessage);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      showInfo("Loading paintings...");

      const response = await fetchPaintings(pageNum, 12);

      if (response.success && response.data) {
        setPaintings(response.data.paintings);
        setTotalPages(response.data.totalPages);
        setPage(pageNum);

        if (response.data.paintings.length === 0 && pageNum === 1) {
          showInfo("No paintings found. Create your first masterpiece!");
        } else {
          showSuccess(
            `Loaded ${response.data.paintings.length} painting${
              response.data.paintings.length !== 1 ? "s" : ""
            }`,
          );
        }
      } else {
        const errorMessage = response.error || "Failed to load paintings";
        setError(errorMessage);
        showError(`Failed to load paintings: ${errorMessage}`);
      }
    } catch (err) {
      console.error("Error loading paintings:", err);
      const errorMessage = "Network error while loading paintings";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load paintings on mount and when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      loadPaintings(1);
    }
  }, [isAuthenticated]);

  // Handle delete painting
  const handleDelete = async (paintingId: string) => {
    if (!deleteConfirm || deleteConfirm !== paintingId) {
      setDeleteConfirm(paintingId);
      showWarning("Click delete again to confirm");
      return;
    }

    setDeleting(paintingId);
    setDeleteConfirm(null);

    try {
      showInfo("Deleting painting...");

      const response = await deletePainting(paintingId);

      if (response.success) {
        // Remove from local state
        setPaintings((prev) => prev.filter((p) => p.id !== paintingId));
        // Success toast is already shown by the API function
      } else {
        const errorMessage = response.error || "Failed to delete painting";
        setError(errorMessage);
        showError(`Delete failed: ${errorMessage}`);
      }
    } catch (err) {
      console.error("Error deleting painting:", err);
      const errorMessage = "Network error while deleting painting";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  // Handle load painting - navigate to preview page
  const handleLoad = (painting: SavedPainting) => {
    if (onLoadPainting) {
      onLoadPainting(painting);
    } else {
      // Navigate to preview page
      globalThis.location.href = `/preview/${painting.id}`;
    }
  };

  // Format date for display
  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadPaintings(newPage);
    }
  };

  // Cancel delete confirmation
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (!isAuthenticated) {
    return (
      <div class="text-center py-12">
        <AlertTriangle class="w-16 h-16 text-warning mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">Authentication Required</h3>
        <p class="text-base-content/60 mb-4">
          Please log in to view your saved paintings.
        </p>
        <a href="/auth/login" class="btn btn-primary">
          Log In
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div class="text-center py-12">
        <div class="loading loading-spinner loading-lg text-primary"></div>
        <p class="mt-4 text-base-content/60">Loading your paintings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div class="text-center py-12">
        <AlertTriangle class="w-16 h-16 text-error mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">Error Loading Paintings</h3>
        <p class="text-base-content/60 mb-4">{error}</p>
        <button
          class="btn btn-primary"
          onClick={() => loadPaintings(page)}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (paintings.length === 0) {
    return (
      <div class="text-center py-12">
        <FileImage class="w-16 h-16 text-base-content/40 mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">No Paintings Yet</h3>
        <p class="text-base-content/60 mb-4">
          Start creating your first masterpiece!
        </p>
        <a href="/" class="btn btn-primary">
          Create New Painting
        </a>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Gallery Grid */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paintings.map((painting) => (
          <div
            key={painting.id}
            class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
          >
            {/* Thumbnail */}
            <figure class="aspect-square bg-base-200 relative overflow-hidden">
              {painting.thumbnail
                ? (
                  <img
                    src={painting.thumbnail}
                    alt={painting.name}
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                )
                : (
                  <div class="w-full h-full flex items-center justify-center">
                    <FileImage class="w-12 h-12 text-base-content/40" />
                  </div>
                )}

              {/* Overlay with actions */}
              <div class="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  class="btn btn-sm btn-primary"
                  onClick={() => handleLoad(painting)}
                  title="Load painting"
                >
                  <Eye class="w-4 h-4" />
                </button>
                <button
                  class={`btn btn-sm ${deleteConfirm === painting.id ? "btn-error" : "btn-ghost"}`}
                  onClick={() => handleDelete(painting.id)}
                  disabled={deleting === painting.id}
                  title={deleteConfirm === painting.id
                    ? "Click again to confirm"
                    : "Delete painting"}
                >
                  {deleting === painting.id
                    ? <div class="loading loading-spinner loading-xs"></div>
                    : <Trash2 class="w-4 h-4" />}
                </button>
              </div>
            </figure>

            {/* Card Content */}
            <div class="card-body p-4">
              <h3 class="card-title text-sm font-medium truncate" title={painting.name}>
                {painting.name}
              </h3>

              <div class="text-xs text-base-content/60 space-y-1">
                <div class="flex items-center gap-1">
                  <Calendar class="w-3 h-3" />
                  <span>{formatDate(painting.createdAt)}</span>
                </div>
                <div class="flex items-center gap-1">
                  <FileImage class="w-3 h-3" />
                  <span>{formatFileSize(painting.size || 0)}</span>
                </div>
                {/* Sharing Status */}
                <div class="flex items-center gap-2">
                  {painting.isPublic && (
                    <div class="flex items-center gap-1 text-primary" title="Public painting">
                      <Globe class="w-3 h-3" />
                      <span>Public</span>
                    </div>
                  )}
                  {painting.shareToken && (
                    <div
                      class="flex items-center gap-1 text-secondary"
                      title="Private share link available"
                    >
                      <Link2 class="w-3 h-3" />
                      <span>Link</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delete confirmation */}
              {deleteConfirm === painting.id && (
                <div class="alert alert-warning p-2 mt-2">
                  <div class="text-xs">
                    <p class="font-medium">Delete this painting?</p>
                    <div class="flex gap-2 mt-2">
                      <button
                        class="btn btn-xs btn-error"
                        onClick={() => handleDelete(painting.id)}
                      >
                        Delete
                      </button>
                      <button
                        class="btn btn-xs btn-ghost"
                        onClick={cancelDelete}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div class="flex justify-center">
          <div class="join">
            <button
              class="join-item btn btn-sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              «
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                class={`join-item btn btn-sm ${pageNum === page ? "btn-active" : ""}`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              class="join-item btn btn-sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div class="text-center">
        <a href="/" class="btn btn-primary">
          Create New Painting
        </a>
      </div>
    </div>
  );
}
