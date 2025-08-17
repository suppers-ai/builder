/**
 * Image tools registry - easily extendable for new image processing tools
 */

import type { ImageTool } from "./types.ts";
import { createThumbnail, resizeImage, convertFormat, checkFFmpegAvailable } from "./ffmpeg-processor.ts";
import { validateImageOptions } from "./utils.ts";

/**
 * Thumbnail generation tool
 */
export const thumbnailTool: ImageTool = {
  name: "thumbnail",
  description: "Creates a thumbnail image with specified dimensions",
  supportedFormats: ["jpeg", "png", "webp", "gif", "bmp", "tiff"],
  defaultOptions: {
    width: 150,
    height: 150,
    format: "jpeg",
    quality: 80,
    maintainAspectRatio: true
  },
  process: async (input, options) => {
    // Validate options
    const validation = validateImageOptions(options);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid options: ${validation.errors.join(", ")}`
      };
    }

    // Ensure required dimensions
    if (!options.width || !options.height) {
      return {
        success: false,
        error: "Width and height are required for thumbnail generation"
      };
    }

    return await createThumbnail(input, {
      width: options.width,
      height: options.height,
      format: options.format || "jpeg",
      quality: options.quality || 80,
      maintainAspectRatio: options.maintainAspectRatio !== false
    });
  }
};

/**
 * Image resize tool
 */
export const resizeTool: ImageTool = {
  name: "resize",
  description: "Resizes an image to specified dimensions",
  supportedFormats: ["jpeg", "png", "webp", "gif", "bmp", "tiff"],
  defaultOptions: {
    width: 800,
    height: 600,
    format: "jpeg",
    quality: 80,
    maintainAspectRatio: true
  },
  process: async (input, options) => {
    const validation = validateImageOptions(options);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid options: ${validation.errors.join(", ")}`
      };
    }

    if (!options.width && !options.height) {
      return {
        success: false,
        error: "At least width or height must be specified"
      };
    }

    return await resizeImage(input, {
      width: options.width,
      height: options.height,
      format: options.format || "jpeg",
      quality: options.quality || 80,
      maintainAspectRatio: options.maintainAspectRatio !== false
    });
  }
};

/**
 * Format conversion tool
 */
export const convertTool: ImageTool = {
  name: "convert",
  description: "Converts an image to a different format",
  supportedFormats: ["jpeg", "png", "webp", "gif", "bmp", "tiff"],
  defaultOptions: {
    format: "jpeg",
    quality: 80
  },
  process: async (input, options) => {
    if (!options.format) {
      return {
        success: false,
        error: "Target format is required for conversion"
      };
    }

    const validation = validateImageOptions(options);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid options: ${validation.errors.join(", ")}`
      };
    }

    return await convertFormat(input, {
      format: options.format,
      quality: options.quality || 80
    });
  }
};

/**
 * Registry of all available image tools
 */
export const imageToolsRegistry = new Map<string, ImageTool>([
  [thumbnailTool.name, thumbnailTool],
  [resizeTool.name, resizeTool],
  [convertTool.name, convertTool]
]);

/**
 * Gets all available image tools
 */
export function getAvailableTools(): ImageTool[] {
  return Array.from(imageToolsRegistry.values());
}

/**
 * Gets a specific image tool by name
 */
export function getTool(name: string): ImageTool | undefined {
  return imageToolsRegistry.get(name);
}

/**
 * Registers a new image tool
 */
export function registerTool(tool: ImageTool): void {
  imageToolsRegistry.set(tool.name, tool);
}

/**
 * Checks if all required dependencies are available
 */
export async function checkDependencies(): Promise<{
  ffmpeg: boolean;
  allReady: boolean;
  missing: string[];
}> {
  const ffmpegAvailable = await checkFFmpegAvailable();
  const missing: string[] = [];
  
  if (!ffmpegAvailable) {
    missing.push("ffmpeg");
  }

  return {
    ffmpeg: ffmpegAvailable,
    allReady: missing.length === 0,
    missing
  };
}

/**
 * Gets tool information for API documentation
 */
export function getToolsInfo(): Array<{
  name: string;
  description: string;
  supportedFormats: string[];
  defaultOptions: Record<string, any>;
}> {
  return getAvailableTools().map(tool => ({
    name: tool.name,
    description: tool.description,
    supportedFormats: tool.supportedFormats,
    defaultOptions: tool.defaultOptions
  }));
}