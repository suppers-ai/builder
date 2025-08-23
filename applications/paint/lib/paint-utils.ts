// Canvas drawing utilities for the paint application
import type {
  CanvasExportFormat,
  CanvasPointerEvent,
  CanvasSettings,
  CanvasState,
  DrawingState,
  ExportOptions,
  FileValidationOptions,
  ImageUploadResult,
  InsertedImage,
  Point,
  Stroke,
  ValidationResult,
} from "../types/paint.ts";

// Default canvas settings
export const DEFAULT_CANVAS_SETTINGS: CanvasSettings = {
  width: 800,
  height: 600,
  backgroundColor: "#ffffff",
  maxHistorySteps: 50,
};

// Default tool settings
export const DEFAULT_PENCIL_COLOR = "#000000";
export const DEFAULT_PENCIL_WIDTH = 3;
export const DEFAULT_ERASER_WIDTH = 10;

/**
 * Initialize a canvas element with proper settings
 */
export function initializeCanvas(
  canvas: HTMLCanvasElement,
  settings: Partial<CanvasSettings> = {},
): CanvasRenderingContext2D {
  const config = { ...DEFAULT_CANVAS_SETTINGS, ...settings };

  // Set canvas dimensions
  canvas.width = config.width;
  canvas.height = config.height;

  // Get 2D context
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D rendering context");
  }

  // Configure context for smooth drawing
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Set background color
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, config.width, config.height);

  return ctx;
}

/**
 * Get canvas coordinates from mouse event
 */
export function getCanvasCoordinatesFromMouse(
  event: MouseEvent,
  canvas: HTMLCanvasElement,
): Point {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

/**
 * Get canvas coordinates from touch event with enhanced touch tracking
 */
export function getCanvasCoordinatesFromTouch(
  event: TouchEvent,
  canvas: HTMLCanvasElement,
): Point {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const touch = event.touches[0] || event.changedTouches[0];

  if (!touch) {
    // Fallback for edge cases
    return { x: 0, y: 0, pressure: 1 };
  }

  // Enhanced touch coordinate calculation with sub-pixel precision
  const x = (touch.clientX - rect.left) * scaleX;
  const y = (touch.clientY - rect.top) * scaleY;

  // Enhanced pressure detection for supported devices
  let pressure = 1;
  if ("force" in touch && typeof (touch as any).force === "number") {
    pressure = Math.max(0.1, Math.min(1, (touch as any).force));
  } else if ("webkitForce" in touch && typeof (touch as any).webkitForce === "number") {
    // Safari/WebKit support
    pressure = Math.max(0.1, Math.min(1, (touch as any).webkitForce));
  }

  return {
    x: Math.round(x * 10) / 10, // Sub-pixel precision
    y: Math.round(y * 10) / 10,
    pressure,
  };
}

/**
 * Create a smooth quadratic curve between points
 */
export function drawSmoothLine(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  width: number,
): void {
  if (points.length < 2) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();

  if (points.length === 2) {
    // Simple line for two points
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
  } else {
    // Smooth curve for multiple points
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const currentPoint = points[i];
      const nextPoint = points[i + 1];

      // Calculate control point for smooth curve
      const controlX = (currentPoint.x + nextPoint.x) / 2;
      const controlY = (currentPoint.y + nextPoint.y) / 2;

      ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY);
    }

    // Draw to the last point
    const lastPoint = points[points.length - 1];
    ctx.lineTo(lastPoint.x, lastPoint.y);
  }

  ctx.stroke();
}

/**
 * Draw a complete stroke on the canvas
 */
export function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
): void {
  if (stroke.points.length === 0) return;

  drawSmoothLine(ctx, stroke.points, stroke.color, stroke.width);
}

/**
 * Clear the entire canvas
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  backgroundColor: string = "#ffffff",
): void {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * Clear canvas and reset all drawing state
 */
export function clearCanvasCompletely(
  canvas: HTMLCanvasElement,
  backgroundColor: string = "#ffffff",
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clear the canvas with background color
  clearCanvas(ctx, backgroundColor);
}

/**
 * Redraw the entire canvas from drawing state
 */
export function redrawCanvas(
  ctx: CanvasRenderingContext2D,
  drawingState: DrawingState,
): void {
  // Clear canvas with background color
  clearCanvas(ctx, drawingState.backgroundColor);

  // Draw all strokes
  drawingState.strokes.forEach((stroke) => {
    drawStroke(ctx, stroke);
  });

  // Draw all inserted images
  drawingState.images.forEach((image) => {
    drawInsertedImage(ctx, image);
  });
}

/**
 * Draw an inserted image on the canvas
 */
export function drawInsertedImage(
  ctx: CanvasRenderingContext2D,
  insertedImage: InsertedImage,
): void {
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(
      img,
      insertedImage.x,
      insertedImage.y,
      insertedImage.width,
      insertedImage.height,
    );
  };
  img.src = insertedImage.src;
}

/**
 * Export canvas as image blob
 */
export function exportCanvas(
  canvas: HTMLCanvasElement,
  options: ExportOptions = { format: "png" },
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { format, quality = 0.9 } = options;

    let mimeType: string;
    switch (format) {
      case "jpeg":
        mimeType = "image/jpeg";
        break;
      case "webp":
        mimeType = "image/webp";
        break;
      case "png":
      default:
        mimeType = "image/png";
        break;
    }

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to export canvas"));
        }
      },
      mimeType,
      quality,
    );
  });
}

/**
 * Export canvas as data URL
 */
export function exportCanvasAsDataURL(
  canvas: HTMLCanvasElement,
  format: CanvasExportFormat = "png",
  quality: number = 0.9,
): string {
  let mimeType: string;
  switch (format) {
    case "jpeg":
      mimeType = "image/jpeg";
      break;
    case "webp":
      mimeType = "image/webp";
      break;
    case "png":
    default:
      mimeType = "image/png";
      break;
  }

  return canvas.toDataURL(mimeType, quality);
}

/**
 * Download canvas as image file with proper naming
 */
export function downloadCanvasAsImage(
  canvas: HTMLCanvasElement,
  filename?: string,
  format: CanvasExportFormat = "png",
  quality: number = 0.9,
): void {
  // Generate filename if not provided
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const defaultFilename = `painting-${timestamp}`;
  const finalFilename = filename || defaultFilename;

  // Add appropriate file extension
  const extension = format === "jpeg" ? "jpg" : format;
  const fullFilename = `${finalFilename}.${extension}`;

  // Export canvas as blob
  exportCanvas(canvas, { format, quality })
    .then((blob) => {
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fullFilename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("Failed to download canvas:", error);
      throw new Error("Failed to download canvas as image");
    });
}

/**
 * Get file size of canvas export
 */
export function getCanvasExportSize(
  canvas: HTMLCanvasElement,
  format: CanvasExportFormat = "png",
  quality: number = 0.9,
): Promise<number> {
  return exportCanvas(canvas, { format, quality })
    .then((blob) => blob.size)
    .catch(() => 0);
}

/**
 * Generate suggested filename for canvas export
 */
export function generateCanvasFilename(
  prefix: string = "painting",
  format: CanvasExportFormat = "png",
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const extension = format === "jpeg" ? "jpg" : format;
  return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Create a thumbnail from canvas
 */
export function createThumbnail(
  canvas: HTMLCanvasElement,
  maxWidth: number = 200,
  maxHeight: number = 150,
): string {
  const thumbnailCanvas = document.createElement("canvas");
  const thumbnailCtx = thumbnailCanvas.getContext("2d");

  if (!thumbnailCtx) {
    throw new Error("Failed to create thumbnail context");
  }

  // Calculate thumbnail dimensions maintaining aspect ratio
  const aspectRatio = canvas.width / canvas.height;
  let thumbWidth = maxWidth;
  let thumbHeight = maxHeight;

  if (aspectRatio > maxWidth / maxHeight) {
    thumbHeight = maxWidth / aspectRatio;
  } else {
    thumbWidth = maxHeight * aspectRatio;
  }

  thumbnailCanvas.width = thumbWidth;
  thumbnailCanvas.height = thumbHeight;

  // Draw scaled canvas to thumbnail
  thumbnailCtx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);

  return thumbnailCanvas.toDataURL("image/png");
}

/**
 * Save canvas state for undo/redo functionality
 */
export function saveCanvasState(
  canvas: HTMLCanvasElement,
  history: ImageData[],
  maxStates: number = 50,
): ImageData[] {
  const ctx = canvas.getContext("2d");
  if (!ctx) return history;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const newHistory = [...history, imageData];

  // Limit history size
  if (newHistory.length > maxStates) {
    newHistory.shift();
  }

  return newHistory;
}

/**
 * Restore canvas state from history
 */
export function restoreCanvasState(
  canvas: HTMLCanvasElement,
  imageData: ImageData,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Create a canvas history manager for undo/redo functionality
 * @deprecated Use AdvancedMemoryManager for better performance and memory management
 */
export class CanvasHistoryManager {
  private history: ImageData[] = [];
  private currentIndex: number = -1;
  private maxStates: number;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, maxStates: number = 50) {
    this.canvas = canvas;
    this.maxStates = maxStates;
    // Save initial blank state
    this.saveState();
  }

  /**
   * Save current canvas state to history
   */
  saveState(): void {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

    // Remove any states after current index (when user made new action after undo)
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new state
    this.history.push(imageData);
    this.currentIndex = this.history.length - 1;

    // Limit history size
    if (this.history.length > this.maxStates) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Undo last action
   */
  undo(): boolean {
    if (!this.canUndo()) return false;

    this.currentIndex--;
    const imageData = this.history[this.currentIndex];
    restoreCanvasState(this.canvas, imageData);
    return true;
  }

  /**
   * Redo previously undone action
   */
  redo(): boolean {
    if (!this.canRedo()) return false;

    this.currentIndex++;
    const imageData = this.history[this.currentIndex];
    restoreCanvasState(this.canvas, imageData);
    return true;
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current history state info
   */
  getHistoryInfo(): {
    canUndo: boolean;
    canRedo: boolean;
    currentIndex: number;
    totalStates: number;
  } {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      currentIndex: this.currentIndex,
      totalStates: this.history.length,
    };
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    this.history = [];
    this.currentIndex = -1;
    // Save current state as new initial state
    this.saveState();
  }
}

/**
 * Validate uploaded image file
 */
export function validateImageFile(
  file: File,
  options: FileValidationOptions,
): ValidationResult {
  const errors: string[] = [];

  // Check file size
  if (file.size > options.maxSize) {
    errors.push(`File size exceeds maximum of ${options.maxSize / 1024 / 1024}MB`);
  }

  // Check file type
  if (!options.allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Load and process uploaded image
 */
export function loadImageFile(file: File): Promise<ImageUploadResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        // Check if we're in a browser environment
        if (typeof Image !== "undefined") {
          const img = new Image();
          img.onload = () => {
            resolve({
              success: true,
              imageId: crypto.randomUUID(),
            });
          };
          img.onerror = () => {
            resolve({
              success: false,
              error: "Failed to load image",
            });
          };
          img.src = result;
        } else {
          // In non-browser environment (like Deno test), just validate the data URL format
          if (result.startsWith("data:image/")) {
            resolve({
              success: true,
              imageId: crypto.randomUUID(),
            });
          } else {
            resolve({
              success: false,
              error: "Invalid image data",
            });
          }
        }
      } else {
        resolve({
          success: false,
          error: "Failed to read file",
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: "Failed to read file",
      });
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Create mouse event handlers for canvas drawing
 */
export function createMouseEventHandlers(
  canvas: HTMLCanvasElement,
  onPointerDown: (point: CanvasPointerEvent) => void,
  onPointerMove: (point: CanvasPointerEvent) => void,
  onPointerUp: (point: CanvasPointerEvent) => void,
) {
  let isDrawing = false;

  const handleMouseDown = (event: MouseEvent) => {
    // Only prevent default for left mouse button
    if (event.button === 0) {
      event.preventDefault();
      isDrawing = true;
      const point = getCanvasCoordinatesFromMouse(event, canvas);
      onPointerDown({ ...point, type: "mouse" });
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    // Only prevent default when actively drawing
    if (isDrawing) {
      event.preventDefault();
    }
    const point = getCanvasCoordinatesFromMouse(event, canvas);
    onPointerMove({ ...point, type: "mouse" });
  };

  const handleMouseUp = (event: MouseEvent) => {
    // Only prevent default if we were drawing
    if (isDrawing) {
      event.preventDefault();
      isDrawing = false;
    }
    const point = getCanvasCoordinatesFromMouse(event, canvas);
    onPointerUp({ ...point, type: "mouse" });
  };

  const handleMouseLeave = (event: MouseEvent) => {
    // Reset drawing state when mouse leaves canvas
    if (isDrawing) {
      isDrawing = false;
      const point = getCanvasCoordinatesFromMouse(event, canvas);
      onPointerUp({ ...point, type: "mouse" });
    }
  };

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
}

/**
 * Create touch event handlers for canvas drawing with optimizations
 */
export function createTouchEventHandlers(
  canvas: HTMLCanvasElement,
  onPointerDown: (point: CanvasPointerEvent) => void,
  onPointerMove: (point: CanvasPointerEvent) => void,
  onPointerUp: (point: CanvasPointerEvent) => void,
) {
  let lastTouchTime = 0;
  let lastTouchPoint: Point | null = null;
  let isDrawing = false;
  const TOUCH_THROTTLE_MS = 8; // ~120fps for smooth touch tracking
  const MIN_TOUCH_DISTANCE = 1; // Minimum distance to register touch move

  const handleTouchStart = (event: TouchEvent) => {
    // Only handle single touch for drawing
    if (event.touches.length !== 1) return;

    // Prevent default only when drawing starts
    event.preventDefault();
    event.stopPropagation();
    isDrawing = true;

    const point = getCanvasCoordinatesFromTouch(event, canvas);
    lastTouchPoint = point;
    lastTouchTime = performance.now();
    onPointerDown({ ...point, type: "touch" });
  };

  const handleTouchMove = (event: TouchEvent) => {
    // Only handle single touch for drawing
    if (event.touches.length !== 1) return;

    // Only prevent default when actively drawing
    if (isDrawing) {
      event.preventDefault();
      event.stopPropagation();
    }

    const currentTime = performance.now();

    // Throttle touch move events for better performance
    if (currentTime - lastTouchTime < TOUCH_THROTTLE_MS) {
      return;
    }

    const point = getCanvasCoordinatesFromTouch(event, canvas);

    // Skip if touch hasn't moved enough (reduces noise)
    if (lastTouchPoint) {
      const distance = calculateDistance(lastTouchPoint, point);
      if (distance < MIN_TOUCH_DISTANCE) {
        return;
      }
    }

    lastTouchPoint = point;
    lastTouchTime = currentTime;
    onPointerMove({ ...point, type: "touch" });
  };

  const handleTouchEnd = (event: TouchEvent) => {
    // Only prevent default if we were drawing
    if (isDrawing) {
      event.preventDefault();
      event.stopPropagation();
      isDrawing = false;
    }

    const point = getCanvasCoordinatesFromTouch(event, canvas);
    lastTouchPoint = null;
    onPointerUp({ ...point, type: "touch" });
  };

  const handleTouchCancel = (event: TouchEvent) => {
    // Only prevent default if we were drawing
    if (isDrawing) {
      event.preventDefault();
      event.stopPropagation();
      isDrawing = false;
    }

    // Treat touch cancel as touch end
    const point = lastTouchPoint || { x: 0, y: 0, pressure: 1 };
    lastTouchPoint = null;
    onPointerUp({ ...point, type: "touch" });
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  };
}

/**
 * Attach all event listeners to canvas
 */
export function attachCanvasEventListeners(
  canvas: HTMLCanvasElement,
  onPointerDown: (point: CanvasPointerEvent) => void,
  onPointerMove: (point: CanvasPointerEvent) => void,
  onPointerUp: (point: CanvasPointerEvent) => void,
): () => void {
  const mouseHandlers = createMouseEventHandlers(
    canvas,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  );

  const touchHandlers = createTouchEventHandlers(
    canvas,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  );

  // Add mouse event listeners
  canvas.addEventListener("mousedown", mouseHandlers.handleMouseDown);
  canvas.addEventListener("mousemove", mouseHandlers.handleMouseMove);
  canvas.addEventListener("mouseup", mouseHandlers.handleMouseUp);
  canvas.addEventListener("mouseleave", mouseHandlers.handleMouseLeave);

  // Add touch event listeners
  canvas.addEventListener("touchstart", touchHandlers.handleTouchStart, { passive: false });
  canvas.addEventListener("touchmove", touchHandlers.handleTouchMove, { passive: false });
  canvas.addEventListener("touchend", touchHandlers.handleTouchEnd, { passive: false });
  canvas.addEventListener("touchcancel", touchHandlers.handleTouchCancel, { passive: false });

  // Return cleanup function
  return () => {
    // Remove mouse event listeners
    canvas.removeEventListener("mousedown", mouseHandlers.handleMouseDown);
    canvas.removeEventListener("mousemove", mouseHandlers.handleMouseMove);
    canvas.removeEventListener("mouseup", mouseHandlers.handleMouseUp);
    canvas.removeEventListener("mouseleave", mouseHandlers.handleMouseLeave);

    // Remove touch event listeners
    canvas.removeEventListener("touchstart", touchHandlers.handleTouchStart);
    canvas.removeEventListener("touchmove", touchHandlers.handleTouchMove);
    canvas.removeEventListener("touchend", touchHandlers.handleTouchEnd);
    canvas.removeEventListener("touchcancel", touchHandlers.handleTouchCancel);
  };
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(point1: Point, point2: Point): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Simplify stroke points to reduce memory usage
 */
export function simplifyStroke(
  points: Point[],
  tolerance: number = 2,
): Point[] {
  if (points.length <= 2) return points;

  const simplified: Point[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const distance = calculateDistance(simplified[simplified.length - 1], points[i]);
    if (distance >= tolerance) {
      simplified.push(points[i]);
    }
  }

  // Always include the last point
  simplified.push(points[points.length - 1]);

  return simplified;
}

/**
 * Check if a point is within canvas bounds
 */
export function isPointInCanvas(
  point: Point,
  canvasWidth: number,
  canvasHeight: number,
): boolean {
  return point.x >= 0 && point.x <= canvasWidth &&
    point.y >= 0 && point.y <= canvasHeight;
}

/**
 * Clamp point to canvas bounds
 */
export function clampPointToCanvas(
  point: Point,
  canvasWidth: number,
  canvasHeight: number,
): Point {
  return {
    x: Math.max(0, Math.min(canvasWidth, point.x)),
    y: Math.max(0, Math.min(canvasHeight, point.y)),
    pressure: point.pressure,
  };
}
