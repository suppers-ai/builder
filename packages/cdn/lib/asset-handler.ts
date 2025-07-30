import { join, normalize, resolve } from "@std/path";

/**
 * Asset request interface for parsing requested asset paths
 */
export interface AssetRequest {
  path: string; // Requested asset path (e.g., "logos/long_dark.png")
  extension: string; // File extension for MIME type detection
  folder: string; // Asset category folder
  filename: string; // Base filename
}

/**
 * Asset response interface for serving files
 */
export interface AssetResponse {
  body: ReadableStream; // File content stream
  headers: Headers; // Response headers including cache control
  status: number; // HTTP status code
}

/**
 * Supported asset file extensions
 */
const SUPPORTED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".ico",
]);

/**
 * MIME type mapping for supported file extensions
 */
const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

/**
 * Get MIME type for a given file extension
 * @param extension File extension (with or without leading dot)
 * @returns MIME type string
 */
export function getMimeType(extension: string): string {
  // Ensure extension starts with a dot
  const ext = extension.startsWith(".") ? extension : `.${extension}`;

  // Return MIME type from mapping or fallback
  return MIME_TYPES[ext.toLowerCase()] || "application/octet-stream";
}

/**
 * Generate appropriate cache headers for different file types
 * @param fileType File extension or MIME type
 * @returns Headers object with cache control settings
 */
export function getCacheHeaders(fileType: string): Headers {
  const headers = new Headers();

  // Long-term caching for static assets (1 year)
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  // Add CORS headers for cross-origin requests
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  // Set appropriate MIME type
  const mimeType = fileType.startsWith(".") ? getMimeType(fileType) : fileType;
  headers.set("Content-Type", mimeType);

  return headers;
}

/**
 * Validate asset path to prevent directory traversal and ensure security
 * @param requestedPath The requested asset path
 * @returns true if path is valid and safe
 */
export function validateAssetPath(requestedPath: string): boolean {
  try {
    // Trim whitespace first, then remove leading slash if present
    const trimmedPath = requestedPath.trim();
    const cleanPath = trimmedPath.startsWith("/") ? trimmedPath.slice(1) : trimmedPath;

    // Check for empty path
    if (!cleanPath || cleanPath.trim() === "") {
      return false;
    }

    // Normalize the path to resolve any .. or . segments
    const normalizedPath = normalize(cleanPath);

    // Check for directory traversal attempts
    if (normalizedPath.includes("..") || normalizedPath.startsWith("/")) {
      return false;
    }

    // Ensure path doesn't contain dangerous characters
    // deno-lint-ignore no-control-regex
    const dangerousChars = /[<>:"|?*\x00-\x1f]/;
    if (dangerousChars.test(normalizedPath)) {
      return false;
    }

    // Extract file extension
    const lastDotIndex = normalizedPath.lastIndexOf(".");
    if (lastDotIndex === -1) {
      return false; // No extension
    }

    const extension = normalizedPath.slice(lastDotIndex).toLowerCase();

    // Check if extension is supported
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      return false;
    }

    // Ensure path has at least one folder (organized structure requirement)
    const pathParts = normalizedPath.split("/");
    if (pathParts.length < 2) {
      return false; // Must be in a folder like logos/file.png
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Parse asset request path into components
 * @param requestedPath The requested asset path
 * @returns AssetRequest object with parsed components
 */
export function parseAssetRequest(requestedPath: string): AssetRequest | null {
  if (!validateAssetPath(requestedPath)) {
    return null;
  }

  const trimmedPath = requestedPath.trim();
  const cleanPath = trimmedPath.startsWith("/") ? trimmedPath.slice(1) : trimmedPath;
  const normalizedPath = normalize(cleanPath);

  const pathParts = normalizedPath.split("/");
  const filename = pathParts[pathParts.length - 1];
  const folder = pathParts[0];

  const lastDotIndex = filename.lastIndexOf(".");
  const extension = filename.slice(lastDotIndex);

  return {
    path: normalizedPath,
    extension,
    folder,
    filename,
  };
}

/**
 * Generate ETag for a file based on its stats
 * @param fileStat File stat information
 * @returns ETag string
 */
export function generateETag(fileStat: Deno.FileInfo): string {
  // Use file size and modification time for ETag
  const mtime = fileStat.mtime?.getTime() || 0;
  const size = fileStat.size || 0;
  return `"${size}-${mtime}"`;
}

/**
 * Serve an asset file with proper headers and error handling
 * @param requestedPath The requested asset path
 * @param staticDir The static directory path (defaults to "./static")
 * @param ifNoneMatch Optional If-None-Match header for conditional requests
 * @returns Promise<Response> with the asset or appropriate error response
 */
export async function serveAsset(
  requestedPath: string,
  staticDir: string = "./static",
  ifNoneMatch?: string,
): Promise<Response> {
  try {
    // Parse and validate the request
    const assetRequest = parseAssetRequest(requestedPath);
    if (!assetRequest) {
      return new Response("Bad Request: Invalid asset path", {
        status: 400,
        headers: { "Cache-Control": "no-cache" },
      });
    }

    // Construct the full file path
    const fullPath = resolve(join(staticDir, assetRequest.path));
    const staticDirResolved = resolve(staticDir);

    // Additional security check: ensure file is within static directory
    if (!fullPath.startsWith(staticDirResolved)) {
      return new Response("Forbidden: Path outside static directory", {
        status: 403,
        headers: { "Cache-Control": "no-cache" },
      });
    }

    // Check if file exists and get stats
    let fileStat: Deno.FileInfo;
    try {
      fileStat = await Deno.stat(fullPath);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return new Response("Not Found", {
          status: 404,
          headers: { "Cache-Control": "no-cache" },
        });
      }
      throw error; // Re-throw other errors
    }

    // Ensure it's a file, not a directory
    if (!fileStat.isFile) {
      return new Response("Not Found", {
        status: 404,
        headers: { "Cache-Control": "no-cache" },
      });
    }

    // Generate ETag
    const etag = generateETag(fileStat);

    // Check for conditional request (If-None-Match)
    if (ifNoneMatch && ifNoneMatch === etag) {
      const headers = getCacheHeaders(assetRequest.extension);
      headers.set("ETag", etag);
      return new Response(null, {
        status: 304,
        headers,
      });
    }

    // Open and serve the file
    const file = await Deno.open(fullPath, { read: true });
    const stream = file.readable;

    // Generate response headers
    const headers = getCacheHeaders(assetRequest.extension);
    headers.set("ETag", etag);
    headers.set("Content-Length", fileStat.size.toString());

    return new Response(stream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error serving asset:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { "Cache-Control": "no-cache" },
    });
  }
}
