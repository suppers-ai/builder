import { useEffect, useRef, useState } from "preact/hooks";
import { AlertTriangle, ArrowLeft, Download, Globe, Link, Shield } from "lucide-preact";
import { formatFileSize } from "../lib/api-utils.ts";
import { DEFAULT_CANVAS_SETTINGS, drawInsertedImage, drawStroke } from "../lib/paint-utils.ts";
import type { DrawingState, Stroke } from "../types/paint.ts";
import { Alert, Button, Loading } from "@suppers/ui-lib";

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface SharePageProps {
  shareToken?: string;
  applicationSlug?: string;
  filename?: string;
  isPublic?: boolean;
}

interface SharedPainting {
  id: string;
  name: string;
  size: number;
  contentType: string;
  createdAt: string;
  downloadUrl: string;
  paintingData: DrawingState;
}

export default function SharePageIsland({
  shareToken,
  applicationSlug,
  filename,
  isPublic = false,
}: SharePageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [painting, setPainting] = useState<SharedPainting | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const API_BASE_URL = "http://127.0.0.1:54321/functions/v1/api/v1";

  useEffect(() => {
    loadSharedPainting();
  }, [shareToken, applicationSlug, filename]);

  // Draw painting on canvas when data is loaded
  useEffect(() => {
    if (!painting || !painting.paintingData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctxRef.current = ctx;

    // Set canvas size
    const drawingData = painting.paintingData;
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

  const loadSharedPainting = async () => {
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

      // Fetch the painting data
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          setError("This shared painting could not be found or may have been removed.");
        } else {
          setError(`Failed to load painting: ${response.statusText}`);
        }
        return;
      }

      const paintingText = await response.text();
      const paintingData = JSON.parse(paintingText);

      // Create painting object
      const sharedPainting: SharedPainting = {
        id: shareToken || `${applicationSlug}-${filename}`,
        name: paintingData.name || filename || "Shared Painting",
        size: new Blob([paintingText]).size,
        contentType: "application/json",
        createdAt: paintingData.createdAt || new Date().toISOString(),
        downloadUrl: url,
        paintingData: paintingData.drawingData ||
          {
            strokes: [],
            images: [],
            canvasSize: { width: 800, height: 600 },
            backgroundColor: "#ffffff",
          },
      };

      setPainting(sharedPainting);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shared painting");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!canvasRef.current || !painting) return;

    try {
      const canvas = canvasRef.current;

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Failed to generate image");
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
        },
        "image/png",
        0.95,
      );
    } catch (error) {
      setError("Failed to download painting");
    }
  };

  const handleDownloadJSON = async () => {
    if (!painting) return;

    try {
      // Create a link and trigger download
      const a = document.createElement("a");
      a.href = painting.downloadUrl;
      a.download = painting.name.endsWith(".json") ? painting.name : `${painting.name}.json`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to download painting");
    }
  };

  if (loading) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <Loading size="lg" />
          <p class="mt-4 text-lg">Loading shared painting...</p>
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
              <h3 class="font-semibold">Unable to Load Painting</h3>
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

  if (!painting) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <Alert color="warning">
          <AlertTriangle class="w-5 h-5" />
          <span>Painting not found</span>
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
            {isPublic ? "Public Painting" : "Shared Painting"}
          </h1>
        </div>
        <p class="text-base-content/60">
          {isPublic
            ? "This painting has been shared publicly"
            : "Someone shared this painting with you"}
        </p>
      </div>

      {/* Painting Info */}
      <div class="text-center mb-6">
        <h2 class="text-xl font-semibold mb-2">{painting.name}</h2>
        <p class="text-base-content/60">
          Created {formatDate(painting.createdAt)} • {formatFileSize(painting.size)}
        </p>
      </div>

      {/* Canvas Container */}
      <div class="flex justify-center mb-8">
        <div class="card bg-base-100 shadow-lg border border-base-300">
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
        <Button
          onClick={handleDownloadPNG}
          class="btn-primary"
        >
          <Download class="w-5 h-5 mr-2" />
          Download as PNG
        </Button>

        <Button
          onClick={handleDownloadJSON}
          variant="outline"
        >
          <Download class="w-5 h-5 mr-2" />
          Download JSON
        </Button>
      </div>

      {/* Footer */}
      <div class="text-center mt-8 pt-8 border-t border-base-300">
        <p class="text-sm text-base-content/60">
          Want to create your own paintings?{" "}
          <a href="/" class="link link-primary">
            Try the Paint App
          </a>
        </p>
      </div>
    </div>
  );
}
