/**
 * Basic tests for image tools functionality
 */

import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { checkFFmpegAvailable, getImageMetadata } from "./ffmpeg-processor.ts";
import { validateImageOptions, isValidImageFormat } from "./utils.ts";
import { getTool, getToolsInfo, checkDependencies } from "./tools-registry.ts";

Deno.test("Image Tools - Utils Tests", async (t) => {
  await t.step("validates image formats correctly", () => {
    assertEquals(isValidImageFormat("test.jpg"), true);
    assertEquals(isValidImageFormat("test.jpeg"), true);
    assertEquals(isValidImageFormat("test.png"), true);
    assertEquals(isValidImageFormat("test.webp"), true);
    assertEquals(isValidImageFormat("test.gif"), true);
    assertEquals(isValidImageFormat("test.txt"), false);
    assertEquals(isValidImageFormat("test.pdf"), false);
  });

  await t.step("validates image options correctly", () => {
    const validOptions = { width: 150, height: 150, quality: 80 };
    const validation = validateImageOptions(validOptions);
    assertEquals(validation.valid, true);
    assertEquals(validation.errors.length, 0);

    const invalidOptions = { width: -10, height: 15000, quality: 150 };
    const invalidValidation = validateImageOptions(invalidOptions);
    assertEquals(invalidValidation.valid, false);
    assertEquals(invalidValidation.errors.length > 0, true);
  });
});

Deno.test("Image Tools - Registry Tests", async (t) => {
  await t.step("gets available tools", () => {
    const tools = getToolsInfo();
    assertEquals(tools.length >= 3, true); // thumbnail, resize, convert
    
    const toolNames = tools.map(tool => tool.name);
    assertEquals(toolNames.includes("thumbnail"), true);
    assertEquals(toolNames.includes("resize"), true);
    assertEquals(toolNames.includes("convert"), true);
  });

  await t.step("gets specific tool", () => {
    const thumbnailTool = getTool("thumbnail");
    assertEquals(thumbnailTool !== undefined, true);
    assertEquals(thumbnailTool?.name, "thumbnail");
    
    const nonExistentTool = getTool("nonexistent");
    assertEquals(nonExistentTool, undefined);
  });

  await t.step("checks dependencies", async () => {
    const deps = await checkDependencies();
    assertEquals(typeof deps.ffmpeg, "boolean");
    assertEquals(typeof deps.allReady, "boolean");
    assertEquals(Array.isArray(deps.missing), true);
  });
});

Deno.test("Image Tools - FFmpeg Tests", async (t) => {
  await t.step("checks FFmpeg availability", async () => {
    const available = await checkFFmpegAvailable();
    assertEquals(typeof available, "boolean");
    console.log(`FFmpeg available: ${available}`);
  });
});

// Integration test with a sample image (if FFmpeg is available)
Deno.test("Image Tools - Integration Test", async (t) => {
  const ffmpegAvailable = await checkFFmpegAvailable();
  
  if (!ffmpegAvailable) {
    console.log("⚠️ Skipping integration test: FFmpeg not available");
    return;
  }

  await t.step("creates thumbnail from sample image", async () => {
    // Create a simple 1x1 pixel red PNG image as test data
    const simplePngBytes = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk header
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // bit depth, color type, etc.
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk header
      0x54, 0x08, 0x57, 0x63, 0x60, 0x60, 0x60, 0x00, // compressed pixel data
      0x00, 0x00, 0x04, 0x00, 0x01, 0x27, 0x2B, 0xDE,
      0xFC, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, // IEND chunk
      0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const thumbnailTool = getTool("thumbnail");
    assertEquals(thumbnailTool !== undefined, true);

    if (thumbnailTool) {
      const result = await thumbnailTool.process(simplePngBytes, {
        width: 100,
        height: 100,
        format: "jpeg",
        quality: 80
      });

      assertEquals(result.success, true);
      assertEquals(result.outputBuffer !== undefined, true);
      assertEquals(result.metadata !== undefined, true);
      
      if (result.metadata) {
        assertEquals(result.metadata.processedDimensions?.width, 100);
        assertEquals(result.metadata.processedDimensions?.height, 100);
        assertEquals(result.metadata.processingTime > 0, true);
      }
    }
  });
});

// Simple endpoint test
Deno.test("Image Tools - Handler Test", async (t) => {
  await t.step("handles tools list request", async () => {
    const { handleImageTools } = await import("./handler.ts");
    
    const request = new Request("http://localhost/api/v1/tools/image/tools", {
      method: "GET"
    });

    const response = await handleImageTools(request);
    assertEquals(response.status, 200);
    
    const data = await response.json();
    assertEquals(data.success, true);
    assertEquals(Array.isArray(data.data.tools), true);
  });

  await t.step("handles status request", async () => {
    const { handleImageTools } = await import("./handler.ts");
    
    const request = new Request("http://localhost/api/v1/tools/image/status", {
      method: "GET"
    });

    const response = await handleImageTools(request);
    assertEquals(response.status, 200);
    
    const data = await response.json();
    assertEquals(data.success, true);
    assertEquals(typeof data.data.status, "string");
  });
});