// Compression utilities for painting data serialization and storage optimization
import type { DrawingState, InsertedImage, Point, Stroke } from "../types/paint.ts";

/**
 * Compression options for painting data
 */
export interface CompressionOptions {
  // Point simplification tolerance (higher = more compression, lower quality)
  pointTolerance: number;
  // Maximum number of points per stroke (0 = no limit)
  maxPointsPerStroke: number;
  // Whether to compress image data URLs
  compressImages: boolean;
  // JPEG quality for image compression (0-1)
  imageQuality: number;
  // Whether to remove redundant data
  removeRedundantData: boolean;
}

/**
 * Default compression settings for different scenarios
 */
export const COMPRESSION_PRESETS = {
  // No compression - preserve all data
  none: {
    pointTolerance: 0,
    maxPointsPerStroke: 0,
    compressImages: false,
    imageQuality: 1.0,
    removeRedundantData: false,
  },
  // Light compression - minimal quality loss
  light: {
    pointTolerance: 1,
    maxPointsPerStroke: 1000,
    compressImages: true,
    imageQuality: 0.9,
    removeRedundantData: true,
  },
  // Medium compression - balanced quality/size
  medium: {
    pointTolerance: 2,
    maxPointsPerStroke: 500,
    compressImages: true,
    imageQuality: 0.8,
    removeRedundantData: true,
  },
  // High compression - prioritize size over quality
  high: {
    pointTolerance: 3,
    maxPointsPerStroke: 250,
    compressImages: true,
    imageQuality: 0.7,
    removeRedundantData: true,
  },
} as const;

/**
 * Simplified point structure for compression
 */
interface CompressedPoint {
  x: number;
  y: number;
  p?: number; // pressure (optional)
}

/**
 * Simplified stroke structure for compression
 */
interface CompressedStroke {
  id: string;
  pts: CompressedPoint[]; // compressed points
  c: string; // color
  w: number; // width
  t: number; // timestamp
}

/**
 * Simplified image structure for compression
 */
interface CompressedImage {
  id: string;
  src: string;
  x: number;
  y: number;
  w: number; // width
  h: number; // height
  t: number; // timestamp
}

/**
 * Compressed drawing state structure
 */
interface CompressedDrawingState {
  s: CompressedStroke[]; // strokes
  i: CompressedImage[]; // images
  cs: { w: number; h: number }; // canvas size
  bg: string; // background color
  v: number; // version for future compatibility
}

/**
 * Compress drawing data for storage
 */
export function compressDrawingData(
  drawingState: DrawingState,
  options: CompressionOptions = COMPRESSION_PRESETS.medium,
): string {
  try {
    // Compress strokes
    const compressedStrokes: CompressedStroke[] = drawingState.strokes.map((stroke) => {
      let points = stroke.points;

      // Simplify points if tolerance is set
      if (options.pointTolerance > 0) {
        points = simplifyPoints(points, options.pointTolerance);
      }

      // Limit points per stroke if specified
      if (options.maxPointsPerStroke > 0 && points.length > options.maxPointsPerStroke) {
        points = downsamplePoints(points, options.maxPointsPerStroke);
      }

      // Convert to compressed format
      const compressedPoints: CompressedPoint[] = points.map((point) => {
        const compressed: CompressedPoint = {
          x: Math.round(point.x * 10) / 10, // Round to 1 decimal place
          y: Math.round(point.y * 10) / 10,
        };

        // Only include pressure if it's not default (1.0)
        if (point.pressure !== undefined && point.pressure !== 1.0) {
          compressed.p = Math.round(point.pressure * 100) / 100; // Round to 2 decimal places
        }

        return compressed;
      });

      return {
        id: stroke.id,
        pts: compressedPoints,
        c: stroke.color,
        w: stroke.width,
        t: stroke.timestamp,
      };
    });

    // Compress images
    const compressedImages: CompressedImage[] = drawingState.images.map((image) => {
      let src = image.src;

      // Compress image data URLs if enabled
      if (options.compressImages && src.startsWith("data:image/")) {
        src = compressImageDataURL(src, options.imageQuality);
      }

      return {
        id: image.id,
        src,
        x: Math.round(image.x),
        y: Math.round(image.y),
        w: Math.round(image.width),
        h: Math.round(image.height),
        t: image.timestamp,
      };
    });

    // Create compressed state
    const compressed: CompressedDrawingState = {
      s: compressedStrokes,
      i: compressedImages,
      cs: {
        w: drawingState.canvasSize.width,
        h: drawingState.canvasSize.height,
      },
      bg: drawingState.backgroundColor,
      v: 1, // Version for future compatibility
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(compressed);

    // Apply additional compression if available (could add gzip here in the future)
    return jsonString;
  } catch (error) {
    console.error("Failed to compress drawing data:", error);
    // Fallback to uncompressed data
    return JSON.stringify(drawingState);
  }
}

/**
 * Decompress drawing data from storage
 */
export function decompressDrawingData(compressedData: string): DrawingState {
  try {
    const parsed = JSON.parse(compressedData);

    // Check if data is already in compressed format
    if (parsed.v && parsed.s && parsed.i && parsed.cs) {
      // Decompress from compressed format
      const compressed = parsed as CompressedDrawingState;

      // Decompress strokes
      const strokes: Stroke[] = compressed.s.map((compressedStroke) => ({
        id: compressedStroke.id,
        points: compressedStroke.pts.map((pt) => ({
          x: pt.x,
          y: pt.y,
          pressure: pt.p || 1.0,
        })),
        color: compressedStroke.c,
        width: compressedStroke.w,
        timestamp: compressedStroke.t,
      }));

      // Decompress images
      const images: InsertedImage[] = compressed.i.map((compressedImage) => ({
        id: compressedImage.id,
        src: compressedImage.src,
        x: compressedImage.x,
        y: compressedImage.y,
        width: compressedImage.w,
        height: compressedImage.h,
        timestamp: compressedImage.t,
      }));

      return {
        strokes,
        images,
        canvasSize: {
          width: compressed.cs.w,
          height: compressed.cs.h,
        },
        backgroundColor: compressed.bg,
      };
    } else {
      // Data is in uncompressed format, return as-is
      return parsed as DrawingState;
    }
  } catch (error) {
    console.error("Failed to decompress drawing data:", error);
    throw new Error("Invalid compressed drawing data");
  }
}

/**
 * Simplify points using Douglas-Peucker algorithm
 */
function simplifyPoints(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) return points;

  return douglasPeucker(points, tolerance);
}

/**
 * Douglas-Peucker line simplification algorithm
 */
function douglasPeucker(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) return points;

  // Find the point with maximum distance from the line between first and last points
  let maxDistance = 0;
  let maxIndex = 0;

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], firstPoint, lastPoint);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    const leftPoints = douglasPeucker(points.slice(0, maxIndex + 1), tolerance);
    const rightPoints = douglasPeucker(points.slice(maxIndex), tolerance);

    // Combine results (remove duplicate point at junction)
    return leftPoints.slice(0, -1).concat(rightPoints);
  } else {
    // All points between first and last are within tolerance, return just endpoints
    return [firstPoint, lastPoint];
  }
}

/**
 * Calculate perpendicular distance from point to line
 */
function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  if (dx === 0 && dy === 0) {
    // Line is actually a point
    return Math.sqrt(
      Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2),
    );
  }

  const numerator = Math.abs(
    dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x,
  );
  const denominator = Math.sqrt(dx * dx + dy * dy);

  return numerator / denominator;
}

/**
 * Downsample points to a maximum count while preserving shape
 */
function downsamplePoints(points: Point[], maxPoints: number): Point[] {
  if (points.length <= maxPoints) return points;

  const result: Point[] = [points[0]]; // Always include first point
  const step = (points.length - 1) / (maxPoints - 1);

  for (let i = 1; i < maxPoints - 1; i++) {
    const index = Math.round(i * step);
    result.push(points[index]);
  }

  result.push(points[points.length - 1]); // Always include last point
  return result;
}

/**
 * Compress image data URL by reducing quality (synchronous version for now)
 */
function compressImageDataURL(dataURL: string, quality: number): string {
  try {
    // Only compress JPEG and WebP images
    if (!dataURL.includes("data:image/jpeg") && !dataURL.includes("data:image/webp")) {
      return dataURL;
    }

    // For now, return the original data URL
    // In a real implementation, you'd need to handle this asynchronously
    // or use a different approach for server-side compression
    return dataURL;
  } catch (error) {
    console.warn("Failed to compress image data URL:", error);
    return dataURL;
  }
}

/**
 * Estimate compression ratio
 */
export function estimateCompressionRatio(
  originalData: DrawingState,
  options: CompressionOptions = COMPRESSION_PRESETS.medium,
): number {
  try {
    const originalSize = JSON.stringify(originalData).length;
    const compressedSize = compressDrawingData(originalData, options).length;

    return originalSize > 0 ? compressedSize / originalSize : 1;
  } catch (error) {
    console.error("Failed to estimate compression ratio:", error);
    return 1;
  }
}

/**
 * Get compression statistics
 */
export function getCompressionStats(
  originalData: DrawingState,
  options: CompressionOptions = COMPRESSION_PRESETS.medium,
): {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  spaceSaved: number;
  spaceSavedPercent: number;
} {
  try {
    const originalJson = JSON.stringify(originalData);
    const compressedJson = compressDrawingData(originalData, options);

    const originalSize = originalJson.length;
    const compressedSize = compressedJson.length;
    const compressionRatio = originalSize > 0 ? compressedSize / originalSize : 1;
    const spaceSaved = originalSize - compressedSize;
    const spaceSavedPercent = originalSize > 0 ? (spaceSaved / originalSize) * 100 : 0;

    return {
      originalSize,
      compressedSize,
      compressionRatio,
      spaceSaved,
      spaceSavedPercent,
    };
  } catch (error) {
    console.error("Failed to get compression stats:", error);
    return {
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 1,
      spaceSaved: 0,
      spaceSavedPercent: 0,
    };
  }
}

/**
 * Validate compressed data integrity
 */
export function validateCompressedData(compressedData: string): boolean {
  try {
    const decompressed = decompressDrawingData(compressedData);

    // Basic validation checks
    return (
      Array.isArray(decompressed.strokes) &&
      Array.isArray(decompressed.images) &&
      typeof decompressed.canvasSize === "object" &&
      typeof decompressed.canvasSize.width === "number" &&
      typeof decompressed.canvasSize.height === "number" &&
      typeof decompressed.backgroundColor === "string"
    );
  } catch (error) {
    console.error("Compressed data validation failed:", error);
    return false;
  }
}
