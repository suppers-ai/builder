// Tests for compression utilities
import { assertEquals, assertExists } from "jsr:@std/assert";
import {
  compressDrawingData,
  COMPRESSION_PRESETS,
  decompressDrawingData,
  estimateCompressionRatio,
  getCompressionStats,
  validateCompressedData,
} from "./compression-utils.ts";
import type { DrawingState } from "../types/paint.ts";

// Mock drawing state for testing
const mockDrawingState: DrawingState = {
  strokes: [
    {
      id: "stroke-1",
      points: [
        { x: 10.5, y: 20.7, pressure: 1.0 },
        { x: 15.3, y: 25.1, pressure: 0.8 },
        { x: 20.0, y: 30.0, pressure: 1.0 },
      ],
      color: "#000000",
      width: 3,
      timestamp: Date.now(),
    },
    {
      id: "stroke-2",
      points: [
        { x: 50.0, y: 60.0, pressure: 1.0 },
        { x: 55.0, y: 65.0, pressure: 1.0 },
      ],
      color: "#ff0000",
      width: 5,
      timestamp: Date.now() + 1000,
    },
  ],
  images: [
    {
      id: "image-1",
      src:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      x: 100,
      y: 150,
      width: 50,
      height: 50,
      timestamp: Date.now() + 2000,
    },
  ],
  canvasSize: { width: 800, height: 600 },
  backgroundColor: "#ffffff",
};

Deno.test("compressDrawingData - should compress drawing data", () => {
  const compressed = compressDrawingData(mockDrawingState, COMPRESSION_PRESETS.medium);

  assertExists(compressed);

  // Compressed data should be a valid JSON string
  const parsed = JSON.parse(compressed);
  assertExists(parsed.s); // strokes
  assertExists(parsed.i); // images
  assertExists(parsed.cs); // canvas size
  assertExists(parsed.bg); // background
  assertEquals(parsed.v, 1); // version
});

Deno.test("decompressDrawingData - should decompress compressed data", () => {
  const compressed = compressDrawingData(mockDrawingState, COMPRESSION_PRESETS.medium);
  const decompressed = decompressDrawingData(compressed);

  assertExists(decompressed);
  assertExists(decompressed.strokes);
  assertExists(decompressed.images);
  assertExists(decompressed.canvasSize);
  assertExists(decompressed.backgroundColor);

  // Check that basic structure is preserved
  assertEquals(decompressed.strokes.length, mockDrawingState.strokes.length);
  assertEquals(decompressed.images.length, mockDrawingState.images.length);
  assertEquals(decompressed.canvasSize.width, mockDrawingState.canvasSize.width);
  assertEquals(decompressed.canvasSize.height, mockDrawingState.canvasSize.height);
  assertEquals(decompressed.backgroundColor, mockDrawingState.backgroundColor);
});

Deno.test("compression round-trip - should preserve essential data", () => {
  const compressed = compressDrawingData(mockDrawingState, COMPRESSION_PRESETS.light);
  const decompressed = decompressDrawingData(compressed);

  // Check stroke data preservation
  assertEquals(decompressed.strokes[0].id, mockDrawingState.strokes[0].id);
  assertEquals(decompressed.strokes[0].color, mockDrawingState.strokes[0].color);
  assertEquals(decompressed.strokes[0].width, mockDrawingState.strokes[0].width);

  // Check that points are approximately preserved (allowing for rounding)
  const originalPoint = mockDrawingState.strokes[0].points[0];
  const decompressedPoint = decompressed.strokes[0].points[0];
  assertEquals(Math.round(decompressedPoint.x * 10) / 10, Math.round(originalPoint.x * 10) / 10);
  assertEquals(Math.round(decompressedPoint.y * 10) / 10, Math.round(originalPoint.y * 10) / 10);
});

Deno.test("estimateCompressionRatio - should return valid ratio", () => {
  const ratio = estimateCompressionRatio(mockDrawingState, COMPRESSION_PRESETS.medium);

  // Ratio should be between 0 and 1 (compressed should be smaller)
  assertEquals(typeof ratio, "number");
  assertEquals(ratio > 0, true);
  assertEquals(ratio <= 1, true);
});

Deno.test("getCompressionStats - should return valid statistics", () => {
  const stats = getCompressionStats(mockDrawingState, COMPRESSION_PRESETS.medium);

  assertExists(stats.originalSize);
  assertExists(stats.compressedSize);
  assertExists(stats.compressionRatio);
  assertExists(stats.spaceSaved);
  assertExists(stats.spaceSavedPercent);

  assertEquals(typeof stats.originalSize, "number");
  assertEquals(typeof stats.compressedSize, "number");
  assertEquals(stats.originalSize > 0, true);
  assertEquals(stats.compressedSize > 0, true);
  assertEquals(stats.spaceSaved, stats.originalSize - stats.compressedSize);
});

Deno.test("validateCompressedData - should validate compressed data", () => {
  const compressed = compressDrawingData(mockDrawingState, COMPRESSION_PRESETS.medium);
  const isValid = validateCompressedData(compressed);

  assertEquals(isValid, true);
});

Deno.test("validateCompressedData - should reject invalid data", () => {
  const invalidData = "invalid json";
  const isValid = validateCompressedData(invalidData);

  assertEquals(isValid, false);
});

Deno.test("decompressDrawingData - should handle uncompressed data", () => {
  // Test with original uncompressed data
  const jsonString = JSON.stringify(mockDrawingState);
  const decompressed = decompressDrawingData(jsonString);

  // Should return the original data unchanged
  assertEquals(decompressed.strokes.length, mockDrawingState.strokes.length);
  assertEquals(decompressed.images.length, mockDrawingState.images.length);
  assertEquals(decompressed.canvasSize.width, mockDrawingState.canvasSize.width);
});

Deno.test("compression presets - should have different compression levels", () => {
  const noneStats = getCompressionStats(mockDrawingState, COMPRESSION_PRESETS.none);
  const lightStats = getCompressionStats(mockDrawingState, COMPRESSION_PRESETS.light);
  const mediumStats = getCompressionStats(mockDrawingState, COMPRESSION_PRESETS.medium);
  const highStats = getCompressionStats(mockDrawingState, COMPRESSION_PRESETS.high);

  // Higher compression should result in smaller sizes
  assertEquals(noneStats.compressionRatio >= lightStats.compressionRatio, true);
  assertEquals(lightStats.compressionRatio >= mediumStats.compressionRatio, true);
  assertEquals(mediumStats.compressionRatio >= highStats.compressionRatio, true);
});
