import { errorResponses, getSupabaseClient } from "../../_common/index.ts";
import { handleStorageUpload } from "./post-storage.ts";
import { handleStorageGet } from "./get-storage.ts";
import { handleStorageDelete } from "./delete-storage.ts";
import { handleStorageDownload } from "./download-storage.ts";
import { handleStorageShare } from "./share-storage.ts";
import { handleStorageUpdate } from "./update-storage.ts";
import { handleUserStorageGet } from "./get-user-storage.ts";

interface StorageContext {
  userId: string;
  pathSegments: string[];
}

export async function handleStorage(
  req: Request,
  context: StorageContext,
): Promise<Response> {
  const { userId, pathSegments } = context;
  const supabase = getSupabaseClient();

  const origin = req.headers.get('origin');
  
  if (pathSegments.length === 0) {
    return errorResponses.badRequest("Storage path is required", origin || undefined);
  }

  const storageType = pathSegments[0];
  const resourcePath = pathSegments.slice(1).join("/");

  console.log(
    "🗄️ Unified storage request:",
    req.method,
    "type:",
    storageType,
    "path:",
    resourcePath,
  );

  // Handle user storage info (special case)
  if (storageType === "user") {
    // GET /storage/user - Get user storage info
    if (req.method === "GET" && pathSegments.length === 1) {
      return await handleUserStorageGet(req, { userId, supabase });
    }
    return errorResponses.methodNotAllowed(`Method ${req.method} not allowed for user storage`, origin || undefined);
  }

  // All other paths are treated as application storage (generic pattern)
  // Examples: /storage/recorder/file.webm, /storage/paint-app/image.png, etc.
  const applicationSlug = storageType;
  const filePath = resourcePath;

  console.log(
    "🗄️ Application storage request:",
    req.method,
    "app:",
    applicationSlug,
    "path:",
    filePath,
  );
  try {
    switch (req.method) {
      case "POST":
      case "PUT":
        return await handleStorageUpload(req, { userId, supabase, applicationSlug, filePath });

      case "GET":
      case "HEAD":
        // Check if this is a download request (has ?download=true parameter)
        const url = new URL(req.url);
        const isDownload = url.searchParams.get("download") === "true";

        if (isDownload && filePath) {
          return await handleStorageDownload(req, { userId, supabase, applicationSlug, filePath });
        } else {
          // Pass empty string for filePath if not provided (will list files)
          return await handleStorageGet(req, { userId, supabase, applicationSlug, filePath: filePath || "" });
        }

      case "PATCH":
        // Handle object updates (metadata, name, emoji, etc.)
        return await handleStorageUpdate(req, { userId, supabase, applicationSlug, filePath });

      case "DELETE":
        return await handleStorageDelete(req, { userId, supabase, applicationSlug, filePath });

      default:
        return errorResponses.methodNotAllowed(`Method ${req.method} not allowed`, origin || undefined);
    }
  } catch (error) {
    console.error("Storage handler error:", error);
    return errorResponses.internalServerError(
      error instanceof Error ? error.message : "Unknown error",
      origin || undefined
    );
  }
}
