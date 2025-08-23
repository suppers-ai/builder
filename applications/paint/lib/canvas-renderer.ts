// Optimized canvas rendering system with dirty region tracking and selective redrawing
import type { DrawingState, InsertedImage, Point, Stroke } from "../types/paint.ts";

/**
 * Dirty region for tracking canvas areas that need redrawing
 */
export interface DirtyRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Render layer for organizing drawing operations
 */
export interface RenderLayer {
  id: string;
  type: "background" | "image" | "stroke" | "current";
  zIndex: number;
  isDirty: boolean;
  bounds?: DirtyRegion;
}

/**
 * Optimized canvas renderer with dirty region tracking
 */
export class OptimizedCanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;
  private dirtyRegions: DirtyRegion[] = [];
  private renderLayers: Map<string, RenderLayer> = new Map();
  private lastRenderTime = 0;
  private frameRequestId: number | null = null;
  private isRenderScheduled = false;

  // Performance tracking
  private renderStats = {
    totalRenders: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
    dirtyRegionOptimizations: 0,
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D rendering context");
    }
    this.ctx = ctx;

    // Create offscreen canvas for double buffering
    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenCanvas.width = canvas.width;
    this.offscreenCanvas.height = canvas.height;
    const offscreenCtx = this.offscreenCanvas.getContext("2d");
    if (!offscreenCtx) {
      throw new Error("Failed to create offscreen rendering context");
    }
    this.offscreenCtx = offscreenCtx;

    // Initialize render layers
    this.initializeRenderLayers();
  }

  /**
   * Initialize render layers for organized drawing
   */
  private initializeRenderLayers(): void {
    this.renderLayers.set("background", {
      id: "background",
      type: "background",
      zIndex: 0,
      isDirty: true,
    });

    this.renderLayers.set("images", {
      id: "images",
      type: "image",
      zIndex: 1,
      isDirty: false,
    });

    this.renderLayers.set("strokes", {
      id: "strokes",
      type: "stroke",
      zIndex: 2,
      isDirty: false,
    });

    this.renderLayers.set("current", {
      id: "current",
      type: "current",
      zIndex: 3,
      isDirty: false,
    });
  }

  /**
   * Add a dirty region that needs redrawing
   */
  public addDirtyRegion(region: DirtyRegion): void {
    // Expand region slightly to avoid edge artifacts
    const expandedRegion = {
      x: Math.max(0, region.x - 2),
      y: Math.max(0, region.y - 2),
      width: Math.min(this.canvas.width - region.x + 2, region.width + 4),
      height: Math.min(this.canvas.height - region.y + 2, region.height + 4),
    };

    // Try to merge with existing dirty regions
    let merged = false;
    for (let i = 0; i < this.dirtyRegions.length; i++) {
      const existing = this.dirtyRegions[i];
      if (this.canMergeRegions(existing, expandedRegion)) {
        this.dirtyRegions[i] = this.mergeRegions(existing, expandedRegion);
        merged = true;
        break;
      }
    }

    if (!merged) {
      this.dirtyRegions.push(expandedRegion);
    }

    // Limit number of dirty regions to prevent excessive fragmentation
    if (this.dirtyRegions.length > 10) {
      this.dirtyRegions = [this.getBoundingRegion(this.dirtyRegions)];
    }

    this.scheduleRender();
  }

  /**
   * Check if two regions can be merged efficiently
   */
  private canMergeRegions(region1: DirtyRegion, region2: DirtyRegion): boolean {
    const merged = this.mergeRegions(region1, region2);
    const originalArea = region1.width * region1.height + region2.width * region2.height;
    const mergedArea = merged.width * merged.height;

    // Merge if the combined area is not more than 150% of the original areas
    return mergedArea <= originalArea * 1.5;
  }

  /**
   * Merge two dirty regions
   */
  private mergeRegions(region1: DirtyRegion, region2: DirtyRegion): DirtyRegion {
    const left = Math.min(region1.x, region2.x);
    const top = Math.min(region1.y, region2.y);
    const right = Math.max(region1.x + region1.width, region2.x + region2.width);
    const bottom = Math.max(region1.y + region1.height, region2.y + region2.height);

    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };
  }

  /**
   * Get bounding region that encompasses all regions
   */
  private getBoundingRegion(regions: DirtyRegion[]): DirtyRegion {
    if (regions.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let left = regions[0].x;
    let top = regions[0].y;
    let right = regions[0].x + regions[0].width;
    let bottom = regions[0].y + regions[0].height;

    for (let i = 1; i < regions.length; i++) {
      const region = regions[i];
      left = Math.min(left, region.x);
      top = Math.min(top, region.y);
      right = Math.max(right, region.x + region.width);
      bottom = Math.max(bottom, region.y + region.height);
    }

    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };
  }

  /**
   * Schedule a render on the next animation frame
   */
  private scheduleRender(): void {
    if (this.isRenderScheduled) return;

    this.isRenderScheduled = true;
    this.frameRequestId = requestAnimationFrame(() => {
      this.performRender();
      this.isRenderScheduled = false;
      this.frameRequestId = null;
    });
  }

  /**
   * Perform the actual rendering with optimizations
   */
  private performRender(): void {
    const startTime = performance.now();

    if (this.dirtyRegions.length === 0) {
      return;
    }

    // Use offscreen canvas for double buffering
    const ctx = this.offscreenCtx;

    // Clear dirty regions on offscreen canvas
    for (const region of this.dirtyRegions) {
      ctx.clearRect(region.x, region.y, region.width, region.height);
    }

    // Render each layer in order
    const sortedLayers = Array.from(this.renderLayers.values())
      .sort((a, b) => a.zIndex - b.zIndex);

    for (const layer of sortedLayers) {
      if (layer.isDirty || this.dirtyRegions.length > 0) {
        this.renderLayer(ctx, layer);
      }
    }

    // Copy offscreen canvas to main canvas for dirty regions only
    for (const region of this.dirtyRegions) {
      this.ctx.drawImage(
        this.offscreenCanvas,
        region.x,
        region.y,
        region.width,
        region.height,
        region.x,
        region.y,
        region.width,
        region.height,
      );
    }

    // Clear dirty regions and reset layer states
    this.dirtyRegions = [];
    this.renderLayers.forEach((layer) => {
      layer.isDirty = false;
    });

    // Update performance stats
    const renderTime = performance.now() - startTime;
    this.updateRenderStats(renderTime);
  }

  /**
   * Render a specific layer
   */
  private renderLayer(ctx: CanvasRenderingContext2D, layer: RenderLayer): void {
    // This will be implemented by specific render methods
    // Called from the main render methods below
  }

  /**
   * Render background layer
   */
  public renderBackground(backgroundColor: string): void {
    const layer = this.renderLayers.get("background");
    if (!layer) return;

    // Only render if background layer is dirty or there are dirty regions
    if (!layer.isDirty && this.dirtyRegions.length === 0) return;

    const ctx = this.offscreenCtx;
    ctx.fillStyle = backgroundColor;

    if (this.dirtyRegions.length > 0) {
      // Only fill dirty regions
      for (const region of this.dirtyRegions) {
        ctx.fillRect(region.x, region.y, region.width, region.height);
      }
    } else {
      // Fill entire canvas
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    layer.isDirty = false;
  }

  /**
   * Render all strokes with dirty region optimization
   */
  public renderStrokes(strokes: Stroke[]): void {
    const layer = this.renderLayers.get("strokes");
    if (!layer) return;

    const ctx = this.offscreenCtx;

    // If we have dirty regions, only render strokes that intersect with them
    if (this.dirtyRegions.length > 0) {
      for (const stroke of strokes) {
        if (this.strokeIntersectsDirtyRegions(stroke)) {
          this.renderStroke(ctx, stroke);
        }
      }
      this.renderStats.dirtyRegionOptimizations++;
    } else {
      // Render all strokes
      for (const stroke of strokes) {
        this.renderStroke(ctx, stroke);
      }
    }

    layer.isDirty = false;
  }

  /**
   * Render all images with dirty region optimization
   */
  public renderImages(images: InsertedImage[], imageCache: Map<string, HTMLImageElement>): void {
    const layer = this.renderLayers.get("images");
    if (!layer) return;

    const ctx = this.offscreenCtx;

    // If we have dirty regions, only render images that intersect with them
    if (this.dirtyRegions.length > 0) {
      for (const image of images) {
        if (this.imageIntersectsDirtyRegions(image)) {
          this.renderImage(ctx, image, imageCache);
        }
      }
      this.renderStats.dirtyRegionOptimizations++;
    } else {
      // Render all images
      for (const image of images) {
        this.renderImage(ctx, image, imageCache);
      }
    }

    layer.isDirty = false;
  }

  /**
   * Render current stroke being drawn
   */
  public renderCurrentStroke(stroke: Stroke | null): void {
    const layer = this.renderLayers.get("current");
    if (!layer) return;

    if (stroke) {
      const ctx = this.offscreenCtx;
      this.renderStroke(ctx, stroke);

      // Add dirty region for current stroke
      const bounds = this.getStrokeBounds(stroke);
      this.addDirtyRegion(bounds);
    }

    layer.isDirty = false;
  }

  /**
   * Render a single stroke
   */
  private renderStroke(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
    if (stroke.points.length < 2) return;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    if (stroke.points.length === 2) {
      // Simple line for two points
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
    } else {
      // Smooth curve for multiple points
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length - 1; i++) {
        const currentPoint = stroke.points[i];
        const nextPoint = stroke.points[i + 1];

        // Calculate control point for smooth curve
        const controlX = (currentPoint.x + nextPoint.x) / 2;
        const controlY = (currentPoint.y + nextPoint.y) / 2;

        ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY);
      }

      // Draw to the last point
      const lastPoint = stroke.points[stroke.points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
    }

    ctx.stroke();
  }

  /**
   * Render a single image
   */
  private renderImage(
    ctx: CanvasRenderingContext2D,
    image: InsertedImage,
    imageCache: Map<string, HTMLImageElement>,
  ): void {
    const cachedImg = imageCache.get(image.id);
    if (cachedImg) {
      ctx.drawImage(cachedImg, image.x, image.y, image.width, image.height);
    }
  }

  /**
   * Check if stroke intersects with any dirty regions
   */
  private strokeIntersectsDirtyRegions(stroke: Stroke): boolean {
    const strokeBounds = this.getStrokeBounds(stroke);
    return this.dirtyRegions.some((region) => this.regionsIntersect(strokeBounds, region));
  }

  /**
   * Check if image intersects with any dirty regions
   */
  private imageIntersectsDirtyRegions(image: InsertedImage): boolean {
    const imageBounds = {
      x: image.x,
      y: image.y,
      width: image.width,
      height: image.height,
    };
    return this.dirtyRegions.some((region) => this.regionsIntersect(imageBounds, region));
  }

  /**
   * Check if two regions intersect
   */
  private regionsIntersect(region1: DirtyRegion, region2: DirtyRegion): boolean {
    return !(
      region1.x + region1.width < region2.x ||
      region2.x + region2.width < region1.x ||
      region1.y + region1.height < region2.y ||
      region2.y + region2.height < region1.y
    );
  }

  /**
   * Get bounding box for a stroke
   */
  private getStrokeBounds(stroke: Stroke): DirtyRegion {
    if (stroke.points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = stroke.points[0].x;
    let minY = stroke.points[0].y;
    let maxX = stroke.points[0].x;
    let maxY = stroke.points[0].y;

    for (const point of stroke.points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    // Expand bounds by stroke width
    const halfWidth = stroke.width / 2;
    return {
      x: Math.max(0, minX - halfWidth),
      y: Math.max(0, minY - halfWidth),
      width: Math.min(this.canvas.width, maxX - minX + stroke.width),
      height: Math.min(this.canvas.height, maxY - minY + stroke.width),
    };
  }

  /**
   * Mark entire canvas as dirty (full redraw)
   */
  public markFullRedraw(): void {
    this.dirtyRegions = [{
      x: 0,
      y: 0,
      width: this.canvas.width,
      height: this.canvas.height,
    }];

    this.renderLayers.forEach((layer) => {
      layer.isDirty = true;
    });

    this.scheduleRender();
  }

  /**
   * Mark stroke area as dirty
   */
  public markStrokeDirty(stroke: Stroke): void {
    const bounds = this.getStrokeBounds(stroke);
    this.addDirtyRegion(bounds);
  }

  /**
   * Mark image area as dirty
   */
  public markImageDirty(image: InsertedImage): void {
    this.addDirtyRegion({
      x: image.x,
      y: image.y,
      width: image.width,
      height: image.height,
    });
  }

  /**
   * Update render performance statistics
   */
  private updateRenderStats(renderTime: number): void {
    this.renderStats.totalRenders++;
    this.renderStats.lastRenderTime = renderTime;

    // Calculate rolling average
    const alpha = 0.1; // Smoothing factor
    this.renderStats.averageRenderTime = this.renderStats.averageRenderTime * (1 - alpha) +
      renderTime * alpha;
  }

  /**
   * Get render performance statistics
   */
  public getRenderStats(): typeof this.renderStats {
    return { ...this.renderStats };
  }

  /**
   * Resize canvas and offscreen buffer
   */
  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;

    // Mark full redraw after resize
    this.markFullRedraw();
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    if (this.frameRequestId) {
      cancelAnimationFrame(this.frameRequestId);
      this.frameRequestId = null;
    }

    this.dirtyRegions = [];
    this.renderLayers.clear();
  }
}
