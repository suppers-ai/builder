import { useEffect, useRef, useState } from "preact/hooks";
import { AlertTriangle, ArrowLeft, Download, Loader2, Share } from "lucide-preact";
import type { DrawingState, InsertedImage, SavedPainting, Stroke } from "../types/paint.ts";
import { fetchPainting } from "../lib/api-utils.ts";
import { getAuthClient } from "../lib/auth.ts";
import { showError, showInfo, showSuccess } from "../lib/toast-manager.ts";
import { DEFAULT_CANVAS_SETTINGS, drawInsertedImage, drawStroke } from "../lib/paint-utils.ts";
import { type ShareItem, ShareModal } from "@suppers/ui-lib";

interface PaintingPreviewIslandProps {
  paintingId: string;
}

export default function PaintingPreviewIsland({ paintingId }: PaintingPreviewIslandProps) {
  const [painting, setPainting] = useState<SavedPainting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Check authentication status
  useEffect(() => {
    const authClient = getAuthClient();
    const checkAuth = async () => {
      const user = await authClient.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  // Load painting data
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const loadPainting = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchPainting(paintingId);

        if (response.success && response.data && response.data.painting) {
          setPainting(response.data.painting);
        } else {
          setError(response.error || "Failed to load painting");
        }
      } catch (err) {
        console.error("Error loading painting:", err);
        setError("Network error while loading painting");
      } finally {
        setLoading(false);
      }
    };

    loadPainting();
  }, [paintingId, isAuthenticated]);

  // Initialize canvas and draw painting
  useEffect(() => {
    if (!painting || !painting.drawingData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctxRef.current = ctx;

    // Set canvas size
    const drawingData = painting.drawingData;
    const canvasWidth = drawingData.canvasSize?.width || DEFAULT_CANVAS_SETTINGS.width;
    const canvasHeight = drawingData.canvasSize?.height || DEFAULT_CANVAS_SETTINGS.height;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Set background color
    const backgroundColor = drawingData.backgroundColor || DEFAULT_CANVAS_SETTINGS.backgroundColor;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw all strokes
    if (drawingData.strokes && drawingData.strokes.length > 0) {
      drawingData.strokes.forEach((stroke: Stroke) => {
        drawStroke(ctx, stroke);
      });
    }

    // Draw all images
    if (drawingData.images && drawingData.images.length > 0) {
      const loadImagesAndDraw = async () => {
        for (const imageData of drawingData.images) {
          try {
            const img = new Image();
            img.crossOrigin = "anonymous";

            await new Promise<void>((resolve, reject) => {
              img.onload = () => {
                // Draw the image directly since drawInsertedImage creates its own Image
                ctx.drawImage(
                  img,
                  imageData.x,
                  imageData.y,
                  imageData.width,
                  imageData.height,
                );
                resolve();
              };
              img.onerror = () => reject(new Error(`Failed to load image: ${imageData.src}`));
              img.src = imageData.src;
            });
          } catch (error) {
            console.warn("Failed to load image:", imageData.src, error);
          }
        }
      };

      loadImagesAndDraw();
    }
  }, [painting]);

  // Handle download as PNG
  const handleDownloadPNG = async () => {
    if (!canvasRef.current || !painting) return;

    try {
      setIsDownloading(true);
      showInfo("Downloading painting...");

      const canvas = canvasRef.current;

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            showError("Failed to generate image");
            return;
          }

          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${painting.name.replace(/[^a-zA-Z0-9-_]/g, "_")}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          showSuccess(`Downloaded "${painting.name}" as PNG`);
        },
        "image/png",
        0.95,
      );
    } catch (error) {
      console.error("Download error:", error);
      showError("Failed to download painting");
    } finally {
      setIsDownloading(false);
    }
  };

  // Sharing helper functions
  const getAuthHeaders = async () => {
    const authClient = getAuthClient();
    const accessToken = await authClient.getAccessToken();
    const userId = authClient.getUserId();

    if (!accessToken || !userId) {
      throw new Error("Authentication required");
    }

    return {
      "Authorization": `Bearer ${accessToken}`,
      "X-User-ID": userId,
      "Content-Type": "application/json",
    };
  };

  const handleDownloadPaintingFromShare = async (shareItem: ShareItem) => {
    // Convert canvas to PNG for download
    await handleDownloadPNG();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <div class="text-center py-12">
        <AlertTriangle class="w-16 h-16 text-warning mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">Authentication Required</h3>
        <p class="text-base-content/60 mb-4">
          Please log in to view paintings.
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
        <p class="mt-4 text-base-content/60">Loading painting...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div class="text-center py-12">
        <AlertTriangle class="w-16 h-16 text-error mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">Error Loading Painting</h3>
        <p class="text-base-content/60 mb-4">{error}</p>
        <a href="/gallery" class="btn btn-primary">
          ← Back to Gallery
        </a>
      </div>
    );
  }

  if (!painting) {
    return (
      <div class="text-center py-12">
        <AlertTriangle class="w-16 h-16 text-warning mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">Painting Not Found</h3>
        <p class="text-base-content/60 mb-4">
          The requested painting could not be found.
        </p>
        <a href="/gallery" class="btn btn-primary">
          ← Back to Gallery
        </a>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Painting Info */}
      <div class="text-center">
        <h2 class="text-2xl font-bold mb-2">{painting.name}</h2>
        <p class="text-base-content/60">
          Created {new Date(painting.createdAt).toLocaleDateString()} •
          {Math.round((painting.size || 0) / 1024)} KB
        </p>
      </div>

      {/* Canvas Container */}
      <div class="flex justify-center">
        <div class="card bg-base-200 shadow-lg border border-base-300">
          <div class="card-body p-6">
            <div class="flex justify-center">
              <canvas
                ref={canvasRef}
                class="border border-base-300 rounded-lg shadow-sm max-w-full h-auto"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div class="flex justify-center gap-4">
        <button
          onClick={handleDownloadPNG}
          disabled={isDownloading}
          class={`btn btn-primary btn-lg ${isDownloading ? "loading" : ""}`}
        >
          {isDownloading
            ? (
              <>
                <span class="loading loading-spinner loading-sm"></span>
                Downloading...
              </>
            )
            : (
              <>
                <Download class="w-5 h-5 mr-2" />
                Download as PNG
              </>
            )}
        </button>

        <button
          onClick={() => setShowShareModal(true)}
          class="btn btn-secondary btn-lg"
        >
          <Share class="w-5 h-5 mr-2" />
          Share
        </button>
      </div>

      {/* Share Modal */}
      {painting && (
        <ShareModal
          item={{
            id: painting.id,
            name: painting.name,
            size: painting.size,
            createdAt: painting.createdAt,
            filePath: painting.fileName || painting.name,
          }}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onDownload={handleDownloadPaintingFromShare}
          applicationSlug="paint"
          apiBaseUrl="http://127.0.0.1:54321/functions/v1/api/v1"
          sharePageBaseUrl="http://localhost:8006"
          getAuthHeaders={getAuthHeaders}
          formatFileSize={formatFileSize}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}
