/**
 * Image processing utilities and helper functions
 */

import { extname, join } from "https://deno.land/std@0.208.0/path/mod.ts";
import { exists } from "https://deno.land/std@0.208.0/fs/mod.ts";

/**
 * Supported image formats for processing
 */
export const SUPPORTED_INPUT_FORMATS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".tiff",
  ".tif",
];

export const SUPPORTED_OUTPUT_FORMATS = [
  "jpeg",
  "png",
  "webp",
];

/**
 * Validates if the input file has a supported image format
 */
export function isValidImageFormat(filePath: string): boolean {
  const extension = extname(filePath).toLowerCase();
  return SUPPORTED_INPUT_FORMATS.includes(extension);
}

/**
 * Generates a temporary file path for processing
 */
export function generateTempPath(prefix: string, extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return join("/tmp", `${prefix}_${timestamp}_${random}${extension}`);
}

/**
 * Cleans up temporary files
 */
export async function cleanupTempFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      if (await exists(filePath)) {
        await Deno.remove(filePath);
      }
    } catch (error) {
      console.warn(`Failed to cleanup temp file ${filePath}:`, error);
    }
  }
}

/**
 * Validates image processing options
 */
export function validateImageOptions(
  options: Record<string, any>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (options.width !== undefined) {
    if (typeof options.width !== "number" || options.width <= 0 || options.width > 10000) {
      errors.push("Width must be a positive number between 1 and 10000");
    }
  }

  if (options.height !== undefined) {
    if (typeof options.height !== "number" || options.height <= 0 || options.height > 10000) {
      errors.push("Height must be a positive number between 1 and 10000");
    }
  }

  if (options.quality !== undefined) {
    if (typeof options.quality !== "number" || options.quality < 1 || options.quality > 100) {
      errors.push("Quality must be a number between 1 and 100");
    }
  }

  if (options.format !== undefined) {
    if (!SUPPORTED_OUTPUT_FORMATS.includes(options.format)) {
      errors.push(`Format must be one of: ${SUPPORTED_OUTPUT_FORMATS.join(", ")}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Gets file size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  try {
    const stat = await Deno.stat(filePath);
    return stat.size;
  } catch {
    return 0;
  }
}

/**
 * Reads file as Uint8Array
 */
export async function readFileAsBytes(filePath: string): Promise<Uint8Array> {
  return await Deno.readFile(filePath);
}

/**
 * Writes Uint8Array to file
 */
export async function writeBytesToFile(bytes: Uint8Array, filePath: string): Promise<void> {
  await Deno.writeFile(filePath, bytes);
}

/**
 * Converts Uint8Array to base64 string
 */
export function bytesToBase64(bytes: Uint8Array): string {
  const chars = Array.from(bytes, (byte) => String.fromCharCode(byte));
  return btoa(chars.join(""));
}

/**
 * Detects image format from file extension
 */
export function detectImageFormat(filePath: string): string {
  const extension = extname(filePath).toLowerCase();
  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "jpeg";
    case ".png":
      return "png";
    case ".webp":
      return "webp";
    case ".gif":
      return "gif";
    case ".bmp":
      return "bmp";
    case ".tiff":
    case ".tif":
      return "tiff";
    default:
      return "unknown";
  }
}

/**
 * Creates directory if it doesn't exist
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await Deno.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }
}
